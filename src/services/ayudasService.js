const boeClient = require('../clients/boeClient');
const cache = require('../utils/cache');

function fechaAParam(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function parseMontoFromText(texto) {
  if (!texto) return null;
  const normalized = String(texto).replace(/\./g, '').replace(',', '.');
  const matches = normalized.match(/(\d{1,3}(?:\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)\s*(€|euros?)/gi);
  if (!matches || !matches.length) return null;

  let maxValue = null;
  matches.forEach(raw => {
    const valueMatch = raw.match(/\d+(?:\.\d+)?/);
    if (!valueMatch) return;
    const value = parseFloat(valueMatch[0]);
    if (Number.isNaN(value)) return;
    if (maxValue == null || value > maxValue) maxValue = value;
  });
  return maxValue;
}

/**
 * Recorre RECURSIVAMENTE cualquier objeto JS (resultado de parsear el XML)
 * y extrae todos los nodos que parecen disposiciones del BOE.
 * Esto hace el parser inmune a cambios en la estructura del XML.
 */
function extraerDisposicionesRecursivo(obj, resultado = [], ancestors = []) {
  if (!obj || typeof obj !== 'object') return resultado;

  // Un nodo es una disposición si tiene algún identificador que cumpla el patrón BOE-...
  const attrs = obj.$ || {};
  const id =
    attrs.id ||
    attrs.ID ||
    obj.ID ||
    obj.identificador ||
    obj.identificador?._ ||
    '';

  if (id && /^BOE-[A-Z]-\d{4}-\d+$/i.test(id)) {
    // Guardamos también un poco de contexto (últimas claves) para ayudar a la normalización
    const copia = Object.assign({}, obj);
    if (ancestors && ancestors.length) copia._ancestors = ancestors.slice(-3);
    resultado.push(copia);
    return resultado; // no seguir dentro de una disposición
  }

  // Recorrer todas las claves del objeto
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (Array.isArray(val)) {
      val.forEach(item => extraerDisposicionesRecursivo(item, resultado, ancestors.concat(key)));
    } else if (typeof val === 'object' && val !== null) {
      extraerDisposicionesRecursivo(val, resultado, ancestors.concat(key));
    }
  }

  return resultado;
}

/**
 * Intenta extraer el nombre de departamento/sección subiendo en el árbol.
 * Como trabajamos de forma recursiva, lo inferimos del propio nodo.
 */
function normalizarDisposicion(item) {
  const attrs = item.$ || {};
  const id =
    item.identificador ||
    attrs.id ||
    attrs.ID ||
    item.ID ||
    '';

  // El título puede venir en minúsculas desde el JSON del sumario
  const titulo =
    (typeof item.titulo === 'string' ? item.titulo : item.titulo?._) ||
    (typeof item.TIT === 'string' ? item.TIT : item.TIT?._) ||
    (typeof item.TITULO === 'string' ? item.TITULO : item.TITULO?._) ||
    attrs.titulo ||
    attrs.TITULO ||
    'Sin título';

  const descripcion =
    (typeof item.descripcion === 'string' ? item.descripcion : item.descripcion?._) ||
    (typeof item.DESCRIPCION === 'string' ? item.DESCRIPCION : item.DESCRIPCION?._) ||
    (typeof item.TEXTO === 'string' ? item.TEXTO : item.TEXTO?._) ||
    '';

  const tipo = attrs.tipodoc || attrs.TIPODOC || item.TIPODOC || item.tipo || 'Disposición';

  const departamento =
    item.departamento ||
    item.DEPARTAMENTO ||
    attrs.emisor ||
    attrs.EMISOR ||
    item.EMISOR ||
    '';

  const seccion =
    item.seccion || item.SECCION || attrs.secc || attrs.SECC || item.SECC || '';

  const url =
    item.url_html || item.url_xml || item.url || item.URL ||
    (item.url_pdf && (item.url_pdf.texto || item.url_pdf.text)) ||
    (id ? `https://www.boe.es/diario_boe/txt.php?id=${id}` : '');

  const monto = parseMontoFromText(`${titulo} ${descripcion}`);

  return { id, titulo, descripcion, tipo, departamento, seccion, url, fecha: '', monto };
}

const KEYWORDS_AYUDAS = [
  'ayuda', 'subvención', 'subvenciones', 'subvencion',
  'beca', 'becas', 'financiación', 'financiacion',
  'convocatoria', 'prestación', 'prestacion',
  'incentivo', 'incentivos', 'concesión', 'concesion',
  'resolución de concesión', 'bases reguladoras',
  'apoyo económico', 'fondo', 'dotación'
];

function esAyuda(d) {
  const texto = `${d.titulo} ${d.descripcion}`.toLowerCase();
  return KEYWORDS_AYUDAS.some(kw => texto.includes(kw));
}

class AyudasService {
  async buscarAyudas(criterios, diasAtras = 7) {
    const cacheKey = `buscar_${JSON.stringify(criterios)}_${diasAtras}`;
    const cached = cache.get(cacheKey);
    if (cached) { console.log('[Cache] Hit'); return cached; }

    const keyword = (criterios.q || '').toLowerCase();
    const todasLasAyudas = [];
    let diasConDatos = 0;

    for (let i = 0; i < diasAtras; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const param = fechaAParam(fecha);

      try {
        console.log(`[BOE] Consultando sumario ${param}...`);
        const sumario = await boeClient.get(`/boe/sumario/${param}`);

        // Log de la estructura recibida para depuración
        console.log(`[BOE] Claves raíz del sumario ${param}:`, Object.keys(sumario || {}));

        const disposiciones = extraerDisposicionesRecursivo(sumario);
        console.log(`[BOE] ${param}: ${disposiciones.length} disposiciones encontradas`);

        if (disposiciones.length > 0) diasConDatos++;

        const ayudas = disposiciones.map(normalizarDisposicion).filter(esAyuda);
        console.log(`[BOE] ${param}: ${ayudas.length} ayudas/subvenciones`);
        todasLasAyudas.push(...ayudas);

      } catch (e) {
        console.log(`[BOE] ${param}: sin publicación (${e.message})`);
      }
    }

    console.log(`[BOE] Total: ${todasLasAyudas.length} ayudas en ${diasConDatos} días con datos`);

    let resultado = keyword
      ? todasLasAyudas.filter(a =>
          `${a.titulo} ${a.descripcion} ${a.departamento}`.toLowerCase().includes(keyword))
      : todasLasAyudas;

    // Eliminar duplicados por id
    const vistos = new Set();
    resultado = resultado.filter(a => {
      if (!a.id || vistos.has(a.id)) return false;
      vistos.add(a.id);
      return true;
    });

    cache.set(cacheKey, resultado, 30 * 60 * 1000);
    return resultado;
  }

  async obtenerDetalle(id) {
    const cacheKey = `detalle_${id}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    const data = await boeClient.get(`/boe/documento/${id}`);
    cache.set(cacheKey, data);
    return data;
  }

  async obtenerSumario(fecha = new Date()) {
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const param = fechaAParam(fechaObj);
    const cacheKey = `sumario_${param}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    const data = await boeClient.get(`/boe/sumario/${param}`);
    const disposiciones = extraerDisposicionesRecursivo(data).map(normalizarDisposicion);
    cache.set(cacheKey, disposiciones, 60 * 60 * 1000);
    return disposiciones;
  }

  // Endpoint de diagnóstico: devuelve el XML crudo parseado para inspección
  async rawSumario(fechaParam) {
    return boeClient.get(`/boe/sumario/${fechaParam}`);
  }
}

module.exports = new AyudasService();
