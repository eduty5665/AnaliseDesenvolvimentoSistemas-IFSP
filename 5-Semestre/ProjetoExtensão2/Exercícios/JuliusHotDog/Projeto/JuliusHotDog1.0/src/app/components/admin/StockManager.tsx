import { useState, useEffect } from "react";
import { AlertTriangle, Plus, Minus, Package, Edit2, Save, X } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import { Ingredient } from "../../lib/data";
import { getIngredients, updateIngredientStock, saveIngredients } from "../../lib/storage";
import { toast } from "sonner";

interface StockManagerProps {
  onRefresh: () => void;
}

export function StockManager({ onRefresh }: StockManagerProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = () => {
    setIngredients(getIngredients());
  };

  const handleAdjustStock = (ingredientId: string, adjustment: number) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (!ingredient) return;

    const newStock = Math.max(0, ingredient.stock + adjustment);
    updateIngredientStock(ingredientId, newStock);
    loadIngredients();
    onRefresh();
    
    if (adjustment > 0) {
      toast.success(`Entrada registrada: +${adjustment} ${ingredient.unit}`);
    } else {
      toast.success(`Saída registrada: ${adjustment} ${ingredient.unit}`);
    }
  };

  const startEditing = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setEditValue(ingredient.stock);
  };

  const saveEdit = (ingredientId: string) => {
    updateIngredientStock(ingredientId, editValue);
    setEditingId(null);
    loadIngredients();
    onRefresh();
    toast.success("Estoque atualizado!");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const lowStockItems = ingredients.filter(i => i.stock <= i.minStock);
  const criticalStockItems = ingredients.filter(i => i.stock === 0);

  const getStockStatus = (ingredient: Ingredient) => {
    if (ingredient.stock === 0) return { label: "Esgotado", color: "bg-red-500" };
    if (ingredient.stock <= ingredient.minStock) return { label: "Baixo", color: "bg-yellow-500" };
    return { label: "Normal", color: "bg-green-500" };
  };

  const getStockPercentage = (ingredient: Ingredient) => {
    const max = ingredient.minStock * 3; // Arbitrary "full stock" value
    return Math.min(100, (ingredient.stock / max) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {criticalStockItems.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção!</strong> {criticalStockItems.length} {criticalStockItems.length === 1 ? "item esgotado" : "itens esgotados"}:
            {" "}{criticalStockItems.map(i => i.name).join(", ")}
          </AlertDescription>
        </Alert>
      )}

      {lowStockItems.length > 0 && criticalStockItems.length === 0 && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Aviso:</strong> {lowStockItems.length} {lowStockItems.length === 1 ? "item com" : "itens com"} estoque baixo
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-xl">Controle de Estoque</h2>
            <p className="text-sm text-muted-foreground">
              {ingredients.length} ingredientes cadastrados
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Alertas</p>
            <div className="flex items-center gap-2">
              {criticalStockItems.length > 0 && (
                <Badge variant="destructive">
                  {criticalStockItems.length} esgotado{criticalStockItems.length !== 1 && "s"}
                </Badge>
              )}
              {lowStockItems.length > 0 && (
                <Badge className="bg-yellow-500">
                  {lowStockItems.length} baixo{lowStockItems.length !== 1 && "s"}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Ingredients List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ingredients.map((ingredient) => {
          const status = getStockStatus(ingredient);
          const percentage = getStockPercentage(ingredient);
          const isEditing = editingId === ingredient.id;

          return (
            <Card key={ingredient.id} className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">{ingredient.name}</h3>
                    <Badge className={`${status.color} text-white text-xs`}>
                      {status.label}
                    </Badge>
                  </div>
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>

                {/* Stock Level */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={editValue}
                          onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                          className="w-20 h-8"
                        />
                        <span className="text-sm text-muted-foreground">
                          {ingredient.unit}
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold">
                        {ingredient.stock}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          {ingredient.unit}
                        </span>
                      </span>
                    )}
                    
                    <span className="text-sm text-muted-foreground">
                      Mín: {ingredient.minStock}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>

                {/* Actions */}
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1"
                      onClick={() => saveEdit(ingredient.id)}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEdit}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleAdjustStock(ingredient.id, -1)}
                      disabled={ingredient.stock === 0}
                    >
                      <Minus className="w-4 h-4 mr-2" />
                      Remover
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleAdjustStock(ingredient.id, 1)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing(ingredient)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Entry */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-center text-muted-foreground">
          💡 <strong>Dica:</strong> Use os botões + e - para ajustes rápidos, ou clique no ícone de edição para definir um valor específico
        </p>
      </Card>
    </div>
  );
}
