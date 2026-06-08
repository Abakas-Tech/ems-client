const API_ENDPOINT = "https://gateway.lmis.gov.et/v1/graphql";
const CONTRACT_ID = "b7f42792-d0e1-4cb2-96e4-e203bcf191a6";

const HEADERS = {
  "Content-Type": "application/json",
  Origin: "https://atm.lmis.gov.et",
  "x-hasura-role": "agency-owner",
};

const AGENCIES_QUERY = `
  query GET_TRAVEL_AGENCIES {
    emdms {
      emdms_ticketing_agency_labours(where: { is_active: { _eq: true } }) {
        labour_id
        name
        id
      }
    }
  }
`;

const SEARCH_FLIGHT_FULL = `
  mutation SearchFlight(
    $destination:   String!
    $departureDate: emdmstimestamptz!
    $contractId:    emdmsuuid!
    $travelAgency:  String!
  ) {
    emdms {
      searchFlight(
        destination:   $destination
        departureDate: $departureDate
        contractId:    $contractId
        travelAgency:  $travelAgency
      ) {
        success {
          status responseID
          outbound {
            carrierCode carrierLogo carrierName
            flightId flightOfferId
            departureAirport { airportCode airportName }
            arrivalAirport   { airportCode airportName }
            flightSegment {
              departureDate departureTime
              arrivalDate   arrivalTime
              flightNumber  flightAircraft flightDuration
            }
            flightFares {
              fareId fareCurrency fareBaseAmount fareSurcharges fareTaxes fareName
            }
          }
        }
      }
    }
  }
`;

const SEARCH_FLIGHT_LITE = `
  mutation SearchFlight(
    $destination:   String!
    $departureDate: emdmstimestamptz!
    $contractId:    emdmsuuid!
    $travelAgency:  String!
  ) {
    emdms {
      searchFlight(
        destination:   $destination
        departureDate: $departureDate
        contractId:    $contractId
        travelAgency:  $travelAgency
      ) {
        success {
          outbound {
            carrierCode carrierName carrierLogo
            flightFares { fareBaseAmount fareSurcharges fareTaxes fareCurrency }
          }
        }
      }
    }
  }
`;

// graphql helper with built-in error handling
const gql = async (operationName, query, variables = {}) => {
  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ operationName, variables, query }),
    });

    if (!res.ok) {
      throw new Error(`Network error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();

    if (json.errors?.length) {
      throw new Error(json.errors[0]?.message || "GraphQL error");
    }

    return json.data;
  } catch (error) {
    throw new Error(error.message || "Failed to connect to flight service");
  }
};
//price helper — returns total price or Infinity if fares are missing/invalid
const calcTotalPrice = (flight) => {
  const fare = flight.flightFares?.[0];
  if (!fare) return Infinity;
  return (
    (Number(fare.fareBaseAmount) || 0) +
    (Number(fare.fareTaxes) || 0) +
    (Number(fare.fareSurcharges) || 0)
  );
};

//api functions
// Get all active travel agencies
const getTravelAgencies = async () => {
  try {
    const data = await gql("GET_TRAVEL_AGENCIES", AGENCIES_QUERY);
    return data?.emdms?.emdms_ticketing_agency_labours ?? [];
  } catch (error) {
    throw new Error(error.message || "Failed to fetch travel agencies");
  }
};

// Full flight search — sorted by total price asc
const searchFlights = async ({ destination, departureDate, travelAgency }) => {
  try {
    const data = await gql("SearchFlight", SEARCH_FLIGHT_FULL, {
      contractId: CONTRACT_ID,
      destination,
      departureDate,
      travelAgency,
    });

    const outbound = data?.emdms?.searchFlight?.success?.outbound ?? [];
    return [...outbound].sort((a, b) => calcTotalPrice(a) - calcTotalPrice(b));
  } catch (error) {
    throw new Error(error.message || "Failed to search flights");
  }
};

// Lightweight single-day price scan — used by SkyFare widget
const scanDatePrice = async ({ destination, departureDate, travelAgency }) => {
  try {
    const data = await gql("SearchFlight", SEARCH_FLIGHT_LITE, {
      contractId: CONTRACT_ID,
      destination,
      departureDate,
      travelAgency,
    });

    const outbound = data?.emdms?.searchFlight?.success?.outbound ?? [];
    if (!outbound.length) return null;

    const prices = outbound.map(calcTotalPrice).filter((p) => p !== Infinity);
    if (!prices.length) return null;

    const minPrice = Math.min(...prices);
    const cheapest = outbound.reduce(
      (best, f) => (calcTotalPrice(f) < calcTotalPrice(best) ? f : best),
      outbound[0],
    );

    return {
      minPrice,
      currency: cheapest.flightFares?.[0]?.fareCurrency ?? "ETB",
      carrierCode: cheapest.carrierCode ?? "",
      carrierName: cheapest.carrierName ?? "",
      carrierLogo: cheapest.carrierLogo ?? "",
      flightCount: outbound.length,
    };
  } catch (error) {
    throw new Error(error.message || "Failed to scan flight price");
  }
};

export { getTravelAgencies, searchFlights, scanDatePrice, calcTotalPrice };
