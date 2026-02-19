import React from "react";
import Layout from "../../../../shared/Layouts//MainLayout";

import { Link } from "react-router-dom";
import ForgotPasswordForm from "../../components/ForgotPassword/ForgotPasswordForm";

function ForgotPassword() {
  return (
    <Layout>
      <div className="login-page d-flex flex-column justify-content-center align-items-center rounded min-vh-100">
        <ForgotPasswordForm />
        <div className="text-center fw-medium mt-4">
          <Link to="/auth/login" className="link-primary">
            Back to Login
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export default ForgotPassword;
