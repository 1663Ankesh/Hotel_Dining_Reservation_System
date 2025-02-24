import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

const ManagerSignup = () => {
  const {
    curruser,
    curruseremail,
    isuser,
    setCurruser,
    setCurruseremail,
    setIsuser,
    id,
    setId,
  } = useContext(UserContext);

  const [name, setName] = useState("");
  const [pwd, setpwd] = useState("");
  const [email, setEmail] = useState("");
  const [phn, setPhn] = useState("");
  const [address, setAddress] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [pan, setPan] = useState("");

  const [otp, setOtp] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (curruser) {
      navigate(`/managerprofile/${id}`);
    }
  }, [curruser, curruseremail, isuser, id, navigate]);

  const sendOtp = async () => {
    if (!email) return alert("Enter your email");

    let result = await fetch(
      process.env.REACT_APP_Host_Api + `/api/manager/getotp_signup`,
      {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    result = await result.json();
    if (result.error) {
      alert(result.error);
    } else {
      alert("OTP Sent!");
      setEmailSent(true);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return alert("Enter the OTP");

    let result = await fetch(
      process.env.REACT_APP_Host_Api + `/api/manager/verifyotp`,
      {
        method: "POST",
        body: JSON.stringify({ email, otp }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    result = await result.json();
    if (result.error) {
      alert(result.error);
    } else {
      alert("OTP Verified!");
      setOtpVerified(true);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();

    let result = await fetch(
      process.env.REACT_APP_Host_Api + "/api/manager/signup",
      {
        method: "POST",
        body: JSON.stringify({
          name,
          pwd,
          email,
          phn,
          address,
          aadhar,
          pan,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    result = await result.json();

    if (result.error) {
      alert(result.error);

      if (result.donavigate & (result.donavigate === true)) navigate("/");
      return;
    } else {
      window.localStorage.setItem("curruser", result.username);

      setId(result.managerId);
      setCurruser(result.managername);
      setCurruseremail(result.email);
      setIsuser(false);

      navigate(`/managerprofile/${result.managerId}`);
    }
  }

  return (
    <div className="signuppage managersignuppage">
      <form className="form" onSubmit={handleSubmit}>
        <div className="formheading">Manager Sign Up</div>

        <div className="field">
          {" "}
          <label>Email : </label>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={emailSent}
          />
        </div>

        {emailSent && (
          <div className="field">
            <label>OTP : </label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={otpVerified}
            />
          </div>
        )}

        {otpVerified && (
          <>
            <div className="field">
              <label htmlFor="user">Username : </label>
              <input
                type="text"
                placeholder="Enter User Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="field">
              {" "}
              <label>Phone Number :</label>
              <input
                type="number"
                placeholder="Enter Phone Number"
                value={phn}
                onChange={(e) => setPhn(e.target.value)}
                maxLength={10}
                required
              />
            </div>

            <div className="field">
              {" "}
              <label>Password : </label>
              <input
                type="password"
                placeholder="Enter Password"
                value={pwd}
                onChange={(e) => setpwd(e.target.value)}
                required
              />
            </div>

            <div className="field">
              {" "}
              <label>Address :</label>
              <input
                type="text"
                placeholder="Enter Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="field">
              {" "}
              <label>Aadhar Number :</label>
              <input
                type="number"
                placeholder="Enter Aadhar"
                value={aadhar}
                onChange={(e) => setAadhar(e.target.value)}
                maxLength={12}
                required
              />
            </div>

            <div className="field">
              {" "}
              <label>Pan Number :</label>
              <input
                type="text"
                placeholder="Enter Pan Number"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <div className="formbtns">
          {!emailSent && (
            <div className="field">
              <button type="button" className="submit-btn" onClick={sendOtp}>
                Send OTP
              </button>
            </div>
          )}

          {emailSent && !otpVerified && (
            <div className="field">
              <button type="button" className="submit-btn" onClick={verifyOtp}>
                Verify OTP
              </button>
            </div>
          )}

          {otpVerified && (
            <div className="field">
              {" "}
              <button type="submit" className="submit-btn">
                Submit
              </button>
            </div>
          )}

          <div className="field">
            <button
              type="button"
              className="submit-btn"
              onClick={() => {
                setName("");
                if (!emailSent) setEmail("");
                setPhn("");
                setpwd("");
                setAddress("");
                setAadhar("");
                setPan("");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </form>
      <div className="signuppagelogin">
        <span>
          Have an account :{" "}
          <button
            className="gotologin"
            onClick={() => navigate("/managerlogin")}
          >
            Log In
          </button>
        </span>
      </div>
    </div>
  );
};

export default ManagerSignup;
