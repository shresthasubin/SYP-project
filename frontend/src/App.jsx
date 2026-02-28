import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./auth/login.jsx";
import Register from "./auth/register.jsx";
import Landing from "./pages/Landing.jsx";
import MoviesPage from "./pages/MoviesPage.jsx";
import Locations from "./pages/Locations.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import MovieDetail from "./pages/MovieDetail.jsx";
import Layout from "./components/Layout.jsx";
import Terms from "./pages/Terms.jsx";
import Privacy from "./pages/Privacy.jsx";
import Cookie from "./pages/Cookie.jsx";
import FAQ from "./pages/FAQ.jsx";
import NotFound from "./pages/NotFound.jsx";
import HallStaffApply from "./pages/HallStaffApply.jsx";
import Profile from "./pages/Profile.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import HallAdminLayout from "./components/halladmin/HallAdminLayout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Movies from "./pages/admin/Movies.jsx";
import Halls from "./pages/admin/Halls.jsx";
import User from "./pages/admin/User.jsx";
import FormApplications from "./pages/admin/FormApplications.jsx";
import Showtimes from "./pages/admin/Showtimes.jsx";
import HallAdminDashboard from "./pages/halladmin/Dashboard.jsx";
import SeatLayoutPreview from "../formpage/SeatLayoutPreview.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider, useTheme } from "./context/ThemeContext.jsx";

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
            <Route path="/profile" element={<Profile />} />
            <Route path="/reg" element={<SeatLayoutPreview />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="movies" element={<Movies />} />
            <Route path="halls" element={<Halls />} />
            <Route path="showtimes" element={<Showtimes />} />
            <Route path="users" element={<User />} />
            <Route path="form-applications" element={<FormApplications />} />
          </Route>

          <Route path="/halladmin" element={<HallAdminLayout />}>
            <Route index element={<HallAdminDashboard />} />
            <Route path="movies" element={<Movies />} />
            <Route path="halls" element={<Halls />} />
            <Route path="showtimes" element={<Showtimes />} />
          </Route>

          {/* auth is kept separate outside layout (simple) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
