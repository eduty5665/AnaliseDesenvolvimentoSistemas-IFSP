// Analytics and reporting utilities
import { Order } from "./data";
import { getOrders } from "./storage";

export interface SalesReport {
  totalSales: number;
  totalOrders: number;
  averageTicket: number;
  topProducts: { productName: string; quantity: number; revenue: number }[];
  salesByHour: { hour: string; sales: number; orders: number }[];
  salesByDay: { day: string; sales: number; orders: number }[];
  statusBreakdown: { status: string; count: number }[];
}

export function generateSalesReport(startDate?: Date, endDate?: Date): SalesReport {
  const orders = getOrders();
  
  // Filter by date range if provided
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    if (startDate && orderDate < startDate) return false;
    if (endDate && orderDate > endDate) return false;
    return order.status === 'authorized' || order.status === 'preparing' || 
           order.status === 'ready' || order.status === 'completed';
  });

  const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Top products
  const productStats = new Map<string, { quantity: number; revenue: number }>();
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      const existing = productStats.get(item.productName) || { quantity: 0, revenue: 0 };
      productStats.set(item.productName, {
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + (item.price * item.quantity),
      });
    });
  });

  const topProducts = Array.from(productStats.entries())
    .map(([productName, stats]) => ({ productName, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Sales by hour
  const hourStats = new Map<string, { sales: number; orders: number }>();
  filteredOrders.forEach(order => {
    const hour = new Date(order.createdAt).getHours();
    const hourKey = `${hour.toString().padStart(2, '0')}:00`;
    const existing = hourStats.get(hourKey) || { sales: 0, orders: 0 };
    hourStats.set(hourKey, {
      sales: existing.sales + order.total,
      orders: existing.orders + 1,
    });
  });

  const salesByHour = Array.from(hourStats.entries())
    .map(([hour, stats]) => ({ hour, ...stats }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  // Sales by day
  const dayStats = new Map<string, { sales: number; orders: number }>();
  filteredOrders.forEach(order => {
    const date = new Date(order.createdAt);
    const dayKey = date.toLocaleDateString('pt-BR');
    const existing = dayStats.get(dayKey) || { sales: 0, orders: 0 };
    dayStats.set(dayKey, {
      sales: existing.sales + order.total,
      orders: existing.orders + 1,
    });
  });

  const salesByDay = Array.from(dayStats.entries())
    .map(([day, stats]) => ({ day, ...stats }))
    .sort((a, b) => {
      const dateA = parseDate(a.day);
      const dateB = parseDate(b.day);
      return dateA.getTime() - dateB.getTime();
    });

  // Status breakdown
  const statusStats = new Map<string, number>();
  orders.forEach(order => {
    const count = statusStats.get(order.status) || 0;
    statusStats.set(order.status, count + 1);
  });

  const statusBreakdown = Array.from(statusStats.entries())
    .map(([status, count]) => ({ status, count }));

  return {
    totalSales,
    totalOrders,
    averageTicket,
    topProducts,
    salesByHour,
    salesByDay,
    statusBreakdown,
  };
}

function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

export function getOrdersByStatus(status: Order['status']): Order[] {
  return getOrders().filter(order => order.status === status);
}

export function getPendingOrders(): Order[] {
  return getOrdersByStatus('pending');
}

export function getTodayOrders(): Order[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return getOrders().filter(order => {
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  });
}

export function getOrdersForPickupTime(pickupTime: string): Order[] {
  return getOrders().filter(order => order.pickupTime === pickupTime);
}
