/* ============================================================
   VALIDAÇÃO DO FORMULÁRIO "CRIAR CONTA" — JELODAN-CARS
   ============================================================ */

/**
 * Valida os dados do formulário de criação de conta.
 * @param {Object} dados
 * @param {string} dados.nome
 * @param {string} dados.email
 * @param {string} dados.telefone
 * @param {string} dados.password
 * @param {string} dados.confirmarPassword
 * @param {boolean} dados.aceitouTermos
 * @returns {{valido: boolean, erros: Object}}
 */
function validarCriarConta(dados) {
    var erros = {
        nome: "",
        email: "",
        telefone: "",
        password: "",
        confirmarPassword: "",
        termos: ""
    };

    var nome = (dados.nome || "").trim();
    var email = (dados.email || "").trim();
    var telefone = (dados.telefone || "").trim();
    var password = dados.password || "";
    var confirmarPassword = dados.confirmarPassword || "";

    // --- Nome ---
    if (nome === "") {
        erros.nome = "Por favor, insira o seu nome completo.";
    } else if (nome.length < 3) {
        erros.nome = "O nome deve ter pelo menos 3 caracteres.";
    } else if (nome.trim().split(/\s+/).length < 2) {
        erros.nome = "Insira o nome e o apelido.";
    } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/.test(nome)) {
        erros.nome = "O nome não deve conter números ou símbolos.";
    }

    // --- Email ---
    var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (email === "") {
        erros.email = "Por favor, insira o seu email.";
    } else if (!regexEmail.test(email)) {
        erros.email = "Insira um endereço de email válido.";
    }

    // --- Telefone (Angola: 9 dígitos, com ou sem +244) ---
    var telefoneNumeros = telefone.replace(/[\s-]/g, "");
    var regexTelefone = /^(\+?244)?9\d{8}$/;
    if (telefone === "") {
        erros.telefone = "Por favor, insira o seu número de telefone.";
    } else if (!regexTelefone.test(telefoneNumeros)) {
        erros.telefone = "Insira um número angolano válido (ex: 923 456 789).";
    }

    // --- Palavra-passe ---
    if (password === "") {
        erros.password = "Por favor, crie uma palavra-passe.";
    } else if (password.length < 8) {
        erros.password = "A palavra-passe deve ter pelo menos 8 caracteres.";
    } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        erros.password = "Use letras e números na palavra-passe.";
    }

    // --- Confirmar palavra-passe ---
    if (confirmarPassword === "") {
        erros.confirmarPassword = "Confirme a sua palavra-passe.";
    } else if (confirmarPassword !== password) {
        erros.confirmarPassword = "As palavras-passe não coincidem.";
    }

    // --- Termos ---
    if (!dados.aceitouTermos) {
        erros.termos = "Tem de aceitar os Termos e a Política de Privacidade.";
    }

    var valido = Object.keys(erros).every(function (chave) { return erros[chave] === ""; });
    return { valido: valido, erros: erros };
}

document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("criar-conta-form");
    if (!form) return;

    var campos = {
        nome: document.getElementById("nome"),
        email: document.getElementById("email"),
        telefone: document.getElementById("telefone"),
        password: document.getElementById("password"),
        confirmarPassword: document.getElementById("confirmar-password"),
        aceitarTermos: document.getElementById("aceitar-termos")
    };

    var errosEl = {
        nome: document.getElementById("erro-nome"),
        email: document.getElementById("erro-email"),
        telefone: document.getElementById("erro-telefone"),
        password: document.getElementById("erro-password"),
        confirmarPassword: document.getElementById("erro-confirmar-password"),
        termos: document.getElementById("erro-termos")
    };

    var feedbackEl = document.getElementById("criar-conta-feedback");

    function coletarDados() {
        return {
            nome: campos.nome.value,
            email: campos.email.value,
            telefone: campos.telefone.value,
            password: campos.password.value,
            confirmarPassword: campos.confirmarPassword.value,
            aceitouTermos: campos.aceitarTermos.checked
        };
    }

    function aplicarErros(erros) {
        [campos.nome, campos.email, campos.telefone, campos.password, campos.confirmarPassword].forEach(function (campo) {
            campo.classList.remove("input-error");
        });
        Object.keys(errosEl).forEach(function (chave) {
            errosEl[chave].textContent = erros[chave] || "";
        });
        if (erros.nome) campos.nome.classList.add("input-error");
        if (erros.email) campos.email.classList.add("input-error");
        if (erros.telefone) campos.telefone.classList.add("input-error");
        if (erros.password) campos.password.classList.add("input-error");
        if (erros.confirmarPassword) campos.confirmarPassword.classList.add("input-error");
    }

    // Validação em tempo real ao sair de cada campo
    [campos.nome, campos.email, campos.telefone, campos.password, campos.confirmarPassword].forEach(function (campo) {
        campo.addEventListener("blur", function () {
            var resultado = validarCriarConta(coletarDados());
            aplicarErros(resultado.erros);
        });
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        feedbackEl.textContent = "";
        feedbackEl.classList.remove("success", "error");

        var resultado = validarCriarConta(coletarDados());
        aplicarErros(resultado.erros);

        if (!resultado.valido) {
            feedbackEl.textContent = "Por favor, corrija os campos assinalados.";
            feedbackEl.classList.add("error");
            return;
        }

        // Conta válida — regista o utilizador (guardado localmente no navegador)
        var resultadoRegisto = window.JelodanAuth
            ? window.JelodanAuth.registerUser({
                nome: campos.nome.value,
                email: campos.email.value,
                telefone: campos.telefone.value,
                password: campos.password.value
              })
            : { ok: true };

        if (!resultadoRegisto.ok) {
            errosEl.email.textContent = resultadoRegisto.erro;
            campos.email.classList.add("input-error");
            feedbackEl.textContent = resultadoRegisto.erro;
            feedbackEl.classList.add("error");
            return;
        }

        feedbackEl.textContent = "Conta criada com sucesso! Bem-vindo(a), " + campos.nome.value.trim() + ". A redirecionar...";
        feedbackEl.classList.add("success");
        form.reset();

        setTimeout(function () {
            window.location.href = "index.html";
        }, 1600);
    });
});
