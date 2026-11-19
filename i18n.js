(() => {
  const STORAGE_KEY = "gemrift-lang";
  const FALLBACK = "en";
  const OG_LOCALES = {
    en: "en_US", tr: "tr_TR", de: "de_DE", fr: "fr_FR", es: "es_ES",
    it: "it_IT", pt: "pt_PT", "pt-BR": "pt_BR", nl: "nl_NL", sv: "sv_SE",
    da: "da_DK", nb: "nb_NO", fi: "fi_FI", pl: "pl_PL", cs: "cs_CZ",
    sk: "sk_SK", hu: "hu_HU", ro: "ro_RO", el: "el_GR", ru: "ru_RU",
    uk: "uk_UA", bg: "bg_BG", ar: "ar_SA", he: "he_IL", fa: "fa_IR",
    hi: "hi_IN", bn: "bn_BD", "zh-CN": "zh_CN", ja: "ja_JP", ko: "ko_KR",
  };
  let languages = [];
  let strings = {};
  let english = {};
  const canonicalEl = document.querySelector('link[rel="canonical"]');
  const ogUrlEl = document.querySelector('meta[property="og:url"]');
  const ogLocaleEl = document.querySelector('meta[property="og:locale"]');
  const baseCanonical = canonicalEl ? canonicalEl.getAttribute("href") : "";

  window.gemriftT = (key, fallback) => strings[key] ?? english[key] ?? fallback ?? key;

  const decodeEntities = (() => {
    const txt = document.createElement("textarea");
    return (value) => {
      if (!value || value.indexOf("&") === -1) return value;
      txt.innerHTML = value;
      return txt.value;
    };
  })();

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

  function syncSeoUrls(code) {
    if (ogLocaleEl) {
      ogLocaleEl.setAttribute("content", OG_LOCALES[code] || "en_US");
    }
    if (!baseCanonical) return;
    const urlParam = match(new URLSearchParams(location.search).get("lang"));
    const localizedHref =
      urlParam && urlParam !== FALLBACK
        ? `${baseCanonical}?lang=${encodeURIComponent(urlParam)}`
        : baseCanonical;
    if (canonicalEl) canonicalEl.setAttribute("href", localizedHref);
    if (ogUrlEl) ogUrlEl.setAttribute("content", localizedHref);
  }

  function apply(code) {
    const lang = languages.find((l) => l.code === code) || languages[0];
    document.documentElement.lang = lang.code;
    document.documentElement.dir = lang.rtl ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = strings[el.dataset.i18n] ?? english[el.dataset.i18n];
      if (v === undefined) return;
      if (el.tagName === "TITLE") {
        const clean = decodeEntities(v);
        el.textContent = clean;
        document.title = clean;
      } else {
        el.innerHTML = v;
      }
    });
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(",").forEach((pair) => {
        const [attr, key] = pair.split(":");
        const v = strings[key] ?? english[key];
        if (attr && v !== undefined) el.setAttribute(attr, decodeEntities(v));
      });
    });
    syncSeoUrls(lang.code);
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
      try {
        const nextUrl = new URL(location.href);
        if (code === FALLBACK) nextUrl.searchParams.delete("lang");
        else nextUrl.searchParams.set("lang", code);
        history.replaceState(null, "", nextUrl.toString());
      } catch (err) { /* ignore */ }
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
      syncSeoUrls(FALLBACK);
      if (select) select.value = FALLBACK;
      document.dispatchEvent(new CustomEvent("gemrift:lang", { detail: FALLBACK }));
    } else {
      await setLanguage(initial, false);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
