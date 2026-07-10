// Shared behaviour for the static prototype: banner injection + fake interactions.
// This demo has no backend — it only shows the front-end (HTML/CSS/JS/Flask templates
// ported to static markup). Every "action" below is simulated client-side.
(function () {
  "use strict";

  function injectBanner() {
    var banner = document.createElement("div");
    banner.className = "demo-banner";
    banner.innerHTML =
      "<strong>PROTOTIPO ESTATICO</strong> — sem backend, sem dados reais. " +
      "Feito para demonstrar o front-end (HTML/CSS/JS + Flask/Jinja2) de um projeto de TCC em grupo. " +
      '<a href="https://github.com/leodah20/chatbot-front" target="_blank" rel="noopener">ver codigo-fonte</a> · ' +
      '<a href="https://leodah20.github.io">voltar ao portfolio</a>';
    document.body.insertBefore(banner, document.body.firstChild);
  }

  function notImplemented(e) {
    e.preventDefault();
    if (typeof showToast === "function") {
      showToast("Essa tela nao existe neste protótipo estático — só o fluxo de login → dashboard → avisos foi portado.", "info");
    } else {
      alert("Essa tela nao existe neste protótipo estático.");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    injectBanner();

    document.querySelectorAll("[data-demo-stub]").forEach(function (el) {
      el.addEventListener("click", notImplemented);
    });

    document.querySelectorAll("[data-demo-stub-submit]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (typeof showToast === "function") {
          showToast("Acao simulada — nenhum dado foi salvo (protótipo sem backend).", "success");
        }
      });
    });
  });
})();
