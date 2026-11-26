// ============================================================
//  Mie Ayam Kartotiyasan Mas Fajar — script.js
// ============================================================

// ── Supabase ───────────────────────────────────────────────
// Kunci publishable aman ditaruh di sini karena akses dijaga Row Level Security.
const SUPABASE_URL = "https://vaupynrxlcbynzgleeph.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_uOfT4jN5oRYiekB7_BrkNw_V5YojbyS";
const db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const PLACEHOLDER_IMG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='900' height='600'><rect width='100%' height='100%' fill='%23e9dfd2'/></svg>";

// ── Menu Data ──────────────────────────────────────────────
let menuItems = [
  { cat: "andalan", name: "Mie Ayam Original", desc: "Mie kenyal dengan ayam berbumbu khas, kuah kaldu gurih, dan taburan daun bawang segar.", price: "Rp 12.000", badge: "Favorit", image: "https://images.unsplash.com/photo-1644083152667-2c78739e882a?auto=format&fit=crop&w=900&q=80", imageAlt: "Semangkuk mie ayam dengan sayuran" },
  { cat: "andalan", name: "Mie Ayam Special", desc: "Versi spesial dengan potongan ayam lebih banyak, pangsit rebus, dan sambal khas.", price: "Rp 15.000", badge: "Best Seller", image: "https://images.unsplash.com/photo-1644083130607-b5ecc6cc7e8e?auto=format&fit=crop&w=900&q=80", imageAlt: "Mie ayam spesial dalam mangkuk" },
  { cat: "andalan", name: "Mie Ayam Bakso", desc: "Perpaduan sempurna mie ayam dengan bakso kenyal berukuran jumbo dan kuah segar.", price: "Rp 15.000", badge: "", image: "https://images.unsplash.com/photo-1687425973269-af0d62587769?auto=format&fit=crop&w=900&q=80", imageAlt: "Mie kuah dengan bakso" },
  { cat: "andalan", name: "Mie Ayam Komplit", desc: "Paket lengkap: mie ayam, bakso, pangsit, dan telur — sajian paling komplit kami.", price: "Rp 18.000", badge: "Rekomendasi", image: "https://images.unsplash.com/photo-1687425973283-d0d266b73325?auto=format&fit=crop&w=900&q=80", imageAlt: "Mie ayam lengkap dengan topping" },
  { cat: "andalan", name: "Mie Goreng Ayam", desc: "Mie goreng kering dengan ayam berbumbu, telur, dan sayuran segar pilihan.", price: "Rp 14.000", badge: "", image: "https://images.unsplash.com/photo-1631653014076-9ae41e4216d7?auto=format&fit=crop&w=900&q=80", imageAlt: "Mie goreng disajikan dalam mangkuk" },
  { cat: "pelengkap", name: "Pangsit Goreng", desc: "Pangsit kulit tipis renyah dengan isian ayam berbumbu, cocok sebagai pelengkap.", price: "Rp 8.000", badge: "", image: "https://images.unsplash.com/photo-1781332147547-1f0edb2a78a4?auto=format&fit=crop&w=900&q=80", imageAlt: "Pangsit goreng renyah" },
  { cat: "pelengkap", name: "Telur Rebus", desc: "Telur rebus setengah matang, pelengkap sempurna semangkuk mie ayam Anda.", price: "Rp 3.000", badge: "", image: "https://images.unsplash.com/photo-1577111064880-4601019411fe?auto=format&fit=crop&w=900&q=80", imageAlt: "Telur rebus yang dibelah" },
  { cat: "pelengkap", name: "Ekstra Ayam", desc: "Tambahan topping ayam berbumbu untuk porsi yang lebih memuaskan.", price: "Rp 5.000", badge: "", image: "https://images.unsplash.com/photo-1767469576695-5b2c41981067?auto=format&fit=crop&w=900&q=80", imageAlt: "Ayam suwir berbumbu" },
  { cat: "minuman", name: "Es Teh Manis", desc: "Teh manis dingin segar, pelengkap wajib makan mie ayam di hari yang panas.", price: "Rp 4.000", badge: "", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=80", imageAlt: "Segelas es teh" },
  { cat: "minuman", name: "Teh Hangat", desc: "Teh hangat pilihan, cocok dinikmati di pagi hari bersama semangkuk mie ayam.", price: "Rp 3.000", badge: "", image: "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?auto=format&fit=crop&w=900&q=80", imageAlt: "Teh hangat tanpa es" },
  { cat: "minuman", name: "Air Mineral", desc: "Air mineral botol untuk menjaga keseimbangan cairan tubuh Anda.", price: "Rp 3.000", badge: "", image: "https://images.unsplash.com/photo-1544418749-94b09b11e93f?auto=format&fit=crop&w=900&q=80", imageAlt: "Air mineral dalam gelas" },
];

const cart = [];
const menuGrid = document.getElementById("menuGrid");
let activeMenuOrder = null;
let activeMenuCategory = "semua";
let nextCartItemId = 1;

function formatRupiah(value) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function getMenuPrice(item) {
  return Number(item.price.replace(/\D/g, ""));
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    "\"": "&quot;",
  })[character]);
}

function renderMenu(cat) {
  const grid = menuGrid;
  if (!grid) return;
  activeMenuCategory = cat;
  const filtered = cat === "semua" ? menuItems : menuItems.filter(m => m.cat === cat);
  grid.innerHTML = filtered.map(m => {
    const menuIndex = menuItems.indexOf(m);
    const isOrdering = activeMenuOrder === menuIndex;

    return `
    <div class="menu-card reveal">
      <div class="menu-img">
        <img src="${m.image}" alt="${m.imageAlt}" loading="lazy" />
        ${m.badge ? `<div class="menu-badge">${m.badge}</div>` : ""}
      </div>
      <div class="menu-body">
        <h3>${m.name}</h3>
        <p>${m.desc}</p>
        <div class="menu-footer">
          <span class="menu-price">${m.price}</span>
        </div>
        ${isOrdering ? `
          <div class="menu-cart-actions">
            <label for="menuQuantity-${menuIndex}">Jumlah porsi</label>
            <div class="menu-cart-controls">
              <div class="quantity-control">
                <button type="button" class="quantity-button" data-menu-quantity="${menuIndex}" data-change="-1" aria-label="Kurangi porsi ${m.name}">−</button>
                <input id="menuQuantity-${menuIndex}" class="menu-quantity" type="number" min="1" max="50" value="1" inputmode="numeric" />
                <button type="button" class="quantity-button" data-menu-quantity="${menuIndex}" data-change="1" aria-label="Tambah porsi ${m.name}">+</button>
              </div>
              <button type="button" class="menu-order-btn menu-add-button" data-add-menu="${menuIndex}">+ Keranjang</button>
            </div>
            <label class="menu-note-label" for="menuNote-${menuIndex}">Catatan pesanan <span>(opsional)</span></label>
            <textarea id="menuNote-${menuIndex}" class="menu-note" rows="2" placeholder="Contoh: tidak pedas, tambah kuah"></textarea>
            <button type="button" class="menu-cancel-button" data-cancel-menu="${menuIndex}">Batal</button>
          </div>
        ` : `
          <button type="button" class="menu-order-btn menu-start-button" data-order-menu="${menuIndex}">Pesan</button>
        `}
      </div>
    </div>
  `;
  }).join("");
  observeReveal();
}

function addToCart(menuIndex, quantity, note) {
  const item = menuItems[menuIndex];
  if (!item) return;

  cart.push({ id: nextCartItemId, menuIndex, quantity, note });
  nextCartItemId += 1;

  renderCart();
  showCartNotice(`${item.name} ditambahkan ke keranjang.`);
}

function updateCartQuantity(cartItemId, change) {
  const item = cart.find(cartItem => cartItem.id === cartItemId);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    cart.splice(cart.indexOf(item), 1);
  }

  renderCart();
}

function removeFromCart(cartItemId) {
  const itemIndex = cart.findIndex(cartItem => cartItem.id === cartItemId);
  if (itemIndex === -1) return;

  cart.splice(itemIndex, 1);
  renderCart();
}

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");
  const checkoutButton = document.getElementById("cartCheckout");
  const menuCheckout = document.getElementById("menuCheckout");
  const menuCheckoutCount = document.getElementById("menuCheckoutCount");
  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, cartItem) => {
    return total + getMenuPrice(menuItems[cartItem.menuIndex]) * cartItem.quantity;
  }, 0);

  cartItems.innerHTML = cart.map(cartItem => {
    const item = menuItems[cartItem.menuIndex];
    const subtotal = getMenuPrice(item) * cartItem.quantity;
    const note = cartItem.note ? `<span class="cart-item-note">Catatan: ${escapeHtml(cartItem.note)}</span>` : "";

    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <strong>${item.name}</strong>
          <span>${item.price} / porsi</span>
          ${note}
        </div>
        <div class="cart-item-actions">
          <div class="quantity-control cart-quantity-control">
            <button type="button" class="quantity-button" data-cart-quantity="${cartItem.id}" data-change="-1" aria-label="Kurangi ${item.name}">−</button>
            <span>${cartItem.quantity}</span>
            <button type="button" class="quantity-button" data-cart-quantity="${cartItem.id}" data-change="1" aria-label="Tambah ${item.name}">+</button>
          </div>
          <strong class="cart-subtotal">${formatRupiah(subtotal)}</strong>
          <button type="button" class="cart-remove" data-remove-menu="${cartItem.id}" aria-label="Hapus ${item.name} dari keranjang">×</button>
        </div>
      </div>
    `;
  }).join("");

  cartEmpty.hidden = cart.length > 0;
  cartCount.textContent = `${totalQuantity} ${totalQuantity === 1 ? "item" : "item"}`;
  cartTotal.textContent = formatRupiah(totalPrice);
  checkoutButton.disabled = cart.length === 0;
  menuCheckout.disabled = cart.length === 0;
  menuCheckoutCount.textContent = `(${totalQuantity} ${totalQuantity === 1 ? "item" : "item"})`;
}

function showCartNotice(message, isError = false) {
  const notice = document.getElementById("cartNotice");
  notice.textContent = message;
  notice.classList.toggle("is-error", isError);
}

menuGrid.addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-menu-quantity]");
  const orderButton = event.target.closest("[data-order-menu]");
  const addButton = event.target.closest("[data-add-menu]");
  const cancelButton = event.target.closest("[data-cancel-menu]");

  if (orderButton) {
    activeMenuOrder = Number(orderButton.dataset.orderMenu);
    renderMenu(activeMenuCategory);
    return;
  }

  if (cancelButton) {
    activeMenuOrder = null;
    renderMenu(activeMenuCategory);
    return;
  }

  if (quantityButton) {
    const menuIndex = Number(quantityButton.dataset.menuQuantity);
    const input = document.getElementById(`menuQuantity-${menuIndex}`);
    input.value = Math.max(1, Number(input.value) + Number(quantityButton.dataset.change));
  }

  if (addButton) {
    const menuIndex = Number(addButton.dataset.addMenu);
    const input = document.getElementById(`menuQuantity-${menuIndex}`);
    const note = document.getElementById(`menuNote-${menuIndex}`).value.trim();
    const quantity = Math.min(50, Math.max(1, Number(input.value) || 1));
    addToCart(menuIndex, quantity, note);
    activeMenuOrder = null;
    renderMenu(activeMenuCategory);
  }
});

// ── Tab click ───────────────────────────────────────────────
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderMenu(btn.dataset.cat);
  });
});

renderMenu("semua");
renderCart();

// ── Data dari Supabase (menu & testimoni) ─────────────────────
// Bila Supabase tidak terjangkau, daftar menu di atas tetap dipakai.
function renderTestimonials(rows) {
  const grid = document.querySelector(".testi-grid");
  if (!grid || !rows.length) return;
  grid.innerHTML = rows.map((t, i) => {
    const rating = Math.min(5, Math.max(1, Number(t.rating) || 5));
    const nama = String(t.nama || "");
    return `
        <div class="testi-card reveal${i === 1 ? " tc-featured" : ""}">
          <div class="testi-stars">${"★".repeat(rating)}${"☆".repeat(5 - rating)}</div>
          <p class="testi-text">"${escapeHtml(String(t.isi || ""))}"</p>
          <div class="testi-author">
            <div class="testi-avatar">${escapeHtml(nama.charAt(0).toUpperCase() || "?")}</div>
            <div><strong>${escapeHtml(nama)}</strong><span>${escapeHtml(String(t.peran || "Pelanggan"))}</span></div>
          </div>
        </div>`;
  }).join("");
  observeReveal();
}

async function loadSupabaseData() {
  if (!db) return;
  try {
    const text = v => String(v ?? "");
    const { data: menuRows, error: menuError } = await db
      .from("menu").select("*").eq("tersedia", true).order("urutan").order("nama");
    if (!menuError && menuRows && menuRows.length && cart.length === 0) {
      const urutanKategori = { Andalan: 0, Pelengkap: 1, Minuman: 2 };
      menuRows.sort((a, b) =>
        (urutanKategori[a.kategori] ?? 9) - (urutanKategori[b.kategori] ?? 9) || (a.urutan - b.urutan));
      menuItems = menuRows.map(r => ({
        id: r.id,
        cat: text(r.kategori).toLowerCase(),
        rawName: text(r.nama),
        name: escapeHtml(text(r.nama)),
        desc: escapeHtml(text(r.deskripsi)),
        price: `Rp ${Number(r.harga || 0).toLocaleString("id-ID")}`,
        badge: escapeHtml(text(r.badge)),
        image: escapeHtml(text(r.image) || PLACEHOLDER_IMG),
        imageAlt: escapeHtml(text(r.image_alt) || text(r.nama)),
      }));
      activeMenuOrder = null;
      renderMenu(activeMenuCategory);
      renderCart();
    }

    const { data: testiRows, error: testiError } = await db
      .from("testimoni").select("nama,peran,rating,isi")
      .order("created_at", { ascending: false }).limit(6);
    if (!testiError && testiRows) renderTestimonials(testiRows);
  } catch (err) {
    console.error("Gagal memuat data dari Supabase:", err);
  }
}
loadSupabaseData();

document.getElementById("menuCheckout").addEventListener("click", () => {
  document.getElementById("pesan").scrollIntoView({ behavior: "smooth", block: "start" });
});

// ── Navbar scroll ───────────────────────────────────────────
window.addEventListener("scroll", () => {
  document.getElementById("navbar").classList.toggle("scrolled", window.scrollY > 60);
});

// ── Hamburger / mobile menu ─────────────────────────────────
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
hamburger.addEventListener("click", () => {
  mobileMenu.classList.toggle("open");
});
function closeMobile() { mobileMenu.classList.remove("open"); }

// ── Scroll reveal ────────────────────────────────────────────
function observeReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add("visible"), i * 80);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
}

// Add reveal to non-menu elements
document.querySelectorAll(
  ".tentang-card, .th-item, .info-card, .testi-card, .gal-item, .footer-grid > *"
).forEach(el => el.classList.add("reveal"));
observeReveal();

// ── Star rating ─────────────────────────────────────────────
let selectedRating = 0;
document.querySelectorAll(".star-rating span").forEach(star => {
  star.addEventListener("mouseenter", () => {
    const v = +star.dataset.v;
    document.querySelectorAll(".star-rating span").forEach(s => {
      s.classList.toggle("active", +s.dataset.v <= v);
    });
  });
  star.addEventListener("mouseleave", () => {
    document.querySelectorAll(".star-rating span").forEach(s => {
      s.classList.toggle("active", +s.dataset.v <= selectedRating);
    });
  });
  star.addEventListener("click", () => {
    selectedRating = +star.dataset.v;
    document.querySelectorAll(".star-rating span").forEach(s => {
      s.classList.toggle("active", +s.dataset.v <= selectedRating);
    });
  });
});

// ── Testimoni form ───────────────────────────────────────────
const testiForm = document.getElementById("testiForm");
const testiSuccess = document.getElementById("testiSuccess");
if (testiForm) {
  testiForm.addEventListener("submit", async e => {
    e.preventDefault();
    if (!selectedRating) {
      alert("Pilih rating bintang terlebih dahulu.");
      return;
    }
    if (db) {
      const nama = testiForm.querySelector('input[type="text"]').value.trim().slice(0, 60);
      const isi = testiForm.querySelector("textarea").value.trim().slice(0, 600);
      const { error } = await db.from("testimoni").insert({ nama, rating: selectedRating, isi, status: "Menunggu" });
      if (error) {
        console.error(error);
        alert("Testimoni belum terkirim. Silakan coba lagi nanti.");
        return;
      }
    }
    testiForm.style.display = "none";
    testiSuccess.style.display = "block";
    setTimeout(() => {
      testiForm.style.display = "block";
      testiSuccess.style.display = "none";
      testiForm.reset();
      selectedRating = 0;
      document.querySelectorAll(".star-rating span").forEach(s => s.classList.remove("active"));
    }, 4000);
  });
}

// ── Keranjang & checkout ─────────────────────────────────────
const pesanForm = document.getElementById("pesanForm");
const pesanSuccess = document.getElementById("pesanSuccess");
const cartItems = document.getElementById("cartItems");
cartItems.addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-cart-quantity]");
  const removeButton = event.target.closest("[data-remove-menu]");

  if (quantityButton) {
    updateCartQuantity(Number(quantityButton.dataset.cartQuantity), Number(quantityButton.dataset.change));
  }

  if (removeButton) {
    removeFromCart(Number(removeButton.dataset.removeMenu));
  }
});

if (pesanForm) {
  pesanForm.addEventListener("submit", e => {
    e.preventDefault();
    if (!cart.length) {
      showCartNotice("Tambahkan minimal satu menu ke keranjang terlebih dahulu.", true);
      return;
    }

    const nama = document.getElementById("customerName").value;
    const wa = document.getElementById("customerPhone").value;
    const jenis = document.getElementById("orderType").value;
    const catatan = document.getElementById("orderNote").value;
    const itemLines = cart.map(cartItem => {
      const item = menuItems[cartItem.menuIndex];
      const subtotal = getMenuPrice(item) * cartItem.quantity;
      return `• ${item.rawName || item.name} × ${cartItem.quantity} — ${formatRupiah(subtotal)}` +
        (cartItem.note ? `\n  Catatan: ${cartItem.note}` : "");
    }).join("\n");
    const totalPrice = cart.reduce((total, cartItem) => {
      return total + getMenuPrice(menuItems[cartItem.menuIndex]) * cartItem.quantity;
    }, 0);

    const msg = encodeURIComponent(
      `Halo Mie Ayam Kartotiyasan Mas Fajar! 🍜\n\n` +
      `Saya ingin memesan:\n` +
      `${itemLines}\n\n` +
      `Total: ${formatRupiah(totalPrice)}\n` +
      `• Nama: ${nama}\n` +
      `• Jenis: ${jenis}\n` +
      (catatan ? `• Catatan: ${catatan}\n` : "") +
      `\nNo. WA: ${wa}\n\nTerima kasih! 🙏`
    );

    if (db) {
      const orderItems = cart.map(cartItem => {
        const item = menuItems[cartItem.menuIndex];
        return { id: item.id || null, nama: item.rawName || item.name, harga: getMenuPrice(item), qty: cartItem.quantity, catatan: cartItem.note || "" };
      });
      db.from("orders").insert({
        nama: nama.trim().slice(0, 60), wa: wa.trim(), tipe: jenis, catatan: catatan.trim(),
        items: orderItems, total: totalPrice, status: "Baru", sumber: "web",
      }).then(({ error }) => { if (error) console.error("Pesanan gagal disimpan:", error); });
    }

    window.open(`https://wa.me/6283106414823?text=${msg}`, "_blank");

    cart.length = 0;
    pesanForm.reset();
    renderCart();
    showCartNotice("");
    pesanSuccess.style.display = "block";
    setTimeout(() => { pesanSuccess.style.display = "none"; }, 5000);
  });
}

// ── Active nav link on scroll ────────────────────────────────
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute("href") === "#" + current ? "var(--terracotta)" : "";
  });
});
