import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Film, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL } from "../../../shared/config/api.js";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerm: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!formData.agreeTerm) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/register`,
        {
          fullname: formData.fullName,
          email: formData.email,
          password: formData.password,
          agreeTerm: formData.agreeTerm,
        },
        {
          withCredentials: true,
        }
      );
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center items-center">
          <div className="flex w-full h-full overflow-hidden bg-black dark:bg-black">
            {/* Left Column: Image */}
            <div className="hidden lg:flex lg:w-1/2">
              <div
                className="w-full bg-center bg-no-repeat bg-cover"
                style={{
                  backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBFz7W3c62AwTSK4UliEAnANJ-a66uhHb-8a7-8kKTLVcoLOIsK42geUDrfII3bsTOsb3MurPeUSr8kXfw9L4hZGQV06RT2O67ACVPEY2rF6DthGb7EMusTLun4Ri6tRxeD3qUSHCe_Vd8VN6CCVmNAPQO0_eNjD7rCPk9nYvEZbEJz4LjXR94XhDjYDZN-jKJxVClGMFUVMvf0WYJqJDLaU34mUvHLYQB1f6gMJcb9AdbhIjNSxhvE5qD4t3cfr0Yon116kGXnMNo3")`,
                }}
              />
            </div>

            {/* Right Column: Form */}
            <div className="w-full lg:w-1/2 overflow-y-auto p-8 sm:p-14">
              <div className="flex flex-col gap-6">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>

                {/* Header */}
                <div className="flex items-center gap-3">
                  <Film className="text-[#D72626] w-8 h-8" />
                  <p className="text-xl font-bold text-white tracking-tight">
                    CinemaHub
                  </p>
                </div>

                {/* Page Heading */}
                <div className="flex flex-col gap-2">
                  <p className="text-white text-2xl font-bold leading-tight tracking-tight">
                    Create Account
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal">
                    Join CinemaHub to manage your cinema and events.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Full Name */}
                  <label className="flex flex-col w-full">
                    <p className="text-white text-xs font-semibold leading-normal pb-3 uppercase tracking-wide">
                      Full Name
                    </p>
                    <div className="flex w-full flex-1 items-stretch rounded-lg border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-[#D72626] bg-white dark:bg-[#262C3C] transition-all duration-200">
                      <input
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#D72626] border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#262C3C] h-14 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 text-sm font-normal leading-normal transition-all duration-200"
                      />
                    </div>
                  </label>

                  {/* Email */}
                  <label className="flex flex-col w-full">
                    <p className="text-white text-xs font-semibold leading-normal pb-3 uppercase tracking-wide">
                      Email Address
                    </p>
                    <div className="flex w-full flex-1 items-stretch rounded-lg border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-[#D72626] bg-white dark:bg-[#262C3C] transition-all duration-200">
                      <input
                        name="email"
                        type="email"
                        placeholder="Enter your email address"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#D72626] border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#262C3C] h-14 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 text-sm font-normal leading-normal transition-all duration-200"
                      />
                    </div>
                  </label>

                  {/* Password */}
                  <label className="flex flex-col w-full">
                    <p className="text-white text-xs font-semibold leading-normal pb-3 uppercase tracking-wide">
                      Password
                    </p>
                    <div className="flex w-full flex-1 items-stretch rounded-lg border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-[#D72626] bg-white dark:bg-[#262C3C] transition-all duration-200">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-gray-900 dark:text-white focus:outline-0 border-0 bg-transparent h-14 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 text-sm font-normal leading-normal"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-600 dark:text-gray-400 flex items-center justify-center px-4 rounded-r-lg hover:text-[#D72626] dark:hover:text-[#D72626] transition-colors duration-200"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </label>

                  {/* Confirm Password */}
                  <label className="flex flex-col w-full">
                    <p className="text-white text-xs font-semibold leading-normal pb-3 uppercase tracking-wide">
                      Confirm Password
                    </p>
                    <div className="flex w-full flex-1 items-stretch rounded-lg border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-[#D72626] bg-white dark:bg-[#262C3C] transition-all duration-200">
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-gray-900 dark:text-white focus:outline-0 border-0 bg-transparent h-14 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 text-sm font-normal leading-normal"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-gray-600 dark:text-gray-400 flex items-center justify-center px-4 rounded-r-lg hover:text-[#D72626] dark:hover:text-[#D72626] transition-colors duration-200"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </label>

                  {/* Terms & Conditions Checkbox */}
                  <div className="flex items-start gap-3 pt-2">
                    <input
                      id="agreeTerm"
                      name="agreeTerm"
                      type="checkbox"
                      checked={formData.agreeTerm}
                      onChange={handleChange}
                      className="form-checkbox h-5 w-5 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-[#D72626] focus:ring-2 focus:ring-[#D72626] dark:focus:ring-[#D72626] dark:focus:ring-offset-[#262C3C] cursor-pointer mt-1"
                    />
                    <label
                      className="text-xs text-white leading-relaxed cursor-pointer"
                      htmlFor="agreeTerm"
                    >
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        className="font-semibold text-[#D72626] hover:text-[#D72626]/80 transition-colors"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="font-semibold text-[#D72626] hover:text-[#D72626]/80 transition-colors"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Sign Up Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center whitespace-nowrap rounded-lg bg-[#D72626] h-11 px-6 text-sm font-bold text-white transition-all duration-200 hover:bg-[#D72626]/90 active:bg-[#D72626]/80 mt-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                  </button>
                </form>

                {/* Login Link */}
                <p className="text-center text-sm text-white">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-[#D72626] hover:underline"
                  >
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
