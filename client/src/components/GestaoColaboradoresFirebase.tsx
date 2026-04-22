import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  setor?: string;
  bloqueado: boolean;
  dataAdmissao: string;
  ativo: boolean;
}

export default function GestaoColaboradoresFirebase() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cargo: "",
    setor: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "bloquear" | "remover" | null;
    id: string;
  }>({
    open: false,
    type: null,
    id: "",
  });

  // Carregar colaboradores do Firestore
  useEffect(() => {
    const loadColaboradores = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "colaborador"));
        const snapshot = await getDocs(q);

        const data: Colaborador[] = [];
        snapshot.forEach((doc) => {
          const userData = doc.data();
          data.push({
            id: doc.id,
            nome: userData.nome || "Sem nome",
            email: userData.email || "Sem email",
            cargo: userData.cargo || "-",
            setor: userData.setor || "-",
            bloqueado: userData.bloqueado || false,
            dataAdmissao: userData.dataAdmissao || new Date().toISOString(),
            ativo: userData.ativo !== false,
          });
        });

        setColaboradores(data);
      } catch (error) {
        console.error("Erro ao carregar colaboradores:", error);
        toast.error("Erro ao carregar colaboradores");
      } finally {
        setLoading(false);
      }
    };

    loadColaboradores();
  }, []);

  // Adicionar novo colaborador
  const handleAddColaborador = async () => {
    if (editingId) {
      await handleSaveEdit();
      return;
    }

    if (!formData.nome || !formData.email) {
      toast.error("Preencha nome e email");
      return;
    }

    try {
      const usersRef = collection(db, "users");
      await addDoc(usersRef, {
        nome: formData.nome,
        email: formData.email,
        cargo: formData.cargo || "-",
        setor: formData.setor || "-",
        role: "colaborador",
        bloqueado: false,
        ativo: true,
        dataAdmissao: Timestamp.now(),
        createdAt: Timestamp.now(),
      });

      toast.success("Colaborador adicionado com sucesso!");
      setFormData({ nome: "", email: "", cargo: "", setor: "" });
      setShowAddForm(false);

      // Recarregar lista
      const usersRef2 = collection(db, "users");
      const q = query(usersRef2, where("role", "==", "colaborador"));
      const snapshot = await getDocs(q);

      const data: Colaborador[] = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        data.push({
          id: doc.id,
          nome: userData.nome || "Sem nome",
          email: userData.email || "Sem email",
          cargo: userData.cargo || "-",
          setor: userData.setor || "-",
          bloqueado: userData.bloqueado || false,
          dataAdmissao: userData.dataAdmissao || new Date().toISOString(),
          ativo: userData.ativo !== false,
        });
      });

      setColaboradores(data);
    } catch (error) {
      console.error("Erro ao adicionar colaborador:", error);
      toast.error("Erro ao adicionar colaborador");
    }
  };

  // Bloquear/Desbloquear colaborador
  const handleToggleBloqueio = async (id: string, bloqueado: boolean) => {
    setConfirmDialog({
      open: true,
      type: "bloquear",
      id,
    });
  };

  // Confirmar bloqueio
  const confirmToggleBloqueio = async () => {
    const { id } = confirmDialog;
    const colaborador = colaboradores.find((c) => c.id === id);
    if (!colaborador) return;

    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        bloqueado: !colaborador.bloqueado,
      });

      toast.success(
        !colaborador.bloqueado
          ? "Colaborador bloqueado"
          : "Colaborador desbloqueado"
      );

      // Atualizar lista local
      setColaboradores(
        colaboradores.map((col) =>
          col.id === id ? { ...col, bloqueado: !col.bloqueado } : col
        )
      );
    } catch (error) {
      console.error("Erro ao bloquear/desbloquear:", error);
      toast.error("Erro ao atualizar status");
    } finally {
      setConfirmDialog({ open: false, type: null, id: "" });
    }
  };

  // Remover colaborador
  const handleRemoveColaborador = async (id: string) => {
    setConfirmDialog({
      open: true,
      type: "remover",
      id,
    });
  };

  // Confirmar remocao
  const confirmRemoveColaborador = async () => {
    const { id } = confirmDialog;
    try {
      const userRef = doc(db, "users", id);
      await deleteDoc(userRef);

      toast.success("Colaborador removido com sucesso!");

      // Atualizar lista local
      setColaboradores(colaboradores.filter((col) => col.id !== id));
    } catch (error) {
      console.error("Erro ao remover colaborador:", error);
      toast.error("Erro ao remover colaborador");
    } finally {
      setConfirmDialog({ open: false, type: null, id: "" });
    }
  };

  // Editar colaborador
  const handleEditColaborador = (colaborador: Colaborador) => {
    setEditingId(colaborador.id);
    setFormData({
      nome: colaborador.nome,
      email: colaborador.email,
      cargo: colaborador.cargo || "",
      setor: colaborador.setor || "",
    });
    setShowAddForm(true);
  };

  // Salvar edicao
  const handleSaveEdit = async () => {
    if (!editingId || !formData.nome || !formData.email) {
      toast.error("Preencha nome e email");
      return;
    }

    try {
      const userRef = doc(db, "users", editingId);
      await updateDoc(userRef, {
        nome: formData.nome,
        email: formData.email,
        cargo: formData.cargo || "-",
        setor: formData.setor || "-",
      });

      toast.success("Colaborador atualizado com sucesso!");
      setFormData({ nome: "", email: "", cargo: "", setor: "" });
      setEditingId(null);
      setShowAddForm(false);

      // Recarregar lista
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("role", "==", "colaborador"));
      const snapshot = await getDocs(q);

      const data: Colaborador[] = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        data.push({
          id: doc.id,
          nome: userData.nome || "Sem nome",
          email: userData.email || "Sem email",
          cargo: userData.cargo || "-",
          setor: userData.setor || "-",
          bloqueado: userData.bloqueado || false,
          dataAdmissao: userData.dataAdmissao || new Date().toISOString(),
          ativo: userData.ativo !== false,
        });
      });

      setColaboradores(data);
    } catch (error) {
      console.error("Erro ao atualizar colaborador:", error);
      toast.error("Erro ao atualizar colaborador");
    }
  };

  // Filtrar colaboradores
  const filteredColaboradores = colaboradores.filter(
    (col) =>
      col.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.setor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
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
            Gerencie seus colaboradores: adicione, bloqueie ou remova
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
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
              />
              <Input
                placeholder="Email"
                type="email"
                value={formData.email}
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
              >
                {editingId ? "Atualizar" : "Salvar"}
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  setFormData({ nome: "", email: "", cargo: "", setor: "" });
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
                colaborador.bloqueado
                  ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                  : ""
              }
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {colaborador.nome}
                      </h3>
                      {colaborador.bloqueado && (
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
                          {colaborador.cargo}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Setor</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {colaborador.setor}
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
                      onClick={() =>
                        handleToggleBloqueio(
                          colaborador.id,
                          colaborador.bloqueado
                        )
                      }
                      variant="outline"
                      size="sm"
                      className={
                        colaborador.bloqueado
                          ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                          : "text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
                      }
                    >
                      {colaborador.bloqueado ? (
                        <>
                          <Unlock className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                        </>
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
                setConfirmDialog({ open: false, type: null, id: "" })
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
              {colaboradores.filter((c) => !c.bloqueado && c.ativo).length}
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
              {colaboradores.filter((c) => c.bloqueado).length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
