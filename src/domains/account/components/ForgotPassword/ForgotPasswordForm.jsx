import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { passwordResetRequest } from "../../api/auth.api";
import useloader from "../../../../context/Loader/useLoader";
import useResponse from "../../../../context/Response/useResponse";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const navigate = useNavigate();

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
      const response = await passwordResetRequest({ email });
      addMessage(response.success, response.message);
      // NOTE: the actual route is "/reset-password" (mounted at the auth
      // root) - it used to navigate to "/auth/reset-password", which
      // doesn't exist, so this silently dead-ended after requesting an OTP.
      navigate("/reset-password", { state: { email } });
    } catch (error) {
      addMessage(false, error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="auth-card">
      <h2 className="text-center mb-4">Forgot Password</h2>

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
            autoComplete="email"
          />
          <label htmlFor="email">Email address</label>
        </div>
        <button
          type="submit"
          className="btn btn-auth-primary text-white fw-medium w-100"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
