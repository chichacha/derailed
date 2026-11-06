/* Find the Monkey — public interactive story, with optional Japanese localization.
 * English remains readable without language.js or a translation JSON response.
 */
(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const i18n = window.MonkeyI18n;
  const localize = (element) => i18n?.translate(element);
  const localizedString = (english) => i18n?.lookup(english) ?? english;
  const scenes = {
    brief: ["01 / THE BRIEF", "A VERY AMBITIOUS IDEA.", "???"],
    choice: ["02 / THE CHOICE", "WHAT WOULD YOU DO FIRST?", "A, B or C?"],
    trap: ["03 / THE TRAP", "ACTIVITY ISN'T EVIDENCE.", "STILL ???"],
    reveal: ["04 / THE IDEA", "FIND THE CRITICAL UNCERTAINTY.", "AHA!"],
    garden: ["05 / A SMALLER AMBITION", "SEEDLINGS KEEP DISAPPEARING.", "🌱"],
    "garden-choice": ["06 / THE NEXT MOVE", "A MYSTERY, NOT A VERDICT.", "🐌?"],
    practice: ["07 / THE PRACTICE", "SMALL EXPERIMENTS, REAL LEARNING.", "TRY IT"]
  };
  const stage = $("#visual-stage");
  let activeScene = "brief";
  function showScene(key) {
    const info = scenes[key];
    if (!info || !stage) return;
    activeScene = key;
    stage.dataset.mode = key;
    $("#scene-counter").textContent = info[0];
    $("#scene-label").textContent = info[1];
    $("#scene-bubble").textContent = info[2];
    localize(stage.parentElement);
  }

  const steps = $$(".story-step[data-scene]");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length) showScene(visible[0].target.dataset.scene);
    }, { rootMargin: "-25% 0px -25% 0px", threshold: [0, 0.1, 0.3, 0.5, 0.7] });
    steps.forEach(step => observer.observe(step));
  } else {
    showScene("brief");
  }

  let scrollTicking = false;
  window.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      const scrollable = document.documentElement.scrollHeight - innerHeight;
      const percent = scrollable > 0 ? (scrollY / scrollable) * 100 : 0;
      $("#page-progress-fill").style.width = Math.min(100, Math.max(0, percent)) + "%";
      scrollTicking = false;
    });
  }, { passive: true });

  const replies = {
    pedestal: "You'll have a lovely pedestal. But you still won't know whether the monkey can juggle. It's progress on the easier part—not evidence about the uncertain part.",
    monkey: "Even if the first juggling lesson fails, you've learned something useful. Can the monkey pick up one ball? Follow a cue? What would you try next?",
    poster: "A good poster can get people excited. It doesn't answer the question that could make the whole plan fall apart. Try testing the big assumption first.",
    more: "You might get lucky, but more seeds don't explain why the first seedlings disappeared. You could spend more without learning much.",
    slugs: "Slugs are plausible suspects, not convicted criminals. Protecting plants might help, but buying everything now assumes you already know the cause.",
    observe: "Now you're gathering evidence. Watch a small number of plants, log damage and care, and compare conditions. A cover changes more than pest access, so treat the result as a clue, not proof."
  };
  const refreshChoices = [];
  function wireChoices(buttonSelector, feedbackSelector, resetSelector, attribute) {
    const buttons = $$(buttonSelector);
    const feedback = $(feedbackSelector);
    const original = feedback.innerHTML;
    let selected = null;

    function renderFeedback() {
      if (!selected) {
        feedback.innerHTML = original;
      } else {
        feedback.replaceChildren();
        const tag = document.createElement("span");
        tag.className = "feedback-tag";
        tag.textContent = "WHAT DID THAT TEACH US?";
        const p = document.createElement("p");
        p.textContent = replies[selected.dataset[attribute]];
        feedback.append(tag, p);
      }
      localize(feedback);
    }

    buttons.forEach(button => {
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        selected = button;
        buttons.forEach(b => b.setAttribute("aria-pressed", String(b === button)));
        renderFeedback();
      });
    });
    $(resetSelector).addEventListener("click", () => {
      selected = null;
      buttons.forEach(b => b.setAttribute("aria-pressed", "false"));
      renderFeedback();
    });
    refreshChoices.push(renderFeedback);
  }
  wireChoices("[data-choice]", "#choice-feedback", "#reset-choice", "choice");
  wireChoices("[data-garden-choice]", "#garden-feedback", "#reset-garden", "gardenChoice");

  const select = $("#example-select");
  const info = $("#example-context");
  const fields = ["assumption", "test", "evidence"];
  let examples = [];
  const setStatus = (el, english) => {
    el.textContent = english;
    localize(el);
  };

  // Distinguish example-filled content from a visitor's own notes.
  fields.forEach(field => {
    document.getElementById(field).addEventListener("input", event => {
      delete event.currentTarget.dataset.loadedExample;
    });
  });

  fetch("experiment-examples.json")
    .then(response => {
      if (!response.ok) throw new Error("Could not read experiment-examples.json");
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data)) throw new Error("Examples must be an array");
      examples = data;
      for (const item of data) {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.label;
        select.appendChild(option);
        localize(option);
      }
      setStatus(info, "These are starting points, not guaranteed answers.");
    })
    .catch(() => {
      setStatus(info, "Examples are unavailable in this preview. You can still use the blank lab. Try Quarto Preview (localhost) rather than opening a file:// URL.");
    });

  $("#load-example").addEventListener("click", () => {
    const example = examples.find(item => item.id === select.value);
    if (!example) {
      setStatus(info, "Choose an example from the menu—or write your own.");
      return;
    }
    for (const field of fields) {
      const textarea = document.getElementById(field);
      textarea.value = localizedString(example[field] || "");
      textarea.dataset.loadedExample = example.id;
    }
    setStatus(info, example.context);
  });

  $("#clear-experiment").addEventListener("click", () => {
    for (const field of fields) {
      const textarea = document.getElementById(field);
      textarea.value = "";
      delete textarea.dataset.loadedExample;
    }
    select.value = "";
    $("#copy-status").textContent = "";
    setStatus(info, "Start with a fresh idea.");
  });

  $("#copy-experiment").addEventListener("click", async () => {
    const items = [
      [localizedString("What must be true?"), $("#assumption").value],
      [localizedString("One small test"), $("#test").value],
      [localizedString("What would change my mind?"), $("#evidence").value]
    ];
    const result = localizedString("FIND THE MONKEY — MY EXPERIMENT") + "\n\n" +
      items.map(([heading, value]) => heading + "\n" + (value.trim() || localizedString("(not filled in)"))).join("\n\n");
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(result);
      } else {
        const helper = document.createElement("textarea");
        helper.value = result;
        helper.style.position = "fixed";
        helper.style.left = "-9999px";
        document.body.appendChild(helper);
        helper.select();
        const copied = document.execCommand("copy");
        helper.remove();
        if (!copied) throw new Error("Copy not supported");
      }
      setStatus($("#copy-status"), "Copied! Keep experimenting.");
    } catch {
      setStatus($("#copy-status"), "Copy unavailable here. Select and copy the text manually.");
    }
  });

  // A switch never reloads the page, replays the story, or discards user input.
  document.addEventListener("monkey:languagechange", () => {
    showScene(activeScene);
    refreshChoices.forEach(refresh => refresh());
    for (const field of fields) {
      const textarea = document.getElementById(field);
      const example = examples.find(item => item.id === textarea.dataset.loadedExample);
      if (example) textarea.value = localizedString(example[field] || "");
    }
    $("#copy-status").textContent = "";
  });
})();
