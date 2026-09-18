import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  CheckCircle2,
  Mail,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from "lucide-react";
import { toast } from "sonner";

export default function Team() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invite Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [title, setTitle] = useState("");

  const utils = trpc.useUtils();

  const { data: teamMembers = [], isLoading } = trpc.team.list.useQuery(undefined, {
    enabled: Boolean(user),
  });

  const inviteMutation = trpc.team.invite.useMutation({
    onSuccess: (newMember) => {
      toast.success(`Invited ${newMember.name} successfully!`);
      utils.team.list.invalidate();
      setShowInviteModal(false);
      setName("");
      setEmail("");
      setRole("user");
      setTitle("");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateRoleMutation = trpc.team.updateRole.useMutation({
    onSuccess: (updated) => {
      toast.success(`Updated role for ${updated.name}`);
      utils.team.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleActiveMutation = trpc.team.toggleActive.useMutation({
    onSuccess: (updated) => {
      toast.success(
        `${updated.name} has been ${updated.isActive ? "reactivated" : "deactivated"}`
      );
      utils.team.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <AppLayout activePath="/team">
      <div className="page-wrap">
        {/* Page Heading */}
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              <Shield size={12} className="text-purple-600" />
              <span>Administrative Control</span>
            </div>
            <h1>
              Team & <span>Permissions</span>
            </h1>
            <p className="page-subtitle">
              Manage Sponsorship & PR committee accounts, member roles, and active access status.
            </p>
          </div>

          {isAdmin && (
            <div className="heading-actions">
              <button
                onClick={() => setShowInviteModal(true)}
                className="primary-button"
              >
                <UserPlus size={15} />
                <span>Invite Member</span>
              </button>
            </div>
          )}
        </div>

        {!isAdmin ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-900 flex items-start gap-4">
            <AlertCircle size={24} className="shrink-0 text-amber-600" />
            <div>
              <h3 className="font-bold text-sm">Restricted Access</h3>
              <p className="text-xs mt-1 leading-relaxed">
                Only the Sponsorship & PR Lead (Admin) can invite new team members or modify account statuses. You currently have Member permissions.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Team Members Table Panel */}
            <div className="panel overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Active Committee Roster ({teamMembers.length})
                  </h2>
                  <p className="text-xs text-gray-500">
                    Team members with access to create sponsors, log interactions, and record deals.
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="py-16 text-center text-xs text-gray-400">
                  Loading team roster...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-mono uppercase text-[10px] border-b border-gray-100">
                      <tr>
                        <th className="py-3 px-4">Member Name</th>
                        <th className="py-3 px-4">Club Role / Title</th>
                        <th className="py-3 px-4">System Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Last Signed In</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {teamMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold grid place-items-center text-xs">
                                {member.avatarInitials}
                              </div>
                              <div>
                                <strong className="text-gray-900 block font-semibold">
                                  {member.name}
                                </strong>
                                <span className="text-gray-400 text-[11px] block">
                                  {member.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-gray-700 font-medium">
                            {member.title || "Outreach Associate"}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                                member.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {member.role === "admin" ? (
                                <>
                                  <ShieldCheck size={11} /> Admin (Lead)
                                </>
                              ) : (
                                <>
                                  <Users size={11} /> Member
                                </>
                              )}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                                member.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  member.isActive ? "bg-green-500" : "bg-red-500"
                                }`}
                              />
                              {member.isActive ? "Active" : "Deactivated"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                            {new Date(member.lastSignedIn).toLocaleDateString("en-IN")}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              {/* Toggle Role */}
                              <button
                                onClick={() =>
                                  updateRoleMutation.mutate({
                                    id: member.id,
                                    role: member.role === "admin" ? "user" : "admin",
                                  })
                                }
                                disabled={member.id === user?.id}
                                className="px-2.5 py-1 rounded border border-gray-200 text-[11px] font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {member.role === "admin" ? "Demote" : "Promote to Admin"}
                              </button>

                              {/* Toggle Active / Deactivate */}
                              <button
                                onClick={() => toggleActiveMutation.mutate({ id: member.id })}
                                disabled={member.id === user?.id}
                                className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                  member.isActive
                                    ? "border-red-200 text-red-700 hover:bg-red-50"
                                    : "border-green-200 text-green-700 hover:bg-green-50"
                                }`}
                              >
                                {member.isActive ? "Deactivate" : "Reactivate"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Invite Team Member */}
        {showInviteModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-gray-900">
                Invite New Committee Member
              </h3>
              <p className="text-xs text-gray-500">
                They will receive access to log into the Sponsorship CRM using their college email.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Verma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Club / College Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="rohan@club.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Club Role / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Outreach Associate"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    System Permission Level
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-600"
                  >
                    <option value="user">Member (Create & Edit Sponsors, Contacts, Logs)</option>
                    <option value="admin">Admin (Full Control, Deletions, Team Management)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!name.trim() || !email.trim()) {
                      return toast.error("Name and email are required");
                    }
                    inviteMutation.mutate({
                      name: name.trim(),
                      email: email.trim(),
                      role,
                      title: title.trim() || undefined,
                    });
                  }}
                  disabled={inviteMutation.isPending}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800"
                >
                  {inviteMutation.isPending ? "Inviting..." : "Send Invitation"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
