// Dados iniciais ou carregados
let PRODUTOS = JSON.parse(localStorage.getItem('julios_produtos')) || [
    { id: 1, nome: "Julio's Brasa", desc: "Salsicha artesanal, bacon crocante, cheddar e barbecue especial.", preco: 32.00 }
];

let INSUMOS = JSON.parse(localStorage.getItem('julios_insumos')) || [
    { id: 1, nome: "Pão Brioche", qtd: 40, unid: "UN" }
];

// NAVEGAÇÃO
function switchTab(evt, tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    evt.currentTarget.classList.add('active');
}

// MODAIS
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { 
    document.getElementById(id).style.display = 'none'; 
    if(id === 'modalProduto') {
        document.getElementById('form-produto').reset();
        document.getElementById('prod-id').value = '';
    }
}

// RENDERIZAÇÃO DE PRODUTOS
function renderProdutos() {
    const container = document.getElementById('render-produtos');
    if(!container) return;

    container.innerHTML = PRODUTOS.map(p => `
        <div class="product-card-adm">
            <div>
                <h4>${p.nome}</h4>
                <p>${p.desc}</p>
                <span class="price">R$ ${p.preco.toFixed(2)}</span>
            </div>
            <div class="card-actions">
                <button onclick="editarProduto(${p.id})" style="background:none; border:none; color:#3498db; cursor:pointer;"><i class="fas fa-edit"></i></button>
                <button onclick="excluirProduto(${p.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
    
    localStorage.setItem('julios_produtos', JSON.stringify(PRODUTOS));
    renderRelatorios();
}

// RENDERIZAÇÃO DE INSUMOS (ESTILO CARDS IGUAL PRODUTOS)
function renderInsumos() {
    const container = document.getElementById('render-insumos');
    if(!container) return;

    container.innerHTML = INSUMOS.map(i => `
        <div class="insumo-card-adm">
            <div>
                <h4>${i.nome}</h4>
                <p>Quantidade em estoque disponível para uso.</p>
                <span class="stock-badge">${i.qtd} ${i.unid}</span>
            </div>
            <div class="card-actions">
                <button onclick="excluirInsumo(${i.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
    
    localStorage.setItem('julios_insumos', JSON.stringify(INSUMOS));
}

// LOGICA PRODUTOS
function salvarProduto(e) {
    e.preventDefault();
    const id = document.getElementById('prod-id').value;
    const nome = document.getElementById('prod-nome').value;
    const desc = document.getElementById('prod-desc').value;
    const preco = parseFloat(document.getElementById('prod-preco').value);

    if (id) {
        const index = PRODUTOS.findIndex(p => p.id == id);
        PRODUTOS[index] = { id: parseInt(id), nome, desc, preco };
    } else {
        PRODUTOS.push({ id: Date.now(), nome, desc, preco });
    }

    renderProdutos();
    closeModal('modalProduto');
}

function editarProduto(id) {
    const p = PRODUTOS.find(prod => prod.id === id);
    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-nome').value = p.nome;
    document.getElementById('prod-desc').value = p.desc;
    document.getElementById('prod-preco').value = p.preco;
    openModal('modalProduto');
}

function excluirProduto(id) {
    if(confirm("Remover do cardápio?")) {
        PRODUTOS = PRODUTOS.filter(p => p.id !== id);
        renderProdutos();
    }
}

// LOGICA INSUMOS
function adicionarInsumo(e) {
    e.preventDefault();
    INSUMOS.push({
        id: Date.now(),
        nome: document.getElementById('ins-nome').value,
        qtd: document.getElementById('ins-qtd').value,
        unid: document.getElementById('ins-unid').value
    });
    renderInsumos();
    closeModal('modalInsumo');
}

function excluirInsumo(id) {
    if(confirm("Excluir este insumo?")) {
        INSUMOS = INSUMOS.filter(i => i.id !== id);
        renderInsumos();
    }
}

// RELATÓRIOS
function renderRelatorios() {
    const totalFaturamento = PRODUTOS.reduce((acc, p) => acc + p.preco, 0);
    document.getElementById('fat-hoje').innerText = `R$ ${totalFaturamento.toFixed(2)}`;
    document.getElementById('total-pedidos').innerText = "24";
}

window.onload = () => {
    renderProdutos();
    renderInsumos();
    renderRelatorios();
};