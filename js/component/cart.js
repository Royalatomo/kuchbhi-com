export const localCartAdd = (item) => {
  const cartCount = document.querySelector(".cart-item-count");
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === item.id) {
      cart[i].qty = cart[i].qty + item.qty;
      if (cart[i].qty <= 0) {
        cart.splice(i, 1);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      cartCount.innerText = cart.length;
      return;
    }
  }

  cartCount.innerText = [item, ...cart].length;
  localStorage.setItem("cart", JSON.stringify([item, ...cart]));
  return;
};

export const delCartItem = (itemId) => {
  const cartCount = document.querySelector(".cart-item-count");
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === itemId) {
      cart.splice(i, 1);

      cartCount.innerText = cart.length
      localStorage.setItem("cart", JSON.stringify(cart));
      return;
    }
  }
};
