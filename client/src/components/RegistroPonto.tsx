import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Loader2, MapPin, Check } from "lucide-react";

interface GeolocationData {
  latitude: number;
  longitude: number;
  precisao: number;
  endereco?: string;
}

export default function RegistroPonto() {
  const [loading, setLoading] = useState(false);
  const [geoLocation, setGeoLocation] = useState<GeolocationData | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const registrarMutation = trpc.ponto.registrar.useMutation();

  const obterLocalizacao = () => {
    setLoading(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError("Geolocalização não suportada pelo navegador");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setGeoLocation({
          latitude,
          longitude,
          precisao: accuracy,
        });

        // Tentar obter endereço via reverse geocoding (opcional)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          setGeoLocation((prev) =>
            prev
              ? { ...prev, endereco: data.address?.city || data.address?.town || "Localização capturada" }
              : null
          );
        } catch (error) {
          console.log("Endereço não disponível");
        }

        setLoading(false);
      },
      (error) => {
        setGeoError(`Erro ao obter localização: ${error.message}`);
        setLoading(false);
      }
    );
  };

  const handleRegistro = async (tipo: "entrada" | "saida" | "intervalo_inicio" | "intervalo_fim") => {
    if (!geoLocation) {
      toast.error("Localização não capturada");
      return;
    }

    try {
      await registrarMutation.mutateAsync({
        tipo,
        latitude: geoLocation.latitude,
        longitude: geoLocation.longitude,
        precisao: geoLocation.precisao,
        endereco: geoLocation.endereco,
        dispositivo: `${navigator.userAgent}`,
      });

      toast.success(`${tipo} registrada com sucesso!`);
      setGeoLocation(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar ponto");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Ponto</CardTitle>
        <CardDescription>
          Clique em "Obter Localização" e depois selecione o tipo de registro
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Localização */}
        <div className="space-y-3">
          <Button
            onClick={obterLocalizacao}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Obtendo localização...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Obter Localização
              </>
            )}
          </Button>

          {geoError && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{geoError}</p>
            </div>
          )}

          {geoLocation && (
            <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Localização capturada
                </p>
              </div>
              <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
                <p>📍 {geoLocation.endereco || "Localização desconhecida"}</p>
                <p>
                  Precisão: {Math.round(geoLocation.precisao)}m
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Botões de Registro */}
        {geoLocation && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleRegistro("entrada")}
              disabled={registrarMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {registrarMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "✓ Entrada"
              )}
            </Button>
            <Button
              onClick={() => handleRegistro("intervalo_inicio")}
              disabled={registrarMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {registrarMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "⏸ Intervalo"
              )}
            </Button>
            <Button
              onClick={() => handleRegistro("intervalo_fim")}
              disabled={registrarMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {registrarMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "▶ Retorno"
              )}
            </Button>
            <Button
              onClick={() => handleRegistro("saida")}
              disabled={registrarMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {registrarMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "✕ Saída"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
