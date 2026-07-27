// ===== Mobile menu =====

(() => {
  const menu = document.querySelector(".mobile-menu");
  const openBtn = document.querySelector(".menu-open-btn");
  const closeBtn = document.querySelector(".menu-close-btn");

  const toggleMenu = (isOpen) => {
    menu.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("no-scroll", isOpen);
    openBtn.setAttribute("aria-expanded", String(isOpen));
  };

  openBtn.addEventListener("click", () => toggleMenu(true));
  closeBtn.addEventListener("click", () => toggleMenu(false));

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => toggleMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      toggleMenu(false);
    }
  });

  window
    .matchMedia("(min-width: 1440px)")
    .addEventListener("change", (event) => {
      if (event.matches) {
        toggleMenu(false);
      }
    });
})();

// ===== Modals =====

const modals = (() => {
  const backdrops = document.querySelectorAll(".backdrop");
  let lastFocused = null;

  const open = (name) => {
    const backdrop = document.querySelector(`.backdrop[data-modal="${name}"]`);
    if (!document.querySelector(".backdrop.is-open")) {
      lastFocused = document.activeElement;
    }
    backdrop.classList.add("is-open");
    document.body.classList.add("no-scroll");
    // Focus lands after the 250ms visibility transition completes
    setTimeout(() => {
      if (backdrop.classList.contains("is-open")) {
        backdrop.querySelector(".modal").focus();
      }
    }, 300);
  };

  const close = (backdrop) => {
    backdrop.classList.remove("is-open");
    if (!document.querySelector(".backdrop.is-open")) {
      document.body.classList.remove("no-scroll");
      if (lastFocused) {
        lastFocused.focus();
        lastFocused = null;
      }
    }
    backdrop.dispatchEvent(new CustomEvent("modal:closed"));
  };

  // Keep Tab focus inside the open modal
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const openBackdrop = document.querySelector(".backdrop.is-open");
    if (!openBackdrop) return;
    const focusables = openBackdrop.querySelectorAll(
      "button, input, textarea, [tabindex]",
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    } else if (!openBackdrop.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
    }
  });

  backdrops.forEach((backdrop) => {
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) {
        close(backdrop);
      }
    });
    backdrop
      .querySelector(".modal-close-btn")
      .addEventListener("click", () => close(backdrop));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.querySelectorAll(".backdrop.is-open").forEach(close);
    }
  });

  return { open, close };
})();

// ===== API =====

const IS_LOCAL = ["localhost", "127.0.0.1"].includes(window.location.hostname);

const BACKEND_URL = IS_LOCAL
  ? "http://localhost:3000"
  : "https://flora-backend-hutt.onrender.com";

const BASE_URL = `${BACKEND_URL}/api`;

// Uploaded photos are stored on the backend and served as relative paths
const resolvePhoto = (photoURL) =>
  photoURL.startsWith("/") ? `${BACKEND_URL}${photoURL}` : photoURL;

const state = {
  page: 1,
  limit: 8,
  total: null,
  category: null,
  isLoading: false,
  items: new Map(),
};

// Which bouquet and quantity the order modal was opened for
const orderContext = { bouquetId: null, quantity: 1 };

const isValidBouquet = (item) => Boolean(item && item.title && item.photoURL);

async function fetchBouquets(params) {
  const response = await axios.get(`${BASE_URL}/bouquets`, { params });
  return response.data;
}

// ===== Rendering =====

// API data is user-editable on the backend, so every interpolated value
// is escaped before it reaches insertAdjacentHTML (stored XSS protection).
const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const bouquetCardMarkup = (item) => `
  <li class="bouquets-card" data-id="${Number(item.id)}">
    <img
      class="bouquets-card-image"
      src="${escapeHtml(resolvePhoto(item.photoURL))}"
      width="296"
      height="296"
      alt="${escapeHtml(item.title)} bouquet"
    />
    <h3 class="bouquets-card-name">${escapeHtml(item.title)}</h3>
    <p class="bouquets-card-price">$${Number(item.price)}</p>
  </li>`;

const bestsellerCardMarkup = (item) => `
  <li class="bestsellers-card" data-id="${Number(item.id)}">
    <img
      class="bestsellers-card-image"
      src="${escapeHtml(resolvePhoto(item.photoURL))}"
      width="405"
      height="320"
      alt="${escapeHtml(item.title)} bouquet"
    />
    <h3 class="bestsellers-card-name">${escapeHtml(item.title)}</h3>
    <p class="bestsellers-card-price">$${Number(item.price)}</p>
  </li>`;

const renderList = (list, items, markupFn) => {
  list.insertAdjacentHTML("beforeend", items.map(markupFn).join(""));
};

// ===== Bouquets grid: pagination with Show More =====

(() => {
  const list = document.querySelector(".bouquets-list");
  const loadMoreBtn = document.querySelector(".bouquets-btn");
  const loader = document.querySelector(".bouquets-loader");
  const errorMessage = document.querySelector(".bouquets-error");
  const endMessage = document.querySelector(".bouquets-end-message");

  const updateControls = () => {
    const reachedEnd =
      state.total !== null && state.page * state.limit >= state.total;
    loadMoreBtn.classList.toggle("is-hidden", reachedEnd);
    endMessage.classList.toggle("is-hidden", !reachedEnd);
  };

  async function loadPage(page) {
    if (state.isLoading) {
      return;
    }
    state.isLoading = true;
    loader.classList.add("is-visible");
    loadMoreBtn.classList.add("is-hidden");
    errorMessage.classList.add("is-hidden");
    try {
      const response = await fetchBouquets({
        page,
        limit: state.limit,
      });
      const items = response.data.filter(isValidBouquet);
      items.forEach((item) => state.items.set(item.id, item));
      const totalCount = Number(response.total);
      state.total = Number.isNaN(totalCount) ? null : totalCount;
      state.page = page;
      renderList(list, items, bouquetCardMarkup);
      if (state.total === null && response.data.length < state.limit) {
        state.total = (page - 1) * state.limit + response.data.length;
      }
      updateControls();
    } catch {
      errorMessage.classList.remove("is-hidden");
      if (list.children.length > 0) {
        loadMoreBtn.classList.remove("is-hidden");
      }
    } finally {
      state.isLoading = false;
      loader.classList.remove("is-visible");
    }
  }

  loadMoreBtn.addEventListener("click", () => loadPage(state.page + 1));
  loadPage(1);
})();

// ===== Bestsellers slider (top category) =====

(() => {
  const section = document.querySelector(".bestsellers");
  const list = section.querySelector(".bestsellers-list");
  const dotsList = section.querySelector(".slider-dots");
  const [prevBtn, nextBtn] = section.querySelectorAll(".slider-btn");
  const loader = section.querySelector(".bestsellers-loader");
  const errorMessage = section.querySelector(".bestsellers-error");

  const SLIDES_TO_SHOW = 6;
  let position = 0;

  const visibleCount = () => {
    if (window.matchMedia("(min-width: 1440px)").matches) return 3;
    if (window.matchMedia("(min-width: 768px)").matches) return 2;
    return 1;
  };

  const maxPosition = () => Math.max(0, list.children.length - visibleCount());

  const update = () => {
    const card = list.firstElementChild;
    if (!card) return;
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    list.style.transform = `translateX(-${position * step}px)`;
    prevBtn.disabled = position === 0;
    nextBtn.disabled = position === maxPosition();
    dotsList.querySelectorAll(".slider-dot").forEach((dot, index) => {
      dot.classList.toggle("is-active", index === position);
    });
  };

  const renderDots = () => {
    const count = maxPosition() + 1;
    const dots = Array.from(
      { length: count },
      (_, index) =>
        `<li><button class="slider-dot" type="button" aria-label="Go to slide ${index + 1}"></button></li>`,
    ).join("");
    dotsList.innerHTML = "";
    dotsList.insertAdjacentHTML("beforeend", dots);
    dotsList.querySelectorAll(".slider-dot").forEach((dot, index) => {
      dot.addEventListener("click", () => {
        position = index;
        update();
      });
    });
  };

  prevBtn.addEventListener("click", () => {
    position = Math.max(0, position - 1);
    update();
  });
  nextBtn.addEventListener("click", () => {
    position = Math.min(maxPosition(), position + 1);
    update();
  });
  window.addEventListener("resize", () => {
    position = Math.min(position, maxPosition());
    renderDots();
    update();
  });

  (async () => {
    loader.classList.add("is-visible");
    try {
      const response = await fetchBouquets({
        category: "top",
        page: 1,
        limit: SLIDES_TO_SHOW,
      });
      const items = response.data.filter(isValidBouquet);
      items.forEach((item) => state.items.set(item.id, item));
      renderList(list, items, bestsellerCardMarkup);
      renderDots();
      update();
    } catch {
      errorMessage.classList.remove("is-hidden");
    } finally {
      loader.classList.remove("is-visible");
    }
  })();
})();

// ===== Feedback slider =====

(() => {
  const section = document.querySelector(".feedback");
  const list = section.querySelector(".feedback-list");
  const [prevBtn, nextBtn] = section.querySelectorAll(".slider-btn");
  let position = 0;

  const visibleCount = () => {
    if (window.matchMedia("(min-width: 1440px)").matches) return 3;
    if (window.matchMedia("(min-width: 768px)").matches) return 2;
    return 1;
  };

  const maxPosition = () => Math.max(0, list.children.length - visibleCount());

  const update = () => {
    const card = list.firstElementChild;
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    list.style.transform = `translateX(-${position * step}px)`;
    prevBtn.disabled = position === 0;
    nextBtn.disabled = position === maxPosition();
  };

  update();

  prevBtn.addEventListener("click", () => {
    position = Math.max(0, position - 1);
    update();
  });
  nextBtn.addEventListener("click", () => {
    position = Math.min(maxPosition(), position + 1);
    update();
  });
  window.addEventListener("resize", () => {
    position = Math.min(position, maxPosition());
    update();
  });
})();

// ===== Product details modal =====

(() => {
  const image = document.querySelector(".product-modal-image");
  const title = document.querySelector(".product-modal-title");
  const price = document.querySelector(".product-modal-price");
  const text = document.querySelector(".product-modal-text");
  const form = document.querySelector(".product-modal-form");

  const orderBackdrop = document.querySelector('.backdrop[data-modal="order"]');
  let currentId = null;
  let returnId = null;

  const openProduct = (id, preserveQty = false) => {
    const item = state.items.get(id);
    if (!item) return;
    currentId = id;
    image.src = resolvePhoto(item.photoURL);
    image.alt = `${item.title} bouquet`;
    title.textContent = item.title;
    price.textContent = `$${item.price}`;
    text.textContent = item.description || "";
    if (!preserveQty) {
      form.reset();
    }
    modals.open("product");
  };

  document.addEventListener("click", (event) => {
    const card = event.target.closest("[data-id]");
    if (card) {
      openProduct(Number(card.dataset.id));
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    returnId = currentId;
    orderContext.bouquetId = currentId;
    orderContext.quantity = Number(form.elements.quantity.value) || 1;
    modals.close(document.querySelector('.backdrop[data-modal="product"]'));
    modals.open("order");
  });

  // Dismissing the order modal steps back to the product modal
  // (the completed order cancels the return, see "order:submitted").
  orderBackdrop.addEventListener("order:submitted", () => {
    returnId = null;
  });
  orderBackdrop.addEventListener("modal:closed", () => {
    if (returnId !== null) {
      openProduct(returnId, true);
      returnId = null;
    }
  });
})();

// ===== Order and subscribe forms =====

(() => {
  const orderForm = document.querySelector(".order-form");

  const orderRules = [
    {
      name: "user-name",
      message: "Please enter your name",
      isValid: (value) => value.trim().length > 0,
    },
    {
      name: "user-phone",
      message: "Please enter a valid phone number",
      isValid: (value) => {
        const digits = value.replace(/\D/g, "");
        return (
          /^[+\d\s()-]+$/.test(value.trim()) &&
          digits.length >= 7 &&
          digits.length <= 15
        );
      },
    },
    {
      name: "user-address",
      message: "Please enter your address",
      isValid: (value) => value.trim().length > 0,
    },
  ];

  const setFieldError = (input, message) => {
    const field = input.closest(".form-field");
    input.classList.toggle("is-error", Boolean(message));
    let errorText = field.querySelector(".form-error");
    if (message) {
      if (!errorText) {
        field.insertAdjacentHTML("beforeend", '<p class="form-error"></p>');
        errorText = field.querySelector(".form-error");
      }
      errorText.textContent = message;
    } else if (errorText) {
      errorText.remove();
    }
  };

  const validateOrderForm = () => {
    let firstInvalid = null;
    orderRules.forEach((rule) => {
      const input = orderForm.elements[rule.name];
      const message = rule.isValid(input.value) ? "" : rule.message;
      setFieldError(input, message);
      if (message && !firstInvalid) firstInvalid = input;
    });
    const agreement = orderForm.elements["license-agreement"];
    agreement
      .closest(".form-agreement")
      .classList.toggle("is-error", !agreement.checked);
    if (!agreement.checked && !firstInvalid) firstInvalid = agreement;
    return firstInvalid;
  };

  orderForm.addEventListener("input", (event) => {
    const rule = orderRules.find((r) => r.name === event.target.name);
    if (rule && rule.isValid(event.target.value)) {
      setFieldError(event.target, "");
    }
    if (event.target.name === "license-agreement" && event.target.checked) {
      event.target.closest(".form-agreement").classList.remove("is-error");
    }
  });

  const submitError = document.querySelector(".order-submit-error");
  const submitBtn = orderForm.querySelector('button[type="submit"]');

  orderForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const firstInvalid = validateOrderForm();
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    submitError.classList.add("is-hidden");
    submitBtn.disabled = true;
    try {
      await axios.post(`${BASE_URL}/orders`, {
        name: orderForm.elements["user-name"].value.trim(),
        phone: orderForm.elements["user-phone"].value.trim(),
        address: orderForm.elements["user-address"].value.trim(),
        message: orderForm.elements["user-message"].value.trim(),
        ...(orderContext.bouquetId
          ? {
              bouquetId: orderContext.bouquetId,
              quantity: orderContext.quantity,
            }
          : {}),
      });
    } catch (error) {
      submitError.classList.remove("is-hidden");
      return;
    } finally {
      submitBtn.disabled = false;
    }
    orderForm.reset();
    const backdrop = document.querySelector('.backdrop[data-modal="order"]');
    backdrop.dispatchEvent(new CustomEvent("order:submitted"));
    modals.close(backdrop);
  });

  const subscribeForm = document.querySelector(".footer-subscribe");
  subscribeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    subscribeForm.reset();
  });
})();

// ===== AOS =====

window.addEventListener("load", () => {
  if (window.AOS) {
    window.AOS.init({ duration: 600, once: true });
  } else {
    document.querySelectorAll("[data-aos]").forEach((el) => {
      el.removeAttribute("data-aos");
    });
  }
});
