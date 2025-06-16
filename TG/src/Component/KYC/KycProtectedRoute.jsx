import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const KycProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isPaymentCompleted = localStorage.getItem("paymentCompleted") === "true";

  if (!isPaymentCompleted) {
    // Redirect to home if payment is not completed
    return <Navigate to="/" replace />;
  }

  return children;
};

export default KycProtectedRoute;
