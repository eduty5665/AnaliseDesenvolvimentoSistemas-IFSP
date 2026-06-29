import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { Menu } from "./pages/Menu";
import { OrderCheckout } from "./pages/OrderCheckout";
import { OrderConfirmation } from "./pages/OrderConfirmation";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/cardapio",
    Component: Menu,
  },
  {
    path: "/pedido",
    Component: OrderCheckout,
  },
  {
    path: "/comanda/:orderId",
    Component: OrderConfirmation,
  },
  {
    path: "/admin/login",
    Component: AdminLogin,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
