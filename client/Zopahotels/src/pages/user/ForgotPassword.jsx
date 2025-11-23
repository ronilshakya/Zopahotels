import React, { useState } from "react";
import Swal from "sweetalert2";
import { forgotPassword } from "../../api/authApi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      Swal.fire("Success", res.message, "success");
      setEmail("");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 via-blue-100 to-white flex items-center justify-center p-4">
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Forgot Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full p-3 border rounded-lg mb-4"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-blue-600 text-white rounded-lg"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
    </div>
  );
};

export default ForgotPassword;
