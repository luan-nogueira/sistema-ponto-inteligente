import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import MapView from "@/components/Map";

export default function MapaLocalizacao() {
  const { data: registros, isLoading } = trpc.ponto.getRegistrosComLocalizacao.useQuery();
  const [selectedRegistro, setSelectedRegistro] = useState<any>(null);

  const handleMapReady = (map: google.maps.Map) => {
    if (!registros || registros.length === 0) return;

    // Criar bounds para ajustar o zoom ao mapa
    const bounds = new google.maps.LatLngBounds();

    registros.forEach((registro) => {
      if (registro.latitude && registro.longitude) {
        const position = {
          lat: parseFloat(registro.latitude),
          lng: parseFloat(registro.longitude),
        };

        // Adicionar marker
        new google.maps.Marker({
          position,
          map,
          title: `${registro.usuario?.name} - ${registro.tipo}`,
          icon: getTipoIcon(registro.tipo),
        });

        bounds.extend(position);
      }
    });

    // Ajustar zoom para mostrar todos os markers
    if (registros.length > 0) {
      map.fitBounds(bounds);
    }
  };

  const getTipoIcon = (tipo: string) => {
    const colors: Record<string, string> = {
      entrada: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
      saida: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      intervalo_inicio: "http://maps.google.com/mapfiles/ms/icons/orange-dot.png",
      intervalo_fim: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    };
    return colors[tipo] || "http://maps.google.com/mapfiles/ms/icons/gray-dot.png";
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      entrada: "Entrada",
      saida: "Saída",
      intervalo_inicio: "Intervalo",
      intervalo_fim: "Retorno",
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Mapa */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Mapa de Localização</CardTitle>
            <CardDescription>
              Visualize os registros de ponto no mapa
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : registros && registros.length > 0 ? (
              <div className="w-full h-96 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <MapView onMapReady={handleMapReady} />
              </div>
            ) : (
              <div className="flex items-center justify-center py-32 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <p className="text-slate-500 dark:text-slate-400">
                  Nenhum registro com localização encontrado
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legenda e Detalhes */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Legenda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Entrada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Saída</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Intervalo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Retorno</span>
            </div>
          </CardContent>
        </Card>

        {/* Registros Próximos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registros Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {registros && registros.length > 0 ? (
                registros.slice(0, 10).map((registro) => (
                  <button
                    key={registro.id}
                    onClick={() => setSelectedRegistro(registro)}
                    className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                      selectedRegistro?.id === registro.id
                        ? "bg-blue-100 dark:bg-blue-900"
                        : "hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {registro.usuario?.name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {getTipoLabel(registro.tipo)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      {new Date(registro.dataRegistro).toLocaleTimeString("pt-BR")}
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nenhum registro
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detalhes do Registro Selecionado */}
        {selectedRegistro && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Colaborador
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {selectedRegistro.usuario?.name}
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Tipo
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {getTipoLabel(selectedRegistro.tipo)}
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Horário
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {new Date(selectedRegistro.dataRegistro).toLocaleString("pt-BR")}
                </p>
              </div>
              {selectedRegistro.endereco && (
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    Local
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedRegistro.endereco}
                  </p>
                </div>
              )}
              {selectedRegistro.latitude && selectedRegistro.longitude && (
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    Coordenadas
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">
                    {selectedRegistro.latitude}, {selectedRegistro.longitude}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
