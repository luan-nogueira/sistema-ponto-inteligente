import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ResumoMensal() {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());

  const { data: resumo, isLoading } = trpc.resumos.getResumoMensal.useQuery({
    mes,
    ano,
  });

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handleMesAnterior = () => {
    if (mes === 1) {
      setMes(12);
      setAno(ano - 1);
    } else {
      setMes(mes - 1);
    }
  };

  const handleProximoMes = () => {
    if (mes === 12) {
      setMes(1);
      setAno(ano + 1);
    } else {
      setMes(mes + 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo Mensal</CardTitle>
        <CardDescription>
          Estatísticas do mês selecionado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seletor de Mês */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleMesAnterior}
            className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            ← Anterior
          </button>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {meses[mes - 1]} de {ano}
          </h3>
          <button
            onClick={handleProximoMes}
            className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            Próximo →
          </button>
        </div>

        {/* Resumo */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : resumo ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                Dias Trabalhados
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {resumo.diasTrabalhados}
              </p>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
                Atrasos
              </p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                {resumo.atrasos}
              </p>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-1">
                Faltas
              </p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {resumo.faltas}
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                Saídas Antecipadas
              </p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {resumo.saidasAntecipadas}
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                Horas Trabalhadas
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {Number(resumo.horasTrabalhadas).toFixed(1)}h
              </p>
            </div>

            <div className="p-4 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-lg">
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                Horas Extras
              </p>
              <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                {Number(resumo.horasExtras).toFixed(1)}h
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">
              Nenhum resumo disponível para este mês
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
