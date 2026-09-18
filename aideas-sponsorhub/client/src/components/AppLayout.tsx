import { ReactNode, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  Clock3,
  DollarSign,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { GlobalSearchDialog } from "./GlobalSearchDialog";
import { UserProfileModal } from "./UserProfileModal";
import { toast } from "sonner";

interface AppLayoutProps {
  children: ReactNode;
  activePath?: string;
  onOpenSponsorDetail?: (id: number) => void;
}

export function AppLayout({
  children,
  activePath,
  onOpenSponsorDetail,
}: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const currentPath = activePath || location;
  const isAdmin = user?.role === "admin";

  const navItems = [
    { label: "Overview", path: "/", icon: LayoutDashboard },
    { label: "Sponsor Pipeline", path: "/sponsor-pipeline", icon: BriefcaseBusiness },
    { label: "Contacts Directory", path: "/contacts", icon: Users },
    { label: "Outreach & Activity", path: "/activity-log", icon: CalendarDays },
    { label: "Deals & Agreements", path: "/offers", icon: DollarSign },
    ...(isAdmin ? [{ label: "Team & Permissions", path: "/team", icon: ShieldCheck }] : []),
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      setLocation("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="app-shell">
      {/* GLOBAL SEARCH DIALOG */}
      <GlobalSearchDialog
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
        onSelectSponsor={(id) => {
          if (onOpenSponsorDetail) {
            onOpenSponsorDetail(id);
          } else {
            setLocation("/sponsor-pipeline");
          }
        }}
      />

      {/* USER PROFILE & EDIT HISTORY MODAL */}
      <UserProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar hidden md:flex">
        {/* Brand Header */}
        <div className="brand-row">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-gray-200/90 shadow-xs flex items-center justify-center p-0.5 shrink-0">
            <img
              src="/aIDEAS.jpg"
              alt="aIDEAS Logo"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div>
            <strong>SponsorHub CRM</strong>
            <small>aIDEAS Club</small>
          </div>
        </div>

        {/* Workspace Switcher */}
        <div className="workspace-switcher">
          <div className="workspace-avatar overflow-hidden bg-white border border-gray-200">
            <img
              src="/aIDEAS.jpg"
              alt="aIDEAS"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span>Sponsorship & PR</span>
            <small>aIDEAS Main Workspace</small>
          </div>
        </div>

        {/* Nav Label */}
        <div className="nav-label">Core Modules</div>

        {/* Nav Links */}
        <nav className="main-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />

        {/* Security & Access Info Card */}
        <div className="sidebar-note">
          <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong>Private Team Space</strong>
            <p>Role-governed records for aIDEAS Club committee members.</p>
          </div>
        </div>

        {/* Profile Card & Logout */}
        <div className="profile-card">
          <div
            onClick={() => setProfileModalOpen(true)}
            className="profile-avatar cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
            title="Click to view profile & edit history"
          >
            {user?.name
              ? user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .substring(0, 2)
              : "AK"}
          </div>
          <div
            onClick={() => setProfileModalOpen(true)}
            className="min-w-0 cursor-pointer"
            title="Click to view profile & edit history"
          >
            <div className="flex items-center gap-1.5">
              <strong className="truncate hover:text-blue-600 transition-colors">
                {user?.name || "Aarav Kapoor"}
              </strong>
            </div>
            <span className="flex items-center gap-1">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  isAdmin ? "bg-purple-600" : "bg-blue-600"
                }`}
              />
              {isAdmin ? "Admin (Lead)" : "Team Member"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER & DRAWER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 font-bold text-sm">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-gray-200 flex items-center justify-center p-0.5 shrink-0">
            <img
              src="/aIDEAS.jpg"
              alt="aIDEAS Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span>SponsorHub CRM</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchDialogOpen(true)}
            className="p-2 text-gray-600"
          >
            <Search size={18} />
          </button>
          <button
            onClick={() => setProfileModalOpen(true)}
            className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs grid place-items-center"
            title="User profile"
          >
            {user?.name ? user.name[0] : "U"}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white pt-16 p-4 flex flex-col justify-between animate-in fade-in duration-150">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium ${
                    isActive ? "bg-gray-100 text-gray-900 font-bold" : "text-gray-600"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
            <div
              onClick={() => {
                setMobileMenuOpen(false);
                setProfileModalOpen(true);
              }}
              className="cursor-pointer"
            >
              <strong className="text-sm block">{user?.name}</strong>
              <small className="text-gray-500">
                {user?.role === "admin" ? "Lead / Admin" : "Member"} • View History
              </small>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-1"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="main-content md:pt-0 pt-14 flex flex-col">
        {/* Topbar */}
        <header className="topbar">
          <div className="breadcrumbs">
            <span>SponsorHub</span>
            <span className="text-gray-300">/</span>
            <strong>{navItems.find((n) => n.path === currentPath)?.label || "Overview"}</strong>
          </div>

          <div className="top-actions">
            {/* Interactive Search Bar */}
            <div
              onClick={() => setSearchDialogOpen(true)}
              className="global-search cursor-pointer hover:border-gray-400 transition-colors"
              title="Click or press Cmd+K to search"
            >
              <Search size={14} />
              <span className="text-xs text-gray-400 flex-1">Quick search records...</span>
              <kbd className="text-[10px]">⌘K</kbd>
            </div>

            {/* Role Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isAdmin
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {isAdmin ? <ShieldCheck size={14} /> : <Users size={14} />}
              <span>{isAdmin ? "Admin (Lead)" : "PR Team"}</span>
            </div>

            {/* Profile Avatar with click-to-view history modal */}
            <div
              onClick={() => setProfileModalOpen(true)}
              className="top-avatar cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
              title={`Click to view profile & edit history: ${user?.name || "User"} (${user?.email})`}
            >
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2)
                : "AK"}
            </div>
          </div>
        </header>

        {/* Page Children */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
