import React, { useEffect, useState } from "react";
import { listWorkers } from "../../../api/worker.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/response/UseResponse";

const ActiveWorkers = ({ filters = {} }) => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [workers, setWorkers] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total_items: 0,
    total_pages: 0,
  });

  useEffect(() => {
    const fetchWorkers = async () => {
      showLoader();
      try {
        const response = await listWorkers(filters);
        setWorkers(response.items || []);
        setMeta(response.meta || meta);
      } catch (err) {
        addMessage(false, err.message || "Failed to fetch workers");
      } finally {
        hideLoader();
      }
    };

    fetchWorkers();
  }, [filters, showLoader, hideLoader, addMessage]);

  if (!workers.length) {
    return <p className="text-center mt-4">No active workers found.</p>;
  }

  return (
    <section>
      <div className="container">
        <div className="pricing pricing-5">
          <div className="row">
            {workers.map((worker) => (
              <div
                key={worker.id}
                className="col-lg-3 col-md-4 col-sm-12 text-center"
              >
                <div className="comp-property">
                  <div className="clp-title">
                    <h4>{worker.full_name}</h4>
                    <span>{worker.email || "No Email"}</span>
                  </div>

                  <ul>
                    <li>
                      <strong>Phone:</strong> {worker.phone_number}
                    </li>
                    <li>
                      <strong>Passport:</strong>{" "}
                      {worker.passport_number || "No Passport Number"}
                    </li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ActiveWorkers;
