import React, { useMemo, useState, useEffect, useRef } from "react";

import {
  Crown, Cpu, Shield, Workflow, Users, Target, Brain, LineChart, Wallet, Database,
  ShieldCheck, UserCheck, MessageCircle, ClipboardList, Megaphone, FileText, Radar,
  Bug, Gauge, Activity as ActivityIcon, Inbox, Mail, TrendingUp, FileBarChart2, ListChecks, CalendarDays,
  Mic, MicOff, Volume2, StopCircle
} from "lucide-react";

/**
 * ECONEURA — Cockpit completo con Chat NEURA Premium
 */

const cx = (...cls: (string | boolean | undefined)[]) => cls.filter(Boolean).join(" ");

export type Agent = { id: string; title: string; desc: string; pills?: string[] };
export interface Department { id: string; name: string; chips: string[]; neura: { title: string; subtitle: string; tags: string[] }; agents: Agent[] }

type NeuraActivity = { id: string; ts: string; agentId: string; deptId: string; status: 'OK'|'ERROR'; message: string };

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

// ==================== CONFIGURACIÓN ====================
// Backend GPT-5
const GPT5_BACKEND_URL = 'http://localhost:3001';

// Make.com Webhook
const MAKE_WEBHOOK_URL = import.meta.env.VITE_MAKE_WEBHOOK_URL || '';

// Función para llamar al backend GPT-5
async function callGPT5(messages: Array<{role: string; content: string}>, departmentContext: string) {
  try {
    // Construir el prompt completo con contexto del departamento
    const systemPrompt = `Eres NEURA-${departmentContext}, un asistente de IA experto en ${departmentContext}. 
Respondes en español de forma profesional, concisa y con expertise en tu área. 
Usa emojis relevantes para hacer la conversación más amigable.`;

    // Combinar system prompt con el último mensaje del usuario
    const lastMessage = messages[messages.length - 1];
    const fullInput = `${systemPrompt}\n\nUsuario: ${lastMessage.content}`;

    const response = await fetch(`${GPT5_BACKEND_URL}/api/invoke/neura-chat`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer DEV',
        'X-Correlation-Id': `chat-${Date.now()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: fullInput,
        stream: false
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en GPT-5 Backend');
    }

    const data = await response.json();
    return {
      role: 'assistant',
      content: data.output || 'Sin respuesta'
    };
  } catch (error: any) {
    return {
      role: 'assistant',
      content: `❌ Error al conectar con GPT-5: ${error.message}\n\n💡 Verifica que el servidor backend esté corriendo en http://localhost:3001`
    };
  }
}

// Alias para mantener compatibilidad
const callOpenAI = callGPT5;

// Función para ejecutar agente en Make.com
async function executeAgent(agentId: string, department: string, parameters: any = {}) {
  const BACKEND_URL = import.meta.env.VITE_NEURA_GW_URL || 'http://localhost:3001';
  const BEARER_TOKEN = import.meta.env.VITE_NEURA_GW_KEY || 'DEV';
  
  const url = `${BACKEND_URL}/api/agent/execute`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BEARER_TOKEN}`,
      'X-Correlation-Id': correlationId(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      agent_id: agentId,
      department: department,
      action: 'execute',
      parameters
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Función legacy para invokeAgent (si se usa en algún lugar)
async function invokeAgent(agentId: string, payload: any) {
  const url = `/api/invoke/${agentId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-Correlation-Id': correlationId(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      input: typeof payload === 'string' ? payload : (payload?.input ?? ""), 
      user_id: 'cockpit-user',
      correlation_id: correlationId()
    }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }
  return res.json().catch(() => ({}));
}

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

const isComponent = (x: any): x is React.ElementType => !!x && (typeof x === 'function' || typeof x === 'object');

function getDeptIcon(id: string): React.ElementType {
  const Icon = (DeptIcon as any)[id];
  return isComponent(Icon) ? Icon : Crown;
}

function hexToRgb(hex: string){
  const h = hex.replace('#','');
  const bigint = parseInt(h.length===3? h.split('').map(x=>x+x).join('') : h, 16);
  const r=(bigint>>16)&255,g=(bigint>>8)&255,b=bigint&255;return {r,g,b};
}
function rgba(hex:string, a:number){ const {r,g,b}=hexToRgb(hex); return `rgba(${r}, ${g}, ${b}, ${a})`; }

const DEFAULTS_HEX: Record<string,string> = {
  CEO: '#2C3E50',
  IA:  '#3498DB',
  CISO:'#7E8B89',
  CTO: '#6DADE9',
  COO: '#B39B83',
  MKT: '#E67E22',
  CFO: '#D96D5C',
  CHRO:'#E76F51',
  CDO: '#F5E5DC',
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

const theme = { border: '#e5e7eb', muted: '#64748b', ink: '#1f2937', surface: '#ffffff' };
const i18n = { es: {  privacy: 'Tus opciones de privacidad', cookies: 'Gestionar cookies', terms: 'Condiciones de uso', tm: 'Marcas registradas', eu_docs: 'Docs cumplimiento de la UE' } };

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
      { id:'neura-1', title:'Agente: Analytics', desc:'Análisis de datos y métricas', pills:['tokens: 60','€: 0,02','tiempo: 500 ms','llamadas: 1'] },
      { id:'a-ia-02', title:'Agente: Cost Tracker', desc:'Mide gasto por modelo/servicio y alerta variaciones.', pills:['tokens: 60','€: 0,02','tiempo: 500 ms','llamadas: 1'] },
    ] },
  { id:'CSO',  name:'Estrategia (CSO)', chips:['HITL requiere aprobación','Datos UE'],
    neura:{ title:'NEURA-CSO', subtitle:'Asesor estratégico. Define foco y scorecards.', tags:['Riesgos emergentes','Tendencias del sector','Oportunidades M&A'] },
    agents:[
      { id:'neura-10', title:'Agente: Research', desc:'Investigación y análisis estratégico' },
    ] },
  { id:'CTO',  name:'Tecnología (CTO)', chips:['HITL requiere aprobación','Datos UE'],
    neura:{ title:'NEURA-CTO', subtitle:'Lidera ingeniería y releases.', tags:['Incidentes críticos','SLO semanales','Optimización cloud'] },
    agents:[
      { id:'neura-7', title:'Agente: CTO', desc:'Chief Technology Officer virtual' },
    ] },
  { id:'CISO', name:'Seguridad (CISO)', chips:['HITL requiere aprobación','Datos UE'],
    neura:{ title:'NEURA-CISO', subtitle:'CISO virtual. Riesgos, compliance y respuesta.', tags:['Vulnerabilidades críticas','Phishing últimos 7d','Recertificaciones'] },
    agents:[
      { id:'neura-5', title:'Agente: CISO', desc:'Chief Information Security Officer virtual' },
    ] },
  { id:'COO',  name:'Operaciones (COO)', chips:['HITL requiere aprobación','Datos UE'],
    neura:{ title:'NEURA-COO', subtitle:'COO virtual. Flujo, SLA y excepciones.', tags:['Pedidos atrasados','SLA por canal','Cuellos de botella'] },
    agents:[
      { id:'a-coo-01', title:'Agente: Atrasos y Excepciones', desc:'Panel de atrasos y riesgos.' },
    ] },
  { id:'CHRO', name:'RRHH (CHRO)', chips:['HITL requiere aprobación','Datos UE'],
    neura:{ title:'NEURA-CHRO', subtitle:'CHRO virtual. Talento y clima.', tags:['Clima semanal','Onboardings','Vacantes críticas'] },
    agents:[
      { id:'neura-4', title:'Agente: CHRO', desc:'Chief Human Resources Officer virtual' },
    ] },
  { id:'MKT',  name:'Marketing y Ventas (CMO/CRO)', chips:['HITL requiere aprobación','Datos UE'],
    neura:{ title:'NEURA-CMO/CRO', subtitle:'Go-to-market y revenue.', tags:['Embudo comercial','Churn y upsell','Campañas activas'] },
    agents:[
      { id:'neura-6', title:'Agente: CMO', desc:'Chief Marketing Officer virtual' },
    ] },
  { id:'CFO',  name:'Finanzas (CFO)', chips:['HITL requiere aprobación','Datos UE'],
    neura:{ title:'NEURA-CFO', subtitle:'Finanzas y control.', tags:['Cash runway','Variance vs budget','Cobros y pagos'] },
    agents:[
      { id:'neura-3', title:'Agente: CFO', desc:'Chief Financial Officer virtual' },
    ] },
  { id:'CDO',  name:'Datos (CDO)', chips:['HITL requiere aprobación','Datos UE'],
    neura:{ title:'NEURA-CDO', subtitle:'Datos y calidad.', tags:['SLAs datos','Gobierno','Catálogo'] },
    agents:[
      { id:'neura-2', title:'Agente: CDO', desc:'Chief Data Officer virtual' },
    ] },
];

function iconForAgent(title: string): React.ElementType {
  const t = title.toLowerCase();
  let Icon: any = ClipboardList;
  if (t.includes('agenda')) Icon = CalendarDays;
  else if (t.includes('anuncio') || t.includes('comunicado')) Icon = Megaphone;
  else if (t.includes('resumen') || t.includes('registro')) Icon = FileText;
  else if (t.includes('okr') || t.includes('score')) Icon = Gauge;
  else if (t.includes('salud') || t.includes('health')) Icon = ActivityIcon;
  else if (t.includes('cost') || t.includes('gasto')) Icon = FileBarChart2;
  return isComponent(Icon) ? Icon : ClipboardList;
}

function TagIcon({ text }: { text: string }) {
  const s = text.toLowerCase();
  const Maybe: any = s.includes('riesgo') ? Shield : s.includes('consumo') ? Gauge : s.includes('errores') ? Bug : FileText;
  const I = isComponent(Maybe) ? Maybe : FileText;
  return <I className="w-3 h-3" />;
}

function FooterComponent(){
  return (
    <footer className="text-xs px-3 py-2 border-t bg-white">
      <div className="flex flex-wrap items-center gap-2 text-gray-600">
        <span>Español (España)</span><span>·</span>
        <a href="#" className="hover:underline">{i18n.es.privacy}</a><span>·</span>
        <a href="#" className="hover:underline">{i18n.es.cookies}</a><span>·</span>
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
  const [chatMsgs, setChatMsgs] = useState<{ id:string; text:string; role:'user'|'assistant' }[]>([]);
  const [showAllUsage, setShowAllUsage] = useState(false);
  const dept = useMemo(() => DATA.find(d => d.id === activeDept) ?? DATA[0], [activeDept]);
  const lastByAgent = useMemo(() => { const m: Record<string, NeuraActivity | undefined> = {}; for (const e of activity) { if (!m[e.agentId]) m[e.agentId] = e; } return m; }, [activity]);

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
  async function onSend(){ 
    const text = chatInput.trim(); 
    if(!text) return; 
    
    const userMsg = { id: correlationId(), text, role: 'user' as const };
    setChatMsgs(v => [userMsg, ...v]); 
    setChatInput('');
    
    try {
      // Preparar historial de mensajes para OpenAI
      const conversationHistory = [userMsg, ...chatMsgs]
        .reverse() // OpenAI espera orden cronológico
        .slice(0, 10) // Últimos 10 mensajes
        .map(m => ({ role: m.role, content: m.text }));
      
      // Llamar a OpenAI con contexto del departamento
      const aiResponse = await callOpenAI(conversationHistory, dept.id);
      
      setChatMsgs(v => [{ 
        id: correlationId(), 
        text: aiResponse.content, 
        role: 'assistant' 
      }, ...v]);
    } catch (e: any) {
      setChatMsgs(v => [{ 
        id: correlationId(), 
        text: `❌ Error: ${e.message}`, 
        role: 'assistant' 
      }, ...v]);
    }
  }

  const filteredAgents = useMemo(() => {
    if (!q.trim()) return dept.agents;
    const s = q.toLowerCase();
    return dept.agents.filter(a => (a.title + ' ' + a.desc).toLowerCase().includes(s));
  }, [dept, q]);

  async function runAgent(a: Agent) {
    try {
      setBusyId(a.id);
      // Ejecutar agente en Make.com
      const res = await executeAgent(a.id, dept.id, {
        agent_title: a.title,
        agent_description: a.desc,
        department: dept.name
      });
      setActivity(v => [
        { 
          id: correlationId(), 
          ts: nowIso(), 
          agentId: a.id, 
          deptId: dept.id, 
          status: 'OK', 
          message: `✅ Agente ejecutado en Make.com: ${a.title}` 
        }, 
        ...v
      ]);
    } catch (e: any) {
      const errorMsg = e?.message || 'Error desconocido';
      setActivity(v => [
        { 
          id: correlationId(), 
          ts: nowIso(), 
          agentId: a.id, 
          deptId: dept.id, 
          status: 'ERROR', 
          message: `❌ ${errorMsg}` 
        }, 
        ...v
      ]);
    } finally {
      setBusyId(null);
    }
  }

  const DeptIconComp = getDeptIcon(dept.id);
  const pal = getPalette(dept.id);

  return (
    <div className="min-h-screen bg-[#f2f7fb] text-[#0f172a]">
      <div className="h-14 border-b bg-white flex items-center px-4 justify-between">
        <div className="flex items-center gap-2 font-semibold tracking-wide">
          <LogoEconeura />
          <span>ECONEURA</span>
        </div>
        <div className="flex items-center gap-2">
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="BUSCAR AGENTES" className="h-9 w-64 rounded-lg border px-3 text-sm" />
          <button className="h-9 px-3 rounded-lg border text-sm">INICIAR SESIÓN</button>
        </div>
      </div>

      <div className="flex">
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
              orgView ? "bg-sky-50 font-semibold" : "") }>
              <ListChecks className="w-4 h-4" />
              <span>Organigrama</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4">
          {!orgView ? (
            <>
              <div className="bg-white rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {React.createElement(DeptIconComp, { className: "w-5 h-5", style:{ color: pal.textHex } })}
                    <div className="text-lg font-semibold">{dept.name}</div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 border">{dept.agents.length} agentes</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-base font-semibold">{dept.neura.title}</div>
                  <div className="text-sm text-gray-600">{dept.neura.subtitle}</div>
                  <div className="mt-3 flex gap-2">
                    <button className="h-9 px-3 rounded-md border bg-white inline-flex items-center gap-1" onClick={()=>setChatOpen(true)}><MessageCircle className="w-4 h-4"/>Abrir chat</button>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 grid-cols-1 xl:grid-cols-3 lg:grid-cols-2">
                {filteredAgents.map((a) => (
                  <AgentCard key={a.id} a={a} busy={busyId===a.id} showUsage={showAllUsage} onRun={() => runAgent(a)} />
                ))}
              </div>

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
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <OrgChart />
          )}
        </main>
      </div>

      {chatOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={()=>setChatOpen(false)}>
          <aside className="absolute right-0 top-0 h-full w-[380px] bg-white border-l p-4 overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="text-sm font-semibold mb-2 flex items-center justify-between">
              <span>{dept.name} — Chat NEURA Premium</span>
              <div className="flex items-center gap-1 text-xs font-normal text-gray-500">
                <span>⚡</span>
                <span>GPT-4o-mini</span>
              </div>
            </div>
            <div className="mt-3 space-y-3">
              {chatMsgs.map(m => (
              <div key={m.id} className={cx("border rounded-lg p-3 text-sm", m.role === 'user' ? 'bg-blue-50' : 'bg-gray-50')}>
                <div className="flex items-start justify-between gap-2">
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  {voiceSupported && m.role === 'assistant' && (
                    <button onClick={() => speak(m.text)} className="p-1 rounded border bg-white hover:bg-gray-50" title="Escuchar">
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input 
                value={chatInput} 
                onChange={(e)=>setChatInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && onSend()}
                className="flex-1 border rounded-lg h-9 px-3 text-sm" 
                placeholder="Escribe tu mensaje..." 
              />
              {voiceSupported && (
                <>
                  <button onClick={toggleListen} className={cx("h-9 w-9 rounded-lg border inline-flex items-center justify-center", listening && "bg-emerald-50")} title={listening ? "Detener" : "Hablar"}>
                    {listening ? <MicOff className="w-4 h-4"/> : <Mic className="w-4 h-4"/>}
                  </button>
                  <button onClick={stopSpeak} className="h-9 w-9 rounded-lg border inline-flex items-center justify-center">
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

type AgentCardProps = { a: Agent; busy?: boolean; showUsage?: boolean; onRun: () => void };
function AgentCard({ a, busy, showUsage, onRun }: AgentCardProps) {
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
      <div className="mt-3 flex gap-2">
        <button onClick={onRun} disabled={!!busy}
          className={cx("h-9 px-3 rounded-md border text-sm",
            busy ? "opacity-60" : "bg-gray-100 hover:bg-gray-200")}>Ejecutar</button>
      </div>
    </div>
  );
}

function OrgChart() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {DATA.map((d) => {
        const Icon = getDeptIcon(d.id); const p = getPalette(d.id);
        return (
          <div key={d.id} className="bg-white border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              {React.createElement(Icon, { className: "w-4 h-4", style:{ color: p.textHex } })}
              <div className="font-semibold text-sm">{d.name}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
