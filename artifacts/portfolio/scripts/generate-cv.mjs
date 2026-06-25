import PDFDocument from "pdfkit";
import { createWriteStream, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, "../public/cv-mohamed-al-howaidi.pdf");
mkdirSync(dirname(outPath), { recursive: true });

const ACCENT = "#00b3bf";
const DARK = "#111418";
const MUTED = "#555b66";

const doc = new PDFDocument({ size: "A4", margin: 48 });
doc.pipe(createWriteStream(outPath));

const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
const left = doc.page.margins.left;

function heading(text) {
  if (doc.y > doc.page.height - 120) doc.addPage();
  doc.moveDown(0.6);
  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(12).text(text.toUpperCase(), { characterSpacing: 1 });
  const y = doc.y + 2;
  doc.moveTo(left, y).lineTo(left + pageWidth, y).strokeColor(ACCENT).lineWidth(1).stroke();
  doc.moveDown(0.5);
}

function entry(title, meta, lines) {
  if (doc.y > doc.page.height - 110) doc.addPage();
  doc.fillColor(DARK).font("Helvetica-Bold").fontSize(10.5).text(title, { continued: false });
  if (meta) doc.fillColor(MUTED).font("Helvetica-Oblique").fontSize(9).text(meta);
  if (lines) {
    doc.fillColor("#33383f").font("Helvetica").fontSize(9);
    for (const l of [].concat(lines)) doc.text(l, { indent: 0 });
  }
  doc.moveDown(0.45);
}

// Header
doc.fillColor(DARK).font("Helvetica-Bold").fontSize(26).text("Mohamed Al Howaidi");
doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(11).text("Representante Estudiantil  ·  Desarrollador Full-Stack & IoT");
doc.fillColor(MUTED).font("Helvetica").fontSize(9).text(
  "Castellón, España  ·  al415657@uji.es  ·  +34 648 49 29 35  ·  linkedin.com/in/mohamedalhowaidi  ·  github.com/muya03"
);

heading("Perfil");
doc.fillColor("#33383f").font("Helvetica").fontSize(9.5).text(
  "Estudiante de Ingeniería Informática en la Universitat Jaume I con más de 5 años de experiencia en programación. " +
  "Aporto soluciones innovadoras combinando desarrollo full-stack, sistemas embebidos e IoT con un fuerte liderazgo " +
  "en representación estudiantil a nivel universitario, autonómico, nacional y europeo.",
  { align: "justify" }
);

heading("Experiencia");
const exp = [
  ["Tesorero — CREUP", "Mayo 2025 – Mayo 2026", "Estrategia presupuestaria estable, búsqueda de patrocinios, transparencia y control económico, y coordinación de contabilidad y facturación."],
  ["Vocal de Proyectos — CREUP", "Feb 2025 – Nov 2025", "Desarrollo de proyectos universitarios y coordinación de proyectos Erasmus+ KA1; fomento de alianzas con otras entidades."],
  ["Presidente — CEUJI", "Mayo 2024 – Actualidad", "Presidencia del Consejo de Estudiantes de la UJI: coordinación institucional, Plan de Trabajo Anual y cumplimiento de la legalidad."],
  ["Tesorero — CEUJI", "Ene 2024 – Mayo 2024", "Diseño y gestión del presupuesto anual, informes económicos por evento y manuales de gestión presupuestaria."],
  ["Chief Operations Officer — UJI Motorsport", "Ene 2024 – Sep 2024", "Búsqueda de financiación, regulación del funcionamiento interno y relaciones con patrocinadores."],
  ["Chief Marketing & Ops Officer — UJI Motorsport", "Ene 2023 – Ene 2024", "Nueva imagen corporativa, contenido digital e impreso y coordinación de los sub-departamentos de diseño."],
  ["Chief Electronics Officer — UJI Motorsport", "Sep 2022 – Ene 2023", "Coordinación del departamento de electrónica; diseño y soldadura de PCBs y conexiones."],
  ["Co-founder & CEO — Reddere", "Jun 2022 – Ene 2024", "Plataforma de arrendamientos estudiantiles: plan de negocio, algoritmo de recomendación, backend y base de datos."],
  ["Vicepresidente — HackerSpace Castellón", "Oct 2022 – Sep 2024", "Organización de eventos para estudiantes, sinergias institucionales y diseño de hardware para investigación."],
  ["Desarrollador — UJI Motorsport", "Sep 2021 – Sep 2022", "Tecnologías IoT, microcontroladores y graficador de telemetría en tiempo real."],
];
for (const [t, m, d] of exp) entry(t, m, d);

heading("Representación Estudiantil");
const rep = [
  "Presidente del Consejo de Estudiantes de la Universitat Jaume I (CEUJI)",
  "Tesorero de CREUP (Coordinadora de Representantes de Estudiantes de Universidades Públicas)",
  "Miembro de RITSI y Presidente del Comité Organizador LXI AGO RITSI",
  "Miembro de la Student Board — EDUC European Alliance (UJI)",
  "Representante en el Pleno del CEUNE, Ministerio de Ciencia, Innovación y Universidades",
  "Claustral y Consejero de Gobierno de la Universitat Jaume I",
  "Embajador Nacional de la Universitat Jaume I",
];
doc.fillColor("#33383f").font("Helvetica").fontSize(9.5);
for (const r of rep) doc.text("•  " + r);

heading("Capacidades Técnicas");
entry("Desarrollo Full-Stack", null, "Node.js · Express.js · React · Vite · TailwindCSS");
entry("Lenguajes & Algoritmia", null, "Python · Java · C++ · JavaScript · TypeScript");
entry("Sistemas Embebidos e IoT", null, "MQTT · ESP-NOW · LoRa · Bus CAN · Diseño de PCBs");
entry("Gestión & Liderazgo", null, "Management · Erasmus+ · Finanzas · Operaciones");

heading("Formación");
entry("Ingeniería Informática — Universitat Jaume I (UJI)", "En curso");
entry("Liderazgo para futuros líderes — EDEM Valencia", "2024");
entry("Gestión de equipos — UFS Academy by Torrecid", "2024");
entry("SantanderX Explorer — Santander Universia", "2024");
entry("CS50's — HarvardX (Universidad de Harvard)", "2020");

heading("Logros y Ponencias");
const ach = [
  "2024 · Primer Premio, Hackathon Facsa",
  "2024 · Tercer Premio, OSHWDem A Coruña",
  "2023 · Segundo Premio, Hackathon Fundación LAB – UJI",
  "2023 · Ponente, eMobility Expo World Congress",
  "2023 · Presidente de Organización, TechnoCharlas ESTCE – UJI",
  "2022 · Ponente, ÁgoraJoven (Consejo de Juventud de Castellón)",
];
doc.fillColor("#33383f").font("Helvetica").fontSize(9.5);
for (const a of ach) doc.text("•  " + a);

heading("Idiomas");
doc.fillColor("#33383f").font("Helvetica").fontSize(9.5).text("Español · Valenciano · Árabe · Inglés");

doc.end();
console.log("CV generated at", outPath);
