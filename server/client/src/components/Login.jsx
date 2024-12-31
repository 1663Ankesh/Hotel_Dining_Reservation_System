import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

const Login = () => {
  const { id, setId, curruser, curruseremail, isuser, setCurruser } =
    useContext(UserContext);

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  useEffect(() => {
    if (curruser) {
      navigate("/");
    }
  }, [id, curruser, curruseremail, isuser, navigate]);

  async function handleSubmit() {
    let result = await fetch(
      process.env.REACT_APP_Host_Api + "/api/user/login",
      {
        method: "POST",
        body: JSON.stringify({ email, pwd }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    result = await result.json();
    if (result.error) {
      alert(result.error);
      return;
    }

    setId(result.userId);
    setCurruser(result.username);
    navigate("/");
  }

  return (
    <div className="loginpage">
      <div className="form">
        <div className="formheading">User Log In</div>
        <div className="field">
          <label>Email : </label>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label>Password : </label>
          <input
            type="password"
            placeholder="Enter Password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
          />
        </div>
        <div className="formbtns">
          <div className="field">
            <button type="submit" className="submit-btn" onClick={handleSubmit}>
              Submit
            </button>
          </div>
          <div className="field">
            <button
              type="submit"
              className="submit-btn"
              onClick={() => {
                setEmail("");
                setPwd("");
              }}
            >
              Reset
            </button>
          </div>

          <div className="field">
            <button
              type="submit"
              className="submit-btn"
              onClick={() => navigate("/userforgotpassword")}
            >
              Forgot Password
            </button>
          </div>
        </div>
      </div>

      <div className="loginpagesignup">
        <span>
          Do not have an account :{" "}
          <button
            className="gotosignup"
            onClick={() => navigate("/usersignup")}
          >
            Sign Up
          </button>
        </span>
      </div>
    </div>
  );
};

export default Login;
