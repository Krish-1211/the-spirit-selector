import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { Wine, Eye, EyeOff } from "lucide-react";

export default function CustomerAuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const { login, register } = useCustomerAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (isLogin) {
                await login(form.email, form.password);
            } else {
                if (!form.first_name || !form.last_name) {
                    setLoading(false);
                    return setError("First and last name are required.");
                }
                await register(form);
            }
            navigate(redirect);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-3">
                        <Wine className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isLogin ? "Sign in to your account to continue" : "Join Company for a premium shopping experience"}
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex rounded-sm border border-border mb-6 p-0.5">
                    {[
                        { label: "Sign In", val: true },
                        { label: "Create Account", val: false },
                    ].map(({ label, val }) => (
                        <button
                            key={label}
                            onClick={() => { setIsLogin(val); setError(""); }}
                            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors ${isLogin === val
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">First Name *</label>
                                <input
                                    type="text"
                                    value={form.first_name}
                                    onChange={(e) => set("first_name", e.target.value)}
                                    required={!isLogin}
                                    placeholder="John"
                                    className="w-full rounded-sm border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Last Name *</label>
                                <input
                                    type="text"
                                    value={form.last_name}
                                    onChange={(e) => set("last_name", e.target.value)}
                                    required={!isLogin}
                                    placeholder="Doe"
                                    className="w-full rounded-sm border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Email Address *</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                            required
                            placeholder="john@example.com"
                            className="w-full rounded-sm border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Password *</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={(e) => set("password", e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full rounded-sm border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Phone Number</label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => set("phone", e.target.value)}
                                    placeholder="(555) 123-4567"
                                    className="w-full rounded-sm border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Delivery Address</label>
                                <textarea
                                    value={form.address}
                                    onChange={(e) => set("address", e.target.value)}
                                    rows={2}
                                    placeholder="123 Main St, Sacramento, CA 95820"
                                    className="w-full rounded-sm border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-none"
                                />
                            </div>
                        </>
                    )}

                    {error && <p className="text-sm text-red-400">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-sm bg-primary py-3.5 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                    </button>
                </form>

                {isLogin && (
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        Don't have an account?{" "}
                        <button onClick={() => setIsLogin(false)} className="text-primary hover:underline font-medium">
                            Create one
                        </button>
                    </p>
                )}
            </div>
        </main>
    );
}
