import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginWithEmail } from "../../../api/auth.api";
import useloader from "../../../../../context/Loader/useLoader";

import PasswordInput from "../../../../../shared/components/PasswordInput/PasswordInput";
import { setAccessToken } from "../../../../../utils/axios";
import useResponse from "../../../../../context/Response/useResponse";

const LoginFormWithEmail = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showLoader, hideLoader } = useloader();
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
      addMessage(false, "Password is too short");
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
      const { access_token, role } = response.data;
      setAccessToken(access_token);
      addMessage(response.success, response.message);

      navigate(
        role === "sales_rep" ? "/admin/stock/sales" : "/admin/stock/dashboard",
        { replace: true },
      );
    } catch (error) {
      addMessage(false, error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="auth-card">
      <h2 className="text-center mb-4">Log In</h2>

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
          <Link to="request-otp" className="link-primary">
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-auth-primary text-white fw-medium w-100"
        >
          Log In
        </button>
      </form>
    </div>
  );
};

export default LoginFormWithEmail;
