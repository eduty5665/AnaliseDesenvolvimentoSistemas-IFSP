import { Link } from "react-router";
import { Home } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-8 text-center max-w-md">
        <div className="text-6xl mb-4">🌭</div>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-xl font-medium mb-2">Página não encontrada</p>
        <p className="text-muted-foreground mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link to="/">
          <Button size="lg">
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
        </Link>
      </Card>
    </div>
  );
}
