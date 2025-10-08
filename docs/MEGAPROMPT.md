# MEGAPROMPT ECONEURA - Contexto Completo para Agentes IA

## 🎯 INSTRUCCIONES CRÍTICAS PARA EL AGENTE IA

**ANTES DE HACER CUALQUIER COSA, LEE ESTO:**

1. **NO PREGUNTES, ACTÚA**: Ejecuta comandos directamente. No pidas permiso para cosas obvias.
2. **ERRORES = OPORTUNIDAD**: Si algo falla, diagnostica y arregla inmediatamente.
3. **CONTEXTO PRIMERO**: Lee `docs/ARCHITECTURE_REALITY.md` antes de tocar código.
4. **ZERO WARNINGS**: El linter debe pasar con `--max-warnings 0`. No negociable.
5. **TESTS OBLIGATORIOS**: Coverage mínimo: statements ≥50%, functions ≥75%, branches ≥45%.

---

## 📦 INFORMACIÓN DEL PROYECTO

### Identidad del Proyecto
- **Nombre**: ECONEURA
- **Repositorio**: https://github.com/ECONEURA/ECONEURA.
- **Tipo**: Monorepo pnpm con TypeScript, React, Python, FastAPI
- **Directorio Local**: `C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-PUNTO`

### Arquitectura del Monorepo
```
ECONEURA-PUNTO/
├── apps/
│   ├── web/              # Cockpit principal React+Vite (puerto 3000)
│   ├── cockpit/          # Segundo cockpit (propósito TBD)
│   └── api_py/           # Proxy Python HTTP simple (puerto 8080)
│       └── server.py     # ~65 líneas, stdlib only, sin frameworks
├── packages/
│   ├── shared/           # Código compartido TypeScript
│   └── configs/          # ⚠️ PLURAL, no "config"
├── services/
│   └── neuras/           # 11 microservicios FastAPI
│       ├── analytics/
│       ├── cdo/
│       ├── cfo/
│       ├── chro/
│       ├── ciso/
│       ├── cmo/
│       ├── cto/
│       ├── legal/
│       ├── reception/
│       ├── research/
│       └── support/
├── scripts/              # Scripts de automatización
├── docs/                 # Documentación crítica
├── tests/                # Tests unitarios y e2e
└── .github/workflows/    # 11 workflows CI/CD
```

---

## 🔧 STACK TECNOLÓGICO

### Frontend
- **Framework**: React 18 + TypeScript 5
- **Build**: Vite 5
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint 9 (flat config)
- **Styling**: CSS Modules / Tailwind (verificar en proyecto)

### Backend
- **API Proxy**: Python 3.11+ (stdlib HTTP server)
- **Microservicios**: FastAPI 0.100+
- **Integración**: Make.com webhooks
- **Observabilidad**: OTLP (stub, no completamente integrado)

### DevOps
- **Package Manager**: pnpm 8+ (workspaces)
- **CI/CD**: GitHub Actions (11 workflows)
- **Contenedores**: Docker + Docker Compose
- **Dev Containers**: VS Code Dev Container configurado

---

## ⚡ COMANDOS ESENCIALES

### Setup Inicial
```bash
# Instalar dependencias
pnpm install

# Validar entorno
./scripts/core/validate-environment.sh

# Build completo
pnpm -w build
```

### Desarrollo
```bash
# Iniciar TODO (web + api_py + health checks)
./scripts/start-dev.sh

# Solo frontend (puerto 3000)
pnpm -C apps/web dev

# Solo API Python (puerto 8080)
cd apps/api_py && python server.py

# Solo API Python con forwarding a Make.com
cd apps/api_py && MAKE_FORWARD=1 MAKE_TOKEN=xxx python server.py
```

### Quality Checks
```bash
# Linter (falla con warnings)
pnpm -w lint

# TypeScript check
pnpm -w typecheck

# Tests con coverage
pnpm -w test:coverage

# Todo junto (CI local)
pnpm -w lint && pnpm -w typecheck && pnpm -w test:coverage
```

### Debugging
```bash
# Health checks
curl http://localhost:3000        # Frontend
curl http://localhost:8080/api/health  # API Proxy

# Ver logs de servicios
docker-compose -f docker-compose.dev.yml logs -f

# Estado del sistema
./scripts/check-system-status.sh
```

---

## 🚨 REALIDAD ACTUAL vs DOCUMENTACIÓN

### ⚠️ ADVERTENCIAS CRÍTICAS

1. **NO existe `packages/config/`** → Es `packages/configs/` (PLURAL)
2. **NO existe `agent-routing.json`** → Rutas hardcoded en `apps/api_py/server.py`
3. **NO existe `scripts/ensure-sixty.ts`** → No implementado
4. **OTLP observabilidad** → Stub en `packages/shared`, no funcional
5. **README.md describe visión 100% GA** → `ARCHITECTURE_REALITY.md` describe lo real

### ✅ Lo que SÍ existe

- **11 servicios FastAPI** en `services/neuras/` funcionando
- **Proxy Python simple** en `apps/api_py/server.py` (65 líneas, stdlib)
- **Cockpit React** en `apps/web/` funcional (puerto 3000)
- **11 workflows CI/CD** en `.github/workflows/`
- **pnpm workspace** configurado y funcional

---

## 🔗 FLOW DE DATOS ACTUAL

```
┌─────────────────┐
│   apps/web      │
│  React + Vite   │
│   (puerto 3000) │
└────────┬────────┘
         │ HTTP POST
         ▼
┌─────────────────────────┐
│   apps/api_py/server.py │
│   Python HTTP Proxy     │
│   (puerto 8080)         │
└────────┬────────────────┘
         │
         ├─ MAKE_FORWARD=1 ──→ Make.com webhooks
         │
         └─ MAKE_FORWARD=0 ──→ Modo simulación (echo)
```

### Endpoints API Proxy

**GET /api/health**
```json
{
  "ok": true,
  "mode": "forward" | "sim",
  "ts": "2025-10-08T10:30:00Z"
}
```

**POST /api/invoke/:agentId**
- **Headers requeridos**:
  - `Authorization: Bearer <token>`
  - `X-Route: <route>`
  - `X-Correlation-Id: <id>`
- **AgentId válidos**: `neura-1` a `neura-10` (hardcoded línea 4)
- **Body**: JSON arbitrario
- **Respuesta**: JSON de Make.com o echo simulado

**Errores comunes**:
- Sin `Authorization` → 401
- Sin headers X-* → 400
- AgentId inválido → 404

---

## 📋 CONVENCIONES DE CÓDIGO

### TypeScript
```typescript
// ✅ BUENO: Tipos explícitos
interface AgentRequest {
  input: string;
  context?: Record<string, unknown>;
}

export async function invokeAgent(req: AgentRequest): Promise<AgentResponse> {
  // ...
}

// ❌ MALO: any, implicit any
function invokeAgent(req) {
  // ...
}
```

### React
```tsx
// ✅ BUENO: Componentes funcionales con tipos
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
};

// ❌ MALO: Props sin tipos
export const Button = ({ label, onClick, disabled }) => {
  // ...
};
```

### Python
```python
# ✅ BUENO: Type hints, docstrings
from typing import Dict, Any

def handle_request(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Procesa request y retorna respuesta.
    
    Args:
        data: Datos de entrada
        
    Returns:
        Respuesta procesada
    """
    return {"result": data}

# ❌ MALO: Sin tipos ni docs
def handle_request(data):
    return {"result": data}
```

### Naming
- **Archivos**: `kebab-case.ts`, `PascalCase.tsx` (componentes)
- **Variables/funciones**: `camelCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Interfaces/Types**: `PascalCase`
- **Componentes React**: `PascalCase`

---

## 🧪 TESTING

### Estructura de Tests
```typescript
// apps/web/src/components/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click me" onClick={handleClick} />);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button label="Click me" onClick={() => {}} disabled />);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### Coverage Thresholds
```typescript
// vitest.config.ts (configuración actual)
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      statements: 50,   // Temporalmente relajado (objetivo: 80)
      functions: 75,    // Temporalmente relajado (objetivo: 80)
      branches: 45,     // Temporalmente relajado (objetivo: 75)
      lines: 50,
    },
  },
});
```

---

## 🔐 VARIABLES DE ENTORNO

### apps/api_py/server.py
```bash
# Modo forwarding (default: 0 = simulación)
MAKE_FORWARD=1

# Token para Make.com (solo si MAKE_FORWARD=1)
MAKE_TOKEN=your_make_token_here

# Puerto del servidor (default: 8080)
PORT=8080
```

### apps/web/ (si aplica)
```bash
# URL de la API proxy
VITE_API_URL=http://localhost:8080

# Otros según necesidad del proyecto
VITE_ENV=development
```

---

## 🐛 DEBUGGING COMÚN

### Problema: Linter falla con warnings
```bash
# Ver warnings específicos
pnpm -w lint

# Autofix cuando sea posible
pnpm -w lint --fix

# Si no se puede autofix, edita manualmente
```

### Problema: TypeScript errors
```bash
# Ver errores detallados
pnpm -w typecheck

# Verificar tsconfig
cat tsconfig.base.json
cat apps/web/tsconfig.json
```

### Problema: Tests fallan
```bash
# Correr tests en modo watch
pnpm -C apps/web test --watch

# Ver coverage detallado
pnpm -w test:coverage --reporter=verbose

# Correr un test específico
pnpm -C apps/web test Button.test.tsx
```

### Problema: API proxy no responde
```bash
# Verificar que está corriendo
curl http://localhost:8080/api/health

# Ver logs
cd apps/api_py && python server.py

# Verificar variables de entorno
echo $MAKE_FORWARD
echo $MAKE_TOKEN
```

### Problema: Frontend no conecta con API
```bash
# Verificar CORS en server.py
# Verificar URL en apps/web (VITE_API_URL)
# Verificar network tab en DevTools
```

---

## 📚 DOCUMENTOS CLAVE

### Leer PRIMERO antes de tocar código
1. **`docs/ARCHITECTURE_REALITY.md`** ← Estado REAL del código
2. **`docs/architecture.md`** ← Arquitectura técnica detallada
3. **`README.md`** ← Visión 100% GA (objetivo futuro)
4. **`packages/shared/src/ai/agents/README.md`** ← Arquitectura de agentes

### Para desarrollo
- **`docs/EXPRESS-VELOCITY.md`** ← Workflows rápidos
- **`docs/EXPRESS-QUICK-REFERENCE.md`** ← Comandos esenciales
- **`docs/setup.md`** ← Setup inicial detallado

### Para CI/CD
- **`.github/workflows/`** ← 11 workflows activos
- **`docs/WORKFLOWS_DECISION.md`** ← Decisiones de workflows
- **`ci-RADICAL-SOFT-MODE.md`** ← Estrategia CI/CD

---

## 🎯 WORKFLOW TÍPICO DE DESARROLLO

### 1. Setup inicial (primera vez)
```bash
cd "C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-PUNTO"
pnpm install
pnpm -w build
./scripts/core/validate-environment.sh
```

### 2. Crear nueva rama
```bash
git checkout -b feature/nombre-descriptivo
```

### 3. Desarrollar
```bash
# Terminal 1: Frontend
pnpm -C apps/web dev

# Terminal 2: API Proxy
cd apps/api_py && python server.py

# Terminal 3: Desarrollo
# (aquí editas código)
```

### 4. Verificar calidad
```bash
pnpm -w lint
pnpm -w typecheck
pnpm -w test:coverage
```

### 5. Commit y push
```bash
git add .
git commit -m "feat: descripción clara del cambio"
git push origin feature/nombre-descriptivo
```

### 6. Abrir PR en GitHub
- Ir a https://github.com/ECONEURA/ECONEURA.
- Crear Pull Request
- Esperar que CI pase (11 workflows)
- Merge cuando esté aprobado

---

## 🚀 CASOS DE USO FRECUENTES

### Agregar un nuevo componente React
```bash
# 1. Crear componente
cat > apps/web/src/components/NewComponent.tsx << 'EOF'
import React from 'react';

interface NewComponentProps {
  title: string;
}

export const NewComponent: React.FC<NewComponentProps> = ({ title }) => {
  return <div><h1>{title}</h1></div>;
};
EOF

# 2. Crear test
cat > apps/web/src/components/NewComponent.test.tsx << 'EOF'
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NewComponent } from './NewComponent';

describe('NewComponent', () => {
  it('renders title', () => {
    render(<NewComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
EOF

# 3. Verificar
pnpm -C apps/web test NewComponent.test.tsx
pnpm -C apps/web lint
```

### Agregar un nuevo endpoint en API proxy
```python
# Editar apps/api_py/server.py
# Agregar en do_POST después de línea de /api/invoke/:
elif self.path.startswith('/api/new-endpoint'):
    self.send_response(200)
    self.send_header('Content-Type', 'application/json')
    self.end_headers()
    response = {"message": "New endpoint works"}
    self.wfile.write(json.dumps(response).encode())
```

### Agregar un nuevo microservicio FastAPI
```bash
# 1. Copiar estructura de un servicio existente
cp -r services/neuras/analytics services/neuras/new-service

# 2. Editar app.py
cd services/neuras/new-service
# Modificar app.py según necesidad

# 3. Agregar a docker-compose.dev.yml
# (agregar servicio con puerto único)

# 4. Documentar en README.md
```

---

## 🔍 TROUBLESHOOTING AVANZADO

### CI falla en GitHub pero local funciona
```bash
# 1. Limpiar cache
pnpm -w clean
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules

# 2. Reinstalar
pnpm install

# 3. Rebuild
pnpm -w build

# 4. Re-test
pnpm -w lint && pnpm -w typecheck && pnpm -w test:coverage

# 5. Verificar .gitignore no excluya archivos necesarios
git status --ignored
```

### Build falla por dependencias circulares
```bash
# Ver dependencias del workspace
pnpm -r list --depth 1

# Verificar package.json en packages/
cat packages/shared/package.json
cat packages/configs/package.json

# Asegurar que no hay imports circulares
grep -r "from '@econeura" packages/
```

### Tests fallan aleatoriamente
```bash
# Correr con un solo thread
pnpm -C apps/web test -- --threads 1

# Aumentar timeout
pnpm -C apps/web test -- --testTimeout=10000

# Verificar mocks en vitest.setup.ts
cat vitest.setup.ts
```

---

## 💡 TIPS PARA AGENTES IA

### Cuando el usuario pide "hazlo"
1. **NO preguntes** "¿en qué archivo?" si puedes buscarlo con grep_search
2. **NO preguntes** "¿qué comando uso?" si está en este documento
3. **EJECUTA** directamente y reporta resultado
4. **Si falla**, diagnostica y arregla en el mismo turn

### Cuando encuentras un error
```bash
# ❌ MAL: Reportar y parar
"Encontré un error de TypeScript en línea 42"

# ✅ BIEN: Diagnosticar, arreglar, verificar
1. Leo el archivo completo con read_file
2. Identifico el error (tipo incorrecto)
3. Edito con replace_string_in_file
4. Verifico con pnpm -w typecheck
5. Reporto "Arreglado error de tipo en línea 42, typecheck pasa ✅"
```

### Cuando necesitas contexto
```bash
# SIEMPRE leer estos archivos primero
1. docs/ARCHITECTURE_REALITY.md  # Estado real
2. apps/api_py/server.py         # API endpoints
3. packages/shared/src/          # Código compartido

# NUNCA asumas estructura sin verificar
grep -r "function name" .        # Buscar implementación
semantic_search "concepto"       # Búsqueda semántica
```

### Cuando editas código
```typescript
// ✅ BIEN: Edit mínimo, preserva contexto
// Cambiar solo la línea necesaria, mantener:
// - Imports existentes
// - Exports existentes
// - Comentarios importantes
// - Formato/indentación

// ❌ MAL: Reescribir archivo completo
// No borres código que funciona
```

---

## 📞 CONTACTO Y ESCALAMIENTO

### Si algo está muy mal
1. **Reporta en PR/Issue** con:
   - Comando exacto que falló
   - Output completo del error
   - Archivo(s) afectado(s)
   - Steps to reproduce

2. **Busca en issues existentes**:
   ```bash
   # Ver issues abiertos en GitHub
   curl -H "Accept: application/vnd.github.v3+json" \
     https://api.github.com/repos/ECONEURA/ECONEURA./issues?state=open
   ```

3. **Rollback si es crítico**:
   ```bash
   git reset --hard HEAD~1
   # o
   git revert <commit-hash>
   ```

---

## 🎓 APRENDIZAJE CONTINUO

### Después de resolver un issue
1. **Documenta** en `docs/decisions.md` si es arquitectónico
2. **Actualiza** este MEGAPROMPT si es patrón recurrente
3. **Agrega test** para prevenir regresión
4. **Refactoriza** si el código quedó feo (pero tests primero)

### Métricas de calidad
```bash
# Coverage actual
pnpm -w test:coverage | grep "Statements"

# Deuda técnica (TODOs)
grep -r "TODO\|FIXME\|HACK" apps/ packages/ services/

# Complejidad ciclomática (si tienes herramienta)
# Archivos grandes (>500 líneas)
find apps packages services -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -20
```

---

## 🏁 CHECKLIST ANTES DE CADA COMMIT

```bash
# □ Código compila sin errores
pnpm -w build

# □ Linter pasa sin warnings
pnpm -w lint

# □ TypeScript sin errores
pnpm -w typecheck

# □ Tests pasan con coverage suficiente
pnpm -w test:coverage

# □ Cambios committed en rama feature/
git status

# □ Mensaje de commit descriptivo
# feat: agregar componente X
# fix: corregir bug en Y
# refactor: simplificar lógica en Z
# docs: actualizar README con instrucción W

# □ Push y verificar CI en GitHub
git push origin feature/nombre
# Ir a https://github.com/ECONEURA/ECONEURA./actions
```

---

## 🎉 RESUMEN EJECUTIVO

### Para empezar YA
```bash
cd "C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-PUNTO"
pnpm install
./scripts/start-dev.sh
```

### URLs importantes
- **Repo**: https://github.com/ECONEURA/ECONEURA.
- **Frontend Dev**: http://localhost:3000
- **API Proxy**: http://localhost:8080
- **Health Check**: http://localhost:8080/api/health

### Archivos críticos
- `apps/api_py/server.py` ← Backend proxy (65 líneas)
- `apps/web/src/` ← Frontend React
- `packages/shared/src/` ← Código compartido
- `docs/ARCHITECTURE_REALITY.md` ← Estado real del código

### Comando más usado
```bash
pnpm -w lint && pnpm -w typecheck && pnpm -w test:coverage
```

### Regla de oro
**"No rompas CI. Si lo rompes, arréglalo en <5 minutos."**

---

## 📄 LICENCIA Y CONTRIBUCIÓN

Ver `LICENSE` en raíz del proyecto.

Para contribuir:
1. Fork el repo
2. Crea rama feature/
3. Commit cambios
4. Push y abre PR
5. Espera review y CI
6. Merge!

---

**FIN DEL MEGAPROMPT**

*Versión: 1.0.0*  
*Última actualización: 2025-10-08*  
*Mantenido por: Equipo ECONEURA*

---

## 🔮 PROMPT EXAMPLE PARA COPIAR/PEGAR

```markdown
Soy un desarrollador trabajando en el monorepo ECONEURA.

**Contexto del proyecto:**
- Monorepo pnpm con React+Vite (frontend), Python HTTP proxy (backend), 11 microservicios FastAPI
- Repo: https://github.com/ECONEURA/ECONEURA.
- Directorio local: C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-PUNTO

**Estado actual:**
- Frontend en apps/web/ (puerto 3000)
- API proxy en apps/api_py/server.py (puerto 8080)
- 11 servicios FastAPI en services/neuras/
- CI con 11 workflows en GitHub Actions

**Convenciones:**
- TypeScript estricto, ESLint con --max-warnings 0
- Coverage: statements ≥50%, functions ≥75%, branches ≥45%
- Comandos: pnpm -w lint, pnpm -w typecheck, pnpm -w test:coverage

**Realidad vs Documentación:**
- ⚠️ NO existe packages/config/ → es packages/configs/ (plural)
- ⚠️ NO existe agent-routing.json → rutas hardcoded en apps/api_py/server.py
- ⚠️ README.md describe visión GA → docs/ARCHITECTURE_REALITY.md describe código real

**Mi solicitud:**
[DESCRIBE TU TAREA AQUÍ]

**Expectativa:**
- Ejecuta comandos directamente, no preguntes si es obvio
- Si falla algo, diagnostica y arregla en el mismo turno
- Verifica con linter/typecheck/tests antes de terminar
- Usa replace_string_in_file para editar código (no imprimas bloques)
```

---

**COPIA TODO DESDE AQUÍ HACIA ARRIBA Y PÉGALO EN TU CHAT IA** 🚀
