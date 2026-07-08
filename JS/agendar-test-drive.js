/* ============================================================
   AGENDAR TEST DRIVE — JELODAN-CARS
   ============================================================ */

/**
 * Valida os dados do formulário de agendamento de test drive.
 * @param {Object} dados
 * @returns {{valido: boolean, erros: Object}}
 */
function validarTestDrive(dados) {
    var erros = { nome: "", telefone: "", email: "", veiculo: "", data: "", hora: "" };

    var nome = (dados.nome || "").trim();
    var telefone = (dados.telefone || "").trim().replace(/[\s-]/g, "");
    var email = (dados.email || "").trim();
    var veiculo = (dados.veiculo || "").trim();
    var data = (dados.data || "").trim();
    var hora = (dados.hora || "").trim();

    if (nome === "") {
        erros.nome = "Por favor, insira o seu nome completo.";
    } else if (nome.length < 3) {
        erros.nome = "O nome deve ter pelo menos 3 caracteres.";
    }

    var regexTelefone = /^(\+?244)?9\d{8}$/;
    if (telefone === "") {
        erros.telefone = "Por favor, insira o seu número de telefone.";
    } else if (!regexTelefone.test(telefone)) {
        erros.telefone = "Insira um número angolano válido (ex: 923 456 789).";
    }

    var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (email === "") {
        erros.email = "Por favor, insira o seu email.";
    } else if (!regexEmail.test(email)) {
        erros.email = "Insira um endereço de email válido.";
    }

    if (veiculo === "") {
        erros.veiculo = "Indique qual o veículo que deseja testar.";
    }

    if (data === "") {
        erros.data = "Escolha uma data preferida.";
    } else {
        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        var dataEscolhida = new Date(data + "T00:00:00");
        if (dataEscolhida < hoje) {
            erros.data = "A data não pode ser no passado.";
        }
    }

    if (hora === "") {
        erros.hora = "Escolha uma hora preferida.";
    }

    var valido = Object.keys(erros).every(function (k) { return erros[k] === ""; });
    return { valido: valido, erros: erros };
}

document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("test-drive-form");
    if (!form) return;

    var campos = {
        nome: document.getElementById("nome"),
        telefone: document.getElementById("telefone"),
        email: document.getElementById("email"),
        veiculo: document.getElementById("veiculo"),
        data: document.getElementById("data"),
        hora: document.getElementById("hora"),
        mensagem: document.getElementById("mensagem")
    };

    var errosEl = {
        nome: document.getElementById("erro-nome"),
        telefone: document.getElementById("erro-telefone"),
        email: document.getElementById("erro-email"),
        veiculo: document.getElementById("erro-veiculo"),
        data: document.getElementById("erro-data"),
        hora: document.getElementById("erro-hora")
    };

    var feedbackEl = document.getElementById("test-drive-feedback");
    var WHATSAPP_NUMBER = "244976667108";

    // Pré-preencher o veículo a partir da query string (?marca=...&modelo=...)
    var params = new URLSearchParams(window.location.search);
    var marca = params.get("marca") || "";
    var modelo = params.get("modelo") || "";
    if (marca || modelo) {
        campos.veiculo.value = (marca + " " + modelo).trim();
    }

    // Não permitir escolher datas no passado no seletor
    var hojeISO = new Date().toISOString().split("T")[0];
    campos.data.setAttribute("min", hojeISO);

    function coletarDados() {
        return {
            nome: campos.nome.value,
            telefone: campos.telefone.value,
            email: campos.email.value,
            veiculo: campos.veiculo.value,
            data: campos.data.value,
            hora: campos.hora.value
        };
    }

    function aplicarErros(erros) {
        Object.keys(campos).forEach(function (chave) {
            if (campos[chave] && errosEl[chave]) campos[chave].classList.remove("input-error");
        });
        Object.keys(errosEl).forEach(function (chave) {
            errosEl[chave].textContent = erros[chave] || "";
            if (erros[chave]) campos[chave].classList.add("input-error");
        });
    }

    Object.keys(errosEl).forEach(function (chave) {
        campos[chave].addEventListener("blur", function () {
            var resultado = validarTestDrive(coletarDados());
            aplicarErros(resultado.erros);
        });
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        feedbackEl.textContent = "";
        feedbackEl.classList.remove("success", "error");

        var resultado = validarTestDrive(coletarDados());
        aplicarErros(resultado.erros);

        if (!resultado.valido) {
            feedbackEl.textContent = "Por favor, corrija os campos assinalados.";
            feedbackEl.classList.add("error");
            return;
        }

        var dados = coletarDados();
        var dataFormatada = dados.data.split("-").reverse().join("/");
        var mensagem = "Olá! Gostaria de agendar um test drive na JELODAN-CARS.\n\n" +
            "Nome: " + dados.nome + "\n" +
            "Telefone: " + dados.telefone + "\n" +
            "Email: " + dados.email + "\n" +
            "Veículo: " + dados.veiculo + "\n" +
            "Data preferida: " + dataFormatada + "\n" +
            "Hora preferida: " + dados.hora +
            (campos.mensagem.value.trim() ? "\nMensagem: " + campos.mensagem.value.trim() : "") +
            "\n\nPodem confirmar a disponibilidade?";

        feedbackEl.innerHTML = 'Pedido preparado! <a href="https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(mensagem) + '" target="_blank" rel="noopener"><strong>Clique aqui para enviar via WhatsApp</strong></a> e confirmamos consigo o mais rápido possível.';
        feedbackEl.classList.add("success");
    });
});
