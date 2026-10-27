// Настройки: заполнить, когда заказчик пришлёт данные
// FORM_URL - адрес приёма заявок (веб-приложение Google Apps Script или вебхук), пока пусто
const CONFIG = {
  FORM_URL: "",
  PHONE_TEXT: "+7 (000) 000-00-00",
  PHONE_HREF: "+70000000000",
  TG: "",
  MAX: ""
};

// Контакты из настроек
document.querySelectorAll("[data-phone]").forEach(a => {
  a.textContent = CONFIG.PHONE_TEXT;
  a.href = "tel:" + CONFIG.PHONE_HREF;
});
document.querySelectorAll("[data-phone-ico]").forEach(a => { a.href = "tel:" + CONFIG.PHONE_HREF; });
document.querySelectorAll("[data-link]").forEach(a => {
  const url = CONFIG[a.dataset.link === "tg" ? "TG" : "MAX"];
  if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
});

// Быстрая форма на первом экране: переносит текст в основную заявку
(function () {
  const quick = document.getElementById("quick");
  const text = document.getElementById("quickText");
  const hint = document.getElementById("quickHint");
  const wish = document.getElementById("fWish");
  const name = document.getElementById("fName");
  if (!quick) return;
  quick.addEventListener("submit", e => {
    e.preventDefault();
    const v = text.value.trim();
    if (v.length < 5) {
      hint.textContent = "Опишите коротко, что нужно: например, бюджет и тип коляски.";
      text.focus();
      return;
    }
    hint.textContent = "";
    wish.value = v;
    document.getElementById("zayavka").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    setTimeout(() => name.focus({ preventScroll: true }), 500);
  });
  text.addEventListener("input", () => { hint.textContent = ""; });
})();

// Карусель моделей
(function () {
  const root = document.getElementById("car");
  if (!root) return;
  const track = root.querySelector(".car__track");
  const prev = root.querySelector(".car__btn--prev");
  const next = root.querySelector(".car__btn--next");
  const step = () => {
    const card = track.querySelector(".card");
    return card ? card.getBoundingClientRect().width + 16 : 300;
  };
  const upd = () => {
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  };
  prev.addEventListener("click", () => track.scrollBy({ left: -step() * 2, behavior: "smooth" }));
  next.addEventListener("click", () => track.scrollBy({ left: step() * 2, behavior: "smooth" }));
  track.addEventListener("scroll", upd, { passive: true });
  window.addEventListener("resize", upd);
  track.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") { e.preventDefault(); track.scrollBy({ left: step(), behavior: "smooth" }); }
    if (e.key === "ArrowLeft") { e.preventDefault(); track.scrollBy({ left: -step(), behavior: "smooth" }); }
  });
  upd();
})();

// Маска телефона и основная форма
(function () {
  const form = document.getElementById("form");
  if (!form) return;
  const phone = form.elements.phone;
  phone.addEventListener("input", () => {
    let d = phone.value.replace(/\D/g, "");
    if (d[0] === "8" || d[0] === "7") d = d.slice(1);
    d = d.slice(0, 10);
    let out = "";
    if (d.length) out = "+7 (" + d.slice(0, 3);
    if (d.length >= 3) out += ") " + d.slice(3, 6);
    if (d.length >= 6) out += "-" + d.slice(6, 8);
    if (d.length >= 8) out += "-" + d.slice(8, 10);
    phone.value = out;
  });

  const setErr = (field, msg) => {
    const el = form.querySelector('.err[data-for="' + field + '"]');
    if (el) el.textContent = msg;
    const input = form.elements[field];
    if (input && input.type !== "checkbox") input.classList.toggle("bad", !!msg);
  };

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const ok = document.getElementById("formOk");
    ok.hidden = true;
    const name = form.elements.name.value.trim();
    const digits = form.elements.phone.value.replace(/\D/g, "");
    let bad = false;
    setErr("name", ""); setErr("phone", ""); setErr("agree", "");
    if (name.length < 2) { setErr("name", "Напишите имя."); bad = true; }
    if (digits.length < 11) { setErr("phone", "Введите телефон полностью."); bad = true; }
    if (!form.elements.agree.checked) { setErr("agree", "Нужно согласие на обработку данных."); bad = true; }
    if (bad) {
      const first = form.querySelector(".bad, .err:not(:empty)");
      if (first) first.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    const data = {
      wish: form.elements.wish.value.trim(),
      name,
      phone: form.elements.phone.value,
      way: form.elements.way.value,
      time: new Date().toISOString()
    };
    if (CONFIG.FORM_URL) {
      try {
        await fetch(CONFIG.FORM_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });
      } catch (err) {
        ok.textContent = "Не удалось отправить заявку. Позвоните нам: " + CONFIG.PHONE_TEXT;
        ok.hidden = false;
        return;
      }
    }
    form.reset();
    form.elements.way.value = "Звонок";
    ok.textContent = "Заявка принята. Специалист свяжется с вами выбранным способом.";
    ok.hidden = false;
  });
})();
