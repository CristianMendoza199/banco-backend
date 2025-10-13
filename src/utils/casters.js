function toStr(v, opts = {}) {
  const { trim = true, lower = false } = opts;
  let s = v == null ? '' : String(v);
  if (trim) s = s.trim();
  if (lower) s = s.toLowerCase();
  return s;
}

/**
 * Convierte a int estricto: sólo acepta dígitos (y signo).
 * Retorna NaN si no es un entero válido.
 */
function toInt(v) {
  const s = toStr(v);
  if (!/^[-+]?\d+$/.test(s)) return NaN;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Convierte a número (float) estricto.
 * Acepta "12.34" o "-5", NO acepta basura como "12abc".
 * Opcional: { allowComma=true } -> convierte "12,34" -> "12.34"
 */
function toNum(v, opts = {}) {
  const { allowComma = true } = opts;
  let s = toStr(v);
  if (allowComma) s = s.replace(',', '.');
  if (!/^[-+]?\d+(\.\d+)?$/.test(s)) return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Convierte a booleano "humano":
 * true: true, 'true', '1', 1, 'yes', 'y', 'on'
 * false: false, 'false', '0', 0, 'no', 'n', 'off'
 * si no reconoce -> null (para que el controller decida)
 */
function toBool(v) {
  const s = toStr(v, { lower: true });
  if (['true','1','yes','y','on'].includes(s) || v === 1 || v === true) return true;
  if (['false','0','no','n','off'].includes(s) || v === 0 || v === false) return false;
  return null;
}

module.exports = { toStr, toInt, toNum, toBool };