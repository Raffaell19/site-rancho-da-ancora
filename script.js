(() => {
  const WA_REST = "5511998806603";
  const WA_LOC = "5511975599499";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const openWa = (num, msg) => window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");

  $("#year").textContent = new Date().getFullYear();

  // Header state
  const header = $(".main-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu
  const burger = $("#burger");
  const nav = $("#nav");
  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    document.body.classList.toggle("menu-open", open);
  };
  burger.addEventListener("click", (e) => { e.stopPropagation(); setMenu(!nav.classList.contains("open")); });
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("open") && !nav.contains(e.target)) setMenu(false);
  });

  // Active nav link
  const links = $$('.nav a[href^="#"]:not(.btn)');
  const sections = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${en.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => spy.observe(s));

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    io.observe(el);
  });

  // Counters
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const end = +el.dataset.count;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / 1200, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => countIO.observe(el));

  // Room slider
  const slider = $("#roomSlider");
  if (slider) {
    const track = $(".slides", slider);
    const total = track.children.length;
    const counter = $(".sl-count b", slider);
    let idx = 0;
    let timer;
    const go = (n) => {
      idx = (n + total) % total;
      track.style.transform = `translateX(-${idx * 100}%)`;
      counter.textContent = String(idx + 1).padStart(2, "0");
    };
    const auto = () => { clearInterval(timer); timer = setInterval(() => go(idx + 1), 5000); };
    $$(".sl-btn", slider).forEach((b) => b.addEventListener("click", () => { go(idx + +b.dataset.dir); auto(); }));
    let x0 = null;
    track.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); auto(); }
      x0 = null;
    });
    auto();
  }

  // Form validation helper
  const validate = (form) => {
    let ok = true;
    $$("[required]", form).forEach((f) => {
      const bad = !f.value.trim();
      f.classList.toggle("invalid", bad);
      if (bad && ok) { f.focus(); ok = false; }
    });
    return ok;
  };

  // Order on board
  $("#bordoForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    if (!validate(f)) return;
    const msg = `Olá, Rancho da Âncora! Quero fazer um pedido A BORDO.\n\n⚓ Embarcação: ${f.barco.value}\n📍 Localização: ${f.local.value}${f.pedido.value ? `\n🍤 Pedido: ${f.pedido.value}` : ""}`;
    openWa(WA_REST, msg);
  });

  // Boat booking
  const dateInput = $('#boatForm input[type="date"]');
  if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];
  $("#boatForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    if (!validate(f)) return;
    const data = new Date(`${f.data.value}T12:00:00`).toLocaleDateString("pt-BR");
    const msg = `Olá! Gostaria de reservar a LANCHA do Rancho da Âncora.\n\n👤 Nome: ${f.nome.value}\n📅 Data: ${data}\n👥 Passageiros: ${f.pax.value}\n🗺️ ${f.roteiro.value}\n⏱️ Duração: ${f.duracao.value}${f.obs.value ? `\n📝 Obs.: ${f.obs.value}` : ""}`;
    openWa(WA_LOC, msg);
  });
  $$("input").forEach((i) => i.addEventListener("input", () => i.classList.remove("invalid")));

  // Gallery filters
  const gallery = $("#gallery");
  $$(".filters button").forEach((b) => b.addEventListener("click", () => {
    $$(".filters button").forEach((x) => x.classList.toggle("active", x === b));
    $$("a", gallery).forEach((a) => a.classList.toggle("hide", b.dataset.f !== "all" && a.dataset.c !== b.dataset.f));
  }));

  // Lightbox
  const lb = $("#lightbox");
  const lbImg = $("img", lb);
  const closeLb = () => { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); };
  $$("a", gallery).forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    lbImg.src = a.getAttribute("href");
    lbImg.alt = $("img", a).alt;
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
  }));
  lb.addEventListener("click", (e) => { if (e.target !== lbImg) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeLb(); setMenu(false); waFloat.classList.remove("open");
  });

  // Floating WhatsApp
  const waFloat = $("#waFloat");
  const waBtn = $("#waBtn");
  waBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = waFloat.classList.toggle("open");
    waBtn.setAttribute("aria-expanded", open);
  });
  $$("[data-close]", waFloat).forEach((a) => a.addEventListener("click", () => waFloat.classList.remove("open")));
  document.addEventListener("click", (e) => { if (!waFloat.contains(e.target)) waFloat.classList.remove("open"); });
})();

