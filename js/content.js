// ---------------------------------------------------------------------------
// All editable content lives here. Edit this file to update the site —
// no HTML/CSS knowledge required.
// ---------------------------------------------------------------------------

const CONTENT = {

  name: "Leonardo Cordeiro Sutil",

  githubUsername: "leodah20",

  // Lines typed out in the hero terminal, in order.
  heroTyped: "whoami",
  heroOutput: [
    "Leonardo Cordeiro Sutil",
    "Analista de Redes Jr. -> Build Engenharia",
    "",
    "Infraestrutura, servidores e redes corporativas em ambiente",
    "produtivo real: Windows Server, Linux, VMware, Zabbix, FortiGate,",
    "MikroTik. Bacharel em Ciencia da Computacao (UNIP, form. jul. 2026)."
  ],

  // Newest first. Build Engenharia uses `roles` (an array) to show a real
  // promotion; every other entry uses the flat role/period/current shape.
  experience: [
    {
      company: "Build Engenharia",
      roles: [
        { title: "Estagiario em Infraestrutura de TI e Automacao Predial", period: "set. 2025 - jul. 2026", current: false },
        { title: "Analista de Redes Jr.", period: "jul. 2026 - atual", current: true }
      ],
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
      period: "ago. 2022 - jul. 2026",
      current: false,
      desc: "Formacao concluida, conciliada com atuacao pratica em infraestrutura de TI."
    }
  ],

  skills: [
    {
      category: "redes",
      items: ["TCP/IP", "VLANs", "DHCP / DNS", "SNMP", "Wireshark", "Cabeamento estruturado", "Cisco Packet Tracer"]
    },
    {
      category: "servidores_e_virtualizacao",
      items: ["Windows Server 2016/2019/2022", "Linux Ubuntu Server", "VMware ESXi", "Hyper-V", "File Server", "Active Directory"]
    },
    {
      category: "seguranca_e_firewall",
      items: ["pfSense", "FortiGate", "Zabbix (monitoramento)", "Controle de acesso", "CFTV", "VPN", "Hardening basico"]
    },
    {
      category: "equipamentos",
      items: ["Switches Cisco / HP", "Roteadores MikroTik", "CLPs (automacao predial)"]
    },
    {
      category: "linguagens_e_dev",
      items: ["Python", "Java", "JavaScript", "HTML5 / CSS3", "Git / GitHub", "Bash"]
    },
    {
      category: "idiomas",
      items: ["Ingles - C2 Proficient (Cambridge / EF SET 75/100)"]
    }
  ],

  // featured: true => rendered as a lit LED card in the "featured" row.
  // Everything else renders as a compact dim-LED pill. Keep featured to a
  // small set (3) or the LED wall stops reading as "featured".
  certifications: [
    { name: "AWS Educate: Introduction to Generative AI", issuer: "Amazon Web Services", date: "mar. 2025", featured: true },
    { name: "Conceitos Basicos de Redes", issuer: "Cisco Networking Academy", date: "22 mai. 2026", featured: true },
    { name: "Treinamento Invenzi W-Access", issuer: "Invenzi", date: "18 mai. 2026 (valido ate 18/06/2028)", featured: true },
    { name: "Comecando com o Cisco Packet Tracer", issuer: "Cisco Networking Academy", date: "16 abr. 2026" },
    { name: "Linux Essentials", issuer: "Cisco Networking Academy (NDG)", date: "22 mai. 2026" },
    { name: "Linux Unhatched", issuer: "Cisco Networking Academy (NDG)", date: "22 mai. 2026" },
    { name: "C++ Essentials 1", issuer: "Cisco Networking Academy (C++ Institute)", date: "27 mai. 2026" },
    { name: "Introducao a Ciberseguranca com o Santander", issuer: "Santander Brasil", date: "abr. 2025" },
    { name: "Fundamentos de HTTP para Desenvolvedores", issuer: "LinkedIn Learning", date: "03 abr. 2025" },
    { name: "Seguranca da Informacao e a Protecao de Dados nos Dias Atuais", issuer: "Universidade Paulista (palestra)", date: "21 out. 2024" },
    { name: "Integrando Inteligencia Artificial nas Empresas", issuer: "Universidade Paulista (palestra)", date: "31 out. 2024" },
    { name: "EFSET English Certificate 75/100 (C2 Proficient)", issuer: "EF SET", date: "22 set. 2021" }
  ],

  // EDIT ME: add one object per project. Newest first. `demo` presence
  // controls the host-card status label (online vs source-only) — do not
  // add a demo link unless it is a real, reachable URL.
  projects: [
    {
      name: "pokemon-trainer-companion",
      period: "2026 - atual",
      featured: true,
      progress: 94,
      progressLabel: "94% — 34/36 features (v1.0 Beta)",
      desc: "App mobile (React Native + backend NestJS) para treinadores de Pokemon GO: calculadora de IV, ranking de PvP, contadores de raid, Pokedex com lore, e um overlay flutuante com IA (Gemini) que le a tela via OCR e da dicas em tempo real, sem login na conta do jogo.",
      stack: ["React Native", "TypeScript", "Kotlin", "NestJS", "Prisma", "Gemini AI"],
      link: "https://github.com/leodah20/pokemon-trainer-companion"
    },
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
