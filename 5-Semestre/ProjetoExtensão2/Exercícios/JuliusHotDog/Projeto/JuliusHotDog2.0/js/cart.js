// 1. Recuperar dados do LocalStorage
let cart = JSON.parse(localStorage.getItem('julios_cart')) || [];

// 2. Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    setupMobileMenu();
    updateBadge();
});

// 3. Renderizar itens do carrinho
function renderCart() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p class="empty-msg" style="font-size: 1.2rem; color: #666;">Seu carrinho está vazio... 🌭</p>
                <a href="../index.html" class="btn-primary" style="display: inline-block; margin-top: 20px; width: auto; padding: 10px 30px;">VER CARDÁPIO</a>
            </div>`;
        updatePriceDisplay(0);
        return;
    }

    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>R$ ${item.price.toFixed(2)}</p>
            </div>
            <div class="item-actions">
                <div class="qty-selector" style="display: flex; align-items: center; background: #000; border-radius: 5px; border: 1px solid #333;">
                    <button class="btn-qty" onclick="changeQty(${index}, -1)" style="padding: 5px 12px; border: none; background: none; color: #793011; cursor: pointer; font-weight: bold;">-</button>
                    <span style="min-width: 20px; text-align: center;">${item.quantity}</span>
                    <button class="btn-qty" onclick="changeQty(${index}, 1)" style="padding: 5px 12px; border: none; background: none; color: #4ec915; cursor: pointer; font-weight: bold;">+</button>
                </div>
                <button class="btn-remove" onclick="removeItem(${index})" style="background: none; border: none; color: #ff4757; cursor: pointer; font-size: 1.1rem; margin-left: 10px;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');

    calculateTotals();
}

// 4. Funções de Manipulação
function changeQty(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        removeItem(index);
    } else {
        saveAndRefresh();
    }
}

function removeItem(index) {
    if(confirm("Remover este item do pedido?")) {
        cart.splice(index, 1);
        saveAndRefresh();
    }
}

function saveAndRefresh() {
    localStorage.setItem('julios_cart', JSON.stringify(cart));
    renderCart();
    updateBadge();
}

// 5. Cálculos
function calculateTotals() {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const taxa = 5.00;
    updatePriceDisplay(subtotal, taxa);
}

function updatePriceDisplay(subtotal, taxa = 0) {
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total-geral');
    
    if (subtotalEl) subtotalEl.innerText = `R$ ${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.innerText = `R$ ${(subtotal + (subtotal > 0 ? taxa : 0)).toFixed(2)}`;
}

function updateBadge() {
    const badge = document.getElementById('cart-count');
    const totalItens = cart.reduce((acc, item) => acc + item.quantity, 0);
    if (badge) {
        badge.innerText = totalItens;
        badge.style.display = totalItens > 0 ? "flex" : "none";
    }
}

// 6. Finalização
function finalizarPedido() {
    if (cart.length === 0) return alert("Adicione itens antes de finalizar!");
    
    const obs = document.getElementById('cart-obs').value;
    const itensStr = cart.map(i => `✅ *${i.quantity}x* ${i.name}`).join('\n');
    const total = document.getElementById('total-geral').innerText;
    
    const msg = `🍔 *NOVO PEDIDO JULIO'S HOT DOG*\n\n${itensStr}\n\n*Observações:* ${obs || 'Nenhuma'}\n\n*Total (com entrega): ${total}*\n\nComo deseja pagar?`;
    
    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(msg)}`);
}

// 7. Menu Hambúrguer
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.onclick = () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        };
    }
}