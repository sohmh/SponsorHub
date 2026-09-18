import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { exportToCsv } from "@/lib/exportCsv";
import { trpc } from "@/lib/trpc";
import {
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  Pencil,
  Plus,
  Receipt,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function Offers() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  const [search, setSearch] = useState("");
  const [agreementStatusFilter, setAgreementStatusFilter] = useState<string>("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);

  // Form State (23 Columns)
  const [selectedSponsorId, setSelectedSponsorId] = useState<number>(1);
  const [eventInitiative, setEventInitiative] = useState("Annual Hackathon 2026");
  const [offerType, setOfferType] = useState("Gold Partner Tier");
  const [offerDescription, setOfferDescription] = useState("");
  const [cashValue, setCashValue] = useState("50000");
  const [inKindValue, setInKindValue] = useState("25000");
  const [offerDate, setOfferDate] = useState(new Date().toISOString().split("T")[0]);
  const [decisionStatus, setDecisionStatus] = useState("Under Review");
  const [agreementStatus, setAgreementStatus] = useState("Drafting");
  const [agreementLink, setAgreementLink] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [amountReceived, setAmountReceived] = useState("0");
  const [deliverablesPromised, setDeliverablesPromised] = useState("");
  const [clubDeliverables, setClubDeliverables] = useState("");
  const [activationDeadline, setActivationDeadline] = useState("");
  const [notes, setNotes] = useState("");

  // Live Queries
  const { data: offers = [], isLoading } = trpc.offersAgreements.list.useQuery({
    search: search.trim() || undefined,
  });
  const { data: sponsors = [] } = trpc.sponsors.list.useQuery();

  // Create Mutation
  const createMutation = trpc.offersAgreements.create.useMutation({
    onSuccess: () => {
      toast.success("Deal / Sponsorship agreement created");
      utils.offersAgreements.list.invalidate();
      utils.sponsors.kpis.invalidate();
      setShowAddModal(false);
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  // Update Mutation
  const updateMutation = trpc.offersAgreements.update.useMutation({
    onSuccess: () => {
      toast.success("Deal record updated");
      utils.offersAgreements.list.invalidate();
      utils.sponsors.kpis.invalidate();
      setEditingOffer(null);
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  // Delete Mutation
  const deleteMutation = trpc.offersAgreements.delete.useMutation({
    onSuccess: () => {
      toast.success("Deal record deleted");
      utils.offersAgreements.list.invalidate();
      utils.sponsors.kpis.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const resetForm = () => {
    setEventInitiative("Annual Hackathon 2026");
    setOfferType("Gold Partner Tier");
    setOfferDescription("");
    setCashValue("50000");
    setInKindValue("25000");
    setOfferDate(new Date().toISOString().split("T")[0]);
    setDecisionStatus("Under Review");
    setAgreementStatus("Drafting");
    setAgreementLink("");
    setInvoiceNumber("");
    setInvoiceDate("");
    setPaymentStatus("Pending");
    setAmountReceived("0");
    setDeliverablesPromised("");
    setClubDeliverables("");
    setActivationDeadline("");
    setNotes("");
  };

  const openEditOffer = (o: any) => {
    setEditingOffer(o);
    setSelectedSponsorId(o.sponsorId || 1);
    setEventInitiative(o.eventInitiative || "");
    setOfferType(o.offerType || "");
    setOfferDescription(o.offerDescription || "");
    setCashValue(String(o.cashValue || "0"));
    setInKindValue(String(o.inKindValue || "0"));
    setOfferDate(o.offerDate ? o.offerDate.split("T")[0] : new Date().toISOString().split("T")[0]);
    setDecisionStatus(o.decisionStatus || "Under Review");
    setAgreementStatus(o.agreementStatus || "Drafting");
    setAgreementLink(o.agreementLink || "");
    setInvoiceNumber(o.invoiceNumber || "");
    setInvoiceDate(o.invoiceDate ? o.invoiceDate.split("T")[0] : "");
    setPaymentStatus(o.paymentStatus || "Pending");
    setAmountReceived(String(o.amountReceived || "0"));
    setDeliverablesPromised(o.deliverablesPromised || "");
    setClubDeliverables(o.clubDeliverables || "");
    setActivationDeadline(o.activationDeadline ? o.activationDeadline.split("T")[0] : "");
    setNotes(o.notes || "");
  };

  const filteredOffers = offers.filter((o) => {
    if (agreementStatusFilter !== "All" && o.agreementStatus !== agreementStatusFilter) {
      return false;
    }
    return true;
  });

  // Aggregate Metrics
  const totalValueSum = filteredOffers.reduce((sum, o) => sum + parseFloat(o.totalValue || "0"), 0);
  const totalCashSum = filteredOffers.reduce((sum, o) => sum + parseFloat(o.cashValue || "0"), 0);
  const totalInKindSum = filteredOffers.reduce((sum, o) => sum + parseFloat(o.inKindValue || "0"), 0);
  const totalReceivedSum = filteredOffers.reduce((sum, o) => sum + parseFloat(o.amountReceived || "0"), 0);

  const handleExportCsv = () => {
    if (!offers.length) return toast.error("No offers to export");
    exportToCsv("offers_and_agreements_export", offers);
    toast.success(`Exported ${offers.length} commercial agreements to CSV`);
  };

  return (
    <AppLayout activePath="/offers">
      <div className="page-wrap">
        {/* Page Heading */}
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              <span className="live-dot" />
              <span>Offers & Agreements • 23 Columns</span>
            </div>
            <h1>
              Commercial <span>Deals & MoUs</span>
            </h1>
            <p className="page-subtitle">
              Sponsorship tiers, cash grants, in-kind compute/vouchers, invoice tracking, and executed contracts.
            </p>
          </div>

          <div className="heading-actions">
            <button
              onClick={handleExportCsv}
              className="secondary-button"
              title="Download entire agreement ledger as CSV"
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
              <span>New Deal / Agreement</span>
            </button>
          </div>
        </div>

        {/* FINANCIAL SUMMARY KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-mono uppercase text-gray-400 block tracking-wider">
              Total Deal Value
            </span>
            <span className="text-xl font-bold text-gray-900 mt-1 block">
              ₹{totalValueSum.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-gray-500">
              Across {filteredOffers.length} registered proposals
            </span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-mono uppercase text-gray-400 block tracking-wider">
              Cash Sponsorship
            </span>
            <span className="text-xl font-bold text-blue-600 mt-1 block">
              ₹{totalCashSum.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-blue-600 font-medium">
              Direct monetary contributions
            </span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-mono uppercase text-gray-400 block tracking-wider">
              In-Kind (Compute / Tools)
            </span>
            <span className="text-xl font-bold text-purple-600 mt-1 block">
              ₹{totalInKindSum.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-purple-600 font-medium">
              Vouchers, licenses & hardware
            </span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-mono uppercase text-gray-400 block tracking-wider">
              Amount Received
            </span>
            <span className="text-xl font-bold text-green-600 mt-1 block">
              ₹{totalReceivedSum.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-green-700 font-medium">
              Deposited or activated
            </span>
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
              placeholder="Search by company, tier, event, invoice number..."
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
            <span className="text-gray-500 font-medium">Agreement Status:</span>
            <select
              value={agreementStatusFilter}
              onChange={(e) => setAgreementStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-xs outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Drafting">Drafting</option>
              <option value="Under Review">Under Review</option>
              <option value="MoU Pending">MoU Pending</option>
              <option value="Signed">Signed</option>
            </select>
          </div>
        </div>

        {/* Offers Table */}
        <div className="panel overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center text-xs text-gray-400">
              Loading commercial agreements...
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="py-20 text-center text-xs text-gray-400">
              No agreements found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-mono uppercase text-[10px] border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Event & Tier</th>
                    <th className="py-3 px-4">Cash (₹)</th>
                    <th className="py-3 px-4">In-Kind (₹)</th>
                    <th className="py-3 px-4">Total Value</th>
                    <th className="py-3 px-4">Agreement Status</th>
                    <th className="py-3 px-4">Invoice & Payment</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOffers.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <strong className="text-gray-900 font-bold block">
                          {o.companyName}
                        </strong>
                        <span className="text-[10px] text-gray-400 font-mono">
                          Date: {o.offerDate ? new Date(o.offerDate).toLocaleDateString("en-IN") : "N/A"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-800 block">
                          {o.offerType}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {o.eventInitiative}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-gray-700">
                        ₹{Number(o.cashValue || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-gray-700">
                        ₹{Number(o.inKindValue || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 font-mono block">
                          ₹{Number(o.totalValue || 0).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Rec'd: ₹{Number(o.amountReceived || 0).toLocaleString("en-IN")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            o.agreementStatus === "Signed"
                              ? "bg-green-100 text-green-800"
                              : o.agreementStatus === "MoU Pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {o.agreementStatus}
                        </span>
                        {o.agreementLink && (
                          <a
                            href={o.agreementLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 mt-0.5"
                          >
                            <FileCheck size={10} /> View MoU
                          </a>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] text-gray-700 block">
                          {o.invoiceNumber || "No Invoice"}
                        </span>
                        <span
                          className={`text-[10px] font-medium ${
                            o.paymentStatus === "Completed"
                              ? "text-green-700"
                              : "text-amber-700"
                          }`}
                        >
                          Payment: {o.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditOffer(o)}
                            className="px-2.5 py-1 rounded bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 text-[11px] font-semibold transition-colors flex items-center gap-1"
                            title="Edit deal"
                          >
                            <Pencil size={11} /> Edit
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete deal for "${o.companyName}"?`)) {
                                  deleteMutation.mutate({ id: o.id });
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100 transition-colors"
                              title="Delete offer"
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

        {/* Modal: Add Deal / Agreement (23 Columns) */}
        {showAddModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard size={18} className="text-blue-600" />
                  Draft New Commercial Offer / Agreement
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
                      Event / Initiative *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Annual Hackathon 2026"
                      value={eventInitiative}
                      onChange={(e) => setEventInitiative(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Offer Type / Tier *
                    </label>
                    <select
                      value={offerType}
                      onChange={(e) => setOfferType(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    >
                      <option>Title Sponsor Tier</option>
                      <option>Platinum Tier</option>
                      <option>Gold Partner Tier</option>
                      <option>Silver Tier</option>
                      <option>Cloud Compute Partner</option>
                      <option>Tool / License Partner</option>
                      <option>Prize Track Sponsor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Cash Sponsorship Value (₹)
                    </label>
                    <input
                      type="number"
                      value={cashValue}
                      onChange={(e) => setCashValue(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      In-Kind Value (Vouchers, Tools) (₹)
                    </label>
                    <input
                      type="number"
                      value={inKindValue}
                      onChange={(e) => setInKindValue(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                {/* Live Auto Total Calculation */}
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs font-bold text-blue-900">
                  <span>Computed Total Deal Value:</span>
                  <span className="text-sm">
                    ₹{(parseFloat(cashValue || "0") + parseFloat(inKindValue || "0")).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Agreement Status
                    </label>
                    <select
                      value={agreementStatus}
                      onChange={(e) => setAgreementStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    >
                      <option>Drafting</option>
                      <option>Under Review</option>
                      <option>MoU Pending</option>
                      <option>Signed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    >
                      <option>Pending</option>
                      <option>Partially Received</option>
                      <option>Completed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. INV-2026-003"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Amount Received (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Agreement / Signed MoU Document Link (Google Drive / DocuSign)
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={agreementLink}
                    onChange={(e) => setAgreementLink(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Deliverables Promised by Club
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Logo on all banners, 3 judging slots, student resume book access..."
                    value={clubDeliverables}
                    onChange={(e) => setClubDeliverables(e.target.value)}
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
                    if (!eventInitiative.trim()) {
                      return toast.error("Event name is required");
                    }
                    createMutation.mutate({
                      sponsorId: selectedSponsorId,
                      companyName: sponsors.find((s) => s.id === selectedSponsorId)?.companyName,
                      eventInitiative: eventInitiative.trim(),
                      offerType,
                      cashValue,
                      inKindValue,
                      offerDate,
                      decisionStatus,
                      agreementStatus,
                      agreementLink: agreementLink.trim() || undefined,
                      invoiceNumber: invoiceNumber.trim() || undefined,
                      paymentStatus,
                      amountReceived,
                      clubDeliverables: clubDeliverables.trim() || undefined,
                      deliverablesPromised: deliverablesPromised.trim() || undefined,
                    });
                  }}
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800"
                >
                  {createMutation.isPending ? "Creating..." : "Save Agreement"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Deal / Agreement */}
        {editingOffer && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Pencil size={18} className="text-blue-600" />
                  Edit Deal — {editingOffer.companyName}
                </h3>
                <button
                  onClick={() => { setEditingOffer(null); resetForm(); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Event / Initiative *</label>
                    <input
                      type="text"
                      required
                      value={eventInitiative}
                      onChange={(e) => setEventInitiative(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Offer Tier / Type *</label>
                    <input
                      type="text"
                      required
                      value={offerType}
                      onChange={(e) => setOfferType(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Cash Value (₹)</label>
                    <input
                      type="number"
                      value={cashValue}
                      onChange={(e) => setCashValue(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">In-Kind Value (₹)</label>
                    <input
                      type="number"
                      value={inKindValue}
                      onChange={(e) => setInKindValue(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Offer Date</label>
                    <input
                      type="date"
                      value={offerDate}
                      onChange={(e) => setOfferDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Agreement Status</label>
                    <select
                      value={agreementStatus}
                      onChange={(e) => setAgreementStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    >
                      <option>Drafting</option>
                      <option>Under Review</option>
                      <option>MoU Pending</option>
                      <option>Signed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Payment Status</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    >
                      <option>Pending</option>
                      <option>Partial</option>
                      <option>Completed</option>
                      <option>Refunded</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Invoice Number</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Amount Received (₹)</label>
                    <input
                      type="number"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Agreement / MoU Link</label>
                  <input
                    type="url"
                    value={agreementLink}
                    onChange={(e) => setAgreementLink(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Deliverables Promised to Sponsor</label>
                  <textarea
                    rows={2}
                    value={deliverablesPromised}
                    onChange={(e) => setDeliverablesPromised(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Internal Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => { setEditingOffer(null); resetForm(); }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!eventInitiative.trim() || !offerType.trim()) {
                      return toast.error("Event name and offer type are required");
                    }
                    updateMutation.mutate({
                      id: editingOffer.id,
                      data: {
                        eventInitiative: eventInitiative.trim(),
                        offerType: offerType.trim(),
                        offerDescription: offerDescription.trim() || undefined,
                        cashValue,
                        inKindValue,
                        offerDate,
                        decisionStatus,
                        agreementStatus,
                        agreementLink: agreementLink.trim() || undefined,
                        invoiceNumber: invoiceNumber.trim() || undefined,
                        paymentStatus,
                        amountReceived,
                        deliverablesPromised: deliverablesPromised.trim() || undefined,
                        clubDeliverables: clubDeliverables.trim() || undefined,
                        notes: notes.trim() || undefined,
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