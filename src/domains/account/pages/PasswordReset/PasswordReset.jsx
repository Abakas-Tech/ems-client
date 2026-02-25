import PasswordResetForm from "../../components/ResetPassword/PasswordResetForm";
import { Link } from "react-router-dom";

function PasswordReset() {
  return (

      <div className="login-page d-flex flex-column justify-content-center align-items-center rounded mt-4 min-vh-100">
        <PasswordResetForm />
        <div className="text-center mt-3 fw-medium">
          <Link to="/auth/login" className="link-primary">
            Back to Login
          </Link>
        </div>
      </div>

  );
}

export default PasswordReset;
