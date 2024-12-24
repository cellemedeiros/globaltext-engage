import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'client' | 'translator' | 'admin';
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { isAuthenticated, userRole } = useAuth();

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (allowedRole === 'admin' && userRole !== 'admin') {
    return <Navigate to="/" />;
  }

  if (allowedRole !== 'admin' && userRole !== allowedRole) {
    return <Navigate to={userRole === 'translator' ? '/translator-dashboard' : '/dashboard'} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;