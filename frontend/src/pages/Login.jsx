// src/pages/Login.jsx
// Standard login page for system authentication


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Eye, EyeOff, Lock, Mail } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    // Simulate auth — replace with real API call
    setTimeout(() => {
      localStorage.setItem("token", "demo-token-123");
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #030712 0%, #111827 50%, #0d1117 100%)" }}>

      {/* Ambient background blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #10b981, transparent)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />

      {/* Card */}
      <div className="w-full max-w-md px-4 animate-fade-in">
        <div className="rounded-2xl p-8 relative"
          style={{
            background: "linear-gradient(135deg, rgba(31,41,55,0.8), rgba(17,24,39,0.95))",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(16,185,129,0.08)",
          }}>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", boxShadow: "0 0 30px rgba(16,185,129,0.4)" }}>
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-gray-400 text-sm mt-1">Sign in to your WebHook Dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@webhook.dev"
                  className="input-dark pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-dark pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg px-4 py-2.5 text-sm text-red-400"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="btn-emerald w-full mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </>
              ) : "Sign In"}
            </button>
          </form>

          {/* Footer hint */}
          <p className="text-center text-gray-600 text-xs mt-6">
            Demo credentials: any email + any password
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
