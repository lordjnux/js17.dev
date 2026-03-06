/**
 * Proposal flow integration test
 * Usage: node scripts/test-proposal.mjs [base_url]
 * Default base_url: http://localhost:3000
 */

const BASE = process.argv[2] || "http://localhost:3000"
const API = `${BASE}/api/proposal`

let passed = 0
let failed = 0

function ok(label) { console.log(`  ✓  ${label}`); passed++ }
function fail(label, detail) { console.error(`  ✗  ${label}: ${detail}`); failed++ }

async function post(body) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return { status: res.status, body: await res.json() }
}

const VALID = {
  client: { name: "Test Client", company: "Acme Corp", website: "https://acme.com" },
  project: {
    title: "E-commerce Platform",
    description: "Build a full-stack e-commerce platform with product catalog and checkout.",
    type: "web-app",
    timeline: "2-3 months",
    features: ["product catalog", "cart", "checkout"],
  },
  budget: { currencies: ["USD"], hourlyRate: "120", fixedBudget: "", flexibility: "flexible" },
  contact: {
    email: "test@example.com",
    phone: "",
    timezone: "America/New_York",
    preferredContact: "email",
    additionalNotes: "",
  },
}

console.log(`\nProposal Flow Tests — ${API}\n`)

// 1. Valid submission
try {
  const { status, body } = await post(VALID)
  status === 200 && body.success
    ? ok("Valid proposal returns 200 success")
    : fail("Valid proposal", `got ${status} — ${JSON.stringify(body)}`)
} catch (e) { fail("Valid proposal (network)", e.message) }

// 2. Missing required field — no project title
try {
  const bad = structuredClone(VALID)
  bad.project.title = "sh" // too short (min 5)
  const { status } = await post(bad)
  status === 422 ? ok("Short title returns 422") : fail("Short title", `expected 422 got ${status}`)
} catch (e) { fail("Short title (network)", e.message) }

// 3. Invalid email
try {
  const bad = structuredClone(VALID)
  bad.contact.email = "not-an-email"
  const { status } = await post(bad)
  status === 422 ? ok("Invalid email returns 422") : fail("Invalid email", `expected 422 got ${status}`)
} catch (e) { fail("Invalid email (network)", e.message) }

// 4. No currency selected
try {
  const bad = structuredClone(VALID)
  bad.budget.currencies = []
  const { status } = await post(bad)
  status === 422 ? ok("Empty currencies returns 422") : fail("Empty currencies", `expected 422 got ${status}`)
} catch (e) { fail("Empty currencies (network)", e.message) }

// 5. No price field
try {
  const bad = structuredClone(VALID)
  bad.budget.hourlyRate = ""
  bad.budget.fixedBudget = ""
  const { status } = await post(bad)
  status === 422 ? ok("No price field returns 422") : fail("No price field", `expected 422 got ${status}`)
} catch (e) { fail("No price field (network)", e.message) }

// 6. Abusive content — should return 200 (moderation blocks silently)
try {
  const bad = structuredClone(VALID)
  bad.project.description = "stupid idiot project who cares dont disturb the seminar"
  const { status, body } = await post(bad)
  status === 200 && body.success
    ? ok("Abusive content silently blocked (200)")
    : fail("Abusive content moderation", `got ${status} — ${JSON.stringify(body)}`)
} catch (e) { fail("Abusive content (network)", e.message) }

// 7. Rate limit — 4th request from same IP should 429
try {
  // First 3 already used above — submit 3 more to exceed limit
  for (let i = 0; i < 3; i++) await post(VALID)
  const { status } = await post(VALID)
  status === 429 ? ok("Rate limit enforced after 3/min") : fail("Rate limit", `expected 429 got ${status}`)
} catch (e) { fail("Rate limit (network)", e.message) }

// 8. Malformed JSON
try {
  const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{bad json" })
  res.status === 400 ? ok("Malformed JSON returns 400") : fail("Malformed JSON", `expected 400 got ${res.status}`)
} catch (e) { fail("Malformed JSON (network)", e.message) }

console.log(`\n  ${passed} passed, ${failed} failed\n`)
process.exit(failed > 0 ? 1 : 0)
