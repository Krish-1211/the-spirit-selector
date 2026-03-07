import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminLoginPage() {
    const { login } = useAdminAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("admin@reservespirits.com");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            navigate("/admin");
        } catch (err: any) {
            setError(err.response?.data?.error || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-white tracking-wide">COMPANY</h1>
                    <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">Admin Panel</p>
                </div>
                <form onSubmit={handleSubmit} className="bg-[#111] border border-white/10 rounded-lg p-8 space-y-5 shadow-2xl">
                    {[
                        { label: "Email", value: email, onChange: setEmail, type: "email" },
                        { label: "Password", value: password, onChange: setPassword, type: "password", placeholder: "••••••••" },
                    ].map(({ label, value, onChange, type, placeholder }) => (
                        <div key={label}>
                            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">{label}</label>
                            <input
                                type={type}
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                placeholder={placeholder}
                                required
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-4 py-3 text-white text-sm focus:outline-none focus:border-[#8b1a1a] transition-colors"
                            />
                        </div>
                    ))}
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#8b1a1a] hover:bg-[#c0392b] disabled:opacity-50 text-white py-3 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                    <p className="text-center text-xs text-gray-600">admin@company.com / Admin1234!</p>
                </form>
            </div>
        </div>
    );
}
