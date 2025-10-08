# Contributing to ECONEURA

¡Gracias por tu interés en contribuir a ECONEURA! 🎉

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo contribuir?](#cómo-contribuir)
- [Configuración del entorno](#configuración-del-entorno)
- [Guía de estilo](#guía-de-estilo)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reportar bugs](#reportar-bugs)

## 🤝 Código de Conducta

Al participar en este proyecto, aceptas mantener un ambiente respetuoso y profesional.

## 🚀 ¿Cómo contribuir?

### 1. Fork el repositorio

```bash
# Clonar tu fork
git clone https://github.com/TU_USUARIO/ECONEURA..git
cd ECONEURA.

# Añadir upstream
git remote add upstream https://github.com/ECONEURA/ECONEURA..git
```

### 2. Crear una rama

```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear rama feature
git checkout -b feature/mi-nueva-feature

# O rama fix
git checkout -b fix/corregir-bug-123
```

### 3. Hacer cambios

- Sigue la [guía de estilo](#guía-de-estilo)
- Añade tests para nuevas funcionalidades
- Actualiza documentación si es necesario

### 4. Commit y Push

```bash
# Stagear cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: añadir nueva funcionalidad X"

# Push a tu fork
git push origin feature/mi-nueva-feature
```

### 5. Crear Pull Request

Ve a GitHub y crea un PR desde tu rama hacia `main` del repo original.

## 🛠️ Configuración del entorno

### Prerequisitos

- **Node.js** 20+
- **pnpm** 8.15.5
- **Python** 3.11+
- **Docker** & **Docker Compose**
- **Git**

### Instalación

```bash
# 1. Instalar dependencias
pnpm install

# 2. Levantar servicios
docker compose -f docker-compose.dev.enhanced.yml up -d

# 3. Copiar .env
cp .env.template .env

# 4. Verificar instalación
pnpm -w lint
pnpm -w typecheck
pnpm -w test
pnpm -w build
```

### Scripts útiles

```bash
# Desarrollo
pnpm -C apps/web dev              # Iniciar frontend
pnpm -C apps/cockpit dev          # Iniciar cockpit

# Validación
pnpm -w lint                      # Lint
pnpm -w typecheck                 # Typecheck
pnpm -w test                      # Tests
pnpm -w test:coverage             # Tests con coverage
pnpm -w build                     # Build

# Pre-push (recomendado)
.\scripts\powershell\PRE_PUSH_VALIDATION.ps1
```

## 📝 Guía de estilo

### TypeScript/JavaScript

- **Indentación:** 2 espacios
- **Comillas:** Simples para strings
- **Punto y coma:** Obligatorio
- **Line length:** Máximo 100 caracteres
- **Naming:**
  - `camelCase` para variables y funciones
  - `PascalCase` para clases y componentes
  - `UPPER_SNAKE_CASE` para constantes

### Python

- **Estilo:** PEP 8
- **Indentación:** 4 espacios
- **Line length:** Máximo 100 caracteres
- **Type hints:** Obligatorios en funciones públicas

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Tipos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formateo, sin cambios de código
- `refactor`: Refactorización sin cambiar funcionalidad
- `test`: Añadir o modificar tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**
```bash
feat(agents): añadir agente analytics con Azure OpenAI
fix(auth): corregir validación de tokens JWT
docs(readme): actualizar guía de instalación
test(api): añadir tests para endpoint /invoke
```

## 🔍 Proceso de Pull Request

### Checklist antes de crear PR

- [ ] Código pasa lint (`pnpm -w lint`)
- [ ] Código pasa typecheck (`pnpm -w typecheck`)
- [ ] Tests pasan (`pnpm -w test`)
- [ ] Build exitoso (`pnpm -w build`)
- [ ] Tests añadidos para nueva funcionalidad
- [ ] Documentación actualizada
- [ ] Commits siguen Conventional Commits
- [ ] Branch actualizada con `main`

### Template de PR

```markdown
## Descripción

Breve descripción de los cambios.

## Tipo de cambio

- [ ] Bug fix (non-breaking change)
- [ ] Nueva funcionalidad (non-breaking change)
- [ ] Breaking change (fix o feature que causa incompatibilidad)
- [ ] Documentación

## ¿Cómo se ha probado?

Describe los tests realizados.

## Checklist

- [ ] Código pasa lint
- [ ] Tests pasan
- [ ] Documentación actualizada
- [ ] Commits siguen convenciones
```

### Revisión

- PRs requieren al menos 1 aprobación
- CI debe pasar (lint, typecheck, tests, build)
- No merge conflicts
- Descripción clara de cambios

## 🐛 Reportar bugs

### Antes de reportar

1. Busca si el bug ya fue reportado
2. Verifica que estás usando la última versión
3. Intenta reproducir en entorno limpio

### Template de issue

```markdown
## Descripción del bug

Descripción clara del problema.

## Para reproducir

Pasos para reproducir:
1. Ir a '...'
2. Hacer click en '...'
3. Ver error

## Comportamiento esperado

Qué esperabas que pasara.

## Screenshots

Si aplica, añade screenshots.

## Entorno

- OS: [e.g. Windows 11, Ubuntu 22.04]
- Node: [e.g. 20.11.0]
- pnpm: [e.g. 8.15.5]
- Browser: [e.g. Chrome 120]

## Contexto adicional

Cualquier información relevante.
```

## 📚 Recursos

- [Documentación oficial](./docs/README.md)
- [Guía de arquitectura](./docs/architecture.md)
- [Workflows analysis](./docs/WORKFLOWS_ANALYSIS.md)
- [Execution summary](./docs/EXECUTION_SUMMARY_OCT_8.md)

## 💬 Preguntas

Si tienes preguntas, puedes:
- Abrir un issue con label `question`
- Contactar en Discord (próximamente)
- Email: [TU_EMAIL]

---

**¡Gracias por contribuir a ECONEURA!** 🎉
