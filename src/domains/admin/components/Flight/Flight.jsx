/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import useLoader from "../../../../context/Loader/useLoader";
import useResponse from "../../../../context/Response/useResponse";
import SkyFareWidget, { WIDGET_DESTINATIONS } from "./Widget";
import SearchForm from "./SearchForm";
import FlightList from "./FlightList";
import { getTravelAgencies, searchFlights } from "../../api/flight.api";

// constants
const DEST_BY_CODE = Object.fromEntries(
  WIDGET_DESTINATIONS.map((d) => [d.code, d]),
);
const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// helpers

function formatDisplayDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}`;
}

// main component
const Flight = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [agencies, setAgencies] = useState([]);
  const [flights, setFlights] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearch, setLastSearch] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load agencies on mount
  useEffect(() => {
    (async () => {
      try {
        const list = await getTravelAgencies();
        setAgencies(list);
      } catch {
        addMessage(false, "Failed to load travel agencies.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger UI refresh when flights data changes
  useEffect(() => {
    // This effect ensures the component re-renders with fresh flight data
    // Useful for animations, state synchronization, or dependent calculations
    if (flights && flights.length > 0) {
      // Flights have been updated - component will naturally re-render
    }
  }, [flights]);

  // Trigger UI refresh when search parameters change
  useEffect(() => {
    if (lastSearch) {
      // Search parameters updated - component will re-render with new context
    }
  }, [lastSearch]);

  const handleSearch = async (filters) => {
    const { agency_id, destination, departure_date } = filters;

    showLoader();
    setIsLoading(true);

    // Reset and prepare for new search - immediate visual refresh
    setFlights([]);
    setHasSearched(true);
    setLastSearch({ agency_id, destination, departure_date });

    try {
      const results = await searchFlights({
        destination,
        departureDate: departure_date,
        travelAgency: agency_id,
      });

      // Ensure results is an array, then update state
      const flightResults = Array.isArray(results) ? results : [];
      setFlights(flightResults);

      if (flightResults.length > 0) {
        addMessage(
          true,
          `Found ${flightResults.length} flight${flightResults.length > 1 ? "s" : ""}.`,
        );
      } else {
        addMessage(false, "No flights found for the selected criteria.");
      }
    } catch (err) {
      addMessage(false, err.message || "Failed to search flights.");
      setFlights([]);
    } finally {
      setIsLoading(false);
      hideLoader();
    }
  };

  // Widget date pick → auto-search with first agency
  const handleWidgetPickDate = ({ date, destination }) => {
    const agency_id = agencies[0]?.labour_id ?? "";
    handleSearch({ agency_id, destination, departure_date: date });
  };

  return (
    <div className="dashboard-wraper">
      {/* Page header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Flight Booking</h2>
          <p className="text-muted mb-0">
            Search and book flights from Addis Ababa to your destination.
          </p>
        </div>
      </div>

      {/* Body: two-column on large screens, stacked on mobile */}
      <div className="row g-4 align-items-start">
        {/* Left col — form + results */}
        <div className="col-12 col-xl-8">
          <SearchForm
            agencies={agencies}
            onSearch={handleSearch}
            initialFilters={
              lastSearch
                ? {
                    agency_id: lastSearch.agency_id,
                    destination: lastSearch.destination,
                    departure_date: lastSearch.departure_date,
                  }
                : {}
            }
          />

          {hasSearched && (
            <FlightList
              flights={flights}
              destination={lastSearch?.destination ?? ""}
              departureDate={lastSearch?.departure_date ?? ""}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Right col — SkyFare widget (sticky on desktop) */}
        <div className="col-12 col-xl-4">
          <div className="position-sticky" style={{ top: 24 }}>
            <SkyFareWidget
              agencies={agencies}
              onPickDate={handleWidgetPickDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flight;
