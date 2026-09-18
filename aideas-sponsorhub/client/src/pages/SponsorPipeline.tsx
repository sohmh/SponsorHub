import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { SponsorDetailDrawer } from "@/components/SponsorDetailDrawer";
import { exportToCsv } from "@/lib/exportCsv";
import { trpc } from "@/lib/trpc";
import {
  ArrowUpDown,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Download,
  ExternalLink,
  Filter,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

type PipelineStatus = "All" | "Lead" | "Contacted" | "Meeting" | "Proposal" | "Confirmed" | "Not a fit";
type Priority = "All" | "High" | "Medium" | "Low";

export default function SponsorPipeline() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PipelineStatus>("All");
  const [priorityFilter, setPriorityFilter] = useState<Priority>("All");
  const [sortBy, setSortBy] = useState<"updatedAt" | "companyName" | "estimatedValue" | "nextFollowupDate">("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Drawer & Modal State
  const [selectedSponsorId, setSelectedSponsorId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Sponsor Form Fields (Matching Excel's 26 columns)
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [sponsorType, setSponsorType] = useState("Cash sponsor");
  const [industry, setIndustry] = useState("Fintech");
  const [cityRegion, setCityRegion] = useState("Bengaluru");
  const [primaryEvent, setPrimaryEvent] = useState("Annual Hackathon 2026");
  const [potentialFit, setPotentialFit] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [pipelineStatus, setPipelineStatus] = useState<"Lead" | "Contacted" | "Meeting" | "Proposal" | "Confirmed" | "Not a fit">("Lead");
  const [estimatedValue, setEstimatedValue] = useState("50000");
  const [bestContactMethod, setBestContactMethod] = useState("Email");
  const [likelySupportType, setLikelySupportType] = useState("Cash");
  const [whatTheyCouldOffer, setWhatTheyCouldOffer] = useState("");
  const [currentResponse, setCurrentResponse] = useState("");
  const [nextFollowupDate, setNextFollowupDate] = useState("");
  const [notes, setNotes] = useState("");

  // Live Query
  const { data: sponsors = [], isLoading } = trpc.sponsors.list.useQuery({
    search: search.trim() || undefined,
    status: statusFilter,
    priority: priorityFilter,
    sortBy,
    sortOrder,
  });

  // Create Mutation
  const createMutation = trpc.sponsors.create.useMutation({
    onSuccess: (newSponsor) => {
      toast.success(`Created sponsor "${newSponsor.companyName}" (${newSponsor.displayId})`);
      utils.sponsors.list.invalidate();
      utils.sponsors.kpis.invalidate();
      setShowAddModal(false);
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  // Delete Mutation
  const deleteMutation = trpc.sponsors.delete.useMutation({
    onSuccess: () => {
      toast.success("Sponsor record deleted");
      utils.sponsors.list.invalidate();
      utils.sponsors.kpis.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const resetForm = () => {
    setCompanyName("");
    setWebsite("");
    setSponsorType("Cash sponsor");
    setIndustry("Technology");
    setCityRegion("Bengaluru");
    setPrimaryEvent("Annual Hackathon 2026");
    setPotentialFit("");
    setPriority("Medium");
    setPipelineStatus("Lead");
    setEstimatedValue("50000");
    setBestContactMethod("Email");
    setLikelySupportType("Cash");
    setWhatTheyCouldOffer("");
    setCurrentResponse("");
    setNextFollowupDate("");
    setNotes("");
  };

  const handleExportCsv = () => {
    if (!sponsors.length) return toast.error("No records to export");
    exportToCsv("sponsor_pipeline_full_export", sponsors);
    toast.success(`Exported ${sponsors.length} sponsors to CSV`);
  };

  return (
    <AppLayout
      activePath="/sponsor-pipeline"
      onOpenSponsorDetail={(id) => setSelectedSponsorId(id)}
    >
      {/* Sponsor Detail Drawer */}
      <SponsorDetailDrawer
        sponsorId={selectedSponsorId}
        open={Boolean(selectedSponsorId)}
        onClose={() => setSelectedSponsorId(null)}
        isAdmin={isAdmin}
      />

      <div className="page-wrap">
        {/* Page Heading */}
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              <span className="live-dot" />
              <span>Master Pipeline • 26 Columns</span>
            </div>
            <h1>
              Sponsor <span>Pipeline</span>
            </h1>
            <p className="page-subtitle">
              Comprehensive registry of partner companies, engagement levels, outreach owners, and valuation.
            </p>
          </div>

          <div className="heading-actions">
            <button
              onClick={handleExportCsv}
              className="secondary-button"
              title="Download entire sheet as CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="primary-button"
            >
              <Plus size={14} />
              <span>Add Sponsor</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="panel p-4 mb-5 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by company name, industry, notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-600 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-xs outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Lead">Lead</option>
                <option value="Contacted">Contacted</option>
                <option value="Meeting">Meeting</option>
                <option value="Proposal">Proposal</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Not a fit">Not a fit</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-xs outline-none cursor-pointer"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-xs outline-none cursor-pointer"
              >
                <option value="updatedAt">Recently Updated</option>
                <option value="companyName">Company Name</option>
                <option value="estimatedValue">Deal Value</option>
                <option value="nextFollowupDate">Follow-up Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sponsor Table Panel */}
        <div className="panel overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center text-xs text-gray-400">
              Loading sponsor records...
            </div>
          ) : sponsors.length === 0 ? (
            <div className="py-20 text-center text-xs text-gray-400">
              No sponsor records match the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-mono uppercase text-[10px] border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Type & Industry</th>
                    <th className="py-3 px-4">Pipeline Status</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Est. Value (₹)</th>
                    <th className="py-3 px-4">Next Follow-up</th>
                    <th className="py-3 px-4">Proposal</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sponsors.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedSponsorId(s.id)}
                      className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-500 font-semibold">
                        {s.displayId}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                          {s.companyName}
                          {s.website && (
                            <span className="text-gray-300">
                              <ExternalLink size={11} />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 block truncate max-w-[180px]">
                          {s.primaryEvent || "General Sponsor"}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-gray-800 font-medium block">
                          {s.sponsorType || "Partner"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {s.industry || "Tech"}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            s.pipelineStatus === "Confirmed"
                              ? "bg-green-100 text-green-800"
                              : s.pipelineStatus === "Proposal"
                              ? "bg-purple-100 text-purple-800"
                              : s.pipelineStatus === "Meeting"
                              ? "bg-blue-100 text-blue-800"
                              : s.pipelineStatus === "Contacted"
                              ? "bg-indigo-100 text-indigo-800"
                              : s.pipelineStatus === "Not a fit"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {s.pipelineStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            s.priority === "High"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : s.priority === "Medium"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-gray-50 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {s.priority}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-gray-900">
                        ₹{Number(s.estimatedValue || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                        {s.nextFollowupDate ? (
                          <span className="flex items-center gap-1 text-amber-700">
                            <Clock size={12} />
                            {new Date(s.nextFollowupDate).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {s.proposalSent ? (
                          <span className="text-green-600 font-semibold text-[11px] flex items-center gap-1">
                            <Check size={13} /> Sent
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">Not sent</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSponsorId(s.id);
                            }}
                            className="px-2.5 py-1 rounded bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 text-[11px] font-semibold transition-colors"
                          >
                            Details
                          </button>
                          {isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete ${s.companyName}?`)) {
                                  deleteMutation.mutate({ id: s.id });
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete sponsor"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Add New Sponsor (Complete 26 Fields) */}
        {showAddModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Building2 size={18} className="text-blue-600" />
                  Add New Organization to Pipeline
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Row 1: Company & Website */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Razorpay"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://company.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Row 2: Type, Industry, Region */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Sponsor Type
                    </label>
                    <select
                      value={sponsorType}
                      onChange={(e) => setSponsorType(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    >
                      <option>Cash sponsor</option>
                      <option>Cash + in-kind</option>
                      <option>Cloud credits</option>
                      <option>Tool partner</option>
                      <option>Knowledge partner</option>
                      <option>Media partner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Industry
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    >
                      <option>Fintech</option>
                      <option>SaaS</option>
                      <option>Cloud</option>
                      <option>Design</option>
                      <option>Consulting</option>
                      <option>EdTech</option>
                      <option>Healthcare</option>
                      <option>Technology</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      City / Region
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru"
                      value={cityRegion}
                      onChange={(e) => setCityRegion(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                {/* Row 3: Status, Priority, Estimated Value */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Pipeline Status
                    </label>
                    <select
                      value={pipelineStatus}
                      onChange={(e) => setPipelineStatus(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none font-semibold text-blue-700"
                    >
                      <option value="Lead">Lead</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Proposal">Proposal</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Not a fit">Not a fit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Estimated Deal Value (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="50000"
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                {/* Row 4: Event, Follow-up, Method */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Primary Event
                    </label>
                    <input
                      type="text"
                      placeholder="Annual Hackathon 2026"
                      value={primaryEvent}
                      onChange={(e) => setPrimaryEvent(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Best Contact Method
                    </label>
                    <select
                      value={bestContactMethod}
                      onChange={(e) => setBestContactMethod(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    >
                      <option>Email</option>
                      <option>Call</option>
                      <option>LinkedIn</option>
                      <option>In-Person</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Next Follow-up Date
                    </label>
                    <input
                      type="date"
                      value={nextFollowupDate}
                      onChange={(e) => setNextFollowupDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                {/* Fit & Offer details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Strategic Potential Fit
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Why is this company a good match for the club event?"
                      value={potentialFit}
                      onChange={(e) => setPotentialFit(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      What They Could Offer
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Title cash grant + API prizes"
                      value={whatTheyCouldOffer}
                      onChange={(e) => setWhatTheyCouldOffer(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Internal Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Outreach instructions, referral names, or special conditions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!companyName.trim()) {
                      return toast.error("Company name is required");
                    }
                    createMutation.mutate({
                      companyName: companyName.trim(),
                      website: website.trim() || undefined,
                      sponsorType,
                      industry,
                      cityRegion,
                      primaryEvent,
                      potentialFit,
                      priority,
                      pipelineStatus,
                      estimatedValue,
                      bestContactMethod,
                      likelySupportType,
                      whatTheyCouldOffer,
                      currentResponse,
                      nextFollowupDate: nextFollowupDate || null,
                      notes,
                    });
                  }}
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800"
                >
                  {createMutation.isPending ? "Creating..." : "Save Sponsor"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
