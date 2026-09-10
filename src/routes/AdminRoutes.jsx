import React from "react";
import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "../utils/ProtectedRoute.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";
import AdminLayout from "./../shared/layout/AdminLayout/AdminLayout";

import ChangePasswordPage from "../domains/admin/pages/ChangePassword/ChangePassword.jsx";
import Profile from "../domains/admin/pages/Profile/Profile.jsx";
import CreateUser from "./../domains/admin/pages/user/CreateUser/CreateUser";
import ListUser from "./../domains/admin/pages/user/ListUser/ListUser";

import StockDashboard from "../domains/admin/pages/Stock/Dashboard/StockDashboard.jsx";
import StockOrders from "../domains/admin/pages/Stock/Orders/StockOrders.jsx";
import StockInventory from "../domains/admin/pages/Stock/Inventory/StockInventory.jsx";
import StockSalesDelivery from "../domains/admin/pages/Stock/SalesDelivery/StockSalesDelivery.jsx";
import StockCashCredit from "../domains/admin/pages/Stock/CashCredit/StockCashCredit.jsx";
import StockReports from "../domains/admin/pages/Stock/Reports/StockReports.jsx";

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
        <Route path="settings" element={<ChangePasswordPage />} />
        <Route path="my-profile" element={<Profile />} />
        <Route path="users" element={<ListUser />} />
        <Route path="users/create-user" element={<CreateUser />} />

        <Route path="stock/dashboard" element={<StockDashboard />} />
        <Route path="stock/orders" element={<StockOrders />} />
        <Route path="stock/inventory" element={<StockInventory />} />
        <Route path="stock/sales" element={<StockSalesDelivery />} />
        <Route path="stock/cash-credit" element={<StockCashCredit />} />
        <Route path="stock/reports" element={<StockReports />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
