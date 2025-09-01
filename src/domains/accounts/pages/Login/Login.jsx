import React from "react";
import Layout from "../../../../shared/Layout/Layout";
import LoginForm from "../../components/LoginForm/LoginForm";
import SEOHelmet from "../../../../shared/components/SEOHelmet/SEOHelmet";

function Login() {
  return (
    <>
      <SEOHelmet />
      <Layout>
        <LoginForm />
      </Layout>
    </>
  );
}

export default Login;
