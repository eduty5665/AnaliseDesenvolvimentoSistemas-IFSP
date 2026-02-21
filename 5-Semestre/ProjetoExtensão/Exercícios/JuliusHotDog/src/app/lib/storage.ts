// LocalStorage utilities for persisting data
import { Order, Ingredient, Product, initialIngredients, initialProducts } from "./data";

const STORAGE_KEYS = {
  ORDERS: "julius_orders",
  INGREDIENTS: "julius_ingredients",
  PRODUCTS: "julius_products",
  ADMIN_TOKEN: "julius_admin_token",
  CART: "julius_cart",
};

// Orders
export function getOrders(): Order[] {
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return data ? JSON.parse(data) : [];
}

export function saveOrder(order: Order): void {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

export function updateOrder(orderId: string, updates: Partial<Order>): void {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }
}

export function getOrderById(orderId: string): Order | undefined {
  return getOrders().find(o => o.id === orderId);
}

// Ingredients
export function getIngredients(): Ingredient[] {
  const data = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
  if (!data) {
    // Initialize with default data
    saveIngredients(initialIngredients);
    return initialIngredients;
  }
  return JSON.parse(data);
}

export function saveIngredients(ingredients: Ingredient[]): void {
  localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredients));
}

export function updateIngredientStock(ingredientId: string, newStock: number): void {
  const ingredients = getIngredients();
  const index = ingredients.findIndex(i => i.id === ingredientId);
  if (index !== -1) {
    ingredients[index].stock = newStock;
    saveIngredients(ingredients);
  }
}

export function reserveIngredients(items: { id: string; quantity: number }[]): boolean {
  const ingredients = getIngredients();
  
  // Check if all ingredients are available
  for (const item of items) {
    const ingredient = ingredients.find(i => i.id === item.id);
    if (!ingredient || ingredient.stock < item.quantity) {
      return false; // Not enough stock
    }
  }
  
  // Reserve ingredients (deduct from stock)
  for (const item of items) {
    const index = ingredients.findIndex(i => i.id === item.id);
    if (index !== -1) {
      ingredients[index].stock -= item.quantity;
    }
  }
  
  saveIngredients(ingredients);
  return true;
}

export function releaseReservedIngredients(items: { id: string; quantity: number }[]): void {
  const ingredients = getIngredients();
  
  for (const item of items) {
    const index = ingredients.findIndex(i => i.id === item.id);
    if (index !== -1) {
      ingredients[index].stock += item.quantity;
    }
  }
  
  saveIngredients(ingredients);
}

// Products
export function getProducts(): Product[] {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!data) {
    saveProducts(initialProducts);
    return initialProducts;
  }
  return JSON.parse(data);
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

export function updateProductAvailability(productId: string, available: boolean): void {
  const products = getProducts();
  const index = products.findIndex(p => p.id === productId);
  if (index !== -1) {
    products[index].available = available;
    saveProducts(products);
  }
}

// Admin authentication (simple token-based)
export function setAdminToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
}

export function getAdminToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
}

export function clearAdminToken(): void {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
}

export function isAdminAuthenticated(): boolean {
  return !!getAdminToken();
}

// Cart (temporary storage for order being created)
export interface CartItem {
  product: Product;
  quantity: number;
  customizations?: string[];
}

export function getCart(): CartItem[] {
  const data = localStorage.getItem(STORAGE_KEYS.CART);
  return data ? JSON.parse(data) : [];
}

export function saveCart(cart: CartItem[]): void {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

export function clearCart(): void {
  localStorage.removeItem(STORAGE_KEYS.CART);
}

export function addToCart(item: CartItem): void {
  const cart = getCart();
  const existingIndex = cart.findIndex(
    c => c.product.id === item.product.id && 
    JSON.stringify(c.customizations) === JSON.stringify(item.customizations)
  );
  
  if (existingIndex !== -1) {
    cart[existingIndex].quantity += item.quantity;
  } else {
    cart.push(item);
  }
  
  saveCart(cart);
}

export function removeFromCart(index: number): void {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

export function updateCartItemQuantity(index: number, quantity: number): void {
  const cart = getCart();
  if (cart[index]) {
    cart[index].quantity = quantity;
    if (quantity <= 0) {
      cart.splice(index, 1);
    }
    saveCart(cart);
  }
}

// Generate unique order ID
export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `JHD${timestamp}${random}`;
}

// Reset all data (for testing)
export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.ORDERS);
  localStorage.removeItem(STORAGE_KEYS.INGREDIENTS);
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
  localStorage.removeItem(STORAGE_KEYS.CART);
}
