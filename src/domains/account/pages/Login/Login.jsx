import React, { useState } from "react";
import Layout from "../../../../shared/Layouts/MainLayout";
import SEOHelmet from "../../../../shared/components/SEOHelmet/SEOHelmet";
import LoginFormWithPhone from "../../components/Login/LoginFormWithPhone";
import LoginFormWithEmail from "../../components/Login/LoginFormWithEmail";
import { Link } from "react-router-dom";

function Login() {
  const [showIdentifierLogin, setShowIdentifierLogin] = useState(false);

  return (
    <>
      <SEOHelmet />
      <Layout>
        <div>
          {showIdentifierLogin ? (
            <div className="login-page d-flex flex-column justify-content-center align-items-center rounded min-vh-100">
              <LoginFormWithPhone />

              {/* Back to Admin Login */}
              <div className="text-center mt-3 fw-medium">
                <p className="mb-0">
                  Back to{" "}
                  <Link
                    className="link-primary fw-medium text-decoration-none"
                    onClick={() => setShowIdentifierLogin(false)}
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
                    onClick={() => setShowIdentifierLogin(true)}
                  >
                    Worker
                  </Link>{" "}
                  or an{" "}
                  <Link
                    className="link-primary fw-medium text-decoration-none"
                    onClick={() => setShowIdentifierLogin(true)}
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
      </Layout>
    </>
  );
}

export default Login;
