document.addEventListener('DOMContentLoaded', () => {
    // 1. --- Smooth Scrolling & Global Highlighting ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#cart') return;

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
            if (checkoutBtn) checkoutBtn.style.display = "none";
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
            if (checkoutBtn && checkoutForm.style.display === "none") checkoutBtn.style.display = "block";

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

    // 4. --- Modal & Checkout Logic ---
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

    const checkoutBtn = document.querySelector('.checkout-btn');
    const checkoutForm = document.getElementById('checkout-form-container');
    const paypalContainer = document.getElementById('paypal-button-container');

    let currentUnitPrice = 0;

    const resetCheckout = () => {
        checkoutForm.style.display = "none";
        paypalContainer.style.display = "none";
        paypalContainer.innerHTML = '';
        if (cart.length > 0) {
            checkoutBtn.style.display = "block";
            checkoutBtn.innerText = "Proceed to Shipping";
        }
    };

    updateCartUI();

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
        updateCartUI();
    };

    closeCartBtn.onclick = () => {
        cartModal.style.display = "none";
        document.body.style.overflow = "auto";
        resetCheckout();
    };

    window.onclick = (e) => {
        if (e.target === modal) closeModal();
        if (e.target === cartModal) {
            cartModal.style.display = "none";
            document.body.style.overflow = "auto";
            resetCheckout();
        }
    };

    // Checkout Transitions
    checkoutBtn.onclick = () => {
        const name = document.getElementById('cust-name').value;
        const surname = document.getElementById('cust-surname').value;
        const address = document.getElementById('cust-address').value;

        if (checkoutForm.style.display === "none") {
            checkoutForm.style.display = "block";
            checkoutBtn.innerText = "Show PayPal Button";
        } else {
            if (!name || !surname || !address) {
                alert("Please fill in all shipping details first!");
                return;
            }
            checkoutBtn.style.display = "none";
            paypalContainer.style.display = "block";
            initPayPal();
        }
    };

    function initPayPal() {
        if (!window.paypal) {
            console.error("PayPal SDK not found. Possible causes: Blocked by extension (AdBlock), Incorrect Client ID, or no Internet.");
            alert("PayPal poga nevar ielādēties. Pārbaudi, vai Tev nav ieslēgts AdBlock, vai arī Client ID ir pareizs.");
            checkoutBtn.style.display = "block";
            return;
        }

        paypal.Buttons({
            createOrder: (data, actions) => {
                let total = 0;
                cart.forEach(item => total += item.price * item.quantity);
                return actions.order.create({
                    purchase_units: [{
                        amount: { currency_code: 'EUR', value: total.toFixed(2) },
                        description: `LII3D Order - ${document.getElementById('cust-name').value}`
                    }]
                });
            },
            onApprove: (data, actions) => {
                return actions.order.capture().then(details => {
                    alert(`Success! Payment received from ${details.payer.name.given_name}.`);
                    cart = [];
                    cartTotalItems = 0;
                    saveCart();
                    updateCartUI();
                    resetCheckout();
                    cartModal.style.display = "none";
                });
            },
            onError: (err) => {
                alert("Payment Error. Please try again.");
                checkoutBtn.style.display = "block";
                paypalContainer.style.display = "none";
            }
        }).render('#paypal-button-container');
    }

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

    // 6. --- Add to Cart Logic ---
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

    let hT = false;
    window.addEventListener('scroll', () => {
        if (!hT) { window.requestAnimationFrame(() => { updateHandlePosition(); hT = false; }); hT = true; }
    });
    window.addEventListener('resize', updateHandlePosition);
    updateHandlePosition();

    scrollHandle.onmousedown = () => { isDraggingScroll = true; document.body.style.cursor = 'grabbing'; };
    let mT = false;
    document.onmousemove = (e) => {
        if (!isDraggingScroll || mT) return;
        mT = true;
        window.requestAnimationFrame(() => {
            let y = Math.max(160, Math.min(e.clientY, window.innerHeight - 140));
            scrollHandle.style.top = `${y}px`;
            const pct = (y - 160) / (window.innerHeight - 300);
            window.scrollTo(0, pct * (document.documentElement.scrollHeight - window.innerHeight));
            mT = false;
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
