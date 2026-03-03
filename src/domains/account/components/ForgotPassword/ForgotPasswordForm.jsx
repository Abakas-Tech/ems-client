import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { passwordResetRequest } from "../../api/auth.api";
import useloader from "../../../../context/loader/useLoader";
import useResponse from "../../../../context/response/useResponse";
// import { useDemoInfo } from "../../../../context/Demo/useDemoInfo";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const { showloader, hideloader } = useloader();
  const { addMessage } = useResponse();
  const navigate = useNavigate();
  // const { openModal } = useDemoInfo();

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

    showloader();
    try {
      const response = await passwordResetRequest({ email });
      addMessage(response.success, response.message);
      navigate("/auth/reset-password", { state: { email } });
    } catch (error) {
      addMessage(false, error.message);
    } finally {
      hideloader();
    }
    // openModal("resetPassword");
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="login-container p-5 rounded shadow-lg col-12 col-sm-10 col-md-6 col-lg-5">
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
                autoComplete="email"
              />
              <label htmlFor="email">Email address</label>
            </div>
            <button
              type="submit"
              className="btn btn-main fw-medium w-100 rounded-2"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
