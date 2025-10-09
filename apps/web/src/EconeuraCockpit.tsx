import React, { useMemo, useState, useCallback } from "react";
import {
  Crown,
  Cpu,
  Shield,
  TrendingUp,
  Users,
  DollarSign,
  Scale,
  Briefcase,
  HeadphonesIcon,
  FlaskConical,
  Heart,
  Code,
  Zap,
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Trash2,
  Download,
  Settings,
  Menu,
  X,
} from "lucide-react";

export interface Department {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGradient: string;
  agents: Agent[];
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  agentId?: string;
  agentName?: string;
}

const DEPARTMENTS: Department[] = [
  {
    id: "executive",
    name: "Ejecutivo",
    icon: Crown,
    color: "from-purple-600 to-pink-600",
    bgGradient: "bg-gradient-to-br from-purple-50 to-pink-50",
    agents: [
      { id: "ceo-vision", name: "CEO Vision", role: "Estrategia Corporativa", expertise: ["Visión Estratégica", "Gobierno Corporativo", "Transformación Digital"], icon: Crown, color: "text-purple-600" },
      { id: "ceo-ops", name: "CEO Operations", role: "Operaciones Ejecutivas", expertise: ["Eficiencia Operacional", "Gestión de Crisis", "Liderazgo"], icon: Zap, color: "text-pink-600" },
      { id: "board-advisor", name: "Board Advisor", role: "Asesor de Junta", expertise: ["Gobierno Corporativo", "Cumplimiento", "Estrategia"], icon: Shield, color: "text-indigo-600" },
      { id: "change-mgmt", name: "Change Manager", role: "Gestión del Cambio", expertise: ["Transformación Organizacional", "Cultura", "Innovación"], icon: TrendingUp, color: "text-purple-500" },
    ],
  },
  {
    id: "technology",
    name: "Tecnología",
    icon: Cpu,
    color: "from-blue-600 to-cyan-600",
    bgGradient: "bg-gradient-to-br from-blue-50 to-cyan-50",
    agents: [
      { id: "cto-arch", name: "CTO Architect", role: "Arquitectura Tecnológica", expertise: ["Cloud", "Microservicios", "Seguridad"], icon: Cpu, color: "text-blue-600" },
      { id: "devops-lead", name: "DevOps Lead", role: "Ingeniería DevOps", expertise: ["CI/CD", "Kubernetes", "Automatización"], icon: Code, color: "text-cyan-600" },
      { id: "ai-specialist", name: "AI Specialist", role: "Inteligencia Artificial", expertise: ["Machine Learning", "NLP", "Computer Vision"], icon: Zap, color: "text-blue-500" },
      { id: "data-engineer", name: "Data Engineer", role: "Ingeniería de Datos", expertise: ["Big Data", "ETL", "Data Lakes"], icon: TrendingUp, color: "text-cyan-500" },
    ],
  },
  {
    id: "security",
    name: "Seguridad",
    icon: Shield,
    color: "from-red-600 to-orange-600",
    bgGradient: "bg-gradient-to-br from-red-50 to-orange-50",
    agents: [
      { id: "ciso-strategy", name: "CISO Strategy", role: "Estrategia de Seguridad", expertise: ["Ciberseguridad", "Riesgo", "Cumplimiento"], icon: Shield, color: "text-red-600" },
      { id: "sec-ops", name: "SecOps Analyst", role: "Operaciones de Seguridad", expertise: ["SOC", "Threat Hunting", "Incident Response"], icon: Zap, color: "text-orange-600" },
      { id: "compliance-officer", name: "Compliance Officer", role: "Oficial de Cumplimiento", expertise: ["GDPR", "ISO 27001", "Auditoría"], icon: Scale, color: "text-red-500" },
      { id: "pen-tester", name: "Penetration Tester", role: "Pruebas de Penetración", expertise: ["Ethical Hacking", "Vulnerability Assessment", "Red Team"], icon: Code, color: "text-orange-500" },
    ],
  },
  {
    id: "finance",
    name: "Finanzas",
    icon: DollarSign,
    color: "from-green-600 to-emerald-600",
    bgGradient: "bg-gradient-to-br from-green-50 to-emerald-50",
    agents: [
      { id: "cfo-planning", name: "CFO Planning", role: "Planificación Financiera", expertise: ["FP&A", "Presupuestos", "Forecasting"], icon: DollarSign, color: "text-green-600" },
      { id: "controller", name: "Financial Controller", role: "Control Financiero", expertise: ["Contabilidad", "Reportes", "Auditoría"], icon: TrendingUp, color: "text-emerald-600" },
      { id: "tax-advisor", name: "Tax Advisor", role: "Asesor Fiscal", expertise: ["Planificación Fiscal", "Cumplimiento Tributario", "Optimización"], icon: Scale, color: "text-green-500" },
      { id: "treasury-mgr", name: "Treasury Manager", role: "Gestión de Tesorería", expertise: ["Cash Management", "Risk Management", "Inversiones"], icon: DollarSign, color: "text-emerald-500" },
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: TrendingUp,
    color: "from-yellow-600 to-amber-600",
    bgGradient: "bg-gradient-to-br from-yellow-50 to-amber-50",
    agents: [
      { id: "cmo-strategy", name: "CMO Strategy", role: "Estrategia de Marketing", expertise: ["Branding", "Go-to-Market", "Marketing Digital"], icon: TrendingUp, color: "text-yellow-600" },
      { id: "growth-hacker", name: "Growth Hacker", role: "Crecimiento", expertise: ["Growth Hacking", "SEO/SEM", "Analytics"], icon: Zap, color: "text-amber-600" },
      { id: "content-lead", name: "Content Lead", role: "Líder de Contenido", expertise: ["Content Strategy", "Copywriting", "Storytelling"], icon: MessageSquare, color: "text-yellow-500" },
      { id: "social-media", name: "Social Media Manager", role: "Redes Sociales", expertise: ["Community Management", "Influencer Marketing", "Social Ads"], icon: Users, color: "text-amber-500" },
    ],
  },
  {
    id: "hr",
    name: "Recursos Humanos",
    icon: Users,
    color: "from-indigo-600 to-violet-600",
    bgGradient: "bg-gradient-to-br from-indigo-50 to-violet-50",
    agents: [
      { id: "chro-culture", name: "CHRO Culture", role: "Cultura Organizacional", expertise: ["Cultura", "Employee Experience", "Engagement"], icon: Users, color: "text-indigo-600" },
      { id: "talent-acq", name: "Talent Acquisition", role: "Adquisición de Talento", expertise: ["Recruiting", "Employer Branding", "Onboarding"], icon: Heart, color: "text-violet-600" },
      { id: "learning-dev", name: "Learning & Development", role: "Desarrollo y Aprendizaje", expertise: ["Training", "Career Development", "Coaching"], icon: TrendingUp, color: "text-indigo-500" },
      { id: "comp-benefits", name: "Compensation & Benefits", role: "Compensación y Beneficios", expertise: ["Payroll", "Benefits", "Performance Management"], icon: DollarSign, color: "text-violet-500" },
    ],
  },
  {
    id: "legal",
    name: "Legal",
    icon: Scale,
    color: "from-slate-600 to-gray-600",
    bgGradient: "bg-gradient-to-br from-slate-50 to-gray-50",
    agents: [
      { id: "general-counsel", name: "General Counsel", role: "Asesor Legal Principal", expertise: ["Derecho Corporativo", "M&A", "Contratos"], icon: Scale, color: "text-slate-600" },
      { id: "compliance-legal", name: "Compliance Legal", role: "Cumplimiento Legal", expertise: ["Regulaciones", "Políticas", "Auditoría Legal"], icon: Shield, color: "text-gray-600" },
      { id: "ip-specialist", name: "IP Specialist", role: "Propiedad Intelectual", expertise: ["Patentes", "Marcas", "Copyright"], icon: Code, color: "text-slate-500" },
      { id: "labor-law", name: "Labor Law Expert", role: "Derecho Laboral", expertise: ["Contratos Laborales", "Negociación", "Litigios"], icon: Users, color: "text-gray-500" },
    ],
  },
  {
    id: "operations",
    name: "Operaciones",
    icon: Briefcase,
    color: "from-teal-600 to-cyan-600",
    bgGradient: "bg-gradient-to-br from-teal-50 to-cyan-50",
    agents: [
      { id: "coo-excellence", name: "COO Excellence", role: "Excelencia Operacional", expertise: ["Procesos", "Lean", "Six Sigma"], icon: Briefcase, color: "text-teal-600" },
      { id: "supply-chain", name: "Supply Chain Manager", role: "Cadena de Suministro", expertise: ["Logística", "Inventario", "Proveedores"], icon: TrendingUp, color: "text-cyan-600" },
      { id: "quality-mgr", name: "Quality Manager", role: "Gestión de Calidad", expertise: ["ISO 9001", "Quality Assurance", "Mejora Continua"], icon: Shield, color: "text-teal-500" },
      { id: "project-mgr", name: "Project Manager", role: "Gestión de Proyectos", expertise: ["PMI", "Agile", "Stakeholder Management"], icon: Zap, color: "text-cyan-500" },
    ],
  },
  {
    id: "customer",
    name: "Atención al Cliente",
    icon: HeadphonesIcon,
    color: "from-rose-600 to-pink-600",
    bgGradient: "bg-gradient-to-br from-rose-50 to-pink-50",
    agents: [
      { id: "cx-director", name: "CX Director", role: "Director de Experiencia del Cliente", expertise: ["Customer Experience", "NPS", "Journey Mapping"], icon: HeadphonesIcon, color: "text-rose-600" },
      { id: "support-lead", name: "Support Lead", role: "Líder de Soporte", expertise: ["Customer Support", "Ticket Management", "Escalation"], icon: MessageSquare, color: "text-pink-600" },
      { id: "success-mgr", name: "Customer Success Manager", role: "Gestión de Éxito del Cliente", expertise: ["Onboarding", "Retention", "Upselling"], icon: Heart, color: "text-rose-500" },
      { id: "community-mgr", name: "Community Manager", role: "Gestión de Comunidad", expertise: ["Community Building", "Engagement", "Advocacy"], icon: Users, color: "text-pink-500" },
    ],
  },
  {
    id: "research",
    name: "Investigación",
    icon: FlaskConical,
    color: "from-fuchsia-600 to-purple-600",
    bgGradient: "bg-gradient-to-br from-fuchsia-50 to-purple-50",
    agents: [
      { id: "research-director", name: "Research Director", role: "Director de Investigación", expertise: ["R&D", "Innovation", "Market Research"], icon: FlaskConical, color: "text-fuchsia-600" },
      { id: "data-scientist", name: "Data Scientist", role: "Científico de Datos", expertise: ["Analytics", "ML", "Statistical Modeling"], icon: TrendingUp, color: "text-purple-600" },
      { id: "ux-researcher", name: "UX Researcher", role: "Investigador UX", expertise: ["User Research", "Usability Testing", "Design Thinking"], icon: Users, color: "text-fuchsia-500" },
      { id: "market-analyst", name: "Market Analyst", role: "Analista de Mercado", expertise: ["Competitive Analysis", "Trends", "Forecasting"], icon: TrendingUp, color: "text-purple-500" },
    ],
  },
];

export default function EconeuraCockpit() {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const totalAgents = useMemo(() => DEPARTMENTS.reduce((sum, dept) => sum + dept.agents.length, 0), []);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !selectedAgent) return;
    const userMessage: Message = { id: `msg-${Date.now()}`, role: "user", content: inputValue.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setTimeout(() => {
      const assistantMessage: Message = { id: `msg-${Date.now()}-response`, role: "assistant", content: `[${selectedAgent.name}] Procesando tu solicitud: "${userMessage.content}"...`, timestamp: new Date(), agentId: selectedAgent.id, agentName: selectedAgent.name };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  }, [inputValue, selectedAgent]);

  const toggleVoiceInput = useCallback(() => setIsListening((prev) => !prev), []);
  const toggleSpeech = useCallback(() => setIsSpeaking((prev) => !prev), []);
  const clearConversation = useCallback(() => setMessages([]), []);
  const exportConversation = useCallback(() => {
    const data = JSON.stringify(messages, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [messages]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className={`${isSidebarOpen ? "w-80" : "w-0"} transition-all duration-300 overflow-hidden bg-white border-r border-slate-200 shadow-xl`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ECONEURA</h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <p className="text-sm text-slate-600 mb-2">Agentes Disponibles</p>
            <p className="text-3xl font-bold text-slate-800">{totalAgents}</p>
          </div>
          <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
            {DEPARTMENTS.map((dept) => (
              <button key={dept.id} onClick={() => { setSelectedDepartment(dept); setSelectedAgent(null); }} className={`w-full text-left p-4 rounded-xl transition-all ${selectedDepartment?.id === dept.id ? `bg-gradient-to-r ${dept.color} text-white shadow-lg scale-105` : "bg-slate-50 hover:bg-slate-100 text-slate-700"}`}>
                <div className="flex items-center gap-3">
                  <dept.icon className="w-5 h-5" />
                  <div className="flex-1">
                    <p className="font-semibold">{dept.name}</p>
                    <p className={`text-xs ${selectedDepartment?.id === dept.id ? "text-white/80" : "text-slate-500"}`}>{dept.agents.length} agentes</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><Menu className="w-5 h-5" /></button>}
              <div>
                <h2 className="text-lg font-bold text-slate-800">{selectedAgent ? selectedAgent.name : selectedDepartment ? selectedDepartment.name : "Selecciona un Departamento"}</h2>
                <p className="text-sm text-slate-500">{selectedAgent ? selectedAgent.role : selectedDepartment ? `${selectedDepartment.agents.length} agentes disponibles` : "Elige un área para comenzar"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleSpeech} className={`p-2 rounded-lg transition-colors ${isSpeaking ? "bg-blue-100 text-blue-600" : "hover:bg-slate-100 text-slate-600"}`}>{isSpeaking ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}</button>
              <button onClick={exportConversation} disabled={messages.length === 0} className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Download className="w-5 h-5 text-slate-600" /></button>
              <button onClick={clearConversation} disabled={messages.length === 0} className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Trash2 className="w-5 h-5 text-slate-600" /></button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><Settings className="w-5 h-5 text-slate-600" /></button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 flex flex-col">
            {!selectedAgent ? (
              <div className="flex-1 overflow-y-auto p-6">
                {selectedDepartment ? (
                  <div>
                    <div className={`${selectedDepartment.bgGradient} p-6 rounded-2xl mb-6 border border-slate-200`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 bg-gradient-to-r ${selectedDepartment.color} rounded-xl`}><selectedDepartment.icon className="w-8 h-8 text-white" /></div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-800">{selectedDepartment.name}</h3>
                          <p className="text-slate-600">{selectedDepartment.agents.length} agentes especializados</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedDepartment.agents.map((agent) => (
                        <button key={agent.id} onClick={() => setSelectedAgent(agent)} className="text-left p-6 bg-white rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all group">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-slate-50 group-hover:bg-blue-50 rounded-lg transition-colors"><agent.icon className={`w-6 h-6 ${agent.color}`} /></div>
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-800 mb-1">{agent.name}</h4>
                              <p className="text-sm text-slate-600 mb-3">{agent.role}</p>
                              <div className="flex flex-wrap gap-2">
                                {agent.expertise.map((skill, idx) => <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">{skill}</span>)}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Crown className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Bienvenido a ECONEURA</h3>
                      <p className="text-slate-600">Selecciona un departamento en el panel izquierdo para comenzar</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Inicia la conversación</h3>
                        <p className="text-slate-600">Escribe tu pregunta o solicitud a {selectedAgent.name}</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] p-4 rounded-2xl ${msg.role === "user" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : "bg-white border border-slate-200 text-slate-800"}`}>
                          {msg.role === "assistant" && msg.agentName && <p className="text-xs font-semibold text-slate-500 mb-1">{msg.agentName}</p>}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-xs mt-2 ${msg.role === "user" ? "text-white/70" : "text-slate-400"}`}>{msg.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-slate-200 bg-white p-4">
                  <div className="flex items-end gap-2">
                    <button onClick={toggleVoiceInput} className={`p-3 rounded-lg transition-colors ${isListening ? "bg-red-100 text-red-600" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}>{isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}</button>
                    <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}} placeholder="Escribe tu mensaje..." className="flex-1 p-3 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                    <button onClick={handleSendMessage} disabled={!inputValue.trim()} className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"><Send className="w-5 h-5" /></button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
