import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { exportToCsv } from "@/lib/exportCsv";
import { trpc } from "@/lib/trpc";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Filter,
  MessageSquare,
  Paperclip,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function ActivityLog() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"All" | "FollowupNeeded" | "Completed">("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLog, setEditingLog] = useState<any | null>(null);

  // Form State (15 Columns)
  const [selectedSponsorId, setSelectedSponsorId] = useState<number>(1);
  const [contactName, setContactName] = useState("");
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [contactMethod, setContactMethod] = useState("Email");
  const [interactionSummary, setInteractionSummary] = useState("");
  const [responseResult, setResponseResult] = useState("");
  const [followupRequired, setFollowupRequired] = useState(false);
  const [nextFollowupDate, setNextFollowupDate] = useState("");
  const [followupAction, setFollowupAction] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  // Live Queries
  const { data: logs = [], isLoading } = trpc.contactLog.list.useQuery({
    search: search.trim() || undefined,
  });
  const { data: sponsors = [] } = trpc.sponsors.list.useQuery();

  // Create Mutation
  const createMutation = trpc.contactLog.create.useMutation({
    onSuccess: () => {
      toast.success("Outreach activity logged successfully");
      utils.contactLog.list.invalidate();
      utils.sponsors.list.invalidate();
      setShowAddModal(false);
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  // Toggle Follow-up Mutation
  const toggleMutation = trpc.contactLog.toggleComplete.useMutation({
    onSuccess: (updated) => {
      toast.success(
        updated.followupCompleted
          ? "Follow-up marked completed!"
          : "Follow-up marked pending"
      );
      utils.contactLog.list.invalidate();
      utils.sponsors.kpis.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  // Update Mutation
  const updateMutation = trpc.contactLog.update.useMutation({
    onSuccess: () => {
      toast.success("Outreach entry updated");
      utils.contactLog.list.invalidate();
      setEditingLog(null);
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  // Delete Mutation
  const deleteMutation = trpc.contactLog.delete.useMutation({
    onSuccess: () => {
      toast.success("Log record deleted");
      utils.contactLog.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const resetForm = () => {
    setContactName("");
    setLogDate(new Date().toISOString().split("T")[0]);
    setContactMethod("Email");
    setInteractionSummary("");
    setResponseResult("");
    setFollowupRequired(false);
    setNextFollowupDate("");
    setFollowupAction("");
    setAttachmentUrl("");
  };

  const openEditLog = (l: any) => {
    setEditingLog(l);
    setSelectedSponsorId(l.sponsorId || 1);
    setContactName(l.contactName || "");
    setLogDate(l.logDate ? l.logDate.split("T")[0] : new Date().toISOString().split("T")[0]);
    setContactMethod(l.contactMethod || "Email");
    setInteractionSummary(l.interactionSummary || "");
    setResponseResult(l.responseResult || "");
    setFollowupRequired(l.followupRequired || false);
    setNextFollowupDate(l.nextFollowupDate ? l.nextFollowupDate.split("T")[0] : "");
    setFollowupAction(l.followupAction || "");
    setAttachmentUrl(l.attachmentUrl || "");
  };

  const filteredLogs = logs.filter((l) => {
    if (filterType === "FollowupNeeded") return l.followupRequired && !l.followupCompleted;
    if (filterType === "Completed") return l.followupCompleted;
    return true;
  });

  const handleExportCsv = () => {
    if (!logs.length) return toast.error("No activity logs to export");
    exportToCsv("outreach_activity_log_export", logs);
    toast.success(`Exported ${logs.length} activity records to CSV`);
  };

  return (
    <AppLayout activePath="/activity-log">
      <div className="page-wrap">
        {/* Page Heading */}
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              <span className="live-dot" />
              <span>Contact Log • 15 Columns</span>
            </div>
            <h1>
              Outreach & <span>Activity Log</span>
            </h1>
            <p className="page-subtitle">
              Append-only audit trail of every partner conversation, meeting outcome, pitch deck delivery, and follow-up deadline.
            </p>
          </div>

          <div className="heading-actions">
            <button
              onClick={handleExportCsv}
              className="secondary-button"
              title="Download full outreach history as CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                if (sponsors.length > 0) setSelectedSponsorId(sponsors[0].id);
                setShowAddModal(true);
              }}
              className="primary-button"
            >
              <Plus size={14} />
              <span>Log Outreach</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="panel p-4 mb-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by company, representative, or keywords in summary..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-600"
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

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium">Follow-up Filter:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-xs outline-none"
            >
              <option value="All">All Outreach Entries</option>
              <option value="FollowupNeeded">Pending Action Items</option>
              <option value="Completed">Completed Follow-ups</option>
            </select>
          </div>
        </div>

        {/* Activity Table Panel */}
        <div className="panel overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center text-xs text-gray-400">
              Loading activity logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-20 text-center text-xs text-gray-400">
              No outreach entries found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-mono uppercase text-[10px] border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Contact & Method</th>
                    <th className="py-3 px-4 min-w-[280px]">Summary & Outcome</th>
                    <th className="py-3 px-4">Follow-up Action</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-gray-500 font-semibold whitespace-nowrap">
                        {new Date(l.logDate).toLocaleDateString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {l.companyName}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-gray-900 font-medium block">
                          {l.contactName || "Team Representative"}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 font-mono inline-block mt-0.5">
                          {l.contactMethod}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-gray-800 leading-relaxed font-medium">
                          {l.interactionSummary}
                        </p>
                        {l.responseResult && (
                          <p className="text-[11px] text-gray-500 mt-1">
                            <strong className="text-gray-700">Response:</strong> {l.responseResult}
                          </p>
                        )}
                        {l.attachmentUrl && (
                          <a
                            href={l.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-1"
                          >
                            <Paperclip size={10} /> View Deck / Notes
                          </a>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {l.followupRequired ? (
                          <div className="space-y-0.5">
                            <span className="text-amber-700 font-semibold text-[11px] flex items-center gap-1">
                              <Clock size={11} /> {l.nextFollowupDate ? new Date(l.nextFollowupDate).toLocaleDateString("en-IN") : "Needed"}
                            </span>
                            {l.followupAction && (
                              <span className="text-[11px] text-gray-500 block truncate max-w-[160px]">
                                {l.followupAction}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px]">None</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {l.followupRequired ? (
                          <button
                            onClick={() => toggleMutation.mutate({ id: l.id })}
                            disabled={toggleMutation.isPending}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer transition-all ${
                              l.followupCompleted
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                            }`}
                          >
                            <CheckCircle2 size={12} className={l.followupCompleted ? "text-green-600" : "text-amber-600"} />
                            <span>{l.followupCompleted ? "Done" : "Mark Done"}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditLog(l)}
                            className="px-2.5 py-1 rounded bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 text-[11px] font-semibold transition-colors flex items-center gap-1"
                            title="Edit log entry"
                          >
                            <Pencil size={11} /> Edit
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                if (confirm("Delete this outreach entry?")) {
                                  deleteMutation.mutate({ id: l.id });
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100 transition-colors"
                              title="Delete log"
                            >
                              <Trash2 size={14} />
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

        {/* Modal: Add Outreach Log (15 Columns) */}
        {showAddModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare size={18} className="text-blue-600" />
                  Log Outreach Interaction
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Organization Selection */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Organization / Sponsor *
                  </label>
                  <select
                    value={selectedSponsorId}
                    onChange={(e) => setSelectedSponsorId(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none font-semibold text-gray-900"
                  >
                    {sponsors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.companyName} ({s.displayId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Contact Person Spoken With
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Kumar"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Date of Interaction *
                    </label>
                    <input
                      type="date"
                      required
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Contact Method
                  </label>
                  <select
                    value={contactMethod}
                    onChange={(e) => setContactMethod(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                  >
                    <option>Email</option>
                    <option>Phone Call</option>
                    <option>Video Call</option>
                    <option>In-Person Meeting</option>
                    <option>LinkedIn</option>
                    <option>WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Interaction Summary & Key Discussion Points *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Summarize the pitch, queries raised by the sponsor, attendance metrics discussed..."
                    value={interactionSummary}
                    onChange={(e) => setInteractionSummary(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Response / Reaction / Agreed Next Step
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Requested formal MoU draft and customized workshop pricing"
                    value={responseResult}
                    onChange={(e) => setResponseResult(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                  />
                </div>

                {/* Follow-up Section */}
                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={followupRequired}
                      onChange={(e) => setFollowupRequired(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span className="font-semibold text-amber-900">
                      Does this interaction require an active follow-up?
                    </span>
                  </label>

                  {followupRequired && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block font-semibold text-amber-900 mb-1">
                          Deadline / Follow-up Date
                        </label>
                        <input
                          type="date"
                          value={nextFollowupDate}
                          onChange={(e) => setNextFollowupDate(e.target.value)}
                          className="w-full border border-amber-300 rounded-lg p-2 outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-amber-900 mb-1">
                          Action Required
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Send finalized invoice"
                          value={followupAction}
                          onChange={(e) => setFollowupAction(e.target.value)}
                          className="w-full border border-amber-300 rounded-lg p-2 outline-none bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Attachment URL (Google Drive MoU, Pitch Deck Link)
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
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
                    if (!interactionSummary.trim()) {
                      return toast.error("Interaction summary is required");
                    }
                    createMutation.mutate({
                      sponsorId: selectedSponsorId,
                      companyName: sponsors.find((s) => s.id === selectedSponsorId)?.companyName,
                      contactName: contactName.trim() || undefined,
                      logDate,
                      contactMethod,
                      interactionSummary: interactionSummary.trim(),
                      responseResult: responseResult.trim() || undefined,
                      followupRequired,
                      nextFollowupDate: nextFollowupDate || null,
                      followupAction: followupAction.trim() || undefined,
                      attachmentUrl: attachmentUrl.trim() || undefined,
                    });
                  }}
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800"
                >
                  {createMutation.isPending ? "Logging..." : "Log Interaction"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Outreach Log */}
        {editingLog && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Pencil size={18} className="text-blue-600" />
                  Edit Outreach Log
                </h3>
                <button
                  onClick={() => { setEditingLog(null); resetForm(); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Date of Interaction</label>
                    <input
                      type="date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Method</label>
                  <select
                    value={contactMethod}
                    onChange={(e) => setContactMethod(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                  >
                    <option>Email</option>
                    <option>Phone Call</option>
                    <option>Video Call</option>
                    <option>In-Person Meeting</option>
                    <option>LinkedIn</option>
                    <option>WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Interaction Summary *</label>
                  <textarea
                    rows={3}
                    required
                    value={interactionSummary}
                    onChange={(e) => setInteractionSummary(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Response / Result</label>
                  <input
                    type="text"
                    value={responseResult}
                    onChange={(e) => setResponseResult(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                  />
                </div>

                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={followupRequired}
                      onChange={(e) => setFollowupRequired(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span className="font-semibold text-amber-900">Follow-up required?</span>
                  </label>

                  {followupRequired && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block font-semibold text-amber-900 mb-1">Follow-up Date</label>
                        <input
                          type="date"
                          value={nextFollowupDate}
                          onChange={(e) => setNextFollowupDate(e.target.value)}
                          className="w-full border border-amber-300 rounded-lg p-2 outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-amber-900 mb-1">Action Required</label>
                        <input
                          type="text"
                          value={followupAction}
                          onChange={(e) => setFollowupAction(e.target.value)}
                          className="w-full border border-amber-300 rounded-lg p-2 outline-none bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Attachment URL</label>
                  <input
                    type="url"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => { setEditingLog(null); resetForm(); }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!interactionSummary.trim()) {
                      return toast.error("Interaction summary is required");
                    }
                    updateMutation.mutate({
                      id: editingLog.id,
                      data: {
                        contactName: contactName.trim() || undefined,
                        logDate,
                        contactMethod,
                        interactionSummary: interactionSummary.trim(),
                        responseResult: responseResult.trim() || undefined,
                        followupRequired,
                        nextFollowupDate: nextFollowupDate || null,
                        followupAction: followupAction.trim() || undefined,
                        attachmentUrl: attachmentUrl.trim() || undefined,
                      },
                    });
                  }}
                  disabled={updateMutation.isPending}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}