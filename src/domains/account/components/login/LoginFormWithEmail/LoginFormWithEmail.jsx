import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginWithEmail } from "../../../api/auth.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";

import PasswordInput from "../../../../../shared/components/PasswordInput/PasswordInput";
import { setAccessToken } from "../../../../../utils/axios";

const LoginFormWithEmail = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const navigate = useNavigate();


  const validateInputs = () => {
    if (!email || !password) {
      addMessage(false, "Email and password are required.");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      addMessage(false, "Invalid email format.");
      return false;
    }

    // Password length validator: 8-30 characters
    if (password.length < 8 || password.length > 30) {
      addMessage(false, "Password must be between 8 and 30 characters.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    showLoader();
    try {
      const response = await loginWithEmail({ email, password });
      const { access_token } = response.data;
      setAccessToken(access_token);
      addMessage(response.success, response.message);
      navigate("/admin/dashboard");
    } catch (error) {
      addMessage(false, error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="login-container p-5 rounded shadow-lg col-12 col-sm-10 col-md-6 col-lg-5">
          <h2 className="text-center mb-3 fw-bold pt-0">Log In</h2>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <label htmlFor="email">Email address</label>
            </div>

            {/* Password with reusable toggle */}
            <div className="form-floating mb-3">
              <PasswordInput
                id="password"
                label="Password"
                icon_input={true}
                value={password}
                onChange={setPassword}
                required
                align="right"
                variant="floating"
                autoComplete="current-password"
              />
            </div>

            {/* Forgot password */}
            <div className="text-end mb-3 fw-medium">
              <Link to="/auth/request-otp" className="link-primary">
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-main fw-medium w-100 rounded-2"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginFormWithEmail;
