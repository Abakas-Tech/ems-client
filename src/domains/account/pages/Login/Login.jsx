import { useState } from "react";
import SEOHelmet from "../../../../shared/components/SEOHelmet/SEOHelmet";
import LoginFormWithPhone from "../../components/login/LoginFormWithPhone/LoginFormWithPhone";
import LoginFormWithEmail from "../../components/login/LoginFormWithEmail/LoginFormWithEmail";
import { Link } from "react-router-dom";

function Login() {
  const [showIdentifierLogin, setShowIdentifierLogin] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <>
      <SEOHelmet />
  
        <div>
          {showIdentifierLogin ? (
            <div className="login-page d-flex flex-column justify-content-center align-items-center rounded min-vh-100">
              <LoginFormWithPhone role={selectedRole} />

              {/* Back to Admin Login */}
              <div className="text-center mt-3 fw-medium">
                <p className="mb-0">
                  Back to{" "}
                  <Link
                    className="link-primary fw-medium text-decoration-none"
                    onClick={() => {
                      setShowIdentifierLogin(false);
                      setSelectedRole(null);
                    }}
                  >
                    Admin Login
                  </Link>
                  ?
                </p>
              </div>
            </div>
          ) : (
            <div className="login-page d-flex flex-column justify-content-center align-items-center rounded  min-vh-100">
              <LoginFormWithEmail />

              {/* Navigation question to Worker/Employer login */}
              <div className="text-center mt-3 fw-medium">
                <p className="mb-0">
                  Are you a{" "}
                  <Link
                    className="link-primary fw-medium text-decoration-none"
                    onClick={() => {
                      setShowIdentifierLogin(true);
                      setSelectedRole("worker");
                    }}
                  >
                    Employee
                  </Link>{" "}
                  or an{" "}
                  <Link
                    className="link-primary fw-medium text-decoration-none"
                    onClick={() => {
                      setShowIdentifierLogin(true);
                      setSelectedRole("employer");
                    }}
                  >
                    Employer
                  </Link>
                  ?
                </p>
                <small className="text-muted">
                  Use your phone number and ID to access your account.
                </small>
              </div>
            </div>
          )}
        </div>
  
    </>
  );
}

export default Login;
