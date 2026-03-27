/**
 * Seed script for VentureMind demo data.
 * Run with: npm run db:seed
 *
 * Generates:
 * - 2 organizations
 * - 3 funds (2 in org1, 1 in org2)
 * - 50 companies across both orgs
 * - 80 deals across funds
 * - 200 contacts with roles
 * - 10 LPs with fund commitments
 * - 20 meetings
 * - 30 tasks
 * - 50 tags with associations
 * - Audit log entries
 */

import { randomUUID } from "crypto";

// Seed data generation functions (independent of DB — can be tested without connection)

const SECTORS = [
  "Fintech", "Healthcare", "AI/ML", "SaaS", "Cybersecurity",
  "EdTech", "CleanTech", "Biotech", "E-Commerce", "DevTools",
  "Enterprise", "Consumer", "Logistics", "PropTech", "InsurTech",
];

const FIRST_NAMES = [
  "Alice", "Bob", "Carol", "David", "Emma", "Frank", "Grace", "Henry",
  "Ivy", "Jack", "Kate", "Leo", "Mia", "Noah", "Olivia", "Paul",
  "Quinn", "Ryan", "Sarah", "Tom", "Uma", "Victor", "Wendy", "Xander",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
];

const COMPANY_PREFIXES = [
  "Acme", "Nova", "Apex", "Pulse", "Quantum", "Nebula", "Vertex", "Echo",
  "Cipher", "Flux", "Orbit", "Prime", "Zenith", "Atlas", "Spark",
];

const COMPANY_SUFFIXES = [
  "Labs", "AI", "Tech", "Systems", "Health", "Pay", "Cloud", "Data",
  "Logic", "Dynamics", "Bio", "Analytics", "Works", "Hub", "IO",
];

const DEAL_STAGES = [
  "sourced", "screening", "due_diligence", "ic_review",
  "term_sheet", "closed_won", "closed_lost", "passed",
] as const;

const COMPANY_STAGES = [
  "pre_seed", "seed", "series_a", "series_b", "series_c",
] as const;

const CONTACT_TYPES = [
  "founder", "executive", "investor", "advisor", "lp", "other",
] as const;

const LP_TYPES = [
  "individual", "family_office", "institution", "fund_of_funds", "endowment",
] as const;

const MEETING_TYPES = [
  "pitch", "follow_up", "board", "ic", "internal",
] as const;

const TAG_CATEGORIES = ["sector", "stage", "source", "priority", "custom"];
const TAG_COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export function generateSeedData() {
  // Organizations
  const org1Id = randomUUID();
  const org2Id = randomUUID();

  const organizations = [
    { id: org1Id, clerkOrgId: "org_seed_001", name: "Horizon Ventures", slug: "horizon-ventures", plan: "pro" as const },
    { id: org2Id, clerkOrgId: "org_seed_002", name: "Summit Capital", slug: "summit-capital", plan: "free" as const },
  ];

  // Funds (3 total: 2 in org1, 1 in org2)
  const fund1Id = randomUUID();
  const fund2Id = randomUUID();
  const fund3Id = randomUUID();

  const fundsList = [
    { id: fund1Id, orgId: org1Id, name: "Horizon Fund I", vintageYear: 2023, targetSizeUsd: 50_000_000, status: "active" as const },
    { id: fund2Id, orgId: org1Id, name: "Horizon Fund II", vintageYear: 2025, targetSizeUsd: 100_000_000, status: "raising" as const },
    { id: fund3Id, orgId: org2Id, name: "Summit Seed Fund", vintageYear: 2024, targetSizeUsd: 25_000_000, status: "active" as const },
  ];

  // Companies (50)
  const companiesList = Array.from({ length: 50 }, (_, i) => ({
    id: randomUUID(),
    orgId: i < 35 ? org1Id : org2Id,
    name: `${pick(COMPANY_PREFIXES)} ${pick(COMPANY_SUFFIXES)}`,
    sector: pick(SECTORS),
    stage: pick(COMPANY_STAGES),
    website: `https://${pick(COMPANY_PREFIXES).toLowerCase()}${pick(COMPANY_SUFFIXES).toLowerCase()}.com`,
    description: `Innovative ${pick(SECTORS)} company building next-gen solutions.`,
  }));

  // Deals (80)
  const dealsList = Array.from({ length: 80 }, (_, i) => {
    const orgId = i < 55 ? org1Id : org2Id;
    const fundId = i < 35 ? fund1Id : i < 55 ? fund2Id : fund3Id;
    const company = companiesList[i % companiesList.length];
    return {
      id: randomUUID(),
      orgId,
      fundId,
      companyId: company.id,
      title: `${company.name} — ${pick(["Series A", "Seed", "Series B", "Bridge", "Pre-Seed"])}`,
      stage: pick(DEAL_STAGES),
      priority: pick(["low", "medium", "high", "urgent"] as const),
      source: pick(["Referral", "Inbound", "Conference", "Cold Outreach", "Network"]),
    };
  });

  // Contacts (200)
  const contactsList = Array.from({ length: 200 }, (_, i) => ({
    id: randomUUID(),
    orgId: i < 140 ? org1Id : org2Id,
    firstName: pick(FIRST_NAMES),
    lastName: pick(LAST_NAMES),
    email: `${pick(FIRST_NAMES).toLowerCase()}.${pick(LAST_NAMES).toLowerCase()}${i}@example.com`,
    phone: `+1${String(Math.floor(Math.random() * 9_000_000_000 + 1_000_000_000))}`,
    type: pick(CONTACT_TYPES),
    title: pick(["CEO", "CTO", "CFO", "Partner", "Associate", "VP Engineering", "Head of Product", "Analyst"]),
    bio: `Experienced professional in ${pick(SECTORS)}.`,
  }));

  // LPs (10)
  const lpsList = Array.from({ length: 10 }, (_, i) => ({
    id: randomUUID(),
    orgId: i < 7 ? org1Id : org2Id,
    name: `${pick(LAST_NAMES)} ${pick(["Family Office", "Endowment", "Trust", "Holdings", "Capital"])}`,
    type: pick(LP_TYPES),
    committedCapitalUsd: Math.floor(Math.random() * 10_000_000) + 500_000,
  }));

  // Fund-LP commitments
  const fundLpsList = lpsList.map((lp) => ({
    fundId: lp.orgId === org1Id ? pick([fund1Id, fund2Id]) : fund3Id,
    lpId: lp.id,
    committedAmount: lp.committedCapitalUsd,
    commitmentDate: new Date(2023 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), 1),
  }));

  // Meetings (20)
  const meetingsList = Array.from({ length: 20 }, (_, i) => ({
    id: randomUUID(),
    orgId: i < 14 ? org1Id : org2Id,
    title: `${pick(["Q1 Review", "Pitch Meeting", "Board Update", "IC Session", "Team Standup", "LP Update", "Follow-up Call"])} #${i + 1}`,
    date: new Date(2026, Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1),
    type: pick(MEETING_TYPES),
    summary: `Discussion about ${pick(SECTORS)} portfolio and pipeline.`,
    actionItems: JSON.stringify([
      { item: "Follow up with founders", assignee: pick(FIRST_NAMES), done: false },
      { item: "Prepare term sheet draft", assignee: pick(FIRST_NAMES), done: Math.random() > 0.5 },
    ]),
  }));

  // Tasks (30)
  const tasksList = Array.from({ length: 30 }, (_, i) => ({
    id: randomUUID(),
    orgId: i < 21 ? org1Id : org2Id,
    title: pick([
      "Review pitch deck", "Schedule follow-up call", "Prepare IC memo",
      "Complete DD checklist", "Draft term sheet", "Update CRM records",
      "Send LP report", "Review financial model", "Check references",
      "Prepare board materials",
    ]),
    description: `Task related to ${pick(SECTORS)} deal.`,
    status: pick(["todo", "in_progress", "done"] as const),
    priority: pick(["low", "medium", "high", "urgent"] as const),
    dueDate: new Date(2026, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1),
    dealId: dealsList[i % dealsList.length].id,
  }));

  // Tags (50)
  const tagsList = Array.from({ length: 50 }, (_, i) => ({
    id: randomUUID(),
    orgId: i < 35 ? org1Id : org2Id,
    name: i < 15 ? SECTORS[i] : `${pick(TAG_CATEGORIES)}-${pick(["hot", "warm", "cold", "follow-up", "urgent", "new", "key", "strategic"])}${i}`,
    color: pick(TAG_COLORS),
    category: pick(TAG_CATEGORIES),
  }));

  // Deal-tag associations
  const dealTagsList = dealsList.slice(0, 40).flatMap((deal) => {
    const tags = pickN(tagsList.filter((t) => t.orgId === deal.orgId), 2);
    return tags.map((tag) => ({ dealId: deal.id, tagId: tag.id }));
  });

  // Company-tag associations
  const companyTagsList = companiesList.slice(0, 30).flatMap((company) => {
    const tags = pickN(tagsList.filter((t) => t.orgId === company.orgId), 2);
    return tags.map((tag) => ({ companyId: company.id, tagId: tag.id }));
  });

  // Audit log entries
  const auditLogsList = Array.from({ length: 20 }, (_, i) => ({
    id: randomUUID(),
    orgId: i < 14 ? org1Id : org2Id,
    actorId: `user_${pick(FIRST_NAMES).toLowerCase()}_${i}`,
    action: pick(["create", "update", "view"] as const),
    entityType: pick(["deal", "company", "contact", "fund"]),
    entityId: pick([...dealsList, ...companiesList]).id,
    changes: JSON.stringify({ field: "status", from: "draft", to: "active" }),
  }));

  return {
    organizations,
    funds: fundsList,
    companies: companiesList,
    deals: dealsList,
    contacts: contactsList,
    lps: lpsList,
    fundLps: fundLpsList,
    meetings: meetingsList,
    tasks: tasksList,
    tags: tagsList,
    dealTags: dealTagsList,
    companyTags: companyTagsList,
    auditLogs: auditLogsList,
  };
}

// Expected counts for test verification
export const SEED_COUNTS = {
  organizations: 2,
  funds: 3,
  companies: 50,
  deals: 80,
  contacts: 200,
  lps: 10,
  meetings: 20,
  tasks: 30,
  tags: 50,
  auditLogs: 20,
} as const;

// Main execution (only when run directly)
if (require.main === module) {
  const data = generateSeedData();
  console.log("Generated seed data:");
  console.log(`  Organizations: ${data.organizations.length}`);
  console.log(`  Funds: ${data.funds.length}`);
  console.log(`  Companies: ${data.companies.length}`);
  console.log(`  Deals: ${data.deals.length}`);
  console.log(`  Contacts: ${data.contacts.length}`);
  console.log(`  LPs: ${data.lps.length}`);
  console.log(`  Meetings: ${data.meetings.length}`);
  console.log(`  Tasks: ${data.tasks.length}`);
  console.log(`  Tags: ${data.tags.length}`);
  console.log(`  Deal-Tag associations: ${data.dealTags.length}`);
  console.log(`  Company-Tag associations: ${data.companyTags.length}`);
  console.log(`  Audit logs: ${data.auditLogs.length}`);
  console.log("\nTo insert into database, import and use with Drizzle db.insert()");
}
