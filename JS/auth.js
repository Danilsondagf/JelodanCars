/* ============================================================
   AUTENTICAÇÃO — JELODAN-CARS
   Sistema de conta simples guardado no navegador (localStorage).

   AVISO IMPORTANTE: este site é estático (sem servidor/backend),
   por isso as contas e palavras-passe ficam guardadas apenas no
   navegador do próprio utilizador, sem encriptação real. Serve
   para demonstrar o fluxo de autenticação (só quem tem conta
   pode comprar), mas para um site em produção real deve ligar-se
   isto a um backend próprio (Node, Firebase Auth, etc.) que
   trate o registo, login e palavras-passe com segurança.
   ============================================================ */
(function (window) {
    "use strict";

    var USERS_KEY = "jelodan-users";
    var SESSION_KEY = "jelodan-session";

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveUsers(users) {
        try {
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        } catch (e) {
            /* localStorage indisponível */
        }
    }

    function findUserByEmail(email) {
        email = (email || "").trim().toLowerCase();
        return getUsers().find(function (u) { return u.email.toLowerCase() === email; }) || null;
    }

    function registerUser(dados) {
        var email = (dados.email || "").trim();
        if (findUserByEmail(email)) {
            return { ok: false, erro: "Já existe uma conta registada com este email." };
        }
        var users = getUsers();
        users.push({
            nome: (dados.nome || "").trim(),
            email: email,
            telefone: (dados.telefone || "").trim(),
            password: dados.password || ""
        });
        saveUsers(users);
        setSession(email);
        return { ok: true };
    }

    function login(email, password) {
        var user = findUserByEmail(email);
        if (!user) {
            return { ok: false, erro: "Não existe nenhuma conta com este email." };
        }
        if (user.password !== password) {
            return { ok: false, erro: "Palavra-passe incorreta." };
        }
        setSession(user.email);
        return { ok: true };
    }

    function setSession(email) {
        try {
            localStorage.setItem(SESSION_KEY, email);
        } catch (e) {}
        updateAuthUI();
    }

    function logout() {
        try {
            localStorage.removeItem(SESSION_KEY);
        } catch (e) {}
        updateAuthUI();
    }

    function currentUser() {
        try {
            var email = localStorage.getItem(SESSION_KEY);
            return email ? findUserByEmail(email) : null;
        } catch (e) {
            return null;
        }
    }

    function isLoggedIn() {
        return !!currentUser();
    }

    function updateAuthUI() {
        var btn = document.getElementById("account-btn");
        if (!btn) return;
        var user = currentUser();
        if (user) {
            btn.textContent = "Sair (" + user.nome.split(" ")[0] + ")";
            btn.setAttribute("href", "#");
            btn.dataset.mode = "logout";
        } else {
            btn.textContent = "Entrar";
            btn.setAttribute("href", "entrar.html");
            btn.dataset.mode = "login";
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        updateAuthUI();
        var btn = document.getElementById("account-btn");
        if (btn) {
            btn.addEventListener("click", function (e) {
                if (btn.dataset.mode === "logout") {
                    e.preventDefault();
                    if (confirm("Terminar sessão?")) {
                        logout();
                        window.location.href = "index.html";
                    }
                }
            });
        }
    });

    window.JelodanAuth = {
        registerUser: registerUser,
        login: login,
        logout: logout,
        currentUser: currentUser,
        isLoggedIn: isLoggedIn,
        updateAuthUI: updateAuthUI
    };
})(window);
