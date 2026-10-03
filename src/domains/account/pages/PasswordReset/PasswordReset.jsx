import PasswordResetForm from "../../components/ResetPassword/PasswordResetForm";
import { Link, Navigate, useLocation } from "react-router-dom";

function PasswordReset() {
  // The reset code belongs to one email address. It comes from the
  // "Forgot password" step; without it the code cannot be checked, so
  // send the user back to request a code first.
  const location = useLocation();
  const email = location.state?.email;
  if (!email) return <Navigate to="/auth/request-otp" replace />;

  return (

      <div className="login-page d-flex flex-column justify-content-center align-items-center rounded mt-4 min-vh-100 m-3">
        <PasswordResetForm email={email} />
        <div className="text-center mt-3 fw-medium">
          <Link to="/" className="link-primary">
            Back to Login
          </Link>
        </div>
      </div>

  );
}

export default PasswordReset;
