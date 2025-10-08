# 🎯 PLAN MIGRACIÓN 10/10 - Repo Perfectamente Limpio

**Objetivo:** Migrar SOLO código funcional, validado y documentado a repo nuevo  
**Target Score:** 10/10  
**Fecha:** 8 octubre 2025

---

## ✅ CHECKLIST PRE-MIGRACIÓN

### 1. Crear estructura limpia (SOLO funcional)
```
nuevo-repo/
├── apps/
│   ├── web/              # ✅ Cockpit React funcional
│   ├── api_py/           # ✅ Proxy Python (server.py + server_enhanced.py)
│   └── cockpit/          # ✅ Segundo cockpit
├── services/
│   ├── auth/             # ✅ JWT service completo
│   ├── observability/    # ✅ OpenTelemetry utils
│   └── neuras/           # ✅ 11 microservicios
├── packages/
│   ├── shared/           # ✅ Tipos compartidos
│   └── configs/          # ✅ Configs base
├── db/
│   ├── init/             # ✅ Schemas + RLS
│   └── seeds/            # ✅ Datos de prueba
├── docs/                 # ✅ SOLO documentación útil
├── scripts/              # ✅ SOLO scripts funcionales
├── tests/                # ✅ Tests organizados
├── docker-compose.dev.enhanced.yml  # ✅ Stack completo
├── monitoring/           # ✅ Prometheus config
└── .github/              # ✅ Workflows CI/CD

❌ EXCLUIR COMPLETAMENTE:
- rollback_backups/
- .disabled-packages/
- node-v20.10.0-linux-x64/
- .tools/
- *.log, *.err, *.bak.*
- WF_EVIDENCE.csv
- final_setup.sh
- Cualquier archivo > 10MB (excepto pnpm-lock.yaml)
```

### 2. Validar ANTES de copiar
```bash
cd ECONEURA-

# ✅ Lint pass
pnpm -w lint --max-warnings 0

# ✅ Typecheck pass
pnpm -w typecheck

# ✅ Tests pass
pnpm -w test --run

# ✅ Build pass
pnpm -w build

# ✅ No secrets
git secrets --scan

# ✅ Tamaño total < 100MB (sin node_modules)
du -sh --exclude=node_modules .
```

### 3. Crear archivos profesionales
- [ ] README.md completo con badges, quick start, arquitectura
- [ ] CONTRIBUTING.md con guías de contribución
- [ ] CHANGELOG.md con historial de versiones
- [ ] LICENSE (MIT)
- [ ] .gitignore completo
- [ ] .editorconfig
- [ ] CODE_OF_CONDUCT.md
- [ ] SECURITY.md

### 4. Actualizar metadatos
- [ ] package.json: URLs del nuevo repo
- [ ] package.json: version 0.5.0 (Fase 5 complete)
- [ ] package.json: description actualizada
- [ ] Todos los import paths validados

### 5. Configurar GitHub repo
- [ ] Branch protection rules (main: require PR + 1 approval)
- [ ] Enable GitHub Actions
- [ ] Configure secrets (MAKE_TOKEN, etc.)
- [ ] Add topics: typescript, react, fastapi, microservices, ai, jwt, opentelemetry
- [ ] Add description: "AI-powered business intelligence with 11 specialized agents"
- [ ] Configure CODEOWNERS
- [ ] Enable vulnerability alerts
- [ ] Enable Dependabot

---

## 🚀 PROCESO DE MIGRACIÓN 10/10

### Paso 1: Crear repo nuevo en GitHub
```
Nombre: econeura-core
Descripción: AI-powered business intelligence platform with 11 specialized agents
Visibilidad: Public/Private (a definir)
Initialize: README.md + MIT License + .gitignore (Node)
```

### Paso 2: Preparar directorio limpio local
```bash
cd C:\Users\Usuario\OneDrive\Documents\GitHub
mkdir econeura-perfect
cd econeura-perfect
git init
git remote add origin https://github.com/ECONEURA/[NUEVO-REPO].git
```

### Paso 3: Copiar SOLO funcional (rsync style)
```powershell
# Copiar estructura base
robocopy C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-\apps .\apps /E /XD node_modules __pycache__ dist build
robocopy C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-\services .\services /E /XD node_modules __pycache__ dist build
robocopy C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-\packages .\packages /E /XD node_modules __pycache__ dist build
robocopy C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-\db .\db /E

# Copiar docs ÚTILES (filtrar)
robocopy C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-\docs .\docs /E /XF *BRUTAL* *CRITICAL* *WF_*

# Copiar scripts FUNCIONALES
robocopy C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-\scripts .\scripts /E /XF *.backup

# Copiar configs raíz
copy C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-\package.json .
copy C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-\pnpm-workspace.yaml .
copy C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-\pnpm-lock.yaml .
copy C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-\tsconfig.base.json .
copy C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-\tsconfig.json .
copy C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-\vitest.config.ts .
copy C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-\vitest.workspace.ts .
copy C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-\eslint.config.js .
copy C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-\.gitignore .
copy C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-\docker-compose.dev.enhanced.yml .
copy C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-\monitoring\prometheus.yml .\monitoring\
```

### Paso 4: Crear archivos nuevos profesionales
```bash
# README.md (completo, ver template abajo)
# CONTRIBUTING.md
# CHANGELOG.md (v0.5.0 - Fase 5 Complete)
# CODE_OF_CONDUCT.md
# SECURITY.md
```

### Paso 5: Actualizar package.json URLs
```json
{
  "repository": {
    "url": "https://github.com/ECONEURA/[NUEVO-REPO].git"
  },
  "bugs": {
    "url": "https://github.com/ECONEURA/[NUEVO-REPO]/issues"
  },
  "homepage": "https://github.com/ECONEURA/[NUEVO-REPO]#readme"
}
```

### Paso 6: VALIDACIÓN COMPLETA (CRÍTICO)
```bash
# 1. Instalar
pnpm install

# 2. Lint
pnpm -w lint --max-warnings 0
# DEBE PASAR ✅

# 3. Typecheck
pnpm -w typecheck
# DEBE PASAR ✅

# 4. Build
pnpm -w build
# DEBE PASAR ✅

# 5. Tests
pnpm -w test --run
# DEBE PASAR 585/585 ✅

# 6. Coverage
pnpm -w test:coverage
# Statements ≥ 50% ✅

# 7. Docker
docker compose -f docker-compose.dev.enhanced.yml up -d
# Todos los servicios UP ✅

# 8. Health checks
curl http://localhost:5000/health  # Auth
curl http://localhost:8080/api/health  # Proxy
curl http://localhost:16686  # Jaeger
# Todos responden ✅

# 9. Auth flow
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"analyst@econeura.com","password":"econeura2025"}'
# Devuelve token ✅

# 10. Tamaño total
du -sh .
# < 100 MB (sin node_modules) ✅
```

### Paso 7: Commit inicial perfecto
```bash
git add -A
git commit -m "feat: initial commit - ECONEURA v0.5.0 (Fase 5 complete)

- ✅ 11 specialized AI agents (FastAPI microservices)
- ✅ JWT authentication service
- ✅ PostgreSQL with RLS policies
- ✅ OpenTelemetry observability (Jaeger + Prometheus + Grafana)
- ✅ React cockpit (Vite + TypeScript)
- ✅ 585 tests passing (61% coverage)
- ✅ 0 TypeScript errors
- ✅ Complete documentation (Fase 5 guide, architecture, roadmap)
- ✅ Development scripts and Docker Compose stack

Validated and functional - ready for production deployment.

Migration from: ECONEURA/ECONEURA- (cleaned and optimized)
Score: 58/100 → Target: 95+/100 (Fase 6 in progress)"
```

### Paso 8: Push con tags
```bash
git tag -a v0.5.0 -m "Release v0.5.0 - Fase 5 Complete (Auth + Observability)"
git push origin main
git push origin v0.5.0
```

### Paso 9: Configurar GitHub repo
- Settings → Branches → Add rule for `main`
  - Require pull request before merging
  - Require 1 approval
  - Require status checks to pass
- Settings → Actions → Enable workflows
- Settings → Secrets → Add MAKE_TOKEN, etc.
- About → Add description, topics, website
- Add CODEOWNERS file

### Paso 10: Test fresh clone (CRÍTICO)
```bash
# En otra máquina o directorio limpio
cd /tmp
git clone https://github.com/ECONEURA/[NUEVO-REPO].git
cd [NUEVO-REPO]
pnpm install
pnpm -w build
pnpm -w test --run
# TODO DEBE PASAR ✅
```

---

## 📊 CRITERIOS PARA 10/10

| Criterio | Peso | Requisito |
|----------|------|-----------|
| **Código funcional** | 25% | ✅ Compila sin errores |
| **Tests passing** | 20% | ✅ 585/585 tests pass |
| **Documentación** | 15% | ✅ README completo + guías |
| **Limpieza** | 15% | ✅ 0 archivos basura, < 100MB |
| **Configuración** | 10% | ✅ Branch protection + Actions |
| **Profesionalismo** | 10% | ✅ CONTRIBUTING, SECURITY, etc. |
| **Fresh clone works** | 5% | ✅ Nueva máquina puede usarlo |

**Total: 100 puntos**

---

## 🎯 RESULTADO ESPERADO

Después de seguir este plan:

- ✅ Repo funcional al 100%
- ✅ Validado en múltiples niveles
- ✅ Documentación profesional completa
- ✅ Sin basura ni archivos temporales
- ✅ GitHub configurado correctamente
- ✅ Commit history limpia
- ✅ Tests passing
- ✅ TypeScript sin errores
- ✅ Docker stack funcional
- ✅ Fresh clone probado

**Score: 10/10** ✅

---

## 📝 TEMPLATE README.md

Ver archivo completo en siguiente mensaje.

---

**¿Quieres que ejecute este plan completo ahora?**

Necesito confirmar:
1. Nombre del nuevo repo (ej: `econeura-core`)
2. ¿Repo público o privado?
3. ¿Ya lo creaste en GitHub o lo creo yo?
