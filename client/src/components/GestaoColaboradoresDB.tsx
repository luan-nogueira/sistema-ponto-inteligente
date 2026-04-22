import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, Lock, Unlock, Plus, Search, Edit } from "lucide-react";

interface Colaborador {
  id: number;
  name: string;
  email: string;
  cargo?: string;
  setor?: string;
  ativo: boolean;
}

export default function GestaoColaboradoresDB() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cargo: "",
    setor: "",
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "bloquear" | "remover" | null;
    id: number;
  }>({
    open: false,
    type: null,
    id: 0,
  });

  // Queries
  const { data: colaboradores = [], isLoading, refetch } = trpc.usuarios.getColaboradores.useQuery();

  // Mutations
  const addColaboradorMutation = trpc.usuarios.addColaborador.useMutation();
  const updateColaboradorMutation = trpc.usuarios.updateColaborador.useMutation();
  const toggleBloqueioMutation = trpc.usuarios.toggleBloqueio.useMutation();
  const removeColaboradorMutation = trpc.usuarios.removeColaborador.useMutation();

  // Adicionar colaborador
  const handleAddColaborador = async () => {
    if (editingId) {
      await handleSaveEdit();
      return;
    }

    if (!formData.name || !formData.email) {
      toast.error("Preencha nome e email");
      return;
    }

    try {
      await addColaboradorMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        cargo: formData.cargo || undefined,
        setor: formData.setor || undefined,
      });

      toast.success("Colaborador adicionado com sucesso!");
      setFormData({ name: "", email: "", cargo: "", setor: "" });
      setShowAddForm(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao adicionar colaborador");
    }
  };

  // Editar colaborador
  const handleEditColaborador = (colaborador: Colaborador) => {
    setEditingId(colaborador.id);
    setFormData({
      name: colaborador.name,
      email: colaborador.email,
      cargo: colaborador.cargo || "",
      setor: colaborador.setor || "",
    });
    setShowAddForm(true);
  };

  // Salvar edição
  const handleSaveEdit = async () => {
    if (!editingId || !formData.name) {
      toast.error("Preencha o nome");
      return;
    }

    try {
      await updateColaboradorMutation.mutateAsync({
        id: editingId,
        name: formData.name,
        cargo: formData.cargo || undefined,
        setor: formData.setor || undefined,
      });

      toast.success("Colaborador atualizado com sucesso!");
      setFormData({ name: "", email: "", cargo: "", setor: "" });
      setEditingId(null);
      setShowAddForm(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar colaborador");
    }
  };

  // Bloquear/Desbloquear
  const handleToggleBloqueio = (id: number) => {
    setConfirmDialog({
      open: true,
      type: "bloquear",
      id,
    });
  };

  const confirmToggleBloqueio = async () => {
    const { id } = confirmDialog;
    try {
      await toggleBloqueioMutation.mutateAsync(id);
      toast.success("Status atualizado com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar status");
    } finally {
      setConfirmDialog({ open: false, type: null, id: 0 });
    }
  };

  // Remover colaborador
  const handleRemoveColaborador = (id: number) => {
    setConfirmDialog({
      open: true,
      type: "remover",
      id,
    });
  };

  const confirmRemoveColaborador = async () => {
    const { id } = confirmDialog;
    try {
      await removeColaboradorMutation.mutateAsync(id);
      toast.success("Colaborador removido com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao remover colaborador");
    } finally {
      setConfirmDialog({ open: false, type: null, id: 0 });
    }
  };

  // Filtrar colaboradores
  const filteredColaboradores = colaboradores.filter(
    (col) =>
      col.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (col.setor?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Gestão de Colaboradores
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie seus colaboradores direto no site
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Colaborador
        </Button>
      </div>

      {/* Formulário de Adição/Edição */}
      {showAddForm && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Editar Colaborador" : "Novo Colaborador"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Nome completo"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                placeholder="Email"
                type="email"
                value={formData.email}
                disabled={!!editingId}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <Input
                placeholder="Cargo"
                value={formData.cargo}
                onChange={(e) =>
                  setFormData({ ...formData, cargo: e.target.value })
                }
              />
              <Input
                placeholder="Setor"
                value={formData.setor}
                onChange={(e) =>
                  setFormData({ ...formData, setor: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddColaborador}
                className="bg-green-600 hover:bg-green-700"
                disabled={addColaboradorMutation.isPending || updateColaboradorMutation.isPending}
              >
                {editingId ? "Atualizar" : "Salvar"}
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  setFormData({ name: "", email: "", cargo: "", setor: "" });
                }}
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Barra de Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar por nome, email ou setor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de Colaboradores */}
      <div className="grid gap-4">
        {filteredColaboradores.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                Nenhum colaborador encontrado
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredColaboradores.map((colaborador) => (
            <Card
              key={colaborador.id}
              className={
                !colaborador.ativo
                  ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                  : ""
              }
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {colaborador.name}
                      </h3>
                      {!colaborador.ativo && (
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-xs font-semibold rounded">
                          BLOQUEADO
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Email</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {colaborador.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Cargo</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {colaborador.cargo || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Setor</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {colaborador.setor || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Status</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {colaborador.ativo ? "Ativo" : "Inativo"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditColaborador(colaborador)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleToggleBloqueio(colaborador.id)}
                      variant="outline"
                      size="sm"
                      className={
                        !colaborador.ativo
                          ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                          : "text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
                      }
                    >
                      {!colaborador.ativo ? (
                        <Unlock className="w-4 h-4" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      onClick={() => handleRemoveColaborador(colaborador.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Confirmação */}
      <AlertDialog open={confirmDialog.open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === "bloquear"
                ? "Confirmar Bloqueio"
                : "Confirmar Remoção"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === "bloquear"
                ? "Tem certeza que deseja bloquear/desbloquear este colaborador? Ele não conseguirá bater ponto enquanto bloqueado."
                : "Tem certeza que deseja remover este colaborador? Esta ação não pode ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel
              onClick={() =>
                setConfirmDialog({ open: false, type: null, id: 0 })
              }
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.type === "bloquear") {
                  confirmToggleBloqueio();
                } else if (confirmDialog.type === "remover") {
                  confirmRemoveColaborador();
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {confirmDialog.type === "bloquear" ? "Bloquear" : "Remover"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total de Colaboradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {colaboradores.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {colaboradores.filter((c) => c.ativo).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Bloqueados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {colaboradores.filter((c) => !c.ativo).length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
