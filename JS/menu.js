/* ============================================================
   JELODAN-CARS — Menu Mobile (Hambúrguer)
   Controla a abertura/fecho da navegação em ecrãs pequenos e o
   comportamento do submenu "Serviços" em modo táctil (clique
   em vez de hover).
   ============================================================ */
(function () {
    "use strict";

    var MOBILE_BREAKPOINT = 768;

    document.addEventListener("DOMContentLoaded", function () {
        var toggle = document.getElementById("menu-toggle");
        var nav = document.getElementById("main-nav");

        if (!toggle || !nav) return;

        function isMobile() {
            return window.innerWidth <= MOBILE_BREAKPOINT;
        }

        function openMenu() {
            nav.classList.add("is-open");
            toggle.classList.add("is-active");
            toggle.setAttribute("aria-expanded", "true");
            document.body.classList.add("nav-open-lock");
        }

        function closeMenu() {
            nav.classList.remove("is-open");
            toggle.classList.remove("is-active");
            toggle.setAttribute("aria-expanded", "false");
            document.body.classList.remove("nav-open-lock");

            var dropdown = nav.querySelector(".nav-dropdown.is-open");
            if (dropdown) dropdown.classList.remove("is-open");
        }

        toggle.addEventListener("click", function () {
            if (nav.classList.contains("is-open")) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Fecha o menu ao clicar num link de navegação normal
        // (exceto o botão que abre o submenu "Serviços")
        var links = nav.querySelectorAll("a:not(.nav-dropdown-toggle)");
        for (var i = 0; i < links.length; i++) {
            links[i].addEventListener("click", function () {
                if (isMobile()) closeMenu();
            });
        }

        // Em mobile, "Serviços" abre/fecha o submenu em vez de navegar
        var dropdown = nav.querySelector(".nav-dropdown");
        var dropdownToggle = nav.querySelector(".nav-dropdown-toggle");
        if (dropdown && dropdownToggle) {
            dropdownToggle.addEventListener("click", function (e) {
                if (isMobile()) {
                    e.preventDefault();
                    dropdown.classList.toggle("is-open");
                }
            });
        }

        // Fecha o menu ao clicar fora dele
        document.addEventListener("click", function (e) {
            if (!nav.classList.contains("is-open")) return;
            var clickedInsideNav = nav.contains(e.target);
            var clickedToggle = toggle.contains(e.target);
            if (!clickedInsideNav && !clickedToggle) closeMenu();
        });

        // Fecha o menu com a tecla Escape
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && nav.classList.contains("is-open")) {
                closeMenu();
                toggle.focus();
            }
        });

        // Garante que o menu fecha ao redimensionar para desktop
        window.addEventListener("resize", function () {
            if (!isMobile()) closeMenu();
        });
    });
})();
