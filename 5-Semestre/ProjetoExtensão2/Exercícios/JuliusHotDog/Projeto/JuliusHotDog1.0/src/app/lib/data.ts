// Mock data structure for Julius Hot Dogs platform

export interface Ingredient {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "hotdog" | "combo" | "adicional" | "bebida";
  ingredients: { id: string; quantity: number }[];
  allergens?: string[];
  available: boolean;
  customizable?: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  pickupTime: string;
  status: "pending" | "authorized" | "denied" | "preparing" | "ready" | "completed";
  createdAt: string;
  notes?: string;
  reservedIngredients?: { id: string; quantity: number }[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  customizations?: string[];
}

// Initial ingredients stock
export const initialIngredients: Ingredient[] = [
  { id: "salsicha", name: "Salsicha Premium", stock: 100, minStock: 20, unit: "un" },
  { id: "pao", name: "Pão de Hot Dog", stock: 100, minStock: 20, unit: "un" },
  { id: "batata", name: "Batata Palha", stock: 50, minStock: 10, unit: "porções" },
  { id: "milho", name: "Milho Verde", stock: 30, minStock: 5, unit: "porções" },
  { id: "ervilha", name: "Ervilha", stock: 30, minStock: 5, unit: "porções" },
  { id: "queijo", name: "Queijo Ralado", stock: 40, minStock: 10, unit: "porções" },
  { id: "catupiry", name: "Catupiry", stock: 25, minStock: 5, unit: "porções" },
  { id: "bacon", name: "Bacon", stock: 35, minStock: 8, unit: "porções" },
  { id: "cheddar", name: "Cheddar", stock: 30, minStock: 8, unit: "porções" },
  { id: "molho_tomate", name: "Molho de Tomate", stock: 20, minStock: 5, unit: "porções" },
  { id: "maionese", name: "Maionese", stock: 20, minStock: 5, unit: "porções" },
  { id: "mostarda", name: "Mostarda", stock: 15, minStock: 3, unit: "porções" },
  { id: "ketchup", name: "Ketchup", stock: 15, minStock: 3, unit: "porções" },
  { id: "coca_lata", name: "Coca-Cola Lata", stock: 40, minStock: 10, unit: "un" },
  { id: "guarana_lata", name: "Guaraná Lata", stock: 40, minStock: 10, unit: "un" },
  { id: "agua", name: "Água Mineral", stock: 30, minStock: 10, unit: "un" },
];



// Products catalog
export const initialProducts: Product[] = [
  {
    id: "hd_tradicional",
    name: "Hot Dog Tradicional",
    description: "Salsicha premium, batata palha, milho, ervilha, queijo ralado e molhos",
    price: 12.00,
    image: "https://www.google.com/url?sa=t&source=web&rct=j&url=https%3A%2F%2Fwww.belbrandsfoodservice.com%2Frecipes%2Fcheese-hot-dawg%2F&ved=0CBYQjRxqFwoTCIDa9aWe0JIDFQAAAAAdAAAAABAH&opi=89978449",
    category: "hotdog",
    ingredients: [
      { id: "salsicha", quantity: 1 },
      { id: "pao", quantity: 1 },
      { id: "batata", quantity: 1 },
      { id: "milho", quantity: 1 },
      { id: "ervilha", quantity: 1 },
      { id: "queijo", quantity: 1 },
      { id: "molho_tomate", quantity: 1 },
      { id: "maionese", quantity: 1 },
    ],
    allergens: ["Glúten", "Lactose"],
    available: true,
    customizable: true,
  },
  {
    id: "hd_bacon",
    name: "Hot Dog Bacon",
    description: "Salsicha premium, bacon crocante, batata palha, queijo e molhos especiais",
    price: 15.00,
    image: "https://images.unsplash.com/photo-1455480570512-42feb248c2b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3QlMjBkb2clMjBnb3VybWV0JTIwZm9vZHxlbnwxfHx8fDE3NzA3Njk5Njh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "hotdog",
    ingredients: [
      { id: "salsicha", quantity: 1 },
      { id: "pao", quantity: 1 },
      { id: "bacon", quantity: 2 },
      { id: "batata", quantity: 1 },
      { id: "queijo", quantity: 1 },
      { id: "maionese", quantity: 1 },
    ],
    allergens: ["Glúten", "Lactose"],
    available: true,
    customizable: true,
  },
  {
    id: "hd_catupiry",
    name: "Hot Dog Catupiry",
    description: "Salsicha premium com generosa porção de catupiry cremoso e batata palha",
    price: 16.00,
    image: "https://images.unsplash.com/photo-1676658153484-5e5a9da28160?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3QlMjBkb2clMjBpbmdyZWRpZW50cyUyMHRvcHBpbmdzfGVufDF8fHx8MTc3MDc2OTk2OXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "hotdog",
    ingredients: [
      { id: "salsicha", quantity: 1 },
      { id: "pao", quantity: 1 },
      { id: "catupiry", quantity: 2 },
      { id: "batata", quantity: 1 },
      { id: "milho", quantity: 1 },
    ],
    allergens: ["Glúten", "Lactose"],
    available: true,
    customizable: true,
  },
  {
    id: "hd_completo",
    name: "Hot Dog Completo",
    description: "O mais pedido! Salsicha, bacon, catupiry, cheddar, todos os acompanhamentos e molhos",
    price: 20.00,
    image: "https://images.unsplash.com/photo-1455480570512-42feb248c2b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3QlMjBkb2clMjBnb3VybWV0JTIwZm9vZHxlbnwxfHx8fDE3NzA3Njk5Njh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "hotdog",
    ingredients: [
      { id: "salsicha", quantity: 1 },
      { id: "pao", quantity: 1 },
      { id: "bacon", quantity: 2 },
      { id: "catupiry", quantity: 1 },
      { id: "cheddar", quantity: 1 },
      { id: "batata", quantity: 1 },
      { id: "milho", quantity: 1 },
      { id: "ervilha", quantity: 1 },
      { id: "queijo", quantity: 1 },
    ],
    allergens: ["Glúten", "Lactose"],
    available: true,
    customizable: true,
  },
  {
    id: "combo_tradicional",
    name: "Combo Tradicional",
    description: "Hot Dog Tradicional + Refrigerante Lata",
    price: 17.00,
    image: "https://images.unsplash.com/photo-1455480570512-42feb248c2b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3QlMjBkb2clMjBnb3VybWV0JTIwZm9vZHxlbnwxfHx8fDE3NzA3Njk5Njh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "combo",
    ingredients: [
      { id: "salsicha", quantity: 1 },
      { id: "pao", quantity: 1 },
      { id: "batata", quantity: 1 },
      { id: "milho", quantity: 1 },
      { id: "ervilha", quantity: 1 },
      { id: "queijo", quantity: 1 },
      { id: "coca_lata", quantity: 1 },
    ],
    allergens: ["Glúten", "Lactose"],
    available: true,
  },
  {
    id: "combo_completo",
    name: "Combo Completo",
    description: "Hot Dog Completo + Refrigerante Lata",
    price: 25.00,
    image: "https://images.unsplash.com/photo-1455480570512-42feb248c2b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3QlMjBkb2clMjBnb3VybWV0JTIwZm9vZHxlbnwxfHx8fDE3NzA3Njk5Njh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "combo",
    ingredients: [
      { id: "salsicha", quantity: 1 },
      { id: "pao", quantity: 1 },
      { id: "bacon", quantity: 2 },
      { id: "catupiry", quantity: 1 },
      { id: "cheddar", quantity: 1 },
      { id: "batata", quantity: 1 },
      { id: "guarana_lata", quantity: 1 },
    ],
    allergens: ["Glúten", "Lactose"],
    available: true,
  },
  {
    id: "bacon_extra",
    name: "Bacon Extra",
    description: "Porção adicional de bacon crocante",
    price: 3.00,
    image: "https://images.unsplash.com/photo-1676658153484-5e5a9da28160?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3QlMjBkb2clMjBpbmdyZWRpZW50cyUyMHRvcHBpbmdzfGVufDF8fHx8MTc3MDc2OTk2OXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "adicional",
    ingredients: [{ id: "bacon", quantity: 1 }],
    available: true,
  },
  {
    id: "catupiry_extra",
    name: "Catupiry Extra",
    description: "Porção adicional de catupiry cremoso",
    price: 3.50,
    image: "https://images.unsplash.com/photo-1676658153484-5e5a9da28160?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3QlMjBkb2clMjBpbmdyZWRpZW50cyUyMHRvcHBpbmdzfGVufDF8fHx8MTc3MDc2OTk2OXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "adicional",
    ingredients: [{ id: "catupiry", quantity: 1 }],
    allergens: ["Lactose"],
    available: true,
  },
  {
    id: "cheddar_extra",
    name: "Cheddar Extra",
    description: "Porção adicional de cheddar cremoso",
    price: 3.00,
    image: "https://images.unsplash.com/photo-1676658153484-5e5a9da28160?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3QlMjBkb2clMjBpbmdyZWRpZW50cyUyMHRvcHBpbmdzfGVufDF8fHx8MTc3MDc2OTk2OXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "adicional",
    ingredients: [{ id: "cheddar", quantity: 1 }],
    allergens: ["Lactose"],
    available: true,
  },
  {
    id: "coca_lata",
    name: "Coca-Cola Lata",
    description: "Refrigerante Coca-Cola 350ml gelado",
    price: 5.00,
    image: "https://images.unsplash.com/photo-1676658153484-5e5a9da28160?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3QlMjBkb2clMjBpbmdyZWRpZW50cyUyMHRvcHBpbmdzfGVufDF8fHx8MTc3MDc2OTk2OXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "bebida",
    ingredients: [{ id: "coca_lata", quantity: 1 }],
    available: true,
  },
  {
    id: "guarana_lata",
    name: "Guaraná Lata",
    description: "Refrigerante Guaraná 350ml gelado",
    price: 5.00,
    image: "https://images.unsplash.com/photo-1676658153484-5e5a9da28160?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3QlMjBkb2clMjBpbmdyZWRpZW50cyUyMHRvcHBpbmdzfGVufDF8fHx8MTc3MDc2OTk2OXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "bebida",
    ingredients: [{ id: "guarana_lata", quantity: 1 }],
    available: true,
  },
  {
    id: "agua",
    name: "Água Mineral",
    description: "Água mineral 500ml gelada",
    price: 3.00,
    image: "https://images.unsplash.com/photo-1676658153484-5e5a9da28160?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3QlMjBkb2clMjBpbmdyZWRpZW50cyUyMHRvcHBpbmdzfGVufDF8fHx8MTc3MDc2OTk2OXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "bebida",
    ingredients: [{ id: "agua", quantity: 1 }],
    available: true,
  },
];

// Configuration
export const config = {
  whatsappNumber: "5511999999999", // Replace with actual number
  businessName: "Julius Hot Dogs",
  businessAddress: "Em frente à Escola Estadual - Rua Principal, 123",
  openingHours: [
    { day: "Segunda a Sexta", hours: "11:00 - 14:00" },
    { day: "Sábado", hours: "11:00 - 15:00" },
  ],
  preparationTime: 15, // minutes
  reservationTimeout: 30, // minutes
  minOrderTime: 30, // minutes ahead
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.0!2d-46.6!3d-23.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMwJzAwLjAiUyA0NsKwMzYnMDAuMCJX!5e0!3m2!1spt-BR!2sbr!4v1234567890!5m2!1spt-BR!2sbr",
};
