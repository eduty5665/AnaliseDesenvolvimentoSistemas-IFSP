import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft, Filter, ShoppingCart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Product } from "../lib/data";
import { getProducts, getCart } from "../lib/storage";
import { ProductCard } from "../components/ProductCard";
import { CartSheet } from "../components/CartSheet";

export function Menu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setProducts(getProducts());
    updateCartCount();
  }, []);

  const updateCartCount = () => {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
  };

  const categories = [
    { id: "all", label: "Todos", icon: "🌭" },
    { id: "hotdog", label: "Hot Dogs", icon: "🌭" },
    { id: "combo", label: "Combos", icon: "🍔" },
    { id: "adicional", label: "Adicionais", icon: "🧀" },
    { id: "bebida", label: "Bebidas", icon: "🥤" },
  ];

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(p => p.category === selectedCategory);

  const availableProducts = filteredProducts.filter(p => p.available);
  const unavailableProducts = filteredProducts.filter(p => !p.available);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-bold text-xl">Cardápio</h1>
                <p className="text-sm text-muted-foreground">Escolha seus favoritos</p>
              </div>
            </div>
            
            <CartSheet onCartUpdate={updateCartCount}>
              <Button variant="default" size="sm" className="relative">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Carrinho
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </CartSheet>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="sticky top-[73px] z-40 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="whitespace-nowrap">
                  <span className="mr-2">{cat.icon}</span>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-6">
        {availableProducts.length > 0 && (
          <div className="mb-8">
            <h2 className="font-bold text-xl mb-4">Disponíveis Agora</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={updateCartCount}
                />
              ))}
            </div>
          </div>
        )}

        {unavailableProducts.length > 0 && (
          <div>
            <h2 className="font-bold text-xl mb-4 text-muted-foreground">
              Indisponíveis no Momento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
              {unavailableProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover grayscale"
                    />
                    <Badge className="absolute top-2 right-2 bg-red-500">
                      Indisponível
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <span className="text-xl font-bold text-muted-foreground">
                      R$ {product.price.toFixed(2)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              Nenhum produto encontrado nesta categoria
            </p>
          </div>
        )}
      </div>

      {/* Floating Cart Button (Mobile) */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 right-4 md:hidden z-50">
          <CartSheet onCartUpdate={updateCartCount}>
            <Button size="lg" className="rounded-full shadow-lg">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Ver Carrinho ({cartCount})
            </Button>
          </CartSheet>
        </div>
      )}
    </div>
  );
}
