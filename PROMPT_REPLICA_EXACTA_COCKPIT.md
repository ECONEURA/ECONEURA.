# PROMPT: RÉPLICA EXACTA DEL COCKPIT ECONEURA

## OBJETIVO ÚNICO
Replicar **EXACTAMENTE** el archivo `EconeuraCockpit.tsx` que el usuario proporciona, SIN modificaciones, SIN mejoras, SIN cambios de ningún tipo.

## REGLAS ESTRICTAS (INVIOLABLES)

### ❌ PROHIBIDO ABSOLUTAMENTE:
1. **NO agregar funcionalidades** que no estén en el código original
2. **NO modificar imports** ni estructura de componentes
3. **NO cambiar nombres** de funciones, variables o componentes
4. **NO "mejorar" el código** de ninguna manera
5. **NO agregar comentarios** que no estén en el original
6. **NO cambiar el estilo** de código (espacios, comillas, formato)
7. **NO integrar APIs** externas si no están en el original
8. **NO modificar colores**, estilos ni diseño visual
9. **NO agregar imports** de utilidades o helpers externos
10. **NO tocar los emojis** ni caracteres especiales (UTF-8 estricto)

### ✅ ÚNICA ACCIÓN PERMITIDA:
**COPIAR Y PEGAR** el código exacto que el usuario proporciona en:
```
apps/web/src/EconeuraCockpit.tsx
```

## PROCESO DE VERIFICACIÓN (OBLIGATORIO)

### ANTES DE EDITAR:
1. ✅ Leer el código completo que el usuario envía
2. ✅ Verificar que sea el archivo `EconeuraCockpit.tsx`
3. ✅ Confirmar al usuario: "Voy a replicar EXACTAMENTE el código que enviaste, sin modificaciones"

### AL EDITAR:
1. ✅ Usar `replace_string_in_file` para reemplazar TODO el contenido del archivo
2. ✅ Copiar el código **CARÁCTER POR CARÁCTER** como está
3. ✅ Preservar TODOS los espacios, saltos de línea, indentación
4. ✅ NO tocar ningún carácter UTF-8 (emojis, tildes, ñ, etc.)

### DESPUÉS DE EDITAR:
1. ✅ Verificar que el archivo se guardó correctamente
2. ✅ NO ejecutar lint, NO ejecutar typecheck, NO ejecutar tests
3. ✅ NO hacer commit automáticamente
4. ✅ Confirmar al usuario: "Archivo replicado exactamente. Por favor verifica en localhost:3001"

## TEMPLATE DE RESPUESTA

Cuando el usuario envíe el código, responder EXACTAMENTE:

```
Entendido. Voy a replicar EXACTAMENTE el código de EconeuraCockpit.tsx que enviaste, 
sin ninguna modificación, sin mejoras, sin cambios.

Características que copiaré tal cual están:
- [Listar 3-5 características principales que se ven en el código]

Procedo a reemplazar el archivo completo.
```

Luego ejecutar:
```typescript
replace_string_in_file({
  filePath: "apps/web/src/EconeuraCockpit.tsx",
  oldString: "[CONTENIDO COMPLETO ACTUAL DEL ARCHIVO]",
  newString: "[CONTENIDO EXACTO QUE EL USUARIO ENVIÓ]"
})
```

Luego confirmar:
```
✅ Archivo replicado exactamente.
✅ NO se hicieron modificaciones al código original.
✅ Verifica en: http://localhost:3001

¿Se ve correcto ahora?
```

## MANEJO DE ERRORES

Si `replace_string_in_file` falla:
1. Leer el archivo completo actual con `read_file`
2. Intentar de nuevo con el contenido exacto
3. Si persiste el error, usar `create_file` (sobrescribir)

**NUNCA** intentar "arreglar" el código del usuario.

## CHECKLIST FINAL

Antes de responder al usuario, verificar:
- [ ] ¿Copié el código EXACTAMENTE como lo envió?
- [ ] ¿NO agregué ninguna función nueva?
- [ ] ¿NO modifiqué imports?
- [ ] ¿NO cambié nombres de componentes?
- [ ] ¿NO agregué integraciones con APIs externas?
- [ ] ¿Preservé TODOS los caracteres UTF-8 correctamente?
- [ ] ¿NO ejecuté lint/tests/typecheck?
- [ ] ¿Le pedí al usuario que verifique en localhost?

**Si alguna respuesta es NO, DETENER y corregir.**

---

## EJEMPLO DE USO CORRECTO

**Usuario envía:**
```tsx
// ... código del Cockpit ...
```

**Agente responde:**
```
Entendido. Voy a replicar EXACTAMENTE tu código sin modificaciones.

Características que copiaré tal cual:
- 10 departamentos (CEO, IA, CSO, CTO, CISO, COO, CHRO, MKT, CFO, CDO)
- Colores mediterráneos
- Web Speech API para voz
- Logo SVG custom
- Chat drawer con TTS

[Ejecuta replace_string_in_file]

✅ Replicado exactamente. Verifica en localhost:3001
```

---

## ANTIPATRÓN: LO QUE NUNCA HACER

❌ **MAL:**
"Voy a integrar tu Cockpit con OpenAI..."
"Le agregaré mejor manejo de errores..."
"Optimicé los imports..."
"Mejoré el TypeScript..."

✅ **BIEN:**
"Copiado exactamente como lo enviaste."
"Sin modificaciones."
"Verifica en localhost:3001"

---

## RECORDATORIO FINAL

**TU ÚNICO TRABAJO:** Copiar y pegar el código exacto del usuario.
**NADA MÁS.**

Si tienes dudas, **NO HAGAS NADA** y pregunta primero.
