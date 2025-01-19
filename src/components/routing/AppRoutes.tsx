import { Routes, Route } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "@/pages/Index";
import Payment from "@/pages/Payment";
import Dashboard from "@/pages/Dashboard";
import TranslatorDashboard from "@/pages/TranslatorDashboard";
import TranslatorApplicationsList from "@/components/dashboard/admin/TranslatorApplicationsList";

interface AppRoutesProps {
  queryClient: QueryClient;
}

const AppRoutes = ({ queryClient }: AppRoutesProps) => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRole="client" queryClient={queryClient}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/translator-dashboard"
        element={
          <ProtectedRoute allowedRole="translator" queryClient={queryClient}>
            <TranslatorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/applications"
        element={
          <ProtectedRoute allowedRole="admin" queryClient={queryClient}>
            <TranslatorApplicationsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment"
        element={
          <ProtectedRoute allowedRole="client" queryClient={queryClient}>
            <Payment />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;