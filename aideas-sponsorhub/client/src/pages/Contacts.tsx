import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { exportToCsv } from "@/lib/exportCsv";
import { trpc } from "@/lib/trpc";
import {
  BriefcaseBusiness,
  Building2,
  Download,
  ExternalLink,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function Contacts() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  const [search, setSearch] = useState("");
  const [decisionMakerFilter, setDecisionMakerFilter] = useState<"All" | "Yes" | "No">("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<any | null>(null);

  // Form Fields (14 columns)
  const [selectedSponsorId, setSelectedSponsorId] = useState<number>(1);
  const [contactName, setContactName] = useState("");
  const [roleDepartment, setRoleDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [preferredMethod, setPreferredMethod] = useState("Email");
  const [referralSource, setReferralSource] = useState("");
  const [isDecisionMaker, setIsDecisionMaker] = useState(false);
  const [contactStatus, setContactStatus] = useState("Active");
  const [notes, setNotes] = useState("");

  // Live Queries
  const { data: contacts = [], isLoading } = trpc.contacts.list.useQuery({
    search: search.trim() || undefined,
  });
  const { data: sponsors = [] } = trpc.sponsors.list.useQuery();

  // Create Mutation
  const createMutation = trpc.contacts.create.useMutation({
    onSuccess: (newContact) => {
      toast.success(`Added contact "${newContact.contactName}"`);
      utils.contacts.list.invalidate();
      setShowAddModal(false);
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  // Update Mutation
  const updateMutation = trpc.contacts.update.useMutation({
    onSuccess: (updated) => {
      toast.success(`Updated contact "${updated.contactName}"`);
      utils.contacts.list.invalidate();
      setEditingContact(null);
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  // Delete Mutation
  const deleteMutation = trpc.contacts.delete.useMutation({
    onSuccess: () => {
      toast.success("Contact deleted");
      utils.contacts.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const resetForm = () => {
    setContactName("");
    setRoleDepartment("");
    setEmail("");
    setPhone("");
    setLinkedinUrl("");
    setPreferredMethod("Email");
    setReferralSource("");
    setIsDecisionMaker(false);
    setContactStatus("Active");
    setNotes("");
  };

  const openEditModal = (c: any) => {
    setEditingContact(c);
    setSelectedSponsorId(c.sponsorId || 1);
    setContactName(c.contactName || "");
    setRoleDepartment(c.roleDepartment || "");
    setEmail(c.email || "");
    setPhone(c.phone || "");
    setLinkedinUrl(c.linkedinUrl || "");
    setPreferredMethod(c.preferredContactMethod || "Email");
    setReferralSource(c.referralSource || "");
    setIsDecisionMaker(c.isDecisionMaker || false);
    setContactStatus(c.contactStatus || "Active");
    setNotes(c.notes || "");
  };


  const filteredContacts = contacts.filter((c) => {
    if (decisionMakerFilter === "Yes") return c.isDecisionMaker;
    if (decisionMakerFilter === "No") return !c.isDecisionMaker;
    return true;
  });

  const handleExportCsv = () => {
    if (!contacts.length) return toast.error("No contacts to export");
    exportToCsv("contacts_directory_export", contacts);
    toast.success(`Exported ${contacts.length} contacts to CSV`);
  };

  return (
    <AppLayout activePath="/contacts">
      <div className="page-wrap">
        {/* Heading */}
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              <span className="live-dot" />
              <span>Contacts Directory • 14 Columns</span>
            </div>
            <h1>
              Corporate <span>Contacts</span>
            </h1>
            <p className="page-subtitle">
              Points of contact, campus recruitment officers, and decision-makers across partner organizations.
            </p>
          </div>

          <div className="heading-actions">
            <button
              onClick={handleExportCsv}
              className="secondary-button"
              title="Download contacts list as CSV"
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
              <span>Add Contact</span>
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
              placeholder="Search by contact name, company, email, role..."
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
            <span className="text-gray-500 font-medium">Decision Maker:</span>
            <select
              value={decisionMakerFilter}
              onChange={(e) => setDecisionMakerFilter(e.target.value as any)}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-xs outline-none"
            >
              <option value="All">All Contacts</option>
              <option value="Yes">Decision Makers Only</option>
              <option value="No">Non-Decision Makers</option>
            </select>
          </div>
        </div>

        {/* Table Panel */}
        <div className="panel overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center text-xs text-gray-400">
              Loading contacts...
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="py-20 text-center text-xs text-gray-400">
              No contacts found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-mono uppercase text-[10px] border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Role / Department</th>
                    <th className="py-3 px-4">Decision Maker</th>
                    <th className="py-3 px-4">Email & Phone</th>
                    <th className="py-3 px-4">Preferred Method</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredContacts.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold grid place-items-center text-xs shrink-0">
                            {c.contactName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <strong className="text-gray-900 font-semibold block">
                              {c.contactName}
                            </strong>
                            {c.linkedinUrl && (
                              <a
                                href={c.linkedinUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                              >
                                LinkedIn <ExternalLink size={9} />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {c.companyName}
                      </td>

                      <td className="py-3 px-4 text-gray-600">
                        {c.roleDepartment || "Representative"}
                      </td>

                      <td className="py-3 px-4">
                        {c.isDecisionMaker ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                            <UserCheck size={11} /> Decision Maker
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[10px]">No</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {c.email && (
                            <a
                              href={`mailto:${c.email}`}
                              className="text-gray-700 hover:text-blue-600 flex items-center gap-1"
                            >
                              <Mail size={11} /> {c.email}
                            </a>
                          )}
                          {c.phone && (
                            <a
                              href={`tel:${c.phone}`}
                              className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-[11px]"
                            >
                              <Phone size={10} /> {c.phone}
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-gray-600">
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-gray-100">
                          {c.preferredContactMethod || "Email"}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                          {c.contactStatus || "Active"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(c)}
                            className="px-2.5 py-1 rounded bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 text-[11px] font-semibold transition-colors flex items-center gap-1"
                            title="Edit contact"
                          >
                            <Pencil size={11} /> Edit
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete contact "${c.contactName}"?`)) {
                                  deleteMutation.mutate({ id: c.id });
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100 transition-colors"
                              title="Delete contact"
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

        {/* Modal: Add Contact (14 Columns) */}
        {showAddModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Users size={18} className="text-blue-600" />
                  Add New Contact Person
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
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Kumar"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Role / Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Director of Developer Relations"
                      value={roleDepartment}
                      onChange={(e) => setRoleDepartment(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Work Email
                    </label>
                    <input
                      type="email"
                      placeholder="rajesh@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Preferred Contact Method
                    </label>
                    <select
                      value={preferredMethod}
                      onChange={(e) => setPreferredMethod(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    >
                      <option>Email</option>
                      <option>Call</option>
                      <option>WhatsApp</option>
                      <option>LinkedIn</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Referral Source
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alumni Network, Cold Email"
                      value={referralSource}
                      onChange={(e) => setReferralSource(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Contact Status
                    </label>
                    <select
                      value={contactStatus}
                      onChange={(e) => setContactStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    >
                      <option>Active</option>
                      <option>Follow-up Needed</option>
                      <option>Left Organization</option>
                      <option>Unresponsive</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1 bg-amber-50/50 p-2 rounded-lg border border-amber-200">
                  <input
                    type="checkbox"
                    checked={isDecisionMaker}
                    onChange={(e) => setIsDecisionMaker(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="font-semibold text-amber-900">
                    Is this contact the primary Decision Maker for sponsorships?
                  </span>
                </label>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Internal Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Best times to reach, relationship notes..."
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
                    if (!contactName.trim()) {
                      return toast.error("Contact name is required");
                    }
                    createMutation.mutate({
                      sponsorId: selectedSponsorId,
                      companyName: sponsors.find((s) => s.id === selectedSponsorId)?.companyName,
                      contactName: contactName.trim(),
                      roleDepartment: roleDepartment.trim() || undefined,
                      email: email.trim() || undefined,
                      phone: phone.trim() || undefined,
                      linkedinUrl: linkedinUrl.trim() || undefined,
                      preferredContactMethod: preferredMethod,
                      referralSource: referralSource.trim() || undefined,
                      isDecisionMaker,
                      contactStatus,
                      notes: notes.trim() || undefined,
                    });
                  }}
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800"
                >
                  {createMutation.isPending ? "Adding..." : "Save Contact"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Contact */}
        {editingContact && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Pencil size={18} className="text-blue-600" />
                  Edit Contact — {editingContact.contactName}
                </h3>
                <button
                  onClick={() => { setEditingContact(null); resetForm(); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Role / Department</label>
                    <input
                      type="text"
                      value={roleDepartment}
                      onChange={(e) => setRoleDepartment(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Work Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">LinkedIn Profile URL</label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Preferred Contact Method</label>
                    <select
                      value={preferredMethod}
                      onChange={(e) => setPreferredMethod(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    >
                      <option>Email</option>
                      <option>Call</option>
                      <option>WhatsApp</option>
                      <option>LinkedIn</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Referral Source</label>
                    <input
                      type="text"
                      value={referralSource}
                      onChange={(e) => setReferralSource(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Contact Status</label>
                    <select
                      value={contactStatus}
                      onChange={(e) => setContactStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                    >
                      <option>Active</option>
                      <option>Follow-up Needed</option>
                      <option>Left Organization</option>
                      <option>Unresponsive</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1 bg-amber-50/50 p-2 rounded-lg border border-amber-200">
                  <input
                    type="checkbox"
                    checked={isDecisionMaker}
                    onChange={(e) => setIsDecisionMaker(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="font-semibold text-amber-900">
                    Is this contact the primary Decision Maker for sponsorships?
                  </span>
                </label>

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
                  onClick={() => { setEditingContact(null); resetForm(); }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!contactName.trim()) {
                      return toast.error("Contact name is required");
                    }
                    updateMutation.mutate({
                      id: editingContact.id,
                      data: {
                        contactName: contactName.trim(),
                        roleDepartment: roleDepartment.trim() || undefined,
                        email: email.trim() || undefined,
                        phone: phone.trim() || undefined,
                        linkedinUrl: linkedinUrl.trim() || undefined,
                        preferredContactMethod: preferredMethod,
                        referralSource: referralSource.trim() || undefined,
                        isDecisionMaker,
                        contactStatus,
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