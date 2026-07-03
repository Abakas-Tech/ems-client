/**
 * queryBuilder.js — Frontend (ES Module)
 * ───────────────────────────────────────────────
 * Builds a mega-mutation with 358 agencies × 15 dates.
 */

export function buildMegaQuery(
  agencies,
  destination,
  startDate,
  days = 15,
  contractId,
) {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const blocks = [];
  dates.forEach((date, dIdx) => {
    agencies.forEach((agency, aIdx) => {
      if (!agency.labour_id) return;

      blocks.push(`d${dIdx + 1}_a${aIdx + 1}: emdms {
  searchFlight(
    destination: "${destination}"
    departureDate: "${date}"
    contractId: "${contractId}"
    travelAgency: "${agency.labour_id}"
  ) {
    success {
      status
      outbound {
        carrierCode
        carrierLogo
        carrierName
        departureDate
        departureTime
        arrivalDate
        arrivalTime
        flightSegment {
          flightNumber
          flightDuration
        }
        flightFares {
          fareId
          fareBaseAmount
          fareTaxes
          fareCurrency
          fareName
        }
      }
    }
  }
}`);
    });
  });

  return `mutation OptimiseAll { ${blocks.join("\n")} }`;
}
