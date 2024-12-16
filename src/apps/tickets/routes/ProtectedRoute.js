import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isLoggedIn } = useSelector(state => state.auth);
  const { userRole, permissions } = useSelector(state => state.roles);
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // if (requiredPermission && !permissions[userRole][requiredPermission]) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return children;
};

export default ProtectedRoute;
