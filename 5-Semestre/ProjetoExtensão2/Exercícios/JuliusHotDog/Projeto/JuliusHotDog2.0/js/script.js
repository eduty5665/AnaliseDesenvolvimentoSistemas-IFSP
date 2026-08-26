// 1. Banco de Dados de Produtos
const products = [
    { id: 1, name: "JULIO'S BRASA", price: 32.00, img: "./img/cachorroQuenteTrad.png", desc: "Salsicha artesanal defumada e bacon." },
    { id: 2, name: "MONSTER CHEDDAR", price: 35.00, img: "./img/cachorroQuenteTrad.png", desc: "Cheddar derretido e cebola crispy." },
    { id: 3, name: "FIRE DOG", price: 29.00, img: "./img/cachorroQuenteTrad.png", desc: "Maionese de jalapeño e queijo maçaricado." },
    { id: 4, name: "SUPREME HOT", price: 38.00, img: "./img/cachorroQuenteTrad.png", desc: "Duas salsichas e dobro de queijo." }
];

// 2. Carregar carrinho do LocalStorage ou iniciar vazio
let cart = JSON.parse(localStorage.getItem('julios_cart')) || [];

function init() {
    renderProducts();
    setupMenu();
    updateUI(); 
}

function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    
    grid.innerHTML = products.map(p => `
        <div class="card">
            <img src="${p.img}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p style="font-size: 0.85rem; color: #888; margin: 10px 0;">${p.desc}</p>
            <div style="color: #fff; font-weight: bold; font-size: 1.4rem; margin-bottom: 15px;">R$ ${p.price.toFixed(2)}</div>
            <button class="btn-primary" onclick="addToCart(${p.id})">ADICIONAR</button>
        </div>
    `).join('');
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveAndRefresh();
    
    // Feedback visual no botão
    const btn = event.target;
    btn.innerText = "ADICIONADO! 🔥";
    setTimeout(() => btn.innerText = "ADICIONAR", 1000);
}

function saveAndRefresh() {
    localStorage.setItem('julios_cart', JSON.stringify(cart));
    updateUI();
}

function removeItem(index) {
    cart.splice(index, 1);
    saveAndRefresh();
}

function updateUI() {
    const list = document.getElementById('cart-items-list');
    const total = document.getElementById('cart-total');
    const count = document.getElementById('cart-count');
    const count2 = document.getElementById('cart-count2');
    
    if (!list) return;

    // Renderiza itens no modal lateral
    list.innerHTML = cart.map((item, index) => `
        <div class="cart-item-mini" style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #222; padding-bottom:10px;">
            <div>
                <div style="font-weight:bold; font-size:0.9rem">${item.name} (x${item.quantity})</div>
                <div style="color:var(--fire)">R$ ${(item.price * item.quantity).toFixed(2)}</div>
            </div>
            <button onclick="removeItem(${index})" style="background:none; border:none; color:#ff4757; cursor:pointer; font-size:1.2rem">×</button>
        </div>
    `).join('');

    const totalVal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    total.innerText = `R$ ${totalVal.toFixed(2)}`;

    const totalItens = cart.reduce((acc, item) => acc + item.quantity, 0);
    count.innerText = totalItens;
    if(count2) count2.innerText = totalItens;
    
    count.style.display = totalItens > 0 ? "flex" : "none";
    if(count2) count2.style.display = totalItens > 0 ? "flex" : "none";
}

function toggleCart() {
    const modal = document.getElementById('cartModal');
    modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
}

function finishOrder() {
    if(cart.length === 0) return alert("Carrinho vazio!");
    const obs = document.getElementById('order-note').value;
    const itensStr = cart.map(i => `${i.quantity}x ${i.name}`).join('\n');
    const text = encodeURIComponent(`🍔 *Novo Pedido Julio's*\n\n${itensStr}\n\n*Total:* ${document.getElementById('cart-total').innerText}\n*Obs:* ${obs}`);
    window.open(`https://wa.me/5511999999999?text=${text}`); // Troque pelo seu número
}

function setupMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if (hamburger && navMenu) {
        hamburger.onclick = () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        };
    }
}

init();