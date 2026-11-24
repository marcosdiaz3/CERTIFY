// Funciones compartidas por las 3 vistas
// Requiere cargar antes: supabase-js (CDN) y js/config.js
const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const MINUSCULAS = ["de","en","y","la","el","del","los","las","e","a"];
const $ = id => document.getElementById(id);

// Cliente de Supabase
const db = supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);

const titulo = s => s.trim().toLowerCase().split(/\s+/)
  .map((w, i) => (i > 0 && MINUSCULAS.includes(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

// Escapa HTML: los datos vienen del usuario y se insertan con innerHTML
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const fechaLarga = iso => { const [y, m, d] = iso.split("-").map(Number); return `${d} de ${MESES[m - 1]} de ${y}`; };
const puntosDNI = dni => dni.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// El id del registro viaja por la URL (?id=...)
const idURL = () => new URLSearchParams(location.search).get("id");

const nuevoId = () => (window.crypto && crypto.randomUUID)
  ? crypto.randomUUID()
  : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 3 | 8)).toString(16);
    });

// Devuelve la constancia (o null si no existe)
async function cargarConstancia(id) {
  if (!id) return null;
  const { data, error } = await db.rpc("obtener_constancia", { p_id: id });
  if (error) throw error;
  return (data && data[0]) || null;
}

const FIRMA_EJEMPLO = `<svg viewBox="0 0 200 60" width="170" height="52" role="img" aria-label="Firma del rector" fill="none" stroke="#1a2d6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(-4deg)"><path d="M10 40 C12 18 20 8 24 16 C27 26 18 46 8 48"/><path d="M28 38 C34 28 38 28 40 36 C42 44 46 28 50 30 C54 32 52 42 58 36 C62 30 66 30 68 38"/><path d="M76 44 C78 26 80 14 90 14 C102 14 100 30 88 32 C84 33 80 32 78 31"/><path d="M92 36 C100 30 108 36 114 32 C122 28 128 38 140 30 C150 24 160 34 174 26"/><path d="M6 52 C50 46 110 56 180 44 C190 42 194 40 196 38" stroke-width="1.6"/></svg>`;

// Dibuja el certificado dentro de un contenedor
function pintarCertificado(el, d, conSelloPagado) {
  const firma = CONFIG.firmaRector ? `<img src="${CONFIG.firmaRector}" alt="Firma del rector">` : FIRMA_EJEMPLO;
  el.innerHTML = `
    ${conSelloPagado ? '<div class="pagado">PAGADO</div>' : ""}
    <div class="cabecera"><div class="inst">${CONFIG.institucion}</div><div class="sub">${CONFIG.subtitulo}</div></div>
    <h1 class="titulo-cert">CONSTANCIA DE ALUMNO REGULAR</h1>
    <p class="texto">Se deja constancia de que <b>${esc(titulo(d.nombre))} ${esc(titulo(d.apellido))}</b>,
      DNI N.º <b>${esc(puntosDNI(d.dni))}</b>, es alumno/a regular de la carrera <b>${esc(titulo(d.carrera))}</b>
      de esta institución, cumpliendo con los requisitos de regularidad establecidos.</p>
    <p class="texto">Se extiende la presente a solicitud del/de la interesado/a, para ser presentada ante quien corresponda.</p>
    <p class="texto sin-sangria">${CONFIG.ciudad}, <b>${esc(fechaLarga(d.fecha))}</b>.</p>
    <div class="pie">
      <div class="sello">Sello de la institución</div>
      <div class="firma"><div class="espacio"></div>Firma y aclaración<br>Secretaría Académica</div>
      <div class="firma"><div class="espacio">${firma}</div><b>${CONFIG.rector}</b><br>Rector</div>
    </div>`;
}