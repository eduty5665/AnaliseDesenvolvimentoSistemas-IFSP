import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Product } from "../lib/data";
import { addToCart, CartItem } from "../lib/storage";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const availableCustomizations = [
    "Sem batata palha",
    "Sem milho",
    "Sem ervilha",
    "Molho extra",
    "Pouco molho",
    "Bem quente",
  ];

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      product,
      quantity,
      customizations: customizations.length > 0 ? customizations : undefined,
    };

    addToCart(cartItem);
    toast.success(`${product.name} adicionado ao carrinho!`);
    onAddToCart();
    setIsOpen(false);
    setQuantity(1);
    setCustomizations([]);
  };

  const toggleCustomization = (custom: string) => {
    setCustomizations(prev =>
      prev.includes(custom)
        ? prev.filter(c => c !== custom)
        : [...prev, custom]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
          <div className="aspect-video relative overflow-hidden bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            {product.category === "combo" && (
              <Badge className="absolute top-2 left-2 bg-green-500">
                Combo
              </Badge>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">{product.name}</h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {product.description}
            </p>
            
            {product.allergens && product.allergens.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {product.allergens.map((allergen) => (
                  <Badge key={allergen} variant="outline" className="text-xs">
                    {allergen}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">
                R$ {product.price.toFixed(2)}
              </span>
              <Button size="sm" variant="default">
                Adicionar
              </Button>
            </div>
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Image */}
          <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Description */}
          <div>
            <p className="text-muted-foreground">{product.description}</p>
            {product.allergens && product.allergens.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-2">Contém:</p>
                <div className="flex flex-wrap gap-2">
                  {product.allergens.map((allergen) => (
                    <Badge key={allergen} variant="outline">
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customizations */}
          {product.customizable && (
            <div>
              <p className="font-medium mb-3">Personalizações (opcional):</p>
              <div className="space-y-3">
                {availableCustomizations.map((custom) => (
                  <div key={custom} className="flex items-center space-x-2">
                    <Checkbox
                      id={custom}
                      checked={customizations.includes(custom)}
                      onCheckedChange={() => toggleCustomization(custom)}
                    />
                    <Label
                      htmlFor={custom}
                      className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {custom}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <p className="font-medium mb-3">Quantidade:</p>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-primary">
              R$ {(product.price * quantity).toFixed(2)}
            </p>
          </div>
          <Button onClick={handleAddToCart} size="lg" className="w-full sm:w-auto">
            Adicionar ao Carrinho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
