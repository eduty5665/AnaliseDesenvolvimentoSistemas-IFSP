import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { ArrowLeft, Clock, User, Phone, MessageSquare, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { getCart, clearCart, saveOrder, generateOrderId, CartItem, reserveIngredients } from "../lib/storage";
import { Order, config } from "../lib/data";
import { formatCurrency, createWhatsAppAuthorizationMessage } from "../lib/whatsapp";
import { toast } from "sonner";

export function OrderCheckout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const currentCart = getCart();
    if (currentCart.length === 0) {
      navigate("/cardapio");
      return;
    }
    setCart(currentCart);

    // Generate pickup time options
    const minTime = new Date();
    minTime.setMinutes(minTime.getMinutes() + config.minOrderTime);
    setPickupTime(formatTimeForInput(minTime));
  }, [navigate]);

  const formatTimeForInput = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!customerName.trim() || !customerPhone.trim() || !pickupTime) {
        toast.error("Por favor, preencha todos os campos obrigatórios");
        setIsSubmitting(false);
        return;
      }

      // Calculate ingredients needed
      const ingredientsNeeded = new Map<string, number>();
      cart.forEach(cartItem => {
        cartItem.product.ingredients.forEach(ing => {
          const current = ingredientsNeeded.get(ing.id) || 0;
          ingredientsNeeded.set(ing.id, current + (ing.quantity * cartItem.quantity));
        });
      });

      const ingredientsList = Array.from(ingredientsNeeded.entries()).map(([id, quantity]) => ({
        id,
        quantity,
      }));

      // Try to reserve ingredients
      const reserved = reserveIngredients(ingredientsList);
      if (!reserved) {
        toast.error("Desculpe, alguns ingredientes estão indisponíveis no momento. Por favor, revise seu pedido.");
        setIsSubmitting(false);
        return;
      }

      // Create order
      const order: Order = {
        id: generateOrderId(),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          customizations: item.customizations,
        })),
        total: cartTotal,
        pickupTime: pickupTime,
        status: "pending",
        createdAt: new Date().toISOString(),
        notes: notes.trim() || undefined,
        reservedIngredients: ingredientsList,
      };

      // Save order
      saveOrder(order);
      clearCart();

      // Create WhatsApp message
      const baseUrl = window.location.origin;
      const whatsappLink = createWhatsAppAuthorizationMessage(order, baseUrl);

      // Open WhatsApp in new tab
      window.open(whatsappLink, '_blank');

      // Navigate to confirmation page
      navigate(`/comanda/${order.id}`);
      
      toast.success("Pedido enviado com sucesso!");
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Erro ao enviar pedido. Por favor, tente novamente.");
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/cardapio">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-xl">Finalizar Pedido</h1>
              <p className="text-sm text-muted-foreground">Preencha seus dados</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <form onSubmit={handleSubmitOrder} className="space-y-6">
          {/* Order Summary */}
          <Card className="p-4">
            <h2 className="font-bold text-lg mb-4">Resumo do Pedido</h2>
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.quantity}x {item.product.name}
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
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(cartTotal)}</span>
              </div>
            </div>
          </Card>

          {/* Customer Information */}
          <Card className="p-4">
            <h2 className="font-bold text-lg mb-4">Seus Dados</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  <User className="w-4 h-4 inline mr-2" />
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  placeholder="Digite seu nome"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Telefone (WhatsApp) *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupTime">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Horário de Retirada *
                </Label>
                <Input
                  id="pickupTime"
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Tempo de preparo: aproximadamente {config.preparationTime} minutos
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Observações (opcional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Alguma observação sobre seu pedido?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Important Information */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <span className="text-2xl">ℹ️</span>
              Importante
            </h3>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Seu pedido será enviado ao Julius via WhatsApp</li>
              <li>• O pedido precisa ser <strong>autorizado manualmente</strong> pelo Julius</li>
              <li>• Você receberá uma confirmação assim que o pedido for aprovado</li>
              <li>• Os ingredientes serão reservados temporariamente por {config.reservationTimeout} minutos</li>
              <li>• Retire seu pedido no horário selecionado</li>
            </ul>
          </Card>

          {/* Submit Button */}
          <div className="space-y-3">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar Pedido via WhatsApp"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Ao enviar, você será redirecionado para o WhatsApp
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
