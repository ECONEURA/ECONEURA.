# 🤖 PROMPT LISTO PARA COPIAR/PEGAR

## Instrucciones de Uso

1. **Copia TODO el texto** desde "=== INICIO DEL PROMPT ===" hasta "=== FIN DEL PROMPT ==="
2. **Pégalo** en tu IA favorita (ChatGPT, Claude, Gemini, Copilot)
3. **Espera** 2-5 minutos mientras la IA analiza
4. **Revisa** el informe generado
5. **Guarda** el resultado como `docs/ANALISIS_[FECHA].md`

---

## === INICIO DEL PROMPT ===

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

**Formato de respuesta requerido:**

Para cada área, usa este formato:

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

**Al final, genera este resumen ejecutivo:**

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

## 📊 TABLA DE PROGRESO

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

## 💡 QUICK WINS (Acciones de bajo esfuerzo, alto impacto)

1. [ ] **[Quick Win 1]** - 1-2 horas
2. [ ] **[Quick Win 2]** - 1-2 horas
3. [ ] **[Quick Win 3]** - 1-2 horas

---

## 🚨 BLOQUEADORES CRÍTICOS

1. **[Bloqueador 1]**
   - Impacto: [Descripción]
   - Áreas afectadas: [Lista]
   - Solución propuesta: [Detalle]
   - Tiempo estimado: [X días]

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

**Criterio de éxito:**
El informe debe ser 100% accionable, con pasos concretos que un desarrollador pueda ejecutar inmediatamente para subir cada área al 100%.

**IMPORTANTE - Comandos de verificación por área:**

**1. Arquitectura:**
```bash
tree -L 3 -d -I 'node_modules|.git'
cat pnpm-workspace.yaml
grep -r "workspace:" package.json
find . -name "package.json" | wc -l
ls -la docs/
grep -r "TODO\|FIXME\|WIP" docs/
```

**2. Frontend:**
```bash
cd apps/web
cat package.json | grep "react\|vite\|typescript"
pnpm typecheck
pnpm lint --max-warnings 0
pnpm build
pnpm test:coverage
ls -R src/components/ | wc -l
grep -r "any" src/ | grep -v "test\|spec" | wc -l
find src -name "*.tsx" -exec wc -l {} + | sort -rn | head -10
```

**3. Backend:**
```bash
cd apps/api_py
cat server.py | wc -l
grep -n "def " server.py
grep -n "MAKE_FORWARD\|MAKE_TOKEN" server.py
cd ../../services/neuras
for service in */; do
  echo "=== $service ==="
  test -f "$service/app.py" && echo "✅ app.py" || echo "❌ app.py"
  test -f "$service/Dockerfile" && echo "✅ Dockerfile" || echo "❌ Dockerfile"
done
```

**4. Testing:**
```bash
pnpm -w test:coverage
find . -name "*.test.ts*" -o -name "*.spec.ts*" | wc -l
grep -r "describe\|it\|test" --include="*.test.*" --include="*.spec.*" | wc -l
```

**5. CI/CD:**
```bash
ls -la .github/workflows/
cat .github/workflows/ci.yml | head -30
find . -name "Dockerfile" | wc -l
cat docker-compose.dev.yml | grep -A 5 "services:"
```

**6. Seguridad:**
```bash
pnpm audit --audit-level=high
grep -r "password\|token\|secret\|api_key" --include="*.ts*" --include="*.py" --exclude-dir=node_modules | grep -v ".env"
grep -r "@ts-ignore\|@ts-expect-error" apps/ packages/ | wc -l
```

**7. Documentación:**
```bash
cat README.md | wc -l
grep -c "!\[" README.md
ls -la docs/
find docs -name "*.md" | wc -l
grep -r "TODO\|FIXME\|HACK\|XXX" apps/ packages/ services/ | wc -l
```

**8. Performance:**
```bash
cd apps/web
pnpm build
du -sh dist/
ls -lh dist/assets/*.js
# Si tienes lighthouse instalado:
# npx lighthouse http://localhost:3000 --output=json
```

**9. Código Compartido:**
```bash
cd packages/shared
cat package.json
ls -R src/
pnpm build
ls -R dist/
pnpm test
cd ../configs
ls -la
```

**10. Infraestructura:**
```bash
cat .github/workflows/deploy*.yml 2>/dev/null || echo "No deployment workflows"
grep -r "sentry\|datadog\|newrelic" packages/shared apps/ || echo "No APM detected"
cat docker-compose.dev.yml | grep "HEALTHCHECK" || echo "No health checks"
```

**Comienza el análisis exhaustivo ahora. Sé específico, cuantifica todo, y proporciona un roadmap 100% accionable.**

## === FIN DEL PROMPT ===

---

## 📝 Notas Adicionales

### Modificaciones Opcionales

Si quieres enfocarte en áreas específicas, puedes agregar al final del prompt:

**Para enfoque en Seguridad:**
```
IMPORTANTE: Enfócate especialmente en el análisis de seguridad. Dedica más detalle a:
- Vulnerabilidades en dependencias
- Secrets hardcoded
- OWASP Top 10
- Auth/authz
- Rate limiting
```

**Para enfoque en Performance:**
```
IMPORTANTE: Enfócate especialmente en performance. Dedica más detalle a:
- Lighthouse scores
- Bundle size
- API latency
- Memory leaks
- Optimizaciones posibles
```

**Para enfoque en Testing:**
```
IMPORTANTE: Enfócate especialmente en testing. Dedica más detalle a:
- Coverage actual vs objetivo
- Tests faltantes
- Calidad de tests existentes
- Tests E2E y de integración
```

### Personalizaciones Útiles

**Agregar deadline:**
```
CONTEXTO ADICIONAL: Necesitamos alcanzar 85% global en 4 semanas para lanzar a production. 
Prioriza acciones que maximicen el score en el menor tiempo posible.
```

**Agregar recursos disponibles:**
```
RECURSOS: Tenemos 2 desarrolladores full-time disponibles durante las próximas 8 semanas.
Ajusta los tiempos estimados considerando este contexto.
```

**Agregar restricciones:**
```
RESTRICCIONES: 
- No podemos cambiar el stack tecnológico (React, Python, FastAPI)
- No podemos agregar nuevas dependencias sin aprobación
- Debemos mantener compatibilidad con Make.com webhooks
```

---

## 🎯 Checklist Post-Análisis

Después de recibir el informe de la IA:

- [ ] Leer el score global y top 3 áreas críticas
- [ ] Revisar la tabla de progreso completa
- [ ] Identificar quick wins (1-2 horas cada uno)
- [ ] Validar bloqueadores críticos mencionados
- [ ] Ejecutar algunos comandos de verificación localmente
- [ ] Guardar el informe como `docs/ANALISIS_[FECHA].md`
- [ ] Compartir hallazgos con el equipo
- [ ] Planificar Sprint 1 según roadmap generado
- [ ] Implementar quick wins esta semana
- [ ] Crear issues/tickets para acciones del roadmap

---

## 🚀 Ejemplo de Uso Real

```markdown
> Copias el prompt completo
> Lo pegas en ChatGPT
> Esperas 3-4 minutos
> Recibes un informe de ~5000 palabras con:
  - Score global: 67%
  - Top 3 críticos: Seguridad 35%, Performance 40%, Testing 50%
  - Roadmap de 5 sprints (10 semanas)
  - 15 quick wins identificados
  - 127 acciones específicas con tiempos estimados
> Guardas como docs/ANALISIS_2025-10-08.md
> Compartes con el equipo
> Implementas 3 quick wins hoy mismo
> Planificas Sprint 1 para empezar mañana
```

---

## 📊 Salida Esperada

El análisis generará aproximadamente:

- **5,000-8,000 palabras** de análisis detallado
- **10 secciones** (una por área)
- **100+ acciones específicas** en roadmap
- **10-20 quick wins** identificados
- **3-5 bloqueadores críticos** destacados
- **Tabla visual** con scores por área
- **Tiempos estimados** para cada acción
- **Comandos ejecutables** para validar progreso

---

**Versión:** 1.0.0  
**Fecha:** 2025-10-08  
**Autor:** Equipo ECONEURA

---

**LISTO PARA USAR. Copia desde "=== INICIO ===" hasta "=== FIN ===" y pégalo en tu IA favorita.** 🚀
