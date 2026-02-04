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
import AdminLayout from "./components/admin/AdminLayout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Movies from "./pages/admin/Movies.jsx";
import Halls from "./pages/admin/Halls.jsx";
import User from "./pages/admin/User.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

const App = () => {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
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
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="movies" element={<Movies />} />
          <Route path="halls" element={<Halls />} />
          <Route path="users" element={<User />} />
        </Route>

        {/* auth is kept separate outside layout (simple) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;