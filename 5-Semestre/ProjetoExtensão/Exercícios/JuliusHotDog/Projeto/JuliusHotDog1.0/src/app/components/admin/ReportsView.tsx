import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, ShoppingBag, Award, Calendar } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { generateSalesReport, SalesReport } from "../../lib/analytics";
import { formatCurrency } from "../../lib/whatsapp";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export function ReportsView() {
  const [report, setReport] = useState<SalesReport | null>(null);
  const [period, setPeriod] = useState<string>("all");

  useEffect(() => {
    loadReport();
  }, [period]);

  const loadReport = () => {
    let startDate: Date | undefined;
    const endDate = new Date();

    switch (period) {
      case "today":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const reportData = generateSalesReport(startDate, endDate);
    setReport(reportData);
  };

  if (!report) {
    return <div>Carregando...</div>;
  }

  const statusColors = {
    pending: "#f59e0b",
    authorized: "#10b981",
    denied: "#ef4444",
    preparing: "#3b82f6",
    ready: "#8b5cf6",
    completed: "#6b7280",
  };

  const COLORS = ["#f97316", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-xl">Relatórios e Análises</h2>
            <p className="text-sm text-muted-foreground">
              Acompanhe o desempenho do seu negócio
            </p>
          </div>
          
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o período</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <Badge variant="outline" className="text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              Total
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Faturamento</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(report.totalSales)}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <Badge variant="outline" className="text-blue-600">
              Pedidos
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total de Pedidos</p>
            <p className="text-3xl font-bold text-blue-600">
              {report.totalOrders}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <Badge variant="outline" className="text-purple-600">
              Média
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Ticket Médio</p>
            <p className="text-3xl font-bold text-purple-600">
              {formatCurrency(report.averageTicket)}
            </p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="products">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="hours">Por Horário</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Produtos Mais Vendidos</h3>
            {report.topProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma venda registrada no período
              </p>
            ) : (
              <div className="space-y-3">
                {report.topProducts.slice(0, 10).map((product, index) => {
                  const maxRevenue = report.topProducts[0]?.revenue || 1;
                  const percentage = (product.revenue / maxRevenue) * 100;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <span className="font-medium">{product.productName}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-primary">
                            {formatCurrency(product.revenue)}
                          </span>
                          <span className="text-muted-foreground ml-2">
                            ({product.quantity}x)
                          </span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Vendas por Horário</h3>
            {report.salesByHour.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma venda registrada no período
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.salesByHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="sales" fill="#f97316" name="Vendas (R$)" />
                  <Bar dataKey="orders" fill="#3b82f6" name="Pedidos" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Distribuição por Status</h3>
            {report.statusBreakdown.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum pedido registrado
              </p>
            ) : (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={report.statusBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.status}: ${entry.count}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {report.statusBreakdown.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={statusColors[entry.status as keyof typeof statusColors] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-2 gap-3">
                  {report.statusBreakdown.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-3 rounded-lg border"
                    >
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: statusColors[item.status as keyof typeof statusColors] || COLORS[index % COLORS.length] }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize">
                          {item.status}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.count} pedidos
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Daily Sales */}
      {report.salesByDay.length > 0 && (
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Vendas por Dia
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={report.salesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === "sales") return formatCurrency(value);
                  return value;
                }}
              />
              <Legend />
              <Bar dataKey="sales" fill="#10b981" name="Vendas (R$)" />
              <Bar dataKey="orders" fill="#8b5cf6" name="Pedidos" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
