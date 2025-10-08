# 🧠 ECONEURA - Enterprise AI Intelligence Platform

> **Production-ready monorepo** | 11 specialized AI agents | JWT Auth | Full observability  
> Migrated & optimized: October 8, 2025

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688)](https://fastapi.tiangolo.com)
[![Tests](https://img.shields.io/badge/Tests-585%20passing-success)](./tests)
[![Coverage](https://img.shields.io/badge/Coverage-61%25-yellow)](./coverage)

---

## 🚀 Quick Start (60 seconds)

```bash
# 1. Clone & install
git clone https://github.com/ECONEURA/Econeura.git
cd Econeura
pnpm install

# 2. Start services
docker compose -f docker-compose.dev.enhanced.yml up -d

# 3. Launch cockpit
pnpm -C apps/web dev
```

**Access:**  
🌐 Cockpit: http://localhost:3000  
🔐 Auth API: http://localhost:5000  
📊 Jaeger: http://localhost:16686  
📈 Prometheus: http://localhost:9090

---

## ⚡ What Makes ECONEURA Special

- **11 Specialized AI Agents** - Each expert in specific business domain
- **JWT Authentication** - Secure token-based auth with PostgreSQL + RLS
- **Full Observability** - OpenTelemetry + Jaeger + Prometheus + Grafana
- **Type-Safe** - 100% TypeScript with strict mode, 0 errors
- **585 Tests** - Comprehensive coverage with Vitest
- **Production Ready** - Docker Compose orchestration, health checks

---

## 📦 Architecture

```
├── apps/
│   ├── web/              # React cockpit (Vite + TypeScript)
│   ├── cockpit/          # Alternative cockpit
│   └── api_py/           # Python proxy (port 8080)
├── services/
│   ├── auth/             # JWT service (port 5000)
│   ├── observability/    # OpenTelemetry utilities
│   └── neuras/           # 11 AI microservices
│       ├── analytics/    # Data insights & BI
│       ├── cdo/          # Chief Data Officer
│       ├── cfo/          # Financial analysis
│       ├── chro/         # HR & talent management
│       ├── ciso/         # Security & compliance
│       ├── cmo/          # Marketing intelligence
│       ├── cto/          # Technology strategy
│       ├── legal/        # Legal & regulatory
│       ├── reception/    # Request routing
│       ├── research/     # R&D intelligence
│       └── support/      # Customer success
├── packages/
│   ├── shared/           # Shared types, schemas, utils
│   └── configs/          # Base configurations
├── db/
│   ├── init/             # PostgreSQL schemas + RLS
│   └── seeds/            # Test data
└── docs/                 # Complete documentation

**Tech Stack:**  
Frontend: React 18 + Vite + TypeScript 5.9 + Tailwind  
Backend: FastAPI + PostgreSQL 16 + JWT  
Observability: OpenTelemetry + Jaeger + Prometheus + Grafana  
Testing: Vitest + Testing Library  
Infra: Docker Compose + pnpm workspaces
```

---

## 🔐 Authentication

**Test Users** (password: `econeura2025`):

| Email | Role | Access |
|-------|------|--------|
| admin@econeura.com | admin | Full access |
| manager@econeura.com | manager | Team management |
| analyst@econeura.com | analyst | Agent invocation |
| viewer@econeura.com | viewer | Read-only |

**Example Usage:**
```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '\''{"email":"analyst@econeura.com","password":"econeura2025"}'\'' \
  | jq -r '\''.access_token'\'')

# Invoke agent
curl -X POST http://localhost:8080/api/invoke/neura-1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '\''{"query":"Analyze Q4 revenue"}'\''
```

---

## 🛠️ Development

```bash
# Lint all workspace
pnpm -w lint

# Type check
pnpm -w typecheck

# Run tests
pnpm -w test

# Run with coverage
pnpm -w test:coverage

# Build packages
pnpm -w build
```

---

## 📊 Project Status

**Current: Phase 5 Complete** (Auth + Observability)  
**Score: 58/100** → **Target: 95+/100** (Phase 6 in progress)

✅ **Completed:**
- JWT authentication service
- PostgreSQL with Row-Level Security
- OpenTelemetry instrumentation
- Jaeger distributed tracing
- Prometheus metrics collection
- 11 microservice foundations
- 585 tests passing
- 0 TypeScript errors

🔄 **Phase 6 (In Progress):**
- Increase test coverage to 80%+
- GitHub Actions CI/CD
- Automated Azure deployment
- API documentation (OpenAPI)
- Release v1.0.0

---

## 📚 Documentation

- [**Complete Phase 5 Guide**](./docs/FASE5_COMPLETE_GUIDE.md) - Auth + Observability setup
- [**Architecture Reality**](./docs/ARCHITECTURE_REALITY.md) - Current state vs vision
- [**Roadmap to 100%**](./docs/ROADMAP_TO_100.md) - Path from 43 to 95 points
- [**Action Plan**](./docs/ACTION_PLAN_100.md) - 6-phase implementation
- [**Architecture Decisions**](./docs/decisions.md) - ADRs and rationale

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Quick contribution flow:**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing`
3. Make changes with tests
4. Run validation: `pnpm -w lint && pnpm -w test`
5. Commit: `git commit -m '\''feat: add amazing feature'\''`
6. Push and open Pull Request

**Code Standards:**
- Conventional Commits
- ESLint + Prettier
- Minimum 50% test coverage
- TypeScript strict mode

---

## 📄 License

MIT © 2025 ECONEURA - See [LICENSE](./LICENSE) for details

---

## 🙏 Acknowledgments

Built with Express Velocity methodology - Quality over speed, AI-powered development.

**Clean migration completed:** October 8, 2025  
**Previous repo:** ECONEURA/ECONEURA- (archived)

---

<p align="center">
  <strong>Built with ❤️ using AI-first development practices</strong>
</p>

