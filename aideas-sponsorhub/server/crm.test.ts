import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAuthContext(role: "admin" | "user" = "admin"): TrpcContext {
  return {
    user: {
      id: 1,
      name: "Aarav Kapoor",
      email: "aarav@club.edu.in",
      role,
      title: "Lead",
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { cookie: () => {}, clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("CRM end-to-end routers", () => {
  it("fetches KPIs and sponsor list when authenticated", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const kpis = await caller.sponsors.kpis();
    expect(kpis.totalSponsors).toBeGreaterThan(0);
    expect(kpis.pipelineValue).toBeGreaterThan(0);

    const sponsors = await caller.sponsors.list();
    expect(sponsors.length).toBeGreaterThan(0);
    expect(sponsors[0]).toHaveProperty("companyName");
  });

  it("creates a new sponsor and retrieves details with nested entities", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const newSponsor = await caller.sponsors.create({
      companyName: "GitHub Campus",
      industry: "Developer Tools",
      priority: "High",
      pipelineStatus: "Meeting",
      estimatedValue: "110000",
      notes: "Student developer pack partnership",
    });

    expect(newSponsor.companyName).toBe("GitHub Campus");

    const detail = await caller.sponsors.getById({ id: newSponsor.id });
    expect(detail).not.toBeNull();
    expect(detail?.sponsor.companyName).toBe("GitHub Campus");
  });

  it("handles contacts, activity logs, and offers linking to a sponsor", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    const contact = await caller.contacts.create({
      sponsorId: 1,
      contactName: "Dev Rel Lead",
      roleDepartment: "Developer Ecosystem",
      email: "devrel@razorpay.com",
      isDecisionMaker: true,
    });
    expect(contact.contactName).toBe("Dev Rel Lead");

    const log = await caller.contactLog.create({
      sponsorId: 1,
      contactName: "Dev Rel Lead",
      interactionSummary: "Introductory meet about student hackathon bounties",
      followupRequired: true,
      nextFollowupDate: "2026-09-25",
    });
    expect(log.interactionSummary).toContain("hackathon bounties");

    const offer = await caller.offersAgreements.create({
      sponsorId: 1,
      eventInitiative: "Annual Hackathon",
      offerType: "Bounty Partner",
      cashValue: "50000",
      inKindValue: "25000",
      decisionStatus: "Under Review",
    });
    expect(offer.totalValue).toBe("75000.00");
  });

  it("enforces admin-only privileges for destructive actions and team management", async () => {
    const memberCaller = appRouter.createCaller(createAuthContext("user"));
    const adminCaller = appRouter.createCaller(createAuthContext("admin"));

    // Regular member should be forbidden from deleting a sponsor
    await expect(memberCaller.sponsors.delete({ id: 999 })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });

    // Regular member cannot invite new members
    await expect(
      memberCaller.team.invite({
        name: "Test User",
        email: "test@club.edu.in",
        role: "user",
      })
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });

    // Admin can access team list
    const team = await adminCaller.team.list();
    expect(team.length).toBeGreaterThan(0);
  });
});
