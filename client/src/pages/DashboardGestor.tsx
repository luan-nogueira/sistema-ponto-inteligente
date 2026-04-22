import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import GestaoColaboradoresDB from "@/components/GestaoColaboradoresDB";
import JustificativasPendentes from "@/components/JustificativasPendentes";
import RegistrosTempoReal from "@/components/RegistrosTempoReal";
import MapaLocalizacao from "@/components/MapaLocalizacao";
import Relatorios from "@/components/Relatorios";
import ConfiguracaoEmpresa from "@/components/ConfiguracaoEmpresa";

export default function DashboardGestor() {
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

  const handleQuickAction = (tab: string) => {
    setActiveTab(tab);
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
              icon="👥" 
              label="Colaboradores"
              active={activeTab === "colaboradores"}
              onClick={() => handleNavClick("colaboradores")}
            />
            <NavItem 
              icon="📍" 
              label="Registros em Tempo Real"
              active={activeTab === "registros"}
              onClick={() => handleNavClick("registros")}
            />
            <NavItem 
              icon="📋" 
              label="Justificativas"
              active={activeTab === "justificativas"}
              onClick={() => handleNavClick("justificativas")}
            />
            <NavItem 
              icon="📈" 
              label="Relatórios"
              active={activeTab === "relatorios"}
              onClick={() => handleNavClick("relatorios")}
            />
            <NavItem 
              icon="🗺️" 
              label="Mapa de Localização"
              active={activeTab === "mapa"}
              onClick={() => handleNavClick("mapa")}
            />
            <NavItem 
              icon="⚙️" 
              label="Configurações"
              active={activeTab === "configuracoes"}
              onClick={() => handleNavClick("configuracoes")}
            />
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Gestor
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.role === "admin" ? "Administrador" : "Gestor"}
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
              Dashboard Administrativo
            </h2>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Total de Colaboradores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      0
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Presentes Hoje
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">0</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Ausentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">0</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Atrasados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">0</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Pendentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">0</div>
                  </CardContent>
                </Card>
              </div>

              {/* Ações Rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>
                    Gerencie o sistema de ponto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleQuickAction("colaboradores")}
                    >
                      👥 Colaboradores
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleQuickAction("registros")}
                    >
                      📋 Registros
                    </Button>
                    <Button 
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={() => handleQuickAction("justificativas")}
                    >
                      ✋ Justificativas
                    </Button>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleQuickAction("relatorios")}
                    >
                      📈 Relatórios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Colaboradores Tab */}
          {activeTab === "colaboradores" && (
            <GestaoColaboradoresDB />
          )}

          {/* Registros Tab */}
          {activeTab === "registros" && (
            <RegistrosTempoReal />
          )}

          {/* Justificativas Tab */}
          {activeTab === "justificativas" && (
            <JustificativasPendentes />
          )}

          {/* Relatórios Tab */}
          {activeTab === "relatorios" && (
            <Relatorios />
          )}

          {/* Mapa Tab */}
          {activeTab === "mapa" && (
            <MapaLocalizacao />
          )}

          {/* Configurações Tab */}
          {activeTab === "configuracoes" && (
            <ConfiguracaoEmpresa />
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
