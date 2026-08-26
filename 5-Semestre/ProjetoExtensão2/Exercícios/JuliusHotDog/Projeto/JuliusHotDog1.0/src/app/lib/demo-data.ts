// Script to populate initial demo data
// This can be run in the browser console to add sample orders

import { saveOrder, generateOrderId } from "./storage";
import { Order } from "./data";

export function populateDemoData() {
  // Sample orders for demonstration
  const demoOrders: Omit<Order, "id">[] = [
    {
      customerName: "Maria Silva",
      customerPhone: "(11) 98765-4321",
      items: [
        {
          productId: "hd_completo",
          productName: "Hot Dog Completo",
          quantity: 2,
          price: 20.00,
        },
        {
          productId: "coca_lata",
          productName: "Coca-Cola Lata",
          quantity: 2,
          price: 5.00,
        },
      ],
      total: 50.00,
      pickupTime: "12:30",
      status: "authorized",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      notes: "Bem quente, por favor!",
      reservedIngredients: [],
    },
    {
      customerName: "João Santos",
      customerPhone: "(11) 91234-5678",
      items: [
        {
          productId: "hd_tradicional",
          productName: "Hot Dog Tradicional",
          quantity: 1,
          price: 12.00,
        },
      ],
      total: 12.00,
      pickupTime: "13:00",
      status: "pending",
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      reservedIngredients: [],
    },
    {
      customerName: "Ana Costa",
      customerPhone: "(11) 99876-5432",
      items: [
        {
          productId: "combo_completo",
          productName: "Combo Completo",
          quantity: 1,
          price: 25.00,
        },
        {
          productId: "bacon_extra",
          productName: "Bacon Extra",
          quantity: 1,
          price: 3.00,
        },
      ],
      total: 28.00,
      pickupTime: "13:15",
      status: "preparing",
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      notes: "Pouco molho",
      reservedIngredients: [],
    },
    {
      customerName: "Pedro Lima",
      customerPhone: "(11) 98888-7777",
      items: [
        {
          productId: "hd_bacon",
          productName: "Hot Dog Bacon",
          quantity: 3,
          price: 15.00,
          customizations: ["Molho extra"],
        },
        {
          productId: "guarana_lata",
          productName: "Guaraná Lata",
          quantity: 3,
          price: 5.00,
        },
      ],
      total: 60.00,
      pickupTime: "12:00",
      status: "completed",
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      reservedIngredients: [],
    },
  ];

  // Add demo orders
  demoOrders.forEach((orderData) => {
    const order: Order = {
      ...orderData,
      id: generateOrderId(),
    };
    saveOrder(order);
  });

  console.log("✅ Demo data populated successfully!");
  console.log(`Added ${demoOrders.length} sample orders`);
}

// Helper function to reset and populate
export function resetAndPopulateDemoData() {
  const { resetAllData } = require("./storage");
  resetAllData();
  populateDemoData();
  console.log("🔄 Data reset and repopulated!");
}
