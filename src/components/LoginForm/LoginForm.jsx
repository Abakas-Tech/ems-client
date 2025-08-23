import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginAdmin } from "../../api/admin/auth.api";
import useLoader from "../../context/Loader/UseLoader";
import useResponse from "../../context/response/UseResponse";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const navigate = useNavigate();

  const validateInputs = () => {
    if (!email || !password) {
      addMessage("error", "Email and password are required.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      addMessage("error", "Invalid email format.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    showLoader();
    try {
      const response = await loginAdmin({ email, password });
      localStorage.setItem("authToken", response.data.token); // store token
      addMessage("success", "Login successful!");
      navigate("/admin/profile"); // redirect after login
    } catch (error) {
      addMessage("error", error.message || "Login failed.");
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="login-page d-flex justify-content-center align-items-center vh-100">
      <div
        className="login-container p-4 rounded shadow"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h3 className="text-center mb-4">Log In</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <Link to="/admin/forgot-password" className="link-primary">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
