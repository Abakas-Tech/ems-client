import React from "react";
import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "../utils/ProtectedRoute.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";
import AdminLayout from "./../shared/layout/AdminLayout/AdminLayout";

import Account from "../domains/admin/pages/Account/Account.jsx";

import StockDashboard from "../domains/admin/pages/Stock/Dashboard/StockDashboard.jsx";
import StockSuppliers from "../domains/admin/pages/Stock/Suppliers/StockSuppliers.jsx";
import StockOrders from "../domains/admin/pages/Stock/Orders/StockOrders.jsx";
import StockInventory from "../domains/admin/pages/Stock/Inventory/StockInventory.jsx";
import StockPharmacies from "../domains/admin/pages/Stock/Pharmacies/StockPharmacies.jsx";
import StockSalesDelivery from "../domains/admin/pages/Stock/SalesDelivery/StockSalesDelivery.jsx";
import StockCashCredit from "../domains/admin/pages/Stock/CashCredit/StockCashCredit.jsx";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* "dashboard" kept as an alias so any existing links/redirects still land somewhere useful */}
        <Route path="dashboard" element={<StockDashboard />} />
        <Route path="account" element={<Account />} />

        <Route path="stock/dashboard" element={<StockDashboard />} />
        <Route path="stock/suppliers" element={<StockSuppliers />} />
        <Route path="stock/orders" element={<StockOrders />} />
        <Route path="stock/inventory" element={<StockInventory />} />
        <Route path="stock/pharmacies" element={<StockPharmacies />} />
        <Route path="stock/sales" element={<StockSalesDelivery />} />
        <Route path="stock/cash-credit" element={<StockCashCredit />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
