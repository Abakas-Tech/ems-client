import React, { useState } from "react";
import Layout from "../../../../shared/Layouts/MainLayout";
import LoginForm from "../../components/LoginForm/LoginForm";
import IdentifierLoginForm from "../../components/LoginForm/IdentifierLoginForm";
import SEOHelmet from "../../../../shared/components/SEOHelmet/SEOHelmet";

function Login() {
  const [showIdentifierLogin, setShowIdentifierLogin] = useState(false);

  return (
    <>
      <SEOHelmet />
      <Layout>
        <div  style={{ minHeight: "70vh", marginTop: "80px" }}>
          {showIdentifierLogin ? (
            <>
              <IdentifierLoginForm />

              {/* Back to Admin Login */}
              <div className="text-center">
                <p className="mb-0">
                  Back to{" "}
                  <span
                    className="link-primary fw-medium"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowIdentifierLogin(false)}
                  >
                    Admin Login
                  </span>
                  ?
                </p>
              </div>
            </>
          ) : (
            <>
              <LoginForm />

              {/* Navigation question to Worker/Employer login */}
              <div className="text-center">
                <p className="mb-0">
                  Are you a{" "}
                  <span
                    className="link-primary fw-medium"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowIdentifierLogin(true)}
                  >
                    Worker
                  </span>{" "}
                  or an{" "}
                  <span
                    className="link-primary fw-medium"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowIdentifierLogin(true)}
                  >
                    Employer
                  </span>
                  ?
                </p>
                <small className="text-muted">
                  Use your phone number and ID to access your account.
                </small>
              </div>
            </>
          )}
        </div>
      </Layout>
    </>
  );
}

export default Login;
