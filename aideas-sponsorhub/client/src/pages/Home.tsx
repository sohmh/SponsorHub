import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { SponsorDetailDrawer } from "@/components/SponsorDetailDrawer";
import { exportToCsv } from "@/lib/exportCsv";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Plus,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedSponsorId, setSelectedSponsorId] = useState<number | null>(null);

  // Queries
  const { data: kpis, isLoading: kpisLoading } = trpc.sponsors.kpis.useQuery();
  const { data: sponsors = [], isLoading: sponsorsLoading } = trpc.sponsors.list.useQuery();
  const { data: recentLogs = [] } = trpc.contactLog.list.useQuery();

  // Urgent Follow-ups calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const urgentFollowups = sponsors.filter((s) => {
    if (!s.nextFollowupDate || s.pipelineStatus === "Confirmed" || s.pipelineStatus === "Not a fit") {
      return false;
    }
    return new Date(s.nextFollowupDate) <= today;
  });

  const handleExportDashboard = () => {
    if (!sponsors.length) return toast.error("No sponsor data to export");
    exportToCsv("sponsor_pipeline_backup", sponsors);
    toast.success("CRM backup CSV downloaded successfully");
  };

  return (
    <AppLayout activePath="/" onOpenSponsorDetail={(id) => setSelectedSponsorId(id)}>
      {/* Sponsor Detail Drawer */}
      <SponsorDetailDrawer
        sponsorId={selectedSponsorId}
        open={Boolean(selectedSponsorId)}
        onClose={() => setSelectedSponsorId(null)}
        isAdmin={user?.role === "admin"}
      />

      <div className="page-wrap">
        {/* Page Heading */}
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              <span className="live-dot" />
              <span>AI & DS Club • Official Sponsorship CRM</span>
            </div>
            <h1>
              Executive <span>Pipeline Overview</span>
            </h1>
            <p className="page-subtitle">
              Live tracking of corporate partnerships, student hackathon funding, and outreach deliverables.
            </p>
          </div>

          <div className="heading-actions">
            <button
              onClick={handleExportDashboard}
              className="secondary-button"
              title="Download clean CSV backup"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <Link href="/sponsor-pipeline" className="primary-button">
              <Plus size={14} />
              <span>Add Sponsor</span>
            </Link>
          </div>
        </div>

        {/* TOP KPI CARDS (Calculations matching Excel Dashboard) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          {/* Card 1: Total Sponsors */}
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
              <span>Total Organizations</span>
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
                <Building2 size={16} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                {kpisLoading ? "..." : kpis?.totalSponsors ?? 0}
              </span>
              <span className="text-[11px] text-gray-500 block mt-0.5">
                Active targets in club pipeline
              </span>
            </div>
          </div>

          {/* Card 2: Contacted / In Progress */}
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
              <span>Engaged / Contacted</span>
              <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 grid place-items-center">
                <Send size={15} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                {kpisLoading ? "..." : kpis?.contacted ?? 0}
              </span>
              <span className="text-[11px] text-indigo-600 font-medium block mt-0.5">
                {kpis && kpis.totalSponsors > 0
                  ? `${Math.round((kpis.contacted / kpis.totalSponsors) * 100)}% outreach rate`
                  : "0% outreach"}
              </span>
            </div>
          </div>

          {/* Card 3: Confirmed Sponsors */}
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
              <span>Confirmed Partners</span>
              <span className="w-7 h-7 rounded-lg bg-green-50 text-green-600 grid place-items-center">
                <CheckCircle2 size={16} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-green-700 tracking-tight">
                {kpisLoading ? "..." : kpis?.confirmed ?? 0}
              </span>
              <span className="text-[11px] text-green-700 font-medium block mt-0.5">
                MoUs executed & signed
              </span>
            </div>
          </div>

          {/* Card 4: Total Pipeline Value */}
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
              <span>Estimated Pipeline</span>
              <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 grid place-items-center">
                <DollarSign size={16} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                ₹{kpisLoading ? "..." : (kpis?.pipelineValue ?? 0).toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-amber-700 font-medium block mt-0.5">
                Target sponsorship value
              </span>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: URGENT FOLLOW-UPS & PIPELINE FUNNEL */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* URGENT FOLLOW-UPS (2 COLS) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 grid place-items-center">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Follow-ups Due & Critical Action Items ({urgentFollowups.length})
                  </h2>
                  <p className="text-xs text-gray-500">
                    Sponsors with outreach deadlines due today or overdue.
                  </p>
                </div>
              </div>

              <Link
                href="/activity-log"
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                View all logs <ArrowUpRight size={13} />
              </Link>
            </div>

            {urgentFollowups.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                <CheckCircle2 size={24} className="mx-auto text-green-500 mb-2 opacity-80" />
                All scheduled follow-ups are up to date! Great job team.
              </div>
            ) : (
              <div className="space-y-2.5">
                {urgentFollowups.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSponsorId(s.id)}
                    className="p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/20 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-bold text-gray-900 group-hover:text-blue-600">
                          {s.companyName}
                        </strong>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 font-semibold">
                          Due:{" "}
                          {new Date(s.nextFollowupDate!).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 font-mono">
                          {s.bestContactMethod}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                        {s.notes || s.currentResponse || "Action required: follow up on proposal."}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-800 block">
                        ₹{Number(s.estimatedValue || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-blue-600 font-medium group-hover:underline">
                        Open details →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PIPELINE FUNNEL BREAKDOWN (1 COL) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-1">
                Pipeline Stage Distribution
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Sponsors segmented across negotiation stages.
              </p>

              <div className="space-y-3 text-xs">
                {[
                  { label: "Lead", color: "bg-gray-400" },
                  { label: "Contacted", color: "bg-blue-400" },
                  { label: "Meeting", color: "bg-indigo-500" },
                  { label: "Proposal", color: "bg-purple-500" },
                  { label: "Confirmed", color: "bg-green-500" },
                ].map((stage) => {
                  const count = sponsors.filter((s) => s.pipelineStatus === stage.label).length;
                  const pct = sponsors.length > 0 ? Math.round((count / sponsors.length) * 100) : 0;
                  return (
                    <div key={stage.label}>
                      <div className="flex justify-between font-medium text-gray-700 mb-1 text-[11px]">
                        <span>{stage.label}</span>
                        <span className="font-mono text-gray-500">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${stage.color} rounded-full transition-all duration-300`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Win Rate</span>
              <span className="font-bold text-gray-900">
                {sponsors.length > 0
                  ? `${Math.round(
                      (sponsors.filter((s) => s.pipelineStatus === "Confirmed").length / sponsors.length) *
                        100
                    )}%`
                  : "0%"}
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: RECENT ACTIVITY LOG STREAM */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Latest Committee Outreach Activity
              </h2>
              <p className="text-xs text-gray-500">
                Recent correspondence, calls, and meeting summaries logged by the team.
              </p>
            </div>
            <Link
              href="/activity-log"
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              Go to Outreach Log <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {recentLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between text-xs gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 grid place-items-center shrink-0 mt-0.5 font-bold text-[11px]">
                    {log.contactMethod ? log.contactMethod[0] : "O"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-gray-900 font-semibold">
                        {log.companyName}
                      </strong>
                      <span className="text-[10px] text-gray-400 font-mono">
                        via {log.contactMethod}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mt-0.5 line-clamp-1">
                      {log.interactionSummary}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-gray-400 font-mono block">
                    {new Date(log.logDate).toLocaleDateString("en-IN")}
                  </span>
                  {log.followupRequired && (
                    <span className="text-[10px] text-amber-600 font-medium">
                      Follow-up pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
