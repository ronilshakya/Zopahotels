import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../../api/authApi";
import { useHotel } from "../../context/HotelContext";
import { API_URL } from "../../config";
import preloaderGif from '../../assets/preloader.gif'
import Swal from "sweetalert2";
import { Country, City } from "country-state-city";

const Signup = () => {
  const { hotel } = useHotel();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "", address: "",
    city: "", state: "", zip: "", country: "",
  });
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const widgetRef = useRef(null);

  // ✅ Load Turnstile once
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.turnstile && !widgetRef.current) {
        widgetRef.current = window.turnstile.render("#turnstile-widget", {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
          callback: (token) => setCaptchaToken(token),
        });
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    for (const field in formData) {
      if (!formData[field]) {
        setError("Please fill in all fields");
        return;
      }
    }

    if (!captchaToken) {
      setError("Please complete the CAPTCHA");
      return;
    }

    try {
      setLoading(true);
      await signup({ ...formData, turnstileToken: captchaToken }); // ✅ send token
      Swal.fire("Signup successful!", "Please check your email for verification.", "success");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
      setCaptchaToken(""); // reset token
      if (window.turnstile && widgetRef.current) {
        window.turnstile.reset(widgetRef.current); // reset widget for retry
      }
    } finally {
      setLoading(false);
    }
  };
  const countries = Country.getAllCountries();
  const cities = formData.country
    ? City.getCitiesOfCountry(
        countries.find(c => c.name === formData.country)?.isoCode
      )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 via-blue-100 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8">
        {hotel?(
                  <img src={`${API_URL}uploads/${hotel.logo}`} alt="logo" className="w-50 mx-auto" />
                ):(
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
                  Welcome Back
                </h2>
                )}

        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="zip" className="text-sm font-medium text-gray-700">
                Zip Code
              </label>
              <input
                id="zip"
                type="text"
                value={formData.zip}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              id="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                id="country"
                list="countries"
                type="text"
                value={formData.country}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <datalist id="countries">
                {countries.map((country) => (
                  <option key={country.isoCode} value={country.name} />
                ))}
              </datalist>
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                list="cities"
                id="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <datalist id="cities">
                {cities.map((city) => (
                  <option key={city.name} value={city.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                id="state"
                type="text"
                value={formData.state}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

          </div>

           <div id="turnstile-widget" className="my-4"></div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 mt-4 font-semibold"
          >
            {loading ? (<img src={preloaderGif} className="w-12 mx-auto" alt="preloader"/>) : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 font-medium hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;