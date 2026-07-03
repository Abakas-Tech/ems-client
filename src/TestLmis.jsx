import React, { useState } from "react";

const LMIS_GATEWAY = "https://gateway.lmis.gov.et/v1/graphql";
const CONTRACT_ID = "b7f42792-d0e1-4cb2-96e4-e203bcf191a6";

const TestLmis = () => {
  const [agencies, setAgencies] = useState([]);
  const [agencyCount, setAgencyCount] = useState(3);
  const [days, setDays] = useState(1);
  const [destination, setDestination] = useState("DXB");
  const [departureDate, setDepartureDate] = useState("2026-07-03");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [elapsed, setElapsed] = useState(null);
  const [log, setLog] = useState([]);

  const addLog = (msg) =>
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  // Step 1: Fetch all agencies
  const fetchAgencies = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setLog([]);
    addLog("Fetching agencies...");

    try {
      const res = await fetch(LMIS_GATEWAY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationName: "GET_TRAVEL_AGENCIES",
          query: `query GET_TRAVEL_AGENCIES {
            emdms {
              emdms_ticketing_agency_labours(where: {is_active: {_eq: true}}) {
                labour_id name id
              }
            }
          }`,
          variables: {},
        }),
      });

      const data = await res.json();
      const list = data?.data?.emdms?.emdms_ticketing_agency_labours || [];
      setAgencies(list);
      addLog(`✅ Loaded ${list.length} agencies`);
      setResult(
        `Ready — ${list.length} agencies loaded. Now pick count + days and click Test.`,
      );
    } catch (err) {
      setError(err.message);
      addLog(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Build query for N agencies × D days and send
  const testFlightSearch = async () => {
    if (!agencies.length) {
      setError("Fetch agencies first!");
      return;
    }

    const count = Math.min(Number(agencyCount), agencies.length);
    const slice = agencies.slice(0, count);
    const dayCount = Number(days);

    setLoading(true);
    setError(null);
    setResult(null);
    setElapsed(null);
    setLog([]);

    addLog(
      `Building query: ${count} agencies × ${dayCount} day(s) = ${count * dayCount} aliases...`,
    );

    // Generate dates
    const dates = [];
    for (let i = 0; i < dayCount; i++) {
      const d = new Date(departureDate);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }

    // Build mutation — same format as Postman
    const blocks = [];
    dates.forEach((date, dIdx) => {
      slice.forEach((agency, aIdx) => {
        blocks.push(`d${dIdx + 1}_a${aIdx + 1}: emdms {
  searchFlight(
    destination: "${destination}"
    departureDate: "${date}"
    contractId: "${CONTRACT_ID}"
    travelAgency: "${agency.labour_id}"
  ) {
    success { status outbound { carrierName flightFares { fareBaseAmount fareTaxes } } }
  }
}`);
      });
    });

    const mutation = `mutation TestMultiDate { ${blocks.join("\n")} }`;

    addLog(`Query built — ${(mutation.length / 1024).toFixed(1)} KB`);
    addLog(`Sending to LMIS...`);

    const startTime = Date.now();

    try {
      const res = await fetch(LMIS_GATEWAY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mutation, variables: {} }),
      });

      const endTime = Date.now();
      const ms = endTime - startTime;
      setElapsed(ms);

      const contentType = res.headers.get("content-type") || "";

      if (!res.ok) {
        const text = await res.text();
        addLog(`❌ HTTP ${res.status} (${ms}ms)`);
        setError(`HTTP ${res.status} — ${text.slice(0, 200)}`);
        return;
      }

      // Check if we got HTML (Cloudflare block)
      if (contentType.includes("text/html")) {
        const text = await res.text();
        addLog(
          `❌ Got HTML instead of JSON — likely Cloudflare block (${ms}ms)`,
        );
        setError(
          `Cloudflare blocked — got HTML response. Response too large (${agencies.length} agencies × ${days} day(s)). Try fewer agencies.`,
        );
        return;
      }

      const data = await res.json();

      if (data.errors && data.errors.length > 0) {
        addLog(`❌ GraphQL errors (${ms}ms)`);
        console.error(data.errors);
        setError(`GraphQL error: ${data.errors[0].message}`);
        return;
      }

      // Count successful results
      let successful = 0;
      let totalOutbound = 0;
      for (let d = 1; d <= dayCount; d++) {
        for (let a = 1; a <= count; a++) {
          const key = `d${d}_a${a}`;
          const flight = data?.data?.[key]?.searchFlight;
          if (flight?.success?.status === "SUCCESS") {
            successful++;
            totalOutbound += flight.success.outbound?.length || 0;
          }
        }
      }

      addLog(`✅ SUCCESS! (${ms}ms)`);
      addLog(`   ${successful}/${count * dayCount} agencies returned results`);
      addLog(`   ${totalOutbound} total flights found`);

      setResult(
        `✅ ${count} agencies × ${dayCount} day(s) = ${count * dayCount} aliases\n\n` +
          `${successful}/${count * dayCount} agencies returned results\n` +
          `${totalOutbound} flights found\n` +
          `Response time: ${(ms / 1000).toFixed(1)}s`,
      );
    } catch (err) {
      const endTime = Date.now();
      setElapsed(endTime - startTime);
      addLog(`❌ ${err.message} (${endTime - startTime}ms)`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Quick presets ──
  const presets = [3, 10, 25, 50, 100, 200, 358];

  return (
    <div className="p-3" style={{ maxWidth: "800px" }}>
      <h4 className="fw-bold mb-1">LMIS Stress Test</h4>
      <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
        Find the maximum agencies per request before LMIS times out.
      </p>

      {/* Step 1 */}
      <div
        className="card border-0 mb-3"
        style={{
          borderRadius: "12px",
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div className="card-body p-3">
          <h6 className="fw-semibold mb-2">Step 1 — Fetch Agencies</h6>
          <button
            className="btn btn-main text-white fw-semibold px-4 py-2 rounded-3"
            onClick={fetchAgencies}
            disabled={loading}
            style={{ fontSize: "13px" }}
          >
            {loading
              ? "Loading..."
              : `Fetch Agencies${agencies.length ? ` (${agencies.length} loaded)` : ""}`}
          </button>
        </div>
      </div>

      {/* Step 2 */}
      {agencies.length > 0 && (
        <div
          className="card border-0 mb-3"
          style={{
            borderRadius: "12px",
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div className="card-body p-3">
            <h6 className="fw-semibold mb-3">Step 2 — Test Search</h6>
            <div className="row g-2 align-items-end mb-3">
              <div className="col-md-3">
                <label
                  className="form-label mb-1"
                  style={{ fontSize: "12px", fontWeight: 600 }}
                >
                  Agencies
                </label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={agencyCount}
                  onChange={(e) =>
                    setAgencyCount(
                      Math.min(Number(e.target.value), agencies.length),
                    )
                  }
                  min={1}
                  max={agencies.length}
                  style={{ borderRadius: "8px", fontSize: "13px" }}
                />
              </div>
              <div className="col-md-2">
                <label
                  className="form-label mb-1"
                  style={{ fontSize: "12px", fontWeight: 600 }}
                >
                  Days
                </label>
                <select
                  className="form-select form-select-sm"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  style={{ borderRadius: "8px", fontSize: "13px" }}
                >
                  <option value={1}>1 Day</option>
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days</option>
                  <option value={15}>15 Days</option>
                </select>
              </div>
              <div className="col-md-3">
                <label
                  className="form-label mb-1"
                  style={{ fontSize: "12px", fontWeight: 600 }}
                >
                  Destination
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value.toUpperCase())}
                  style={{ borderRadius: "8px", fontSize: "13px" }}
                />
              </div>
              <div className="col-md-2">
                <label
                  className="form-label mb-1"
                  style={{ fontSize: "12px", fontWeight: 600 }}
                >
                  Date
                </label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  style={{ borderRadius: "8px", fontSize: "13px" }}
                />
              </div>
              <div className="col-md-2">
                <button
                  className="btn btn-main text-white fw-semibold w-100 rounded-3"
                  onClick={testFlightSearch}
                  disabled={loading}
                  style={{ fontSize: "13px", padding: "5px 0" }}
                >
                  {loading ? "Testing..." : "Test"}
                </button>
              </div>
            </div>

            {/* Presets */}
            <div className="d-flex flex-wrap gap-1">
              <span
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  marginRight: "4px",
                }}
              >
                Quick:
              </span>
              {presets.map((n) => (
                <button
                  key={n}
                  className="btn btn-sm"
                  style={{
                    fontSize: "10px",
                    borderRadius: "6px",
                    padding: "2px 8px",
                    background:
                      agencyCount === n ? "var(--maincolor)" : "#f1f5f9",
                    color: agencyCount === n ? "#fff" : "#64748b",
                    border: "none",
                  }}
                  onClick={() => setAgencyCount(Math.min(n, agencies.length))}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Log */}
      {log.length > 0 && (
        <div
          className="mb-3 p-3 rounded-3"
          style={{
            background: "#0f172a",
            color: "#e2e8f0",
            fontFamily: "monospace",
            fontSize: "12px",
            borderRadius: "10px",
            maxHeight: "300px",
            overflow: "auto",
          }}
        >
          {log.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className="alert alert-success"
          style={{
            borderRadius: "10px",
            fontSize: "13px",
            whiteSpace: "pre-line",
          }}
        >
          {result}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="alert alert-danger"
          style={{ borderRadius: "10px", fontSize: "13px" }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default TestLmis;
