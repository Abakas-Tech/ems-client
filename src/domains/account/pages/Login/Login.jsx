import SEOHelmet from "../../../../shared/components/SEOHelmet/SEOHelmet";
import LoginFormWithEmail from "../../components/login/LoginFormWithEmail/LoginFormWithEmail";
import "../../auth-theme.css";

function Login() {
  return (
    <>
      <SEOHelmet />
      <div className="auth-page">
        <div className="auth-brand">
          <div className="auth-brand-badge">S</div>
          <div className="auth-brand-title">Seid Stock Management</div>
          <div className="auth-brand-subtitle">
            Import, inventory and delivery management for Seid Pharma
          </div>
        </div>

        <LoginFormWithEmail />
      </div>
    </>
  );
}

export default Login;
