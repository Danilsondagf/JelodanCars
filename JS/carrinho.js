/* ============================================================
   PÁGINA DO CARRINHO — JELODAN-CARS
   Renderiza os itens guardados pelo cart.js, permite alterar
   quantidades, remover itens e gerar um pedido via WhatsApp.
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {
    if (!window.JelodanCart) return;

    var emptyEl = document.getElementById("cart-empty");
    var authRequiredEl = document.getElementById("cart-auth-required");
    var contentEl = document.getElementById("cart-content");
    var itemsEl = document.getElementById("cart-items");
    var countEl = document.getElementById("cart-summary-count");
    var totalEl = document.getElementById("cart-summary-total");
    var clearBtn = document.getElementById("cart-clear-btn");

    function render() {
        if (!window.JelodanAuth || !window.JelodanAuth.isLoggedIn()) {
            authRequiredEl.removeAttribute("hidden");
            emptyEl.setAttribute("hidden", "");
            contentEl.setAttribute("hidden", "");
            return;
        }
        authRequiredEl.setAttribute("hidden", "");

        var cart = window.JelodanCart.getCart();

        if (cart.length === 0) {
            emptyEl.removeAttribute("hidden");
            contentEl.setAttribute("hidden", "");
            return;
        }

        emptyEl.setAttribute("hidden", "");
        contentEl.removeAttribute("hidden");

        itemsEl.innerHTML = "";
        var total = 0;
        var totalQty = 0;

        cart.forEach(function (item, index) {
            total += item.price * item.qty;
            totalQty += item.qty;

            var row = document.createElement("div");
            row.className = "cart-item";
            row.innerHTML =
                '<div class="cart-item-img"><img src="' + item.image + '" alt="' + item.brand + ' ' + item.model + '" loading="lazy"></div>' +
                '<div class="cart-item-info">' +
                    '<p class="cart-item-brand">' + item.brand + '</p>' +
                    '<p class="cart-item-model">' + item.model + '</p>' +
                    '<p class="cart-item-price">' + window.JelodanCart.formatKz(item.price) + '</p>' +
                '</div>' +
                '<div class="cart-item-qty">' +
                    '<button type="button" class="qty-btn qty-minus" aria-label="Diminuir quantidade">&minus;</button>' +
                    '<span class="qty-value">' + item.qty + '</span>' +
                    '<button type="button" class="qty-btn qty-plus" aria-label="Aumentar quantidade">+</button>' +
                '</div>' +
                '<button type="button" class="cart-item-remove" aria-label="Remover item">' +
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
                '</button>';

            row.querySelector(".qty-minus").addEventListener("click", function () {
                window.JelodanCart.changeQty(index, -1);
                render();
            });
            row.querySelector(".qty-plus").addEventListener("click", function () {
                window.JelodanCart.changeQty(index, 1);
                render();
            });
            row.querySelector(".cart-item-remove").addEventListener("click", function () {
                window.JelodanCart.removeFromCart(index);
                render();
            });

            itemsEl.appendChild(row);
        });

        countEl.textContent = totalQty;
        totalEl.textContent = window.JelodanCart.formatKz(total);
    }

    clearBtn.addEventListener("click", function () {
        if (confirm("Tem a certeza que deseja esvaziar o carrinho?")) {
            window.JelodanCart.clearCart();
            render();
        }
    });

    render();
});
