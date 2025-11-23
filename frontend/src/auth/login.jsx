import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/api/user/login", {
        email,
        password,
      },
    {withCredentials: true});

      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      if (error.response?.status === 401) {
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
        <div className="relative z-10 flex w-full flex-col justify-center bg-[#1E192D] p-8 md:w-1/2 lg:w-2/5">
          <div className="mx-auto w-full max-w-sm">
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
                    className="form-input h-12 w-full flex-1 rounded-lg border-0 bg-[#2C273E] pl-11 pr-4 text-base font-normal text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#A726D7]/50"
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
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input h-12 w-full flex-1 rounded-lg border-0 bg-[#2C273E] pl-11 pr-4 text-base font-normal text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#A726D7]/50"
                  />
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
                    className="form-checkbox h-4 w-4 rounded border-slate-600 bg-[#2C273E] text-[#A726D7] focus:ring-[#A726D7]/50"
                  />
                  <label className="text-slate-400" htmlFor="rememberMe">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="font-medium text-slate-400 hover:text-[#A726D7]"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-lg bg-[#A726D7] px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-[#A726D7]/90 focus:outline-none focus:ring-2 focus:ring-[#A726D7] focus:ring-offset-2 dark:focus:ring-offset-background-dark disabled:opacity-50"
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
                  className="font-semibold text-[#A726D7] hover:underline"
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
