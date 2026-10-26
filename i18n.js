(() => {
  const STORAGE_KEY = "gemrift-lang";
  const FALLBACK = "en";
  let languages = [];
  let strings = {};
  let english = {};

  window.gemriftT = (key, fallback) => strings[key] ?? english[key] ?? fallback ?? key;

  const fetchJson = (url) =>
    fetch(url).then((r) => {
      if (!r.ok) throw new Error(url);
      return r.json();
    });

  function match(code) {
    if (!code) return null;
    const lower = code.toLowerCase();
    const exact = languages.find((l) => l.code.toLowerCase() === lower);
    if (exact) return exact.code;
    const base = lower.split("-")[0];
    if (base === "no") return "nb";
    if (base === "zh") return "zh-CN";
    const same = languages.find((l) => l.code.toLowerCase() === base);
    return same ? same.code : null;
  }

  function pickLanguage() {
    const param = new URLSearchParams(location.search).get("lang");
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    for (const c of [param, saved, ...(navigator.languages || [navigator.language])]) {
      const m = match(c);
      if (m) return m;
    }
    return FALLBACK;
  }

  function apply(code) {
    const lang = languages.find((l) => l.code === code) || languages[0];
    document.documentElement.lang = lang.code;
    document.documentElement.dir = lang.rtl ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = strings[el.dataset.i18n] ?? english[el.dataset.i18n];
      if (v !== undefined) el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(",").forEach((pair) => {
        const [attr, key] = pair.split(":");
        const v = strings[key] ?? english[key];
        if (attr && v !== undefined) el.setAttribute(attr, v);
      });
    });
    const select = document.getElementById("lang-select");
    if (select) {
      select.value = lang.code;
      select.setAttribute("aria-label", window.gemriftT("ui.language", "Language"));
    }
    document.dispatchEvent(new CustomEvent("gemrift:lang", { detail: lang.code }));
  }

  async function setLanguage(code, persist) {
    try {
      strings = code === FALLBACK ? english : await fetchJson(`i18n/${code}.json`);
    } catch (e) {
      strings = english;
    }
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, code); } catch (err) { /* ignore */ }
    }
    apply(code);
  }

  async function init() {
    try {
      [languages, english] = await Promise.all([fetchJson("languages.json"), fetchJson("i18n/en.json")]);
    } catch (e) {
      return;
    }
    const select = document.getElementById("lang-select");
    if (select) {
      languages.forEach((l) => {
        const o = document.createElement("option");
        o.value = l.code;
        o.textContent = l.name;
        select.appendChild(o);
      });
      select.addEventListener("change", () => setLanguage(select.value, true));
    }
    const initial = pickLanguage();
    if (initial === FALLBACK) {
      strings = english;
      if (select) select.value = FALLBACK;
      document.dispatchEvent(new CustomEvent("gemrift:lang", { detail: FALLBACK }));
    } else {
      await setLanguage(initial, false);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
