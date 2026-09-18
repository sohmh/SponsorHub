import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // If already authenticated, redirect to home
  if (user) {
    setLocation("/");
  }

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      toast.success(`Signed in as ${data.user.name} (${data.user.role === "admin" ? "Lead / Admin" : "Team Member"})`);
      utils.auth.me.setData(undefined, data.user as any);
      await utils.auth.me.invalidate();
      window.location.href = "/";
    },
    onError: (err) => {
      toast.error(err.message || "Failed to sign in");
    },
  });

  const handleQuickLogin = (userId: number) => {
    loginMutation.mutate({ userId });
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      return toast.error("Please enter a valid club email");
    }
    loginMutation.mutate({ email: email.trim() });
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f5f7] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-200/80 overflow-hidden grid md:grid-cols-2">
        {/* Left Side: Brand & Club Context */}
        <div className="bg-[#182334] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-600 grid place-items-center font-extrabold text-white text-lg shadow-md">
                S
              </div>
              <div>
                <strong className="block text-base tracking-tight font-bold">
                  SponsorHub CRM
                </strong>
                <small className="text-gray-400 text-xs">
                  AI & DS Club • Official Sponsorship Platform
                </small>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
              Private portal for Sponsorship & PR.
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-3 leading-relaxed">
              Replacing fragmented spreadsheets with a secure, real-time database. Track student hackathon partners, MoUs, deliverables, and commercial pipelines.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800/80 space-y-3 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-green-400 shrink-0" />
              <span>Restricted to authorized committee members</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-green-400 shrink-0" />
              <span>Full audit trail & per-member interaction logs</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-green-400 shrink-0" />
              <span>Real-time KPI sync with automated valuation</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Options */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
              <Lock size={12} />
              <span>Login-Gated Workspace</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Sign in to your team account
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Select your committee profile or sign in with your email.
            </p>
          </div>

          {/* 1-Click Team Member Profiles */}
          <div className="space-y-2.5 mb-6">
            <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block mb-1">
              Quick Sign In (Team Demo Profiles)
            </span>

            {/* Aarav (Lead / Admin) */}
            <button
              onClick={() => handleQuickLogin(1)}
              disabled={loginMutation.isPending}
              className="w-full p-3.5 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold grid place-items-center text-xs">
                  AK
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs text-gray-900 group-hover:text-blue-600">
                      Aarav Kapoor
                    </strong>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-100 text-purple-800 font-semibold">
                      Lead (Admin)
                    </span>
                  </div>
                  <small className="text-gray-500 text-[11px] block">
                    Sponsorship & PR Lead • Full administrative access
                  </small>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
            </button>

            {/* Priya (Member) */}
            <button
              onClick={() => handleQuickLogin(2)}
              disabled={loginMutation.isPending}
              className="w-full p-3.5 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold grid place-items-center text-xs">
                  PN
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs text-gray-900 group-hover:text-blue-600">
                      Priya Nair
                    </strong>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      PR Member
                    </span>
                  </div>
                  <small className="text-gray-500 text-[11px] block">
                    Outreach Coordinator • Standard CRUD access
                  </small>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-400 font-medium">Or enter your email</span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                College / Club Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="yourname@club.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              {loginMutation.isPending ? "Authenticating..." : "Continue to CRM"}
              <ArrowRight size={14} />
            </button>
          </form>

          <p className="text-[10px] text-gray-400 text-center mt-6">
            For access requests, contact the Sponsorship Head or faculty advisor.
          </p>
        </div>
      </div>
    </div>
  );
}
