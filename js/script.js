/**
 * script.js — content.js の内容からページを組み立てる（通常は編集不要）
 */
(function () {
  "use strict";

  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const ext = (url, text, cls) => `<a class="btn ${cls || ""}" href="${esc(url)}" target="_blank" rel="noopener">${text}</a>`;
  const paras = (arr) => (arr || []).map((p) => `<p>${p}</p>`).join("");
  const stepId = (i) => `step${String(i + 1).padStart(2, "0")}`;

  function setMeta(selector, value) {
    const el = document.querySelector(selector);
    if (el && value != null) el.setAttribute("content", value);
  }

  function applyMeta(m) {
    document.title = m.pageTitle;
    setMeta('meta[name="description"]', m.description);
    setMeta('meta[property="og:title"]', m.pageTitle);
    setMeta('meta[property="og:description"]', m.description);
    setMeta('meta[property="og:url"]', m.siteUrl);
  }

  // プロンプト本文を安全にHTML化し、書き換える場所（［ここに入力］）を目立たせる
  function highlightSlots(text) {
    return esc(text).replace(/［ここに[^］\n]*］/g, '<span class="slot">$&</span>');
  }

  function hero(h) {
    return `
    <section class="hero" aria-labelledby="hero-title">
      <div class="container">
        <p class="hero__brand">${h.brand}</p>
        <h1 class="hero__title" id="hero-title">${h.titleLines.map((l) => `<span>${l}</span>`).join("")}</h1>
        <p class="hero__sub">${h.subtitle}</p>
        <div class="hero__lead">${paras(h.lead)}</div>
        <ul class="hero__nav">${h.nav.map((n) => `<li><a class="btn btn--ghost" href="#${esc(n.target)}" data-scroll>${n.label}</a></li>`).join("")}</ul>
      </div>
    </section>`;
  }

  function topCta(c, url) {
    const image = `<a class="cta-soft__image" href="${esc(url)}" target="_blank" rel="noopener"><img src="${esc(c.image.src)}" alt="${esc(c.image.alt)}" width="1855" height="848"></a>`;
    return `
    <section class="container top-cta" aria-labelledby="top-cta-title">
      <div class="cta-soft">
        ${image}
        <div class="cta-soft__text">
          <h2 class="cta-soft__title" id="top-cta-title">${c.heading}</h2>
          <p>${c.text}</p>
          <ul class="cta-soft__list">${c.items.map((i) => `<li>${i}</li>`).join("")}</ul>
        </div>
        ${ext(url, c.buttonText)}
      </div>
    </section>`;
  }

  function toc(t, items) {
    const rows = items
      .map((it, i) => `<li><a href="#${stepId(i)}" data-scroll><span class="toc__term">${it.title}<span class="toc__sub">${it.sub}</span></span></a></li>`)
      .join("");
    return `
    <nav class="section" id="${t.id}" aria-labelledby="${t.id}-title">
      <div class="container">
        <h2 class="heading" id="${t.id}-title">${t.heading}</h2>
        <ol class="toc">${rows}</ol>
      </div>
    </nav>`;
  }

  // collapsible: true のプロンプトは、本文を開閉式にする（コピーボタンは閉じていても使える）
  function promptText(pr, id) {
    const pre = `<pre class="prompt__text" id="${id}">${highlightSlots(pr.promptText)}</pre>`;
    if (!pr.collapsible) return pre;
    return `<details class="prompt__fold"><summary class="prompt__toggle"><span class="prompt__toggle-open">プロンプトの全文を見る</span><span class="prompt__toggle-close">プロンプトを閉じる</span></summary>${pre}</details>`;
  }

  function promptBlock(pr, id) {
    return `
    <div class="prompt">
      <p class="prompt__label">${pr.heading}</p>
      <p class="prompt__hint">${pr.description}</p>
      ${promptText(pr, id)}
      <button type="button" class="btn btn--primary copy-btn" data-copy-target="${id}">
        <span class="copy-btn__label">${pr.buttonText}</span>
        <span class="copy-btn__done" role="status" aria-live="polite">${pr.copiedText}</span>
      </button>
      <p class="prompt__fallback" hidden>コピーできない場合は、上の文章を長押し（PCはドラッグ）で選択して、手動でコピーしてください。</p>
    </div>`;
  }

  function accordions(items) {
    if (!items || !items.length) return "";
    return `<div class="accordion-list">${items
      .map((a) => `<details class="accordion"><summary class="accordion__summary">${a.title}</summary><div class="accordion__body">${paras(a.paragraphs)}</div></details>`)
      .join("")}</div>`;
  }

  function checklist(items, id) {
    if (!items || !items.length) return "";
    const rows = items
      .map((t, i) => `<li><label class="checklist__label"><input type="checkbox" class="checklist__input" id="${id}-c${i}"><span class="checklist__text">${t}</span></label></li>`)
      .join("");
    return `<ul class="checklist" data-progress="${id}-progress">${rows}</ul><p class="checklist__progress" id="${id}-progress" role="status" aria-live="polite"></p>`;
  }

  const box = (b, cls) => (b ? `<aside class="point-box${cls || ""}"><p class="point-box__label">${b.label}</p><p>${b.text}</p></aside>` : "");

  function stepCard(t, i) {
    const id = stepId(i);
    const list = t.list && t.list.length ? `<ul class="check-list">${t.list.map((x) => `<li>${x}</li>`).join("")}</ul>` : "";
    const numbered = t.numberedList && t.numberedList.length ? `<ol class="numbered">${t.numberedList.map((x) => `<li>${x}</li>`).join("")}</ol>` : "";
    const links = (t.officialLinks || []).map((l) => ext(l.url, l.text, "btn--outline")).join("");
    const tip = t.tip ? { label: "ポイント", text: t.tip.text } : null;
    return `
    <section class="step" id="${id}" aria-labelledby="${id}-title">
      <div class="container">
        <article class="step-card">
          <header class="tech__head">
            <p class="tech__no">${t.number}</p>
            <h2 class="tech__title" id="${id}-title">${t.title}</h2>
          </header>
          <div class="step__body">
            <div class="prose">${paras(t.paragraphs)}${list}${numbered}${paras(t.afterParagraphs)}</div>
            ${(t.prompts || []).map((pr, j) => promptBlock(pr, `${id}-prompt${j + 1}`)).join("")}
            ${accordions(t.accordions)}
            ${links ? `<div class="official-links">${links}</div>` : ""}
            ${checklist(t.checklist, id)}
            ${box(t.warning, " point-box--warn")}${box(tip)}${box(t.note)}
          </div>
        </article>
      </div>
    </section>`;
  }

  function finalCta(c, t, url) {
    return `
    <section class="section section--soft" id="line" aria-labelledby="final-cta-title">
      <div class="container">
        <div class="cta-final">
          <h2 class="cta-final__title" id="final-cta-title">${c.heading}</h2>
          <div class="cta-final__lead">${paras(c.lead)}</div>
          ${ext(url, c.buttonText, "btn--large")}
        </div>
        <div class="textbook">
          <p>${t.bridge}</p>
          <a class="textbook__banner" href="${esc(url)}" target="_blank" rel="noopener">
            <img src="${esc(t.banner)}" alt="${esc(t.bannerAlt)}" loading="lazy">
          </a>
          <p>${t.support}</p>
        </div>
      </div>
    </section>`;
  }

  // クリップボードAPIが使えない環境では、本文を選択状態にして手動コピーを案内する
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(() => true, () => false);
    }
    return Promise.resolve(false);
  }

  function selectText(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function onCopy(btn) {
    const target = document.getElementById(btn.dataset.copyTarget);
    const fallback = btn.parentElement.querySelector(".prompt__fallback");
    copyText(target.textContent).then((ok) => {
      if (!ok) {
        selectText(target);
        fallback.hidden = false;
        return;
      }
      fallback.hidden = true;
      btn.classList.add("is-copied");
      clearTimeout(btn._t);
      btn._t = setTimeout(() => btn.classList.remove("is-copied"), 2200);
    });
  }

  function onScroll(e, link) {
    const dest = document.querySelector(link.getAttribute("href"));
    if (!dest) return;
    e.preventDefault();
    dest.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function onCheck(input) {
    const list = input.closest(".checklist");
    const out = document.getElementById(list.dataset.progress);
    const all = list.querySelectorAll(".checklist__input").length;
    const done = list.querySelectorAll(".checklist__input:checked").length;
    out.textContent = done === all ? "すべて確認できました！" : `${done} / ${all} 項目を確認済み`;
  }

  function bind() {
    document.addEventListener("change", (e) => {
      if (e.target.matches(".checklist__input")) onCheck(e.target);
    });
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".copy-btn[data-copy-target]");
      if (btn) return onCopy(btn);
      const link = e.target.closest("a[data-scroll]");
      if (link) onScroll(e, link);
    });
  }

  function init() {
    const main = document.getElementById("main");
    if (typeof CONTENT === "undefined") return;
    const c = CONTENT;
    applyMeta(c.meta);
    main.innerHTML =
      hero(c.hero) +
      topCta(c.topCta, c.lineUrl) +
      toc(c.toc, c.steps) +
      `<div class="basic-zone">${c.steps.map(stepCard).join("")}</div>` +
      finalCta(c.finalCta, c.textbook, c.lineUrl);
    document.getElementById("footer").innerHTML = `<p>${c.footer.copyright}</p><p>${c.footer.notice}</p>`;
    bind();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
