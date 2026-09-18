import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { systemRouter } from "./_core/systemRouter.js";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc.js";
import {
  createContact,
  createContactLog,
  createOffer,
  createSponsor,
  deleteContact,
  deleteContactLog,
  deleteOffer,
  deleteSponsor,
  getSponsorById,
  getSponsorKpis,
  getUserActivities,
  getUserByEmail,
  getUserById,
  globalSearch,
  inviteTeamMember,
  listContactLogs,
  listContacts,
  listOffers,
  listSponsors,
  listTeamMembers,
  recordUserActivity,
  toggleLogFollowupComplete,
  toggleTeamMemberActive,
  updateContact,
  updateContactLog,
  updateOffer,
  updateSponsor,
  updateTeamMemberRole,
} from "./db.js";

const sponsorInput = z.object({
  displayId: z.string().optional(),
  companyName: z.string().min(2, "Company name is required"),
  website: z.string().optional(),
  sponsorType: z.string().optional(),
  industry: z.string().optional(),
  cityRegion: z.string().optional(),
  primaryEvent: z.string().optional(),
  potentialFit: z.string().optional(),
  priority: z.enum(["High", "Medium", "Low"]).default("Medium"),
  pipelineStatus: z.enum(["Lead", "Contacted", "Meeting", "Proposal", "Confirmed", "Not a fit"]).default("Lead"),
  ownerId: z.number().optional(),
  lastContactDate: z.string().optional().nullable(),
  nextFollowupDate: z.string().optional().nullable(),
  daysUntilFollowup: z.number().optional(),
  bestContactMethod: z.string().optional(),
  estimatedValue: z.string().optional(),
  currency: z.string().default("INR"),
  likelySupportType: z.string().optional(),
  whatTheyCouldOffer: z.string().optional(),
  currentResponse: z.string().optional(),
  proposalSent: z.boolean().default(false),
  meetingDate: z.string().optional().nullable(),
  notes: z.string().optional(),
});

const contactInput = z.object({
  sponsorId: z.number(),
  companyName: z.string().optional(),
  contactName: z.string().min(2, "Contact name is required"),
  roleDepartment: z.string().optional(),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  phone: z.string().optional(),
  linkedinUrl: z.string().optional(),
  preferredContactMethod: z.string().optional(),
  referralSource: z.string().optional(),
  isDecisionMaker: z.boolean().default(false),
  contactStatus: z.string().default("Active"),
  notes: z.string().optional(),
});

const contactLogInput = z.object({
  sponsorId: z.number(),
  companyName: z.string().optional(),
  contactName: z.string().optional(),
  logDate: z.string().optional(),
  contactMethod: z.string().optional(),
  teamMember: z.number().optional(),
  interactionSummary: z.string().min(3, "Summary is required"),
  responseResult: z.string().optional(),
  followupRequired: z.boolean().default(false),
  nextFollowupDate: z.string().optional().nullable(),
  followupAction: z.string().optional(),
  followupCompleted: z.boolean().default(false),
  attachmentUrl: z.string().optional(),
});

const offerInput = z.object({
  sponsorId: z.number(),
  companyName: z.string().optional(),
  eventInitiative: z.string().min(2, "Event name is required"),
  offerType: z.string().min(2, "Tier/Type is required"),
  offerDescription: z.string().optional(),
  cashValue: z.string().or(z.number()).default("0"),
  inKindValue: z.string().or(z.number()).default("0"),
  offerDate: z.string().optional(),
  decisionStatus: z.string().default("Draft"),
  agreementStatus: z.string().default("Drafting"),
  agreementLink: z.string().optional(),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().optional().nullable(),
  paymentStatus: z.string().default("Pending"),
  amountReceived: z.string().or(z.number()).default("0"),
  paymentDate: z.string().optional().nullable(),
  deliverablesPromised: z.string().optional(),
  clubDeliverables: z.string().optional(),
  activationDeadline: z.string().optional().nullable(),
  ownerId: z.number().optional(),
  notes: z.string().optional(),
});

export const appRouter = router({
  system: systemRouter,

  // ==========================================
  // AUTHENTICATION & USER PROFILE ROUTER
  // ==========================================
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user ?? null),

    myActivity: protectedProcedure.query(({ ctx }) => {
      return getUserActivities(ctx.user.id);
    }),

    login: publicProcedure
      .input(
        z
          .object({
            email: z.string().optional(),
            userId: z.number().optional(),
            role: z.enum(["admin", "user"]).optional(),
          })
          .optional()
      )
      .mutation(async ({ ctx, input }) => {
        let userToAuth: any = null;

        if (input?.userId) {
          userToAuth = await getUserById(input.userId);
        } else if (input?.email) {
          userToAuth = await getUserByEmail(input.email);
          if (!userToAuth) {
            // Self-service sign in: create new team member profile
            const nameFromEmail = input.email.split("@")[0].replace(/[._]/g, " ");
            userToAuth = await inviteTeamMember({
              name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
              email: input.email,
              role: input.role ?? "user",
            });
          }
        }

        // Fallback default: Aarav Kapoor (Admin)
        if (!userToAuth) {
          userToAuth = (await getUserById(1)) || {
            id: 1,
            name: "Aarav Kapoor",
            email: "aarav@club.edu.in",
            role: "admin",
            title: "Sponsorship & PR Lead",
          };
        }

        const cookiePayload = {
          id: userToAuth.id,
          name: userToAuth.name,
          email: userToAuth.email,
          role: userToAuth.role,
          title: userToAuth.title,
        };

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, JSON.stringify(cookiePayload), {
          ...cookieOptions,
          maxAge: 365 * 24 * 60 * 60 * 1000,
        });

        return { success: true, user: cookiePayload } as const;
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==========================================
  // SPONSORS ROUTER
  // ==========================================
  sponsors: router({
    list: protectedProcedure
      .input(
        z
          .object({
            search: z.string().optional(),
            status: z.string().optional(),
            priority: z.string().optional(),
            sortBy: z.enum(["updatedAt", "companyName", "estimatedValue", "nextFollowupDate"]).optional(),
            sortOrder: z.enum(["asc", "desc"]).optional(),
          })
          .optional()
      )
      .query(({ input }) => listSponsors(input)),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getSponsorById(input.id);
      }),

    kpis: protectedProcedure.query(() => getSponsorKpis()),

    create: protectedProcedure.input(sponsorInput).mutation(async ({ ctx, input }) => {
      const newSponsor = await createSponsor({
        ...input,
        displayId: input.displayId || "",
        companyName: input.companyName,
        estimatedValue: input.estimatedValue ?? "0",
        nextFollowupDate: input.nextFollowupDate ? new Date(input.nextFollowupDate) : null,
        lastContactDate: input.lastContactDate ? new Date(input.lastContactDate) : null,
        meetingDate: input.meetingDate ? new Date(input.meetingDate) : null,
        createdBy: ctx.user.id,
        ownerId: input.ownerId ?? ctx.user.id,
      });

      recordUserActivity({
        userId: ctx.user.id,
        userName: ctx.user.name,
        action: "Created",
        entityType: "Sponsor",
        entityTitle: newSponsor.companyName,
        details: `Added ${newSponsor.companyName} (${newSponsor.displayId}) to pipeline with status ${newSponsor.pipelineStatus}`,
      });

      return newSponsor;
    }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: sponsorInput.partial(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, data } = input;
        const updated = await updateSponsor(id, {
          ...data,
          lastContactDate: data.lastContactDate ? new Date(data.lastContactDate) : undefined,
          nextFollowupDate: data.nextFollowupDate ? new Date(data.nextFollowupDate) : undefined,
          meetingDate: data.meetingDate ? new Date(data.meetingDate) : undefined,
        });

        recordUserActivity({
          userId: ctx.user.id,
          userName: ctx.user.name,
          action: "Updated",
          entityType: "Sponsor",
          entityTitle: updated.companyName,
          details: `Updated details for ${updated.companyName} (Status: ${updated.pipelineStatus})`,
        });

        return updated;
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        recordUserActivity({
          userId: ctx.user.id,
          userName: ctx.user.name,
          action: "Deleted",
          entityType: "Sponsor",
          entityTitle: `Sponsor ID #${input.id}`,
          details: `Removed sponsor record and associated sub-items`,
        });
        return deleteSponsor(input.id);
      }),
  }),

  // ==========================================
  // CONTACTS ROUTER
  // ==========================================
  contacts: router({
    list: protectedProcedure
      .input(
        z
          .object({
            sponsorId: z.number().optional(),
            search: z.string().optional(),
          })
          .optional()
      )
      .query(({ input }) => listContacts(input?.sponsorId, input?.search)),

    create: protectedProcedure.input(contactInput).mutation(async ({ ctx, input }) => {
      const contact = await createContact({
        ...input,
        email: input.email || null,
      });

      recordUserActivity({
        userId: ctx.user.id,
        userName: ctx.user.name,
        action: "Created",
        entityType: "Contact",
        entityTitle: contact.contactName,
        details: `Added contact ${contact.contactName} (${contact.roleDepartment}) for ${contact.companyName}`,
      });

      return contact;
    }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: contactInput.partial(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const updated = await updateContact(input.id, {
          ...input.data,
          email: input.data.email || undefined,
        });

        recordUserActivity({
          userId: ctx.user.id,
          userName: ctx.user.name,
          action: "Updated",
          entityType: "Contact",
          entityTitle: updated.contactName,
          details: `Updated contact info for ${updated.contactName} @ ${updated.companyName}`,
        });

        return updated;
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        recordUserActivity({
          userId: ctx.user.id,
          userName: ctx.user.name,
          action: "Deleted",
          entityType: "Contact",
          entityTitle: `Contact #${input.id}`,
          details: `Deleted contact record`,
        });
        return deleteContact(input.id);
      }),
  }),

  // ==========================================
  // ACTIVITY LOG (CONTACT LOG) ROUTER
  // ==========================================
  contactLog: router({
    list: protectedProcedure
      .input(
        z
          .object({
            sponsorId: z.number().optional(),
            search: z.string().optional(),
          })
          .optional()
      )
      .query(({ input }) => listContactLogs(input?.sponsorId, input?.search)),

    create: protectedProcedure.input(contactLogInput).mutation(async ({ ctx, input }) => {
      const log = await createContactLog({
        ...input,
        logDate: input.logDate ? new Date(input.logDate) : new Date(),
        nextFollowupDate: input.nextFollowupDate ? new Date(input.nextFollowupDate) : null,
        teamMember: input.teamMember ?? ctx.user.id,
        loggedBy: ctx.user.id,
      });

      recordUserActivity({
        userId: ctx.user.id,
        userName: ctx.user.name,
        action: "Created",
        entityType: "Outreach",
        entityTitle: `${log.companyName} (${log.contactMethod})`,
        details: `Logged outreach interaction: ${log.interactionSummary.substring(0, 50)}...`,
      });

      return log;
    }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: contactLogInput.partial(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const updated = await updateContactLog(input.id, {
          ...input.data,
          logDate: input.data.logDate ? new Date(input.data.logDate) : undefined,
          nextFollowupDate: input.data.nextFollowupDate ? new Date(input.data.nextFollowupDate) : undefined,
        });

        recordUserActivity({
          userId: ctx.user.id,
          userName: ctx.user.name,
          action: "Updated",
          entityType: "Outreach",
          entityTitle: `${updated.companyName} (${updated.contactMethod})`,
          details: `Updated interaction notes and outcomes`,
        });

        return updated;
      }),

    toggleComplete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const toggled = await toggleLogFollowupComplete(input.id);
        recordUserActivity({
          userId: ctx.user.id,
          userName: ctx.user.name,
          action: "Updated",
          entityType: "Outreach",
          entityTitle: `${toggled.companyName} Follow-up`,
          details: toggled.followupCompleted
            ? `Marked outreach follow-up as completed`
            : `Re-opened outreach follow-up item`,
        });
        return toggled;
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        recordUserActivity({
          userId: ctx.user.id,
          userName: ctx.user.name,
          action: "Deleted",
          entityType: "Outreach",
          entityTitle: `Outreach Log #${input.id}`,
          details: `Deleted outreach log entry`,
        });
        return deleteContactLog(input.id);
      }),
  }),

  // ==========================================
  // OFFERS & AGREEMENTS ROUTER
  // ==========================================
  offersAgreements: router({
    list: protectedProcedure
      .input(
        z
          .object({
            sponsorId: z.number().optional(),
            search: z.string().optional(),
          })
          .optional()
      )
      .query(({ input }) => listOffers(input?.sponsorId, input?.search)),

    create: protectedProcedure.input(offerInput).mutation(async ({ ctx, input }) => {
      const offer = await createOffer({
        ...input,
        cashValue: input.cashValue.toString(),
        inKindValue: input.inKindValue.toString(),
        amountReceived: input.amountReceived.toString(),
        offerDate: input.offerDate ? new Date(input.offerDate) : new Date(),
        invoiceDate: input.invoiceDate ? new Date(input.invoiceDate) : null,
        paymentDate: input.paymentDate ? new Date(input.paymentDate) : null,
        activationDeadline: input.activationDeadline ? new Date(input.activationDeadline) : null,
        ownerId: input.ownerId ?? ctx.user.id,
      });

      recordUserActivity({
        userId: ctx.user.id,
        userName: ctx.user.name,
        action: "Created",
        entityType: "Deal",
        entityTitle: `${offer.offerType} — ${offer.companyName}`,
        details: `Created commercial deal valued at ₹${Number(offer.totalValue || 0).toLocaleString("en-IN")}`,
      });

      return offer;
    }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: offerInput.partial(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const updated = await updateOffer(input.id, {
          ...input.data,
          cashValue: input.data.cashValue != null ? input.data.cashValue.toString() : undefined,
          inKindValue: input.data.inKindValue != null ? input.data.inKindValue.toString() : undefined,
          amountReceived: input.data.amountReceived != null ? input.data.amountReceived.toString() : undefined,
          offerDate: input.data.offerDate ? new Date(input.data.offerDate) : undefined,
          invoiceDate: input.data.invoiceDate ? new Date(input.data.invoiceDate) : undefined,
          paymentDate: input.data.paymentDate ? new Date(input.data.paymentDate) : undefined,
          activationDeadline: input.data.activationDeadline ? new Date(input.data.activationDeadline) : undefined,
        });

        recordUserActivity({
          userId: ctx.user.id,
          userName: ctx.user.name,
          action: "Updated",
          entityType: "Deal",
          entityTitle: `${updated.offerType} — ${updated.companyName}`,
          details: `Updated agreement status to "${updated.agreementStatus}" (Payment: ${updated.paymentStatus})`,
        });

        return updated;
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        recordUserActivity({
          userId: ctx.user.id,
          userName: ctx.user.name,
          action: "Deleted",
          entityType: "Deal",
          entityTitle: `Deal Agreement #${input.id}`,
          details: `Deleted sponsorship deal record`,
        });
        return deleteOffer(input.id);
      }),
  }),

  // ==========================================
  // TEAM MANAGEMENT ROUTER (ADMIN-ONLY ACTIONS)
  // ==========================================
  team: router({
    list: protectedProcedure.query(() => listTeamMembers()),

    invite: adminProcedure
      .input(
        z.object({
          name: z.string().min(2, "Name required"),
          email: z.string().email("Valid email required"),
          role: z.enum(["admin", "user"]).default("user"),
          title: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return inviteTeamMember(input);
      }),

    updateRole: adminProcedure
      .input(
        z.object({
          id: z.number(),
          role: z.enum(["admin", "user"]),
        })
      )
      .mutation(async ({ input }) => {
        return updateTeamMemberRole(input.id, input.role);
      }),

    toggleActive: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return toggleTeamMemberActive(input.id);
      }),
  }),

  // ==========================================
  // GLOBAL CROSS-ENTITY SEARCH
  // ==========================================
  search: router({
    global: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(({ input }) => globalSearch(input.query)),
  }),
});

export type AppRouter = typeof appRouter;
