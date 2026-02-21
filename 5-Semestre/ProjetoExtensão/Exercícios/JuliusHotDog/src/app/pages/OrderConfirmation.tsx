import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { CheckCircle, Clock, MapPin, Phone, Home } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { getOrderById } from "../lib/storage";
import { Order, config } from "../lib/data";
import { formatCurrency, createWhatsAppContactLink } from "../lib/whatsapp";

export function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) {
      const foundOrder = getOrderById(orderId);
      setOrder(foundOrder || null);
    }
  }, [orderId]);

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <p className="text-lg font-medium mb-4">Pedido não encontrado</p>
          <Link to="/">
            <Button>Voltar ao Início</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const statusConfig = {
    pending: {
      icon: "⏳",
      label: "Aguardando Autorização",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      description: "Seu pedido foi enviado e está aguardando autorização do Julius.",
    },
    authorized: {
      icon: "✅",
      label: "Autorizado - Em Preparo",
      color: "bg-green-100 text-green-800 border-green-300",
      description: "Seu pedido foi autorizado e está sendo preparado!",
    },
    denied: {
      icon: "❌",
      label: "Não Autorizado",
      color: "bg-red-100 text-red-800 border-red-300",
      description: "Infelizmente seu pedido não pôde ser autorizado.",
    },
    preparing: {
      icon: "👨‍🍳",
      label: "Em Preparo",
      color: "bg-blue-100 text-blue-800 border-blue-300",
      description: "Estamos preparando seu pedido com todo carinho!",
    },
    ready: {
      icon: "🎉",
      label: "Pronto para Retirada",
      color: "bg-purple-100 text-purple-800 border-purple-300",
      description: "Seu pedido está pronto! Venha retirar.",
    },
    completed: {
      icon: "✨",
      label: "Concluído",
      color: "bg-gray-100 text-gray-800 border-gray-300",
      description: "Pedido concluído. Obrigado pela preferência!",
    },
  };

  const currentStatus = statusConfig[order.status];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-br from-orange-500 to-red-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">{currentStatus.icon}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Pedido Registrado!</h1>
          <p className="text-white/90">Pedido #{order.id}</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="space-y-6">
          {/* Status Card */}
          <Card className={`p-6 border-2 ${currentStatus.color}`}>
            <div className="text-center">
              <Badge className={`text-lg px-4 py-2 ${currentStatus.color} border-0`}>
                {currentStatus.label}
              </Badge>
              <p className="mt-3 text-sm">
                {currentStatus.description}
              </p>
            </div>
          </Card>

          {/* Pickup Information */}
          {(order.status === "authorized" || order.status === "preparing" || order.status === "ready") && (
            <Card className="p-6">
              <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Informações de Retirada
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Horário de Retirada</span>
                  <span className="font-bold text-lg">{order.pickupTime}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Tempo de Preparo</span>
                  <span className="font-medium">{config.preparationTime} minutos</span>
                </div>
                <Separator />
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Local de Retirada
                  </p>
                  <p className="font-medium">{config.businessAddress}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Order Details */}
          <Card className="p-6">
            <h2 className="font-bold text-xl mb-4">Detalhes do Pedido</h2>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium">
                        {item.quantity}x {item.productName}
                      </p>
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.customizations.map((custom, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {custom}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                  {index < order.items.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold text-xl pt-2">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>

            {order.notes && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Observações:</p>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </Card>

          {/* Customer Information */}
          <Card className="p-6">
            <h2 className="font-bold text-xl mb-4">Seus Dados</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telefone</span>
                <span className="font-medium">{order.customerPhone}</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            {order.status === "pending" && (
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <p className="text-sm text-center mb-3">
                  Acompanhe o status do seu pedido pelo WhatsApp
                </p>
                <a href={createWhatsAppContactLink(`Olá! Gostaria de saber o status do meu pedido #${order.id}`)} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Falar com o Julius
                  </Button>
                </a>
              </Card>
            )}

            <Link to="/" className="block">
              <Button variant="default" size="lg" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>

            <Link to="/cardapio" className="block">
              <Button variant="outline" size="lg" className="w-full">
                Fazer Novo Pedido
              </Button>
            </Link>
          </div>

          {/* Save Order Info */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-center">
              💡 <strong>Dica:</strong> Salve o número do seu pedido <strong>#{order.id}</strong> para consultas futuras
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
