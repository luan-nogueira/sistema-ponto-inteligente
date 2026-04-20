import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NovaJustificativa {
  tipo: "esquecimento_ponto" | "atraso" | "saida_antecipada" | "outro";
  descricao: string;
  dataEvento: string;
}

export default function Justificativas() {
  const [showForm, setShowForm] = useState(false);
  const [novaJustificativa, setNovaJustificativa] = useState<NovaJustificativa>({
    tipo: "atraso",
    descricao: "",
    dataEvento: new Date().toISOString().split("T")[0],
  });

  const { data: justificativas, refetch, isLoading } = trpc.justificativas.getMinha.useQuery();
  const criarMutation = trpc.justificativas.criar.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!novaJustificativa.descricao.trim()) {
      toast.error("Descrição é obrigatória");
      return;
    }

    try {
      await criarMutation.mutateAsync({
        tipo: novaJustificativa.tipo,
        descricao: novaJustificativa.descricao,
        dataEvento: new Date(novaJustificativa.dataEvento),
      });

      toast.success("Justificativa enviada com sucesso!");
      setNovaJustificativa({
        tipo: "atraso",
        descricao: "",
        dataEvento: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar justificativa");
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pendente: {
        bg: "bg-yellow-50 dark:bg-yellow-950",
        text: "text-yellow-600 dark:text-yellow-400",
        label: "Pendente",
      },
      aprovada: {
        bg: "bg-green-50 dark:bg-green-950",
        text: "text-green-600 dark:text-green-400",
        label: "Aprovada",
      },
      rejeitada: {
        bg: "bg-red-50 dark:bg-red-950",
        text: "text-red-600 dark:text-red-400",
        label: "Rejeitada",
      },
    };
    return badges[status] || badges.pendente;
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      esquecimento_ponto: "Esquecimento de Ponto",
      atraso: "Atraso",
      saida_antecipada: "Saída Antecipada",
      outro: "Outro",
    };
    return labels[tipo] || tipo;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Justificativas</CardTitle>
        <CardDescription>
          Solicite ajustes de ponto ao seu gestor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Botão para criar */}
        <Button
          onClick={() => setShowForm(!showForm)}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {showForm ? "Cancelar" : "+ Nova Justificativa"}
        </Button>

        {/* Formulário */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Tipo
              </label>
              <select
                value={novaJustificativa.tipo}
                onChange={(e) =>
                  setNovaJustificativa({
                    ...novaJustificativa,
                    tipo: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-600 text-slate-900 dark:text-white"
              >
                <option value="atraso">Atraso</option>
                <option value="esquecimento_ponto">Esquecimento de Ponto</option>
                <option value="saida_antecipada">Saída Antecipada</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Data do Evento
              </label>
              <input
                type="date"
                value={novaJustificativa.dataEvento}
                onChange={(e) =>
                  setNovaJustificativa({
                    ...novaJustificativa,
                    dataEvento: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-600 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Descrição
              </label>
              <textarea
                value={novaJustificativa.descricao}
                onChange={(e) =>
                  setNovaJustificativa({
                    ...novaJustificativa,
                    descricao: e.target.value,
                  })
                }
                placeholder="Explique o motivo da solicitação..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-600 text-slate-900 dark:text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={criarMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {criarMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Justificativa"
              )}
            </Button>
          </form>
        )}

        {/* Lista de Justificativas */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : justificativas && justificativas.length > 0 ? (
            justificativas.map((justificativa) => {
              const statusBadge = getStatusBadge(justificativa.status);
              return (
                <div
                  key={justificativa.id}
                  className={`p-4 border rounded-lg ${statusBadge.bg}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {getTipoLabel(justificativa.tipo)}
                    </h4>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${statusBadge.text}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {justificativa.descricao}
                  </p>
                  <div className="text-xs text-slate-500 dark:text-slate-500">
                    <p>📅 {new Date(justificativa.dataEvento).toLocaleDateString("pt-BR")}</p>
                    {justificativa.comentarioGestor && (
                      <p className="mt-2 italic">
                        💬 Gestor: {justificativa.comentarioGestor}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">
                Nenhuma justificativa enviada
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
