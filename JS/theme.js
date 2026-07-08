/* ============================================================
   JELODAN-CARS — Alternância de Tema (Claro / Escuro) e Botão
   "Voltar ao Topo".
   O tema é guardado em localStorage e aplicado imediatamente
   em cada página através do script inline no <head>, para
   evitar o "flash" do tema errado ao carregar a página.
   ============================================================ */
(function () {
    "use strict";

    var STORAGE_KEY = "jelodan-theme";

    function getStoredTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }

    function setStoredTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (e) {
            /* localStorage indisponível — o tema ainda funciona nesta sessão */
        }
    }

    function applyTheme(theme) {
        if (theme === "dark") {
            document.documentElement.setAttribute("data-theme", "dark");
        } else {
            document.documentElement.removeAttribute("data-theme");
        }
    }

    function currentTheme() {
        return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    }

    function buildToggleButton() {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "theme-toggle";
        btn.setAttribute("aria-label", "Alternar entre modo claro e escuro");
        btn.innerHTML =
            '<svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>' +
            '<svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>';

        btn.addEventListener("click", function () {
            var next = currentTheme() === "dark" ? "light" : "dark";
            applyTheme(next);
            setStoredTheme(next);
        });

        return btn;
    }

    function buildBackToTopButton() {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "back-to-top";
        btn.setAttribute("aria-label", "Voltar ao topo da página");
        btn.innerHTML =
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5"></path><path d="M5 12l7-7 7 7"></path></svg>';

        btn.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        var ticking = false;
        function updateVisibility() {
            if (window.scrollY > 400) {
                btn.classList.add("is-visible");
            } else {
                btn.classList.remove("is-visible");
            }
            ticking = false;
        }
        window.addEventListener("scroll", function () {
            if (!ticking) {
                window.requestAnimationFrame(updateVisibility);
                ticking = true;
            }
        });
        updateVisibility();

        return btn;
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.body.appendChild(buildToggleButton());
        document.body.appendChild(buildBackToTopButton());
    });
})();
