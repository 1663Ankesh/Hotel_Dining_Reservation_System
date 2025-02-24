const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const secretKey = process.env.secretKey;

const Users = require("../models/Users");
const Bookings = require("../models/Bookings");

const generatePassword = require("../utils/generatePassword");
const {
  errorForUserSignUp,
  errorForEmail,
} = require("../utils/validationerrors");
const { sendOtp, verifyOtp } = require("../utils/otphandler");

const userSignup = async (req, res) => {
  try {
    const { username, email, pwd, phn } = req.body;
    if (!username || !email || !phn || !pwd) {
      return res.status(400).json({ error: "Fill Up the form" });
    }

    const validationErrors = errorForUserSignUp(req.body);

    if (Object.keys(validationErrors).length > 0) {
      let err;
      if (validationErrors.email) err += validationErrors.email;
      if (validationErrors.phn) err += validationErrors.phn + "\n";

      return res.status(400).json({ error: err, donavigate: false });
    }

    req.body.pwd = await generatePassword(pwd);

    let userExists = await Users.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User Exists" });
    }

    let user = await Users.create(req.body);
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      secretKey
    );

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      })
      .json({ userId: user._id, username: user.username, email: user.email });
  } catch (e) {
    console.error("Error in user sign-up:", e);
    return res.status(500).json({ error: "Something Went Wrong" });
  }
};

const userGetOtp_signup = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Enter your email" });

    let user = await Users.findOne({ email });

    if (user) return res.status(404).json({ error: "User Exists" });

    const response = await sendOtp(email, "signup");
    return res.status(200).json(response);
  } catch (e) {
    console.error("Error:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const userVerifyOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP required" });

    const otpResult = verifyOtp(email, otp);
    if (!otpResult.success)
      return res.status(400).json({ error: otpResult.error });

    return res.status(200).json({
      message: "OTP verified",
    });
  } catch (e) {
    console.error("Error:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const userlogin = async (req, res) => {
  try {
    const { email, pwd } = req.body;
    if (!email || !pwd) {
      return res.status(400).json({ error: "Fill Up the form" });
    }

    const validationErrors = errorForEmail(email);

    if (validationErrors?.email) {
      return res
        .status(400)
        .json({ error: validationErrors.email, donavigate: false });
    }

    const user = await Users.findOne({ email });

    if (user) {
      const result = await bcrypt.compare(pwd, user.pwd);

      if (result) {
        const token = jwt.sign(
          { userId: user._id, username: user.username, email: user.email },
          secretKey
        );

        res
          .cookie("token", token, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
          })
          .status(200)
          .json({
            userId: user._id,
            username: user.username,
            email: user.email,
          });
      } else {
        return res.status(401).json({ error: "Incorrect password" });
      }
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (e) {
    console.log(e);
    return res.json({ error: "Something Went Wrong" });
  }
};

const userForgotPassword = async (req, res) => {
  try {
    const { email, pwd, confirmpwd } = req.body;

    if (!email || !pwd || !confirmpwd) {
      return res.status(400).json({ error: "Fill Up the form" });
    } else {
      const validationErrors = errorForEmail(email);

      if (validationErrors?.email) {
        return res
          .status(400)
          .json({ error: validationErrors.email, donavigate: false });
      }

      if (pwd !== confirmpwd)
        return res.status(400).json({
          error: "Entered Passwords are different",
          donavigate: false,
        });

      let user = await Users.findOne({ email });

      if (user) {
        req.body.newpwd = await generatePassword(req.body.pwd);

        let result = await Users.findOneAndUpdate(
          { email: email },
          {
            $set: {
              pwd: req.body.newpwd,
            },
          }
        );
        return res.status(200).json({ email: req.body.newemail });
      } else {
        return res.status(404).json({ error: "User Not Found" });
      }
    }
  } catch (e) {
    console.error("Error fetching user:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const userGetOtp_forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Enter your email" });

    let user = await Users.findOne({ email });

    if (!user) return res.status(404).json({ error: "User Not Found" });

    const response = await sendOtp(email, "forgotpassword");
    return res.status(200).json(response);
  } catch (e) {
    console.error("Error:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const { token } = req.cookies;
    jwt.verify(token, secretKey, {}, async (err2, info2) => {
      if (err2) {
        throw err2;
      }

      let email = req.body.curruseremail;
      let user = await Users.findOne({ email });

      let bookings = await Bookings.find({ email });
      bookings = bookings.reverse();

      return res.status(200).json({ user, bookings });
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const Update_User_Info = async (req, res) => {
  try {
    let { token } = req.cookies;

    jwt.verify(token, secretKey, {}, async (err2, info2) => {
      if (err2) {
        throw err2;
      }
      const { newname, curruseremail, newphn } = req.body;

      if (!newname || !curruseremail || !newphn) {
        return res
          .status(400)
          .json({ error: "Fill Up the Form", donavigate: false });
      }

      const validationErrors = errorForUserSignUp({
        email: curruseremail,
        phn: newphn,
      });

      if (Object.keys(validationErrors).length > 0) {
        let err;
        if (validationErrors.email) err += validationErrors.email;
        if (validationErrors.phn) err += validationErrors.phn + "\n";

        return res.status(400).json({ error: err, donavigate: false });
      }

      let email = req.body.curruseremail;
      let user = await Users.findOne({ email });

      if (req.body.newpwd) {
        req.body.newpwd = await generatePassword(req.body.newpwd);

        let result = await Users.findOneAndUpdate(
          { email: email },
          {
            $set: {
              username: req.body.newname,
              pwd: req.body.newpwd,

              phn: req.body.newphn,
            },
          }
        );
      } else {
        let result = await Users.findOneAndUpdate(
          { email: email },
          {
            $set: {
              username: req.body.newname,
              phn: req.body.newphn,
            },
          }
        );
      }

      const newtoken = jwt.sign(
        { userId: user._id, username: req.body.newname, email: user.email },
        secretKey
      );

      res
        .cookie("token", newtoken, {
          httpOnly: true,
          sameSite: "None",
          secure: true,
        })
        .status(200)
        .json({ name: req.body.newname });
    });
  } catch (e) {
    console.error("Error fetching user:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const user_Delete = async (req, res) => {
  try {
    const { token } = req.cookies;
    jwt.verify(token, secretKey, {}, async (err, info) => {
      if (err) {
        throw err;
      }

      const email = req.body.curruseremail;

      let result = await Users.deleteOne({ email });

      res
        .cookie("token", " ", {
          sameSite: "None",
          secure: true,
          expire: new Date(0),
        })
        .json(result);
    });
  } catch (e) {
    console.log("Error:", e);
    return res.status(500).json({ Error: e });
  }
};

module.exports = {
  userSignup,
  userGetOtp_signup,
  userVerifyOtpController,
  userlogin,
  Update_User_Info,
  getUserInfo,
  userForgotPassword,
  userGetOtp_forgotpassword,
  user_Delete,
};
