import { Link } from "react-router";
import { MapPin, Clock, Phone, Menu, ShoppingCart, QrCode } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { config } from "../lib/data";
import { createWhatsAppContactLink } from "../lib/whatsapp";
import { getProducts } from "../lib/storage";
import { getMenuQRCode } from "../lib/qrcode";

export function LandingPage() {
  const featuredProducts = getProducts()
    .filter(p => p.available && p.category === "hotdog")
    .slice(0, 3);

  const menuQRCode = getMenuQRCode(window.location.origin);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">J</span>
            </div>
            <span className="font-bold text-xl">Julius Hot Dogs</span>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Acesso Rápido ao Cardápio</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                  <img
                    src={menuQRCode}
                    alt="QR Code do Cardápio"
                    className="w-64 h-64"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Escaneie este QR Code para acessar o cardápio diretamente do seu celular
                  </p>
                </div>
              </DialogContent>
            </Dialog>
            <Link to="/cardapio">
              <Button variant="default" size="sm">
                <Menu className="w-4 h-4 mr-2" />
                Ver Cardápio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 via-red-600 to-red-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 hover:bg-white/30 border-white/40">
              🌭 O melhor hot dog da região
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Hot Dogs Artesanais
              <br />
              <span className="text-yellow-300">Feitos com Amor</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              Ingredientes premium, receitas exclusivas e atendimento personalizado.
              Peça agora e retire no horário que preferir!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/cardapio">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Fazer Pedido
                </Button>
              </Link>
              <a href={createWhatsAppContactLink()} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  <Phone className="w-5 h-5 mr-2" />
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossos Destaques</h2>
            <p className="text-muted-foreground text-lg">
              Os hot dogs mais pedidos pelos nossos clientes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      R$ {product.price.toFixed(2)}
                    </span>
                    <Link to="/cardapio">
                      <Button size="sm" variant="outline">Ver Mais</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/cardapio">
              <Button size="lg" variant="default">
                Ver Cardápio Completo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌭</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Ingredientes Premium</h3>
              <p className="text-muted-foreground">
                Selecionamos os melhores ingredientes para garantir qualidade e sabor únicos
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⏱️</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Preparo Rápido</h3>
              <p className="text-muted-foreground">
                Seu pedido fica pronto em até {config.preparationTime} minutos
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❤️</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Feito com Carinho</h3>
              <p className="text-muted-foreground">
                Cada pedido é preparado com atenção e cuidado especial
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Onde Estamos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Localização</h3>
                    <p className="text-muted-foreground">{config.businessAddress}</p>
                  </div>
                </div>
                
                <div className="mt-6 rounded-lg overflow-hidden aspect-video">
                  <iframe
                    src={config.mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-start gap-3">
                    <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-3">Horário de Funcionamento</h3>
                      <div className="space-y-2">
                        {config.openingHours.map((schedule, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-muted-foreground">{schedule.day}</span>
                            <span className="font-medium">{schedule.hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start gap-3">
                    <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">Contato</h3>
                      <p className="text-muted-foreground mb-4">
                        Entre em contato para dúvidas ou pedidos especiais
                      </p>
                      <a href={createWhatsAppContactLink()} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full">
                          <Phone className="w-4 h-4 mr-2" />
                          Chamar no WhatsApp
                        </Button>
                      </a>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-orange-500 to-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para Experimentar?
          </h2>
          <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
            Faça seu pedido agora e venha retirar no horário que preferir.
            Garantimos qualidade e sabor em cada mordida!
          </p>
          <Link to="/cardapio">
            <Button size="lg" variant="secondary">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Fazer Meu Pedido
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="mb-2">&copy; 2026 Julius Hot Dogs. Todos os direitos reservados.</p>
          <p className="text-sm">Feito com ❤️ para a comunidade escolar</p>
        </div>
      </footer>
    </div>
  );
}