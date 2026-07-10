// ---------------------------------------------------------------------------
// All editable content lives here. Edit this file to update the site —
// no HTML/CSS knowledge required.
// ---------------------------------------------------------------------------

const CONTENT = {

  name: "Leonardo Cordeiro Sutil",

  // Lines typed out in the hero terminal, in order.
  heroTyped: "whoami",
  heroOutput: [
    "Leonardo Cordeiro Sutil",
    "Analista de Redes Jr. -> Build Engenharia",
    "",
    "Infraestrutura, servidores e redes corporativas em ambiente",
    "produtivo real: Windows Server, Linux, VMware, Zabbix, FortiGate,",
    "MikroTik. Estudante de Ciencia da Computacao (UNIP, form. 2026)."
  ],

  // Newest first.
  experience: [
    {
      company: "Build Engenharia",
      role: "Estagiario em Infraestrutura de TI e Automacao Predial",
      period: "set. 2025 - atual",
      current: true,
      desc: "Empresa especializada em tecnologia predial e seguranca eletronica. Atuacao dividida em tres frentes:",
      highlights: [
        "Servidores: montagem de hardware, instalacao e configuracao de Windows Server 2016/2019/2022 e Linux Ubuntu Server; DHCP, DNS e File Server; virtualizacao com VMware ESXi e Hyper-V.",
        "Redes corporativas: switches Cisco e HP, roteadores MikroTik, firewalls pfSense e FortiGate; criacao de VLANs e regras de firewall; monitoramento via SNMP e Zabbix; diagnostico de incidentes em producao.",
        "Automacao predial e seguranca: CFTV, controle de acesso e CLPs (Controladores Logicos Programaveis)."
      ]
    },
    {
      company: "Subway",
      role: "Atendimento ao cliente",
      period: "jun. 2024 - mar. 2025",
      current: false,
      desc: "Atendimento direto ao cliente e operacao de caixa em ambiente de alto volume."
    },
    {
      company: "Lemos e Lemos Assessoria em Seguranca do Trabalho",
      role: "Estagiario de engenharia",
      period: "dez. 2021 - abr. 2022",
      current: false,
      desc: "Suporte administrativo: relatorios tecnicos, controle de contas a pagar/receber e prazos contratuais."
    },
    {
      company: "Incubadora Tecnologica UTFPR",
      role: "Bolsista de gestao",
      period: "nov. 2020 - nov. 2021",
      current: false,
      desc: "Suporte a startups em fase de incubacao: acompanhamento de indicadores, relatorios tecnicos e gerenciais."
    }
  ],

  education: [
    {
      title: "Bacharelado em Ciencia da Computacao",
      place: "Universidade Paulista (UNIP), Sao Paulo",
      period: "ago. 2022 - ago. 2026 (previsto)",
      current: true,
      desc: "Formacao em curso, conciliada com atuacao pratica em infraestrutura de TI."
    }
  ],

  // EDIT ME: adjust categories/items to match your real skill set.
  skills: [
    {
      category: "redes",
      items: ["TCP/IP", "VLANs", "DHCP / DNS", "SNMP", "Wireshark"]
    },
    {
      category: "servidores_e_virtualizacao",
      items: ["Windows Server 2016/2019/2022", "Linux Ubuntu Server", "VMware ESXi", "Hyper-V", "File Server"]
    },
    {
      category: "seguranca_e_firewall",
      items: ["pfSense", "FortiGate", "Zabbix (monitoramento)", "Controle de acesso", "CFTV"]
    },
    {
      category: "equipamentos",
      items: ["Switches Cisco / HP", "Roteadores MikroTik", "CLPs (automacao predial)"]
    },
    {
      category: "linguagens_e_dev",
      items: ["Python", "Java", "JavaScript", "HTML5 / CSS3", "Git / GitHub"]
    },
    {
      category: "idiomas",
      items: ["Ingles - C2 Proficient (Cambridge / EF SET 75/100)"]
    }
  ],

  // EDIT ME: certifications marked "featured: true" get extra visual weight
  // (shown first, with a highlighted badge). Currently only the AWS cert is
  // confirmed from your resume — no Cisco certificate was in there. If you
  // have one (e.g. CCNA / Cisco Networking Academy), add it here with
  // featured: true and I'll wire it in.
  certifications: [
    { name: "AWS Educate: Introduction to Generative AI", issuer: "Amazon Web Services", date: "mar. 2025", featured: true },
    { name: "Introducao a Ciberseguranca com o Santander", issuer: "Santander Brasil", date: "abr. 2025" },
    { name: "Fundamentos de HTTP para Desenvolvedores", issuer: "LinkedIn Learning", date: "abr. 2025" },
    { name: "Integrando Inteligencia Artificial nas Empresas", issuer: "Universidade Paulista", date: "out. 2024" },
    { name: "Seguranca da Informacao e a Protecao de Dados nos Dias Atuais", issuer: "Universidade Paulista", date: "out. 2024" },
    { name: "Linux Unhatched", issuer: "LinkedIn Learning", date: "" },
    { name: "EFSET English Certificate 75/100 (C2 Proficient)", issuer: "EF SET", date: "set. 2021" }
  ],

  // EDIT ME: add one object per project. Newest first.
  // Example:
  // {
  //   name: "monitoramento-zabbix",
  //   period: "2026",
  //   desc: "Dashboard customizado de monitoramento de rede com Zabbix.",
  //   stack: ["Zabbix", "SNMP"],
  //   link: "https://github.com/leodah20/..."
  // }
  projects: [
    {
      name: "ecofuturo",
      period: "2026",
      desc: "Site sobre energias renovaveis no Brasil, feito para a disciplina de Programacao Web Responsiva (UNIP). Tabela comparativa de fontes de energia, grafico interativo (Chart.js), calculadora de pegada de carbono, simulador de energia solar com dados do INPE/CRESESB e quiz interativo.",
      stack: ["HTML5", "CSS3", "JavaScript", "Chart.js"],
      demo: "https://leodah20.github.io/APS/",
      link: "https://github.com/leodah20/APS"
    },
    {
      name: "chatbot-front",
      period: "2025 - atual",
      desc: "Painel administrativo (Flask) para gestao academica universitaria: avisos, conteudo, calendario, docentes e duvidas frequentes. Consome uma API REST (FastAPI + Supabase) e se integra a um chatbot com NLU em Rasa. Projeto em grupo (TCC) — atuacao no front-end e na integracao com a API.",
      note: "O demo abaixo e um prototipo estatico (sem backend real) so para mostrar o front-end.",
      stack: ["Python", "Flask", "Jinja2", "REST API"],
      demo: "https://leodah20.github.io/chatbot-front-demo/",
      link: "https://github.com/leodah20/chatbot-front"
    }
  ],

  contact: [
    { label: "github",   value: "github.com/leodah20",                          href: "https://github.com/leodah20" },
    { label: "linkedin", value: "linkedin.com/in/leonardo-cordeiro-sutil",       href: "https://www.linkedin.com/in/leonardo-cordeiro-sutil" },
    { label: "blog",     value: "medium.com/@leoh.cordeiros",                    href: "https://medium.com/@leoh.cordeiros" },
    { label: "email",    value: "leoh.cordeiros@gmail.com",                      href: "mailto:leoh.cordeiros@gmail.com" }
  ]

};
