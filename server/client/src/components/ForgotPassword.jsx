import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

const ForgotPassword = () => {
  let navigate = useNavigate();
  const { curruser, curruseremail, isuser } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmpwd, setConfirmPwd] = useState("");

  const [emailSent, setEmailSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  useEffect(() => {
    if (curruser) {
      navigate("/");
    }
  }, [curruser, curruseremail, isuser, navigate]);

  const sendOtp = async () => {
    if (!email) return alert("Enter your email");

    let result = await fetch(
      process.env.REACT_APP_Host_Api + `/api/user/getotpforgotpassword`,
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
      process.env.REACT_APP_Host_Api + `/api/user/verifyotp`,
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

    if (!otpVerified) return alert("Verify OTP first");

    let result = await fetch(
      process.env.REACT_APP_Host_Api + `/api/user/forgotpassword`,
      {
        method: "POST",
        body: JSON.stringify({ email, pwd, confirmpwd }),
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
      alert("Password Changed");
      navigate("/userlogin");
    }
  }

  return (
    <div className="loginpage">
      <form className="form" onSubmit={handleSubmit}>
        <div className="formheading">User Password Recovery</div>

        <div className="field">
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
              <label>New Password : </label>
              <input
                type="password"
                placeholder="Enter New Password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Confirm Password : </label>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmpwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
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
              <button type="submit" className="submit-btn">
                Submit
              </button>
            </div>
          )}

          <div className="field">
            <button
              type="button"
              className="submit-btn"
              onClick={() => navigate("/userlogin")}
            >
              Log In
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
