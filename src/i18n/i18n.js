import translations from "./translations";

// Looks up a dot-path key (e.g. "stats.rows.totalDistance") inside a nested
// object. Returns undefined if any segment along the path is missing.
function lookup(obj, path) {
  return path.split(".").reduce((node, key) => (node == null ? undefined : node[key]), obj);
}

// Replaces {name} / {n} / {s} placeholders in a translated string with
// values from `vars`. Unknown placeholders are left as-is rather than
// throwing, so a missing var never crashes a screen.
function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
}

// Returns a bound translator: t("menu.play") -> "ΞΕΚΙΝΑ ΠΑΡΑΔΟΣΗ" (or the
// English equivalent depending on `lang`). Falls back to the Greek string
// if the key is missing in the requested language, and to the raw key
// itself (never crashes, never renders "undefined") if it's missing
// everywhere — that fallback chain means a typo'd key just shows up as
// visible mismatched text instead of breaking the screen.
export function getTranslator(lang) {
  const dict = translations[lang] || translations.el;
  return function t(key, vars) {
    const value = lookup(dict, key) ?? lookup(translations.el, key);
    if (value == null) return key;
    if (typeof value === "string") return interpolate(value, vars);
    return value; // arrays/objects (e.g. tutorial.steps) are returned as-is
  };
}

export const SUPPORTED_LANGUAGES = ["el", "en"];
