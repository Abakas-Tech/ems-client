import { Link } from "react-router-dom";
import "../stock-theme.css";

const DIRECTORY_CARDS = [
  {
    title: "Suppliers",
    description: "Manage the suppliers you import medicine from.",
    icon: "bi-building",
    path: "/admin/stock/suppliers",
  },
  {
    title: "Pharmacies",
    description: "Manage the pharmacies you deliver to.",
    icon: "bi-hospital",
    path: "/admin/stock/pharmacies",
  },
  {
    title: "Sales Team",
    description: "Register the sales reps who deliver stock to pharmacies.",
    icon: "bi-person-badge",
    path: "/admin/stock/sales-reps",
  },
];

const StockDirectory = () => {
  return (
    <div className="stock-app">
      <h2 className="fw-bold mb-1">Directory</h2>
      <p className="text-muted mb-4">
        Register and manage your suppliers, pharmacies and sales team from
        one place.
      </p>

      <div className="row g-3">
        {DIRECTORY_CARDS.map((card) => (
          <div className="col-md-4" key={card.path}>
            <Link to={card.path} className="text-decoration-none">
              <div className="stock-card p-4 h-100 stock-directory-card">
                <i className={`bi ${card.icon} stock-directory-icon`}></i>
                <h5 className="fw-semibold mt-3 mb-1">{card.title}</h5>
                <p className="text-muted mb-0 small">{card.description}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockDirectory;
