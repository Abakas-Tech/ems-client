import { Plane, Clock, Tag, ArrowRight } from "lucide-react";

const BRAND = "#47BCD2";
const BRAND_DARK = "#2d9ab5";
const BRAND_LIGHT = "#eafbfd";
const BRAND_MID = "#b3e6ef";

const FlightCard = ({ flight, isLowest }) => {
  const formatTime = (t) => {
    if (!t) return "—";
    const [h, m] = t.split(":");
    return `${h}:${m}`;
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  const calcDuration = (dur) => {
    if (!dur) return "—";

    const hours = dur.match(/(\d+)\s*h/i)?.[1];
    const minutes = dur.match(/(\d+)\s*m/i)?.[1];

    if (hours && minutes) {
      return `${hours} hr ${minutes} min`;
    }

    if (hours) {
      return `${hours} hr`;
    }

    if (minutes) {
      return `${minutes} min`;
    }

    return dur;
  };

  const calculatePrice = () => {
    const fare = flight.flightFares?.[0];
    if (!fare) return 0;
    return (
      (Number(fare.fareBaseAmount) || 0) +
      (Number(fare.fareTaxes) || 0) +
      (Number(fare.fareSurcharges) || 0)
    );
  };

  const seg = flight.flightSegment?.[0] || {};
  const price = calculatePrice();

  return (
    <article
      className="card border-0 h-100"
      style={{
        borderLeft: `4px solid ${isLowest ? BRAND : BRAND_MID}`,
        backgroundColor: isLowest ? BRAND_LIGHT : "white",
        transition: "all 0.3s ease",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <div className="card-body p-3 p-md-4">
        {/* ── Top: airline logo + name | price ── */}
        <div className="row align-items-center mb-3 g-3">
          <div className="col-md-6 col-12">
            <div className="d-flex align-items-center gap-2 gap-md-3">
              {flight.carrierLogo ? (
                <img
                  src={flight.carrierLogo}
                  alt={flight.carrierName}
                  className="rounded"
                  style={{
                    width: "48px",
                    height: "48px",
                    objectFit: "contain",
                  }}
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div
                  className="rounded d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                    backgroundColor: BRAND_LIGHT,
                  }}
                >
                  <Plane size={28} strokeWidth={1.2} color={BRAND} />
                </div>
              )}
              <div className="flex-grow-1">
                <p
                  className="mb-0 fw-semibold text-dark"
                  style={{ fontSize: "0.95rem" }}
                >
                  {flight.carrierName}
                </p>
                <p className="mb-0 text-muted small">
                  {flight.carrierCode} · {seg.flightNumber}
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-12 text-md-end text-start">
            <div className="d-flex flex-column align-items-md-end align-items-start">
              <div className="d-flex align-items-baseline gap-2">
                <span className="text-muted small">ETB</span>
                <span
                  className="fw-bold"
                  style={{
                    fontSize: "1.75rem",
                    color: isLowest ? BRAND_DARK : BRAND,
                  }}
                >
                  {price.toLocaleString()}
                </span>
              </div>
              <p className="mb-0 text-muted small">per person</p>
            </div>
          </div>
        </div>

        <hr className="my-3" />

        {/* ── Middle: route timeline ── */}
        <div className="row align-items-center mb-3 g-2 g-md-3">
          {/* Departure */}
          <div className="col-12 col-md-4">
            <div className="text-center text-md-start">
              <p
                className="mb-0 fw-bold"
                style={{ fontSize: "1.25rem", color: BRAND_DARK }}
              >
                {formatTime(seg.departureTime)}
              </p>
              <p className="mb-0 fw-semibold text-dark">
                {flight.departureAirport?.airportCode}
              </p>
              <p className="mb-0 text-muted small">
                {formatDate(seg.departureDate)}
              </p>
            </div>
          </div>

          {/* Path */}
          <div className="col-12 col-md-4 my-3 my-md-0">
            <div className="d-flex flex-column align-items-center gap-2">
              <div
                className="d-flex justify-content-center"
                style={{ width: "100%", padding: "0 1rem" }}
              >
                <svg
                  width="100%"
                  height="2"
                  viewBox="0 0 100 2"
                  preserveAspectRatio="none"
                  style={{ minHeight: "2px" }}
                >
                  <line
                    x1="0"
                    y1="1"
                    x2="100"
                    y2="1"
                    stroke={BRAND_MID}
                    strokeWidth="2"
                  />
                  <circle
                    cx="50"
                    cy="1"
                    r="6"
                    fill={BRAND}
                    stroke="white"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="d-flex align-items-center gap-1 text-muted small">
                <Clock size={14} color={BRAND} />
                <span>{calcDuration(seg.flightDuration)}</span>
              </div>
            </div>
          </div>

          {/* Arrival */}
          <div className="col-12 col-md-4">
            <div className="text-center text-md-end">
              <p
                className="mb-0 fw-bold"
                style={{ fontSize: "1.25rem", color: BRAND_DARK }}
              >
                {formatTime(seg.arrivalTime)}
              </p>
              <p className="mb-0 fw-semibold text-dark">
                {flight.arrivalAirport?.airportCode}
              </p>
              <p className="mb-0 text-muted small">
                {formatDate(seg.departureDate)}
              </p>
            </div>
          </div>
        </div>

        <hr className="my-3" />

        {/* ── Bottom: chips + action ── */}
        <div className="row align-items-center g-2 g-md-3">
          <div className="col-12 col-md-6">
            <div className="d-flex flex-wrap gap-2">
              <span
                className="badge rounded-pill px-3 py-2"
                style={{
                  backgroundColor: BRAND_LIGHT,
                  color: BRAND_DARK,
                  fontSize: "0.8rem",
                }}
              >
                <span
                  className="text-muted small d-block"
                  style={{ fontSize: "0.7rem" }}
                >
                  Aircraft
                </span>
                {seg.flightAircraft || "—"}
              </span>
              <span
                className="badge rounded-pill px-3 py-2"
                style={{
                  backgroundColor: BRAND_LIGHT,
                  color: BRAND_DARK,
                  fontSize: "0.8rem",
                }}
              >
                <span
                  className="text-muted small d-block"
                  style={{ fontSize: "0.7rem" }}
                >
                  Stops
                </span>
                Non-stop
              </span>
            </div>
          </div>

          <div className="col-12 col-md-6 text-md-end">
            {isLowest && (
              <span
                className="badge rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2"
                style={{ backgroundColor: BRAND, color: "white" }}
              >
                <Tag size={14} />
                Best Price
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default FlightCard;
