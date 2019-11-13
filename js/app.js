// variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// cart
let cart = [];

// buttons
let buttonDOM = [];

// get the products
class Products {
  // function to retrieve products asynchronously
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map(item => {
        // object destructuring
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;

        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach(product => {
      result += `
      <!-- single product -->
      <article class="product">
        <div class="img-container">
          <img src = ${product.image} alt="" class="product-img">
          <button class="bag-btn" data-id = ${product.id}>
            <i class = "fas fa-shopping-cart"></i>
            <span>add to cart</span>
          </button>
        </div>
        <h3>${product.title}</h3>
        <h4>$${product.price}</h4>
      </article>
      <!-- end single product -->
      `;
    });
    productsDOM.innerHTML = result;
  }

  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id; /* get the id for each individual button */
      let inCart = cart.find(item => item.id === id);
      // check if item is in the cart
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", event => {
        event.target.innerText = "In cart";
        event.target.disabled = true;

        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };

        // add product to the cart
        cart = [...cart, cartItem];

        // save cart to localstorage
        Storage.saveCart(cart);

        // set cart values
        this.setCartValue(cart);

        // display cart item
        this.addCartItem(cartItem);
        // show the cart
        this.showCart();
      });
    });
  }
  setCartValue(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img src=${item.image} alt="">
    <div>
      <h4>${item.title}</h4>
      <h5>$${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
      <div class="fas fa-chevron-up" data-id=${item.id} ></div>
      <p class="item-amount">${item.amount}</p>
      <div class="fas fa-chevron-down" data-id=${item.id}></div>
      </div>`;
    cartContent.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  setupApp() {
    cart = Storage.getCart();
    this.setCartValue(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  }

  populateCart(cart){
    cart.forEach(item=>this.addCartItem(item));
  }

  hideCart(){
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  cartLogic(){
    clearCartBtn.addEventListener('click', ()=>{
      this.clearCart();
    });
  }

  clearCart(){
    let cartItems =cart.map(item=>item.id);
    cartItems.forEach(id=>this.removeItem(id));

    while(cartContent.children.length > 0){
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();

  }
  
  removeItem(id){
    cart=cart.filter(item=>item.id !==id);
    this.setCartValue(cart);
    Storage.saveCart(cart);

    let button =this.getSingleButton(id); 
    button.disabled=false;
    button.innerHTML = `<i class ="fas fa-shopping-cart"><i> add to cart `
  } 

  getSingleButton(id){
    return buttonDOM.find(button=>button.dataset.id===id);
  }
}

// localstorage
class Storage {
  // static method - can be used without being instantiated
  static saveProducts(products) {
    // save products to localstorage as a string
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(
      localStorage.getItem("products")
    ); /* convert string to JSON format */
    return products.find(
      product => product.id === id
    ); /* get the product whose id matches that on the item clicked */
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  // setup application
  ui.setupApp();

  // get all products
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products); /* save products to the local storage */
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
