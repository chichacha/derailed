/* DERAILED / Find the Monkey — small, single-page English/Japanese switch.
 *
 * English stays in the QMD as the readable default. A curated ja.json
 * translates text nodes in place without duplicating the page or its behavior.
 * This first version intentionally uses English text as lookup keys. If you
 * rewrite English copy later, review the corresponding Japanese entry.
 */
(() => {
  "use strict";

  let language = "en";
  let japanese = null;
  let fetchPromise = null;
  const originals = new WeakMap();        // Original English for each text node
  const originalAttributes = new WeakMap(); // Original ARIA labels/placeholders
  const initialTitle = document.title;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const initialDescription = descriptionMeta?.content || "";
  const root = document.querySelector(".monkey-page");

  const isExcluded = (node) => {
    const parent = node.parentElement;
    return !parent || Boolean(parent.closest("script, style, noscript, textarea, svg"));
  };

  const lookup = (english) => {
    if (language !== "ja" || !japanese) return english;
    return japanese.text?.[english] ?? english;
  };

  // Preserve leading and trailing whitespace to avoid accidental word joining.
  const translatedText = (original) => {
    const core = original.trim();
    if (!core) return original;
    const translation = lookup(core);
    if (translation === core) return original;
    const prefix = original.match(/^\s*/)?.[0] || "";
    const suffix = original.match(/\s*$/)?.[0] || "";
    return prefix + translation + suffix;
  };

  const translate = (container = root) => {
    if (!container) return;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      if (!isExcluded(walker.currentNode)) nodes.push(walker.currentNode);
    }
    for (const node of nodes) {
      if (!originals.has(node)) originals.set(node, node.nodeValue);
      const original = originals.get(node);
      const next = translatedText(original);
      if (node.nodeValue !== next) node.nodeValue = next;
    }

    // Translate form hints and accessible names as well as visible prose.
    const elements = [container, ...container.querySelectorAll("*")];
    for (const element of elements) {
      if (!element.getAttribute) continue;
      let attrs = originalAttributes.get(element);
      if (!attrs) {
        attrs = {};
        for (const attr of ["placeholder", "aria-label", "title"]) {
          if (element.hasAttribute(attr)) attrs[attr] = element.getAttribute(attr);
        }
        originalAttributes.set(element, attrs);
      }
      for (const [name, original] of Object.entries(attrs)) {
        const next = lookup(original);
        if (element.getAttribute(name) !== next) element.setAttribute(name, next);
      }
    }
  };

  const loadJapanese = () => {
    if (japanese) return Promise.resolve(japanese);
    if (!fetchPromise) {
      fetchPromise = fetch("translations/ja.json")
        .then(response => {
          if (!response.ok) throw new Error("Could not load ja.json");
          return response.json();
        })
        .then(data => {
          if (!data || !data.text || typeof data.text !== "object") {
            throw new Error("Invalid Japanese translation file");
          }
          japanese = data;
          return data;
        })
        .catch(error => {
          fetchPromise = null; // Permit retry after network failure.
          console.warn("Japanese translation unavailable:", error);
          throw error;
        });
    }
    return fetchPromise;
  };

  async function setLanguage(next, updateUrl = true) {
    if (next !== "en" && next !== "ja") return;
    if (next === "ja") {
      try {
        await loadJapanese();
      } catch {
        // Keep the usable English version if translation assets cannot load.
        return;
      }
    }

    language = next;
    translate(root);
    document.documentElement.lang = next;
    if (root) root.lang = next;
    document.body.classList.toggle("lang-ja", next === "ja");
    document.title = next === "ja" ? japanese.title : initialTitle;
    if (descriptionMeta) {
      descriptionMeta.content = next === "ja" ? japanese.description : initialDescription;
    }
    for (const button of document.querySelectorAll("[data-language]")) {
      button.setAttribute("aria-pressed", String(button.dataset.language === next));
    }

    if (updateUrl) {
      const url = new URL(window.location.href);
      if (next === "ja") url.searchParams.set("lang", "ja");
      else url.searchParams.delete("lang"); // English is the default.
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }

    // monkey.js re-renders the active sticky caption and any revealed feedback.
    document.dispatchEvent(new CustomEvent("monkey:languagechange", { detail: { language: next } }));
  }

  window.MonkeyI18n = {
    get language() { return language; },
    translate,
    lookup,
    setLanguage
  };

  document.querySelectorAll("[data-language]").forEach(button => {
    button.addEventListener("click", () => setLanguage(button.dataset.language));
  });

  // Shareable ?lang=ja, but never auto-detect Japanese from the browser.
  const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
  if (requestedLanguage === "ja") setLanguage("ja", false);
})();
