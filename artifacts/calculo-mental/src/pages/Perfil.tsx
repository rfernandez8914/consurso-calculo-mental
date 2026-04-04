import { useState } from "react";
import { User, Lock, Save, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Perfil() {
  const { user, refreshUser } = useAuth();
  const [nombre, setNombre] = useState(user?.name ?? "");
  const [contraActual, setContraActual] = useState("");
  const [contraNueva, setContraNueva] = useState("");
  const [contraConfirm, setContraConfirm] = useState("");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const body: Record<string, string> = {};

    if (nombre.trim() && nombre.trim() !== user?.name) {
      body.name = nombre.trim();
    }

    if (contraNueva) {
      if (contraNueva !== contraConfirm) {
        setMsg({ tipo: "error", texto: "Las contraseñas nuevas no coinciden" });
        return;
      }
      if (contraNueva.length < 6) {
        setMsg({ tipo: "error", texto: "La nueva contraseña debe tener al menos 6 caracteres" });
        return;
      }
      if (!contraActual) {
        setMsg({ tipo: "error", texto: "Debes ingresar tu contraseña actual para cambiarla" });
        return;
      }
      body.password = contraNueva;
      body.currentPassword = contraActual;
    }

    if (Object.keys(body).length === 0) {
      setMsg({ tipo: "error", texto: "No hay cambios para guardar" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json() as { error?: string };
      if (res.ok) {
        await refreshUser();
        setContraActual("");
        setContraNueva("");
        setContraConfirm("");
        setMsg({ tipo: "ok", texto: "Perfil actualizado correctamente" });
      } else {
        setMsg({ tipo: "error", texto: data.error ?? "Error al guardar" });
      }
    } catch {
      setMsg({ tipo: "error", texto: "Error de conexión. Intenta de nuevo." });
    } finally {
      setSaving(false);
    }
  };

  const rolLabel = user?.role === "admin" ? "Administrador" : "Maestro";
  const rolColor = user?.role === "admin"
    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-foreground">Mi perfil</h2>
        <p className="text-muted-foreground text-sm mt-1">Actualiza tu nombre o contraseña</p>
      </div>

      {/* Info actual */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-7 h-7 text-primary" />
        </div>
        <div>
          <p className="font-bold text-foreground text-lg">{user?.name}</p>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
          <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${rolColor}`}>
            {rolLabel}
          </span>
        </div>
      </div>

      <form onSubmit={handleGuardar} className="space-y-6">
        {/* Nombre */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Información personal</h3>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Contraseña */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Cambiar contraseña</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Contraseña actual</label>
              <input
                type="password"
                value={contraActual}
                onChange={(e) => setContraActual(e.target.value)}
                placeholder="Solo requerida si cambias la contraseña"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Nueva contraseña</label>
              <input
                type="password"
                value={contraNueva}
                onChange={(e) => setContraNueva(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Confirmar nueva contraseña</label>
              <input
                type="password"
                value={contraConfirm}
                onChange={(e) => setContraConfirm(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {msg && (
          <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
            msg.tipo === "ok"
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
          }`}>
            {msg.tipo === "ok"
              ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
              : <AlertCircle className="w-4 h-4 flex-shrink-0" />
            }
            {msg.texto}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
        >
          {saving
            ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Save className="w-5 h-5" />
          }
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
