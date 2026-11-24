# RepoSentry

> Open-source dependency vulnerability scanner for public GitHub repositories.

RepoSentry scans public GitHub repositories, analyzes dependency lockfiles (npm, Python, etc.), queries OSV.dev for known vulnerabilities, and provides risk scores with actionable remediation guidance — all powered by AI.

## ✨ Features

- **Multi-Ecosystem Scanning** — Supports npm (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`), Python (`requirements.txt`, `poetry.lock`), and more.
- **Real Vulnerability Intelligence** — Queries [OSV.dev](https://osv.dev) — Google's open-source vulnerability database — for accurate, up-to-date CVE data.
- **Risk Scoring Engine** — Computes a comprehensive risk score based on severity weights, CVSS scores, and exploitability factors.
- **AI-Powered Explanations** — Optional Gemini-powered vulnerability explanations and remediation suggestions.
- **Exportable Reports** — Download scan results as JSON or CSV for integration with CI/CD pipelines.
- **Responsive & Accessible** — Built with Tailwind CSS, WCAG 2.1 AA compliant, reduced-motion support.

## 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| **Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, CSS Variables |
| **Animations** | Framer Motion |
| **UI Components** | Custom components, Lucide React icons |
| **API Integration** | GitHub REST API, OSV.dev API, Google Gemini |
| **Deployment** | Vercel |

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm
- A public GitHub repository URL to scan

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/reposentry.git
cd reposentry

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SITE_URL` | Production site URL | Yes |
| `GITHUB_TOKEN` | GitHub token (optional, increases rate limit) | No |
| `GEMINI_API_KEY` | Google Gemini API key for AI explanations | No |
| `GEMINI_MODEL` | Gemini model (default: `gemini-2.0-flash-exp`) | No |

> **Note:** The core scanning functionality works without any API keys. The AI explanation feature is optional.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── scan/           # Core scan pipeline API
│   │   ├── export/         # Export reports API
│   │   └── ai/             # AI explanation endpoint
│   ├── globals.css         # Global styles & Tailwind
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Landing page
│   ├── not-found.tsx       # 404 page
│   ├── sitemap.ts          # Dynamic sitemap
│   └── robots.ts           # Robots.txt
├── components/
│   ├── scan/               # Scan form & progress UI
│   ├── dashboard/          # Results dashboard components
│   └── ui/                 # Reusable UI components
├── config/
│   └── site.ts             # Site configuration
├── lib/
│   ├── github/             # GitHub API client
│   └── parser/             # Dependency file parsers
├── types/                  # TypeScript type definitions
└── utils/
    └── cn.ts               # Class name utility
```

## 🔧 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
npm run type-check # TypeScript type checking
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## 📊 How It Works

1. **Enter Repository** — Paste a public GitHub repository URL.
2. **Analyze Lockfiles** — RepoSentry fetches and parses supported dependency lockfiles.
3. **Query OSV.dev** — Each dependency is checked against OSV.dev's vulnerability database.
4. **Compute Risk Score** — A composite risk score is calculated based on severity and exploitability.
5. **Review Findings** — Detailed report with remediation guidance and AI-powered explanations (optional).

## ⚠️ Disclaimer

This tool provides security intelligence for **educational purposes only**. Always consult professional security audits for production systems. Data is processed in real-time and not persisted beyond the session.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License — feel free to use this for your own projects.

## 🙏 Acknowledgments

- [OSV.dev](https://osv.dev) — Google's open vulnerability database
- [GitHub API](https://docs.github.com/en/rest) — Repository metadata
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS framework
- [Lucide](https://lucide.dev) — Beautiful icons

---

Built with ❤️ for the open-source community.
