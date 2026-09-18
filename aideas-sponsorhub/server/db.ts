import { and, asc, count, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Contact,
  ContactLog,
  InsertContact,
  InsertContactLog,
  InsertOfferAgreement,
  InsertSponsor,
  InsertUser,
  OfferAgreement,
  Sponsor,
  User,
  contacts,
  contactLog,
  offersAgreements,
  sponsors,
  users,
} from "../drizzle/schema.js";
import { ENV } from "./_core/env.js";

// ==========================================
// SEED DATA FOR IN-MEMORY / FALLBACK STORAGE
// ==========================================

export interface TeamMemberProfile {
  id: number;
  openId: string;
  name: string;
  email: string;
  role: "admin" | "user";
  title?: string;
  isActive: boolean;
  avatarInitials: string;
  createdAt: Date;
  lastSignedIn: Date;
}

let inMemoryUsers: TeamMemberProfile[] = [
  {
    id: 1,
    openId: "user-aarav",
    name: "Aarav Kapoor",
    email: "aarav@club.edu.in",
    role: "admin",
    title: "Sponsorship & PR Lead",
    isActive: true,
    avatarInitials: "AK",
    createdAt: new Date("2026-08-01"),
    lastSignedIn: new Date("2026-09-18"),
  },
  {
    id: 2,
    openId: "user-priya",
    name: "Priya Nair",
    email: "priya@club.edu.in",
    role: "user",
    title: "Corporate Outreach Coordinator",
    isActive: true,
    avatarInitials: "PN",
    createdAt: new Date("2026-08-10"),
    lastSignedIn: new Date("2026-09-17"),
  },
  {
    id: 3,
    openId: "user-rohan",
    name: "Rohan Patel",
    email: "rohan@club.edu.in",
    role: "user",
    title: "Partnership Associate",
    isActive: true,
    avatarInitials: "RP",
    createdAt: new Date("2026-08-15"),
    lastSignedIn: new Date("2026-09-16"),
  },
  {
    id: 4,
    openId: "user-neha",
    name: "Neha Sharma",
    email: "neha@club.edu.in",
    role: "user",
    title: "PR & Media Associate",
    isActive: true,
    avatarInitials: "NS",
    createdAt: new Date("2026-08-20"),
    lastSignedIn: new Date("2026-09-15"),
  },
];

let inMemorySponsors: Sponsor[] = [
  {
    id: 1,
    displayId: "SP-024",
    companyName: "Razorpay",
    website: "https://razorpay.com",
    sponsorType: "Cash sponsor",
    industry: "Fintech",
    cityRegion: "Bengaluru",
    primaryEvent: "Annual Hackathon 2026",
    potentialFit: "High — Looking to engage fintech-focused engineering students and sponsor payment API bounties.",
    priority: "High",
    pipelineStatus: "Proposal",
    ownerId: 1,
    lastContactDate: new Date("2026-09-15"),
    nextFollowupDate: new Date("2026-09-19"),
    daysUntilFollowup: 1,
    bestContactMethod: "Email",
    estimatedValue: "150000",
    currency: "INR",
    likelySupportType: "Cash",
    whatTheyCouldOffer: "Title sponsor cash grant + payment gateway sandbox credits for participants.",
    currentResponse: "Reviewing title tier proposal submitted on Sep 15.",
    proposalSent: true,
    meetingDate: new Date("2026-09-10"),
    notes: "Follow up with Rajesh Kumar regarding legal agreement sign-off and MoU draft.",
    createdBy: 1,
    createdAt: new Date("2026-09-01"),
    updatedAt: new Date("2026-09-15"),
  },
  {
    id: 2,
    displayId: "SP-023",
    companyName: "Zoho",
    website: "https://zoho.com",
    sponsorType: "Cash + in-kind",
    industry: "SaaS",
    cityRegion: "Chennai",
    primaryEvent: "Tech Summit & Career Fair",
    potentialFit: "High — Strong regional campus hiring drive + product showcase for Zoho Creator.",
    priority: "High",
    pipelineStatus: "Meeting",
    ownerId: 2,
    lastContactDate: new Date("2026-09-14"),
    nextFollowupDate: new Date("2026-09-20"),
    daysUntilFollowup: 2,
    bestContactMethod: "Call",
    estimatedValue: "120000",
    currency: "INR",
    likelySupportType: "Mixed",
    whatTheyCouldOffer: "INR 70k cash grant + Zoho One student developer licenses for 1 year.",
    currentResponse: "Priya Sharma agreed to pitch meeting on Sep 20 at 3:00 PM.",
    proposalSent: true,
    meetingDate: new Date("2026-09-20"),
    notes: "Prepare deck focusing on computer science developer attendance and workshop slots.",
    createdBy: 1,
    createdAt: new Date("2026-09-02"),
    updatedAt: new Date("2026-09-14"),
  },
  {
    id: 3,
    displayId: "SP-022",
    companyName: "Deloitte India",
    website: "https://deloitte.com",
    sponsorType: "Knowledge partner",
    industry: "Consulting",
    cityRegion: "Mumbai",
    primaryEvent: "AI Workshop Series",
    potentialFit: "Medium — AI and analytics advisory campus recruitment presence.",
    priority: "Medium",
    pipelineStatus: "Contacted",
    ownerId: 3,
    lastContactDate: new Date("2026-09-13"),
    nextFollowupDate: new Date("2026-09-23"),
    daysUntilFollowup: 5,
    bestContactMethod: "Email",
    estimatedValue: "80000",
    currency: "INR",
    likelySupportType: "In-kind",
    whatTheyCouldOffer: "2 guest keynote speakers + case study competition sponsorship.",
    currentResponse: "Campus recruitment manager asked to reconnect after internal budget allocation.",
    proposalSent: false,
    meetingDate: null,
    notes: "Follow up after their Q3 graduate intake cycle opens.",
    createdBy: 2,
    createdAt: new Date("2026-09-03"),
    updatedAt: new Date("2026-09-13"),
  },
  {
    id: 4,
    displayId: "SP-021",
    companyName: "AWS Educate",
    website: "https://aws.amazon.com/educate",
    sponsorType: "Cloud credits",
    industry: "Cloud",
    cityRegion: "Hyderabad",
    primaryEvent: "Cloud & AI Bootcamp",
    potentialFit: "High — Student certification program and cloud compute vouchers.",
    priority: "High",
    pipelineStatus: "Confirmed",
    ownerId: 1,
    lastContactDate: new Date("2026-09-12"),
    nextFollowupDate: null,
    daysUntilFollowup: 0,
    bestContactMethod: "Email",
    estimatedValue: "95000",
    currency: "INR",
    likelySupportType: "Cloud credits",
    whatTheyCouldOffer: "$1,200 AWS compute credits + cloud architect mentor for judging.",
    currentResponse: "Agreement executed and activation promo codes received.",
    proposalSent: true,
    meetingDate: new Date("2026-09-08"),
    notes: "MoU signed; need to add AWS logo to hackathon website and marketing banners.",
    createdBy: 1,
    createdAt: new Date("2026-09-04"),
    updatedAt: new Date("2026-09-12"),
  },
  {
    id: 5,
    displayId: "SP-020",
    companyName: "Figma",
    website: "https://figma.com",
    sponsorType: "Tool partner",
    industry: "Design",
    cityRegion: "Remote",
    primaryEvent: "UI/UX Design Challenge",
    potentialFit: "Medium — Student creator community advocate sponsorship.",
    priority: "Low",
    pipelineStatus: "Lead",
    ownerId: 4,
    lastContactDate: null,
    nextFollowupDate: new Date("2026-09-26"),
    daysUntilFollowup: 8,
    bestContactMethod: "LinkedIn",
    estimatedValue: "45000",
    currency: "INR",
    likelySupportType: "Tool licenses",
    whatTheyCouldOffer: "Figma swag pack + free professional plan licenses for prize winners.",
    currentResponse: "Identified community advocate on LinkedIn; outreach pending.",
    proposalSent: false,
    meetingDate: null,
    notes: "Reach out via Vikram Singh on LinkedIn with portfolio from last year.",
    createdBy: 2,
    createdAt: new Date("2026-09-05"),
    updatedAt: new Date("2026-09-05"),
  },
  {
    id: 6,
    displayId: "SP-019",
    companyName: "Microsoft for Startups",
    website: "https://startups.microsoft.com",
    sponsorType: "Cloud credits",
    industry: "Technology",
    cityRegion: "Bengaluru",
    primaryEvent: "Founder Sprint 2026",
    potentialFit: "High — Student founder ecosystem support and Azure AI foundry credits.",
    priority: "Medium",
    pipelineStatus: "Contacted",
    ownerId: 2,
    lastContactDate: new Date("2026-09-16"),
    nextFollowupDate: new Date("2026-09-22"),
    daysUntilFollowup: 4,
    bestContactMethod: "Email",
    estimatedValue: "70000",
    currency: "INR",
    likelySupportType: "Cloud credits",
    whatTheyCouldOffer: "Azure AI credits and mentor network access for top 3 teams.",
    currentResponse: "Email reply received showing interest; requested event deck.",
    proposalSent: true,
    meetingDate: null,
    notes: "Sent introductory proposal deck; waiting on review by program director.",
    createdBy: 2,
    createdAt: new Date("2026-09-06"),
    updatedAt: new Date("2026-09-16"),
  },
];

let inMemoryContacts: Contact[] = [
  {
    id: 1,
    sponsorId: 1,
    companyName: "Razorpay",
    contactName: "Rajesh Kumar",
    roleDepartment: "Director of Developer Marketing",
    email: "rajesh.kumar@razorpay.com",
    phone: "+91 98765 43210",
    linkedinUrl: "https://linkedin.com/in/rajeshkumar-razorpay",
    preferredContactMethod: "Email",
    referralSource: "Alumni Network (Batch of 2022)",
    isDecisionMaker: true,
    contactStatus: "Active",
    notes: "Primary signer for student hackathon partnerships. Responds best in morning hours.",
    createdAt: new Date("2026-09-02"),
  },
  {
    id: 2,
    sponsorId: 1,
    companyName: "Razorpay",
    contactName: "Ananya Deshmukh",
    roleDepartment: "Community Specialist",
    email: "ananya.d@razorpay.com",
    phone: "+91 98765 43219",
    linkedinUrl: "https://linkedin.com/in/ananya-deshmukh",
    preferredContactMethod: "Call",
    referralSource: "Company Website",
    isDecisionMaker: false,
    contactStatus: "Active",
    notes: "Coordinates swag distribution and mentor assignments.",
    createdAt: new Date("2026-09-03"),
  },
  {
    id: 3,
    sponsorId: 2,
    companyName: "Zoho",
    contactName: "Priya Sharma",
    roleDepartment: "University Relations Lead",
    email: "priya.sharma@zohocorp.com",
    phone: "+91 98765 43211",
    linkedinUrl: "https://linkedin.com/in/priyasharma-zoho",
    preferredContactMethod: "Call",
    referralSource: "LinkedIn Outreach",
    isDecisionMaker: true,
    contactStatus: "Active",
    notes: "Very supportive of student-led AI workshops. Attending meeting on Sep 20.",
    createdAt: new Date("2026-09-04"),
  },
  {
    id: 4,
    sponsorId: 3,
    companyName: "Deloitte India",
    contactName: "Amit Patel",
    roleDepartment: "Campus Recruiting Manager",
    email: "amitpatel@deloitte.com",
    phone: "+91 98765 43212",
    linkedinUrl: "https://linkedin.com/in/amitpatel-deloitte",
    preferredContactMethod: "Email",
    referralSource: "Faculty Advisor Referral",
    isDecisionMaker: false,
    contactStatus: "Active",
    notes: "Handles college campus schedules; needs approval from partner for cash allocation.",
    createdAt: new Date("2026-09-05"),
  },
  {
    id: 5,
    sponsorId: 4,
    companyName: "AWS Educate",
    contactName: "Sneha Reddy",
    roleDepartment: "Program Manager, India Higher Ed",
    email: "sneha.reddy@amazon.com",
    phone: "+91 98765 43213",
    linkedinUrl: "https://linkedin.com/in/snehareddy-aws",
    preferredContactMethod: "Email",
    referralSource: "AWS Student Ambassador",
    isDecisionMaker: true,
    contactStatus: "Active",
    notes: "Finalized MoU for cloud credits. Will send judges for grand finale.",
    createdAt: new Date("2026-09-06"),
  },
  {
    id: 6,
    sponsorId: 5,
    companyName: "Figma",
    contactName: "Vikram Singh",
    roleDepartment: "Design Advocate, Student Communities",
    email: "vikram@figma.com",
    phone: "+91 98765 43214",
    linkedinUrl: "https://linkedin.com/in/vikramsingh-design",
    preferredContactMethod: "LinkedIn",
    referralSource: "Twitter / X Outreach",
    isDecisionMaker: false,
    contactStatus: "Lead",
    notes: "Follow up with portfolio of our design club's recent hackathon branding.",
    createdAt: new Date("2026-09-07"),
  },
];

let inMemoryLogs: ContactLog[] = [
  {
    id: 1,
    sponsorId: 1,
    companyName: "Razorpay",
    contactName: "Rajesh Kumar",
    logDate: new Date("2026-09-10"),
    contactMethod: "Video Call",
    teamMember: 1,
    interactionSummary: "30-min discovery call. Pitched Title Sponsorship (INR 1.5L) for Hackathon 2026. Highlighted 800+ developer turnout and customized API track.",
    responseResult: "Very receptive. Rajesh requested formal proposal and breakdown of offline booth space.",
    followupRequired: true,
    nextFollowupDate: new Date("2026-09-18"),
    followupAction: "Send finalized MoU draft and invoice structure.",
    followupCompleted: false,
    attachmentUrl: "https://drive.google.com/open?id=razorpay-pitch-deck-2026",
    loggedBy: 1,
    createdAt: new Date("2026-09-10"),
  },
  {
    id: 2,
    sponsorId: 2,
    companyName: "Zoho",
    contactName: "Priya Sharma",
    logDate: new Date("2026-09-14"),
    contactMethod: "Phone Call",
    teamMember: 2,
    interactionSummary: "Follow-up phone call to review sponsor deliverables and discuss technical workshop slot.",
    responseResult: "Agreed to joint demo workshop during lunch break. Scheduled deep-dive meeting for Sep 20.",
    followupRequired: true,
    nextFollowupDate: new Date("2026-09-19"),
    followupAction: "Confirm attendees from faculty side and share Google Meet invite.",
    followupCompleted: false,
    attachmentUrl: "",
    loggedBy: 2,
    createdAt: new Date("2026-09-14"),
  },
  {
    id: 3,
    sponsorId: 3,
    companyName: "Deloitte India",
    contactName: "Amit Patel",
    logDate: new Date("2026-09-13"),
    contactMethod: "Email",
    teamMember: 3,
    interactionSummary: "Sent introductory sponsorship brochure and speaker invitation for AI Summit.",
    responseResult: "Acknowledged receipt; stated Q3 budget approval process takes 10 business days.",
    followupRequired: true,
    nextFollowupDate: new Date("2026-09-23"),
    followupAction: "Send gentle reminder email with speaker confirmation deadline.",
    followupCompleted: false,
    attachmentUrl: "https://drive.google.com/open?id=deloitte-brochure-2026",
    loggedBy: 3,
    createdAt: new Date("2026-09-13"),
  },
  {
    id: 4,
    sponsorId: 4,
    companyName: "AWS Educate",
    contactName: "Sneha Reddy",
    logDate: new Date("2026-09-12"),
    contactMethod: "Email",
    teamMember: 1,
    interactionSummary: "Confirmed MoU signing and receipt of 500 AWS Educate promotional voucher keys.",
    responseResult: "Completed! Partnership officially locked in.",
    followupRequired: false,
    nextFollowupDate: null,
    followupAction: "Distribute vouchers to registered participants on Day 1.",
    followupCompleted: true,
    attachmentUrl: "https://drive.google.com/open?id=aws-mou-signed-2026",
    loggedBy: 1,
    createdAt: new Date("2026-09-12"),
  },
];

let inMemoryOffers: OfferAgreement[] = [
  {
    id: 1,
    sponsorId: 1,
    companyName: "Razorpay",
    eventInitiative: "Annual Hackathon 2026",
    offerType: "Title Sponsor Tier",
    offerDescription: "Exclusive Title Sponsor branding across all stages, hackathon website, T-shirts, and opening ceremony presentation.",
    cashValue: "150000.00",
    inKindValue: "0.00",
    totalValue: "150000.00",
    offerDate: new Date("2026-09-15"),
    decisionStatus: "Under Review",
    agreementStatus: "MoU Pending",
    agreementLink: "https://drive.google.com/open?id=razorpay-draft-mou",
    invoiceNumber: "INV-2026-001",
    invoiceDate: new Date("2026-09-22"),
    paymentStatus: "Pending",
    amountReceived: "0.00",
    paymentDate: null,
    deliverablesPromised: "Stage banner, opening 10-min slot, 3 judge seats, API bounty challenge.",
    clubDeliverables: "Resumes of top 50 participants, social media promotion (5 dedicated posts).",
    activationDeadline: new Date("2026-10-01"),
    ownerId: 1,
    notes: "Invoice to be generated upon signed MoU.",
    createdAt: new Date("2026-09-15"),
  },
  {
    id: 2,
    sponsorId: 2,
    companyName: "Zoho",
    eventInitiative: "Tech Summit & Career Fair",
    offerType: "Gold Partner Tier",
    offerDescription: "INR 70,000 cash grant + Zoho One student accounts valued at INR 50,000.",
    cashValue: "70000.00",
    inKindValue: "50000.00",
    totalValue: "120000.00",
    offerDate: new Date("2026-09-12"),
    decisionStatus: "Verbal Agreement",
    agreementStatus: "Drafting",
    agreementLink: "",
    invoiceNumber: "INV-2026-002",
    invoiceDate: null,
    paymentStatus: "Pending",
    amountReceived: "0.00",
    paymentDate: null,
    deliverablesPromised: "Workshop hall access, booth in exhibition zone, 2 speaker slots.",
    clubDeliverables: "Attendance scan data, 200 physical student kits distribution.",
    activationDeadline: new Date("2026-10-05"),
    ownerId: 2,
    notes: "Meeting on Sep 20 to finalize deliverable dates.",
    createdAt: new Date("2026-09-12"),
  },
  {
    id: 3,
    sponsorId: 4,
    companyName: "AWS Educate",
    eventInitiative: "Cloud & AI Bootcamp",
    offerType: "Cloud Compute Partner",
    offerDescription: "AWS Educate promotional cloud credits for 400 participants plus mentor support.",
    cashValue: "0.00",
    inKindValue: "95000.00",
    totalValue: "95000.00",
    offerDate: new Date("2026-09-08"),
    decisionStatus: "Approved",
    agreementStatus: "Signed",
    agreementLink: "https://drive.google.com/open?id=aws-agreement-signed",
    invoiceNumber: "N/A - In-Kind",
    invoiceDate: null,
    paymentStatus: "Completed",
    amountReceived: "95000.00",
    paymentDate: new Date("2026-09-12"),
    deliverablesPromised: "Logo on all certificates, promo banner, mentor judge at finale.",
    clubDeliverables: "Mandatory cloud track submission using AWS services.",
    activationDeadline: new Date("2026-09-25"),
    ownerId: 1,
    notes: "Signed and completed. Promo keys verified and active.",
    createdAt: new Date("2026-09-08"),
  },
];

// ==========================================
// DRIZZLE DATABASE CONNECTION (OPTIONAL)
// ==========================================

let _db: ReturnType<typeof drizzle> | null = null;
let useInMemory = true;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
      useInMemory = false;
    } catch (error) {
      console.warn("[Database] Failed to connect to DATABASE_URL, using in-memory store:", error);
      _db = null;
      useInMemory = true;
    }
  }
  return _db;
}

// ==========================================
// USER & TEAM MANAGEMENT
// ==========================================

export async function listTeamMembers(): Promise<TeamMemberProfile[]> {
  return inMemoryUsers;
}

export async function getUserByEmail(email: string): Promise<TeamMemberProfile | undefined> {
  return inMemoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function getUserById(id: number): Promise<TeamMemberProfile | undefined> {
  return inMemoryUsers.find((u) => u.id === id);
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (db && !useInMemory) {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    if (result.length > 0) return result[0];
  }
  const member = inMemoryUsers.find((u) => u.openId === openId);
  if (!member) return undefined;
  return {
    id: member.id,
    openId: member.openId,
    name: member.name,
    email: member.email,
    loginMethod: "email",
    role: member.role,
    createdAt: member.createdAt,
    updatedAt: member.lastSignedIn,
    lastSignedIn: member.lastSignedIn,
  };
}

export async function inviteTeamMember(input: {
  name: string;
  email: string;
  role: "admin" | "user";
  title?: string;
}): Promise<TeamMemberProfile> {
  const existing = inMemoryUsers.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
  if (existing) {
    throw new Error(`Team member with email ${input.email} already exists.`);
  }

  const initials = input.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const newId = Math.max(0, ...inMemoryUsers.map((u) => u.id)) + 1;
  const newMember: TeamMemberProfile = {
    id: newId,
    openId: `user-${newId}-${Date.now()}`,
    name: input.name,
    email: input.email,
    role: input.role,
    title: input.title || (input.role === "admin" ? "Sponsorship Lead" : "Outreach Member"),
    isActive: true,
    avatarInitials: initials || "TM",
    createdAt: new Date(),
    lastSignedIn: new Date(),
  };

  inMemoryUsers.push(newMember);
  return newMember;
}

export async function updateTeamMemberRole(id: number, role: "admin" | "user"): Promise<TeamMemberProfile> {
  const user = inMemoryUsers.find((u) => u.id === id);
  if (!user) throw new Error("Team member not found");
  user.role = role;
  return user;
}

export async function toggleTeamMemberActive(id: number): Promise<TeamMemberProfile> {
  const user = inMemoryUsers.find((u) => u.id === id);
  if (!user) throw new Error("Team member not found");
  user.isActive = !user.isActive;
  return user;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db || useInMemory) {
    const existing = inMemoryUsers.find((u) => u.openId === user.openId);
    if (existing) {
      if (user.name) existing.name = user.name;
      if (user.email) existing.email = user.email;
      if (user.role) existing.role = user.role;
      existing.lastSignedIn = new Date();
    } else {
      const newId = Math.max(0, ...inMemoryUsers.map((u) => u.id)) + 1;
      inMemoryUsers.push({
        id: newId,
        openId: user.openId,
        name: user.name ?? "Club Member",
        email: user.email ?? "member@club.edu.in",
        role: (user.role as "admin" | "user") ?? "user",
        isActive: true,
        avatarInitials: "CM",
        createdAt: new Date(),
        lastSignedIn: new Date(),
      });
    }
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined || user.openId === ENV.ownerOpenId) {
    values.role = user.role ?? "admin";
    updateSet.role = values.role;
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

// ==========================================
// SPONSORS CRUD & KPIS
// ==========================================

export async function listSponsors(options?: {
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: "updatedAt" | "companyName" | "estimatedValue" | "nextFollowupDate";
  sortOrder?: "asc" | "desc";
}): Promise<Sponsor[]> {
  const db = await getDb();
  if (!db || useInMemory) {
    let result = [...inMemorySponsors];

    if (options?.search) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.companyName.toLowerCase().includes(q) ||
          s.industry?.toLowerCase().includes(q) ||
          s.sponsorType?.toLowerCase().includes(q) ||
          s.displayId.toLowerCase().includes(q) ||
          s.notes?.toLowerCase().includes(q)
      );
    }

    if (options?.status && options.status !== "All") {
      result = result.filter((s) => s.pipelineStatus === options.status);
    }

    if (options?.priority && options.priority !== "All") {
      result = result.filter((s) => s.priority === options.priority);
    }

    const sortOrder = options?.sortOrder ?? "desc";
    const sortBy = options?.sortBy ?? "updatedAt";

    result.sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];

      if (sortBy === "estimatedValue") {
        valA = parseFloat(a.estimatedValue || "0");
        valB = parseFloat(b.estimatedValue || "0");
      }

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      return sortOrder === "asc" ? 1 : -1;
    });

    return result;
  }

  const whereConditions = [];
  if (options?.search) {
    whereConditions.push(
      or(
        like(sponsors.companyName, `%${options.search}%`),
        like(sponsors.notes, `%${options.search}%`),
        like(sponsors.industry, `%${options.search}%`)
      )
    );
  }
  if (options?.status && options.status !== "All") {
    whereConditions.push(eq(sponsors.pipelineStatus, options.status as any));
  }
  if (options?.priority && options.priority !== "All") {
    whereConditions.push(eq(sponsors.priority, options.priority as any));
  }

  const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;
  return db
    .select()
    .from(sponsors)
    .where(where)
    .orderBy(desc(sponsors.updatedAt), asc(sponsors.companyName));
}

export async function getSponsorById(id: number): Promise<{
  sponsor: Sponsor;
  contacts: Contact[];
  logs: ContactLog[];
  offers: OfferAgreement[];
} | null> {
  const db = await getDb();
  let sponsor: Sponsor | undefined;
  let sponsorContacts: Contact[] = [];
  let sponsorLogs: ContactLog[] = [];
  let sponsorOffers: OfferAgreement[] = [];

  if (!db || useInMemory) {
    sponsor = inMemorySponsors.find((s) => s.id === id);
    if (!sponsor) return null;

    sponsorContacts = inMemoryContacts.filter((c) => c.sponsorId === id);
    sponsorLogs = inMemoryLogs.filter((l) => l.sponsorId === id);
    sponsorOffers = inMemoryOffers.filter((o) => o.sponsorId === id);
  } else {
    const res = await db.select().from(sponsors).where(eq(sponsors.id, id)).limit(1);
    if (res.length === 0) return null;
    sponsor = res[0];

    sponsorContacts = await db.select().from(contacts).where(eq(contacts.sponsorId, id));
    sponsorLogs = await db.select().from(contactLog).where(eq(contactLog.sponsorId, id));
    sponsorOffers = await db.select().from(offersAgreements).where(eq(offersAgreements.sponsorId, id));
  }

  return {
    sponsor,
    contacts: sponsorContacts,
    logs: sponsorLogs,
    offers: sponsorOffers,
  };
}

export async function createSponsor(input: InsertSponsor): Promise<Sponsor> {
  const db = await getDb();
  if (!db || useInMemory) {
    const newId = Math.max(0, ...inMemorySponsors.map((s) => s.id)) + 1;
    const newSponsor: Sponsor = {
      ...input,
      id: newId,
      displayId: input.displayId || `SP-${String(newId).padStart(3, "0")}`,
      companyName: input.companyName,
      website: input.website ?? null,
      sponsorType: input.sponsorType ?? "Cash sponsor",
      industry: input.industry ?? "Technology",
      cityRegion: input.cityRegion ?? "Bengaluru",
      primaryEvent: input.primaryEvent ?? "Annual Hackathon",
      potentialFit: input.potentialFit ?? "",
      priority: input.priority ?? "Medium",
      pipelineStatus: input.pipelineStatus ?? "Lead",
      ownerId: input.ownerId ?? 1,
      lastContactDate: input.lastContactDate ? new Date(input.lastContactDate) : null,
      nextFollowupDate: input.nextFollowupDate ? new Date(input.nextFollowupDate) : null,
      daysUntilFollowup: input.daysUntilFollowup ?? 7,
      bestContactMethod: input.bestContactMethod ?? "Email",
      estimatedValue: input.estimatedValue ?? "0",
      currency: input.currency ?? "INR",
      likelySupportType: input.likelySupportType ?? "Cash",
      whatTheyCouldOffer: input.whatTheyCouldOffer ?? "",
      currentResponse: input.currentResponse ?? "",
      proposalSent: input.proposalSent ?? false,
      meetingDate: input.meetingDate ? new Date(input.meetingDate) : null,
      notes: input.notes ?? "",
      createdBy: input.createdBy ?? 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemorySponsors.unshift(newSponsor);
    return newSponsor;
  }

  const result = await db.insert(sponsors).values(input);
  const insertId = Number((result as any)[0]?.insertId ?? 0);
  const created = await db.select().from(sponsors).where(eq(sponsors.id, insertId)).limit(1);
  return created[0] ?? (input as Sponsor);
}

export async function updateSponsor(id: number, input: Partial<InsertSponsor>): Promise<Sponsor> {
  const db = await getDb();
  if (!db || useInMemory) {
    const index = inMemorySponsors.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Sponsor not found");

    const existing = inMemorySponsors[index];
    const updated: Sponsor = {
      ...existing,
      ...input,
      id,
      lastContactDate: input.lastContactDate ? new Date(input.lastContactDate) : existing.lastContactDate,
      nextFollowupDate: input.nextFollowupDate ? new Date(input.nextFollowupDate) : existing.nextFollowupDate,
      meetingDate: input.meetingDate ? new Date(input.meetingDate) : existing.meetingDate,
      updatedAt: new Date(),
    };
    inMemorySponsors[index] = updated;
    return updated;
  }

  await db
    .update(sponsors)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(sponsors.id, id));

  const updated = await db.select().from(sponsors).where(eq(sponsors.id, id)).limit(1);
  return updated[0];
}

export async function deleteSponsor(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db || useInMemory) {
    inMemorySponsors = inMemorySponsors.filter((s) => s.id !== id);
    inMemoryContacts = inMemoryContacts.filter((c) => c.sponsorId !== id);
    inMemoryLogs = inMemoryLogs.filter((l) => l.sponsorId !== id);
    inMemoryOffers = inMemoryOffers.filter((o) => o.sponsorId !== id);
    return true;
  }

  await db.delete(contacts).where(eq(contacts.sponsorId, id));
  await db.delete(contactLog).where(eq(contactLog.sponsorId, id));
  await db.delete(offersAgreements).where(eq(offersAgreements.sponsorId, id));
  await db.delete(sponsors).where(eq(sponsors.id, id));
  return true;
}

export async function getSponsorKpis() {
  const db = await getDb();
  if (!db || useInMemory) {
    const totalSponsors = inMemorySponsors.length;
    const contacted = inMemorySponsors.filter((s) => s.pipelineStatus !== "Lead").length;
    const confirmed = inMemorySponsors.filter((s) => s.pipelineStatus === "Confirmed").length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const followupsDue = inMemorySponsors.filter(
      (s) => s.nextFollowupDate && new Date(s.nextFollowupDate) <= today && s.pipelineStatus !== "Confirmed"
    ).length;

    const pipelineValue = inMemorySponsors.reduce(
      (sum, s) => sum + parseFloat(s.estimatedValue || "0"),
      0
    );

    const totalCashOffers = inMemoryOffers.reduce(
      (sum, o) => sum + parseFloat(o.cashValue || "0"),
      0
    );

    const totalInKindOffers = inMemoryOffers.reduce(
      (sum, o) => sum + parseFloat(o.inKindValue || "0"),
      0
    );

    const totalReceived = inMemoryOffers.reduce(
      (sum, o) => sum + parseFloat(o.amountReceived || "0"),
      0
    );

    const statusCounts = {
      Lead: inMemorySponsors.filter((s) => s.pipelineStatus === "Lead").length,
      Contacted: inMemorySponsors.filter((s) => s.pipelineStatus === "Contacted").length,
      Meeting: inMemorySponsors.filter((s) => s.pipelineStatus === "Meeting").length,
      Proposal: inMemorySponsors.filter((s) => s.pipelineStatus === "Proposal").length,
      Confirmed: inMemorySponsors.filter((s) => s.pipelineStatus === "Confirmed").length,
      NotAFit: inMemorySponsors.filter((s) => s.pipelineStatus === "Not a fit").length,
    };

    return {
      totalSponsors,
      contacted,
      confirmed,
      followupsDue,
      pipelineValue,
      totalCashOffers,
      totalInKindOffers,
      totalReceived,
      statusCounts,
    };
  }

  const [total, contacted, confirmed, followups, value] = await Promise.all([
    db.select({ value: count() }).from(sponsors),
    db.select({ value: count() }).from(sponsors).where(sql`${sponsors.pipelineStatus} <> 'Lead'`),
    db.select({ value: count() }).from(sponsors).where(eq(sponsors.pipelineStatus, "Confirmed")),
    db
      .select({ value: count() })
      .from(sponsors)
      .where(and(sql`${sponsors.nextFollowupDate} <= CURRENT_DATE()`, sql`${sponsors.pipelineStatus} <> 'Confirmed'`)),
    db.select({ value: sql<number>`COALESCE(SUM(${sponsors.estimatedValue}), 0)` }).from(sponsors),
  ]);

  return {
    totalSponsors: Number(total[0]?.value ?? 0),
    contacted: Number(contacted[0]?.value ?? 0),
    confirmed: Number(confirmed[0]?.value ?? 0),
    followupsDue: Number(followups[0]?.value ?? 0),
    pipelineValue: Number(value[0]?.value ?? 0),
    totalCashOffers: 0,
    totalInKindOffers: 0,
    totalReceived: 0,
    statusCounts: { Lead: 0, Contacted: 0, Meeting: 0, Proposal: 0, Confirmed: 0, NotAFit: 0 },
  };
}

// ==========================================
// CONTACTS CRUD
// ==========================================

export async function listContacts(sponsorId?: number, search?: string): Promise<Contact[]> {
  const db = await getDb();
  if (!db || useInMemory) {
    let result = [...inMemoryContacts];
    if (sponsorId) {
      result = result.filter((c) => c.sponsorId === sponsorId);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.contactName.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.companyName?.toLowerCase().includes(q) ||
          c.roleDepartment?.toLowerCase().includes(q)
      );
    }
    return result;
  }

  const whereConditions = [];
  if (sponsorId) whereConditions.push(eq(contacts.sponsorId, sponsorId));
  if (search) {
    whereConditions.push(
      or(
        like(contacts.contactName, `%${search}%`),
        like(contacts.email, `%${search}%`),
        like(contacts.companyName, `%${search}%`)
      )
    );
  }
  const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;
  return db.select().from(contacts).where(where).orderBy(desc(contacts.createdAt));
}

export async function createContact(input: InsertContact): Promise<Contact> {
  const sponsor = inMemorySponsors.find((s) => s.id === input.sponsorId);
  const companyName = input.companyName || sponsor?.companyName || "Unknown Company";

  const db = await getDb();
  if (!db || useInMemory) {
    const newId = Math.max(0, ...inMemoryContacts.map((c) => c.id)) + 1;
    const newContact: Contact = {
      ...input,
      id: newId,
      sponsorId: input.sponsorId,
      companyName,
      contactName: input.contactName,
      roleDepartment: input.roleDepartment ?? "Contact",
      email: input.email ?? null,
      phone: input.phone ?? null,
      linkedinUrl: input.linkedinUrl ?? null,
      preferredContactMethod: input.preferredContactMethod ?? "Email",
      referralSource: input.referralSource ?? "",
      isDecisionMaker: input.isDecisionMaker ?? false,
      contactStatus: input.contactStatus ?? "Active",
      notes: input.notes ?? "",
      createdAt: new Date(),
    };
    inMemoryContacts.unshift(newContact);
    return newContact;
  }

  await db.insert(contacts).values({ ...input, companyName });
  return input as Contact;
}

export async function updateContact(id: number, input: Partial<InsertContact>): Promise<Contact> {
  const db = await getDb();
  if (!db || useInMemory) {
    const index = inMemoryContacts.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Contact not found");
    const existing = inMemoryContacts[index];
    const updated: Contact = { ...existing, ...input, id };
    inMemoryContacts[index] = updated;
    return updated;
  }

  await db.update(contacts).set(input).where(eq(contacts.id, id));
  const res = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
  return res[0];
}

export async function deleteContact(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db || useInMemory) {
    inMemoryContacts = inMemoryContacts.filter((c) => c.id !== id);
    return true;
  }
  await db.delete(contacts).where(eq(contacts.id, id));
  return true;
}

// ==========================================
// CONTACT LOG (ACTIVITY LOG) CRUD
// ==========================================

export async function listContactLogs(sponsorId?: number, search?: string): Promise<ContactLog[]> {
  const db = await getDb();
  if (!db || useInMemory) {
    let result = [...inMemoryLogs];
    if (sponsorId) {
      result = result.filter((l) => l.sponsorId === sponsorId);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.companyName?.toLowerCase().includes(q) ||
          l.contactName?.toLowerCase().includes(q) ||
          l.interactionSummary?.toLowerCase().includes(q) ||
          l.responseResult?.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime());
    return result;
  }

  const whereConditions = [];
  if (sponsorId) whereConditions.push(eq(contactLog.sponsorId, sponsorId));
  if (search) {
    whereConditions.push(
      or(
        like(contactLog.companyName, `%${search}%`),
        like(contactLog.interactionSummary, `%${search}%`)
      )
    );
  }
  const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;
  return db.select().from(contactLog).where(where).orderBy(desc(contactLog.logDate));
}

export async function createContactLog(input: InsertContactLog): Promise<ContactLog> {
  const sponsor = inMemorySponsors.find((s) => s.id === input.sponsorId);
  const companyName = input.companyName || sponsor?.companyName || "Unknown Company";

  const parsedLogDate = input.logDate ? new Date(input.logDate) : new Date();
  const parsedNextDate = input.nextFollowupDate ? new Date(input.nextFollowupDate) : null;

  const db = await getDb();
  if (!db || useInMemory) {
    const newId = Math.max(0, ...inMemoryLogs.map((l) => l.id)) + 1;
    const newLog: ContactLog = {
      ...input,
      id: newId,
      sponsorId: input.sponsorId,
      companyName,
      contactName: input.contactName ?? "",
      logDate: parsedLogDate,
      contactMethod: input.contactMethod ?? "Email",
      teamMember: input.teamMember ?? 1,
      interactionSummary: input.interactionSummary ?? "",
      responseResult: input.responseResult ?? "",
      followupRequired: input.followupRequired ?? false,
      nextFollowupDate: parsedNextDate,
      followupAction: input.followupAction ?? "",
      followupCompleted: input.followupCompleted ?? false,
      attachmentUrl: input.attachmentUrl ?? null,
      loggedBy: input.loggedBy ?? 1,
      createdAt: new Date(),
    };
    inMemoryLogs.unshift(newLog);

    // Also update sponsor's lastContactDate
    if (sponsor) {
      sponsor.lastContactDate = new Date();
      if (input.nextFollowupDate) {
        sponsor.nextFollowupDate = new Date(input.nextFollowupDate);
      }
    }
    return newLog;
  }

  await db.insert(contactLog).values({
    ...input,
    companyName,
    logDate: parsedLogDate,
    nextFollowupDate: parsedNextDate,
  });
  return input as ContactLog;
}

export async function toggleLogFollowupComplete(id: number): Promise<ContactLog> {
  const log = inMemoryLogs.find((l) => l.id === id);
  if (!log) throw new Error("Log entry not found");
  log.followupCompleted = !log.followupCompleted;
  return log;
}

export async function updateContactLog(id: number, input: Partial<InsertContactLog>): Promise<ContactLog> {
  const db = await getDb();
  if (!db || useInMemory) {
    const index = inMemoryLogs.findIndex((l) => l.id === id);
    if (index === -1) throw new Error("Log entry not found");
    const existing = inMemoryLogs[index];
    const updated: ContactLog = {
      ...existing,
      ...input,
      id,
      logDate: input.logDate ? new Date(input.logDate) : existing.logDate,
      nextFollowupDate: input.nextFollowupDate ? new Date(input.nextFollowupDate) : existing.nextFollowupDate,
    };
    inMemoryLogs[index] = updated;
    return updated;
  }
  await db.update(contactLog).set(input).where(eq(contactLog.id, id));
  const res = await db.select().from(contactLog).where(eq(contactLog.id, id)).limit(1);
  return res[0];
}

export async function deleteContactLog(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db || useInMemory) {
    inMemoryLogs = inMemoryLogs.filter((l) => l.id !== id);
    return true;
  }
  await db.delete(contactLog).where(eq(contactLog.id, id));
  return true;
}

// ==========================================
// USER ACTIVITY & EDIT HISTORY
// ==========================================

export interface UserActivityLog {
  id: number;
  userId: number;
  userName: string;
  action: "Created" | "Updated" | "Deleted";
  entityType: "Sponsor" | "Contact" | "Outreach" | "Deal";
  entityTitle: string;
  details: string;
  timestamp: Date;
}

let inMemoryUserActivities: UserActivityLog[] = [
  {
    id: 1,
    userId: 1,
    userName: "Aarav Kapoor",
    action: "Updated",
    entityType: "Sponsor",
    entityTitle: "Razorpay",
    details: "Changed status to Proposal (Estimated value: ₹1,50,000)",
    timestamp: new Date("2026-09-18T16:30:00"),
  },
  {
    id: 2,
    userId: 1,
    userName: "Aarav Kapoor",
    action: "Created",
    entityType: "Deal",
    entityTitle: "Title Sponsor Tier — Razorpay",
    details: "Drafted proposal worth ₹1,50,000 for Annual Hackathon",
    timestamp: new Date("2026-09-18T15:45:00"),
  },
  {
    id: 3,
    userId: 1,
    userName: "Aarav Kapoor",
    action: "Updated",
    entityType: "Sponsor",
    entityTitle: "AWS Educate",
    details: "Marked agreement signed and cloud vouchers received",
    timestamp: new Date("2026-09-18T14:15:00"),
  },
  {
    id: 4,
    userId: 1,
    userName: "Aarav Kapoor",
    action: "Created",
    entityType: "Outreach",
    entityTitle: "Discovery call with Razorpay",
    details: "Pitched INR 1.5L title sponsorship; requested booth space breakdown",
    timestamp: new Date("2026-09-17T11:00:00"),
  },
  {
    id: 5,
    userId: 2,
    userName: "Priya Nair",
    action: "Created",
    entityType: "Outreach",
    entityTitle: "Pitch meeting with Zoho",
    details: "Scheduled deep-dive meeting for Sep 20 at 3 PM",
    timestamp: new Date("2026-09-17T10:30:00"),
  },
  {
    id: 6,
    userId: 3,
    userName: "Rohan Patel",
    action: "Created",
    entityType: "Contact",
    entityTitle: "Amit Patel @ Deloitte India",
    details: "Added campus recruiting manager point of contact",
    timestamp: new Date("2026-09-16T12:00:00"),
  },
];

export function recordUserActivity(item: Omit<UserActivityLog, "id" | "timestamp">) {
  const newId = Math.max(0, ...inMemoryUserActivities.map((a) => a.id)) + 1;
  const activity: UserActivityLog = {
    ...item,
    id: newId,
    timestamp: new Date(),
  };
  inMemoryUserActivities.unshift(activity);
  return activity;
}

export function getUserActivities(userId: number): UserActivityLog[] {
  return inMemoryUserActivities.filter((a) => a.userId === userId);
}

// ==========================================
// OFFERS & AGREEMENTS CRUD
// ==========================================

export async function listOffers(sponsorId?: number, search?: string): Promise<OfferAgreement[]> {
  const db = await getDb();
  if (!db || useInMemory) {
    let result = [...inMemoryOffers];
    if (sponsorId) {
      result = result.filter((o) => o.sponsorId === sponsorId);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.companyName?.toLowerCase().includes(q) ||
          o.eventInitiative?.toLowerCase().includes(q) ||
          o.offerType?.toLowerCase().includes(q) ||
          o.invoiceNumber?.toLowerCase().includes(q)
      );
    }
    return result;
  }

  const whereConditions = [];
  if (sponsorId) whereConditions.push(eq(offersAgreements.sponsorId, sponsorId));
  if (search) {
    whereConditions.push(
      or(
        like(offersAgreements.companyName, `%${search}%`),
        like(offersAgreements.offerType, `%${search}%`)
      )
    );
  }
  const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;
  return db.select().from(offersAgreements).where(where).orderBy(desc(offersAgreements.createdAt));
}

export async function createOffer(input: InsertOfferAgreement): Promise<OfferAgreement> {
  const sponsor = inMemorySponsors.find((s) => s.id === input.sponsorId);
  const companyName = input.companyName || sponsor?.companyName || "Unknown Company";

  const cash = parseFloat(input.cashValue?.toString() || "0");
  const inKind = parseFloat(input.inKindValue?.toString() || "0");
  const total = (cash + inKind).toFixed(2);

  const parsedOfferDate = input.offerDate ? new Date(input.offerDate) : new Date();
  const parsedInvoiceDate = input.invoiceDate ? new Date(input.invoiceDate) : null;
  const parsedPaymentDate = input.paymentDate ? new Date(input.paymentDate) : null;
  const parsedDeadline = input.activationDeadline ? new Date(input.activationDeadline) : null;

  const db = await getDb();
  if (!db || useInMemory) {
    const newId = Math.max(0, ...inMemoryOffers.map((o) => o.id)) + 1;
    const newOffer: OfferAgreement = {
      ...input,
      id: newId,
      sponsorId: input.sponsorId,
      companyName,
      eventInitiative: input.eventInitiative ?? "Annual Hackathon",
      offerType: input.offerType ?? "Gold Tier",
      offerDescription: input.offerDescription ?? "",
      cashValue: cash.toFixed(2),
      inKindValue: inKind.toFixed(2),
      totalValue: total,
      offerDate: parsedOfferDate,
      decisionStatus: input.decisionStatus ?? "Draft",
      agreementStatus: input.agreementStatus ?? "Pending",
      agreementLink: input.agreementLink ?? null,
      invoiceNumber: input.invoiceNumber ?? `INV-2026-${String(newId).padStart(3, "0")}`,
      invoiceDate: parsedInvoiceDate,
      paymentStatus: input.paymentStatus ?? "Pending",
      amountReceived: (input.amountReceived ?? "0").toString(),
      paymentDate: parsedPaymentDate,
      deliverablesPromised: input.deliverablesPromised ?? "",
      clubDeliverables: input.clubDeliverables ?? "",
      activationDeadline: parsedDeadline,
      ownerId: input.ownerId ?? 1,
      notes: input.notes ?? "",
      createdAt: new Date(),
    };
    inMemoryOffers.unshift(newOffer);
    return newOffer;
  }

  await db.insert(offersAgreements).values({
    ...input,
    companyName,
    totalValue: total,
    offerDate: parsedOfferDate,
    invoiceDate: parsedInvoiceDate,
    paymentDate: parsedPaymentDate,
    activationDeadline: parsedDeadline,
  });
  return input as OfferAgreement;
}

export async function updateOffer(id: number, input: Partial<InsertOfferAgreement>): Promise<OfferAgreement> {
  const db = await getDb();
  if (!db || useInMemory) {
    const index = inMemoryOffers.findIndex((o) => o.id === id);
    if (index === -1) throw new Error("Offer not found");
    const existing = inMemoryOffers[index];

    const cash = input.cashValue != null ? parseFloat(input.cashValue.toString() || "0") : parseFloat(existing.cashValue || "0");
    const inKind = input.inKindValue != null ? parseFloat(input.inKindValue.toString() || "0") : parseFloat(existing.inKindValue || "0");
    const total = (cash + inKind).toFixed(2);

    const updated: OfferAgreement = {
      ...existing,
      ...input,
      id,
      cashValue: cash.toFixed(2),
      inKindValue: inKind.toFixed(2),
      totalValue: total,
      offerDate: input.offerDate ? new Date(input.offerDate) : existing.offerDate,
      invoiceDate: input.invoiceDate ? new Date(input.invoiceDate) : existing.invoiceDate,
      paymentDate: input.paymentDate ? new Date(input.paymentDate) : existing.paymentDate,
      activationDeadline: input.activationDeadline ? new Date(input.activationDeadline) : existing.activationDeadline,
    };
    inMemoryOffers[index] = updated;
    return updated;
  }

  await db.update(offersAgreements).set(input).where(eq(offersAgreements.id, id));
  const res = await db.select().from(offersAgreements).where(eq(offersAgreements.id, id)).limit(1);
  return res[0];
}

export async function deleteOffer(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db || useInMemory) {
    inMemoryOffers = inMemoryOffers.filter((o) => o.id !== id);
    return true;
  }
  await db.delete(offersAgreements).where(eq(offersAgreements.id, id));
  return true;
}

// ==========================================
// GLOBAL SEARCH
// ==========================================

export async function globalSearch(query: string) {
  if (!query || query.trim().length === 0) {
    return { sponsors: [], contacts: [], logs: [], offers: [] };
  }
  const q = query.trim().toLowerCase();

  const matchedSponsors = inMemorySponsors
    .filter(
      (s) =>
        s.companyName.toLowerCase().includes(q) ||
        s.industry?.toLowerCase().includes(q) ||
        s.displayId.toLowerCase().includes(q) ||
        s.notes?.toLowerCase().includes(q)
    )
    .slice(0, 6);

  const matchedContacts = inMemoryContacts
    .filter(
      (c) =>
        c.contactName.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.companyName?.toLowerCase().includes(q)
    )
    .slice(0, 6);

  const matchedLogs = inMemoryLogs
    .filter(
      (l) =>
        l.companyName?.toLowerCase().includes(q) ||
        l.interactionSummary?.toLowerCase().includes(q) ||
        l.responseResult?.toLowerCase().includes(q)
    )
    .slice(0, 6);

  const matchedOffers = inMemoryOffers
    .filter(
      (o) =>
        o.companyName?.toLowerCase().includes(q) ||
        o.eventInitiative?.toLowerCase().includes(q) ||
        o.offerType?.toLowerCase().includes(q)
    )
    .slice(0, 6);

  return {
    sponsors: matchedSponsors,
    contacts: matchedContacts,
    logs: matchedLogs,
    offers: matchedOffers,
  };
}
