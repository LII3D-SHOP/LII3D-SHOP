document.addEventListener('DOMContentLoaded', () => {
    // 1. --- Smooth Scrolling & Global Highlighting ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#cart') return; // Handled separately

            const targetBlock = document.querySelector(targetId);
            if (targetBlock) {
                targetBlock.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    targetBlock.classList.add('target-highlight');
                    setTimeout(() => targetBlock.classList.remove('target-highlight'), 2000);
                }, 600);
            }
        });
    });

    // 2. --- Header Scroll Effect (Optimized) ---
    const header = document.querySelector('.main-header');
    let scrollTicking = false;

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    header.style.background = 'rgba(5, 5, 5, 0.98)';
                    header.style.boxShadow = '0 5px 25px rgba(0,0,0,0.8)';
                } else {
                    header.style.background = 'rgba(5, 5, 5, 0.9)';
                    header.style.boxShadow = 'none';
                }
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    });

    // 3. --- Cart State & Storage ---
    let cart = [];
    let cartTotalItems = 0;

    const saveCart = () => {
        localStorage.setItem('lav4s_cart', JSON.stringify(cart));
        localStorage.setItem('lav4s_cart_count', cartTotalItems);
    };

    const loadCart = () => {
        const savedCart = localStorage.getItem('lav4s_cart');
        const savedCount = localStorage.getItem('lav4s_cart_count');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            cartTotalItems = parseInt(savedCount) || 0;
        }
    };

    const cartCountElement = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPriceElement = document.getElementById('cart-total-price');

    const updateCartUI = () => {
        cartCountElement.innerText = cartTotalItems;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
            cartTotalPriceElement.innerText = '€0.00';
        } else {
            cartItemsContainer.innerHTML = '';
            let total = 0;
            cart.forEach((item, index) => {
                total += item.price * item.quantity;
                const itemEl = document.createElement('div');
                itemEl.classList.add('cart-item');
                itemEl.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.title}</h4>
                        <p>Qty: ${item.quantity}</p>
                    </div>
                    <div class="cart-item-right">
                        <div class="cart-item-price">€${(item.price * item.quantity).toFixed(2)}</div>
                        <div class="remove-item" data-index="${index}">&times;</div>
                    </div>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
            cartTotalPriceElement.innerText = `€${total.toFixed(2)}`;

            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.onclick = () => {
                    const idx = btn.getAttribute('data-index');
                    cartTotalItems -= cart[idx].quantity;
                    cart.splice(idx, 1);
                    saveCart();
                    updateCartUI();
                };
            });
        }
    };

    loadCart();
    updateCartUI();

    // 4. --- Modal Management ---
    const modal = document.getElementById('product-modal');
    const cartModal = document.getElementById('cart-modal');
    const closeBtn = document.querySelector('.close-modal');
    const closeCartBtn = document.querySelector('.close-cart');
    const modalTitle = document.getElementById('modal-title');
    const modalPrice = document.getElementById('modal-price');
    const qtyInput = document.getElementById('qty-input');
    const btnMinus = document.getElementById('qty-minus');
    const btnPlus = document.getElementById('qty-plus');
    const openCartBtn = document.querySelector('.btn-contact');
    const addToCartBtn = document.querySelector('.modal-actions .btn-primary');

    let currentUnitPrice = 0;

    const openModal = (title, price) => {
        currentUnitPrice = parseFloat(price.replace('€', ''));
        modalTitle.innerText = title;
        qtyInput.value = 1;
        updateTotalPrice();
        modal.style.display = "block";
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    };

    const updateTotalPrice = () => {
        const qty = parseInt(qtyInput.value) || 1;
        modalPrice.innerText = `€${(currentUnitPrice * qty).toFixed(2)}`;
    };

    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h3').innerText;
            const price = card.querySelector('.price').innerText;
            openModal(title, price);
        });
    });

    closeBtn.onclick = closeModal;

    openCartBtn.onclick = (e) => {
        e.preventDefault();
        cartModal.style.display = "block";
        document.body.style.overflow = "hidden";
    };

    closeCartBtn.onclick = () => {
        cartModal.style.display = "none";
        document.body.style.overflow = "auto";
    };

    document.querySelector('.checkout-btn').onclick = () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        alert("Thank you for your order! Checkout process simulation complete.");
        cart = [];
        cartTotalItems = 0;
        saveCart();
        updateCartUI();
        cartModal.style.display = "none";
        document.body.style.overflow = "auto";
    };

    window.onclick = (e) => {
        if (e.target === modal) closeModal();
        if (e.target === cartModal) {
            cartModal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    };

    // 5. --- Quantity Controls ---
    btnMinus.onclick = () => {
        let val = parseInt(qtyInput.value) || 1;
        if (val > 1) { qtyInput.value = val - 1; updateTotalPrice(); }
    };

    btnPlus.onclick = () => {
        let val = parseInt(qtyInput.value) || 1;
        qtyInput.value = val + 1;
        updateTotalPrice();
    };

    qtyInput.oninput = () => {
        if (qtyInput.value !== "" && parseInt(qtyInput.value) < 1) qtyInput.value = 1;
        updateTotalPrice();
    };

    qtyInput.onblur = () => {
        if (qtyInput.value === "" || parseInt(qtyInput.value) < 1) {
            qtyInput.value = 1;
            updateTotalPrice();
        }
    };

    // 6. --- Add to Cart Logic with Flying Animation ---
    addToCartBtn.onclick = () => {
        const addedQty = parseInt(qtyInput.value) || 1;
        const itemTitle = modalTitle.innerText;

        const existingItem = cart.find(item => item.title === itemTitle);
        if (existingItem) existingItem.quantity += addedQty;
        else cart.push({ title: itemTitle, price: currentUnitPrice, quantity: addedQty });

        cartTotalItems += addedQty;
        saveCart();

        // Animation
        const btnRect = addToCartBtn.getBoundingClientRect();
        const cartRect = openCartBtn.getBoundingClientRect();
        const flyingItem = document.createElement('div');
        flyingItem.classList.add('flying-item');
        flyingItem.style.top = `${btnRect.top + btnRect.height / 2}px`;
        flyingItem.style.left = `${btnRect.left + btnRect.width / 2}px`;
        document.body.appendChild(flyingItem);

        setTimeout(() => {
            flyingItem.style.top = `${cartRect.top + cartRect.height / 2}px`;
            flyingItem.style.left = `${cartRect.left + cartRect.width / 2}px`;
            flyingItem.style.transform = 'scale(0.1)';
            flyingItem.style.opacity = '0';
        }, 10);

        setTimeout(() => {
            flyingItem.remove();
            openCartBtn.classList.add('cart-bounce');
            updateCartUI();
            setTimeout(() => openCartBtn.classList.remove('cart-bounce'), 500);
        }, 1200);

        closeModal();
    };

    // 7. --- Custom Scroll Handle ---
    const scrollHandle = document.getElementById('scroll-handle');
    let isDraggingScroll = false;

    const updateHandlePosition = () => {
        if (isDraggingScroll) return;
        const sH = document.documentElement.scrollHeight - window.innerHeight;
        if (sH <= 0) return;
        const scrollPercent = window.scrollY / sH;
        const pos = scrollPercent * (window.innerHeight - 300) + 160;
        scrollHandle.style.top = `${pos}px`;
    };

    let handleTicking = false;
    window.addEventListener('scroll', () => {
        if (!handleTicking) {
            window.requestAnimationFrame(() => {
                updateHandlePosition();
                handleTicking = false;
            });
            handleTicking = true;
        }
    });
    window.addEventListener('resize', updateHandlePosition);
    updateHandlePosition();

    scrollHandle.onmousedown = () => { isDraggingScroll = true; document.body.style.cursor = 'grabbing'; };

    let moveTicking = false;
    document.onmousemove = (e) => {
        if (!isDraggingScroll || moveTicking) return;
        moveTicking = true;
        window.requestAnimationFrame(() => {
            let y = Math.max(160, Math.min(e.clientY, window.innerHeight - 140));
            scrollHandle.style.top = `${y}px`;
            const pct = (y - 160) / (window.innerHeight - 300);
            window.scrollTo(0, pct * (document.documentElement.scrollHeight - window.innerHeight));
            moveTicking = false;
        });
    };
    document.onmouseup = () => { isDraggingScroll = false; document.body.style.cursor = ''; };

    // 8. --- Bible Verse ---
    const verses = [
        { text: "For I know the plans I have for you...", ref: "Jeremiah 29:11" },
        { text: "I can do all things through him...", ref: "Philippians 4:13" },
        { text: "Trust in the LORD with all your heart...", ref: "Proverbs 3:5" }
    ];
    const vEl = document.getElementById('bible-verse');
    const rEl = document.getElementById('bible-ref');
    if (vEl && rEl) {
        const day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const v = verses[day % verses.length];
        vEl.innerText = `"${v.text}"`;
        rEl.innerText = `- ${v.ref}`;
    }
});
