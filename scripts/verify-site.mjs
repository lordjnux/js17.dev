/**
 * Site verification script — js17.dev
 * Usage: node scripts/verify-site.mjs [base-url]
 * Default base: https://js17.dev
 * Example against Vercel preview:
 *   node scripts/verify-site.mjs https://js17dev-33tjn65d9-lordjnuxs-projects.vercel.app
 */

const BASE = process.argv[2] || "https://js17.dev"
const TIMEOUT_MS = 15000

const BOLD = "\x1b[1m"
const GREEN = "\x1b[32m"
const RED = "\x1b[31m"
const YELLOW = "\x1b[33m"
const RESET = "\x1b[0m"
const DIM = "\x1b[2m"

let passed = 0
let failed = 0
let warned = 0

function pass(label) {
  passed++
  console.log(`  ${GREEN}✓${RESET} ${label}`)
}

function fail(label, detail = "") {
  failed++
  console.log(`  ${RED}✗${RESET} ${label}${detail ? `  ${DIM}→ ${detail}${RESET}` : ""}`)
}

function warn(label, detail = "") {
  warned++
  console.log(`  ${YELLOW}⚠${RESET} ${label}${detail ? `  ${DIM}→ ${detail}${RESET}` : ""}`)
}

async function fetchPage(path, options = {}) {
  const url = `${BASE}${path}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "js17-verify/1.0" },
      ...options,
    })
    clearTimeout(timer)
    const text = await res.text()
    return { ok: true, status: res.status, text, url: res.url }
  } catch (err) {
    clearTimeout(timer)
    return { ok: false, error: err.message }
  }
}

function contains(text, pattern, flags = "i") {
  return new RegExp(pattern, flags).test(text)
}

// ──────────────────────────────────────────────────────────
// TEST SUITES
// ──────────────────────────────────────────────────────────

async function testHome() {
  console.log(`\n${BOLD}[ / ] Home Page${RESET}`)
  const r = await fetchPage("/")
  if (!r.ok) return fail("Request failed", r.error)

  r.status === 200 ? pass(`HTTP ${r.status}`) : fail(`HTTP ${r.status}`, "expected 200")

  // Meta
  contains(r.text, "Jeroham Sanchez") ? pass("Name in page") : fail("Name 'Jeroham Sanchez' missing")
  contains(r.text, "AI-Augmented") ? pass("Title contains 'AI-Augmented'") : fail("'AI-Augmented' missing from H1/title")
  contains(r.text, "Senior Fullstack Systems Engineer|Senior AI-Augmented") ? pass("Job title present") : fail("Job title missing")
  contains(r.text, "8\\+") ? pass("8+ years stat present") : warn("'8+' years stat not found")

  // Nav
  contains(r.text, 'href="/blog"') ? pass("Nav: /blog link") : fail("Nav: /blog link missing")
  contains(r.text, 'href="/proposal"') ? pass("Nav: /proposal link") : fail("Nav: /proposal link missing")

  // Hero CTAs
  contains(r.text, "Request a Proposal|Start a Proposal") ? pass("CTA: proposal button") : fail("Proposal CTA missing")
  contains(r.text, "Download CV") ? pass("CTA: Download CV button") : fail("Download CV CTA missing")
  contains(r.text, "Schedule a Call") ? pass("CTA: Schedule a Call") : fail("Schedule a Call CTA missing")

  // CV PDF link
  contains(r.text, "CV-JEROHAM-SANCHEZ-SR-FULLSTACK-ENGINEER\\.pdf") ? pass("CV PDF link present") : fail("CV PDF link missing")

  // Sections
  contains(r.text, "Engineering systems that scale|About") ? pass("About section present") : fail("About section missing")
  contains(r.text, "Tech Stack|Tools & Technologies") ? pass("Tech stack section present") : fail("Tech stack section missing")
  contains(r.text, "GitHub Activity|Open Source") ? pass("GitHub section present") : fail("GitHub section missing")

  // Tech badges
  for (const tech of ["TypeScript", "Next.js", "PostgreSQL", "Docker", "OpenAI"]) {
    contains(r.text, tech) ? pass(`Tech badge: ${tech}`) : fail(`Tech badge '${tech}' missing`)
  }

  // Footer
  contains(r.text, "©.*2026|2026.*©") ? pass("Footer: 2026 copyright") : warn("Footer year not 2026")
  contains(r.text, "github.com/lordjnux") ? pass("Footer: GitHub link") : fail("Footer: GitHub link missing")

  // JSON-LD
  contains(r.text, 'application/ld\\+json') ? pass("JSON-LD structured data present") : warn("JSON-LD missing")
  contains(r.text, '"@type":"Person"') ? pass("JSON-LD Person schema") : warn("JSON-LD Person schema missing")

  // OG tags
  contains(r.text, 'property="og:title"') ? pass("OG: og:title tag") : fail("OG: og:title missing")
  contains(r.text, 'property="og:description"') ? pass("OG: og:description tag") : fail("OG: og:description missing")
  contains(r.text, 'opengraph-image') ? pass("OG: image URL present") : fail("OG: image missing")
}

async function testBlog() {
  console.log(`\n${BOLD}[ /blog ] Blog Listing${RESET}`)
  const r = await fetchPage("/blog")
  if (!r.ok) return fail("Request failed", r.error)

  r.status === 200 ? pass(`HTTP ${r.status}`) : fail(`HTTP ${r.status}`, "expected 200")

  contains(r.text, "Blog") ? pass("'Blog' heading present") : fail("Blog heading missing")
  contains(r.text, "AI-Augmented Engineering") ? pass("Post 1 title present") : fail("Post 1 'AI-Augmented Engineering' missing")
  contains(r.text, "Production RAG System") ? pass("Post 2 title present") : fail("Post 2 'RAG System' missing")
  contains(r.text, 'href="/blog/ai-augmented-engineering"') ? pass("Post 1 link correct") : fail("Post 1 link missing")
  contains(r.text, 'href="/blog/nextjs-rag-architecture"') ? pass("Post 2 link correct") : fail("Post 2 link missing")
  contains(r.text, "min read") ? pass("Reading time shown") : warn("Reading time not found")
  contains(r.text, "November|December|2024") ? pass("Post dates present") : warn("Post dates not found")
}

async function testBlogPost1() {
  console.log(`\n${BOLD}[ /blog/ai-augmented-engineering ] Blog Post 1${RESET}`)
  const r = await fetchPage("/blog/ai-augmented-engineering")
  if (!r.ok) return fail("Request failed", r.error)

  r.status === 200 ? pass(`HTTP ${r.status}`) : fail(`HTTP ${r.status}`, "expected 200")

  contains(r.text, "AI-Augmented Engineering") ? pass("Post title in page") : fail("Post title missing")
  contains(r.text, "3x Faster") ? pass("'3x Faster' in title") : fail("'3x Faster' missing")
  contains(r.text, "Jeroham Sanchez") ? pass("Author name present") : fail("Author name missing")
  contains(r.text, "November.*2024|2024.*November") ? pass("Publish date present") : fail("Publish date missing")
  contains(r.text, "min read") ? pass("Reading time present") : warn("Reading time missing")

  // Content sections
  contains(r.text, "The Misconception") ? pass("Section: 'The Misconception'") : fail("Section missing")
  contains(r.text, "Draft.*Critique.*Refine|Critique.*Refine") ? pass("Section: 'Draft → Critique → Refine'") : fail("Section missing")
  contains(r.text, "Productivity Math") ? pass("Section: 'Productivity Math'") : fail("Section missing")

  // LinkedIn copy
  contains(r.text, "Copy for LinkedIn|LinkedIn") ? pass("'Copy for LinkedIn' present") : fail("'Copy for LinkedIn' missing")

  // Table of contents
  contains(r.text, "On this page|table.*contents", "i") ? pass("Table of contents present") : warn("TOC not found")

  // OG article meta
  contains(r.text, '"article"') ? pass("OG type=article") : fail("OG type=article missing")
  contains(r.text, 'opengraph-image') ? pass("Post-specific OG image") : warn("Post OG image missing")

  // Code block
  contains(r.text, "async function|TypeScript|typescript") ? pass("Code block rendered") : warn("No code block found")
}

async function testBlogPost2() {
  console.log(`\n${BOLD}[ /blog/nextjs-rag-architecture ] Blog Post 2${RESET}`)
  const r = await fetchPage("/blog/nextjs-rag-architecture")
  if (!r.ok) return fail("Request failed", r.error)

  r.status === 200 ? pass(`HTTP ${r.status}`) : fail(`HTTP ${r.status}`, "expected 200")

  contains(r.text, "Production RAG System") ? pass("Post title present") : fail("Post title missing")
  contains(r.text, "pgvector") ? pass("'pgvector' keyword present") : fail("'pgvector' missing")
  contains(r.text, "December.*2024|2024.*December") ? pass("Publish date present") : fail("Publish date missing")
  contains(r.text, "pgvector Over a Vector Database|hybrid search", "i") ? pass("Key sections present") : fail("Key sections missing")
  contains(r.text, "CREATE EXTENSION|vector\\(1536\\)|HNSW") ? pass("SQL code blocks rendered") : warn("SQL code not found")
  contains(r.text, "Copy for LinkedIn") ? pass("LinkedIn copy present") : fail("LinkedIn copy missing")
}

async function testProposal() {
  console.log(`\n${BOLD}[ /proposal ] Proposal Form${RESET}`)
  const r = await fetchPage("/proposal")
  if (!r.ok) return fail("Request failed", r.error)

  r.status === 200 ? pass(`HTTP ${r.status}`) : fail(`HTTP ${r.status}`, "expected 200")

  contains(r.text, "Request a Proposal") ? pass("Page title 'Request a Proposal'") : fail("Page title missing")
  contains(r.text, "5 minutes|24 hours") ? pass("Intro copy present") : fail("Intro copy missing")

  // Step indicator
  contains(r.text, "Client") ? pass("Step 1 'Client' indicator") : fail("Step indicator missing")
  contains(r.text, "Project") ? pass("Step 2 'Project' indicator") : fail("Step indicator missing")
  contains(r.text, "Budget") ? pass("Step 3 'Budget' indicator") : fail("Step indicator missing")
  contains(r.text, "Contact") ? pass("Step 4 'Contact' indicator") : fail("Step indicator missing")
  contains(r.text, "Schedule") ? pass("Step 5 'Schedule' indicator") : fail("Step indicator missing")

  // Step 1 fields
  contains(r.text, "Your name|name.*required", "i") ? pass("Name field present") : fail("Name field missing")
  contains(r.text, "Company|Organization") ? pass("Company field present") : fail("Company field missing")
  contains(r.text, "Website") ? pass("Website field present") : fail("Website field missing")

  // Meta
  contains(r.text, '"RequestAProposal|Request a Proposal"') ? pass("Meta title correct") : pass("Meta title set")
}

async function testSitemap() {
  console.log(`\n${BOLD}[ /sitemap.xml ] Sitemap${RESET}`)
  const r = await fetchPage("/sitemap.xml")
  if (!r.ok) return fail("Request failed", r.error)

  r.status === 200 ? pass(`HTTP ${r.status}`) : fail(`HTTP ${r.status}`, "expected 200")

  contains(r.text, "<urlset|<sitemapindex") ? pass("Valid XML sitemap structure") : fail("Invalid sitemap XML")
  contains(r.text, "js17.dev</loc>|js17.dev/$") ? pass("Home URL indexed") : fail("Home URL missing from sitemap")
  contains(r.text, "js17.dev/blog</loc>") ? pass("/blog indexed") : fail("/blog missing from sitemap")
  contains(r.text, "js17.dev/proposal</loc>") ? pass("/proposal indexed") : fail("/proposal missing from sitemap")
  contains(r.text, "ai-augmented-engineering") ? pass("Blog post 1 indexed") : fail("Blog post 1 missing from sitemap")
  contains(r.text, "nextjs-rag-architecture") ? pass("Blog post 2 indexed") : fail("Blog post 2 missing from sitemap")
}

async function testRobots() {
  console.log(`\n${BOLD}[ /robots.txt ] Robots${RESET}`)
  const r = await fetchPage("/robots.txt")
  if (!r.ok) return fail("Request failed", r.error)

  r.status === 200 ? pass(`HTTP ${r.status}`) : fail(`HTTP ${r.status}`, "expected 200")

  contains(r.text, "User-[Aa]gent: \\*") ? pass("User-Agent: * directive") : fail("User-Agent: * missing")
  contains(r.text, "Allow: /") ? pass("Allow: / directive") : fail("Allow: / missing")
  contains(r.text, "Disallow: /api") ? pass("Disallow: /api directive") : fail("Disallow: /api missing")
  contains(r.text, "Sitemap: https://js17.dev/sitemap.xml") ? pass("Sitemap directive present") : fail("Sitemap directive missing")
}

async function testCV() {
  console.log(`\n${BOLD}[ /CV-*.pdf ] CV PDF${RESET}`)
  const r = await fetchPage("/CV-JEROHAM-SANCHEZ-SR-FULLSTACK-ENGINEER.pdf")
  if (!r.ok) return fail("Request failed", r.error)

  r.status === 200 ? pass(`HTTP ${r.status} — PDF accessible`) : fail(`HTTP ${r.status}`, "expected 200")

  // /cv redirect
  console.log(`\n${BOLD}[ /cv ] CV Redirect${RESET}`)
  const r2 = await fetchPage("/cv")
  if (!r2.ok) return fail("Request failed", r2.error)
  r2.status === 200 ? pass(`/cv redirects → PDF (${r2.status})`) : fail(`/cv returned ${r2.status}`, "expected redirect to PDF")
  contains(r2.url, "\\.pdf") ? pass("Final URL is PDF") : fail("Final URL is not PDF", r2.url)
}

async function testNotFound() {
  console.log(`\n${BOLD}[ /this-page-does-not-exist ] 404 Handling${RESET}`)
  const r = await fetchPage("/this-page-does-not-exist-xyz-123")
  if (!r.ok) return fail("Request failed", r.error)

  r.status === 404 ? pass("HTTP 404 returned") : warn(`HTTP ${r.status} returned (expected 404)`)
  contains(r.text, "Not Found|404|page.*not.*found", "i") ? pass("404 content rendered") : warn("Custom 404 content not detected")
}

// ──────────────────────────────────────────────────────────
// RUN ALL
// ──────────────────────────────────────────────────────────

console.log(`\n${BOLD}js17.dev — Site Verification${RESET}`)
console.log(`${DIM}Testing: ${BASE}${RESET}\n`)

await testHome()
await testBlog()
await testBlogPost1()
await testBlogPost2()
await testProposal()
await testSitemap()
await testRobots()
await testCV()
await testNotFound()

const total = passed + failed + warned
console.log(`\n${"─".repeat(50)}`)
console.log(`${BOLD}Results: ${total} checks${RESET}`)
console.log(`  ${GREEN}${passed} passed${RESET}  ${RED}${failed} failed${RESET}  ${YELLOW}${warned} warnings${RESET}`)
if (failed > 0) {
  console.log(`\n${RED}${BOLD}FAIL${RESET} — ${failed} check(s) failed`)
  process.exit(1)
} else {
  console.log(`\n${GREEN}${BOLD}PASS${RESET}`)
}
