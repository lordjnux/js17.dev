export const SITE_CONFIG = {
  name: "Jeroham Sanchez",
  title: "Jeroham Sanchez — Senior AI-Augmented Fullstack Systems Engineer",
  description:
    "Senior Fullstack Systems Engineer specializing in AI-augmented development, scalable architectures, and cloud-native solutions. 8+ years building production systems.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://js17.dev",
  ogImage: "/og-default.png",
  cvUrl: "/CV-JEROHAM-SANCHEZ-SR-FULLSTACK-ENGINEER.pdf",
  github: "https://github.com/lordjnux",
  githubUsername: process.env.NEXT_PUBLIC_GITHUB_USERNAME || "lordjnux",
  linkedin: "https://linkedin.com/in/jeroham-sanchez",
  email: "proposals@js17.dev",
  calcom: {
    username: process.env.NEXT_PUBLIC_CALCOM_USERNAME || "jeroham-sanchez",
    eventType: process.env.NEXT_PUBLIC_CALCOM_EVENT_TYPE || "30min",
  },
}

export const TECH_STACK = {
  AI: [
    { name: "OpenAI API", level: "expert" },
    { name: "LangChain", level: "advanced" },
    { name: "LlamaIndex", level: "advanced" },
    { name: "Anthropic Claude", level: "expert" },
    { name: "Vercel AI SDK", level: "expert" },
    { name: "Ollama", level: "advanced" },
    { name: "Hugging Face", level: "intermediate" },
    { name: "RAG Systems", level: "expert" },
  ],
  Frontend: [
    { name: "React / Next.js", level: "expert" },
    { name: "TypeScript", level: "expert" },
    { name: "Tailwind CSS", level: "expert" },
    { name: "Framer Motion", level: "advanced" },
    { name: "shadcn/ui", level: "expert" },
    { name: "Zustand", level: "advanced" },
    { name: "React Query", level: "advanced" },
    { name: "Storybook", level: "advanced" },
  ],
  Backend: [
    { name: "Node.js", level: "expert" },
    { name: "Python / FastAPI", level: "advanced" },
    { name: "PostgreSQL", level: "expert" },
    { name: "Redis", level: "advanced" },
    { name: "GraphQL", level: "advanced" },
    { name: "REST APIs", level: "expert" },
    { name: "Prisma", level: "expert" },
    { name: "tRPC", level: "advanced" },
  ],
  DevOps: [
    { name: "Docker", level: "expert" },
    { name: "Kubernetes", level: "advanced" },
    { name: "Vercel", level: "expert" },
    { name: "AWS", level: "advanced" },
    { name: "GitHub Actions", level: "expert" },
    { name: "Terraform", level: "intermediate" },
    { name: "Nginx", level: "advanced" },
    { name: "Cloudflare", level: "advanced" },
  ],
  Security: [
    { name: "JWT / OAuth 2.0", level: "expert" },
    { name: "NextAuth.js", level: "expert" },
    { name: "OWASP Top 10", level: "advanced" },
    { name: "Rate Limiting", level: "expert" },
    { name: "CSP Headers", level: "advanced" },
    { name: "Secret Scanning", level: "advanced" },
  ],
  Testing: [
    { name: "Vitest", level: "expert" },
    { name: "Playwright", level: "advanced" },
    { name: "Jest", level: "expert" },
    { name: "Testing Library", level: "expert" },
    { name: "k6 Load Testing", level: "intermediate" },
    { name: "Sentry", level: "advanced" },
  ],
} as const

export const NAV_ITEMS = [
  { label: "Blog", href: "/blog" },
  { label: "Changelog", href: "/changelog" },
  { label: "Proposal", href: "/proposal" },
] as const

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  "C#": "#178600",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Shell: "#89e051",
  Dockerfile: "#384d54",
  MDX: "#083fa1",
  Other: "#8b949e",
}
