# 🔧 CORRECCIONES DE SCRIPTS package.json

**Fecha:** 8 de octubre de 2025  
**Problema:** CI fallaba con `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "build" not found`

---

## ❌ Problema Original

```bash
ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command "build" not found
```

**Causa:** Algunos `package.json` no tenían scripts `build` o `test:coverage` definidos.

---

## ✅ Solución Aplicada

### 1. **Root package.json**

**ANTES:**
```json
{
  "scripts": {
    "typecheck": "node ./scripts/run-tsc.js --noEmit",
    "lint": "eslint --no-error-on-unmatched-pattern ...",
    "format": "prettier --write ."
  }
}
```

**DESPUÉS:**
```json
{
  "scripts": {
    "typecheck": "node ./scripts/run-tsc.js --noEmit",
    "lint": "eslint --no-error-on-unmatched-pattern ...",
    "format": "prettier --write .",
    "build": "pnpm -r --filter=./packages/* run build",
    "test": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Cambios:**
- ✅ Añadido `"build"` - Ejecuta build recursivo en todos los packages
- ✅ Añadido `"test"` - Ejecuta tests con Vitest
- ✅ Añadido `"test:coverage"` - Ejecuta tests con coverage

---

### 2. **apps/web/package.json**

**ANTES:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node server.js",
    "typecheck": "node ../../scripts/run-tsc.js --noEmit"
  }
}
```

**DESPUÉS:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node server.js",
    "typecheck": "node ../../scripts/run-tsc.js --noEmit",
    "test": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Cambios:**
- ✅ Añadido `"test"` - Ejecuta tests con Vitest
- ✅ Añadido `"test:coverage"` - Ejecuta tests con coverage

---

## 🧪 Validación

### Tests Ejecutados:

```bash
# 1. Build funciona
pnpm run build
✅ SUCCESS - @econeura/shared@1.0.0 build completado

# 2. Test coverage funciona
pnpm run test:coverage
✅ SUCCESS - Tests ejecutados con coverage
   - packages/shared/dist/__tests__/rate-limiter.test.js (17 tests) ✅
   - packages/shared/src/__tests__/rate-limiter.test.ts (17 tests) ✅
   - packages/shared/dist/__tests__/health.test.js ✅
```

### Verificación de Scripts:

```bash
# Root package.json
✅ "build": "pnpm -r --filter=./packages/* run build"
✅ "test": "vitest"
✅ "test:coverage": "vitest run --coverage"

# apps/web/package.json
✅ "build": "vite build"
✅ "test": "vitest"
✅ "test:coverage": "vitest run --coverage"

# apps/cockpit/package.json
✅ "build": "vite build" (ya existía)
✅ "test:coverage": "vitest run --coverage" (ya existía)

# packages/shared/package.json
✅ "build": "tsc -p tsconfig.json" (ya existía)
✅ "test:coverage": "vitest run --coverage" (ya existía)
```

---

## 📊 Estado Final

| Package | build | test | test:coverage | Estado |
|---------|-------|------|---------------|--------|
| **Root** | ✅ | ✅ | ✅ | ✅ CORREGIDO |
| **apps/web** | ✅ | ✅ | ✅ | ✅ CORREGIDO |
| **apps/cockpit** | ✅ | ✅ | ✅ | ✅ OK |
| **packages/shared** | ✅ | ✅ | ✅ | ✅ OK |

---

## 🎯 Impacto en CI/CD

### ANTES (con errores):
```yaml
# .github/workflows/ci-full.yml
- name: Build packages
  run: pnpm -w build
  # ❌ FALLABA: Command "build" not found

- name: Run tests with coverage
  run: pnpm -w test:coverage
  # ❌ FALLABA: Command "test:coverage" not found
```

### DESPUÉS (corregido):
```yaml
# .github/workflows/ci-full.yml
- name: Build packages
  run: pnpm -w build
  # ✅ FUNCIONA: Ejecuta build en packages/shared

- name: Run tests with coverage
  run: pnpm -w test:coverage
  # ✅ FUNCIONA: Ejecuta tests con coverage
```

---

## 💡 Comando Útil (alternativa)

Si en el futuro necesitas añadir scripts dummy a múltiples paquetes:

```bash
# PowerShell
Get-ChildItem -Recurse -Filter "package.json" | ForEach-Object {
    $json = Get-Content $_.FullName | ConvertFrom-Json
    if (-not $json.scripts.build) {
        npm pkg set scripts.build="echo No build step" --prefix $_.Directory.FullName
    }
}

# Bash
pnpm recursive exec -- 'npm pkg set scripts.test:coverage="echo No test:coverage script defined"'
```

---

## ✅ Conclusión

**Problema resuelto:** Todos los `package.json` ahora tienen los scripts necesarios para CI/CD.

**Scripts añadidos:**
- Root: `build`, `test`, `test:coverage`
- apps/web: `test`, `test:coverage`

**Próximos pasos:**
- ✅ CI workflows deberían pasar ahora
- ✅ `pnpm -w build` funciona desde raíz
- ✅ `pnpm -w test:coverage` funciona desde raíz

**Tiempo de corrección:** ~5 minutos  
**Archivos modificados:** 2 (`package.json`, `apps/web/package.json`)
