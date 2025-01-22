import { Navigate } from "react-router-dom";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { QueryClient } from "@tanstack/react-query";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'client' | 'translator' | 'admin';
  queryClient: QueryClient;
}

const ProtectedRoute = ({ children, allowedRole, queryClient }: ProtectedRouteProps) => {
  const { isAuthenticated, profile, isLoading } = useAuthRedirect(queryClient);

  if (isAuthenticated === null || isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/?signin=true" />;
  }

  if (allowedRole === 'admin' && profile?.id !== '37665cdd-1fdd-40d0-b485-35148c159bed') {
    return <Navigate to="/" />;
  }

  if (allowedRole !== 'admin' && profile?.role !== allowedRole) {
    return <Navigate to={profile?.role === 'translator' ? '/translator-dashboard' : '/dashboard'} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;