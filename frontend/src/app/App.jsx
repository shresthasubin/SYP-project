import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "../features/auth/pages/Login.jsx";
import Register from "../features/auth/pages/Register.jsx";
import Landing from "../features/public/pages/Landing.jsx";
import MoviesPage from "../features/public/pages/MoviesPage.jsx";
import Locations from "../features/public/pages/Locations.jsx";
import About from "../features/public/pages/About.jsx";
import Contact from "../features/public/pages/Contact.jsx";
import MovieDetail from "../features/public/pages/MovieDetail.jsx";
import Layout from "../shared/layout/Layout.jsx";
import Terms from "../features/public/pages/Terms.jsx";
import Privacy from "../features/public/pages/Privacy.jsx";
import Cookie from "../features/public/pages/Cookie.jsx";
import FAQ from "../features/public/pages/FAQ.jsx";
import NotFound from "../features/public/pages/NotFound.jsx";
import HallStaffApply from "../features/public/pages/HallStaffApply.jsx";
import Profile from "../features/public/pages/Profile.jsx";
import PaymentEsewaSuccess from "../features/public/pages/PaymentEsewaSuccess.jsx";
import PaymentEsewaFailure from "../features/public/pages/PaymentEsewaFailure.jsx";
import AdminLayout from "../features/admin/layouts/AdminLayout.jsx";
import HallAdminLayout from "../features/halladmin/layouts/HallAdminLayout.jsx";
import Dashboard from "../features/admin/pages/Dashboard.jsx";
import Movies from "../features/admin/pages/Movies.jsx";
import Halls from "../features/admin/pages/Halls.jsx";
import User from "../features/admin/pages/User.jsx";
import FormApplications from "../features/admin/pages/FormApplications.jsx";
import Showtimes from "../features/admin/pages/Showtimes.jsx";
import HallAdminDashboard from "../features/halladmin/pages/Dashboard.jsx";
import HallAdminMessages from "../features/halladmin/pages/Messages.jsx";
import SeatLayoutPreview from "../features/halladmin/components/SeatLayoutPreview.jsx";
import { AuthProvider } from "../shared/context/AuthContext.jsx";
import { ThemeProvider, useTheme } from "../shared/context/ThemeContext.jsx";
import { ProtectedRoute, PublicOnlyRoute } from "../shared/routes/RouteGuards.jsx";

const ThemedToaster = () => {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: {
          background: isDark ? "#363636" : "#f3f4f6",
          color: isDark ? "#fff" : "#000",
        },
        success: {
          duration: 3000,
          style: {
            background: "#10b981",
          },
        },
        error: {
          duration: 3000,
          style: {
            background: "#ef4444",
          },
        },
      }}
    />
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedToaster />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/legal/terms" element={<Terms />} />
            <Route path="/legal/privacy" element={<Privacy />} />
            <Route path="/legal/cookie" element={<Cookie />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/hall-staff/apply" element={<HallStaffApply />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/payment/esewa/success" element={<PaymentEsewaSuccess />} />
              <Route path="/payment/esewa/failure" element={<PaymentEsewaFailure />} />
              <Route path="/payment-success" element={<PaymentEsewaSuccess />} />
              <Route path="/payment-failed" element={<PaymentEsewaFailure />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="movies" element={<Movies />} />
              <Route path="halls" element={<Halls />} />
              <Route path="showtimes" element={<Showtimes />} />
              <Route path="users" element={<User />} />
              <Route path="form-applications" element={<FormApplications />} />
            </Route>
            <Route path="/reg" element={<SeatLayoutPreview />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["hall-admin", "admin"]} />}>
            <Route path="/halladmin" element={<HallAdminLayout />}>
              <Route index element={<HallAdminDashboard />} />
              <Route path="movies" element={<Movies />} />
              <Route path="halls" element={<Halls />} />
              <Route path="showtimes" element={<Showtimes />} />
              <Route path="messages" element={<HallAdminMessages />} />
            </Route>
          </Route>

          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
