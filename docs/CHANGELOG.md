# ECONEURA Changelog

All notable changes to the ECONEURA system will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (8 Oct 2025)
- ✅ Scripts `build`, `test`, `test:coverage` en root package.json
- ✅ Scripts `test`, `test:coverage` en apps/web/package.json
- ✅ CI badges en README.md principal
- ✅ Documentación de correcciones: `docs/SCRIPT_FIXES.md`
- ✅ Autocrítica exhaustiva: `docs/AUTOCRITICA_SCRIPTS.md`
- ✅ Complete repository cleanup removing all non-functional code
- ✅ Restored core functional systems (documentation, test suite)
- ✅ Implemented clean architecture with inheritance patterns

### Changed (8 Oct 2025)
- ✅ Workflows CI optimizados (eliminado `|| true` y fallbacks)
- ✅ `deploy-azure.yml`: Eliminado `|| true` peligroso (línea 70)
- ✅ `ci-basic.yml`: Eliminado fallback innecesario (línea 48)
- ✅ `build-web.yml`: Eliminado fallback innecesario (línea 55)
- ✅ `docs/WORKFLOWS_ANALYSIS.md`: Actualizado con correcciones
- ✅ Removed 100+ temporary scripts and artifacts
- ✅ Streamlined repository to essential scripts only
- ✅ Improved system maintainability and performance

### Fixed (8 Oct 2025)
- 🔴 **CRÍTICO**: Error `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "build" not found`
- 🔴 **CRÍTICO**: Deploy workflow ocultaba errores de build con `|| true`
- 🟡 **MEDIO**: Fallbacks innecesarios en workflows CI
- 🟡 **MEDIO**: Documentación desactualizada en WORKFLOWS_ANALYSIS.md

### Removed
- ❌ Fallback `|| true` en deploy-azure.yml (ocultaba errores)
- ❌ Fallbacks `|| echo` en ci-basic.yml y build-web.yml
- ❌ `continue-on-error: true` innecesarios en workflows
- ❌ All backup files, logs, and temporary artifacts
- ❌ Non-functional scripts and analysis tools
- ❌ Redundant and obsolete code
