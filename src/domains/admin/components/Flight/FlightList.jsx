import { useMemo } from "react";
import {
  PlaneTakeoff,
  MapPin,
  Calendar,
  SlidersHorizontal,
  TrendingDown,
} from "lucide-react";
import FlightCard from "./FlightCard";

const BRAND = "#47BCD2";
const BRAND_DARK = "#2d9ab5";
const BRAND_LIGHT = "#eafbfd";
const BRAND_MID = "#b3e6ef";

const ALL_DESTINATIONS = [
  { code: "JED", name: "Jeddah", country: "Saudi Arabia" },
  { code: "RUH", name: "Riyadh", country: "Saudi Arabia" },
  { code: "MED", name: "Medina", country: "Saudi Arabia" },
  { code: "DXB", name: "Dubai", country: "UAE" },
  { code: "AUH", name: "Abu Dhabi", country: "UAE" },
  { code: "SHJ", name: "Sharjah", country: "UAE" },
  { code: "DOH", name: "Doha", country: "Qatar" },
  { code: "KWI", name: "Kuwait City", country: "Kuwait" },
  { code: "BAH", name: "Bahrain", country: "Bahrain" },
  { code: "MCT", name: "Muscat", country: "Oman" },
  { code: "AMM", name: "Amman", country: "Jordan" },
  { code: "BEY", name: "Beirut", country: "Lebanon" },
  { code: "CAI", name: "Cairo", country: "Egypt" },
  { code: "IST", name: "Istanbul", country: "Turkey" },
  { code: "ANK", name: "Ankara", country: "Turkey" },
  { code: "TLV", name: "Tel Aviv", country: "Israel" },
  { code: "BGW", name: "Baghdad", country: "Iraq" },
  { code: "DAM", name: "Damascus", country: "Syria" },
  { code: "KRT", name: "Khartoum", country: "Sudan" },
];

const getDestination = (code) =>
  ALL_DESTINATIONS.find((d) => d.code === code) || { name: code, country: "" };

const formatResultDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

/* ── Empty state ── */
const EmptyState = () => (
  <div
    className="d-flex flex-column align-items-center justify-content-center py-5"
    style={{ minHeight: "400px" }}
  >
    <div
      className="rounded-circle d-flex align-items-center justify-content-center mb-3"
      style={{
        width: "80px",
        height: "80px",
        backgroundColor: BRAND_LIGHT,
      }}
    >
      <PlaneTakeoff size={36} strokeWidth={1.5} color={BRAND} />
    </div>
    <h3 className="text-dark fw-bold mb-2">No flights found</h3>
    <p className="text-muted text-center" style={{ maxWidth: "300px" }}>
      Try a different date or destination and we'll search again.
    </p>
  </div>
);

/* ── Main component ── */
const FlightList = ({ flights = [], destination, departureDate }) => {
  const dest = getDestination(destination);

  const lowestPrice = useMemo(() => {
    if (!flights.length) return null;
    return Math.min(
      ...flights.map((f) => {
        const fare = f.flightFares?.[0];
        if (!fare) return Infinity;
        return (
          (Number(fare.fareBaseAmount) || 0) +
          (Number(fare.fareTaxes) || 0) +
          (Number(fare.fareSurcharges) || 0)
        );
      }),
    );
  }, [flights]);

  const getFlightPrice = (f) => {
    const fare = f.flightFares?.[0];
    if (!fare) return Infinity;
    return (
      (Number(fare.fareBaseAmount) || 0) +
      (Number(fare.fareTaxes) || 0) +
      (Number(fare.fareSurcharges) || 0)
    );
  };

  if (flights.length === 0) return <EmptyState />;

  return (
    <section className="py-4 py-md-5">
      <div className="container-fluid px-3 px-md-4">
        {/* ── Header ── */}
        <div className="row align-items-center mb-4 mb-md-5 g-3">
          <div className="col-12 col-md-8">
            {/* Route Pill */}
            <div
              className="d-inline-flex align-items-center gap-2 mb-3 px-3 py-2 rounded-pill"
              style={{
                backgroundColor: BRAND_LIGHT,
                borderColor: BRAND_MID,
                border: "1px solid",
              }}
            >
              <span
                className="d-flex align-items-center gap-1 text-dark small"
                style={{ fontSize: "0.85rem" }}
              >
                <MapPin size={12} color={BRAND} />
                ADD
              </span>
              <PlaneTakeoff size={13} color={BRAND} strokeWidth={1.5} />
              <span
                className="d-flex align-items-center gap-1 text-dark small"
                style={{ fontSize: "0.85rem" }}
              >
                {destination}
                {dest.name !== destination && (
                  <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                    {dest.name}
                  </span>
                )}
              </span>
            </div>

            {/* Metadata */}
            <div className="d-flex flex-wrap align-items-center gap-2 gap-md-3">
              <span className="d-flex align-items-center gap-1 text-muted small">
                <Calendar size={14} color={BRAND} />
                {formatResultDate(departureDate)}
              </span>

              <span style={{ color: BRAND_MID }}>•</span>

              <span className="d-flex align-items-center gap-1 text-muted small">
                <SlidersHorizontal size={14} color={BRAND} />
                {flights.length} flight{flights.length !== 1 ? "s" : ""}
              </span>

              {lowestPrice && lowestPrice !== Infinity && (
                <>
                  <span style={{ color: BRAND_MID }}>•</span>

                  <span
                    className="d-flex align-items-center gap-1 small fw-semibold"
                    style={{ color: BRAND_DARK }}
                  >
                    <TrendingDown size={14} />
                    from ETB {lowestPrice.toLocaleString()}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Destination Card */}
          {dest.country && (
            <div className="col-12 col-md-4">
              <div
                className="rounded p-3 text-center"
                style={{
                  backgroundColor: BRAND_LIGHT,
                  border: `2px solid ${BRAND_MID}`,
                }}
              >
                <p
                  className="mb-1 fw-bold"
                  style={{ fontSize: "1.5rem", color: BRAND_DARK }}
                >
                  {destination}
                </p>
                <p
                  className="mb-0 text-dark fw-semibold"
                  style={{ fontSize: "0.95rem" }}
                >
                  {dest.name}
                </p>
                <p className="mb-0 text-muted small">{dest.country}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Flight cards ── */}
        <div className="row g-3 g-md-4">
          {flights.map((flight, i) => (
            <div
              key={flight.flightId}
              className="col-12"
              style={{
                animation: `fadeInUp 0.5s ease-out ${i * 0.06}s both`,
              }}
            >
              <style>{`
                @keyframes fadeInUp {
                  from {
                    opacity: 0;
                    transform: translateY(20px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
              <FlightCard
                flight={flight}
                isLowest={getFlightPrice(flight) === lowestPrice}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlightList;
