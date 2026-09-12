import { Link } from "react-router-dom";
import ForgotPasswordForm from "../../components/ForgotPassword/ForgotPasswordForm";
import "../../auth-theme.css";

function ForgotPassword() {
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand-badge">S</div>
        <div className="auth-brand-title">Seid Stock Management</div>
      </div>

      <ForgotPasswordForm />

      <div className="auth-footer-link">
        <Link to="/">Back to Login</Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
