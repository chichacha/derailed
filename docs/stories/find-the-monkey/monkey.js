/* Find the Monkey — public life-lesson interactions. No external JS dependencies. */
(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  // Change the sticky illustration's caption as the reader moves through the story.
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
  function showScene(key) {
    const info = scenes[key];
    if (!info || !stage) return;
    stage.dataset.mode = key;
    $("#scene-counter").textContent = info[0];
    $("#scene-label").textContent = info[1];
    $("#scene-bubble").textContent = info[2];
  }

  const steps = $$(".story-step[data-scene]");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length) showScene(visible[0].target.dataset.scene);
    }, {rootMargin: "-25% 0px -25% 0px", threshold: [0, 0.1, 0.3, 0.5, 0.7]});
    steps.forEach((step) => observer.observe(step));
  } else {
    showScene("brief");
  }

  let scrollTicking = false;
  window.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      $("#page-progress-fill").style.width = Math.min(100, Math.max(0, percent)) + "%";
      scrollTicking = false;
    });
  }, {passive: true});

  const replies = {
    pedestal: "You'll have a lovely pedestal. But you still won't know whether the monkey can juggle. It's progress on the easier part—not evidence about the uncertain part.",
    monkey: "Even if the first juggling lesson fails, you've learned something useful. Can the monkey pick up one ball? Follow a cue? What would you try next?",
    poster: "A good poster can get people excited. It doesn't answer the question that could make the whole plan fall apart. Try testing the big assumption first.",
    more: "You might get lucky, but more seeds don't explain why the first seedlings disappeared. You could spend more without learning much.",
    slugs: "Slugs are plausible suspects, not convicted criminals. Protecting plants might help, but buying everything now assumes you already know the cause.",
    observe: "Now you're gathering evidence. Watch a small number of plants, log damage and care, and compare conditions. A cover changes more than pest access, so treat the result as a clue, not proof."
  };

  function wireChoices(buttonSelector, feedbackSelector, resetSelector, attribute) {
    const buttons = $$(buttonSelector);
    const feedback = $(feedbackSelector);
    const original = feedback.innerHTML;
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
        const answer = replies[button.dataset[attribute]];
        feedback.replaceChildren();
        const tag = document.createElement("span");
        tag.className = "feedback-tag";
        tag.textContent = "WHAT DID THAT TEACH US?";
        const p = document.createElement("p");
        p.textContent = answer;
        feedback.append(tag, p);
      });
    });
    $(resetSelector).addEventListener("click", () => {
      buttons.forEach((b) => b.setAttribute("aria-pressed", "false"));
      feedback.innerHTML = original; // Restores the original, locally-authored markup.
    });
  }
  wireChoices("[data-choice]", "#choice-feedback", "#reset-choice", "choice");
  wireChoices("[data-garden-choice]", "#garden-feedback", "#reset-garden", "gardenChoice");

  // Experiments live in JSON so adding a scenario does not require editing this JS.
  const select = $("#example-select");
  const info = $("#example-context");
  let examples = [];

  fetch("experiment-examples.json")
    .then((response) => {
      if (!response.ok) throw new Error("Could not read experiment-examples.json");
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) throw new Error("Examples must be an array");
      examples = data;
      data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.label;
        select.appendChild(option);
      });
      info.textContent = "These are starting points, not guaranteed answers.";
    })
    .catch(() => {
      info.textContent = "Examples are unavailable in this preview. You can still use the blank lab. Try Quarto Preview (localhost) rather than opening a file:// URL.";
    });

  $("#load-example").addEventListener("click", () => {
    const example = examples.find((item) => item.id === select.value);
    if (!example) {
      info.textContent = "Choose an example from the menu—or write your own.";
      return;
    }
    ["assumption", "test", "evidence"].forEach((field) => {
      document.getElementById(field).value = example[field] || "";
    });
    info.textContent = example.context;
  });

  $("#clear-experiment").addEventListener("click", () => {
    ["assumption", "test", "evidence"].forEach((field) => {
      document.getElementById(field).value = "";
    });
    select.value = "";
    $("#copy-status").textContent = "";
    info.textContent = "Start with a fresh idea.";
  });

  $("#copy-experiment").addEventListener("click", async () => {
    const fields = [
      ["What must be true?", $("#assumption").value],
      ["One small test", $("#test").value],
      ["What would change my mind?", $("#evidence").value]
    ];
    const text = "FIND THE MONKEY — MY EXPERIMENT\n\n" +
      fields.map(([heading, value]) => heading + "\n" + (value.trim() || "(not filled in)")).join("\n\n");
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const helper = document.createElement("textarea");
        helper.value = text;
        helper.style.position = "fixed";
        helper.style.left = "-9999px";
        document.body.appendChild(helper);
        helper.select();
        const copied = document.execCommand("copy");
        helper.remove();
        if (!copied) throw new Error("Copy not supported");
      }
      $("#copy-status").textContent = "Copied! Keep experimenting.";
    } catch {
      $("#copy-status").textContent = "Copy unavailable here. Select and copy the text manually.";
    }
  });
})();
