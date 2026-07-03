/**
 * normaliser.js — Frontend (ES Module)
 * ───────────────────────────────────────────────
 * Flattens the LMIS mega-mutation response into a
 * clean array of ticket objects.
 */

export function normaliseResults(rawResponse, agencies, dates) {
  const tickets = [];

  dates.forEach((date, dIdx) => {
    agencies.forEach((agency, aIdx) => {
      const aliasKey = `d${dIdx + 1}_a${aIdx + 1}`;
      const searchResult = rawResponse?.data?.[aliasKey]?.searchFlight;

      if (!searchResult?.success || searchResult.success.status !== "SUCCESS")
        return;

      const outbound = searchResult.success.outbound;
      if (!Array.isArray(outbound) || outbound.length === 0) return;

      outbound.forEach((flight) => {
        if (
          !Array.isArray(flight.flightFares) ||
          flight.flightFares.length === 0
        )
          return;

        // flightNumber lives inside flightSegment[0], not on outbound itself
        const seg0 = Array.isArray(flight.flightSegment)
          ? flight.flightSegment[0]
          : null;
        const flightNum = seg0?.flightNumber || "";

        flight.flightFares.forEach((fare) => {
          const baseAmount = Number(fare.fareBaseAmount) || 0;
          const taxes = Number(fare.fareTaxes) || 0;

          tickets.push({
            agency_id: agency.labour_id,
            agency_name: agency.name,
            airline: flight.carrierName || "Unknown",
            airline_code: flight.carrierCode || "",
            airline_logo: flight.carrierLogo || "",
            flight_number: flightNum,
            departure_date: flight.departureDate || date,
            departure_time: flight.departureTime || "",
            arrival_date: flight.arrivalDate || "",
            arrival_time: flight.arrivalTime || "",
            segments: Array.isArray(flight.flightSegment)
              ? flight.flightSegment.length
              : 1,
            base_amount: baseAmount,
            taxes,
            total_price: baseAmount + taxes,
            currency: fare.fareCurrency || "ETB",
            fare_name: fare.fareName || "",
            id: `${agency.labour_id}-${flightNum || "XX"}-${fare.fareId || baseAmount}`,
          });
        });
      });
    });
  });

  return tickets;
}
