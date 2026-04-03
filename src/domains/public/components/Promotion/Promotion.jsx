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
              We believe that working abroad should be an opportunity filled
              with confidence—not uncertainty. That’s why we focus on making
              every step of the journey clear, guided, and accessible for every
              applicant.
            </p>

            <p className="mb-4" style={{ lineHeight: "1.7" }}>
              From the moment you begin your application to the day you reach
              your employer, our role is to ensure you understand the process,
              know what to expect, and feel supported throughout. We simplify
              complex procedures into clear steps so you can move forward with
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
          <div className="col-lg-6 d-flex pb-0">
            <div className="ratio ratio-16x9">
              <iframe
                /* Added autoplay=1 and mute=1 to the URL */
                src="https://www.youtube.com/embed/ePLajxLpUNk?autoplay=1&mute=1&si=rUEPSbkFvP9rpYzL"
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
