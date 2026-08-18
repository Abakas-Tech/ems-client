import SEOHelmet from "../../../../shared/components/SEOHelmet/SEOHelmet";
import LoginFormWithEmail from "../../components/login/LoginFormWithEmail/LoginFormWithEmail";

function Login() {
  return (
    <>
      <SEOHelmet />

      <div>
        <div className="login-page d-flex flex-column justify-content-center align-items-center rounded  min-vh-100 m-3">
          <LoginFormWithEmail />
        </div>
      </div>
    </>
  );
}

export default Login;
