import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/authApi";
import { useHotel } from "../../context/HotelContext";
import { API_URL } from "../../config";

const Login = () => {
  const { hotel } = useHotel();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const widgetRef = useRef(null); // store widget ID for reset

  useEffect(() => {
    let interval;

    const loadWidget = () => {
      if (window.turnstile && !widgetRef.current) {
        widgetRef.current = window.turnstile.render("#turnstile-login", {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
          callback: (token) => setCaptchaToken(token),
        });
        clearInterval(interval);
      }
    };

    interval = setInterval(loadWidget, 100);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!captchaToken) {
      setError("Please complete the CAPTCHA");
      return;
    }
    try {
      const data = await login({ ...form, turnstileToken: captchaToken });
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setCaptchaToken("");
      if (window.turnstile && widgetRef.current !== null) {
        window.turnstile.reset(widgetRef.current); // reset widget for retry
      }
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 via-blue-100 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        {hotel ? (
          <img src={`${API_URL}uploads/${hotel.logo}`} alt="logo" className="w-50 mx-auto" />
        ) : (
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Welcome Back</h2>
        )}

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
            />
          </div>

          {/* ✅ Manual Turnstile render */}
          <div id="turnstile-login" className="my-4"></div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-600 font-medium hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-sm">
            Forgot your password?{" "}
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Forgot Password
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
