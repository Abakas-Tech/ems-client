const DashboardFooter = () => {
  return (
    <footer className="text-white mb-0 mt-3" style={{ backgroundColor: "#47BCD2" }}>
      <div className="py-4">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-12 text-center">
              <p
                className="mb-0"
                style={{ fontSize: "18px", letterSpacing: "0.3px" }}
              >
                <span className="fw-semibold">EMS</span>
                <span className="mx-2 opacity-75">|</span>
                Developed and Powered by{" "}
                <a
                  href="https://abakastech.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="db-brand-link fw-semibold"
                >
                  Abakas Technologies
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
