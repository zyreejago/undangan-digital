/* ============================================================
   Undangan Digital Gita & Iwan — logika halaman + gerak
   Nama tamu dari path URL: /nama-tamu/
   Intro: nama muncul per huruf dengan blur, joglo tergambar.
   Animasi: GSAP + ScrollTrigger, cadangan IntersectionObserver
   ============================================================ */
(function () {
  "use strict";

  var WEDDING_DATE = new Date("2026-12-19T08:00:00+07:00");
  var LS_KEY = "undangan-gita-iwan:wishes:v1";
  var REPO_BASE = "undangan-digital";
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var HAS_GSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  if (HAS_GSAP) window.gsap.registerPlugin(window.ScrollTrigger);

  /* ---------- nama tamu ---------- */
  function slugToName(slug) {
    var name = String(slug || "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!name) return "";
    if (name === name.toLowerCase()) {
      name = name.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }
    return name;
  }

  function guestFromPath() {
    var parts = window.location.pathname
      .split("/")
      .filter(Boolean)
      .map(function (p) { try { return decodeURIComponent(p); } catch (e) { return p; } });
    if (parts.length && parts[parts.length - 1] === "index.html") parts.pop();
    if (parts.length && parts[0] === REPO_BASE) parts.shift();
    if (!parts.length) return "";
    var candidate = parts[parts.length - 1];
    if (!candidate || candidate.indexOf(".") !== -1) return "";
    return slugToName(candidate);
  }

  function resolveGuestName() {
    var fromPath = guestFromPath();
    if (fromPath) return fromPath;
    var params = new URLSearchParams(window.location.search);
    var to = (params.get("to") || "").trim();
    if (to) return to;
    try {
      var saved = sessionStorage.getItem("guestName");
      if (saved) return saved;
    } catch (e) {}
    return "";
  }

  function setGuestName() {
    var name = resolveGuestName();
    if (!name) return;
    document.getElementById("guestName").textContent = name;
    var input = document.getElementById("fName");
    if (input && !input.value) input.value = name;
  }

  /* ---------- musik latar: petikan pentatonis lembut (WebAudio) ---------- */
  var Music = (function () {
    var ctx = null, timer = null, playing = false, step = 0;
    var SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];

    function pluck(freq, when, vol) {
      var osc = ctx.createOscillator();
      var osc2 = ctx.createOscillator();
      var g2 = ctx.createGain();
      var gain = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = freq;
      osc2.type = "triangle"; osc2.frequency.value = freq * 2;
      g2.gain.value = 0.25;
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.exponentialRampToValueAtTime(vol, when + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + 1.6);
      osc.connect(gain); osc2.connect(g2); g2.connect(gain);
      gain.connect(ctx.destination);
      osc.start(when); osc2.start(when);
      osc.stop(when + 1.7); osc2.stop(when + 1.7);
    }

    function tick() {
      if (!ctx) return;
      var pattern = [0, 2, 4, 3, 5, 4, 2, 1, 0, 2, 3, 4, 6, 5, 4, 2];
      var now = ctx.currentTime;
      pluck(SCALE[pattern[step % pattern.length]], now, 0.11);
      if (step % 4 === 0) pluck(SCALE[0] / 2, now, 0.07);
      step++;
    }

    function start() {
      if (!ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ctx = new AC();
      }
      if (ctx.state === "suspended") ctx.resume();
      if (playing) return;
      playing = true;
      tick();
      timer = setInterval(tick, 1150);
    }

    function stop() {
      playing = false;
      if (timer) { clearInterval(timer); timer = null; }
    }

    return {
      start: start,
      stop: stop,
      toggle: function () { if (playing) { stop(); } else { start(); } return playing; },
      isPlaying: function () { return playing; }
    };
  })();

  function syncMusicIcon() {
    var btn = document.getElementById("musicBtn");
    var playing = Music.isPlaying();
    btn.querySelector(".ic-on").style.display = playing ? "" : "none";
    btn.querySelector(".ic-off").style.display = playing ? "none" : "";
    btn.classList.toggle("playing", playing);
  }

  /* ---------- intro sampul (seperti video) ---------- */
  function splitLetters(el) {
    if (!el) return [];
    var text = el.textContent;
    el.textContent = "";
    var out = [];
    text.split("").forEach(function (chr) {
      var sp = document.createElement("span");
      sp.className = "ch";
      sp.textContent = chr === " " ? "\u00A0" : chr;
      el.appendChild(sp);
      out.push(sp);
    });
    return out;
  }

  function introTimeline() {
    if (!HAS_GSAP || REDUCED) return;
    var gsap = window.gsap;
    var words = document.querySelectorAll("#introNames .w");
    var charsA = splitLetters(words[0]);
    var charsB = splitLetters(words[1]);
    var amp = document.querySelector("#introNames .amp");

    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(".cover-frame", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.1 })
      .fromTo(".lace", { autoAlpha: 0, scale: 0.82 }, { autoAlpha: 1, scale: 1, duration: 1, stagger: 0.12 }, "-=0.7")
      .fromTo(".cover-medallion", { autoAlpha: 0, scale: 0.5, rotation: -40 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.9, ease: "back.out(1.8)" }, "-=0.8")
      .fromTo(".cover-kicker", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.8 }, "-=0.55")
      .fromTo(charsA, { autoAlpha: 0, filter: "blur(14px)", y: 26 }, { autoAlpha: 1, filter: "blur(0px)", y: 0, duration: 1.05, stagger: 0.07 }, "-=0.4")
      .fromTo(amp, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(2.2)" }, "-=0.5")
      .fromTo(charsB, { autoAlpha: 0, filter: "blur(14px)", y: 26 }, { autoAlpha: 1, filter: "blur(0px)", y: 0, duration: 1.05, stagger: 0.07 }, "-=0.35");
    tl.fromTo(".cover .made-credit", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.5");

    /* joglo tergambar garis demi garis */
    var paths = gsap.utils.toArray("#jogloCover .draw");
    paths.forEach(function (pth) {
      try {
        var len = pth.getTotalLength();
        pth.style.strokeDasharray = String(len);
        pth.style.strokeDashoffset = String(len);
      } catch (e) {}
      var f = pth.getAttribute("fill");
      if (f && f !== "none") {
        pth.dataset.fo = pth.getAttribute("fill-opacity") || "1";
        pth.style.fillOpacity = "0";
      }
    });
    tl.to(paths, {
      strokeDashoffset: 0, duration: 1.7, ease: "power2.inOut", stagger: 0.045,
      onStart: function () {
        paths.forEach(function (pth) {
          if (pth.dataset.fo) gsap.to(pth, { fillOpacity: parseFloat(pth.dataset.fo), duration: 1.2, delay: 0.5 });
        });
      }
    }, "-=0.9")
      .fromTo(".cover-peacock.left", { autoAlpha: 0, x: -34 }, { autoAlpha: 1, x: 0, duration: 1.2 }, "-=1.5")
      .fromTo(".cover-peacock.right", { autoAlpha: 0, x: 34 }, { autoAlpha: 1, x: 0, duration: 1.2 }, "<")
      .fromTo(".cover-florals", { autoAlpha: 0, y: 44 }, { autoAlpha: 1, y: 0, duration: 1 }, "-=0.9")
      .fromTo(".guest-card > *", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.09 }, "-=0.6");

    /* gerak idle lembut */
    gsap.to(".cover-peacock.left", { rotation: 1.4, transformOrigin: "85% 12%", duration: 3.4, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 2 });
    gsap.to(".cover-florals", { x: 5, duration: 4.5, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 2 });
  }

  /* ---------- animasi scroll ---------- */
  var animStarted = false;

  function fallbackReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.1 });
    items.forEach(function (el) { io.observe(el); });
  }

  function heroIntro() {
    if (!HAS_GSAP || REDUCED) return;
    var gsap = window.gsap;
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(".hero-medallion", { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.8 })
      .fromTo(".hero .kicker", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.4")
      .fromTo(".hero-names span", { autoAlpha: 0, y: 40, filter: "blur(8px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.9, stagger: 0.12 }, "-=0.3")
      .fromTo(".hero .made-credit, .hero .orn, .hero-date, .hero-place", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.09 }, "-=0.45")
      .fromTo(".hero-joglo", { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 1 }, "-=0.35");
  }

  function initAnimations() {
    if (animStarted) return;
    animStarted = true;
    if (!HAS_GSAP || REDUCED) { fallbackReveal(); return; }
    var gsap = window.gsap;
    document.documentElement.classList.add("gsap-on");

    function reveal(el, from, vars) {
      if (!el) return;
      gsap.fromTo(el, Object.assign({ autoAlpha: 0 }, from), Object.assign({
        autoAlpha: 1, x: 0, y: 0, scale: 1, rotation: 0, rotationX: 0,
        duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      }, vars || {}));
    }

    var sectionFrom = {
      "verse": { scale: 0.94, y: 40 },
      "couple-sec": { y: 40 },
      "savethedate": { y: 34 },
      "events": { y: 48 },
      "story": { y: 40 },
      "gallery": { y: 40 },
      "gift": { y: 40 },
      "rsvp": { y: 40 },
      "closing": { y: 30 }
    };
    gsap.utils.toArray(".reveal").forEach(function (el) {
      if (el.classList.contains("hero")) return;
      var key = null;
      Object.keys(sectionFrom).forEach(function (k) { if (el.classList.contains(k)) key = k; });
      reveal(el, key ? sectionFrom[key] : { y: 34 }, {});
    });

    gsap.utils.toArray(".couple-grid .person").forEach(function (person, i) {
      reveal(person, { x: i === 0 ? -58 : 58 }, { duration: 1.1 });
    });
    reveal(document.querySelector(".couple-amp"), { scale: 0, rotation: -30 }, { ease: "back.out(2)", duration: 0.8 });

    gsap.utils.toArray(".arch-photo img").forEach(function (img) {
      gsap.fromTo(img, { clipPath: "inset(0 0 100% 0)" }, {
        clipPath: "inset(0 0 0% 0)", duration: 1.25, ease: "power3.inOut",
        scrollTrigger: { trigger: img, start: "top 86%", once: true }
      });
    });

    gsap.set(".countdown", { perspective: 700 });
    gsap.fromTo(".countdown .cd-box", { autoAlpha: 0, rotationX: -92, y: 10 }, {
      autoAlpha: 1, rotationX: 0, y: 0, duration: 0.85, ease: "back.out(1.8)", stagger: 0.1,
      scrollTrigger: { trigger: ".savethedate", start: "top 80%", once: true }
    });

    gsap.set(".events-grid", { perspective: 900 });
    gsap.utils.toArray(".events-grid .event-card").forEach(function (card, i) {
      gsap.fromTo(card, { autoAlpha: 0, y: 56, rotationX: 22, transformOrigin: "50% 100%" }, {
        autoAlpha: 1, y: 0, rotationX: 0, duration: 1, ease: "power3.out", delay: i * 0.14,
        scrollTrigger: { trigger: card, start: "top 88%", once: true }
      });
    });

    gsap.utils.toArray(".story .tl-item").forEach(function (item, i) {
      reveal(item, { x: i % 2 ? 58 : -58, rotation: i % 2 ? 1.2 : -1.2 }, { duration: 1.05 });
    });

    gsap.fromTo(".gallery-grid .g-item", { autoAlpha: 0, scale: 0.8, rotation: -3 }, {
      autoAlpha: 1, scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.6)",
      stagger: { each: 0.07, from: "random" },
      scrollTrigger: { trigger: ".gallery-grid", start: "top 85%", once: true }
    });

    gsap.utils.toArray(".gift-grid .bank-card").forEach(function (card, i) {
      reveal(card, { y: 44, rotationX: 12 }, { delay: i * 0.13, duration: 0.95 });
    });

    gsap.utils.toArray(".section-title").forEach(function (t) {
      gsap.fromTo(t, { backgroundSize: "0% 2px" }, {
        backgroundSize: "110px 2px", duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: t, start: "top 88%", once: true }
      });
    });

    gsap.utils.toArray(".wish").forEach(function (w, i) {
      reveal(w, { x: -28 }, { delay: (i % 3) * 0.08 });
    });

    gsap.utils.toArray(".arch-photo img, .tl-photo img").forEach(function (img) {
      gsap.fromTo(img, { scale: 1.13 }, {
        scale: 1, ease: "none",
        scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    window.addEventListener("load", function () { window.ScrollTrigger.refresh(); });
  }

  /* ---------- buka undangan ---------- */
  function showContent() {
    document.getElementById("mainContent").hidden = false;
    document.getElementById("musicBtn").hidden = false;
    var gb = document.querySelector(".gift-btn");
    if (gb) gb.hidden = false;
    document.body.style.overflow = "";
    Music.start();
    syncMusicIcon();
    window.scrollTo(0, 0);
  }

  function openInvitation() {
    var cover = document.getElementById("cover");
    if (HAS_GSAP && !REDUCED) {
      var gsap = window.gsap;
      showContent();
      initAnimations();
      gsap.to(".cover-inner, .cover-peacock, .cover-florals, .cover-medallion", { y: -16, autoAlpha: 0, duration: 0.45, ease: "power2.in" });
      gsap.to(cover, {
        autoAlpha: 0, duration: 0.65, delay: 0.15, ease: "power2.inOut",
        onComplete: function () { cover.classList.add("opened"); }
      });
      gsap.delayedCall(0.4, heroIntro);
    } else {
      cover.classList.add("opened");
      showContent();
      initAnimations();
    }
  }

  /* ---------- unduh .ics (cadangan save the date) ---------- */
  function initIcs() {
    var btn = document.getElementById("icsBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Zeecreate//Undangan Digital//ID",
        "BEGIN:VEVENT",
        "UID:gita-iwan-20261219@digital.zeecreate.site",
        "DTSTAMP:20261022T000000Z",
        "DTSTART:20261219T010000Z",
        "DTEND:20261219T060000Z",
        "SUMMARY:Ngunduh Mantu Gita & Iwan",
        "DESCRIPTION:Ngunduh mantu dan resepsi Gita Ayu Prameswari dan Iwan Setiawan",
        "LOCATION:Pendopo Ageng Taman Budaya Yogyakarta",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");
      var blob = new Blob([ics], { type: "text/calendar" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "ngunduh-mantu-gita-iwan.ics";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    });
  }

  /* ---------- hitung mundur ---------- */
  function pad(n) { return String(n).padStart(2, "0"); }
  function tickCountdown() {
    var diff = WEDDING_DATE - new Date();
    var d = 0, h = 0, m = 0, s = 0;
    if (diff > 0) {
      d = Math.floor(diff / 86400000);
      h = Math.floor(diff % 86400000 / 3600000);
      m = Math.floor(diff % 3600000 / 60000);
      s = Math.floor(diff % 60000 / 1000);
    }
    document.getElementById("cdDays").textContent = pad(d);
    document.getElementById("cdHours").textContent = pad(h);
    document.getElementById("cdMins").textContent = pad(m);
    document.getElementById("cdSecs").textContent = pad(s);
  }

  /* ---------- salin teks ---------- */
  function initCopy() {
    document.querySelectorAll("[data-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = document.getElementById(btn.getAttribute("data-copy"));
        if (!target) return;
        var text = target.innerText.replace(/\s*\n\s*/g, ", ").trim();
        if (btn.getAttribute("data-copy") !== "giftAddress") {
          text = target.textContent.trim();
        }
        function done() {
          var old = btn.textContent;
          btn.textContent = "Tersalin";
          btn.classList.add("copied");
          setTimeout(function () { btn.textContent = old; btn.classList.remove("copied"); }, 1800);
        }
        function fallback() {
          var ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); } catch (e) {}
          document.body.removeChild(ta);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () { fallback(); done(); });
        } else { fallback(); done(); }
      });
    });
  }

  /* ---------- ucapan & RSVP (localStorage) ---------- */
  var SEED_WISHES = [
    { name: "Keluarga Besar Pramudya (Solo)", attend: "Hadir", msg: "Nderek bingah, Nak Gita kini resmi menjadi bagian keluarga Yogyakarta. Mugi tansah pinaringan sakinah, mawaddah, warahmah." },
    { name: "Mbak Ayu & Mas Bimo", attend: "Hadir", msg: "Selamat untuk Iwan dan Gita! Senang akhirnya bisa kumpul dua keluarga besar. Sampai jumpa di pendopo." },
    { name: "Lik Parman", attend: "Belum Pasti", msg: "Mugi acara ngunduh mantu berjalan lancar, kedua mempelai tansah sehat lan rukun ngantos kaken ninen." }
  ];

  function loadWishes() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return SEED_WISHES.slice();
  }

  function saveWishes(list) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderWishes() {
    var list = loadWishes();
    var box = document.getElementById("wishList");
    if (!list.length) {
      box.innerHTML = '<p class="wish-empty">Belum ada ucapan. Jadilah yang pertama memberi doa untuk kedua mempelai.</p>';
      return;
    }
    box.innerHTML = list.map(function (w) {
      return '<article class="wish">' +
        '<div class="wish-head"><span class="wish-name">' + escapeHtml(w.name) + "</span>" +
        '<span class="wish-badge">' + escapeHtml(w.attend) + "</span></div>" +
        '<p class="wish-msg">' + escapeHtml(w.msg) + "</p></article>";
    }).join("");
  }

  function initForm() {
    document.getElementById("rsvpForm").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = document.getElementById("fName").value.trim();
      var attend = document.getElementById("fAttend").value;
      var msg = document.getElementById("fMsg").value.trim();
      if (!name || !msg) return;
      var list = loadWishes();
      list.unshift({ name: name, attend: attend, msg: msg });
      saveWishes(list);
      renderWishes();
      document.getElementById("fMsg").value = "";
      var first = document.querySelector("#wishList .wish");
      if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    document.body.style.overflow = "hidden";
    setGuestName();
    tickCountdown();
    setInterval(tickCountdown, 1000);
    initCopy();
    initIcs();
    initForm();
    renderWishes();
    introTimeline();
    document.getElementById("btnOpen").addEventListener("click", openInvitation);
    document.getElementById("musicBtn").addEventListener("click", function () {
      Music.toggle();
      syncMusicIcon();
    });
  });
})();
