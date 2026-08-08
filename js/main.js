/* =========================================================
   ZARF PEARL — main.js
   Product catalog, cart (localStorage), rendering, checkout.

   PAYMENT NOTE FOR LATER:
   bKash / Nagad / Card here are UI-only mockups. Real payment
   processing requires a server (bKash Merchant/PGW API, Nagad
   API, or a card gateway like SSLCommerz/Stripe). When you move
   to paid hosting, replace the `mockProcessPayment()` function
   below with real API calls from your backend. Everything else
   (cart, catalog, forms) can stay exactly as-is.
   ========================================================= */

const CART_KEY = "zarfPearlCart";
const ORDERS_KEY = "zarfPearlOrders";
const CURRENCY = "৳";

/* ---------- Product catalog ---------- */
const PRODUCTS = [
  { id:"hanadi-akoya-strand", name:"Hanadi Akoya Strand", type:"Sea Pearl", origin:"Japan · Akoya", price:45000,
    desc:"A single strand of rosé-white Akoya pearls, hand-knotted for an heirloom finish.",
    tone:["#FBF7F0","#E7D8C9"], tag:"Bestseller" },
  { id:"kyoto-snow-studs", name:"Kyoto Snow Studs", type:"Sea Pearl", origin:"Japan · Akoya", price:12500,
    desc:"Petite luminous studs, cut for everyday elegance with a soft satin lustre.",
    tone:["#FFFFFF","#E3D6C6"] },
  { id:"zulaikha-southsea-pendant", name:"Zulaikha South Sea Pendant", type:"Sea Pearl", origin:"Japan · South Sea", price:38000,
    desc:"A golden South Sea pearl set on a fine gold vermeil chain — warm and understated.",
    tone:["#E9C77F","#B8935A"], tag:"Limited" },
  { id:"nur-freshwater-bracelet", name:"Nur Freshwater Bracelet", type:"Cultivated Pearl", origin:"China · Freshwater", price:6800,
    desc:"Soft ivory freshwater pearls strung on an elastic band for easy everyday wear.",
    tone:["#F7F2E9","#D9C6B8"] },
  { id:"layla-baroque-ring", name:"Layla Baroque Ring", type:"Cultivated Pearl", origin:"China · Freshwater", price:4200,
    desc:"An organically shaped baroque pearl on a slim adjustable gold-tone band.",
    tone:["#F1E3D3","#C9A876"] },
  { id:"amara-rose-drops", name:"Amara Rosé Drop Earrings", type:"Cultivated Pearl", origin:"China · Freshwater", price:7900,
    desc:"Blush-toned drop pearls that catch a warm rosé hue in the light.",
    tone:["#F0D9CE","#D8A6A0"] },
  { id:"suhana-double-choker", name:"Suhana Double Strand Choker", type:"Sea Pearl", origin:"Japan · Akoya", price:58000,
    desc:"Two graduated Akoya strands layered into a statement choker.",
    tone:["#FBF8F2","#E2D2B8"], tag:"New" },
  { id:"iman-minimalist-chain", name:"Iman Minimalist Pearl Chain", type:"Cultivated Pearl", origin:"China · Freshwater", price:5300,
    desc:"A single floating pearl on a fine chain — quietly elegant, worn daily.",
    tone:["#F5F0E6","#DDC9AE"] }
];

/* ---------- Utilities ---------- */
function fmt(n){ return CURRENCY + n.toLocaleString("en-BD"); }
function getCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }catch(e){ return {}; } }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartBadge(); }
function cartCount(cart){ return Object.values(cart).reduce((a,b)=>a+b,0); }
function cartTotal(cart){
  return Object.entries(cart).reduce((sum,[id,qty])=>{
    const p = PRODUCTS.find(p=>p.id===id);
    return p ? sum + p.price*qty : sum;
  },0);
}
function addToCart(id, qty=1){
  const cart = getCart();
  cart[id] = (cart[id]||0) + qty;
  saveCart(cart);
}
function setQty(id, qty){
  const cart = getCart();
  if(qty<=0){ delete cart[id]; } else { cart[id]=qty; }
  saveCart(cart);
  renderCartPage();
}
function removeFromCart(id){
  const cart = getCart();
  delete cart[id];
  saveCart(cart);
  renderCartPage();
}
function updateCartBadge(){
  const el = document.querySelectorAll(".cart-count");
  const n = cartCount(getCart());
  el.forEach(e=> e.textContent = n);
}

/* ---------- SVG: pearl illustration (copyright-safe, generated) ---------- */
function pearlSVG(tone, size=120){
  const [light, deep] = tone;
  const gid = "g" + Math.random().toString(36).slice(2,9);
  return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pearl illustration">
    <defs>
      <radialGradient id="${gid}" cx="38%" cy="32%" r="70%">
        <stop offset="0%" stop-color="${light}"/>
        <stop offset="55%" stop-color="${light}"/>
        <stop offset="100%" stop-color="${deep}"/>
      </radialGradient>
    </defs>
    <ellipse cx="60" cy="104" rx="30" ry="6" fill="${deep}" opacity="0.18"/>
    <circle cx="60" cy="60" r="42" fill="url(#${gid})"/>
    <ellipse cx="47" cy="44" rx="12" ry="8" fill="#FFFFFF" opacity="0.55"/>
  </svg>`;
}

/* ---------- SVG: pearl-strand divider (signature element) ---------- */
function strandSVG(count=15){
  let cx = 10, out = "";
  const radii = [];
  for(let i=0;i<count;i++){
    const mid = (count-1)/2;
    const r = 4 + 6*(1 - Math.abs(i-mid)/mid);
    radii.push(r);
  }
  const total = radii.reduce((a,b)=>a+b*2+6,0);
  const scale = 620/total;
  let x = 10;
  out += `<line x1="0" y1="14" x2="640" y2="14" stroke="#B8935A" stroke-width="1" opacity="0.5"/>`;
  radii.forEach(r=>{
    const rs = r*scale*0.6 + 3;
    x += rs + 6;
    out += `<circle cx="${x}" cy="14" r="${rs}" fill="#F6F2EA" stroke="#B8935A" stroke-width="1"/>`;
    x += rs;
  });
  return `<svg viewBox="0 0 640 28" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${out}</svg>`;
}

/* ---------- SVG: geometric arabesque hero pattern ---------- */
function arabesquePatternSVG(){
  return `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <pattern id="starLattice" width="80" height="80" patternUnits="userSpaceOnUse">
        <g fill="none" stroke="#B8935A" stroke-width="1">
          <path d="M40 4 L60 20 L76 40 L60 60 L40 76 L20 60 L4 40 L20 20 Z"/>
          <path d="M40 20 L54 30 L60 40 L54 50 L40 60 L26 50 L20 40 L26 30 Z"/>
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#starLattice)"/>
  </svg>`;
}

/* ---------- SVG: brand emblem for story section ---------- */
function brandEmblemSVG(){
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="100" r="92" fill="none" stroke="#B8935A" stroke-width="1.5"/>
    <circle cx="100" cy="100" r="78" fill="none" stroke="#B8935A" stroke-width="1" opacity="0.6"/>
    <g fill="none" stroke="#D8B98A" stroke-width="1.2">
      <path d="M100 30 L120 55 L145 75 L120 100 L100 130 L80 100 L55 75 L80 55 Z"/>
    </g>
    <circle cx="100" cy="72" r="16" fill="#F6F2EA"/>
    <circle cx="100" cy="72" r="16" fill="none" stroke="#B8935A" stroke-width="1"/>
  </svg>`;
}

/* ---------- Empty cart icon ---------- */
function emptyCartSVG(){
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="32" cy="32" r="30" fill="none" stroke="#0B3D2E" stroke-width="1.5"/>
    <path d="M20 24h24l-3 18H23z" fill="none" stroke="#0B3D2E" stroke-width="1.5"/>
    <circle cx="25" cy="46" r="2.5" fill="#0B3D2E"/>
    <circle cx="39" cy="46" r="2.5" fill="#0B3D2E"/>
  </svg>`;
}

/* ---------- Render: product grid (shop.html & featured on index) ---------- */
function renderProductGrid(containerId, list){
  const el = document.getElementById(containerId);
  if(!el) return;
  el.innerHTML = list.map(p=>`
    <article class="card">
      <div class="card-media">
        ${p.tag ? `<span class="card-tag">${p.tag}</span>` : ""}
        ${pearlSVG(p.tone)}
      </div>
      <div class="card-body">
        <span class="card-origin">${p.origin}</span>
        <h3 class="card-title">${p.name}</h3>
        <p class="card-desc">${p.desc}</p>
        <div class="card-foot">
          <span class="price">${fmt(p.price)}</span>
          <button class="add-btn" data-id="${p.id}" onclick="handleAddClick(this)">Add to Cart</button>
        </div>
      </div>
    </article>
  `).join("");
}

function handleAddClick(btn){
  const id = btn.getAttribute("data-id");
  addToCart(id, 1);
  btn.textContent = "Added ✓";
  btn.classList.add("added");
  setTimeout(()=>{ btn.textContent = "Add to Cart"; btn.classList.remove("added"); }, 1400);
}

/* ---------- Shop page filters ---------- */
function initShopFilters(){
  const buttons = document.querySelectorAll(".filter-btn");
  if(!buttons.length) return;
  buttons.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      buttons.forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.getAttribute("data-filter");
      const list = f==="all" ? PRODUCTS : PRODUCTS.filter(p=> p.type===f || p.origin.includes(f));
      renderProductGrid("shop-grid", list);
    });
  });
}

/* ---------- Render: cart page ---------- */
function renderCartPage(){
  const listEl = document.getElementById("cart-list");
  const summaryEl = document.getElementById("cart-summary");
  const emptyEl = document.getElementById("cart-empty");
  if(!listEl) return;
  const cart = getCart();
  const ids = Object.keys(cart);

  if(ids.length===0){
    listEl.style.display = "none";
    if(summaryEl) summaryEl.style.display = "none";
    if(emptyEl) emptyEl.style.display = "block";
    updateCartBadge();
    return;
  }
  listEl.style.display = "flex";
  if(summaryEl) summaryEl.style.display = "block";
  if(emptyEl) emptyEl.style.display = "none";

  listEl.innerHTML = ids.map(id=>{
    const p = PRODUCTS.find(p=>p.id===id);
    if(!p) return "";
    const qty = cart[id];
    return `
      <div class="cart-row">
        <div class="thumb">${pearlSVG(p.tone,48)}</div>
        <div>
          <div class="name">${p.name}</div>
          <div class="origin">${p.origin}</div>
        </div>
        <div class="qty-control">
          <button onclick="setQty('${id}', ${qty-1})" aria-label="Decrease quantity">−</button>
          <span>${qty}</span>
          <button onclick="setQty('${id}', ${qty+1})" aria-label="Increase quantity">+</button>
        </div>
        <div class="price">${fmt(p.price*qty)}</div>
        <button class="remove-btn" onclick="removeFromCart('${id}')">Remove</button>
      </div>
    `;
  }).join("");

  const subtotal = cartTotal(cart);
  const shipping = subtotal > 0 ? (subtotal >= 15000 ? 0 : 150) : 0;
  if(summaryEl){
    summaryEl.innerHTML = `
      <h3>Order Summary</h3>
      <div class="summary-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
      <div class="summary-row"><span>Shipping</span><span>${shipping===0 ? "Free" : fmt(shipping)}</span></div>
      <div class="summary-row total"><span>Total</span><span class="val">${fmt(subtotal+shipping)}</span></div>
      <a href="checkout.html" class="btn btn-primary btn-block" style="margin-top:18px;">Proceed to Checkout</a>
      <a href="shop.html" class="btn btn-outline btn-block" style="margin-top:10px;">Continue Shopping</a>
    `;
  }
  updateCartBadge();
}

/* ---------- Checkout page ---------- */
function initCheckoutPage(){
  const form = document.getElementById("checkout-form");
  if(!form) return;

  const cart = getCart();
  const subtotal = cartTotal(cart);
  if(subtotal===0){
    window.location.href = "cart.html";
    return;
  }
  const shipping = subtotal >= 15000 ? 0 : 150;
  document.getElementById("co-subtotal").textContent = fmt(subtotal);
  document.getElementById("co-shipping").textContent = shipping===0 ? "Free" : fmt(shipping);
  document.getElementById("co-total").textContent = fmt(subtotal+shipping);

  const options = document.querySelectorAll(".pay-option");
  options.forEach(opt=>{
    opt.addEventListener("click", ()=>{
      options.forEach(o=>o.classList.remove("selected"));
      opt.classList.add("selected");
      opt.querySelector("input").checked = true;
    });
  });

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const selected = form.querySelector('input[name="payment"]:checked');
    if(!selected){ alert("Please select a payment method."); return; }

    const order = {
      id: "EP-" + Date.now().toString().slice(-8),
      date: new Date().toISOString(),
      items: cart,
      total: subtotal+shipping,
      payment: selected.value,
      customer: {
        name: form.fullname.value,
        phone: form.phone.value,
        address: form.address.value,
        city: form.city.value
      },
      status: "pending" /* becomes real once a payment gateway is connected */
    };

    mockProcessPayment(order).then(()=>{
      const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
      orders.push(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      localStorage.removeItem(CART_KEY);
      showConfirmation(order);
    });
  });
}

/* Mock payment — swap this for a real backend call later.
   e.g. fetch('/api/pay/bkash', {method:'POST', body: JSON.stringify(order)}) */
function mockProcessPayment(order){
  return new Promise(resolve=> setTimeout(resolve, 600));
}

function showConfirmation(order){
  document.getElementById("checkout-form-panel").style.display = "none";
  const panel = document.getElementById("confirm-panel");
  panel.style.display = "block";
  document.getElementById("confirm-order-id").textContent = order.id;
  document.getElementById("confirm-total").textContent = fmt(order.total);
  document.getElementById("confirm-method").textContent = order.payment.toUpperCase();
  updateCartBadge();
}

/* ---------- Init on load ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  updateCartBadge();
  renderProductGrid("featured-grid", PRODUCTS.slice(0,4));
  renderProductGrid("shop-grid", PRODUCTS);
  initShopFilters();
  renderCartPage();
  initCheckoutPage();

  document.querySelectorAll(".hero-pattern").forEach(el=> el.innerHTML = arabesquePatternSVG());
  document.querySelectorAll(".strand-svg").forEach(el=> el.innerHTML = strandSVG());
  document.querySelectorAll(".brand-emblem").forEach(el=> el.innerHTML = brandEmblemSVG());
  document.querySelectorAll(".empty-cart-icon").forEach(el=> el.innerHTML = emptyCartSVG());

  const cf = document.getElementById("contact-form");
  if(cf){
    cf.addEventListener("submit",(e)=>{
      e.preventDefault();
      const btn = cf.querySelector("button[type=submit]");
      btn.textContent = "Message sent ✓";
      setTimeout(()=> btn.textContent = "Send Message", 2200);
      cf.reset();
    });
  }
});
