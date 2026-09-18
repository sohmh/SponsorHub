import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  BriefcaseBusiness,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  History,
  LogOut,
  Mail,
  Shield,
  ShieldCheck,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function UserProfileModal({ open, onClose }: UserProfileModalProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: activities = [], isLoading } = trpc.auth.myActivity.useQuery(undefined, {
    enabled: open && Boolean(user),
  });

  if (!open || !user) return null;

  const isAdmin = user.role === "admin";

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      onClose();
      setLocation("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "Sponsor":
        return <Building2 size={13} className="text-blue-600" />;
      case "Contact":
        return <Users size={13} className="text-indigo-600" />;
      case "Outreach":
        return <Calendar size={13} className="text-amber-600" />;
      case "Deal":
        return <DollarSign size={13} className="text-green-600" />;
      default:
        return <History size={13} className="text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gray-50/70 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-xl grid place-items-center shadow-md">
              {user.name
                ? user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2)
                : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  {user.name}
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                    isAdmin
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {isAdmin ? <ShieldCheck size={11} /> : <User size={11} />}
                  {isAdmin ? "Admin (Lead)" : "PR Member"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                <Mail size={13} className="text-gray-400" />
                <span className="font-medium">{user.email}</span>
              </div>

              <span className="text-[11px] text-gray-400 block mt-0.5">
                aIDEAS Club • Sponsorship & PR Committee
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content: Edit & Activity History */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History size={16} className="text-blue-600" />
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">
                My Edit & Activity History ({activities.length})
              </h4>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">
              Chronological Audit Trail
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-gray-400">
              Loading recent changes...
            </div>
          ) : activities.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No recent edits logged for your profile yet.
            </div>
          ) : (
            <div className="relative border-l-2 border-gray-100 ml-2 space-y-4 py-1">
              {activities.map((act) => (
                <div key={act.id} className="relative pl-5">
                  <span
                    className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-xs ${
                      act.action === "Created"
                        ? "bg-green-500"
                        : act.action === "Updated"
                        ? "bg-blue-500"
                        : "bg-red-500"
                    }`}
                  />
                  <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-3 shadow-2xs hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded bg-white border border-gray-200 grid place-items-center">
                          {getEntityIcon(act.entityType)}
                        </span>
                        <strong className="text-xs font-semibold text-gray-900">
                          {act.entityTitle}
                        </strong>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                            act.action === "Created"
                              ? "bg-green-100 text-green-800"
                              : act.action === "Updated"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {act.action}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">
                        {new Date(act.timestamp).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        • {new Date(act.timestamp).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                      {act.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            Signed in as <strong className="text-gray-700">{user.email}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
