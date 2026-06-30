const API_URL = 'http://localhost:5000/api';
let currentUser = null;
let cart = [];
let products = [];
let exchangeRates = { BRL: 1, USD: 0, EUR: 0 };
let currentCurrency = 'BRL';

const productsDB = [
  {
    id: 1,
    name: 'Sérum Facial Luminosidade',
    description: 'Sérum com vitamina C e ácido hialurônico para radiância.',
    price: 189.90,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&h=500&fit=crop',
    rating: 4.8,
    reviews: 324
  },
  {
    id: 2,
    name: 'Creme Facial Nutritivo',
    description: 'Creme anti-envelhecimento com colágeno e peptídeos.',
    price: 234.90,
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop',
    rating: 4.9,
    reviews: 412
  },
  {
    id: 3,
    name: 'Máscara Facial Premium',
    description: 'Máscara de hidratação profunda com ouro 24K.',
    price: 156.90,
    image: 'https://images.unsplash.com/photo-1610540311535-4f29f7b36fc7?w=500&h=500&fit=crop',
    rating: 4.7,
    reviews: 287
  },
  {
    id: 4,
    name: 'Tônico Facial Puro',
    description: 'Tônico equilibrador com água de rosas e extratos naturais.',
    price: 129.90,
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop',
    rating: 4.6,
    reviews: 198
  },
  {
    id: 5,
    name: 'Cleansing Balm Deluxe',
    description: 'Bálsamo de limpeza suave que remove todas as impurezas.',
    price: 167.90,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop',
    rating: 4.8,
    reviews: 356
  },
  {
    id: 6,
    name: 'Eye Contour Luxe',
    description: 'Creme para os olhos com tecnologia anti-rugas avançada.',
    price: 198.90,
    image: 'https://images.unsplash.com/photo-1607101657215-b89f8feccc33?w=500&h=500&fit=crop',
    rating: 4.9,
    reviews: 289
  }
];

async function init() {
  products = productsDB;
  await fetchExchangeRates();
  render();
  loadUserFromLocalStorage();
}

function render() {
  const app = document.getElementById('app');
  if (!currentUser) {
    app.innerHTML = renderAuthPage();
  } else {
    app.innerHTML = renderHomePage();
  }
}

function renderAuthPage() {
  return `
    <header>
      <div class="header-container">
        <a href="#" class="logo">AURORAFACE</a>
      </div>
    </header>
    <div class="container">
      <div class="auth-container">
        <div id="auth-form-container">${renderLoginForm()}</div>
      </div>
    </div>
  `;
}

function renderLoginForm() {
  return `
    <h2>Bem-vindo à AuroraFace</h2>
    <form onsubmit="handleLogin(event)">
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="login-email" placeholder="seu@email.com" required>
      </div>
      <div class="form-group">
        <label>Senha</label>
        <input type="password" id="login-password" placeholder="••••••••" required>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%;">Entrar</button>
      <div class="form-footer">
        <p>Não tem conta? <a onclick="showRegisterForm()">Criar conta</a></p>
      </div>
    </form>
  `;
}

function renderRegisterForm() {
  return `
    <h2>Criar Conta AuroraFace</h2>
    <form onsubmit="handleRegister(event)">
      <div class="form-group">
        <label>Nome Completo</label>
        <input type="text" id="register-name" placeholder="Seu nome" required>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="register-email" placeholder="seu@email.com" required>
      </div>
      <div class="form-group">
        <label>Telefone</label>
        <input type="tel" id="register-phone" placeholder="(11) 9999-9999" required>
      </div>
      <div class="form-group">
        <label>País</label>
        <select id="register-country" required>
          <option value="BR">Brasil 🇧🇷</option>
          <option value="US">Estados Unidos 🇺🇸</option>
          <option value="PT">Portugal 🇵🇹</option>
          <option value="DE">Alemanha 🇩🇪</option>
          <option value="FR">França 🇫🇷</option>
          <option value="ES">Espanha 🇪🇸</option>
        </select>
      </div>
      <div class="form-group">
        <label>Endereço Completo</label>
        <textarea id="register-address" placeholder="Rua, número, complemento, cidade, CEP" required></textarea>
      </div>
      <div class="form-group">
        <label>Senha</label>
        <input type="password" id="register-password" placeholder="••••••••" required>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%;">Criar Conta</button>
      <div class="form-footer">
        <p>Já tem conta? <a onclick="showLoginForm()">Entrar</a></p>
      </div>
    </form>
  `;
}

function showLoginForm() {
  document.getElementById('auth-form-container').innerHTML = renderLoginForm();
}

function showRegisterForm() {
  document.getElementById('auth-form-container').innerHTML = renderRegisterForm();
}

function renderHomePage() {
  return `
    <header>
      <div class="header-container">
        <a href="#" class="logo" onclick="showHome()">AURORAFACE</a>
        <div class="nav-buttons">
          <button class="cart-icon" onclick="showCart()">🛍️${cart.length > 0 ? `<span class="cart-badge">${cart.length}</span>` : ''}</button>
          <button class="btn btn-secondary" onclick="logout()">Sair</button>
        </div>
      </div>
    </header>
    <div class="container">
      <div class="hero">
        <h1>Bem-vinda, ${currentUser.name.split(' ')[0]}!</h1>
        <p>Descubra nossa coleção exclusiva de cosméticos premium</p>
        <select id="currency-selector" onchange="changeCurrency()" style="padding: 0.5rem 1rem; border: 1px solid var(--border); border-radius: 4px;">
          <option value="BRL">BRL - Real Brasileiro (R$)</option>
          <option value="USD">USD - Dólar Americano ($)</option>
          <option value="EUR">EUR - Euro (€)</option>
        </select>
      </div>
      <div class="products-section">
        <h2 class="section-title">Produtos Destacados</h2>
        <div class="products-grid">${products.map(p => renderProductCard(p)).join('')}</div>
      </div>
    </div>
    <div id="cart-page" class="cart-page">${renderCartPage()}</div>
  `;
}

function renderProductCard(product) {
  const price = convertPrice(product.price);
  const symbol = getCurrencySymbol(currentCurrency);
  return `
    <div class="product-card">
      <img src="${product.image}" class="product-image">
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-price">${symbol} ${price.toFixed(2).replace('.', ',')}</div>
        <div class="product-rating">⭐ ${product.rating} (${product.reviews})</div>
        <button class="btn-add-cart" onclick="addToCart(${product.id})">Adicionar ao Carrinho</button>
      </div>
    </div>
  `;
}

function renderCartPage() {
  if (cart.length === 0) {
    return `<div class="container"><div class="cart-items" style="text-align: center; padding: 2rem;"><h2 style="color: #999;">Seu carrinho está vazio</h2><button class="btn btn-primary" onclick="showHome()" style="margin-top: 1rem;">Continuar Comprando</button></div></div>`;
  }
  const total = calculateTotal();
  const symbol = getCurrencySymbol(currentCurrency);
  return `
    <div class="container">
      <h2 class="section-title">Meu Carrinho</h2>
      <div class="cart-container">
        <div class="cart-items">${cart.map((item, i) => renderCartItem(item, i)).join('')}</div>
        <div class="cart-summary">
          <div class="summary-row"><span>Subtotal:</span><span>${symbol} ${total.toFixed(2).replace('.', ',')}</span></div>
          <div class="summary-row total"><span>Total:</span><span>${symbol} ${total.toFixed(2).replace('.', ',')}</span></div>
          <div class="payment-methods">
            <h3>💳 Forma de Pagamento</h3>
            <div id="pix-container" class="pix-container">
              <p style="color: var(--text); font-weight: 500;">Escaneie o QR Code PIX para pagar</p>
              <div class="pix-qrcode" id="pix-qrcode"></div>
              <div class="pix-key-display"><strong>Chave PIX:</strong> ${maskPixKey('13991329445')}<button type="button" class="copy-btn" onclick="copyPixKey('13991329445')">Copiar Chave</button></div>
            </div>
            <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" onclick="processPayment()">Finalizar Compra com PIX</button>
            <button class="btn btn-secondary" style="width: 100%; margin-top: 0.5rem;" onclick="showHome()">Continuar Comprando</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCartItem(item, index) {
  const product = products.find(p => p.id === item.productId);
  const price = convertPrice(item.price);
  const symbol = getCurrencySymbol(currentCurrency);
  return `
    <div class="cart-item">
      <img src="${product.image}" class="cart-item-image">
      <div class="cart-item-details">
        <h3>${product.name}</h3>
        <p>${symbol} ${price.toFixed(2).replace('.', ',')}</p>
      </div>
      <div style="text-align: right;">
        <div class="cart-item-quantity">
          <button class="qty-btn" onclick="decreaseQuantity(${index})">−</button>
          <span style="width: 30px; text-align: center;">${item.quantity}</span>
          <button class="qty-btn" onclick="increaseQuantity(${index})">+</button>
        </div>
        <button style="background: none; border: none; color: var(--error); cursor: pointer; margin-top: 0.5rem; font-size: 1.2rem;" onclick="removeFromCart(${index})">✕</button>
      </div>
    </div>
  `;
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ productId: product.id, price: product.price, quantity: 1 });
  }
  showToast('Produto adicionado ao carrinho!');
  render();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  render();
}

function increaseQuantity(index) {
  cart[index].quantity++;
  render();
}

function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
  } else {
    removeFromCart(index);
  }
  render();
}

function calculateTotal() {
  return cart.reduce((total, item) => total + (convertPrice(item.price) * item.quantity), 0);
}

function getCurrencySymbol(currency) {
  const symbols = { 'BRL': 'R$', 'USD': '$', 'EUR': '€' };
  return symbols[currency] || 'R$';
}

function convertPrice(priceInBRL) {
  return priceInBRL * (exchangeRates[currentCurrency] || 1);
}

function changeCurrency() {
  currentCurrency = document.getElementById('currency-selector').value;
  render();
}

async function fetchExchangeRates() {
  try {
    const response = await fetch(`${API_URL}/currency/rates`);
    const data = await response.json();
    exchangeRates = data.rates;
  } catch (error) {
    exchangeRates = { BRL: 1, USD: 5.0, EUR: 5.5 };
  }
}

function maskPixKey(key) {
  if (key.length <= 4) return key;
  return key.substring(0, 2) + '*'.repeat(key.length - 4) + key.substring(key.length - 2);
}

async function generatePixQRCode() {
  try {
    const response = await fetch(`${API_URL}/payment/pix-qrcode`);
    const data = await response.json();
    const container = document.getElementById('pix-qrcode');
    if (container) {
      container.innerHTML = `<img src="${data.qrCode}" alt="QR Code PIX">`;
    }
  } catch (error) {
    showToast('Erro ao gerar QR Code PIX', 'error');
  }
}

function copyPixKey(key) {
  navigator.clipboard.writeText(key).then(() => {
    showToast('Chave PIX copiada!');
  });
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      currentUser = data.user;
      localStorage.setItem('user', JSON.stringify(currentUser));
      localStorage.setItem('token', data.token);
      render();
      showToast('Login realizado com sucesso!');
    } else {
      showToast(data.message, 'error');
    }
  } catch (error) {
    showToast('Erro ao fazer login', 'error');
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const phone = document.getElementById('register-phone').value;
  const country = document.getElementById('register-country').value;
  const address = document.getElementById('register-address').value;
  const password = document.getElementById('register-password').value;
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, address, country })
    });
    const data = await response.json();
    if (response.ok) {
      currentUser = data.user;
      localStorage.setItem('user', JSON.stringify(currentUser));
      localStorage.setItem('token', data.token);
      render();
      showToast('Conta criada com sucesso!');
    } else {
      showToast(data.message, 'error');
    }
  } catch (error) {
    showToast('Erro ao criar conta', 'error');
  }
}

function logout() {
  currentUser = null;
  cart = [];
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  render();
}

function loadUserFromLocalStorage() {
  const user = localStorage.getItem('user');
  if (user) {
    currentUser = JSON.parse(user);
  }
}

async function processPayment() {
  if (cart.length === 0) {
    showToast('Carrinho vazio', 'error');
    return;
  }
  await generatePixQRCode();
  const container = document.getElementById('pix-container');
  if (container) {
    container.classList.add('active');
  }
  await createOrder();
  showToast('Escaneie o QR Code PIX para completar o pagamento', 'success');
}

async function createOrder() {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        items: cart,
        total: calculateTotal(),
        address: currentUser.address
      })
    });
    const data = await response.json();
    if (response.ok) {
      setTimeout(() => {
        cart = [];
        showToast('Pedido criado! Aguardando pagamento PIX.');
        setTimeout(() => {
          showHome();
        }, 2000);
      }, 2000);
    }
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
  }
}

function showHome() {
  document.getElementById('cart-page').classList.remove('active');
}

function showCart() {
  document.getElementById('cart-page').classList.add('active');
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.backgroundColor = type === 'error' ? '#f44336' : '#4caf50';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

window.addEventListener('DOMContentLoaded', init);
