# SecureBank Platform

Frontend dashboard for the SecureBank GRC (Governance, Risk & Compliance) platform.

## Tech Stack

| Concern | Tool |
|---|---|
| Framework | React 18 + Vite |
| Language | JavaScript |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| State | Zustand |
| HTTP | Axios |
| Charts | Recharts |
| Testing | Vitest + React Testing Library |

## Features

- **Dashboard** — KPI cards, risk trend chart, compliance scores, activity feed
- **Risk Management** — Full CRUD, heat map, severity scoring
- **Control Mapping** — Framework controls (ISO 27001, PCI-DSS, NIST CSF, SOX, GDPR)
- **Evidence Management** — File upload/download, approval workflow
- **Reports** — Generate and download compliance reports
- **Role-Based Access** — Admin, Analyst, GRC Analyst, Auditor

## Local Development

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (watch mode)
npm run test:coverage
```

Requires the [securebank-api](https://github.com/BoipheloTwala/securebank-api) backend running on port 3000.

Copy `.env.example` to `.env` and set:

```
VITE_API_URL=http://localhost:3000
VITE_ENABLE_MOCK_DATA=false
```

### Application modules 

| Module | Capability |
|--------|------------|
| **Auth & RBAC** | Login/logout, JWT access + refresh, role-based navigation |
| **Dashboard** | KPIs, risk trend (6 months), compliance by framework, activity feed |
| **Risks** | Full CRUD, filters, heat map, severity scoring |
| **Controls** | Framework controls, effectiveness, risk linking |
| **Evidence** | Multipart upload/download, approve/review workflow |
| **Reports** | Generate, poll to READY, download |

### Roles & access

| Role | Sees |
|------|------|
| `ADMIN` | Everything |
| `ANALYST` | Dashboard, Risks, Evidence |
| `GRC_ANALYST` | Dashboard, Risks, Controls, Reports |
| `AUDITOR` | Dashboard, Evidence, Reports |

### Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Administrator | `admin@securebank.com` | `Admin@SecureBank1!` |
| Security Analyst | `analyst@securebank.com` | `Analyst@SecureBank1!` |
| GRC Analyst | `grc@securebank.com` | `GrcAnalyst@SecureBank1!` |
| Auditor | `auditor@securebank.com` | `Auditor@SecureBank1!` |
