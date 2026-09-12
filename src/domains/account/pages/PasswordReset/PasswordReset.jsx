import { Link, useLocation } from "react-router-dom";
import PasswordResetForm from "../../components/ResetPassword/PasswordResetForm";
import "../../auth-theme.css";

function PasswordReset() {
  // The email is handed off from ForgotPasswordForm via navigate(state);
  // this was previously dropped, so PasswordResetForm always submitted
  // with an empty email.
  const location = useLocation();
  const email = location.state?.email || "";

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand-badge">S</div>
        <div className="auth-brand-title">Seid Stock Management</div>
      </div>

      <PasswordResetForm email={email} />

      <div className="auth-footer-link">
        <Link to="/">Back to Login</Link>
      </div>
    </div>
  );
}

export default PasswordReset;
