import { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { User, Lock, Eye, EyeOff, Film, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { AuthContext } from "../../../shared/context/AuthContext.jsx";
import { API_BASE_URL } from "../../../shared/config/api.js";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/login`,
        {
          email,
          password,
        },
        { withCredentials: true },
      );

      if (response.data.success) {
        // Store user info in context
        const userData = response.data.data.userExist;
        login(userData, response.data.data.token);
        toast.success("Login successful!");
        const fromPath = typeof location.state?.from === "string" ? location.state.from : "";

        // Navigate based on user role
        if (fromPath) {
          navigate(fromPath);
        } else if (userData.role === "admin") {
          navigate("/admin");
        } else if (userData.role === "hall-admin") {
          navigate("/halladmin");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      if (!error.response) {
        toast.error("Server unreachable. Start backend and try again.");
        return;
      }
      if (error.response?.status === 400 || error.response?.status === 401) {
        toast.error("Invalid credentials");
      } else {
        toast.error(error.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display group/design-root overflow-x-hidden text-white">
      <div className="flex flex-1">
        {/* Left Side - Login Form */}
        <div className="relative z-10 flex w-full flex-col justify-center bg-black p-8 md:w-1/2 lg:w-2/5">
          <div className="mx-auto w-full max-w-sm">
            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <div className="mb-8 text-left">
              <h1 className="text-4xl font-bold tracking-tight">Login</h1>
              <p className="mt-2 text-base text-slate-400">
                Welcome back to CinemaHub
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-y-6">
              {/* Email Field */}
              <div>
                <label
                  className="pb-2 text-sm font-medium text-slate-300"
                  htmlFor="email"
                >
                  Email or Username
                </label>
                <div className="relative mt-1 flex items-center">
                  <User className="absolute left-4 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input h-12 w-full rounded-lg border-0 bg-black pl-11 pr-4 text-base font-normal text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#D72626]/50"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  className="pb-2 text-sm font-medium text-slate-300"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative mt-1 flex items-center">
                  <Lock className="absolute left-4 w-5 h-5 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input h-12 w-full rounded-lg border-0 bg-black pl-11 pr-12 text-base font-normal text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#D72626]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-4 text-gray-600 dark:text-gray-400 flex items-center justify-center hover:text-[#D72626] dark:hover:text-[#D72626] transition-colors duration-200"
                  >
                    {passwordVisible ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="form-checkbox h-4 w-4 rounded border-slate-600 bg-black text-[#D72626] focus:ring-[#D72626]/50"
                  />
                  <label className="text-slate-400" htmlFor="rememberMe">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="font-medium text-slate-400 hover:text-[#D72626]"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-lg bg-[#D72626] px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-[#D72626]/90 focus:outline-none focus:ring-2 focus:ring-[#D72626] focus:ring-offset-2 dark:focus:ring-offset-background-dark disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-[#D72626] hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Background Image */}
        <div className="relative hidden w-1/2 flex-1 md:block lg:w-3/5">
          <img
            alt="A movie theater with red seats."
            className="absolute inset-0 h-full w-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIuG6d2vX0ueQehG0SMKXawW0tUaG2LCxKAyOvux6jhnYw6Qhh1Di3scWt17_VToqpMoXC9RYkwzLE5j-Vw63wIaTdccr7a7oiHOdpGH8bD0WXKXnxK1aqgHCSenmTAcJ2C9m-vxREwiulU5Mc4Dj2ZVh5vYsP7H8avacawP72cprfLjJWg1u0CrpTnXipfAI402TJz0oYUERrRcqkXVTiHICCZWV3Ax_ipp2H0v5vGfOJSmcgvqRhM871a7jLhIlEpwgWaDdSwuag"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
