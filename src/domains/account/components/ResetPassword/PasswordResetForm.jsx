import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useloader from "../../../../context/Loader/useLoader";
// import { useDemoInfo } from "../../../../context/Demo/useDemoInfo";
import PasswordInput from "../../../../shared/components/PasswordInput/PasswordInput";
import useResponse from "../../../../context/Response/useResponse";
import { passwordResetConfirm } from "../../api/auth.api";

const PasswordResetForm = ({ email }) => {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const navigate = useNavigate();
  // const { openModal } = useDemoInfo();

  // Frontend validation
  const validateForm = () => {
    if (!otp) {
      addMessage(false, "OTP is required.");
      return false;
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      addMessage(false, "OTP must be exactly 6 digits.");
      return false;
    }

    if (!password) {
      addMessage(false, "New password is required.");
      return false;
    }

    //  Minimum length validation
    if (password.length < 8) {
      addMessage(false, "Password must be at least 8 characters.");
      return false;
    }

    if (!confirmPassword) {
      addMessage(false, "Confirm password is required.");
      return false;
    }

    if (password !== confirmPassword) {
      addMessage(false, "Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, ""); // allow only numbers
    if (!value) return;

    const newOtp = otp.split("");
    newOtp[index] = value;
    const updatedOtp = newOtp.join("").slice(0, 6);
    setOtp(updatedOtp);

    // Move to next input automatically
    const nextInput = e.target.nextSibling;
    if (nextInput) nextInput.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = otp.split("");
      newOtp[index] = "";
      setOtp(newOtp.join(""));

      // Move focus to previous input
      const prevInput = e.target.previousSibling;
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    showLoader();
    try {
      const response = await passwordResetConfirm({
        email,
        otp,
        password,
        confirm_password: confirmPassword,
      });
      addMessage(response.success, response.message);
      navigate("/");
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
          <h2 className="text-center mb-3 fw-bold pt-0">Reset Password</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4 text-center">
              <label className="form-label fw-medium d-block mb-2">
                Enter OTP
              </label>

              <div className="d-flex justify-content-center gap-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="form-control text-center fw-bold d-inline-block px-2 py-2 fs-4"
                    value={otp[index] || ""}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  />
                ))}
              </div>
            </div>

            <div className="form-floating mb-3">
              <PasswordInput
                id="password"
                label="New Password"
                icon_input={true}
                value={password}
                onChange={setPassword}
                required
                align="right"
                variant="floating"
              />
            </div>

            <div className="form-floating mb-3">
              <PasswordInput
                id="confirmPassword"
                label="Confirm Password"
                icon_input={true}
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
                align="right"
                variant="floating"
              />
            </div>

            <button
              type="submit"
              className="btn text-white fw-medium w-100 rounded-2"
              style={{ backgroundColor: "#1163A8" }}
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetForm;
