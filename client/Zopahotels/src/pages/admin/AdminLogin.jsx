import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import { useHotel } from "../../context/HotelContext";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const widgetRef = useRef(null); // store Turnstile widget ID
  const navigate = useNavigate();
  const { hotel } = useHotel();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!captchaToken) {
      setError("Please complete the CAPTCHA");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}api/users/login`, {
        email,
        password,
        turnstileToken: captchaToken, // send token to backend
      });

      const { token, user } = res.data;

      if (!["admin", "staff"].includes(user.role)) {
        setError("You are not authorized");
        return;
      }


      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(user));
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setCaptchaToken("");

      // Reset Turnstile widget for retry
      if (window.turnstile && widgetRef.current !== null) {
        window.turnstile.reset(widgetRef.current);
      }
    }
  };

  // Manual Turnstile render
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.turnstile) {
        widgetRef.current = window.turnstile.render("#turnstile-admin", {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
          callback: (token) => setCaptchaToken(token),
        });
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        {hotel && (
          <img
            src={`${API_URL}uploads/${hotel.logo}`}
            alt="logo"
            className="w-50 mx-auto"
          />
        )}
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Admin Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
          />

          {/* ✅ Turnstile Widget */}
          <div id="turnstile-admin" className="my-4"></div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
