/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resetPasswordRequest } from "../../api/auth.api";
import useLoader from "../../../../context/Loader/UseLoader";
import useResponse from "../../../../context/response/UseResponse";
import { useDemoInfo } from "../../../../context/Demo/useDemoInfo";

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState("");
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const navigate = useNavigate();
  const { openModal } = useDemoInfo();

  const validateEmail = () => {
    if (!email) {
      addMessage(false, "Email is required.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      addMessage(false, "Invalid email format.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    showLoader();
    try {
      const response = await resetPasswordRequest({ email });
      addMessage(response.success, response.message);
      navigate("/auth/reset-password", { state: { email } });
    } catch (error) {
      addMessage(false, error.message);
    } finally {
      hideLoader();
    }
    // openModal("resetPassword");
  };

  return (
    <div
      className="login-page d-flex justify-content-center align-items-center rounded"
      style={{ minHeight: "81vh" }}
    >
      <div
        className="login-container p-4 rounded shadow-lg my-3"
        style={{ maxWidth: "500px", width: "90%", minHeight: "300px" }}
      >
        <h2 className="text-center mb-3 fw-bold pt-0">Forgot Password</h2>

        <form onSubmit={handleSubmit}>
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
          <button
            type="submit"
            className="btn btn-main fw-medium w-100 rounded-2"
          >
            Submit
          </button>
          <div className="text-center mt-3 fw-medium">
            <Link to="/auth/login" className="link-primary">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordRequest;
