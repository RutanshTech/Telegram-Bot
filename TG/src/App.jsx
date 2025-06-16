import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import Header from "./Component/Header/Header";
import Home from "./Component/Home/Home";
import Login from "./Component/Login/Login";
import OTP from "./Component/Login/OTP";
import KYCForm from "./Component/KYC/Kycform";
import LoginAdmin from "./pages/LoginAdmin";
import Footer from "./Component/Footer/Footer";
import Layout from "./Adminpanel/Layout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import AddPlanForm from "./pages/AddPlans";
import ProtectedRoute from "./Adminpanel/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import ViewPlans from "./pages/ViewPlans";
import KycProtectedRoute from "./Component/KYC/KycProtectedRoute";

function App() {
  const location = useLocation();

  return (
    <>
      {location.pathname === "/" && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/payment/:id" element={<PaymentPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentSuccess />} />
        <Route 
          path="/kycForm" 
          element={
            <KycProtectedRoute>
              <KYCForm />
            </KycProtectedRoute>
          } 
        />

        <Route
          path="/loginAdmin"
          element={
            localStorage.getItem("auth") === "true" ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <LoginAdmin />
            )
          }
        />

        {/* Protected admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="addplans" element={<AddPlanForm />} />
          <Route path="viewplans" element={<ViewPlans />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {location.pathname === "/" && <Footer />}
      <ToastContainer position="top-right" autoClose={4000} />

    </>
  );
}

export default App;
