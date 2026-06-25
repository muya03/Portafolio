import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "es" | "en" | "va" | "ar";

const STORAGE_KEY = "portfolio-lang";

const SUPPORTED_LANGS: Lang[] = ["es", "en", "va", "ar"];
const RTL_LANGS: Lang[] = ["ar"];

type NavLink = { href: string; label: string };
type Experience = { role: string; company: string; date: string; description: string };
type Skill = { title: string; description: string; tags: string[] };
type Project = { name: string; description: string; tech: string; link: string; image?: string };
type Education = { title: string; subtitle: string };
type Achievement = { year: string; text: string };
type InfoItem = { label: string; value: string };
type Stat = { count: number; suffix: string; label: string };
type MediaItem = { outlet: string; title: string; url: string; originalTitle?: string };

export type Dict = {
  nav: NavLink[];
  langToggleLabel: string;
  hero: {
    badge: string;
    typed: string;
    tagline: string;
    contact: string;
    downloadCv: string;
  };
  about: {
    title: string;
    stats: Stat[];
    paragraphs: string[];
    info: InfoItem[];
    photoAlt: string;
  };
  experience: { title: string; items: Experience[] };
  skills: { title: string; items: Skill[] };
  projects: { title: string; viewMore: string; items: Project[] };
  representation: {
    title: string;
    intro: string;
    roles: string[];
    stageAlt: string;
    podiumAlt: string;
  };
  education: { title: string; items: Education[] };
  achievements: { title: string; items: Achievement[] };
  media: { title: string; intro: string; items: MediaItem[] };
  contact: {
    title: string;
    intro: string;
    phoneLabel: string;
    rights: string;
    location: string;
  };
  scroll: string;
};

const SHARED = {
  skillTags: [
    ["Node.js", "Express.js", "React", "Vite", "TailwindCSS"],
    ["Python", "Java", "C++", "JavaScript", "TypeScript"],
    ["MQTT", "ESP-NOW", "LoRa", "Bus CAN", "PCBs"],
  ],
  managementTags: {
    es: ["Management", "Erasmus+", "Finanzas", "Operaciones"],
    en: ["Management", "Erasmus+", "Finance", "Operations"],
    va: ["Management", "Erasmus+", "Finances", "Operacions"],
    ar: ["الإدارة", "Erasmus+", "المالية", "العمليات"],
  },
  mediaMeta: [
    { outlet: "El Mundo", url: "https://castellonaldia.elmundo.es/castellon/educacion/canvi-per-la-llibertat-copa-el-voto-del-alumnado-de-la-uji-MK19466479" },
    { outlet: "El Mundo", url: "https://castellonaldia.elmundo.es/castellon/educacion/mohamed-al-howaidi-portavoz-de-canvi-per-la-llibertad-el-plan-de-becas-propias-de-la-uji-y-su-alcance-deben-mejorarse-OP19524758" },
    { outlet: "El Periódico Mediterráneo", url: "https://www.elperiodicomediterraneo.com/opinion/2024/10/20/nuevo-rumbo-consell-l-estudiantat-109791767.html" },
    { outlet: "Castellón Plaza", url: "https://castellonplaza.com/castellonplaza/castellon9/castello-modifica-las-lineas-de-autobuses-con-la-uji-para-adaptarse-a-los-horarios-de-las-clases" },
    { outlet: "Castellón Diario", url: "https://castellondiario.com/horario-especial-24-horas-en-la-biblioteca-de-la-uji-por-examenes/" },
    { outlet: "Actualidad Castellón", url: "https://actualidadcastellon.com/las-200-plazas-de-la-nueva-residencia-de-estudiantes-de-castellon-preve-abrir-en-2025/" },
    { outlet: "Castellón Plaza", url: "https://castellonplaza.com/castellonplaza/educacion2/la-uji-incluye-en-su-plan-de-gobierno-un-nuevo-edificio-de-alojamientos-asequibles-para-el-estudiantado" },
    { outlet: "Castellón Plaza", url: "https://castellonplaza.com/castellonplaza/educacion2/el-precio-del-alquiler-amenaza-el-acceso-a-la-universidad-en-castello-piden-entre250-y-280-por-habitacion" },
    { outlet: "El Periódic", url: "https://www.elperiodic.com/castellon/castellon-ultima-bases-ayudas-alquiler-joven_905423" },
    { outlet: "COPE", url: "https://www.cope.es/emisoras/comunidad-valenciana/castellon-provincia/castellon/noticias/perpetua-realidad-estudiante-universitario-vivienda-tipicos-prejuicios-20250206_3090914.html" },
    { outlet: "Castellón Plaza", url: "https://castellonplaza.com/castellonplaza/castellon9/la-uji-presenta-su-plan-de-becas-para-2026-centraliza-todas-las-convocatorias-en-un-nuevo-portal-web" },
    { outlet: "El Periódico Mediterráneo", url: "https://www.elperiodicomediterraneo.com/castello-provincia/2026/05/07/candidato-rector-jesus-lancis-reune-129950959.html" },
    { outlet: "Vive Castellón", url: "https://www.vivecastellon.com/noticiario/informacion-de-los-asuntos-tratados-en-el-claustro-sesion-numero-11-48807.html" },
    { outlet: "Castellón Plaza", url: "https://castellonplaza.com/castellonplaza/educacion2/el-estudiantado-de-medicina-de-la-uji-rechaza-el-convenio-de-practicas-con-la-conselleria-de-sanidad" },
    { outlet: "COPE", url: "https://www.cope.es/emisoras/comunidad-valenciana/castellon-provincia/castellon/ceracope/noticias/diferente-grosor-reduccion-co2-las-soluciones-desde-uji-los-retos-porcelanosa-20231004_2930380" },
  ],
  projectsMeta: [
    { name: "Canvi_Page", tech: "TypeScript", link: "https://github.com/muya03/Canvi_Page" },
    { name: "CEUJI_Page", tech: "TypeScript", link: "https://github.com/muya03/CEUJI_Page" },
    { name: "SafeSignal", tech: "TypeScript", link: "https://github.com/muya03/SafeSignal" },
    { name: "DAteensy", tech: "C++", link: "https://github.com/muya03/DAteensy" },
    {
      name: "IoT Telemetry Web",
      tech: "JavaScript",
      link: "https://github.com/muya03/PaginaWebNodeJS-EXPRESSJS-MQTT-ESP32",
    },
    {
      name: "AI Face & Hand Tracker",
      tech: "Python",
      link: "https://github.com/muya03/IA-Reconocimiento-de-Caras-y-Manos",
    },
    {
      name: "Nexora Cerámica",
      tech: "React / Vite",
      link: "https://nexoraceramica.es",
      image: "photos/nexora-preview.jpg",
    },
  ],
};

const buildMedia = (titles: string[], originals?: string[]): MediaItem[] =>
  SHARED.mediaMeta.map((m, i) => ({
    ...m,
    title: titles[i],
    ...(originals ? { originalTitle: originals[i] } : {}),
  }));

const ES_MEDIA_TITLES = [
  "Canvi per la Llibertat copa el voto del alumnado de la UJI",
  "Mohamed Al Howaidi: el plan de becas propias de la UJI debe mejorarse",
  "Nuevo rumbo en el Consell de l'Estudiantat",
  "Castelló modifica las líneas de autobuses con la UJI para adaptarse a los horarios de las clases",
  "Horario especial 24 horas en la Biblioteca de la UJI por exámenes",
  "Las 200 plazas de la nueva residencia de estudiantes de Castellón prevén abrir en 2025",
  "La UJI incluye en su plan de Gobierno un nuevo edificio de alojamientos asequibles para el estudiantado",
  "El precio del alquiler amenaza el acceso a la universidad en Castelló",
  "Castellón ultima las bases de las ayudas al alquiler joven",
  "La perpetua realidad del estudiante universitario y la vivienda",
  "La UJI presenta su plan de becas para 2026 en un nuevo portal web",
  "El candidato a rector Jesús Lancís reúne apoyos",
  "Asuntos tratados en el Claustro de la UJI, sesión nº 11",
  "El estudiantado de Medicina de la UJI rechaza el convenio de prácticas con la Conselleria de Sanidad",
  "Diferente grosor y reducción de CO2: las soluciones desde la UJI a los retos de Porcelanosa",
];

const EN_MEDIA_TITLES = [
  "Canvi per la Llibertat sweeps the UJI student vote",
  "Mohamed Al Howaidi: UJI's own scholarship plan must be improved",
  "A new direction for the Consell de l'Estudiantat",
  "Castelló adjusts the UJI bus lines to match class schedules",
  "Special 24-hour schedule at the UJI Library during exams",
  "The 200 places at Castellón's new student residence are set to open in 2025",
  "UJI includes a new building of affordable student housing in its governance plan",
  "Soaring rents threaten access to university in Castelló",
  "Castellón finalizes the rules for youth rental aid",
  "The enduring reality of university students and housing",
  "UJI unveils its 2026 scholarship plan on a new web portal",
  "Rector candidate Jesús Lancís gathers support",
  "Matters discussed at the UJI Senate, session no. 11",
  "UJI Medicine students reject the placement agreement with the regional health department",
  "Reduced thickness and lower CO2: UJI's solutions to Porcelanosa's challenges",
];

const VA_MEDIA_TITLES = [
  "Canvi per la Llibertat copa el vot de l'alumnat de la UJI",
  "Mohamed Al Howaidi: el pla de beques pròpies de la UJI ha de millorar-se",
  "Nou rumb en el Consell de l'Estudiantat",
  "Castelló modifica les línies d'autobusos amb la UJI per a adaptar-se als horaris de les classes",
  "Horari especial 24 hores en la Biblioteca de la UJI per exàmens",
  "Les 200 places de la nova residència d'estudiants de Castelló preveuen obrir en 2025",
  "La UJI inclou en el seu pla de Govern un nou edifici d'allotjaments assequibles per a l'estudiantat",
  "El preu del lloguer amenaça l'accés a la universitat a Castelló",
  "Castelló ultima les bases de les ajudes al lloguer jove",
  "La perpètua realitat de l'estudiant universitari i l'habitatge",
  "La UJI presenta el seu pla de beques per a 2026 en un nou portal web",
  "El candidat a rector Jesús Lancís reuneix suports",
  "Assumptes tractats en el Claustre de la UJI, sessió núm. 11",
  "L'estudiantat de Medicina de la UJI rebutja el conveni de pràctiques amb la Conselleria de Sanitat",
  "Diferent gruix i reducció de CO2: les solucions des de la UJI als reptes de Porcelanosa",
];

const AR_MEDIA_TITLES = [
  "حركة Canvi per la Llibertat تكتسح أصوات طلاب جامعة UJI",
  "محمد الهويدي: يجب تحسين خطة المنح الدراسية الخاصة بجامعة UJI",
  "اتجاه جديد لمجلس الطلاب (Consell de l'Estudiantat)",
  "كاستيو تعدّل خطوط الحافلات مع جامعة UJI لتتوافق مع جداول المحاضرات",
  "جدول خاص على مدار 24 ساعة في مكتبة جامعة UJI خلال الامتحانات",
  "200 مكان في سكن الطلاب الجديد في كاستيون من المقرر افتتاحها في 2025",
  "جامعة UJI تُدرج مبنى جديدًا لسكن طلابي ميسور التكلفة في خطتها الحكومية",
  "ارتفاع الإيجارات يهدد الوصول إلى الجامعة في كاستيو",
  "كاستيون تُنهي قواعد إعانات الإيجار للشباب",
  "الواقع المستمر لطلاب الجامعة والسكن",
  "جامعة UJI تكشف عن خطة المنح الدراسية لعام 2026 عبر بوابة إلكترونية جديدة",
  "مرشح رئاسة الجامعة خيسوس لانسيس يحشد الدعم",
  "المواضيع التي نوقشت في مجلس جامعة UJI، الجلسة رقم 11",
  "طلاب الطب في جامعة UJI يرفضون اتفاقية التدريب مع وزارة الصحة الإقليمية",
  "سماكة أقل وانبعاثات CO2 أدنى: حلول جامعة UJI لتحديات بورسيلانوزا",
];

export const translations: Record<Lang, Dict> = {
  es: {
    nav: [
      { href: "#inicio", label: "Inicio" },
      { href: "#sobre-mi", label: "Sobre mí" },
      { href: "#experiencia", label: "Experiencia" },
      { href: "#capacidades", label: "Capacidades" },
      { href: "#proyectos", label: "Proyectos" },
      { href: "#representacion", label: "Representación" },
      { href: "#formacion", label: "Formación" },
      { href: "#medios", label: "Medios" },
      { href: "#contacto", label: "Contacto" },
    ],
    langToggleLabel: "Cambiar idioma",
    hero: {
      badge: "Castellón, España",
      typed: "Representante Estudiantil y Desarrollador CS.",
      tagline: "Construyendo plataformas escalables y liderando el futuro universitario.",
      contact: "Contactar",
      downloadCv: "Descargar CV",
    },
    about: {
      title: "01. Sobre mí",
      stats: [
        { count: 5, suffix: "+", label: "Años programando" },
        { count: 10, suffix: "+", label: "Cargos de representación" },
        { count: 3, suffix: "", label: "Premios y reconocimientos" },
        { count: 40, suffix: "+", label: "Apariciones en medios" },
      ],
      paragraphs: [
        "Me llamo <strong>Mohamed</strong> y aporto soluciones innovadoras a problemas o retos en torno a la programación y en el ámbito social.",
        "Actualmente soy estudiante de Ingeniería Informática, aunque llevo en el sector de la programación más de 5 años. Fui miembro de UJI Formula Student, de HackerSpace Castellón y varios proyectos universitarios más, de los cuales he aprendido a desarrollar mi creatividad, la productividad, el trabajo en equipo, habilidades comunicativas y la capacidad de adaptación.",
        "También soy representante estudiantil: presidente del Consejo de Estudiantes de la Universitat Jaume I, Tesorero de CREUP, entre otros muchos cargos donde la tecnología y el liderazgo se cruzan.",
      ],
      info: [
        { label: "Idiomas", value: "ES, VA, AR, EN" },
        { label: "Ubicación", value: "Castellón" },
        { label: "Perfil", value: "Full-Stack & IoT" },
        { label: "Rol", value: "Líder/Desarrollador" },
      ],
      photoAlt: "Mohamed Al Howaidi en el campus",
    },
    experience: {
      title: "02. Experiencia",
      items: [
        {
          role: "Tesorero",
          company: "CREUP",
          date: "Mayo 2025 - Mayo 2026",
          description:
            "Fortalecimiento de financiación. Búsqueda activa de patrocinios. Estrategia presupuestaria estable. Optimización de recursos financieros. Transparencia y control económico. Coordinar procedimientos de contabilidad y facturación.",
        },
        {
          role: "Vocal de Proyectos",
          company: "CREUP",
          date: "Feb 2025 - Nov 2025",
          description:
            "Desarrollo y consecución de proyectos universitarios. Fortalecimiento de financiación y apoyo a proyectos. Coordinar y presentar proyectos Erasmus+ KA1. Fomentar alianzas con otras entidades.",
        },
        {
          role: "Presidente",
          company: "CEUJI",
          date: "Mayo 2024 - Actualidad",
          description:
            "Presidir el Consejo de Estudiantes. Coordinar el trabajo institucional y externo. Velar por el funcionamiento interno. Crear el Plan de Trabajo Anual. Coordinar y dinamizar a los miembros. Velar por el cumplimiento de la legalidad de la UJI.",
        },
        {
          role: "Tesorero",
          company: "CEUJI",
          date: "Ene 2024 - Mayo 2024",
          description:
            "Diseñar y gestionar el presupuesto anual. Crear informes económicos de cada evento. Coordinar trabajo con el PTGAS adjunto. Crear manuales de gestión presupuestaria.",
        },
        {
          role: "Chief Operations Officer",
          company: "UJI MOTORSPORT",
          date: "Ene 2024 - Sep 2024",
          description:
            "Buscar financiación mediante patrocinadores y organizaciones privadas/públicas. Regular el funcionamiento interno. Mantener relaciones con patrocinadores y contactos.",
        },
        {
          role: "Chief Marketing & Ops Officer",
          company: "UJI MOTORSPORT",
          date: "Ene 2023 - Ene 2024",
          description:
            "Editar contenido digital e impreso. Crear nueva imagen corporativa. Crear flujo de trabajo óptimo. Coordinar sub-departamentos de diseño y notas de prensa.",
        },
        {
          role: "Chief Electronics Officer",
          company: "UJI MOTORSPORT",
          date: "Sep 2022 - Ene 2023",
          description:
            "Coordinar el departamento de electrónica. Planificar futuras tecnologías. Diseñar y soldar PCBs, crear conexiones generales y corregir errores.",
        },
        {
          role: "Co-founder & CEO",
          company: "Reddere",
          date: "Jun 2022 - Ene 2024",
          description:
            "Fundar plataforma de arrendamientos estudiantiles. Crear plan de negocio e imagen de marca. Programar algoritmo de recomendación, backend y base de datos.",
        },
        {
          role: "Vicepresidente",
          company: "HackerSpace",
          date: "Oct 2022 - Sep 2024",
          description:
            "Gestionar y organizar eventos para estudiantes. Crear sinergias institucionales. Diseñar y crear hardware para investigaciones internas.",
        },
        {
          role: "Desarrollador",
          company: "UJI MOTORSPORT",
          date: "Sep 2021 - Sep 2022",
          description:
            "Investigar sobre tecnologías IoT y programar microcontroladores. Diseñar y programar un graficador de telemetría en tiempo real.",
        },
      ],
    },
    skills: {
      title: "03. Capacidades",
      items: [
        {
          title: "Desarrollo Full-Stack",
          description:
            "Diseño e implementación de soluciones escalables y optimizadas para plataformas web.",
          tags: SHARED.skillTags[0],
        },
        {
          title: "Lenguajes & Algoritmia",
          description:
            "Amplia base algorítmica y dominio de múltiples lenguajes de programación estructurada y orientada a objetos.",
          tags: SHARED.skillTags[1],
        },
        {
          title: "Sistemas Embebidos e IoT",
          description:
            "Diseño de PCBs, arquitecturas IoT y comunicación entre redes de dispositivos de hardware.",
          tags: SHARED.skillTags[2],
        },
        {
          title: "Gestión & Liderazgo",
          description:
            "Estrategia financiera, relaciones institucionales, gestión de proyectos europeos (Erasmus+) y liderazgo de equipos multidisciplinares.",
          tags: SHARED.managementTags.es,
        },
      ],
    },
    projects: {
      title: "04. Proyectos",
      viewMore: "Ver más en GitHub",
      items: [
        {
          ...SHARED.projectsMeta[6],
          description:
            "Sitio web corporativo multilingüe (ES/EN/AR) diseñado y desarrollado para Nexora Cerámica. Trabajo real entregado a la empresa: catálogo de azulejos, grifería, bañeras y lavabos.",
        },
        {
          ...SHARED.projectsMeta[0],
          description: "Web del ecosistema digital de CANVI en la Universitat Jaume I.",
        },
        {
          ...SHARED.projectsMeta[1],
          description:
            "Web del ecosistema digital del Consell de l'Estudiantat (Consejo de Estudiantes) de la UJI.",
        },
        {
          ...SHARED.projectsMeta[2],
          description: "App para la comunicación en situaciones de crisis entre dos personas.",
        },
        {
          ...SHARED.projectsMeta[3],
          description: "Sistema de adquisición de datos basado en el microcontrolador Teensy.",
        },
        {
          ...SHARED.projectsMeta[4],
          description:
            "App web para visualizar la telemetría y parámetros de un vehículo (Node.js/Express/MQTT/ESP32).",
        },
        {
          ...SHARED.projectsMeta[5],
          description:
            "Una IA que detecta cara/ojos/boca y otra que detecta la mano y sus movimientos.",
        },
      ],
    },
    representation: {
      title: "05. Representación",
      intro:
        "Un liderazgo activo a nivel universitario, autonómico, nacional y europeo. Impulsando políticas, coordinando equipos y defendiendo los derechos de los estudiantes en las mesas donde se toman las decisiones.",
      roles: [
        "Presidente del Consejo de Estudiantes de la Universitat Jaume I (CEUJI)",
        "Tesorero de CREUP (Coordinadora de Representantes de Estudiantes de Universidades Públicas)",
        "Miembro de RITSI y Presidente de Comité Organizador LXI AGO RITSI",
        "Miembro de la Student Board — EDUC European Alliance (UJI)",
        "Representante en el Pleno del CEUNE, Ministerio de Ciencia, Innovación y Universidades",
        "Claustral y Consejero de Gobierno de la Universitat Jaume I",
        "Embajador Nacional de la Universitat Jaume I",
      ],
      stageAlt: "Mohamed hablando en un evento",
      podiumAlt: "Mohamed en el podio",
    },
    education: {
      title: "06. Formación",
      items: [
        { title: "Ingeniería Informática", subtitle: "Universitat Jaume I (UJI) — Estudiante" },
        { title: "Liderazgo para futuros líderes", subtitle: "EDEM Valencia — 2024" },
        { title: "Gestión de equipos", subtitle: "UFS Academy by Torrecid — 2024" },
        { title: "SantanderX Explorer", subtitle: "Santander Universia — 2024" },
        { title: "CS50's HarvardX", subtitle: "Universidad de Harvard — 2020" },
      ],
    },
    achievements: {
      title: "07. Logros y Ponencias",
      items: [
        { year: "2024", text: "Ganador del Primer Premio, Hackathon Facsa" },
        { year: "2024", text: "Ganador Tercer Premio, OSHWDem A Coruña" },
        { year: "2023", text: "Segundo Premio, Hackathon Fundación LAB - UJI" },
        { year: "2023", text: "Ponente, eMobility Expo World Congress" },
        { year: "2023", text: "Presidente Organización, TechnoCharlas ESTCE - UJI" },
        { year: "2023", text: "Profesor de nuevas tecnologías, ACAST" },
        { year: "2022", text: "Ponente, ÁgoraJoven (Consejo de Juventud de Castellón)" },
        { year: "2022", text: "Organizador, Feria DDCT, ESTCE - UJI" },
      ],
    },
    media: {
      title: "08. Medios",
      intro:
        "Selección de apariciones en prensa y medios de comunicación en relación a mi actividad institucional y representativa.",
      items: buildMedia(ES_MEDIA_TITLES),
    },
    contact: {
      title: "HABLEMOS.",
      intro:
        "Abierto a nuevas oportunidades, proyectos colaborativos o cualquier consulta sobre representación estudiantil.",
      phoneLabel: "T",
      rights: "Todos los derechos reservados.",
      location: "Castellón, España",
    },
    scroll: "Scroll",
  },
  en: {
    nav: [
      { href: "#inicio", label: "Home" },
      { href: "#sobre-mi", label: "About" },
      { href: "#experiencia", label: "Experience" },
      { href: "#capacidades", label: "Skills" },
      { href: "#proyectos", label: "Projects" },
      { href: "#representacion", label: "Representation" },
      { href: "#formacion", label: "Education" },
      { href: "#medios", label: "Media" },
      { href: "#contacto", label: "Contact" },
    ],
    langToggleLabel: "Change language",
    hero: {
      badge: "Castellón, Spain",
      typed: "Student Representative & CS Developer.",
      tagline: "Building scalable platforms and leading the future of the university.",
      contact: "Get in touch",
      downloadCv: "Download CV",
    },
    about: {
      title: "01. About me",
      stats: [
        { count: 5, suffix: "+", label: "Years coding" },
        { count: 10, suffix: "+", label: "Representative roles" },
        { count: 3, suffix: "", label: "Awards & recognitions" },
        { count: 40, suffix: "+", label: "Media appearances" },
      ],
      paragraphs: [
        "My name is <strong>Mohamed</strong> and I bring innovative solutions to challenges in programming and in the social sphere.",
        "I am currently a Computer Science Engineering student, although I have been in the programming field for more than 5 years. I was a member of UJI Formula Student, HackerSpace Castellón and several other university projects, through which I learned to develop my creativity, productivity, teamwork, communication skills and adaptability.",
        "I am also a student representative: president of the Student Council of Universitat Jaume I, Treasurer of CREUP, among many other roles where technology and leadership meet.",
      ],
      info: [
        { label: "Languages", value: "ES, VA, AR, EN" },
        { label: "Location", value: "Castellón" },
        { label: "Profile", value: "Full-Stack & IoT" },
        { label: "Role", value: "Leader/Developer" },
      ],
      photoAlt: "Mohamed Al Howaidi on campus",
    },
    experience: {
      title: "02. Experience",
      items: [
        {
          role: "Treasurer",
          company: "CREUP",
          date: "May 2025 - May 2026",
          description:
            "Strengthening funding. Active search for sponsorships. Stable budget strategy. Optimization of financial resources. Transparency and economic control. Coordinating accounting and invoicing procedures.",
        },
        {
          role: "Projects Officer",
          company: "CREUP",
          date: "Feb 2025 - Nov 2025",
          description:
            "Development and delivery of university projects. Strengthening funding and project support. Coordinating and presenting Erasmus+ KA1 projects. Fostering partnerships with other entities.",
        },
        {
          role: "President",
          company: "CEUJI",
          date: "May 2024 - Present",
          description:
            "Chairing the Student Council. Coordinating institutional and external work. Overseeing internal operations. Creating the Annual Work Plan. Coordinating and energizing members. Ensuring compliance with UJI regulations.",
        },
        {
          role: "Treasurer",
          company: "CEUJI",
          date: "Jan 2024 - May 2024",
          description:
            "Designing and managing the annual budget. Creating financial reports for each event. Coordinating work with the assigned PTGAS staff. Creating budget management manuals.",
        },
        {
          role: "Chief Operations Officer",
          company: "UJI MOTORSPORT",
          date: "Jan 2024 - Sep 2024",
          description:
            "Seeking funding through sponsors and private/public organizations. Regulating internal operations. Maintaining relationships with sponsors and contacts.",
        },
        {
          role: "Chief Marketing & Ops Officer",
          company: "UJI MOTORSPORT",
          date: "Jan 2023 - Jan 2024",
          description:
            "Editing digital and print content. Creating a new corporate identity. Building an optimal workflow. Coordinating the design and press release sub-departments.",
        },
        {
          role: "Chief Electronics Officer",
          company: "UJI MOTORSPORT",
          date: "Sep 2022 - Jan 2023",
          description:
            "Coordinating the electronics department. Planning future technologies. Designing and soldering PCBs, building general connections and fixing errors.",
        },
        {
          role: "Co-founder & CEO",
          company: "Reddere",
          date: "Jun 2022 - Jan 2024",
          description:
            "Founding a student rental platform. Creating the business plan and brand identity. Programming the recommendation algorithm, backend and database.",
        },
        {
          role: "Vice President",
          company: "HackerSpace",
          date: "Oct 2022 - Sep 2024",
          description:
            "Managing and organizing events for students. Creating institutional synergies. Designing and building hardware for internal research.",
        },
        {
          role: "Developer",
          company: "UJI MOTORSPORT",
          date: "Sep 2021 - Sep 2022",
          description:
            "Researching IoT technologies and programming microcontrollers. Designing and programming a real-time telemetry plotter.",
        },
      ],
    },
    skills: {
      title: "03. Skills",
      items: [
        {
          title: "Full-Stack Development",
          description:
            "Design and implementation of scalable, optimized solutions for web platforms.",
          tags: SHARED.skillTags[0],
        },
        {
          title: "Languages & Algorithms",
          description:
            "Broad algorithmic foundation and command of multiple structured and object-oriented programming languages.",
          tags: SHARED.skillTags[1],
        },
        {
          title: "Embedded Systems & IoT",
          description:
            "PCB design, IoT architectures and communication across networks of hardware devices.",
          tags: SHARED.skillTags[2],
        },
        {
          title: "Management & Leadership",
          description:
            "Financial strategy, institutional relations, European project management (Erasmus+) and leadership of multidisciplinary teams.",
          tags: SHARED.managementTags.en,
        },
      ],
    },
    projects: {
      title: "04. Projects",
      viewMore: "See more on GitHub",
      items: [
        {
          ...SHARED.projectsMeta[6],
          description:
            "Multilingual corporate website (ES/EN/AR) designed and developed for Nexora Cerámica. A real project delivered to the company: catalogue of tiles, faucets, bathtubs and sinks.",
        },
        {
          ...SHARED.projectsMeta[0],
          description: "Digital ecosystem website for CANVI at Universitat Jaume I.",
        },
        {
          ...SHARED.projectsMeta[1],
          description:
            "Digital ecosystem website for the Consell de l'Estudiantat (Student Council) at UJI.",
        },
        {
          ...SHARED.projectsMeta[2],
          description: "App for crisis communication between two people.",
        },
        {
          ...SHARED.projectsMeta[3],
          description: "Data Acquisition system based on Teensy microcontroller.",
        },
        {
          ...SHARED.projectsMeta[4],
          description:
            "Web app for visualizing telemetry and parameters of a vehicle (Node.js/Express/MQTT/ESP32).",
        },
        {
          ...SHARED.projectsMeta[5],
          description: "AI detecting face/eyes/mouth and another detecting hand and its movements.",
        },
      ],
    },
    representation: {
      title: "05. Representation",
      intro:
        "Active leadership at the university, regional, national and European levels. Driving policy, coordinating teams and defending students' rights at the tables where decisions are made.",
      roles: [
        "President of the Student Council of Universitat Jaume I (CEUJI)",
        "Treasurer of CREUP (Coordinator of Student Representatives of Public Universities)",
        "Member of RITSI and President of the LXI AGO RITSI Organizing Committee",
        "Member of the Student Board — EDUC European Alliance (UJI)",
        "Representative in the CEUNE Plenary, Ministry of Science, Innovation and Universities",
        "Senate member and Governing Council member of Universitat Jaume I",
        "National Ambassador of Universitat Jaume I",
      ],
      stageAlt: "Mohamed speaking at an event",
      podiumAlt: "Mohamed on the podium",
    },
    education: {
      title: "06. Education",
      items: [
        { title: "Computer Science Engineering", subtitle: "Universitat Jaume I (UJI) — Student" },
        { title: "Leadership for future leaders", subtitle: "EDEM Valencia — 2024" },
        { title: "Team management", subtitle: "UFS Academy by Torrecid — 2024" },
        { title: "SantanderX Explorer", subtitle: "Santander Universia — 2024" },
        { title: "CS50's HarvardX", subtitle: "Harvard University — 2020" },
      ],
    },
    achievements: {
      title: "07. Achievements & Talks",
      items: [
        { year: "2024", text: "First Prize Winner, Facsa Hackathon" },
        { year: "2024", text: "Third Prize Winner, OSHWDem A Coruña" },
        { year: "2023", text: "Second Prize, Fundación LAB Hackathon - UJI" },
        { year: "2023", text: "Speaker, eMobility Expo World Congress" },
        { year: "2023", text: "Organizing President, TechnoCharlas ESTCE - UJI" },
        { year: "2023", text: "New technologies teacher, ACAST" },
        { year: "2022", text: "Speaker, ÁgoraJoven (Castellón Youth Council)" },
        { year: "2022", text: "Organizer, DDCT Fair, ESTCE - UJI" },
      ],
    },
    media: {
      title: "08. Media",
      intro:
        "A selection of press and media appearances related to my institutional and representative activity.",
      items: buildMedia(EN_MEDIA_TITLES, ES_MEDIA_TITLES),
    },
    contact: {
      title: "LET'S TALK.",
      intro:
        "Open to new opportunities, collaborative projects or any inquiry about student representation.",
      phoneLabel: "T",
      rights: "All rights reserved.",
      location: "Castellón, Spain",
    },
    scroll: "Scroll",
  },
  va: {
    nav: [
      { href: "#inicio", label: "Inici" },
      { href: "#sobre-mi", label: "Sobre mi" },
      { href: "#experiencia", label: "Experiència" },
      { href: "#capacidades", label: "Capacitats" },
      { href: "#proyectos", label: "Projectes" },
      { href: "#representacion", label: "Representació" },
      { href: "#formacion", label: "Formació" },
      { href: "#medios", label: "Mitjans" },
      { href: "#contacto", label: "Contacte" },
    ],
    langToggleLabel: "Canviar idioma",
    hero: {
      badge: "Castelló, Espanya",
      typed: "Representant Estudiantil i Desenvolupador CS.",
      tagline: "Construint plataformes escalables i liderant el futur universitari.",
      contact: "Contactar",
      downloadCv: "Descarregar CV",
    },
    about: {
      title: "01. Sobre mi",
      stats: [
        { count: 5, suffix: "+", label: "Anys programant" },
        { count: 10, suffix: "+", label: "Càrrecs de representació" },
        { count: 3, suffix: "", label: "Premis i reconeixements" },
        { count: 40, suffix: "+", label: "Aparicions en mitjans" },
      ],
      paragraphs: [
        "Em dic <strong>Mohamed</strong> i aporte solucions innovadores a problemes o reptes al voltant de la programació i en l'àmbit social.",
        "Actualment sóc estudiant d'Enginyeria Informàtica, encara que porte en el sector de la programació més de 5 anys. Vaig ser membre d'UJI Formula Student, de HackerSpace Castelló i diversos projectes universitaris més, dels quals he aprés a desenvolupar la meua creativitat, la productivitat, el treball en equip, habilitats comunicatives i la capacitat d'adaptació.",
        "També sóc representant estudiantil: president del Consell d'Estudiants de la Universitat Jaume I, Tresorer de CREUP, entre molts altres càrrecs on la tecnologia i el lideratge es creuen.",
      ],
      info: [
        { label: "Idiomes", value: "ES, VA, AR, EN" },
        { label: "Ubicació", value: "Castelló" },
        { label: "Perfil", value: "Full-Stack & IoT" },
        { label: "Rol", value: "Líder/Desenvolupador" },
      ],
      photoAlt: "Mohamed Al Howaidi al campus",
    },
    experience: {
      title: "02. Experiència",
      items: [
        {
          role: "Tresorer",
          company: "CREUP",
          date: "Maig 2025 - Maig 2026",
          description:
            "Enfortiment del finançament. Cerca activa de patrocinis. Estratègia pressupostària estable. Optimització de recursos financers. Transparència i control econòmic. Coordinar procediments de comptabilitat i facturació.",
        },
        {
          role: "Vocal de Projectes",
          company: "CREUP",
          date: "Feb 2025 - Nov 2025",
          description:
            "Desenvolupament i consecució de projectes universitaris. Enfortiment del finançament i suport a projectes. Coordinar i presentar projectes Erasmus+ KA1. Fomentar aliances amb altres entitats.",
        },
        {
          role: "President",
          company: "CEUJI",
          date: "Maig 2024 - Actualitat",
          description:
            "Presidir el Consell d'Estudiants. Coordinar el treball institucional i extern. Vetlar pel funcionament intern. Crear el Pla de Treball Anual. Coordinar i dinamitzar els membres. Vetlar pel compliment de la legalitat de la UJI.",
        },
        {
          role: "Tresorer",
          company: "CEUJI",
          date: "Gen 2024 - Maig 2024",
          description:
            "Dissenyar i gestionar el pressupost anual. Crear informes econòmics de cada esdeveniment. Coordinar treball amb el PTGAS adjunt. Crear manuals de gestió pressupostària.",
        },
        {
          role: "Chief Operations Officer",
          company: "UJI MOTORSPORT",
          date: "Gen 2024 - Set 2024",
          description:
            "Buscar finançament mitjançant patrocinadors i organitzacions privades/públiques. Regular el funcionament intern. Mantindre relacions amb patrocinadors i contactes.",
        },
        {
          role: "Chief Marketing & Ops Officer",
          company: "UJI MOTORSPORT",
          date: "Gen 2023 - Gen 2024",
          description:
            "Editar contingut digital i imprés. Crear nova imatge corporativa. Crear flux de treball òptim. Coordinar subdepartaments de disseny i notes de premsa.",
        },
        {
          role: "Chief Electronics Officer",
          company: "UJI MOTORSPORT",
          date: "Set 2022 - Gen 2023",
          description:
            "Coordinar el departament d'electrònica. Planificar futures tecnologies. Dissenyar i soldar PCBs, crear connexions generals i corregir errors.",
        },
        {
          role: "Co-founder & CEO",
          company: "Reddere",
          date: "Jun 2022 - Gen 2024",
          description:
            "Fundar plataforma d'arrendaments estudiantils. Crear pla de negoci i imatge de marca. Programar algoritme de recomanació, backend i base de dades.",
        },
        {
          role: "Vicepresident",
          company: "HackerSpace",
          date: "Oct 2022 - Set 2024",
          description:
            "Gestionar i organitzar esdeveniments per a estudiants. Crear sinergies institucionals. Dissenyar i crear hardware per a investigacions internes.",
        },
        {
          role: "Desenvolupador",
          company: "UJI MOTORSPORT",
          date: "Set 2021 - Set 2022",
          description:
            "Investigar sobre tecnologies IoT i programar microcontroladors. Dissenyar i programar un graficador de telemetria en temps real.",
        },
      ],
    },
    skills: {
      title: "03. Capacitats",
      items: [
        {
          title: "Desenvolupament Full-Stack",
          description:
            "Disseny i implementació de solucions escalables i optimitzades per a plataformes web.",
          tags: SHARED.skillTags[0],
        },
        {
          title: "Llenguatges i Algorítmia",
          description:
            "Àmplia base algorítmica i domini de múltiples llenguatges de programació estructurada i orientada a objectes.",
          tags: SHARED.skillTags[1],
        },
        {
          title: "Sistemes Embeguts i IoT",
          description:
            "Disseny de PCBs, arquitectures IoT i comunicació entre xarxes de dispositius de hardware.",
          tags: SHARED.skillTags[2],
        },
        {
          title: "Gestió i Lideratge",
          description:
            "Estratègia financera, relacions institucionals, gestió de projectes europeus (Erasmus+) i lideratge d'equips multidisciplinaris.",
          tags: SHARED.managementTags.va,
        },
      ],
    },
    projects: {
      title: "04. Projectes",
      viewMore: "Veure més a GitHub",
      items: [
        {
          ...SHARED.projectsMeta[6],
          description:
            "Lloc web corporatiu multilingüe (ES/EN/AR) dissenyat i desenvolupat per a Nexora Cerámica. Treball real entregat a l'empresa: catàleg de rajoles, aixeteria, banyeres i lavabos.",
        },
        {
          ...SHARED.projectsMeta[0],
          description: "Web de l'ecosistema digital de CANVI en la Universitat Jaume I.",
        },
        {
          ...SHARED.projectsMeta[1],
          description:
            "Web de l'ecosistema digital del Consell de l'Estudiantat de la UJI.",
        },
        {
          ...SHARED.projectsMeta[2],
          description: "App per a la comunicació en situacions de crisi entre dues persones.",
        },
        {
          ...SHARED.projectsMeta[3],
          description: "Sistema d'adquisició de dades basat en el microcontrolador Teensy.",
        },
        {
          ...SHARED.projectsMeta[4],
          description:
            "App web per a visualitzar la telemetria i paràmetres d'un vehicle (Node.js/Express/MQTT/ESP32).",
        },
        {
          ...SHARED.projectsMeta[5],
          description:
            "Una IA que detecta cara/ulls/boca i una altra que detecta la mà i els seus moviments.",
        },
      ],
    },
    representation: {
      title: "05. Representació",
      intro:
        "Un lideratge actiu a nivell universitari, autonòmic, nacional i europeu. Impulsant polítiques, coordinant equips i defensant els drets dels estudiants en les taules on es prenen les decisions.",
      roles: [
        "President del Consell d'Estudiants de la Universitat Jaume I (CEUJI)",
        "Tresorer de CREUP (Coordinadora de Representants d'Estudiants d'Universitats Públiques)",
        "Membre de RITSI i President del Comité Organitzador LXI AGO RITSI",
        "Membre de la Student Board — EDUC European Alliance (UJI)",
        "Representant en el Ple del CEUNE, Ministeri de Ciència, Innovació i Universitats",
        "Claustral i Conseller de Govern de la Universitat Jaume I",
        "Ambaixador Nacional de la Universitat Jaume I",
      ],
      stageAlt: "Mohamed parlant en un esdeveniment",
      podiumAlt: "Mohamed al podi",
    },
    education: {
      title: "06. Formació",
      items: [
        { title: "Enginyeria Informàtica", subtitle: "Universitat Jaume I (UJI) — Estudiant" },
        { title: "Lideratge per a futurs líders", subtitle: "EDEM València — 2024" },
        { title: "Gestió d'equips", subtitle: "UFS Academy by Torrecid — 2024" },
        { title: "SantanderX Explorer", subtitle: "Santander Universia — 2024" },
        { title: "CS50's HarvardX", subtitle: "Universitat de Harvard — 2020" },
      ],
    },
    achievements: {
      title: "07. Èxits i Ponències",
      items: [
        { year: "2024", text: "Guanyador del Primer Premi, Hackathon Facsa" },
        { year: "2024", text: "Guanyador Tercer Premi, OSHWDem A Coruña" },
        { year: "2023", text: "Segon Premi, Hackathon Fundació LAB - UJI" },
        { year: "2023", text: "Ponent, eMobility Expo World Congress" },
        { year: "2023", text: "President Organització, TechnoCharlas ESTCE - UJI" },
        { year: "2023", text: "Professor de noves tecnologies, ACAST" },
        { year: "2022", text: "Ponent, ÁgoraJoven (Consell de Joventut de Castelló)" },
        { year: "2022", text: "Organitzador, Fira DDCT, ESTCE - UJI" },
      ],
    },
    media: {
      title: "08. Mitjans",
      intro:
        "Selecció d'aparicions en premsa i mitjans de comunicació en relació amb la meua activitat institucional i representativa.",
      items: buildMedia(VA_MEDIA_TITLES, ES_MEDIA_TITLES),
    },
    contact: {
      title: "PARLEM.",
      intro:
        "Obert a noves oportunitats, projectes col·laboratius o qualsevol consulta sobre representació estudiantil.",
      phoneLabel: "T",
      rights: "Tots els drets reservats.",
      location: "Castelló, Espanya",
    },
    scroll: "Scroll",
  },
  ar: {
    nav: [
      { href: "#inicio", label: "الرئيسية" },
      { href: "#sobre-mi", label: "نبذة عني" },
      { href: "#experiencia", label: "الخبرة" },
      { href: "#capacidades", label: "المهارات" },
      { href: "#proyectos", label: "المشاريع" },
      { href: "#representacion", label: "التمثيل" },
      { href: "#formacion", label: "التعليم" },
      { href: "#medios", label: "الإعلام" },
      { href: "#contacto", label: "التواصل" },
    ],
    langToggleLabel: "تغيير اللغة",
    hero: {
      badge: "كاستيون، إسبانيا",
      typed: "ممثل طلابي ومطوّر علوم حاسوب.",
      tagline: "بناء منصات قابلة للتوسع وقيادة مستقبل الجامعة.",
      contact: "تواصل معي",
      downloadCv: "تحميل السيرة الذاتية",
    },
    about: {
      title: "01. نبذة عني",
      stats: [
        { count: 5, suffix: "+", label: "سنوات في البرمجة" },
        { count: 10, suffix: "+", label: "مناصب تمثيلية" },
        { count: 3, suffix: "", label: "جوائز وتكريمات" },
        { count: 40, suffix: "+", label: "ظهور إعلامي" },
      ],
      paragraphs: [
        "اسمي <strong>محمد</strong> وأقدّم حلولًا مبتكرة للمشكلات والتحديات في مجال البرمجة وفي المجال الاجتماعي.",
        "أنا حاليًا طالب في هندسة علوم الحاسوب، رغم أنني أعمل في مجال البرمجة منذ أكثر من 5 سنوات. كنت عضوًا في UJI Formula Student وفي HackerSpace Castellón والعديد من المشاريع الجامعية الأخرى، التي تعلّمت من خلالها تنمية إبداعي وإنتاجيتي والعمل الجماعي ومهارات التواصل والقدرة على التكيّف.",
        "أنا أيضًا ممثل طلابي: رئيس مجلس طلاب جامعة Jaume I، وأمين صندوق CREUP، إلى جانب العديد من المناصب الأخرى حيث تلتقي التكنولوجيا والقيادة.",
      ],
      info: [
        { label: "اللغات", value: "ES, VA, AR, EN" },
        { label: "الموقع", value: "كاستيون" },
        { label: "الملف", value: "Full-Stack & IoT" },
        { label: "الدور", value: "قائد/مطوّر" },
      ],
      photoAlt: "محمد الهويدي في الحرم الجامعي",
    },
    experience: {
      title: "02. الخبرة",
      items: [
        {
          role: "أمين الصندوق",
          company: "CREUP",
          date: "مايو 2025 - مايو 2026",
          description:
            "تعزيز التمويل. البحث النشط عن الرعاة. استراتيجية ميزانية مستقرة. تحسين الموارد المالية. الشفافية والرقابة الاقتصادية. تنسيق إجراءات المحاسبة والفوترة.",
        },
        {
          role: "مسؤول المشاريع",
          company: "CREUP",
          date: "فبراير 2025 - نوفمبر 2025",
          description:
            "تطوير وإنجاز المشاريع الجامعية. تعزيز التمويل ودعم المشاريع. تنسيق وعرض مشاريع Erasmus+ KA1. تعزيز الشراكات مع كيانات أخرى.",
        },
        {
          role: "الرئيس",
          company: "CEUJI",
          date: "مايو 2024 - حتى الآن",
          description:
            "رئاسة مجلس الطلاب. تنسيق العمل المؤسسي والخارجي. الإشراف على العمليات الداخلية. وضع خطة العمل السنوية. تنسيق الأعضاء وتحفيزهم. ضمان الامتثال للوائح جامعة UJI.",
        },
        {
          role: "أمين الصندوق",
          company: "CEUJI",
          date: "يناير 2024 - مايو 2024",
          description:
            "تصميم وإدارة الميزانية السنوية. إعداد التقارير المالية لكل فعالية. تنسيق العمل مع موظف PTGAS المختص. إعداد أدلة إدارة الميزانية.",
        },
        {
          role: "المدير التنفيذي للعمليات",
          company: "UJI MOTORSPORT",
          date: "يناير 2024 - سبتمبر 2024",
          description:
            "البحث عن التمويل عبر الرعاة والمؤسسات الخاصة/العامة. تنظيم العمليات الداخلية. الحفاظ على العلاقات مع الرعاة وجهات الاتصال.",
        },
        {
          role: "المدير التنفيذي للتسويق والعمليات",
          company: "UJI MOTORSPORT",
          date: "يناير 2023 - يناير 2024",
          description:
            "تحرير المحتوى الرقمي والمطبوع. إنشاء هوية مؤسسية جديدة. بناء سير عمل مثالي. تنسيق قسمي التصميم والبيانات الصحفية.",
        },
        {
          role: "المدير التنفيذي للإلكترونيات",
          company: "UJI MOTORSPORT",
          date: "سبتمبر 2022 - يناير 2023",
          description:
            "تنسيق قسم الإلكترونيات. التخطيط للتقنيات المستقبلية. تصميم ولحام لوحات PCB، وإنشاء التوصيلات العامة وتصحيح الأخطاء.",
        },
        {
          role: "شريك مؤسس ورئيس تنفيذي",
          company: "Reddere",
          date: "يونيو 2022 - يناير 2024",
          description:
            "تأسيس منصة لتأجير سكن الطلاب. إعداد خطة العمل والهوية التجارية. برمجة خوارزمية التوصية والواجهة الخلفية وقاعدة البيانات.",
        },
        {
          role: "نائب الرئيس",
          company: "HackerSpace",
          date: "أكتوبر 2022 - سبتمبر 2024",
          description:
            "إدارة وتنظيم فعاليات للطلاب. خلق تآزر مؤسسي. تصميم وبناء أجهزة للأبحاث الداخلية.",
        },
        {
          role: "مطوّر",
          company: "UJI MOTORSPORT",
          date: "سبتمبر 2021 - سبتمبر 2022",
          description:
            "البحث في تقنيات إنترنت الأشياء وبرمجة المتحكمات الدقيقة. تصميم وبرمجة راسم تيليمتري في الوقت الفعلي.",
        },
      ],
    },
    skills: {
      title: "03. المهارات",
      items: [
        {
          title: "تطوير Full-Stack",
          description:
            "تصميم وتنفيذ حلول قابلة للتوسع ومُحسَّنة لمنصات الويب.",
          tags: SHARED.skillTags[0],
        },
        {
          title: "لغات البرمجة والخوارزميات",
          description:
            "أساس خوارزمي واسع وإتقان للعديد من لغات البرمجة المهيكلة والكائنية التوجه.",
          tags: SHARED.skillTags[1],
        },
        {
          title: "الأنظمة المدمجة وإنترنت الأشياء",
          description:
            "تصميم لوحات PCB وبُنى إنترنت الأشياء والتواصل بين شبكات الأجهزة.",
          tags: SHARED.skillTags[2],
        },
        {
          title: "الإدارة والقيادة",
          description:
            "الاستراتيجية المالية والعلاقات المؤسسية وإدارة المشاريع الأوروبية (Erasmus+) وقيادة فرق متعددة التخصصات.",
          tags: SHARED.managementTags.ar,
        },
      ],
    },
    projects: {
      title: "04. المشاريع",
      viewMore: "المزيد على GitHub",
      items: [
        {
          ...SHARED.projectsMeta[6],
          description:
            "موقع شركة متعدد اللغات (ES/EN/AR) صُمم وطُوّر لصالح Nexora Cerámica. عمل حقيقي سُلّم للشركة: كتالوج بلاط وحنفيات وأحواض استحمام ومغاسل.",
        },
        {
          ...SHARED.projectsMeta[0],
          description: "موقع المنظومة الرقمية لـ CANVI في جامعة Jaume I.",
        },
        {
          ...SHARED.projectsMeta[1],
          description:
            "موقع المنظومة الرقمية لمجلس طلاب جامعة UJI.",
        },
        {
          ...SHARED.projectsMeta[2],
          description: "تطبيق للتواصل في حالات الأزمات بين شخصين.",
        },
        {
          ...SHARED.projectsMeta[3],
          description: "نظام لاكتساب البيانات قائم على المتحكم الدقيق Teensy.",
        },
        {
          ...SHARED.projectsMeta[4],
          description:
            "تطبيق ويب لعرض القياسات عن بُعد ومعطيات مركبة (Node.js/Express/MQTT/ESP32).",
        },
        {
          ...SHARED.projectsMeta[5],
          description:
            "ذكاء اصطناعي يكتشف الوجه/العينين/الفم وآخر يكتشف اليد وحركاتها.",
        },
      ],
    },
    representation: {
      title: "05. التمثيل",
      intro:
        "قيادة فاعلة على المستوى الجامعي والإقليمي والوطني والأوروبي. دفع السياسات وتنسيق الفرق والدفاع عن حقوق الطلاب على الطاولات التي تُتخذ فيها القرارات.",
      roles: [
        "رئيس مجلس طلاب جامعة Jaume I (CEUJI)",
        "أمين صندوق CREUP (هيئة تنسيق ممثلي طلاب الجامعات العامة)",
        "عضو في RITSI ورئيس اللجنة المنظمة LXI AGO RITSI",
        "عضو في مجلس الطلاب — تحالف EDUC الأوروبي (UJI)",
        "ممثل في الجلسة العامة لـ CEUNE، وزارة العلوم والابتكار والجامعات",
        "عضو الكلاستر ومستشار حكومة جامعة Jaume I",
        "سفير وطني لجامعة Jaume I",
      ],
      stageAlt: "محمد يتحدث في فعالية",
      podiumAlt: "محمد على المنصة",
    },
    education: {
      title: "06. التعليم",
      items: [
        { title: "هندسة علوم الحاسوب", subtitle: "جامعة Jaume I (UJI) — طالب" },
        { title: "القيادة لقادة المستقبل", subtitle: "EDEM فالنسيا — 2024" },
        { title: "إدارة الفرق", subtitle: "UFS Academy by Torrecid — 2024" },
        { title: "SantanderX Explorer", subtitle: "Santander Universia — 2024" },
        { title: "CS50's HarvardX", subtitle: "جامعة هارفارد — 2020" },
      ],
    },
    achievements: {
      title: "07. الإنجازات والمحاضرات",
      items: [
        { year: "2024", text: "الفائز بالجائزة الأولى، هاكاثون Facsa" },
        { year: "2024", text: "الفائز بالجائزة الثالثة، OSHWDem A Coruña" },
        { year: "2023", text: "الجائزة الثانية، هاكاثون مؤسسة LAB - UJI" },
        { year: "2023", text: "متحدث، eMobility Expo World Congress" },
        { year: "2023", text: "رئيس التنظيم، TechnoCharlas ESTCE - UJI" },
        { year: "2023", text: "مدرّس التقنيات الحديثة، ACAST" },
        { year: "2022", text: "متحدث، ÁgoraJoven (مجلس شباب كاستيون)" },
        { year: "2022", text: "منظم، معرض DDCT، ESTCE - UJI" },
      ],
    },
    media: {
      title: "08. الإعلام",
      intro:
        "مجموعة مختارة من الظهور في الصحافة ووسائل الإعلام المتعلقة بنشاطي المؤسسي والتمثيلي.",
      items: buildMedia(AR_MEDIA_TITLES, ES_MEDIA_TITLES),
    },
    contact: {
      title: "لنتحدث.",
      intro:
        "منفتح على الفرص الجديدة والمشاريع التعاونية أو أي استفسار حول التمثيل الطلابي.",
      phoneLabel: "هاتف",
      rights: "جميع الحقوق محفوظة.",
      location: "كاستيون، إسبانيا",
    },
    scroll: "Scroll",
  },
};

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: Dict;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function matchLang(code: string): Lang | null {
  const c = code.toLowerCase();
  if (c.startsWith("ar")) return "ar";
  // Valencian shares its code family with Catalan (ca / ca-ES-valencia).
  if (c.startsWith("va") || c.startsWith("ca")) return "va";
  if (c.startsWith("en")) return "en";
  if (c.startsWith("es")) return "es";
  return null;
}

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "es";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGS.includes(stored as Lang)) return stored as Lang;

  const browserLangs =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];

  // Honour the visitor's most preferred supported language first.
  for (const l of browserLangs) {
    const matched = l ? matchLang(l) : null;
    if (matched) return matched;
  }

  // Clean fallback chain: preferred lang -> EN -> ES.
  if (browserLangs.some((l) => l?.toLowerCase().startsWith("en"))) return "en";
  return "es";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (next: Lang) => setLangState(next);
  const toggleLang = () =>
    setLangState((prev) => {
      const idx = SUPPORTED_LANGS.indexOf(prev);
      return SUPPORTED_LANGS[(idx + 1) % SUPPORTED_LANGS.length];
    });

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
