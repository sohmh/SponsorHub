import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";

import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
} from "lucide-react";

import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Prevent the Supabase auth listener and getSession()
  // from triggering the backend login twice.
  const completingLogin = useRef(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      toast.success(
        `Signed in as ${data.user.name} (${
          data.user.role === "admin" ? "Lead / Admin" : "Team Member"
        })`
      );

      utils.auth.me.setData(undefined, data.user as any);
      await utils.auth.me.invalidate();

      window.location.href = "/";
    },

    onError: (err) => {
      completingLogin.current = false;
      toast.error(err.message || "Failed to sign in");
    },
  });

  // If the user is already authenticated with SponsorHub,
  // send them directly to the dashboard.
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Complete SponsorHub login after Supabase authenticates
  // the user through the magic link.
  useEffect(() => {
    let mounted = true;

    const completeLogin = async (session: {
      access_token: string;
    } | null) => {
      if (!mounted) return;
      if (!session?.access_token) return;
      if (completingLogin.current) return;

      completingLogin.current = true;

      loginMutation.mutate({
        accessToken: session.access_token,
      });
    };

    // Check whether a Supabase session already exists.
    const checkExistingSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await completeLogin(session);
    };

    checkExistingSession();

    // Listen for the session created when the user clicks
    // the magic link in their email.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        completeLogin(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loginMutation]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      return toast.error("Please enter a valid club email");
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        console.error("Supabase magic-link error:", error);

        toast.error(
          "Unable to send the sign-in link. Please check your email address."
        );

        return;
      }

      setEmailSent(true);

      toast.success("Sign-in link sent!");
    } catch (error) {
      console.error("Magic-link request failed:", error);

      toast.error(
        "Unable to send the sign-in link. Please try again."
      );
    }
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
              Replacing fragmented spreadsheets with a secure, real-time
              database. Track student hackathon partners, MoUs, deliverables,
              and commercial pipelines.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800/80 space-y-3 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={15}
                className="text-green-400 shrink-0"
              />
              <span>Restricted to authorized committee members</span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2
                size={15}
                className="text-green-400 shrink-0"
              />
              <span>Full audit trail & per-member interaction logs</span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2
                size={15}
                className="text-green-400 shrink-0"
              />
              <span>
                Real-time KPI sync with automated valuation
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Login */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
              <Lock size={12} />
              <span>Secure Magic-Link Login</span>
            </div>

            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Sign in to your team account
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Enter your authorized college / club email. We'll send you a
              secure sign-in link.
            </p>
          </div>

          {emailSent ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center">
              <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-green-100 text-green-700 grid place-items-center">
                <Mail size={18} />
              </div>

              <h3 className="text-sm font-bold text-gray-900">
                Check your email
              </h3>

              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                We sent a secure sign-in link to:
              </p>

              <p className="text-xs font-semibold text-gray-900 mt-1 break-all">
                {email.trim().toLowerCase()}
              </p>

              <p className="text-[11px] text-gray-500 mt-3">
                Open the email and click the sign-in link to continue.
              </p>

              <button
                type="button"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              {/* Email Login Form */}
              <form onSubmit={handleEmailLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    College / Club Email
                  </label>

                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3 top-3 text-gray-400"
                    />

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
                  className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loginMutation.isPending
                    ? "Authenticating..."
                    : "Send Sign-In Link"}

                  <ArrowRight size={14} />
                </button>
              </form>

              <div className="mt-5 rounded-lg bg-gray-50 border border-gray-100 p-3">
                <p className="text-[10px] text-gray-500 text-center leading-relaxed">
                  <Lock
                    size={11}
                    className="inline mr-1 -mt-0.5"
                  />
                  Your email is verified through a secure one-time sign-in
                  link. Your password is never requested or stored by
                  SponsorHub.
                </p>
              </div>
            </>
          )}

          <p className="text-[10px] text-gray-400 text-center mt-6">
            For access requests, contact the Sponsorship Head or faculty
            advisor.
          </p>
        </div>
      </div>
    </div>
  );
}