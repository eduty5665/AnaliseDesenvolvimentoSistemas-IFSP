// QR Code utilities for location and quick access
import { config } from "./data";

/**
 * Generates a QR code URL using a free QR code API
 * @param data - The data to encode in the QR code
 * @param size - Size of the QR code (default: 200)
 */
export function generateQRCodeUrl(data: string, size: number = 200): string {
  const encodedData = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}`;
}

/**
 * Generates a QR code for the menu page
 */
export function getMenuQRCode(baseUrl: string): string {
  const menuUrl = `${baseUrl}/cardapio`;
  return generateQRCodeUrl(menuUrl, 300);
}

/**
 * Generates a QR code for location (Google Maps)
 */
export function getLocationQRCode(): string {
  const locationData = `geo:0,0?q=${encodeURIComponent(config.businessAddress)}`;
  return generateQRCodeUrl(locationData, 300);
}

/**
 * Generates a QR code for WhatsApp contact
 */
export function getWhatsAppQRCode(): string {
  const whatsappUrl = `https://wa.me/${config.whatsappNumber}`;
  return generateQRCodeUrl(whatsappUrl, 300);
}

/**
 * Downloads a QR code as an image
 */
export function downloadQRCode(url: string, filename: string = 'qrcode.png'): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
