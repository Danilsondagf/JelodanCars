/* ============================================================
   SERVIÇO DE ENTREGA + PAGAMENTO — JELODAN-CARS
   Abre o formulário de dados de entrega/levantamento e pagamento
   assim que o cliente clica em "Finalizar Pedido" no carrinho,
   valida os dados e gera o pedido final (carrinho + entrega +
   pagamento) para o WhatsApp.
   ============================================================ */

var METODOS_PAGAMENTO_LABEL = {
    "multicaixa-express": "Multicaixa Express",
    "multicaixa": "Referência Multicaixa",
    "transferencia": "Transferência Bancária"
};

/**
 * Valida os dados do formulário de entrega e pagamento.
 * @param {Object} dados
 * @returns {{valido: boolean, erros: Object}}
 */
function validarEntrega(dados) {
    var erros = {
        nome: "", telefone: "", provincia: "", municipio: "",
        endereco: "", data: "", hora: "", pagamentoMetodo: "", comprovativo: ""
    };

    var modo = dados.modo === "levantamento" ? "levantamento" : "entrega";
    var pagamentoMomento = dados.pagamentoMomento === "entrega" ? "entrega" : "agora";

    var nome = (dados.nome || "").trim();
    var telefone = (dados.telefone || "").trim().replace(/[\s-]/g, "");
    var provincia = (dados.provincia || "").trim();
    var municipio = (dados.municipio || "").trim();
    var endereco = (dados.endereco || "").trim();
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

    // A morada só é obrigatória quando o cliente escolhe entrega ao domicílio.
    // Quem prefere levantar o veículo na empresa, em Luanda, não precisa de a preencher.
    if (modo === "entrega") {
        if (provincia === "") {
            erros.provincia = "Selecione a província de entrega.";
        }
        if (municipio === "") {
            erros.municipio = "Indique o município.";
        }
        if (endereco === "") {
            erros.endereco = "Indique o endereço completo de entrega.";
        }
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

    // O método de pagamento e o comprovativo só são obrigatórios se o
    // cliente escolher pagar agora; quem paga na entrega não precisa deles.
    if (pagamentoMomento === "agora") {
        if (!dados.pagamentoMetodo) {
            erros.pagamentoMetodo = "Selecione um método de pagamento.";
        }
        if (!dados.temComprovativo) {
            erros.comprovativo = "Anexe o comprovativo do pagamento.";
        }
    }

    var valido = Object.keys(erros).every(function (k) { return erros[k] === ""; });
    return { valido: valido, erros: erros };
}

document.addEventListener("DOMContentLoaded", function () {
    var checkoutBtn = document.getElementById("cart-checkout-btn");
    var modal = document.getElementById("modal-entrega");
    if (!checkoutBtn || !modal) return;

    var closeBtn = document.getElementById("modal-entrega-close");
    var form = document.getElementById("entrega-form");
    var WHATSAPP_NUMBER = "244976667108";

    var radiosModo = document.querySelectorAll("input[name='entrega-modo']");
    var blocoEndereco = document.getElementById("bloco-endereco-entrega");
    var avisoLevantamento = document.getElementById("aviso-levantamento");
    var labelData = document.getElementById("label-entrega-data");
    var labelHora = document.getElementById("label-entrega-hora");

    var radiosPagamentoMomento = document.querySelectorAll("input[name='pagamento-momento']");
    var blocoPagamentoAgora = document.getElementById("bloco-pagamento-agora");
    var avisoPagamentoEntrega = document.getElementById("aviso-pagamento-entrega");
    var paymentDetailsEl = document.getElementById("payment-details");

    var referenciaMulticaixa = null;

    var campos = {
        nome: document.getElementById("entrega-nome"),
        telefone: document.getElementById("entrega-telefone"),
        provincia: document.getElementById("entrega-provincia"),
        municipio: document.getElementById("entrega-municipio"),
        endereco: document.getElementById("entrega-endereco"),
        data: document.getElementById("entrega-data"),
        hora: document.getElementById("entrega-hora"),
        obs: document.getElementById("entrega-obs"),
        pagamentoMetodo: document.getElementById("pagamento-metodo"),
        comprovativo: document.getElementById("pagamento-comprovativo")
    };

    var errosEl = {
        nome: document.getElementById("erro-entrega-nome"),
        telefone: document.getElementById("erro-entrega-telefone"),
        provincia: document.getElementById("erro-entrega-provincia"),
        municipio: document.getElementById("erro-entrega-municipio"),
        endereco: document.getElementById("erro-entrega-endereco"),
        data: document.getElementById("erro-entrega-data"),
        hora: document.getElementById("erro-entrega-hora"),
        pagamentoMetodo: document.getElementById("erro-pagamento-metodo"),
        comprovativo: document.getElementById("erro-pagamento-comprovativo")
    };

    var feedbackEl = document.getElementById("entrega-feedback");

    function modoSelecionado() {
        var selecionado = document.querySelector("input[name='entrega-modo']:checked");
        return selecionado ? selecionado.value : "entrega";
    }

    function pagamentoMomentoSelecionado() {
        var selecionado = document.querySelector("input[name='pagamento-momento']:checked");
        return selecionado ? selecionado.value : "agora";
    }

    function atualizarModo() {
        var modo = modoSelecionado();
        var isLevantamento = modo === "levantamento";

        blocoEndereco.hidden = isLevantamento;
        avisoLevantamento.hidden = !isLevantamento;

        // Limpar erros e valores da morada quando não é preciso preenchê-la
        if (isLevantamento) {
            campos.provincia.classList.remove("input-error");
            campos.municipio.classList.remove("input-error");
            campos.endereco.classList.remove("input-error");
            errosEl.provincia.textContent = "";
            errosEl.municipio.textContent = "";
            errosEl.endereco.textContent = "";
        }

        labelData.textContent = isLevantamento ? "Data preferida de levantamento" : "Data preferida de entrega";
        labelHora.textContent = "Hora preferida";
    }

    function calcularTotal() {
        if (!window.JelodanCart) return 0;
        var cart = window.JelodanCart.getCart();
        var total = 0;
        cart.forEach(function (item) { total += item.price * item.qty; });
        return total;
    }

    function gerarReferenciaMulticaixa() {
        if (referenciaMulticaixa) return referenciaMulticaixa;
        referenciaMulticaixa = {
            entidade: "00611",
            referencia: String(Math.floor(100000000 + Math.random() * 900000000))
        };
        return referenciaMulticaixa;
    }

    function renderizarDetalhesPagamento() {
        var metodo = campos.pagamentoMetodo.value;
        var totalFormatado = window.JelodanCart ? window.JelodanCart.formatKz(calcularTotal()) : "";
        var html = "";

        if (metodo === "multicaixa-express") {
            html = '<p>Envie o valor total através da app <strong>Multicaixa Express</strong> para o número da JELODAN-CARS.</p>' +
                '<div class="payment-field-grid">' +
                    '<div class="payment-field"><span class="payment-field-label">Número</span><span class="payment-field-value">976 667 108</span></div>' +
                    '<div class="payment-field"><span class="payment-field-label">Valor</span><span class="payment-field-value">' + totalFormatado + '</span></div>' +
                '</div>' +
                '<p class="payment-note">Depois de pagar, tire uma captura de ecrã da confirmação e anexe-a abaixo.</p>';
        } else if (metodo === "multicaixa") {
            var ref = gerarReferenciaMulticaixa();
            html = '<p>Pague em qualquer ATM, Multicaixa Express ou homebanking usando esta referência:</p>' +
                '<div class="payment-field-grid">' +
                    '<div class="payment-field"><span class="payment-field-label">Entidade</span><span class="payment-field-value">' + ref.entidade + '</span></div>' +
                    '<div class="payment-field"><span class="payment-field-label">Referência</span><span class="payment-field-value">' + ref.referencia + '</span></div>' +
                    '<div class="payment-field"><span class="payment-field-label">Valor</span><span class="payment-field-value">' + totalFormatado + '</span></div>' +
                '</div>' +
                '<p class="payment-note">Referência gerada para este pedido — a nossa equipa confirma o pagamento após o envio do comprovativo.</p>';
        } else if (metodo === "transferencia") {
            html = '<p>Transfira o valor total para a conta bancária da JELODAN-CARS:</p>' +
                '<div class="payment-field-grid">' +
                    '<div class="payment-field"><span class="payment-field-label">IBAN</span><span class="payment-field-value">AO06 0040 0000 1111 2222 3339 4</span></div>' +
                    '<div class="payment-field"><span class="payment-field-label">Valor</span><span class="payment-field-value">' + totalFormatado + '</span></div>' +
                '</div>' +
                '<p class="payment-note">Beneficiário: JELODAN-CARS — a nossa equipa confirma os dados finais via WhatsApp.</p>';
        }

        paymentDetailsEl.innerHTML = html;
        paymentDetailsEl.hidden = html === "";
    }

    function atualizarPagamento() {
        var isAgora = pagamentoMomentoSelecionado() === "agora";

        blocoPagamentoAgora.hidden = !isAgora;
        avisoPagamentoEntrega.hidden = isAgora;

        if (!isAgora) {
            campos.pagamentoMetodo.classList.remove("input-error");
            campos.comprovativo.classList.remove("input-error");
            errosEl.pagamentoMetodo.textContent = "";
            errosEl.comprovativo.textContent = "";
            paymentDetailsEl.hidden = true;
        } else {
            renderizarDetalhesPagamento();
        }
    }

    radiosModo.forEach(function (radio) {
        radio.addEventListener("change", atualizarModo);
    });

    radiosPagamentoMomento.forEach(function (radio) {
        radio.addEventListener("change", atualizarPagamento);
    });

    campos.pagamentoMetodo.addEventListener("change", function () {
        renderizarDetalhesPagamento();
        if (campos.pagamentoMetodo.value) {
            errosEl.pagamentoMetodo.textContent = "";
            campos.pagamentoMetodo.classList.remove("input-error");
        }
    });

    campos.comprovativo.addEventListener("change", function () {
        if (campos.comprovativo.files && campos.comprovativo.files.length > 0) {
            errosEl.comprovativo.textContent = "";
            campos.comprovativo.classList.remove("input-error");
        }
    });

    // Não permitir escolher datas no passado no seletor
    var hojeISO = new Date().toISOString().split("T")[0];
    campos.data.setAttribute("min", hojeISO);

    function abrirModal() {
        if (!window.JelodanCart || window.JelodanCart.getCart().length === 0) return;

        // Pré-preencher com os dados da conta, se existirem
        if (window.JelodanAuth && window.JelodanAuth.isLoggedIn()) {
            var user = window.JelodanAuth.currentUser();
            if (user) {
                if (!campos.nome.value) campos.nome.value = user.nome || "";
                if (!campos.telefone.value) campos.telefone.value = user.telefone || "";
            }
        }

        feedbackEl.textContent = "";
        feedbackEl.classList.remove("success", "error");
        referenciaMulticaixa = null;
        atualizarModo();
        atualizarPagamento();

        modal.removeAttribute("hidden");
        document.body.classList.add("modal-open");
        campos.nome.focus();
    }

    function fecharModal() {
        modal.setAttribute("hidden", "");
        document.body.classList.remove("modal-open");
    }

    checkoutBtn.addEventListener("click", abrirModal);
    closeBtn.addEventListener("click", fecharModal);

    modal.addEventListener("click", function (event) {
        if (event.target === modal) fecharModal();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !modal.hasAttribute("hidden")) fecharModal();
    });

    function coletarDados() {
        return {
            modo: modoSelecionado(),
            nome: campos.nome.value,
            telefone: campos.telefone.value,
            provincia: campos.provincia.value,
            municipio: campos.municipio.value,
            endereco: campos.endereco.value,
            data: campos.data.value,
            hora: campos.hora.value,
            pagamentoMomento: pagamentoMomentoSelecionado(),
            pagamentoMetodo: campos.pagamentoMetodo.value,
            temComprovativo: !!(campos.comprovativo.files && campos.comprovativo.files.length > 0),
            comprovativoNome: (campos.comprovativo.files && campos.comprovativo.files[0]) ? campos.comprovativo.files[0].name : ""
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
            var resultado = validarEntrega(coletarDados());
            aplicarErros(resultado.erros);
        });
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!window.JelodanCart) return;
        var cart = window.JelodanCart.getCart();
        if (cart.length === 0) {
            fecharModal();
            return;
        }

        feedbackEl.textContent = "";
        feedbackEl.classList.remove("success", "error");

        var resultado = validarEntrega(coletarDados());
        aplicarErros(resultado.erros);

        if (!resultado.valido) {
            feedbackEl.textContent = "Por favor, corrija os campos assinalados.";
            feedbackEl.classList.add("error");
            return;
        }

        var dados = coletarDados();
        var isLevantamento = dados.modo === "levantamento";
        var isPagarAgora = dados.pagamentoMomento === "agora";
        var dataFormatada = dados.data.split("-").reverse().join("/");

        var total = 0;
        var lines = cart.map(function (item) {
            total += item.price * item.qty;
            return "• " + item.brand + " " + item.model + " (x" + item.qty + ") — " + window.JelodanCart.formatKz(item.price * item.qty);
        });

        var blocoRececao;
        if (isLevantamento) {
            blocoRececao = "\n\n--- Levantamento na Empresa ---\n" +
                "Local: Loja JELODAN-CARS, Luanda\n" +
                "Data preferida: " + dataFormatada + "\n" +
                "Hora preferida: " + dados.hora;
        } else {
            blocoRececao = "\n\n--- Dados de Entrega ---\n" +
                "Província: " + dados.provincia + "\n" +
                "Município: " + dados.municipio + "\n" +
                "Endereço: " + dados.endereco + "\n" +
                "Data preferida: " + dataFormatada + "\n" +
                "Hora preferida: " + dados.hora;
        }

        var blocoPagamento;
        if (isPagarAgora) {
            var metodoLabel = METODOS_PAGAMENTO_LABEL[dados.pagamentoMetodo] || dados.pagamentoMetodo;
            var refTexto = "";
            if (dados.pagamentoMetodo === "multicaixa" && referenciaMulticaixa) {
                refTexto = "\nReferência: Entidade " + referenciaMulticaixa.entidade + " / Referência " + referenciaMulticaixa.referencia;
            }
            blocoPagamento = "\n\n--- Pagamento ---\n" +
                "Estado: Pago agora\n" +
                "Método: " + metodoLabel +
                refTexto +
                "\nComprovativo: " + (dados.comprovativoNome || "anexado nesta conversa") + " (vou anexar o ficheiro aqui a seguir)";
        } else {
            blocoPagamento = "\n\n--- Pagamento ---\n" +
                "Estado: A pagar no ato da " + (isLevantamento ? "levantamento" : "entrega");
        }

        var mensagem = "Olá! Tenho interesse nos seguintes veículos da JELODAN-CARS:\n\n" +
            lines.join("\n") +
            "\n\nTotal estimado: " + window.JelodanCart.formatKz(total) +
            "\n\nNome: " + dados.nome +
            "\nTelefone: " + dados.telefone +
            blocoRececao +
            blocoPagamento +
            (campos.obs.value.trim() ? "\nObservações: " + campos.obs.value.trim() : "") +
            "\n\nPodem confirmar disponibilidade, condições e a " + (isLevantamento ? "recolha" : "entrega") + "?";

        var linkWhatsapp = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(mensagem);

        var avisoComprovativo = isPagarAgora
            ? ' Não se esqueça de anexar o ficheiro do comprovativo <strong>"' + dados.comprovativoNome + '"</strong> nessa conversa antes de enviar, já que o WhatsApp não permite anexá-lo automaticamente a partir daqui.'
            : "";

        feedbackEl.innerHTML = 'Pedido de compra preparado! <a href="' + linkWhatsapp + '" target="_blank" rel="noopener"><strong>Clique aqui para enviar via WhatsApp</strong></a> e a nossa equipa confirma consigo o mais rápido possível.' + avisoComprovativo;
        feedbackEl.classList.add("success");
    });
});
