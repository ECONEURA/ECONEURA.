# PROMPT: ANÁLISIS EXHAUSTIVO DEL MONOREPO ECONEURA
## Evaluación Completa del Estado Actual y Roadmap al 100%

---

## 🎯 OBJETIVO DEL ANÁLISIS

Realizar una auditoría técnica completa del monorepo ECONEURA para:

1. **Medir el estado actual** de cada área (porcentaje de completitud)
2. **Identificar gaps** entre estado actual y objetivo 100%
3. **Generar roadmap detallado** con pasos específicos para cada área
4. **Establecer métricas cuantificables** (0-100%) por categoría
5. **Priorizar acciones** según impacto y dependencias

---

## 📋 INSTRUCCIONES PARA EL AGENTE IA

### Formato de Respuesta Requerido

Para cada área analizada, proporciona:

```markdown
## [ÁREA]: [Nombre del Área]

### 📊 Estado Actual: [X]%

**Componentes Evaluados:**
- ✅ [Componente completado]: 100%
- 🟡 [Componente parcial]: [X]% - [Razón específica]
- ❌ [Componente faltante]: 0% - [Qué falta exactamente]

**Evidencia Técnica:**
- Archivos revisados: [lista de paths]
- Comandos ejecutados: [comandos de verificación]
- Métricas obtenidas: [números concretos]

**Problemas Identificados:**
1. [Problema específico con evidencia]
2. [Problema específico con evidencia]

**Roadmap al 100%:**
1. [ ] **[Acción 1]** - Tiempo estimado: [X días/horas]
   - Archivos a modificar: [paths]
   - Comandos a ejecutar: [comandos]
   - Criterio de éxito: [métrica cuantificable]

2. [ ] **[Acción 2]** - Tiempo estimado: [X días/horas]
   - Archivos a modificar: [paths]
   - Comandos a ejecutar: [comandos]
   - Criterio de éxito: [métrica cuantificable]

**Dependencias:**
- Depende de: [otras áreas que deben completarse primero]
- Bloqueadores: [impedimentos externos]

**Prioridad:** 🔴 ALTA / 🟡 MEDIA / 🟢 BAJA
**Impacto:** 🚀 CRÍTICO / ⚡ ALTO / 📊 MEDIO / 🔧 BAJO
```

---

## 🔍 ÁREAS A ANALIZAR EXHAUSTIVAMENTE

### 1️⃣ ARQUITECTURA Y ESTRUCTURA

**Contexto del Proyecto:**
- Repositorio: https://github.com/ECONEURA/ECONEURA.
- Directorio local: `C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-PUNTO`
- Tipo: Monorepo pnpm con TypeScript, React, Python, FastAPI

**Evaluar:**

#### 1.1 Estructura de Directorios (Target: 100%)
- ✅ Verificar existencia de carpetas clave: `apps/`, `packages/`, `services/`, `scripts/`, `docs/`, `tests/`
- ✅ Validar convenciones de naming (kebab-case, PascalCase según tipo)
- ✅ Revisar `.gitignore`, `.npmrc`, `pnpm-workspace.yaml`
- ❓ Identificar carpetas huérfanas o mal ubicadas

**Comandos de verificación:**
```bash
cd "C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-PUNTO"
tree -L 3 -d -I 'node_modules|.git'
find . -name "package.json" | wc -l
grep -r "workspace:" package.json
```

#### 1.2 Configuración del Monorepo (Target: 100%)
- ✅ `pnpm-workspace.yaml` correctamente configurado
- ✅ `package.json` raíz con scripts globales
- ✅ Dependencias compartidas en versiones consistentes
- ❓ Verificar `turbo.json` o sistema de caché (si aplica)

**Verificar:**
```bash
cat pnpm-workspace.yaml
pnpm list -r --depth 0
pnpm why <paquete-duplicado>
```

#### 1.3 Documentación Arquitectónica (Target: 100%)
- ✅ `README.md` completo y actualizado
- ✅ `docs/ARCHITECTURE_REALITY.md` refleja código real
- ✅ `docs/architecture.md` con diagramas técnicos
- ✅ Diagramas C4 o equivalentes
- ❓ Decisiones arquitectónicas documentadas (ADRs)

**Revisar:**
```bash
ls -la docs/
grep -r "TODO\|FIXME\|WIP" docs/
```

---

### 2️⃣ FRONTEND (apps/web, apps/cockpit)

#### 2.1 Aplicación Principal (apps/web) (Target: 100%)
- ✅ React 18+ con TypeScript estricto
- ✅ Vite configurado correctamente
- ✅ Componentes con tipos explícitos
- ✅ Routing implementado (React Router)
- ✅ State management definido (Context/Redux/Zustand)
- ✅ Integración con API proxy funcional
- ❓ UI/UX completa (100% de pantallas implementadas)

**Verificar:**
```bash
cd apps/web
cat package.json | grep "react\|vite\|typescript"
pnpm typecheck
pnpm lint
pnpm build
ls -R src/components/ | wc -l
```

#### 2.2 Testing Frontend (Target: 100%)
- ✅ Vitest configurado
- ✅ Testing Library instalado
- ✅ Coverage ≥ 50% statements, ≥ 75% functions, ≥ 45% branches
- ❓ Tests E2E (Playwright/Cypress)
- ❓ Tests de integración con API

**Medir:**
```bash
cd apps/web
pnpm test:coverage
grep -r "describe\|it\|test" src/**/*.test.* | wc -l
```

#### 2.3 Calidad de Código Frontend (Target: 100%)
- ✅ ESLint sin warnings (`--max-warnings 0`)
- ✅ Prettier configurado
- ✅ No hay `any` explícitos sin justificación
- ✅ Componentes <200 líneas
- ❓ Storybook para documentar componentes

**Analizar:**
```bash
cd apps/web
pnpm lint --max-warnings 0
grep -r "any" src/ | grep -v "test\|spec" | wc -l
find src -name "*.tsx" -exec wc -l {} + | sort -rn | head -10
```

#### 2.4 Accesibilidad y Performance (Target: 100%)
- ❓ ARIA labels correctos
- ❓ Lighthouse score ≥ 90 (Performance, Accessibility, Best Practices, SEO)
- ❓ Lazy loading implementado
- ❓ Code splitting por rutas

**Verificar:**
```bash
pnpm build
ls -lh dist/assets/*.js | awk '{print $5, $9}'
```

---

### 3️⃣ BACKEND (apps/api_py, services/neuras)

#### 3.1 API Proxy Python (apps/api_py) (Target: 100%)
- ✅ `server.py` funcional (~65 líneas)
- ✅ Endpoints `/api/health`, `/api/invoke/:agentId`
- ✅ Headers requeridos implementados
- ✅ CORS configurado
- ❓ Rate limiting
- ❓ Request/Response logging estructurado
- ❓ Error handling robusto (4xx, 5xx)
- ❓ Validación de payloads (Pydantic)

**Verificar:**
```bash
cd apps/api_py
python server.py &
PID=$!
curl http://localhost:8080/api/health
curl -X POST http://localhost:8080/api/invoke/neura-1 \
  -H "Authorization: Bearer test" \
  -H "X-Route: test" \
  -H "X-Correlation-Id: 123" \
  -H "Content-Type: application/json" \
  -d '{"input":"test"}'
kill $PID
```

#### 3.2 Microservicios FastAPI (services/neuras) (Target: 100%)
- ✅ 11 servicios presentes: analytics, cdo, cfo, chro, ciso, cmo, cto, legal, reception, research, support
- ❓ Cada servicio con `app.py` completo
- ❓ Modelos Pydantic para request/response
- ❓ Endpoints documentados (Swagger/OpenAPI)
- ❓ Tests unitarios por servicio
- ❓ Dockerfile por servicio
- ❓ docker-compose.dev.yml incluyendo todos

**Analizar:**
```bash
cd services/neuras
for service in */; do
  echo "=== $service ==="
  cat "$service/app.py" | grep "def " | wc -l
  test -f "$service/Dockerfile" && echo "✅ Dockerfile" || echo "❌ Dockerfile"
  test -f "$service/requirements.txt" && echo "✅ requirements.txt" || echo "❌ requirements.txt"
done
```

#### 3.3 Integración con Make.com (Target: 100%)
- ✅ Variable `MAKE_FORWARD` implementada
- ✅ Token `MAKE_TOKEN` configurado
- ❓ Webhooks de Make.com documentados
- ❓ Retries en caso de fallo
- ❓ Timeout configurado
- ❓ Fallback a modo simulación

**Revisar:**
```bash
cd apps/api_py
grep -n "MAKE_FORWARD\|MAKE_TOKEN" server.py
grep -n "timeout\|retry" server.py
```

#### 3.4 Observabilidad Backend (Target: 100%)
- 🟡 OTLP stub en `packages/shared` (no completamente integrado)
- ❓ Traces distribuidos (Jaeger/Zipkin)
- ❓ Métricas (Prometheus)
- ❓ Logs estructurados (JSON)
- ❓ Health checks avanzados (dependencias)

**Evaluar:**
```bash
grep -r "otlp\|opentelemetry" packages/shared apps/api_py services/
curl http://localhost:8080/metrics || echo "❌ Endpoint /metrics no existe"
```

---

### 4️⃣ CÓDIGO COMPARTIDO (packages/)

#### 4.1 packages/shared (Target: 100%)
- ✅ Estructura presente en `packages/shared/src/`
- ❓ Tipos TypeScript exportados correctamente
- ❓ Funciones utilitarias bien documentadas
- ❓ Tests unitarios para utilities
- ❓ Build genera `.d.ts` correctos
- ❓ Versionado semántico

**Verificar:**
```bash
cd packages/shared
cat package.json
pnpm build
ls -R dist/
pnpm test
```

#### 4.2 packages/configs (Target: 100%)
- ✅ Carpeta `configs/` (no `config/`)
- ❓ Configuraciones TypeScript (`tsconfig.*.json`)
- ❓ Configuraciones ESLint exportables
- ❓ Configuraciones Vitest exportables
- ❓ Sin hardcoding de valores (usar env vars)

**Analizar:**
```bash
cd packages/configs
ls -la
grep -r "hardcoded\|localhost" . || echo "✅ No hardcoding detectado"
```

#### 4.3 Gestión de Dependencias (Target: 100%)
- ✅ `pnpm` como package manager
- ❓ Dependencias auditadas (sin vulnerabilidades críticas)
- ❓ Versiones consistentes entre paquetes
- ❓ `pnpm-lock.yaml` committed
- ❓ Actualización regular (Renovate/Dependabot)

**Ejecutar:**
```bash
pnpm audit --prod
pnpm outdated
pnpm list -r | grep "WARN deprecated"
```

---

### 5️⃣ TESTING Y CALIDAD

#### 5.1 Coverage de Tests (Target: 100%)
- 🟡 Statements ≥ 50% (objetivo: 80%)
- 🟡 Functions ≥ 75% (objetivo: 80%)
- 🟡 Branches ≥ 45% (objetivo: 75%)
- ❓ Tests unitarios en todos los componentes críticos
- ❓ Tests de integración para flows completos
- ❓ Tests E2E para user journeys principales

**Medir:**
```bash
pnpm -w test:coverage
pnpm -w test:coverage --reporter=json > coverage.json
cat coverage.json | jq '.total'
```

#### 5.2 Linting y Type Safety (Target: 100%)
- ✅ ESLint configurado con `--max-warnings 0`
- ✅ TypeScript strict mode habilitado
- ❓ Pre-commit hooks (Husky) ejecutando lint
- ❓ Commitlint validando mensajes
- ❓ No hay `@ts-ignore` sin justificación

**Verificar:**
```bash
pnpm -w lint --max-warnings 0
pnpm -w typecheck
grep -r "@ts-ignore\|@ts-expect-error" apps/ packages/ | wc -l
cat .husky/pre-commit
```

#### 5.3 Tests Automatizados (Target: 100%)
- ✅ Vitest configurado en workspace
- ❓ Tests unitarios: ≥80% de funciones críticas
- ❓ Tests de integración: ≥3 flows principales
- ❓ Tests E2E: ≥5 user journeys
- ❓ Tests de performance (k6/Lighthouse CI)
- ❓ Tests de seguridad (OWASP, SQL injection, XSS)

**Contar:**
```bash
find . -name "*.test.ts*" -o -name "*.spec.ts*" | wc -l
grep -r "describe\|it\|test" --include="*.test.*" --include="*.spec.*" | wc -l
```

---

### 6️⃣ CI/CD Y DEVOPS

#### 6.1 GitHub Actions Workflows (Target: 100%)
- ✅ 11 workflows presentes en `.github/workflows/`
- ❓ Workflow de CI (lint, typecheck, test) en cada PR
- ❓ Workflow de build para verificar compilación
- ❓ Workflow de deployment (staging/production)
- ❓ Workflow de seguridad (CodeQL, dependencias)
- ❓ Workflow de performance (Lighthouse CI)
- ❓ Notificaciones de fallo (Slack/Discord/Email)

**Revisar:**
```bash
ls -la .github/workflows/
cat .github/workflows/ci.yml
gh workflow list
gh run list --limit 10
```

#### 6.2 Docker y Contenedores (Target: 100%)
- ✅ `docker-compose.dev.yml` presente
- ❓ Dockerfile para cada servicio (apps/api_py, services/neuras/*)
- ❓ Multi-stage builds para optimizar tamaño
- ❓ Health checks en docker-compose
- ❓ Volúmenes para hot-reload en dev
- ❓ Secrets management (no hardcoded)

**Validar:**
```bash
docker-compose -f docker-compose.dev.yml config
find . -name "Dockerfile" | wc -l
grep -r "HEALTHCHECK" */Dockerfile
```

#### 6.3 Dev Containers (Target: 100%)
- ❓ `.devcontainer/devcontainer.json` configurado
- ❓ Extensions recomendadas instaladas
- ❓ Poststart commands para setup automático
- ❓ Funciona en Codespaces y VS Code local

**Verificar:**
```bash
cat .devcontainer/devcontainer.json
grep -A 10 "extensions" .devcontainer/devcontainer.json
```

#### 6.4 Scripts de Automatización (Target: 100%)
- ✅ Scripts en `scripts/` para tareas comunes
- ❓ `start-dev.sh` funciona sin errores
- ❓ `validate-environment.sh` verifica setup completo
- ❓ Scripts idempotentes (se pueden correr múltiples veces)
- ❓ Scripts con manejo de errores robusto

**Probar:**
```bash
./scripts/start-dev.sh &
sleep 10
curl http://localhost:3000 && echo "✅ Web OK"
curl http://localhost:8080/api/health && echo "✅ API OK"
pkill -f "start-dev"
```

---

### 7️⃣ SEGURIDAD

#### 7.1 Auditoría de Dependencias (Target: 100%)
- ❓ Sin vulnerabilidades CRÍTICAS
- ❓ Sin vulnerabilidades ALTAS sin mitigar
- ❓ Dependencias auditadas regularmente (semanal)
- ❓ Renovate/Dependabot configurado

**Ejecutar:**
```bash
pnpm audit --audit-level=high
pnpm audit --json > audit.json
cat audit.json | jq '.metadata'
```

#### 7.2 Secrets y Configuración (Target: 100%)
- ❓ Secrets en `.env` (no committed)
- ❓ `.env.example` con keys sin valores
- ❓ Variables de entorno validadas en startup
- ❓ No hay tokens/passwords hardcoded en código
- ❓ Git-secrets o Gitleaks configurado

**Buscar:**
```bash
grep -r "password\|token\|secret\|api_key" --include="*.ts*" --include="*.py" --exclude-dir=node_modules | grep -v ".env"
git log --all --full-history --source -- **/*.env 2>/dev/null | head -10
```

#### 7.3 OWASP Top 10 (Target: 100%)
- ❓ Protección XSS (sanitización de inputs)
- ❓ Protección SQL Injection (queries parametrizadas)
- ❓ CSRF tokens en formularios
- ❓ Rate limiting en endpoints públicos
- ❓ HTTPS forzado en producción
- ❓ Headers de seguridad (CSP, HSTS, X-Frame-Options)

**Revisar:**
```bash
grep -r "innerHTML\|dangerouslySetInnerHTML" apps/web/src/
grep -r "execute\|raw\|query" apps/api_py services/neuras
```

#### 7.4 Autenticación y Autorización (Target: 100%)
- ✅ Header `Authorization: Bearer` implementado
- ❓ Validación de tokens (JWT/OAuth)
- ❓ Refresh tokens implementados
- ❓ Roles y permisos (RBAC)
- ❓ Session management seguro

**Analizar:**
```bash
grep -r "jwt\|oauth\|auth" apps/api_py packages/shared
```

---

### 8️⃣ DOCUMENTACIÓN

#### 8.1 README y Setup (Target: 100%)
- ✅ `README.md` principal completo
- ✅ `docs/setup.md` con instrucciones paso a paso
- ❓ Screenshots/GIFs de la aplicación
- ❓ Badges de CI/CD status
- ❓ Instrucciones para troubleshooting común

**Verificar:**
```bash
cat README.md | wc -l
grep -c "!\[" README.md  # Contar imágenes
grep "badge" README.md
```

#### 8.2 Documentación Técnica (Target: 100%)
- ✅ `docs/ARCHITECTURE_REALITY.md` actualizado
- ✅ `docs/architecture.md` con diagramas
- ❓ Documentación de API (OpenAPI/Swagger)
- ❓ Guía de contribución (`CONTRIBUTING.md`)
- ❓ Changelog automático (`CHANGELOG.md`)
- ❓ Decisiones arquitectónicas (ADRs en `docs/decisions/`)

**Revisar:**
```bash
ls -la docs/
find docs -name "*.md" | wc -l
```

#### 8.3 Comentarios en Código (Target: 100%)
- ❓ Funciones complejas con JSDoc/docstrings
- ❓ Algoritmos no obvios explicados
- ❓ TODOs con tickets/issues asociados
- ❓ Sin comentarios obsoletos o contradictorios

**Analizar:**
```bash
grep -r "TODO\|FIXME\|HACK\|XXX" apps/ packages/ services/ | wc -l
grep -r "/\*\*\|'''" apps/ packages/ services/ | wc -l
```

#### 8.4 MEGAPROMPT y Onboarding (Target: 100%)
- ✅ `docs/MEGAPROMPT.md` creado y actualizado
- ❓ Onboarding checklist para nuevos devs
- ❓ Video walkthrough del proyecto (opcional)
- ❓ FAQ con problemas comunes

**Verificar:**
```bash
cat docs/MEGAPROMPT.md | wc -l
test -f docs/ONBOARDING.md && echo "✅ Existe" || echo "❌ Falta"
```

---

### 9️⃣ PERFORMANCE

#### 9.1 Frontend Performance (Target: 100%)
- ❓ Lighthouse Performance Score ≥ 90
- ❓ First Contentful Paint (FCP) < 1.5s
- ❓ Largest Contentful Paint (LCP) < 2.5s
- ❓ Time to Interactive (TTI) < 3.5s
- ❓ Cumulative Layout Shift (CLS) < 0.1
- ❓ Bundle size optimizado (< 500KB gzipped)

**Medir:**
```bash
cd apps/web
pnpm build
du -sh dist/
npx lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-report.json
cat lighthouse-report.json | jq '.categories.performance.score * 100'
```

#### 9.2 Backend Performance (Target: 100%)
- ❓ Latencia p95 < 500ms
- ❓ Throughput ≥ 1000 req/s
- ❓ Sin memory leaks
- ❓ Connection pooling implementado
- ❓ Caching estratégico (Redis/Memcached)

**Probar:**
```bash
# Instalar k6 si no está
k6 run tests/performance/load-test.js
```

#### 9.3 Base de Datos (si aplica) (Target: 100%)
- ❓ Índices en columnas frecuentemente consultadas
- ❓ Queries optimizadas (< 100ms p95)
- ❓ Sin N+1 queries
- ❓ Backup y recovery configurados
- ❓ Migrations versionadas

**Analizar:**
```bash
# Si hay DB configurada
grep -r "SELECT\|INSERT\|UPDATE" services/neuras apps/api_py
```

---

### 🔟 INFRAESTRUCTURA Y DESPLIEGUE

#### 10.1 Ambientes (Target: 100%)
- ❓ Development: funcionando localmente
- ❓ Staging: desplegado en cloud (Azure/AWS/GCP)
- ❓ Production: desplegado en cloud con HA
- ❓ Preview environments para cada PR

**Verificar:**
```bash
cat .github/workflows/deploy-*.yml
grep -r "ENVIRONMENT\|ENV" .github/workflows/
```

#### 10.2 Monitoreo y Alertas (Target: 100%)
- ❓ Uptime monitoring (Better Uptime/Pingdom)
- ❓ APM (Application Performance Monitoring - DataDog/New Relic)
- ❓ Error tracking (Sentry/Rollbar)
- ❓ Alertas configuradas (PagerDuty/Opsgenie)
- ❓ Dashboard de métricas (Grafana)

**Revisar:**
```bash
grep -r "sentry\|datadog\|newrelic" packages/shared apps/
```

#### 10.3 Escalabilidad (Target: 100%)
- ❓ Horizontal scaling configurado (Kubernetes/ECS)
- ❓ Load balancer configurado
- ❓ Auto-scaling basado en métricas
- ❓ CDN para assets estáticos (Cloudflare/CloudFront)
- ❓ Disaster recovery plan documentado

**Documentar:**
```bash
test -f docs/SCALABILITY.md && echo "✅ Existe" || echo "❌ Falta"
```

#### 10.4 Costos y Optimización (Target: 100%)
- ❓ Costos de infra monitoreados (< $X/mes)
- ❓ Recursos correctamente dimensionados
- ❓ Spot instances / Preemptible VMs donde sea posible
- ❓ Cleanup automático de recursos no usados

---

## 📊 FORMATO DE ENTREGA DEL ANÁLISIS

### Resumen Ejecutivo

```markdown
# ANÁLISIS EXHAUSTIVO ECONEURA - [Fecha]

## 📈 SCORE GLOBAL: [X]% (Promedio ponderado de todas las áreas)

### Top 3 Áreas Mejor Evaluadas:
1. [Área]: [X]% ✅
2. [Área]: [X]% ✅
3. [Área]: [X]% ✅

### Top 3 Áreas Críticas (Requieren Atención Urgente):
1. [Área]: [X]% 🔴
2. [Área]: [X]% 🔴
3. [Área]: [X]% 🔴

### Deuda Técnica Total Estimada: [X] días/persona

---

## 📋 DESGLOSE POR ÁREA

[Para cada una de las 10 áreas, usar el formato especificado arriba]

---

## 🎯 ROADMAP PRIORIZADO AL 100%

### Sprint 1 (Semana 1-2): Fundamentos Críticos
- [ ] [Acción de máxima prioridad]
- [ ] [Acción de máxima prioridad]
- [ ] [Acción de máxima prioridad]

### Sprint 2 (Semana 3-4): Calidad y Testing
- [ ] [Acción prioritaria]
- [ ] [Acción prioritaria]

### Sprint 3 (Semana 5-6): Seguridad y Performance
- [ ] [Acción prioritaria]
- [ ] [Acción prioritaria]

### Sprint 4 (Semana 7-8): Documentación y DevOps
- [ ] [Acción prioritaria]
- [ ] [Acción prioritaria]

### Sprint 5+ (Semana 9+): Optimización y Escalabilidad
- [ ] [Acción prioritaria]
- [ ] [Acción prioritaria]

---

## 📉 GRÁFICO DE PROGRESO (Markdown Table)

| Área | Actual | Objetivo | Gap | Prioridad |
|------|--------|----------|-----|-----------|
| Arquitectura | [X]% | 100% | [Y]% | 🔴/🟡/🟢 |
| Frontend | [X]% | 100% | [Y]% | 🔴/🟡/🟢 |
| Backend | [X]% | 100% | [Y]% | 🔴/🟡/🟢 |
| Código Compartido | [X]% | 100% | [Y]% | 🔴/🟡/🟢 |
| Testing | [X]% | 100% | [Y]% | 🔴/🟡/🟢 |
| CI/CD | [X]% | 100% | [Y]% | 🔴/🟡/🟢 |
| Seguridad | [X]% | 100% | [Y]% | 🔴/🟡/🟢 |
| Documentación | [X]% | 100% | [Y]% | 🔴/🟡/🟢 |
| Performance | [X]% | 100% | [Y]% | 🔴/🟡/🟢 |
| Infraestructura | [X]% | 100% | [Y]% | 🔴/🟡/🟢 |
| **PROMEDIO** | **[X]%** | **100%** | **[Y]%** | - |

---

## 🚨 BLOQUEADORES CRÍTICOS

1. **[Bloqueador 1]**
   - Impacto: [Descripción]
   - Áreas afectadas: [Lista]
   - Solución propuesta: [Detalle]
   - Tiempo estimado: [X días]

2. **[Bloqueador 2]**
   - [Mismo formato]

---

## 💡 QUICK WINS (Acciones de bajo esfuerzo, alto impacto)

1. [ ] **[Quick Win 1]** - 1-2 horas
2. [ ] **[Quick Win 2]** - 1-2 horas
3. [ ] **[Quick Win 3]** - 1-2 horas

---

## 📅 PRÓXIMOS PASOS INMEDIATOS

1. **Hoy mismo:**
   - [ ] [Acción específica]
   - [ ] [Acción específica]

2. **Esta semana:**
   - [ ] [Acción específica]
   - [ ] [Acción específica]

3. **Este mes:**
   - [ ] [Acción específica]
   - [ ] [Acción específica]

---

## 🎓 RECOMENDACIONES GENERALES

- [Recomendación técnica 1]
- [Recomendación de proceso 2]
- [Recomendación de tooling 3]
```

---

## 🤖 PROMPT COMPLETO PARA COPIAR/PEGAR

```markdown
Eres un arquitecto de software senior especializado en auditorías técnicas exhaustivas. Tu tarea es analizar el monorepo ECONEURA y generar un informe completo siguiendo este formato:

**Contexto del Proyecto:**
- Repositorio: https://github.com/ECONEURA/ECONEURA.
- Directorio: C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-PUNTO
- Stack: pnpm monorepo, TypeScript, React+Vite, Python, FastAPI
- Documentos clave: docs/ARCHITECTURE_REALITY.md, docs/MEGAPROMPT.md

**Objetivo:**
Evaluar 10 áreas críticas (Arquitectura, Frontend, Backend, Código Compartido, Testing, CI/CD, Seguridad, Documentación, Performance, Infraestructura) y determinar el porcentaje de completitud (0-100%) de cada una.

**Para cada área, debes:**
1. Ejecutar comandos de verificación reales (git, pnpm, find, grep, curl, etc.)
2. Leer archivos clave (package.json, tsconfig.json, workflows, etc.)
3. Medir métricas cuantificables (coverage, líneas de código, número de tests, etc.)
4. Identificar gaps específicos con evidencia técnica
5. Proponer roadmap detallado al 100% con tiempos estimados
6. Priorizar por impacto (🚀 CRÍTICO / ⚡ ALTO / 📊 MEDIO / 🔧 BAJO)

**Áreas a evaluar:**

1. **Arquitectura y Estructura** (estructura de directorios, configuración monorepo, documentación arquitectónica)
2. **Frontend** (apps/web, apps/cockpit: código, testing, calidad, accesibilidad, performance)
3. **Backend** (apps/api_py, services/neuras: endpoints, microservicios, integración Make.com, observabilidad)
4. **Código Compartido** (packages/shared, packages/configs, gestión de dependencias)
5. **Testing y Calidad** (coverage, linting, type safety, tests automatizados)
6. **CI/CD y DevOps** (workflows GitHub Actions, Docker, Dev Containers, scripts)
7. **Seguridad** (auditoría dependencias, secrets, OWASP Top 10, auth/authz)
8. **Documentación** (README, docs técnicos, comentarios en código, onboarding)
9. **Performance** (frontend Lighthouse, backend latencia/throughput, base de datos)
10. **Infraestructura** (ambientes, monitoreo, escalabilidad, costos)

**Comandos iniciales para contextualizar:**
```bash
cd "C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-PUNTO"
pwd
git remote -v
git branch -a
tree -L 2 -I 'node_modules|.git'
cat package.json | head -30
cat pnpm-workspace.yaml
ls -la docs/
pnpm list -r --depth 0
```

**Formato de respuesta:**
Usa el formato especificado en docs/PROMPT_ANALISIS_EXHAUSTIVO.md, incluyendo:
- Score por área (0-100%)
- Evidencia técnica con comandos ejecutados
- Problemas identificados
- Roadmap detallado al 100%
- Dependencias y bloqueadores
- Prioridad e impacto
- Resumen ejecutivo con top 3 mejores/peores áreas
- Tabla de progreso markdown
- Quick wins
- Próximos pasos inmediatos

**Criterio de éxito:**
El informe debe ser 100% accionable, con pasos concretos que un desarrollador pueda ejecutar inmediatamente para subir cada área al 100%.

**Comienza el análisis exhaustivo ahora.**
```

---

## 🔖 CRITERIOS DE 100% POR ÁREA (Reference)

### Arquitectura y Estructura: 100%
- ✅ Estructura de carpetas sigue convenciones industry-standard
- ✅ pnpm workspace correctamente configurado
- ✅ Documentación arquitectónica completa y actualizada
- ✅ Diagramas C4 o equivalentes presentes
- ✅ ADRs (Architecture Decision Records) documentados

### Frontend: 100%
- ✅ TypeScript strict, 0 `any` sin justificación
- ✅ ESLint sin warnings
- ✅ Coverage ≥80% (statements, functions, branches)
- ✅ Lighthouse Score ≥90 en todas las métricas
- ✅ Componentes <200 líneas, bien documentados
- ✅ Storybook con todos los componentes

### Backend: 100%
- ✅ Todos los endpoints documentados (OpenAPI)
- ✅ Validación de payloads con Pydantic
- ✅ Error handling robusto (4xx, 5xx)
- ✅ Rate limiting implementado
- ✅ Logging estructurado (JSON)
- ✅ Health checks avanzados
- ✅ Tests unitarios ≥80% coverage

### Código Compartido: 100%
- ✅ Tipos TypeScript correctos y exportados
- ✅ Funciones bien documentadas (JSDoc)
- ✅ Tests unitarios para todas las utilidades
- ✅ Versionado semántico estricto
- ✅ Sin dependencias circulares

### Testing y Calidad: 100%
- ✅ Coverage ≥80% en statements, functions, branches
- ✅ Tests unitarios en 100% de funciones críticas
- ✅ Tests de integración para flows principales
- ✅ Tests E2E para user journeys críticos
- ✅ Tests de performance (k6)
- ✅ Tests de seguridad (OWASP)

### CI/CD y DevOps: 100%
- ✅ CI workflow ejecuta en cada PR (lint, typecheck, test, build)
- ✅ Deployment automático a staging/production
- ✅ Dockerfile para todos los servicios (multi-stage)
- ✅ docker-compose funcional con health checks
- ✅ Dev Container configurado y funcional
- ✅ Scripts idempotentes y con error handling

### Seguridad: 100%
- ✅ 0 vulnerabilidades CRÍTICAS o ALTAS
- ✅ Secrets en variables de entorno (no hardcoded)
- ✅ Git-secrets/Gitleaks configurado
- ✅ OWASP Top 10 mitigado
- ✅ Auth/authz con JWT/OAuth
- ✅ Rate limiting en endpoints públicos
- ✅ Headers de seguridad configurados

### Documentación: 100%
- ✅ README completo con badges CI/CD
- ✅ CONTRIBUTING.md con guía de contribución
- ✅ Documentación técnica actualizada (diagramas, ADRs)
- ✅ API documentada (OpenAPI/Swagger)
- ✅ CHANGELOG automático
- ✅ Onboarding checklist para nuevos devs
- ✅ 0 TODOs sin tickets asociados

### Performance: 100%
- ✅ Lighthouse ≥90 (Performance, Accessibility, Best Practices, SEO)
- ✅ FCP <1.5s, LCP <2.5s, TTI <3.5s, CLS <0.1
- ✅ Bundle size <500KB gzipped
- ✅ API latency p95 <500ms
- ✅ Throughput ≥1000 req/s
- ✅ Sin memory leaks
- ✅ Caching estratégico implementado

### Infraestructura: 100%
- ✅ Dev, Staging, Production ambientes funcionando
- ✅ Uptime monitoring configurado
- ✅ APM implementado (DataDog/New Relic)
- ✅ Error tracking activo (Sentry)
- ✅ Alertas configuradas
- ✅ Horizontal scaling configurado
- ✅ CDN para assets estáticos
- ✅ Disaster recovery plan documentado
- ✅ Costos optimizados y monitoreados

---

## 📊 SCORECARD FINAL ESPERADO

Al terminar el análisis, deberás generar un scorecard así:

```
╔══════════════════════════════════════════════════════════════╗
║          ECONEURA MONOREPO - SCORECARD COMPLETO              ║
╚══════════════════════════════════════════════════════════════╝

┌────────────────────────────────────────────────────────────┐
│ SCORE GLOBAL: [XX]% / 100%                                  │
│ Estado: [🔴 CRÍTICO / 🟡 EN PROGRESO / 🟢 PRODUCCIÓN READY] │
│ Deuda Técnica: [X] días/persona                            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────┬─────────┬──────────┬──────────────┐
│ Área                   │ Actual  │ Objetivo │ Prioridad    │
├────────────────────────┼─────────┼──────────┼──────────────┤
│ 1. Arquitectura        │ [XX]%   │ 100%     │ 🔴/🟡/🟢     │
│ 2. Frontend            │ [XX]%   │ 100%     │ 🔴/🟡/🟢     │
│ 3. Backend             │ [XX]%   │ 100%     │ 🔴/🟡/🟢     │
│ 4. Código Compartido   │ [XX]%   │ 100%     │ 🔴/🟡/🟢     │
│ 5. Testing             │ [XX]%   │ 100%     │ 🔴/🟡/🟢     │
│ 6. CI/CD               │ [XX]%   │ 100%     │ 🔴/🟡/🟢     │
│ 7. Seguridad           │ [XX]%   │ 100%     │ 🔴/🟡/🟢     │
│ 8. Documentación       │ [XX]%   │ 100%     │ 🔴/🟡/🟢     │
│ 9. Performance         │ [XX]%   │ 100%     │ 🔴/🟡/🟢     │
│ 10. Infraestructura    │ [XX]%   │ 100%     │ 🔴/🟡/🟢     │
└────────────────────────┴─────────┴──────────┴──────────────┘

Top 3 Fortalezas:
  1. ✅ [Área] ([XX]%) - [Comentario]
  2. ✅ [Área] ([XX]%) - [Comentario]
  3. ✅ [Área] ([XX]%) - [Comentario]

Top 3 Debilidades:
  1. 🔴 [Área] ([XX]%) - [Comentario]
  2. 🔴 [Área] ([XX]%) - [Comentario]
  3. 🔴 [Área] ([XX]%) - [Comentario]

Próximo Hito: [Descripción del siguiente milestone alcanzable]
ETA al 100%: [X semanas/meses] (con [Y] devs a tiempo completo)
```

---

## 🎯 OBJETIVOS CLAROS PARA 10/10 EN CADA ÁREA

### ✅ CHECKLIST MASTER (100% = Todos marcados)

#### 1. Arquitectura y Estructura (10/10)
- [ ] Estructura de carpetas sigue best practices
- [ ] pnpm workspace sin conflictos de dependencias
- [ ] Documentación arquitectónica completa (README, ARCHITECTURE_REALITY, diagramas)
- [ ] ADRs documentados para decisiones importantes
- [ ] 0 carpetas huérfanas o mal ubicadas

#### 2. Frontend (10/10)
- [ ] TypeScript strict habilitado, 0 `any` injustificados
- [ ] ESLint pasa con --max-warnings 0
- [ ] Coverage ≥80% (statements, functions, branches)
- [ ] Lighthouse ≥90 en Performance, Accessibility, Best Practices, SEO
- [ ] Bundle size <500KB gzipped
- [ ] Componentes <200 líneas con propTypes/interfaces
- [ ] Storybook con 100% de componentes documentados
- [ ] Tests E2E para user journeys críticos
- [ ] Accesibilidad WCAG 2.1 AA compliant
- [ ] Lazy loading y code splitting implementados

#### 3. Backend (10/10)
- [ ] Todos los endpoints documentados (OpenAPI/Swagger)
- [ ] Validación de payloads con Pydantic
- [ ] Error handling robusto (4xx, 5xx con mensajes claros)
- [ ] Rate limiting configurado (ej: 100 req/min por IP)
- [ ] CORS configurado correctamente
- [ ] Logging estructurado JSON con correlation IDs
- [ ] Health checks avanzados (dependencias, DB, external APIs)
- [ ] Tests unitarios ≥80% coverage
- [ ] Observabilidad OTLP completamente integrado
- [ ] 11 microservicios FastAPI con Dockerfile cada uno

#### 4. Código Compartido (10/10)
- [ ] Tipos TypeScript exportados correctamente
- [ ] Funciones utilitarias con JSDoc completo
- [ ] Tests unitarios para 100% de utilities
- [ ] Build genera .d.ts correctos
- [ ] Versionado semántico respetado
- [ ] 0 dependencias circulares
- [ ] packages/configs (plural) sin hardcoding
- [ ] pnpm audit sin vulnerabilidades ALTAS/CRÍTICAS
- [ ] Dependencias actualizadas (Renovate/Dependabot)
- [ ] pnpm-lock.yaml committed y actualizado

#### 5. Testing y Calidad (10/10)
- [ ] Coverage ≥80% statements
- [ ] Coverage ≥80% functions
- [ ] Coverage ≥75% branches
- [ ] Tests unitarios en 100% de funciones críticas
- [ ] Tests de integración para 100% de flows principales
- [ ] Tests E2E para 100% de user journeys críticos
- [ ] Tests de performance (k6) con thresholds definidos
- [ ] Tests de seguridad (OWASP ZAP/Burp)
- [ ] Pre-commit hooks ejecutando lint/typecheck/test
- [ ] Commitlint validando convenciones de mensajes

#### 6. CI/CD y DevOps (10/10)
- [ ] CI workflow en cada PR (lint, typecheck, test, build)
- [ ] Build workflow exitoso
- [ ] Deployment automático a staging en merge a main
- [ ] Deployment a production con aprobación manual
- [ ] CodeQL o similar para análisis de seguridad
- [ ] Lighthouse CI ejecutándose
- [ ] Notificaciones de fallo (Slack/Discord/Email)
- [ ] Dockerfile multi-stage para todos los servicios
- [ ] docker-compose.dev.yml con health checks
- [ ] Dev Container funcional en VS Code y Codespaces

#### 7. Seguridad (10/10)
- [ ] 0 vulnerabilidades CRÍTICAS en pnpm audit
- [ ] 0 vulnerabilidades ALTAS sin plan de mitigación
- [ ] Secrets en .env, nunca hardcoded
- [ ] Git-secrets o Gitleaks previniendo commits de secrets
- [ ] XSS mitigado (sanitización, CSP headers)
- [ ] SQL Injection mitigado (queries parametrizadas)
- [ ] CSRF tokens en formularios
- [ ] Rate limiting en endpoints públicos
- [ ] HTTPS forzado en staging/production
- [ ] Auth/authz con JWT refresh tokens y RBAC

#### 8. Documentación (10/10)
- [ ] README.md completo con badges CI/CD
- [ ] CONTRIBUTING.md con guía de contribución
- [ ] CHANGELOG.md automático con semantic-release
- [ ] docs/ARCHITECTURE_REALITY.md actualizado
- [ ] docs/MEGAPROMPT.md actualizado
- [ ] Documentación API (Swagger UI accesible)
- [ ] Onboarding checklist (ONBOARDING.md)
- [ ] 0 TODOs sin issues/tickets asociados
- [ ] Comentarios JSDoc en funciones complejas
- [ ] FAQ con troubleshooting común

#### 9. Performance (10/10)
- [ ] Lighthouse Performance ≥90
- [ ] Lighthouse Accessibility ≥90
- [ ] Lighthouse Best Practices ≥90
- [ ] Lighthouse SEO ≥90
- [ ] FCP <1.5s, LCP <2.5s, TTI <3.5s, CLS <0.1
- [ ] Bundle size <500KB gzipped
- [ ] API latency p95 <500ms
- [ ] API throughput ≥1000 req/s (load tested con k6)
- [ ] 0 memory leaks detectados
- [ ] Caching estratégico (Redis/CDN) implementado

#### 10. Infraestructura (10/10)
- [ ] Dev environment funcional (localhost)
- [ ] Staging environment desplegado en cloud
- [ ] Production environment con HA (High Availability)
- [ ] Preview environments para cada PR
- [ ] Uptime monitoring (≥99.9% SLA)
- [ ] APM configurado (DataDog/New Relic/Prometheus)
- [ ] Error tracking activo (Sentry)
- [ ] Alertas configuradas con escalamiento
- [ ] Horizontal scaling configurado
- [ ] Disaster recovery plan documentado y testeado

---

## 🚀 QUICK START PARA EJECUTAR EL ANÁLISIS

```bash
# 1. Clonar o navegar al repo
cd "C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-PUNTO"

# 2. Leer el prompt de análisis
cat docs/PROMPT_ANALISIS_EXHAUSTIVO.md

# 3. Copiar el "PROMPT COMPLETO PARA COPIAR/PEGAR" de este documento

# 4. Pegarlo en tu IA favorita (ChatGPT, Claude, Gemini, etc.)

# 5. La IA ejecutará todos los comandos y generará el informe completo

# 6. Guardar el informe generado
# El informe se guardará como: docs/ANALISIS_EXHAUSTIVO_[FECHA].md
```

---

## 📅 MANTENIMIENTO DE ESTE PROMPT

Este documento debe actualizarse:
- ✅ Cada vez que se agregue una nueva área crítica
- ✅ Cuando cambien los criterios de 100% (ej: coverage threshold)
- ✅ Si se agregan nuevos servicios/paquetes al monorepo
- ✅ Cuando se actualice el stack tecnológico
- ✅ Mensualmente como parte de la retrospectiva

**Última actualización:** 2025-10-08  
**Mantenido por:** Equipo ECONEURA  
**Versión:** 1.0.0

---

**FIN DEL PROMPT DE ANÁLISIS EXHAUSTIVO**

*Copia el "PROMPT COMPLETO PARA COPIAR/PEGAR" y úsalo en tu IA de preferencia para obtener el análisis detallado del monorepo ECONEURA.* 🚀
