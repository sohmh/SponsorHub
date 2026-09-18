import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  FileCheck,
  FileText,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Send,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface SponsorDetailDrawerProps {
  sponsorId: number | null;
  open: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export function SponsorDetailDrawer({
  sponsorId,
  open,
  onClose,
  isAdmin = false,
}: SponsorDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "contacts" | "logs" | "offers">("overview");

  // Sub-modals for adding related entities
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);
  const [showAddOffer, setShowAddOffer] = useState(false);

  // New Contact form state
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isDecisionMaker, setIsDecisionMaker] = useState(false);

  // New Log form state
  const [logMethod, setLogMethod] = useState("Email");
  const [logSummary, setLogSummary] = useState("");
  const [logResult, setLogResult] = useState("");
  const [logFollowupReq, setLogFollowupReq] = useState(false);
  const [logFollowupDate, setLogFollowupDate] = useState("");

  // New Offer form state
  const [offerEvent, setOfferEvent] = useState("");
  const [offerType, setOfferType] = useState("Gold Tier");
  const [cashValue, setCashValue] = useState("0");
  const [inKindValue, setInKindValue] = useState("0");
  const [agreementStatus, setAgreementStatus] = useState("Drafting");

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.sponsors.getById.useQuery(
    { id: sponsorId! },
    { enabled: Boolean(sponsorId && open) }
  );

  const deleteSponsorMutation = trpc.sponsors.delete.useMutation({
    onSuccess: () => {
      toast.success("Sponsor deleted successfully");
      utils.sponsors.list.invalidate();
      utils.sponsors.kpis.invalidate();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const createContactMutation = trpc.contacts.create.useMutation({
    onSuccess: () => {
      toast.success("Contact added");
      utils.sponsors.getById.invalidate({ id: sponsorId! });
      utils.contacts.list.invalidate();
      setShowAddContact(false);
      setContactName("");
      setContactRole("");
      setContactEmail("");
      setContactPhone("");
      setIsDecisionMaker(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const createLogMutation = trpc.contactLog.create.useMutation({
    onSuccess: () => {
      toast.success("Interaction logged");
      utils.sponsors.getById.invalidate({ id: sponsorId! });
      utils.contactLog.list.invalidate();
      utils.sponsors.list.invalidate();
      setShowAddLog(false);
      setLogSummary("");
      setLogResult("");
      setLogFollowupDate("");
      setLogFollowupReq(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const createOfferMutation = trpc.offersAgreements.create.useMutation({
    onSuccess: () => {
      toast.success("Deal / Offer created");
      utils.sponsors.getById.invalidate({ id: sponsorId! });
      utils.offersAgreements.list.invalidate();
      utils.sponsors.kpis.invalidate();
      setShowAddOffer(false);
      setOfferEvent("");
      setCashValue("0");
      setInKindValue("0");
    },
    onError: (err) => toast.error(err.message),
  });

  if (!open || !sponsorId) return null;

  const sponsor = data?.sponsor;
  const contacts = data?.contacts ?? [];
  const logs = data?.logs ?? [];
  const offers = data?.offers ?? [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/35 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-semibold">
                {sponsor?.displayId || "SP-..."}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  sponsor?.pipelineStatus === "Confirmed"
                    ? "bg-green-100 text-green-800"
                    : sponsor?.pipelineStatus === "Proposal"
                    ? "bg-purple-100 text-purple-800"
                    : sponsor?.pipelineStatus === "Meeting"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {sponsor?.pipelineStatus || "Loading..."}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium ${
                  sponsor?.priority === "High"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-gray-50 text-gray-600 border border-gray-200"
                }`}
              >
                {sponsor?.priority} Priority
              </span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              {sponsor?.companyName}
              {sponsor?.website && (
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-blue-600 inline-block transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              {sponsor?.sponsorType} • {sponsor?.industry} • {sponsor?.cityRegion || "India"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => {
                  if (confirm(`Delete sponsor "${sponsor?.companyName}" and all related data?`)) {
                    deleteSponsorMutation.mutate({ id: sponsorId });
                  }
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete sponsor"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 px-6 gap-6 bg-white text-xs font-semibold">
          {[
            { key: "overview", label: "Overview & Fields" },
            { key: "contacts", label: `Contacts (${contacts.length})` },
            { key: "logs", label: `Activity Log (${logs.length})` },
            { key: "offers", label: `Deals & Offers (${offers.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600 font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          {isLoading ? (
            <div className="py-20 text-center text-gray-400 text-xs">
              Loading sponsor details...
            </div>
          ) : !sponsor ? (
            <div className="py-20 text-center text-gray-400 text-xs">
              Sponsor record not found.
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Highlight Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-white border border-gray-200 rounded-xl">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                        Estimated Deal Value
                      </span>
                      <span className="text-xl font-bold text-gray-900 mt-1 block">
                        ₹{Number(sponsor.estimatedValue || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {sponsor.likelySupportType || "Cash / In-Kind"}
                      </span>
                    </div>

                    <div className="p-3.5 bg-white border border-gray-200 rounded-xl">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                        Next Follow-up
                      </span>
                      <span className="text-base font-semibold text-gray-800 mt-1 block flex items-center gap-1.5">
                        <Clock size={14} className="text-amber-600" />
                        {sponsor.nextFollowupDate
                          ? new Date(sponsor.nextFollowupDate).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "No date set"}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Method: {sponsor.bestContactMethod || "Email"}
                      </span>
                    </div>
                  </div>

                  {/* Strategic Fit & Pitch Information */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">
                      Partnership Strategy & Fit
                    </h3>

                    <div>
                      <span className="text-[11px] text-gray-400 font-medium">Primary Event / Initiative:</span>
                      <p className="text-xs text-gray-800 font-medium mt-0.5">
                        {sponsor.primaryEvent || "General Annual Partnership"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-gray-400 font-medium">Potential Fit & Value Proposition:</span>
                      <p className="text-xs text-gray-700 mt-0.5">
                        {sponsor.potentialFit || "Not specified."}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-gray-400 font-medium">What They Could Offer:</span>
                      <p className="text-xs text-gray-700 mt-0.5">
                        {sponsor.whatTheyCouldOffer || "Not specified."}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-gray-400 font-medium">Current Status / Response:</span>
                      <p className="text-xs text-gray-700 mt-0.5">
                        {sponsor.currentResponse || "Awaiting initial outreach."}
                      </p>
                    </div>
                  </div>

                  {/* Dates & Timeline */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">
                      Timeline & Status
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-gray-400 block">Proposal Sent?</span>
                        <span className="font-semibold text-gray-800 mt-0.5 inline-flex items-center gap-1">
                          {sponsor.proposalSent ? (
                            <>
                              <CheckCircle2 size={13} className="text-green-600" /> Yes
                            </>
                          ) : (
                            "No"
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-gray-400 block">Scheduled Meeting Date:</span>
                        <span className="font-medium text-gray-800 mt-0.5 block">
                          {sponsor.meetingDate
                            ? new Date(sponsor.meetingDate).toLocaleDateString("en-IN")
                            : "None"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-gray-400 block">Last Contact Date:</span>
                        <span className="font-medium text-gray-800 mt-0.5 block">
                          {sponsor.lastContactDate
                            ? new Date(sponsor.lastContactDate).toLocaleDateString("en-IN")
                            : "Never"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-gray-400 block">Created On:</span>
                        <span className="font-medium text-gray-800 mt-0.5 block">
                          {new Date(sponsor.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Internal Notes */}
                  {sponsor.notes && (
                    <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
                      <h4 className="text-[11px] font-bold text-amber-900 uppercase tracking-wider font-mono mb-1">
                        Internal Notes & Instructions
                      </h4>
                      <p className="text-xs text-amber-900 leading-relaxed whitespace-pre-wrap">
                        {sponsor.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CONTACTS */}
              {activeTab === "contacts" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">
                      Key stakeholders & points of contact at {sponsor.companyName}
                    </span>
                    <button
                      onClick={() => setShowAddContact(true)}
                      className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 flex items-center gap-1.5 transition-colors"
                    >
                      <Plus size={14} /> Add Contact
                    </button>
                  </div>

                  {contacts.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-xs">
                      No contacts recorded for this sponsor yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {contacts.map((c) => (
                        <div
                          key={c.id}
                          className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-gray-900">
                                {c.contactName}
                              </h4>
                              {c.isDecisionMaker && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold flex items-center gap-1">
                                  <UserCheck size={11} /> Decision Maker
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {c.roleDepartment || "Representative"}
                            </p>

                            <div className="flex flex-wrap gap-4 mt-2.5 text-xs text-gray-600">
                              {c.email && (
                                <a
                                  href={`mailto:${c.email}`}
                                  className="flex items-center gap-1 hover:text-blue-600"
                                >
                                  <Mail size={12} /> {c.email}
                                </a>
                              )}
                              {c.phone && (
                                <a
                                  href={`tel:${c.phone}`}
                                  className="flex items-center gap-1 hover:text-blue-600"
                                >
                                  <Phone size={12} /> {c.phone}
                                </a>
                              )}
                              {c.linkedinUrl && (
                                <a
                                  href={c.linkedinUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 text-blue-600 hover:underline"
                                >
                                  <ExternalLink size={12} /> LinkedIn
                                </a>
                              )}
                            </div>

                            {c.notes && (
                              <p className="text-[11px] text-gray-400 mt-2 italic">
                                "{c.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ACTIVITY LOG */}
              {activeTab === "logs" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">
                      Timeline of meetings, calls, and outreach history
                    </span>
                    <button
                      onClick={() => setShowAddLog(true)}
                      className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 flex items-center gap-1.5 transition-colors"
                    >
                      <Plus size={14} /> Log Outreach
                    </button>
                  </div>

                  {logs.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-xs">
                      No outreach activity recorded for this sponsor yet.
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-gray-200 ml-3 space-y-6 py-2">
                      {logs.map((log) => (
                        <div key={log.id} className="relative pl-6">
                          <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-gray-900">
                                {log.contactMethod} {log.contactName ? `with ${log.contactName}` : ""}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400">
                                {new Date(log.logDate).toLocaleDateString("en-IN")}
                              </span>
                            </div>

                            <p className="text-xs text-gray-700 leading-relaxed mt-1">
                              {log.interactionSummary}
                            </p>

                            {log.responseResult && (
                              <div className="mt-2 text-xs bg-gray-50 p-2 rounded-lg text-gray-600">
                                <strong className="text-gray-800">Result:</strong> {log.responseResult}
                              </div>
                            )}

                            {log.followupRequired && (
                              <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                                <span className="text-amber-700 font-medium flex items-center gap-1">
                                  <Clock size={12} /> Follow-up: {log.nextFollowupDate ? new Date(log.nextFollowupDate).toLocaleDateString("en-IN") : "Needed"}
                                </span>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                                    log.followupCompleted
                                      ? "bg-green-100 text-green-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {log.followupCompleted ? "Completed" : "Pending Action"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: OFFERS & AGREEMENTS */}
              {activeTab === "offers" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">
                      Commercial proposals, tiers, MoUs, and payments
                    </span>
                    <button
                      onClick={() => setShowAddOffer(true)}
                      className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 flex items-center gap-1.5 transition-colors"
                    >
                      <Plus size={14} /> New Deal / Offer
                    </button>
                  </div>

                  {offers.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-xs">
                      No offers or agreements drafted for this sponsor yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {offers.map((offer) => (
                        <div
                          key={offer.id}
                          className="bg-white border border-gray-200 rounded-xl p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-gray-900">
                                  {offer.offerType}
                                </h4>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                                  {offer.agreementStatus}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                  Payment: {offer.paymentStatus}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {offer.eventInitiative} • Offered: {offer.offerDate ? new Date(offer.offerDate).toLocaleDateString("en-IN") : "N/A"}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-base font-bold text-gray-900 block">
                                ₹{Number(offer.totalValue || 0).toLocaleString("en-IN")}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                Cash ₹{Number(offer.cashValue || 0).toLocaleString("en-IN")} + In-Kind ₹{Number(offer.inKindValue || 0).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>

                          {offer.offerDescription && (
                            <p className="text-xs text-gray-600">
                              {offer.offerDescription}
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 p-2.5 rounded-lg text-gray-600">
                            <div>
                              <strong className="text-gray-700">Invoice:</strong> {offer.invoiceNumber || "Not Invoiced"}
                            </div>
                            <div>
                              <strong className="text-gray-700">Received:</strong> ₹{Number(offer.amountReceived || 0).toLocaleString("en-IN")}
                            </div>
                          </div>

                          {offer.agreementLink && (
                            <div>
                              <a
                                href={offer.agreementLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                              >
                                <FileCheck size={12} /> View Executed Agreement / MoU
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal: Add Contact */}
        {showAddContact && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Add New Contact</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-blue-600"
                    placeholder="e.g. Rahul Sharma"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Role / Department</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-blue-600"
                    placeholder="e.g. University Relations Manager"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-blue-600"
                    placeholder="rahul@company.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-blue-600"
                    placeholder="+91 98765 43210"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isDecisionMaker}
                    onChange={(e) => setIsDecisionMaker(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Primary Decision Maker?</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setShowAddContact(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!contactName.trim()) return toast.error("Contact name required");
                    createContactMutation.mutate({
                      sponsorId: sponsorId!,
                      companyName: sponsor?.companyName,
                      contactName: contactName.trim(),
                      roleDepartment: contactRole.trim(),
                      email: contactEmail.trim(),
                      phone: contactPhone.trim(),
                      isDecisionMaker,
                    });
                  }}
                  disabled={createContactMutation.isPending}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                >
                  {createContactMutation.isPending ? "Saving..." : "Save Contact"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Log */}
        {showAddLog && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Log Interaction</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Contact Method</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                    value={logMethod}
                    onChange={(e) => setLogMethod(e.target.value)}
                  >
                    <option>Email</option>
                    <option>Phone Call</option>
                    <option>Video Call</option>
                    <option>LinkedIn</option>
                    <option>In-Person Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Interaction Summary *</label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                    placeholder="Briefly describe what was discussed..."
                    value={logSummary}
                    onChange={(e) => setLogSummary(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Response / Result</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                    placeholder="e.g. Requested official pitch deck"
                    value={logResult}
                    onChange={(e) => setLogResult(e.target.value)}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={logFollowupReq}
                    onChange={(e) => setLogFollowupReq(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Follow-up required?</span>
                </label>
                {logFollowupReq && (
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Follow-up Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                      value={logFollowupDate}
                      onChange={(e) => setLogFollowupDate(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setShowAddLog(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!logSummary.trim()) return toast.error("Summary required");
                    createLogMutation.mutate({
                      sponsorId: sponsorId!,
                      companyName: sponsor?.companyName,
                      contactMethod: logMethod,
                      interactionSummary: logSummary.trim(),
                      responseResult: logResult.trim(),
                      followupRequired: logFollowupReq,
                      nextFollowupDate: logFollowupDate || null,
                    });
                  }}
                  disabled={createLogMutation.isPending}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                >
                  {createLogMutation.isPending ? "Logging..." : "Log Activity"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Offer */}
        {showAddOffer && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-gray-900">New Deal / Offer</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Event / Initiative *</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                    placeholder="e.g. Annual Hackathon 2026"
                    value={offerEvent}
                    onChange={(e) => setOfferEvent(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Offer Tier / Type</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                    value={offerType}
                    onChange={(e) => setOfferType(e.target.value)}
                  >
                    <option>Title Sponsor Tier</option>
                    <option>Platinum Tier</option>
                    <option>Gold Tier</option>
                    <option>Silver Tier</option>
                    <option>Cloud Compute Partner</option>
                    <option>Tool / License Partner</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Cash Value (₹)</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                      value={cashValue}
                      onChange={(e) => setCashValue(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">In-Kind Value (₹)</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                      value={inKindValue}
                      onChange={(e) => setInKindValue(e.target.value)}
                    />
                  </div>
                </div>
                <div className="p-2 bg-blue-50/70 rounded-lg flex justify-between items-center text-xs text-blue-900 font-semibold">
                  <span>Total Calculated Value:</span>
                  <span>₹{(parseFloat(cashValue || "0") + parseFloat(inKindValue || "0")).toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Agreement Status</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                    value={agreementStatus}
                    onChange={(e) => setAgreementStatus(e.target.value)}
                  >
                    <option>Drafting</option>
                    <option>Under Review</option>
                    <option>MoU Pending</option>
                    <option>Signed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setShowAddOffer(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!offerEvent.trim()) return toast.error("Event name required");
                    createOfferMutation.mutate({
                      sponsorId: sponsorId!,
                      companyName: sponsor?.companyName,
                      eventInitiative: offerEvent.trim(),
                      offerType,
                      cashValue,
                      inKindValue,
                      agreementStatus,
                    });
                  }}
                  disabled={createOfferMutation.isPending}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                >
                  {createOfferMutation.isPending ? "Creating..." : "Create Deal"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
