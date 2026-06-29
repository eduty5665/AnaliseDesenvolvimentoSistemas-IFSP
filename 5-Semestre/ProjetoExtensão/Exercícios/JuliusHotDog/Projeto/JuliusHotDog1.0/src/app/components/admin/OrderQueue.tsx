import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, ChefHat, Package as PackageIcon, Phone } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Order } from "../../lib/data";
import { getOrders, updateOrder, releaseReservedIngredients } from "../../lib/storage";
import { formatCurrency, createWhatsAppConfirmationMessage, createWhatsAppDenialMessage } from "../../lib/whatsapp";
import { toast } from "sonner";

interface OrderQueueProps {
  onRefresh: () => void;
}

export function OrderQueue({ onRefresh }: OrderQueueProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const allOrders = getOrders();
    // Sort by creation date (newest first)
    const sorted = allOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setOrders(sorted);
  };

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    const order = orders.find(o => o.id === orderId);
    
    if (newStatus === "denied" && order?.reservedIngredients) {
      releaseReservedIngredients(order.reservedIngredients);
    }
    
    updateOrder(orderId, { status: newStatus });
    loadOrders();
    onRefresh();
    toast.success(`Status do pedido #${orderId} atualizado!`);
  };

  const handleNotifyCustomer = (order: Order, action: "confirm" | "deny") => {
    const whatsappLink = action === "confirm"
      ? createWhatsAppConfirmationMessage(order)
      : createWhatsAppDenialMessage(order);
    
    window.open(whatsappLink, '_blank');
  };

  const filteredOrders = filterStatus === "all"
    ? orders
    : orders.filter(o => o.status === filterStatus);

  const statusOptions = [
    { value: "all", label: "Todos", count: orders.length },
    { value: "pending", label: "Pendentes", count: orders.filter(o => o.status === "pending").length },
    { value: "authorized", label: "Autorizados", count: orders.filter(o => o.status === "authorized").length },
    { value: "preparing", label: "Em Preparo", count: orders.filter(o => o.status === "preparing").length },
    { value: "ready", label: "Prontos", count: orders.filter(o => o.status === "ready").length },
    { value: "completed", label: "Concluídos", count: orders.filter(o => o.status === "completed").length },
    { value: "denied", label: "Negados", count: orders.filter(o => o.status === "denied").length },
  ];

  const statusConfig = {
    pending: { label: "Pendente", color: "bg-yellow-500", icon: Clock },
    authorized: { label: "Autorizado", color: "bg-green-500", icon: CheckCircle },
    denied: { label: "Negado", color: "bg-red-500", icon: XCircle },
    preparing: { label: "Em Preparo", color: "bg-blue-500", icon: ChefHat },
    ready: { label: "Pronto", color: "bg-purple-500", icon: PackageIcon },
    completed: { label: "Concluído", color: "bg-gray-500", icon: CheckCircle },
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-xl">Fila de Pedidos</h2>
            <p className="text-sm text-muted-foreground">
              {filteredOrders.length} {filteredOrders.length === 1 ? "pedido" : "pedidos"}
            </p>
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Nenhum pedido encontrado</p>
          <p className="text-muted-foreground">
            {filterStatus === "all" 
              ? "Não há pedidos no momento"
              : "Não há pedidos com este status"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;
            const orderDate = new Date(order.createdAt);

            return (
              <Card key={order.id} className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">Pedido #{order.id}</h3>
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {orderDate.toLocaleDateString('pt-BR')} às {orderDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Total</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Cliente</p>
                      <p className="font-medium">{order.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Telefone</p>
                      <p className="font-medium">{order.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Retirada</p>
                      <p className="font-medium">{order.pickupTime}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Itens do Pedido</p>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            {item.quantity}x {item.productName}
                            {item.customizations && item.customizations.length > 0 && (
                              <span className="text-muted-foreground">
                                {" "}({item.customizations.join(", ")})
                              </span>
                            )}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.notes && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Observações:</p>
                      <p className="text-sm text-muted-foreground">{order.notes}</p>
                    </div>
                  )}

                  <Separator />

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value as Order["status"])}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">⏳ Pendente</SelectItem>
                        <SelectItem value="authorized">✅ Autorizado</SelectItem>
                        <SelectItem value="preparing">👨‍🍳 Em Preparo</SelectItem>
                        <SelectItem value="ready">🎉 Pronto</SelectItem>
                        <SelectItem value="completed">✨ Concluído</SelectItem>
                        <SelectItem value="denied">❌ Negado</SelectItem>
                      </SelectContent>
                    </Select>

                    {order.status === "authorized" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNotifyCustomer(order, "confirm")}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Notificar Cliente
                      </Button>
                    )}

                    {order.status === "denied" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNotifyCustomer(order, "deny")}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Notificar Negação
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
