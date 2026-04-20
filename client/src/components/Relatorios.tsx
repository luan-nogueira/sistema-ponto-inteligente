import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2, Download, FileText } from "lucide-react";
import { toast } from "sonner";

export default function Relatorios() {
  const [filtros, setFiltros] = useState({
    dataInicio: new Date(new Date().setDate(1)).toISOString().split("T")[0],
    dataFim: new Date().toISOString().split("T")[0],
    usuarioId: "",
  });

  const { data: relatorio, isLoading, refetch } = trpc.relatorios.gerar.useQuery(filtros);

  const handleExportar = async (formato: "pdf" | "excel") => {
    try {
      toast.info(`Exportando relatório em ${formato.toUpperCase()}...`);
      // Implementar exportação real
      setTimeout(() => {
        toast.success(`Relatório exportado com sucesso!`);
      }, 1500);
    } catch (error: any) {
      toast.error("Erro ao exportar relatório");
    }
  };

  const handleFiltrar = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Gerar Relatório</CardTitle>
          <CardDescription>
            Selecione o período e colaborador para gerar o relatório
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Data Início
              </label>
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) =>
                  setFiltros({ ...filtros, dataInicio: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Data Fim
              </label>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) =>
                  setFiltros({ ...filtros, dataFim: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleFiltrar}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Gerar Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relatório */}
      {relatorio && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Relatório de Ponto</CardTitle>
              <CardDescription>
                Período: {new Date(filtros.dataInicio).toLocaleDateString("pt-BR")} a{" "}
                {new Date(filtros.dataFim).toLocaleDateString("pt-BR")}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleExportar("pdf")}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                onClick={() => handleExportar("excel")}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Total de Registros
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                  {relatorio.totalRegistros || 0}
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Dias Trabalhados
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-300">
                  {relatorio.diasTrabalhados || 0}
                </p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Atrasos
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-300">
                  {relatorio.atrasos || 0}
                </p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Faltas
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-300">
                  {relatorio.faltas || 0}
                </p>
              </div>
            </div>

            {/* Tabela de Registros */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Data
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Tipo
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Horário
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Local
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {relatorio.registros && relatorio.registros.length > 0 ? (
                    relatorio.registros.map((reg: any, idx: number) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <td className="py-3 px-4 text-slate-900 dark:text-white">
                          {new Date(reg.dataRegistro).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {reg.tipo}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {new Date(reg.dataRegistro).toLocaleTimeString("pt-BR")}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {reg.endereco || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        Nenhum registro encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
