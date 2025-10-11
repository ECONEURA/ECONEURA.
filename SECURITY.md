# Security Policy

## 🔒 Política de Seguridad ECONEURA

## Versiones soportadas

Actualmente mantenemos soporte de seguridad para las siguientes versiones:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## 🚨 Reportar una vulnerabilidad

**¡NO abras un issue público para vulnerabilidades de seguridad!**

### Proceso de reporte

1. **Reporta vulnerabilidades privadamente** enviando un email a:
   - **Email**: security@econeura.com (o el email configurado)
   - **Asunto**: `[SECURITY] Breve descripción de la vulnerabilidad`

2. **Incluye en tu reporte**:
   - Descripción detallada de la vulnerabilidad
   - Pasos para reproducir el problema
   - Versiones afectadas
   - Impacto potencial
   - Solución propuesta (si la tienes)

3. **Tiempo de respuesta esperado**:
   - **Primera respuesta**: Dentro de 48 horas
   - **Actualización de estado**: Cada 7 días
   - **Resolución**: Según severidad (ver tabla abajo)

### Severidad y tiempos de resolución

| Severidad | Descripción | Tiempo de resolución |
|-----------|-------------|---------------------|
| 🔴 **Crítica** | Explotable remotamente, sin autenticación | 24-48 horas |
| 🟠 **Alta** | Explotable con autenticación, pérdida de datos | 7 días |
| 🟡 **Media** | Requiere condiciones específicas, impacto limitado | 30 días |
| 🟢 **Baja** | Impacto mínimo, requiere acceso privilegiado | 90 días |

## 🛡️ Proceso de divulgación

1. **Reporte privado** → El investigador reporta la vulnerabilidad
2. **Confirmación** → Equipo confirma y asigna severidad (48h)
3. **Desarrollo del fix** → Se desarrolla y prueba el parche
4. **Notificación privada** → Se notifica a usuarios afectados (si aplica)
5. **Release del patch** → Se publica la versión corregida
6. **Divulgación pública** → Se publica advisory público (7-30 días después del patch)

## 🏆 Reconocimientos

Mantenemos un **Hall of Fame** para investigadores que reportan vulnerabilidades responsablemente:

<!-- Future entries will be added here -->
- Ningún reporte aún

## 🔐 Prácticas de seguridad del proyecto

### Dependencias

- **Renovate Bot**: Actualizaciones automáticas semanales
- **Dependabot**: Alertas de seguridad GitHub
- **npm audit**: Ejecutado en CI/CD pipeline
- **Snyk**: Escaneo de vulnerabilidades (si configurado)

### CI/CD

- ✅ Linting y typecheck obligatorio
- ✅ Tests de cobertura (≥50% statements, ≥75% functions)
- ✅ Pre-push validation script
- ✅ No secrets en código (gitleaks scan)
- ✅ SAST analysis (si configurado)

### Infraestructura

- 🔒 Secrets en GitHub Secrets / Azure Key Vault
- 🔒 Variables de entorno nunca commiteadas
- 🔒 Autenticación Bearer Token en API
- 🔒 HTTPS obligatorio en producción
- 🔒 CORS configurado restrictivamente
- 🔒 Rate limiting en endpoints públicos

### Código

- ✅ Input validation en todas las APIs
- ✅ SQL parameterizado (prevención de SQL injection)
- ✅ Sanitización de output (prevención de XSS)
- ✅ Autenticación y autorización en endpoints sensibles
- ✅ Logging sin datos sensibles

## 📚 Recursos de seguridad

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **CWE Top 25**: https://cwe.mitre.org/top25/
- **NIST Guidelines**: https://www.nist.gov/cybersecurity

## 🔄 Actualizaciones de esta política

Esta política se revisa trimestralmente. Última actualización: **8 Octubre 2025**

## 📞 Contacto

Para preguntas sobre esta política de seguridad:
- Email: security@econeura.com
- GitHub Security Advisories: https://github.com/ECONEURA/ECONEURA./security/advisories

---

**⚠️ Nota importante**: Si descubres una vulnerabilidad, actúa responsablemente. No la explotes ni la divulgues públicamente hasta que hayamos tenido oportunidad de corregirla. Agradecemos tu colaboración para mantener ECONEURA seguro.
