import { FaCheck } from "react-icons/fa";
import { useTranslation } from "react-i18next";

// Highlight texts are translation keys (promotion.highlights.*).
const HIGHLIGHT_KEYS = [
  "connections",
  "process",
  "guidance",
  "information",
  "support",
  "ethical",
];

function Promotion() {
  const { t } = useTranslation();
  const highlights = HIGHLIGHT_KEYS.map((key) =>
    t(`promotion.highlights.${key}`),
  );

  return (
    <section style={{ padding: "30px 0 0" }}>
      <div className="container">
        <div className="row g-3 align-items-stretch">
          {/* Left Content */}
          <div className="col-lg-6 d-flex flex-column justify-content-center h-100">
            <h2 className="mb-2 fw-bold">{t("promotion.title")}</h2>

            <p className="mb-4" style={{ lineHeight: "1.7" }}>
              {t("promotion.p1")}
            </p>

            <p className="mb-4" style={{ lineHeight: "1.7" }}>
              {t("promotion.p2")}
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
                title={t("promotion.videoTitle")}
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
