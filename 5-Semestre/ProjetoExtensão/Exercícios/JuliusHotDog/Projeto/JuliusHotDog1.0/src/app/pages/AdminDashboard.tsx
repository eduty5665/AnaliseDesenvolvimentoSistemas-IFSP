import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { LogOut, ClipboardList, Package, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { isAdminAuthenticated, clearAdminToken, updateOrder, releaseReservedIngredients } from "../lib/storage";
import { OrderQueue } from "../components/admin/OrderQueue";
import { StockManager } from "../components/admin/StockManager";
import { ReportsView } from "../components/admin/ReportsView";
import { toast } from "sonner";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("orders");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Check authentication
    if (!isAdminAuthenticated()) {
      navigate("/admin/login");
      return;
    }

    // Handle authorization/denial from URL params
    const authorizeId = searchParams.get("authorize");
    const denyId = searchParams.get("deny");

    if (authorizeId) {
      handleAuthorizeOrder(authorizeId);
      setSearchParams({});
    } else if (denyId) {
      handleDenyOrder(denyId);
      setSearchParams({});
    }
  }, [navigate, searchParams, setSearchParams]);

  const handleAuthorizeOrder = (orderId: string) => {
    updateOrder(orderId, { status: "authorized" });
    toast.success(`Pedido #${orderId} autorizado!`);
    setRefreshKey(prev => prev + 1);
  };

  const handleDenyOrder = (orderId: string) => {
    // Get order to release reserved ingredients
    const { getOrderById } = require("../lib/storage");
    const order = getOrderById(orderId);
    
    if (order?.reservedIngredients) {
      releaseReservedIngredients(order.reservedIngredients);
    }
    
    updateOrder(orderId, { status: "denied" });
    toast.success(`Pedido #${orderId} negado. Ingredientes liberados.`);
    setRefreshKey(prev => prev + 1);
  };

  const handleLogout = () => {
    clearAdminToken();
    toast.success("Logout realizado com sucesso");
    navigate("/admin/login");
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success("Dados atualizados!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">J</span>
              </div>
              <div>
                <h1 className="font-bold text-xl">Painel Administrativo</h1>
                <p className="text-sm text-muted-foreground">Julius Hot Dogs</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Atualizar</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Estoque</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrderQueue key={refreshKey} onRefresh={handleRefresh} />
          </TabsContent>

          <TabsContent value="stock">
            <StockManager key={refreshKey} onRefresh={handleRefresh} />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsView key={refreshKey} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
