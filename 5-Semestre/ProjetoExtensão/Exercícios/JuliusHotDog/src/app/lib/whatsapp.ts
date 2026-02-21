// WhatsApp integration utilities
import { Order, config } from "./data";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatOrderForWhatsApp(order: Order): string {
  const items = order.items
    .map(item => {
      const customText = item.customizations && item.customizations.length > 0
        ? `\n   ↳ ${item.customizations.join(', ')}`
        : '';
      return `• ${item.quantity}x ${item.productName} - ${formatCurrency(item.price * item.quantity)}${customText}`;
    })
    .join('\n');

  const notes = order.notes ? `\n\n📝 *Observações:* ${order.notes}` : '';

  return `🌭 *NOVO PEDIDO - Julius Hot Dogs*

📋 *Pedido:* #${order.id}
👤 *Cliente:* ${order.customerName}
📱 *Telefone:* ${order.customerPhone}
⏰ *Retirada:* ${order.pickupTime}

🛒 *Itens:*
${items}

💰 *Total:* ${formatCurrency(order.total)}${notes}

---
⚠️ *Este pedido está PENDENTE de autorização*
Os ingredientes foram reservados temporariamente.`;
}

export function createWhatsAppOrderLink(order: Order): string {
  const message = formatOrderForWhatsApp(order);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${config.whatsappNumber}?text=${encodedMessage}`;
}

export function createWhatsAppAuthorizationMessage(order: Order, baseUrl: string): string {
  const message = `${formatOrderForWhatsApp(order)}

✅ Para AUTORIZAR: ${baseUrl}/admin?authorize=${order.id}
❌ Para NEGAR: ${baseUrl}/admin?deny=${order.id}

Ou acesse o painel administrativo: ${baseUrl}/admin`;
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${config.whatsappNumber}?text=${encodedMessage}`;
}

export function createWhatsAppConfirmationMessage(order: Order): string {
  const message = `✅ *PEDIDO CONFIRMADO!*

Olá ${order.customerName}! 

Seu pedido #${order.id} foi *AUTORIZADO* ✨

⏰ *Retire em:* ${order.pickupTime}
🕐 *Tempo de preparo:* ${config.preparationTime} minutos

📍 *Local:* ${config.businessAddress}

💰 *Valor:* ${formatCurrency(order.total)}

Obrigado pela preferência! 🌭❤️`;
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodedMessage}`;
}

export function createWhatsAppDenialMessage(order: Order, reason?: string): string {
  const reasonText = reason ? `\n\n*Motivo:* ${reason}` : '';
  
  const message = `❌ *PEDIDO NÃO AUTORIZADO*

Olá ${order.customerName},

Infelizmente não conseguimos processar seu pedido #${order.id} no momento.${reasonText}

Por favor, entre em contato conosco para mais informações.

Agradecemos a compreensão! 🙏`;
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodedMessage}`;
}

export function createWhatsAppContactLink(message?: string): string {
  const defaultMessage = "Olá! Gostaria de fazer um pedido no Julius Hot Dogs 🌭";
  const encodedMessage = encodeURIComponent(message || defaultMessage);
  return `https://wa.me/${config.whatsappNumber}?text=${encodedMessage}`;
}
