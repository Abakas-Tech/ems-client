import { FaCheck } from "react-icons/fa";

function Promotion() {
  const highlights = [
    "Trusted international job connections",
    "Clear and simple application process",
    "Step-by-step guidance",
    "Transparent and accurate information",
    "Support throughout your journey",
    "Safe and ethical recruitment",
  ];

  return (
    <section style={{ padding: "30px 0 0" }}>
      <div className="container">
        <div className="row g-3 align-items-stretch">
          {/* Left Content */}
          <div className="col-lg-6 d-flex flex-column justify-content-center h-100">
            <h2 className="mb-2 fw-bold">
              Building Trust in Overseas Employment
            </h2>

            <p className="mb-4" style={{ lineHeight: "1.7" }}>
              We believe working abroad should bring confidence, not
              uncertainty, so we make every step clear, guided, and accessible
              for every applicant.
            </p>

            <p className="mb-4" style={{ lineHeight: "1.7" }}>
              From the start of your application to your arrival with your
              employer, we ensure you understand the process, know what to
              expect, and feel supported throughout by simplifying complex
              procedures into clear steps so you can move forward with
              confidence.
            </p>

            <div className="row gy-2 gx-4 mb-4">
              {highlights.map((item, i) => (
                <div className="col-sm-6" key={i}>
                  <p className="mb-0">
                    <FaCheck
                      className="me-2"
                      style={{ color: "#4484BA", marginTop: "-2px" }}
                    />
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Video */}
          <div className="col-lg-6 pb-0">
            <div className="ratio ratio-16x9 rounded-4 overflow-hidden shadow">
              <iframe
                src="https://www.youtube.com/embed/ePLajxLpUNk?autoplay=1&mute=1&si=AP2KHZ1LSSED55bX"
                title="YouTube video player"
                allow="autoplay; encrypted-media"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Promotion;
