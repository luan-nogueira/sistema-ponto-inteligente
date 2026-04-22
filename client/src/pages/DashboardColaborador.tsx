import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import RegistroPonto from "@/components/RegistroPonto";
import HistoricoRegistros from "@/components/HistoricoRegistros";
import ResumoMensal from "@/components/ResumoMensal";
import Justificativas from "@/components/Justificativas";

export default function DashboardColaborador() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      logout();
      setLocation("/login");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const handleQuickAction = (tipo: string) => {
    setActiveTab("registro");
    toast.info(`Clique em "Registrar Ponto" para registrar ${tipo}`);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:z-auto`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white">Ponto</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Inteligente</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <NavItem 
              icon="📊" 
              label="Dashboard" 
              active={activeTab === "overview"}
              onClick={() => handleNavClick("overview")}
            />
            <NavItem 
              icon="📝" 
              label="Registrar Ponto"
              active={activeTab === "registro"}
              onClick={() => handleNavClick("registro")}
            />
            <NavItem 
              icon="📋" 
              label="Histórico"
              active={activeTab === "historico"}
              onClick={() => handleNavClick("historico")}
            />
            <NavItem 
              icon="📈" 
              label="Resumo Mensal"
              active={activeTab === "resumo"}
              onClick={() => handleNavClick("resumo")}
            />
            <NavItem 
              icon="✋" 
              label="Justificativas"
              active={activeTab === "justificativas"}
              onClick={() => handleNavClick("justificativas")}
            />
            <NavItem 
              icon="👤" 
              label="Perfil"
              active={activeTab === "perfil"}
              onClick={() => handleNavClick("perfil")}
            />
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Usuário
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.cargo || "Colaborador"}
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Meu Dashboard
            </h2>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Status Hoje
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      Não iniciado
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Clique em "Registrar" para começar
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Horas Trabalhadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      0h 0m
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Hoje
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Intervalo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      Não iniciado
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Duração: 1h
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Localização
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      Desativada
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Ative para registrar
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Ações Rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>
                    Registre sua entrada, saída ou intervalo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleQuickAction("entrada")}
                    >
                      ✓ Entrada
                    </Button>
                    <Button 
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={() => handleQuickAction("intervalo")}
                    >
                      ⏸ Intervalo
                    </Button>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleQuickAction("retorno")}
                    >
                      ▶ Retorno
                    </Button>
                    <Button 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => handleQuickAction("saída")}
                    >
                      ✕ Saída
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Registro Tab */}
          {activeTab === "registro" && (
            <RegistroPonto />
          )}

          {/* Histórico Tab */}
          {activeTab === "historico" && (
            <HistoricoRegistros />
          )}

          {/* Resumo Tab */}
          {activeTab === "resumo" && (
            <div className="space-y-6">
              <ResumoMensal />
              <Justificativas />
            </div>
          )}

          {/* Justificativas Tab */}
          {activeTab === "justificativas" && (
            <Justificativas />
          )}

          {/* Perfil Tab */}
          {activeTab === "perfil" && (
            <Card>
              <CardHeader>
                <CardTitle>Meu Perfil</CardTitle>
                <CardDescription>Informações do colaborador</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Nome</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Cargo</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{user?.cargo || "Não definido"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Setor</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{user?.setor || "Não definido"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Matrícula</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{user?.numeroMatricula || "Não definida"}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  active = false,
  onClick
}: { 
  icon: string; 
  label: string; 
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
        active
          ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold"
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
