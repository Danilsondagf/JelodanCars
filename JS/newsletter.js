/* ============================================================
   VALIDAÇÃO DO FORMULÁRIO DE NEWSLETTER — JELODAN-CARS
   ============================================================ */

/**
 * Valida os dados do formulário de newsletter.
 * @param {string} nome
 * @param {string} email
 * @returns {{valido: boolean, erros: {nome: string, email: string}}}
 */
function validarNewsletter(nome, email) {
    const erros = { nome: "", email: "" };

    const nomeLimpo = (nome || "").trim();
    const emailLimpo = (email || "").trim();

    // --- Validação do nome ---
    if (nomeLimpo === "") {
        erros.nome = "Por favor, insira o seu nome.";
    } else if (nomeLimpo.length < 2) {
        erros.nome = "O nome deve ter pelo menos 2 caracteres.";
    } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/.test(nomeLimpo)) {
        erros.nome = "O nome não deve conter números ou símbolos.";
    }

    // --- Validação do email ---
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (emailLimpo === "") {
        erros.email = "Por favor, insira o seu email.";
    } else if (!regexEmail.test(emailLimpo)) {
        erros.email = "Insira um endereço de email válido (ex: nome@exemplo.com).";
    }

    const valido = erros.nome === "" && erros.email === "";
    return { valido, erros };
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("newsletter-form");
    if (!form) return;

    const campoNome = document.getElementById("nome");
    const campoEmail = document.getElementById("email");
    const erroNomeEl = document.getElementById("erro-nome");
    const erroEmailEl = document.getElementById("erro-email");
    const feedbackEl = document.getElementById("newsletter-feedback");

    function limparEstadoCampo(campo, erroEl) {
        campo.classList.remove("input-error");
        erroEl.textContent = "";
    }

    function mostrarErroCampo(campo, erroEl, mensagem) {
        campo.classList.add("input-error");
        erroEl.textContent = mensagem;
    }

    // Validação em tempo real ao sair do campo
    campoNome.addEventListener("blur", function () {
        const { erros } = validarNewsletter(campoNome.value, campoEmail.value);
        if (erros.nome) {
            mostrarErroCampo(campoNome, erroNomeEl, erros.nome);
        } else {
            limparEstadoCampo(campoNome, erroNomeEl);
        }
    });

    campoEmail.addEventListener("blur", function () {
        const { erros } = validarNewsletter(campoNome.value, campoEmail.value);
        if (erros.email) {
            mostrarErroCampo(campoEmail, erroEmailEl, erros.email);
        } else {
            limparEstadoCampo(campoEmail, erroEmailEl);
        }
    });

    // Validação ao submeter
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        feedbackEl.textContent = "";
        feedbackEl.classList.remove("success", "error");

        const { valido, erros } = validarNewsletter(campoNome.value, campoEmail.value);

        if (erros.nome) {
            mostrarErroCampo(campoNome, erroNomeEl, erros.nome);
        } else {
            limparEstadoCampo(campoNome, erroNomeEl);
        }

        if (erros.email) {
            mostrarErroCampo(campoEmail, erroEmailEl, erros.email);
        } else {
            limparEstadoCampo(campoEmail, erroEmailEl);
        }

        if (!valido) {
            feedbackEl.textContent = "Por favor, corrija os campos assinalados.";
            feedbackEl.classList.add("error");
            return;
        }

        // Formulário válido — aqui entraria o envio real (fetch para o backend/serviço de email)
        feedbackEl.textContent = "Subscrição efetuada com sucesso! Obrigado, " + campoNome.value.trim() + ".";
        feedbackEl.classList.add("success");
        form.reset();
    });
});
