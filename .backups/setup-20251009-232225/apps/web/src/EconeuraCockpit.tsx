import React, { useMemo, useState, useEffect, useRef } from "react";

import {
  Crown, Cpu, Shield, Workflow, Users, Target, Brain, LineChart, Wallet, Database,
  ShieldCheck, UserCheck, MessageCircle, ClipboardList, Megaphone, FileText, Radar,
  Bug, Gauge, Activity as ActivityIcon, Inbox, Mail, TrendingUp, FileBarChart2, ListChecks, CalendarDays,
  Mic, MicOff, Volume2, StopCircle
} from "lucide-react";

/**
 * ECONEURA — adaptación 1:1 del diseño y gramática proporcionados.
 * Sin cambios visuales ni de textos. Logo e iconografía exactos.
 * Política: NO DEPLOY. Llamadas HTTP opcionales vía env.
 * Marca: sin lema.
 */

// Utilidades básicas
const cx = (...cls: (string | boolean | undefined)[]) => cls.filter(Boolean).join(" ");

// Tipos
export type Agent = { id: string; title: string; desc: string; pills?: string[] };
export interface Department { id: string; name: string; chips: string[]; neura: { title: string; subtitle: string; tags: string[] }; agents: Agent[] }

type NeuraActivity = { id: string; ts: string; agentId: string; deptId: string; status: 'OK'|'ERROR'; message: string };

// Logo oficial proporcionado por el usuario (tal cual, sin cambios)
function LogoEconeura(): JSX.Element {
  const svg = `<svg width="200" height="200" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="t a">
  <title id="t">Logo ECONEURA</title>
  <desc id="a">Arbol-circuito con nodos dorados dentro de un círculo.</desc>
  <g fill="none" stroke="#0E6B67" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="46" />
    <path d="M50 82 V28" />
    <path d="M50 45 L32 34" />
    <path d="M50 45 L68 34" />
    <path d="M50 62 L28 58" />
    <path d="M50 62 L72 58" />
    <path d="M50 76 L36 76" />
    <path d="M50 76 L64 76" />
  </g>
  <g fill="#F5B31A" stroke="none">
    <circle cx="50" cy="20" r="5.5"/>
    <circle cx="32" cy="34" r="5"/>
    <circle cx="68" cy="34" r="5"/>
    <circle cx="28" cy="58" r="5"/>
    <circle cx="72" cy="58" r="5"/>
    <circle cx="36" cy="76" r="5"/>
    <circle cx="64" cy="76" r="5"/>
  </g>
</svg>`;
  return <span className="[&>svg]:w-6 [&>svg]:h-6" dangerouslySetInnerHTML={{ __html: svg }} />;
}

// Lectura de variables de entorno SIN romper en navegador
const readVar = (winKey: string, viteKey: string, nodeKey: string): string | undefined => {
  const fromWin = (typeof window !== 'undefined' && (window as any)[winKey]) as string | undefined;
  const fromVite = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.[viteKey]) as string | undefined;
  const fromNode = (typeof process !== 'undefined' && (process as any)?.env?.[nodeKey]) as string | undefined;
  return fromWin || fromVite || fromNode || undefined;
};

const env = {
  GW_URL: readVar('__ECONEURA_GW_URL', 'VITE_NEURA_GW_URL', 'NEURA_GW_URL'),
  GW_KEY: readVar('__ECONEURA_GW_KEY', 'VITE_NEURA_GW_KEY', 'NEURA_GW_KEY'),
  LA_ID:  readVar('__LA_WORKSPACE_ID', 'VITE_LA_WORKSPACE_ID', 'LA_WORKSPACE_ID'),
  LA_KEY: readVar('__LA_SHARED_KEY', 'VITE_LA_SHARED_KEY', 'LA_SHARED_KEY'),
};

const nowIso = () => new Date().toISOString();

function correlationId() {
  try {
    const rnd = (globalThis as any).crypto?.getRandomValues(new Uint32Array(4));
    if (rnd) return Array.from(rnd).map((n) => n.toString(16)).join("");
    throw new Error('no crypto');
  } catch {
    const r = () => Math.floor(Math.random() * 1e9).toString(16);
    return `${Date.now().toString(16)}${r()}${r()}`;
  }
}

async function invokeAgent(agentId: string, route: 'local' | 'azure' = 'azure', payload: any = {}) {
  if (!env.GW_URL || !env.GW_KEY) {
    return { ok: true, simulated: true, output: `Simulado ${agentId}` };
  }
  const url = `${String(env.GW_URL).replace(/\/$/, '')}/api/invoke/${agentId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.GW_KEY}`,
      'X-Route': route,
      'X-Correlation-Id': correlationId(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: payload?.input ?? "", policy: { pii: 'mask' }, meta: { agentId, source: 'ui' } }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json().catch(() => ({}));
}

// Telemetría opcional → Azure Log Analytics HTTP Data Collector
async function logActivity(row: Record<string, any>) {
  if (!env.LA_ID || !env.LA_KEY) return; // opcional
  const g: any = globalThis as any;
  if (!g.crypto || !g.crypto.subtle) return;
  if (typeof g.atob !== 'function' || typeof g.btoa !== 'function') return;
  try {
    const body = JSON.stringify([{ ...row, TimeGenerated: nowIso(), Product: 'ECONEURA', Type: 'EconeuraLogs' }]);
    const endpoint = `https://${env.LA_ID}.ods.opinsights.azure.com/api/logs?api-version=2016-04-01`;
    const keyBytes = Uint8Array.from(g.atob(String(env.LA_KEY)), (c: string) => c.charCodeAt(0));
    const crypto = g.crypto.subtle;
    const k = await crypto.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const date = nowIso();
    const toSign = new TextEncoder().encode(`POST
${body.length}
application/json
x-ms-date:${date}
/api/logs`);
    const sig = await crypto.sign('HMAC', k, toSign);
    const signature = g.btoa(String.fromCharCode(...new Uint8Array(sig)));
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Log-Type': 'EconeuraLogs',
        'Authorization': `SharedKey ${env.LA_ID}:${signature}`,
        'x-ms-date': date,
      },
      body,
    }).catch(() => {});
  } catch { /* no-op */ }
}

// Iconos por departamento — usar ElementType
const DeptIcon: Record<string, React.ElementType> = {
  CEO: Crown,
  IA: Brain,
  CSO: Target,
  CTO: Cpu,
  CISO: Shield,
  COO: Workflow,
  CHRO: Users,
  MKT: LineChart,
  CFO: Wallet,
  CDO: Database,
};

// Guard de componente React válido
const isComponent = (x: any): x is React.ElementType => !!x && (typeof x === 'function' || typeof x === 'object');

// Resolver icono con fallback
function getDeptIcon(id: string): React.ElementType {
  const Icon = (DeptIcon as any)[id];
  return isComponent(Icon) ? Icon : Crown;
}

// Utilidades de color
function hexToRgb(hex: string){
  const h = hex.replace('#','');
  const bigint = parseInt(h.length===3? h.split('').map(x=>x+x).join('') : h, 16);
  const r=(bigint>>16)&255,g=(bigint>>8)&255,b=bigint&255;return {r,g,b};
}
function rgba(hex:string, a:number){ const {r,g,b}=hexToRgb(hex); return `rgba(${r}, ${g}, ${b}, ${a})`; }

// Paleta mediterránea por departamento
const DEFAULTS_HEX: Record<string,string> = (typeof window!=='undefined' && (window as any).__ECONEURA_COLORS) || {
  CEO: '#2C3E50',      // Azul Noche Mediterránea
  IA:  '#3498DB',      // Azul Índigo Sereno
  CISO:'#7E8B89',      // Verde Salvia Estratégico (muted)
  CTO: '#6DADE9',      // Azul Celeste Sofisticado
  COO: '#B39B83',      // Marrón Arena Versátil
  MKT: '#E67E22',      // Naranja Sunset
  CFO: '#D96D5C',      // Terracota Refinado
  CHRO:'#E76F51',      // Coral suave coherente
  CDO: '#F5E5DC',      // Beige Luminoso
};

type Pal = { accentText:string; accentBg:string; accentBorder:string; textHex:string; bgCss:string; borderCss:string };
const PALETTE: Record<string, Pal> = Object.fromEntries(Object.entries(DEFAULTS_HEX).map(([k,hex])=>{
  const textHex = hex;
  return [k, {
    accentText: 'text-slate-900',
    accentBg: 'bg-white',
    accentBorder: 'border-gray-200',
    textHex,
    bgCss: rgba(hex, 0.08),
    borderCss: rgba(hex, 0.35),
  }];
})) as Record<string, Pal>;

const DEFAULT_PALETTE = PALETTE.CEO;
function getPalette(id: string) { return PALETTE[id] || DEFAULT_PALETTE; }

// Tema e i18n
const theme = { border: '#e5e7eb', muted: '#64748b', ink: '#1f2937', surface: '#ffffff' };
const i18n = { es: {  privacy: 'Tus opciones de privacidad', cookies: 'Gestionar cookies', terms: 'Condiciones de uso', tm: 'Marcas registradas', eu_docs: 'Docs cumplimiento de la UE' } };

// Datos exactos
const DATA: Department[] = [
  { id:'CEO',  name:'Ejecutivo (CEO)', chips:['HITL requiere aprobación','Datos UE'],
    neura:{ title:'NEURA-CEO', subtitle:'Consejero ejecutivo. Prioriza, resume y aprueba HITL.', tags:['Resumen del día','Top riesgos','OKR en alerta'] },
    agents:[
      { id:'a-ceo-01', title:'Agente: Agenda Consejo', desc:'Prepara orden del día y anexos para el consejo.' },
      { id:'a-ceo-02', title:'Agente: Anuncio Semanal', desc:'Difunde comunicado semanal a toda la compañía.' },
      { id:'a-ceo-03', title:'Agente: Resumen Ejecutivo Diario', desc:'Compila highlights diarios por área.' },
      { id:'a-ceo-04', title:'Agente: Seguimiento OKR', desc:'Actualiza avance y riesgos de OKR.' },
    ] },
  { id:'IA',   name:'Plataforma IA', chips:['HITL requiere aprobación','Datos UE'],
    neura:{ title:'NEURA-IA', subtitle:'Director de plataforma IA. Gobierno técnico y costes.', tags:['Consumo por modelo','Errores por proveedor','Fallbacks últimos 7d'] },
    agents:[
      { id:'a-ia-01', title:'Agente: Chequeo de Salud y Failover', desc:'Healthcheck de workers y failover automático.', pills:['tokens: 60','€: 0,02','tiempo: 500 ms','llamadas: 1'] },
      { id:'a-ia-02', title:'Agente: Cost Tracker', desc:'Mide gasto por modelo/servicio y alerta variaciones.', pills:['tokens: 60','€: 0,02','tiempo: 500 ms','llamadas: 1'] },
      { id:'a-ia-03', title:'Agente: Revisión de Prompts', desc:'Versiona prompts y verifica calidad de respuestas.', pills:['tokens: 60','€: 0,02','tiempo: 500 ms','llamadas: 1'] },
      { id:'a-ia-04', title:'Agente: Vigilancia de Cuotas', desc:'Controla límites/cuotas por proveedor.', pills:['tokens: 60','€: 0,02','tiempo: 500 ms','llamadas: 1'] },
    ] },
  { id:'CSO',  name:'Estrategia (CSO)', chips:['HITL requiere aprobación','Datos UE'],
    neura:{ title:'NEURA-CSO', subtitle:'Asesor estratégico. Define foco y scorecards.', tags:['Riesgos emergentes','Tendencias del sector','Oportunidades M&A'] },
    agents:[
      { id:'a-cso-01', title:'Agente: Gestor de Riesgos', desc:'Mapa de riesgos y owners, con planes de mitigación.' },
      { id:'a-cso-02', title:'Agente: Vigilancia Competitiva', desc:'Monitor de movimientos competitivos.' },
      { id:'a-cso-03', title:'Agente: Radar de Tendencias', desc:'Detección de tendencias relevantes del sector.' },
      { id:'a-cso-04', title:'Agente: Sincronización de M&A', desc:'Sincroniza oportunidades de M&A/partnerships.' },
    ] },
  { id:'CTO',  name:'Tecnología (CTO)', chips:['HITL requiere aprobación','Datos UE'],
    neura:{ title:'NEURA-CTO', subtitle:'Lidera ingeniería y releases.', tags:['Incidentes críticos','SLO semanales','Optimización cloud'] },
    agents:[
      { id:'a-cto-01', title:'Agente: FinOps Cloud', desc:'Optimiza gasto cloud y reservas.' },
      { id:'a-cto-02', title:'Agente: Seguridad CI/CD', desc:'Escaneos y gates de seguridad en CI/CD.' },
      { id:'a-cto-03', title:'Agente: Observabilidad y SLO', desc:'SLIs/SLOs y alertas de observabilidad.' },
      { id:'a-cto-04', title:'Agente: Gestión de Incidencias', desc:'Gestión y postmortems de incidencias.' },
    ] },
  { id:'CISO', name:'Seguridad (CISO)', chips:['HITL requiere aprobación','Datos UE'],
    neura:{ title:'NEURA-CISO', subtitle:'CISO virtual. Riesgos, compliance y respuesta.', tags:['Vulnerabilidades críticas','Phishing últimos 7d','Recertificaciones'] },
    agents:[
      { id:'a-ciso-01', title:'Agente: Vulnerabilidades y Parches', desc:'Ingesta CVEs y parche recomendado.' },
      { id:'a-ciso-02', title:'Agente: Phishing Triage', desc:'Clasifica y enruta sospechas de phishing.' },
      { id:'a-ciso-03', title:'Agente: Backup/Restore DR', desc:'Ejercicios de backup/restore y verificación.' },
      { id:'a-ciso-04', title:'Agente: Recertificación de Accesos', desc:'Recertificación periódica de accesos.' },
    ] },
  { id:'COO',  name:'Operaciones (COO)', chips:['HITL requiere aprobación','Datos UE'],
    neura:{ title:'NEURA-COO', subtitle:'COO virtual. Flujo, SLA y excepciones.', tags:['Pedidos atrasados','SLA por canal','Cuellos de botella'] },
    agents:[
      { id:'a-coo-01', title:'Agente: Atrasos y Excepciones', desc:'Panel de atrasos y riesgos.' },
      { id:'a-coo-02', title:'Agente: Centro NPS/CSAT', desc:'Hub de feedback NPS/CSAT.' },
      { id:'a-coo-03', title:'Agente: Latido de SLA', desc:'Heartbeat de acuerdos de nivel de servicio.' },
      { id:'a-coo-04', title:'Agente: Torre de Control', desc:'Vista torre: capacidad y cuellos de botella.' },
    ] },
  { id:'CHRO', name:'RRHH (CHRO)', chips:['HITL requiere aprobación','Datos UE'],
    neura:{ title:'NEURA-CHRO', subtitle:'CHRO virtual. Talento y clima.', tags:['Clima semanal','Onboardings','Vacantes críticas'] },
    agents:[
      { id:'a-chro-01', title:'Agente: Encuesta de Pulso', desc:'Encuesta breve de clima.' },
      { id:'a-chro-02', title:'Agente: Offboarding Seguro', desc:'Offboarding con checklists y baja de accesos.' },
      { id:'a-chro-03', title:'Agente: Onboarding Orquestado', desc:'Onboarding orquestado multi-equipo.' },
      { id:'a-chro-04', title:'Agente: Pipeline de Contratación', desc:'Sincroniza pipeline de contratación.' },
    ] },
  { id:'MKT',  name:'Marketing y Ventas (CMO/CRO)', chips:['HITL requiere aprobación','Datos UE'],
    neura:{ title:'NEURA-CMO/CRO', subtitle:'Go-to-market y revenue.', tags:['Embudo comercial','Churn y upsell','Campañas activas'] },
    agents:[
      { id:'a-mkt-01', title:'Agente: Embudo Comercial', desc:'Seguimiento de MQL-SQL-WON.' },
      { id:'a-mkt-02', title:'Agente: Salud de Pipeline', desc:'Ritmo y envejecimiento de oportunidades.' },
      { id:'a-mkt-03', title:'Agente: Calidad de Leads', desc:'Scoring y priorización.' },
      { id:'a-mkt-04', title:'Agente: Resumen Post-Campaña', desc:'ROI y recomendaciones.' },
    ] },
  { id:'CFO',  name:'Finanzas (CFO)', chips:['HITL requiere aprobación','Datos UE'],
    neura:{ title:'NEURA-CFO', subtitle:'Finanzas y control.', tags:['Cash runway','Variance vs budget','Cobros y pagos'] },
    agents:[
      { id:'a-cfo-01', title:'Agente: Tesorería', desc:'Flujos y proyecciones.' },
      { id:'a-cfo-02', title:'Agente: Variance', desc:'Desviaciones P&L.' },
      { id:'a-cfo-03', title:'Agente: Facturación', desc:'Ciclo de cobro y riesgo.' },
      { id:'a-cfo-04', title:'Agente: Compras', desc:'Gasto y contratos.' },
    ] },
  { id:'CDO',  name:'Datos (CDO)', chips:['HITL requiere aprobación','Datos UE'],
    neura:{ title:'NEURA-CDO', subtitle:'Datos y calidad.', tags:['SLAs datos','Gobierno','Catálogo'] },
    agents:[
      { id:'a-cdo-01', title:'Agente: Linaje', desc:'Impacto de cambios.' },
      { id:'a-cdo-02', title:'Agente: Calidad de Datos', desc:'Reglas y alertas.' },
      { id:'a-cdo-03', title:'Agente: Catálogo', desc:'Altas/bajas y uso.' },
      { id:'a-cdo-04', title:'Agente: Coste DWH', desc:'Optimización de queries.' },
    ] },
];

// Icono según agente
function iconForAgent(title: string): React.ElementType {
  const t = title.toLowerCase();
  let Icon: any = ClipboardList;
  if (t.includes('agenda')) Icon = CalendarDays;
  else if (t.includes('anuncio') || t.includes('comunicado')) Icon = Megaphone;
  else if (t.includes('resumen') || t.includes('registro')) Icon = FileText;
  else if (t.includes('okr') || t.includes('score')) Icon = Gauge;
  else if (t.includes('salud') || t.includes('health')) Icon = ActivityIcon;
  else if (t.includes('cost') || t.includes('gasto')) Icon = FileBarChart2;
  else if (t.includes('prompts')) Icon = MessageCircle;
  else if (t.includes('cuotas')) Icon = ListChecks;
  else if (t.includes('incidenc')) Icon = Bug;
  else if (t.includes('observabilidad') || t.includes('slo')) Icon = Radar;
  else if (t.includes('phishing')) Icon = Inbox;
  else if (t.includes('email')) Icon = Mail;
  else if (t.includes('tendencias')) Icon = TrendingUp;
  return isComponent(Icon) ? Icon : ClipboardList;
}

function TagIcon({ text }: { text: string }) {
  const s = text.toLowerCase();
  const Maybe: any = s.includes('riesgo') ? Shield : s.includes('consumo') ? Gauge : s.includes('errores') ? Bug : s.includes('m&a') ? Target : s.includes('tendencias') ? TrendingUp : FileText;
  const I = isComponent(Maybe) ? Maybe : FileText;
  return <I className="w-3 h-3" />;
}

// Footer autónomo solicitado, colocado al final
const light = { surface: '#FFFFFF', ink: '#1F2937', border: '#E5E7EB' };
const paletteLocal = { ceo: { primary: '#5D7177' } };
function FooterComponent(){
  const themeLocal = light;
  const primary = paletteLocal.ceo.primary;
  return (
    <footer className="text-xs px-3 py-2" style={{ background: `color-mix(in srgb, ${themeLocal.surface} 95%, ${primary})`, borderTop: `1px solid ${themeLocal.border}`, color: themeLocal.ink }}>
      <div className="flex flex-wrap items-center gap-2">
        <span>Español (España)</span><span role="separator" aria-hidden>·</span>
        <a href="#" className="hover:underline" style={{ color: themeLocal.ink }}>{i18n.es.privacy}</a><span role="separator" aria-hidden>·</span>
        <a href="#" className="hover:underline" style={{ color: themeLocal.ink }}>{i18n.es.cookies}</a><span role="separator" aria-hidden>·</span>
        <a href="#" className="hover:underline" style={{ color: themeLocal.ink }}>{i18n.es.terms}</a><span role="separator" aria-hidden>·</span>
        <a href="#" className="hover:underline" style={{ color: themeLocal.ink }}>{i18n.es.tm}</a><span role="separator" aria-hidden>·</span>
        <a href="#" className="hover:underline" style={{ color: themeLocal.ink }}>{i18n.es.eu_docs}</a><span role="separator" aria-hidden>·</span>
        <span>© ECONEURA 2025</span>
      </div>
    </footer>
  );
}

export default function EconeuraUI() {
  const [activeDept, setActiveDept] = useState(DATA[0].id);
  const [orgView, setOrgView] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [activity, setActivity] = useState<NeuraActivity[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<{ id:string; text:string }[]>([]);
  const [showAllUsage, setShowAllUsage] = useState(false);
  const dept = useMemo(() => DATA.find(d => d.id === activeDept) ?? DATA[0], [activeDept]);
  const lastByAgent = useMemo(() => { const m: Record<string, NeuraActivity | undefined> = {}; for (const e of activity) { if (!m[e.agentId]) m[e.agentId] = e; } return m; }, [activity]);

  // Voz: TTS (SpeechSynthesis) + STT (SpeechRecognition)
  const [chatInput, setChatInput] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceSupported] = useState<boolean>(typeof window !== 'undefined' && 'speechSynthesis' in window);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    try {
      const g: any = globalThis as any;
      const SR = g.SpeechRecognition || g.webkitSpeechRecognition;
      if (SR) {
        const rec = new SR();
        rec.lang = 'es-ES';
        rec.interimResults = true;
        rec.onresult = (e: any) => {
          let t = '';
          for (let i = e.resultIndex; i < e.results.length; i++) { t += e.results[i][0].transcript; }
          setChatInput(t);
        };
        rec.onend = () => setListening(false);
        recognitionRef.current = rec;
      }
    } catch {}
  }, []);

  function speak(text: string) {
    try {
      const g: any = globalThis as any;
      if (!g.speechSynthesis) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'es-ES';
      g.speechSynthesis.cancel();
      g.speechSynthesis.speak(u);
    } catch {}
  }
  function stopSpeak(){ try { (globalThis as any).speechSynthesis?.cancel(); } catch {} }
  function toggleListen(){
    const rec:any = recognitionRef.current; if(!rec) return;
    if(!listening){ setChatInput(''); setListening(true); try{ rec.start(); }catch{} }
    else { try{ rec.stop(); }catch{} }
  }
  function onSend(){ const text = chatInput.trim(); if(!text) return; setChatMsgs(v => [{ id: correlationId(), text }, ...v]); setChatInput(''); }

  const filteredAgents = useMemo(() => {
    if (!q.trim()) return dept.agents;
    const s = q.toLowerCase();
    return dept.agents.filter(a => (a.title + ' ' + a.desc).toLowerCase().includes(s));
  }, [dept, q]);

  async function runAgent(a: Agent) {
    try {
      setBusyId(a.id);
      const res = await invokeAgent(a.id, 'azure', { input: '' });
      setActivity(v => [{ id: correlationId(), ts: nowIso(), agentId: a.id, deptId: dept.id, status: 'OK', message: res?.output || 'OK' }, ...v]);
      logActivity({ AgentId: a.id, DeptId: dept.id, Status: 'OK' });
    } catch (e: any) {
      setActivity(v => [{ id: correlationId(), ts: nowIso(), agentId: a.id, deptId: dept.id, status: 'ERROR', message: String(e?.message||'Error') }, ...v]);
      logActivity({ AgentId: a.id, DeptId: dept.id, Status: 'ERROR' });
    } finally {
      setBusyId(null);
    }
  }

  function openChatWithErrorSamples() {
    setChatOpen(true);
    setChatMsgs([
      { id: correlationId(), text: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.' },
      { id: correlationId(), text: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.' },
    ]);
  }
  function startCreateAgent(deptId: string){
    const instructions = `NEW AGENTE · ${deptId}
Crea un agente y conéctalo a Make.
1) Pega el Webhook de Make en backend.
2) Define I/O y permisos.
3) Publica.`;
    setActivity(v => [{ id: correlationId(), ts: nowIso(), agentId: 'new-agent', deptId, status: 'OK', message: 'Solicitud de creación de agente' }, ...v]);
    setChatOpen(true);
    setChatMsgs(v => [{ id: correlationId(), text: instructions }, ...v]);
  }
  const DeptIconComp = getDeptIcon(dept.id);
  const pal = getPalette(dept.id);

  return (
    <div className="min-h-screen bg-[#f2f7fb] text-[#0f172a]">
      {/* Top bar */}
      <div className="h-14 border-b bg-white flex items-center px-4 justify-between">
        <div className="flex items-center gap-2 font-semibold tracking-wide">
          <LogoEconeura />
          <span>ECONEURA</span>

        </div>
        <div className="flex items-center gap-2">
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="BUSCAR AGENTES" aria-label="Buscar agentes" className="h-9 w-64 rounded-lg border px-3 text-sm" />
          <button className="h-9 px-3 rounded-lg border text-sm">INICIAR SESIÓN</button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar departamentos */}
        <aside className="w-64 bg-white border-r p-2 space-y-1 flex flex-col">
          {DATA.map(d => {
            const Ico = getDeptIcon(d.id); const p = getPalette(d.id); const active = activeDept === d.id && !orgView;
            return (
              <button key={d.id} onClick={() => { setActiveDept(d.id); setOrgView(false); }}
                className={cx("w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2",
                  active ? "font-semibold" : "hover:bg-gray-50")}
                style={active ? { backgroundColor: p.bgCss, color: p.textHex, borderColor: p.borderCss } : undefined}
              >
                {React.createElement(Ico, { className: "w-4 h-4", style:{ color: p.textHex } })}
                <span>{d.name}</span>
              </button>
            );
          })}
          <div className="mt-2 border-t pt-2">
            <button onClick={() => setOrgView(true)} className={cx("w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 flex items-center gap-2",
              orgView ? "bg-sky-50 text-[#0f172a] font-semibold" : "") }>
              <ListChecks className="w-4 h-4" />
              <span>Organigrama</span>
            </button>
          </div>
          <div className="mt-auto pt-3" style={{ borderTop: `1px solid ${theme.border}` }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: theme.muted }}>
              <input
                id="toggle-usage"
                type="checkbox"
                checked={showAllUsage}
                onChange={(e)=> setShowAllUsage(e.target.checked)}
              />
              <label htmlFor="toggle-usage">Mostrar consumo IA en todos</label>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4">
          {!orgView ? (
            <>
              {/* Header sección */}
              <div className="bg-white rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {React.createElement(DeptIconComp, { className: "w-5 h-5", style:{ color: pal.textHex } })}
                    <div className="text-lg font-semibold">{dept.name}</div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 border">{dept.agents.length} agentes</span>
                    {dept.chips.map((c,i)=>(
  <span key={i} className={cx("text-xs px-2 py-1 rounded-full border inline-flex items-center gap-1",
    c.toLowerCase().includes('hitl')?'bg-yellow-100 text-yellow-800':'bg-sky-50 text-sky-700')}>
    {c.toLowerCase().includes('hitl')?<UserCheck className="w-3 h-3"/>:<ShieldCheck className="w-3 h-3"/>}{c}
  </span>
))}
                  </div>
                  <span className={"text-xs"} style={{ color: pal.textHex }}>Ejecutivo</span>
                </div>

                <div className="mt-4">
                  <div className="text-base font-semibold">{dept.neura.title}</div>
                  <div className="text-sm text-gray-600">{dept.neura.subtitle}</div>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {dept.neura.tags.map((t, i) => (
                      <button key={i} className="text-xs px-3 py-1 rounded-full border bg-gray-50 hover:bg-gray-100 inline-flex items-center gap-1">
                        <TagIcon text={t} />{t}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="h-9 px-3 rounded-md border bg-white inline-flex items-center gap-1" onClick={openChatWithErrorSamples}><MessageCircle className="w-4 h-4"/>Abrir chat</button>
                    <button className="h-9 px-3 rounded-md border inline-flex items-center gap-1"><ClipboardList className="w-4 h-4"/>Ver registro</button>
                  </div>
                </div>
              </div>

              {/* Grid de agentes */}
              <div className="mt-4 grid gap-4 grid-cols-1 xl:grid-cols-3 lg:grid-cols-2">
                <NewAgentCard deptId={dept.id} onCreate={startCreateAgent} />
                {filteredAgents.map((a) => (
                  <AgentCard key={a.id} a={a} busy={busyId===a.id} progress={lastByAgent[a.id]?.status==='OK'?100:(lastByAgent[a.id]?.status==='ERROR'?0:11)} showUsage={showAllUsage} onRun={() => runAgent(a)} />
                ))}
              </div>

              {/* Actividad */}
              <div className="mt-4 bg-white rounded-xl border p-4">
                <div className="font-semibold mb-2">Actividad</div>
                {activity.length === 0 ? (
                  <div className="text-sm text-gray-500">Sin actividad aún.</div>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {activity.map(e => (
                      <li key={e.id} className="flex items-center gap-2">
                        <span className={cx('px-2 py-0.5 rounded border text-[11px]', e.status==='OK'?'bg-emerald-50 text-emerald-700':'bg-rose-50 text-rose-700')}>{e.status}</span>
                        <span className="text-gray-500">{new Date(e.ts).toLocaleString()}</span>
                        <span className="font-medium">{e.agentId}</span>
                        <span className="text-gray-500 truncate">{e.message}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <OrgChart />
          )}

          {/* Footer legal */}
          <div className="text-xs mt-6 pb-8" style={{ color: theme.muted, borderTop: `1px dashed ${theme.border}`, paddingTop: 8 }}>
            GDPR & AI Act · datos en la UE · TLS 1.2+ y AES-256 · auditoría HITL.
          </div>
        </main>
      </div>



      {/* Drawer de chat */}
      {chatOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={()=>setChatOpen(false)}>
          <aside className="absolute right-0 top-0 h-full w-[380px] bg-white border-l p-4 overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="text-sm font-semibold mb-2">{dept.name} — Chat</div>
            <div className="space-y-2">
              <button className="text-xs px-3 py-1 rounded-full border bg-gray-50">Resumen del día</button>
            </div>
            <div className="mt-3 space-y-3">
              {chatMsgs.map(m => (
              <div key={m.id} className="bg-gray-50 border rounded-lg p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  {voiceSupported && (
                    <button onClick={() => speak(m.text)} className="p-1 rounded border bg-white hover:bg-gray-50" title="Escuchar">
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input value={chatInput} onChange={(e)=>setChatInput(e.target.value)} className="flex-1 border rounded-lg h-9 px-3 text-sm" placeholder="Habla o escribe tu mensaje..." />
              {voiceSupported && (
                <>
                  <button onClick={toggleListen} className={cx("h-9 w-9 rounded-lg border inline-flex items-center justify-center", listening && "bg-emerald-50")} title={listening ? "Detener micrófono" : "Hablar"}>
                    {listening ? <MicOff className="w-4 h-4"/> : <Mic className="w-4 h-4"/>}
                  </button>
                  <button onClick={stopSpeak} className="h-9 w-9 rounded-lg border inline-flex items-center justify-center" title="Parar voz">
                    <StopCircle className="w-4 h-4"/>
                  </button>
                </>
              )}
              <button onClick={onSend} className="h-9 px-3 rounded-lg border">Enviar</button>
            </div>
          </aside>
        </div>
      )}
      <FooterComponent />
    </div>
  );
}

// Tarjeta de agente
type AgentCardProps = { a: Agent; busy?: boolean; progress?: number; showUsage?: boolean; onRun: () => Promise<any> | void };
function AgentCard({ a, busy, progress, showUsage, onRun }: AgentCardProps) {
  const pct = Math.max(0, Math.min(100, (progress ?? 11)));
  const I: any = iconForAgent(a.title);
  return (
    <div className="bg-white rounded-xl border p-4 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          {React.createElement(I, { className: "w-4 h-4 mt-0.5 text-[#4b5563]" })}
          <div>
            <div className="font-semibold">{a.title}</div>
            <div className="text-sm text-gray-600">{a.desc}</div>
          </div>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border">Activo</span>
      </div>
      {showUsage && (
        a.pills && a.pills.length ? (
          <div className="mt-2 text-[11px] text-gray-600 flex gap-2 flex-wrap">
            {a.pills.map((p, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-gray-100 border">{p}</span>
            ))}
          </div>
        ) : (
          <div className="mt-2 text-[11px] text-gray-500">Consumo: N/D</div>
        )
      )}
      {/* Barra 11% fija para paridad visual con captura */}
      <div className="mt-3">
        <div className="h-2 rounded bg-gray-100 overflow-hidden">
          <div className="h-2 bg-gray-300" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 text-[11px] text-gray-500">{pct}%</div>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={() => onRun()} disabled={!!busy}
          className={cx("h-9 px-3 rounded-md border text-sm",
            busy ? "opacity-60 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200 flex items-center gap-1")}>Ejecutar</button>
        <button className="h-9 px-3 rounded-md border text-sm">Pausar</button>
      </div>
    </div>
  );
}

// Nueva tarjeta para crear agente
 type NewAgentCardProps = { deptId: string; onCreate: (deptId: string) => void };
 function NewAgentCard({ deptId, onCreate }: NewAgentCardProps){
  return (
    <div className="bg-white rounded-xl border-2 border-dashed p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Workflow className="w-4 h-4 text-[#4b5563]" />
        <div>
          <div className="font-semibold tracking-wide">NEW AGENTE</div>
          <div className="text-sm text-gray-600">Crear y conectar a Make</div>
        </div>
      </div>
      <button onClick={()=>onCreate(deptId)} className="h-9 px-3 rounded-md border text-sm bg-gray-100 hover:bg-gray-200">Configurar</button>
    </div>
  );
 }

// Organigrama 1:1
function OrgChart() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {DATA.map((d) => {
        const Icon = getDeptIcon(d.id); const p = getPalette(d.id);
        return (
          <div key={d.id} className="bg-white border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {React.createElement(Icon, { className: "w-4 h-4", style:{ color: p.textHex } })}
                <div className="font-semibold text-sm">{d.name}</div>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 border">{d.agents.length} agentes</span>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400"/> <span className="font-medium">{d.neura.title}</span></li>
              {d.agents.map(a => (
                <li key={a.id} className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400"/> <span>{a.title}</span></li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Self-tests en tiempo de ejecución sin lanzar errores.
 * - readVar no rompe en browser
 * - iconForAgent devuelve ElementType
 * - getDeptIcon siempre devuelve ElementType
 * - getPalette devuelve estructura esperada y fallback
 * - TagIcon crea un elemento válido
 * - LogoEconeura smoke (string no vacío)
 */
(() => {
  const failures: string[] = [];
  try {
    const v = readVar('__X__','VITE_X','X');
    void v;
    const samples = [
      'Agente: Agenda Consejo',
      'Agente: Anuncio Semanal',
      'Agente: Resumen Ejecutivo Diario',
      'Agente: OKR',
      'Agente: Phishing Triage',
      'Agente: Backup/Restore DR',
      'Agente: X Desconocido',
    ];
    samples.forEach(s => {
      const I = iconForAgent(s);
      if (!isComponent(I)) failures.push(`iconForAgent no devolvió componente para: ${s}`);
      try { React.createElement(I as any, { className: 'w-4 h-4' }); } catch { failures.push(`createElement falló para: ${s}`); }
    });
    DATA.forEach(d => {
      const I = getDeptIcon(d.id);
      if (!isComponent(I)) failures.push(`getDeptIcon inválido: ${d.id}`);
      const pal = getPalette(d.id);
      if (!pal || typeof pal.accentText !== 'string' || typeof pal.accentBg !== 'string' || typeof pal.accentBorder !== 'string') {
        failures.push(`getPalette inválido: ${d.id}`);
      }
    });
    const Unknown = getDeptIcon('UNKNOWN_ID');
    if (!isComponent(Unknown)) failures.push('getDeptIcon fallback inválido');
    const palUnknown = getPalette('UNKNOWN_ID');
    if (!palUnknown || typeof palUnknown.accentText !== 'string') failures.push('getPalette fallback inválido');
    try { React.createElement(TagIcon as any, { text: 'Riesgos emergentes' }); } catch { failures.push('TagIcon falla'); }
    try {
      const el = LogoEconeura();
      if (!el || typeof (el as any).props?.dangerouslySetInnerHTML?.__html !== 'string' || !(el as any).props.dangerouslySetInnerHTML.__html.length) {
        failures.push('LogoEconeura inválido');
      }
    } catch { failures.push('LogoEconeura falla'); }
    // Tests adicionales
    try { React.createElement(NewAgentCard as any, { deptId: 'IA', onCreate: () => {} }); } catch { failures.push('NewAgentCard falla'); }
    try { const s = rgba('#000000', 0.5); if (!/^rgba\(/.test(s)) failures.push('rgba() formato incorrecto'); } catch { failures.push('rgba() falla'); }
  } catch (e) {
    failures.push(`excepción en self-test: ${(e as any)?.message || e}`);
  } finally {
    if (failures.length) console.warn('[ECONEURA self-test]', failures);
  }
})();
