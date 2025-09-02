import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginAdmin } from "../../api/auth.api";
import useLoader from "../../../../context/Loader/UseLoader";
import useResponse from "../../../../context/response/UseResponse";
import useAuth from "../../../../context/auth/UseAuth";
import logo from "../../../../assets/img/logo.svg";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const navigate = useNavigate();
  const { setUser } = useAuth();

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
      sessionStorage.setItem("authToken", response.data.data.token);
      addMessage("success", "User login successful");
      setUser(true);
      navigate("/admin/dashboard");
    } catch (error) {
      addMessage("error", error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <div
      className="login-page d-flex justify-content-center align-items-center rounded"
      style={{ minHeight: "80vh" }}
    >
      <div
        className="login-container p-4 rounded shadow-lg my-4"
        style={{ maxWidth: "500px", width: "90%", minHeight: "400px" }}
      >
        <h1 className="text-center mb-3 fw-bolder pt-0">Log In</h1>
        <img src={logo} className="mx-auto d-block mb-4 img-fluid" alt="Logo" />

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
            />
            <label htmlFor="email">Email address</label>
          </div>

          {/* Password with toggle */}
          <div className="form-floating mb-3 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Password</label>

            {/* Toggle icon button */}
            <button
              type="button"
              className="btn position-absolute top-50 end-0 translate-middle-y me-2"
              style={{ border: "none", background: "transparent" }}
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1} // not focusable with Tab
            >
              <i
                className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
              ></i>
            </button>
          </div>

          {/* Forgot password */}
          <div className="text-end mb-3 fw-medium">
            <Link to="/auth/forgot-password" className="link-primary">
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
  );
};

export default LoginForm;
