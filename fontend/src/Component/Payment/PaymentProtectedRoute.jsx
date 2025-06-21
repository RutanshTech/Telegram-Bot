import { Navigate, useLocation } from 'react-router-dom';

const PaymentProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    // Redirect to login with the current location state
    return <Navigate to="/login" state={{ from: location.state }} replace />;
  }

  return children;
};

export default PaymentProtectedRoute; 