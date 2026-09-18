import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  BriefcaseBusiness,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Mail,
  Phone,
  Search,
  Users,
  X,
} from "lucide-react";
import { useLocation } from "wouter";

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSponsor?: (sponsorId: number) => void;
}

export function GlobalSearchDialog({
  open,
  onOpenChange,
  onSelectSponsor,
}: GlobalSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();

  // Keyboard shortcut Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const { data, isLoading } = trpc.search.global.useQuery(
    { query },
    { enabled: query.trim().length > 1 }
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-gray-100 gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            autoFocus
            type="text"
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-400 text-gray-800"
            placeholder="Search sponsors, contacts, interaction notes, offers... (Press Esc to exit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-100 rounded border border-gray-200">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {query.trim().length <= 1 ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              Type at least 2 characters to search across all CRM records...
            </div>
          ) : isLoading ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              Searching database...
            </div>
          ) : !data ||
            (data.sponsors.length === 0 &&
              data.contacts.length === 0 &&
              data.logs.length === 0 &&
              data.offers.length === 0) ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              No matching records found for "{query}"
            </div>
          ) : (
            <>
              {/* Sponsors Section */}
              {data.sponsors.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 px-2 mb-1 flex items-center gap-1.5">
                    <Building2 size={12} /> Sponsors ({data.sponsors.length})
                  </div>
                  <div className="space-y-1">
                    {data.sponsors.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onOpenChange(false);
                          if (onSelectSponsor) {
                            onSelectSponsor(s.id);
                          } else {
                            setLocation("/sponsor-pipeline");
                          }
                        }}
                        className="p-2.5 rounded-lg hover:bg-blue-50/70 cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-gray-900 group-hover:text-blue-600">
                              {s.companyName}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                              {s.displayId}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-700 font-medium">
                              {s.pipelineStatus}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">
                            {s.industry} • {s.primaryEvent || "General Partner"} {s.notes ? `• ${s.notes}` : ""}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-semibold text-gray-700">
                            ₹{Number(s.estimatedValue || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contacts Section */}
              {data.contacts.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 px-2 mb-1 flex items-center gap-1.5">
                    <Users size={12} /> Contacts ({data.contacts.length})
                  </div>
                  <div className="space-y-1">
                    {data.contacts.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onOpenChange(false);
                          setLocation("/contacts");
                        }}
                        className="p-2.5 rounded-lg hover:bg-blue-50/70 cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-gray-900 group-hover:text-blue-600">
                              {c.contactName}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              @ {c.companyName}
                            </span>
                            {c.isDecisionMaker && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">
                                Decision Maker
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {c.roleDepartment} • {c.email || c.phone}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interaction Logs */}
              {data.logs.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 px-2 mb-1 flex items-center gap-1.5">
                    <Calendar size={12} /> Outreach & Activity ({data.logs.length})
                  </div>
                  <div className="space-y-1">
                    {data.logs.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => {
                          onOpenChange(false);
                          setLocation("/activity-log");
                        }}
                        className="p-2.5 rounded-lg hover:bg-blue-50/70 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-gray-900 group-hover:text-blue-600">
                            {l.companyName} — {l.contactMethod}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(l.logDate).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 line-clamp-1 mt-0.5">
                          {l.interactionSummary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Offers */}
              {data.offers.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 px-2 mb-1 flex items-center gap-1.5">
                    <DollarSign size={12} /> Deals & Agreements ({data.offers.length})
                  </div>
                  <div className="space-y-1">
                    {data.offers.map((o) => (
                      <div
                        key={o.id}
                        onClick={() => {
                          onOpenChange(false);
                          setLocation("/offers");
                        }}
                        className="p-2.5 rounded-lg hover:bg-blue-50/70 cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-gray-900 group-hover:text-blue-600">
                              {o.companyName}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                              {o.offerType}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                              {o.agreementStatus}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {o.eventInitiative} • Invoice: {o.invoiceNumber || "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-gray-900">
                            ₹{Number(o.totalValue || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
