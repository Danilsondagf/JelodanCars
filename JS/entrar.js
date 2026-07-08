/* ============================================================
   FORMULÁRIO DE LOGIN — JELODAN-CARS
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("entrar-form");
    if (!form) return;

    var campoEmail = document.getElementById("email");
    var campoPassword = document.getElementById("password");
    var erroEmail = document.getElementById("erro-email");
    var erroPassword = document.getElementById("erro-password");
    var feedbackEl = document.getElementById("entrar-feedback");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        erroEmail.textContent = "";
        erroPassword.textContent = "";
        campoEmail.classList.remove("input-error");
        campoPassword.classList.remove("input-error");
        feedbackEl.textContent = "";
        feedbackEl.classList.remove("success", "error");

        var email = campoEmail.value.trim();
        var password = campoPassword.value;
        var temErro = false;

        if (email === "") {
            erroEmail.textContent = "Por favor, insira o seu email.";
            campoEmail.classList.add("input-error");
            temErro = true;
        }
        if (password === "") {
            erroPassword.textContent = "Por favor, insira a sua palavra-passe.";
            campoPassword.classList.add("input-error");
            temErro = true;
        }
        if (temErro) return;

        if (!window.JelodanAuth) {
            feedbackEl.textContent = "Não foi possível iniciar sessão. Tente novamente.";
            feedbackEl.classList.add("error");
            return;
        }

        var resultado = window.JelodanAuth.login(email, password);
        if (!resultado.ok) {
            feedbackEl.textContent = resultado.erro;
            feedbackEl.classList.add("error");
            if (resultado.erro.indexOf("email") !== -1) {
                campoEmail.classList.add("input-error");
            } else {
                campoPassword.classList.add("input-error");
            }
            return;
        }

        feedbackEl.textContent = "Sessão iniciada com sucesso! A redirecionar...";
        feedbackEl.classList.add("success");

        setTimeout(function () {
            window.location.href = "index.html";
        }, 1000);
    });
});
