import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, authLoading } = useAuth();

  if (authLoading) return null; // prevent infinite redirect loop

  if (!user) {
    console.log(user);
    return <Navigate to="/login" replace />;
  }

  return children;
}
