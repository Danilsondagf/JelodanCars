/* ============================================================
   CARRINHO DE COMPRAS — JELODAN-CARS
   Gestão do carrinho guardado em localStorage, atualização do
   contador no cabeçalho e botões "Adicionar ao carrinho" nos
   cards de veículos.
   ============================================================ */
(function (window) {
    "use strict";

    var STORAGE_KEY = "jelodan-cart";

    function getCart() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveCart(cart) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        } catch (e) {
            /* localStorage indisponível */
        }
    }

    function totalItems(cart) {
        return cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
    }

    function parsePrice(text) {
        // "15.000.000 Kz" -> 15000000
        var digits = (text || "").replace(/[^\d]/g, "");
        return digits ? parseInt(digits, 10) : 0;
    }

    function formatKz(value) {
        return value.toLocaleString("pt-PT") + " Kz";
    }

    function addToCart(item) {
        var cart = getCart();
        var existing = cart.find(function (c) {
            return c.brand === item.brand && c.model === item.model;
        });
        if (existing) {
            existing.qty += 1;
        } else {
            item.qty = 1;
            cart.push(item);
        }
        saveCart(cart);
        updateCartBadge();
        return cart;
    }

    function removeFromCart(index) {
        var cart = getCart();
        cart.splice(index, 1);
        saveCart(cart);
        updateCartBadge();
        return cart;
    }

    function changeQty(index, delta) {
        var cart = getCart();
        if (!cart[index]) return cart;
        cart[index].qty += delta;
        if (cart[index].qty < 1) cart[index].qty = 1;
        saveCart(cart);
        updateCartBadge();
        return cart;
    }

    function clearCart() {
        saveCart([]);
        updateCartBadge();
    }

    function updateCartBadge() {
        var badge = document.getElementById("cart-count");
        if (!badge) return;
        var count = totalItems(getCart());
        badge.textContent = count;
        if (count > 0) {
            badge.removeAttribute("hidden");
        } else {
            badge.setAttribute("hidden", "");
        }
    }

    function initAddToCartButtons() {
        var buttons = document.querySelectorAll(".btn-add-cart");
        buttons.forEach(function (btn) {
            btn.addEventListener("click", function (e) {
                e.preventDefault();

                if (!window.JelodanAuth || !window.JelodanAuth.isLoggedIn()) {
                    var irCriarConta = confirm(
                        "Só quem tem conta na JELODAN-CARS pode adicionar veículos ao carrinho.\n\n" +
                        "Deseja criar uma conta agora?"
                    );
                    if (irCriarConta) {
                        window.location.href = "criar-conta.html";
                    }
                    return;
                }

                var card = btn.closest(".car-card");
                if (!card) return;

                var brand = (card.querySelector(".car-brand") || {}).textContent || "";
                var model = (card.querySelector(".car-model") || {}).textContent || "";
                var priceText = (card.querySelector(".car-price") || {}).textContent || "";
                var img = card.querySelector(".car-image-wrap img, img");

                addToCart({
                    brand: brand.trim(),
                    model: model.trim(),
                    price: parsePrice(priceText),
                    image: img ? img.getAttribute("src") : ""
                });

                btn.classList.add("is-added");
                setTimeout(function () { btn.classList.remove("is-added"); }, 1200);
            });
        });
    }

    function initTestDriveButtons() {
        var buttons = document.querySelectorAll(".btn-test-drive");
        buttons.forEach(function (btn) {
            btn.addEventListener("click", function (e) {
                e.preventDefault();
                var card = btn.closest(".car-card");
                var brand = "";
                var model = "";
                if (card) {
                    brand = ((card.querySelector(".car-brand") || {}).textContent || "").trim();
                    model = ((card.querySelector(".car-model") || {}).textContent || "").trim();
                }
                var url = "agendar-test-drive.html";
                if (brand || model) {
                    url += "?marca=" + encodeURIComponent(brand) + "&modelo=" + encodeURIComponent(model);
                }
                window.location.href = url;
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        updateCartBadge();
        initAddToCartButtons();
        initTestDriveButtons();
    });

    // Exposto globalmente para a página do carrinho (carrinho.html)
    window.JelodanCart = {
        getCart: getCart,
        addToCart: addToCart,
        removeFromCart: removeFromCart,
        changeQty: changeQty,
        clearCart: clearCart,
        totalItems: totalItems,
        formatKz: formatKz
    };
})(window);
