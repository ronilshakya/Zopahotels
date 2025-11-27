import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { forgotPassword } from "../../api/authApi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const widgetRef = useRef(null); // store widget ID for reset

  // Load Turnstile widget
  useEffect(() => {
    let interval;

    const loadWidget = () => {
      if (window.turnstile && !widgetRef.current) {
        widgetRef.current = window.turnstile.render("#turnstile-forgot", {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
          callback: (token) => setCaptchaToken(token),
        });
        clearInterval(interval);
      }
    };

    interval = setInterval(loadWidget, 100);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      Swal.fire("Error", "Please complete the CAPTCHA", "error");
      return;
    }
    console.log(captchaToken)
    setLoading(true);
    try {
      const res = await forgotPassword({ email, turnstileToken: captchaToken });
      Swal.fire("Success", res.message, "success");
      setEmail("");
      setCaptchaToken("");
      // Reset Turnstile widget
      if (window.turnstile && widgetRef.current !== null) {
        window.turnstile.reset(widgetRef.current);
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
      setCaptchaToken("");
      if (window.turnstile && widgetRef.current !== null) {
        window.turnstile.reset(widgetRef.current);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 via-blue-100 to-white flex items-center justify-center p-4">
      <div className="max-w-md mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Forgot Password</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-3 border rounded-lg"
            required
          />

          {/* ✅ Manual Turnstile render */}
          <div id="turnstile-forgot" className="my-4"></div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
