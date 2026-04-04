import { useState, useEffect, useCallback } from "react";
import {
  Users, Plus, Pencil, Trash2, X, Save, Eye, EyeOff,
  ShieldCheck, UserRound, AlertCircle, CheckCircle
} from "lucide-react";
import type { UsuarioItem } from "@/types";

interface FormData {
  name: string;
  email: string;
  password: string;
}

export function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<UsuarioItem | null>(null);
  const [form, setForm] = useState<FormData>({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formOk, setFormOk] = useState("");

  const [confirmEliminar, setConfirmEliminar] = useState<UsuarioItem | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const cargarUsuarios = useCallback(async () => {
    try {
      const res = await fetch("/api/users", { credentials: "include" });
      if (res.ok) {
        const data = await res.json() as UsuarioItem[];
        setUsuarios(data);
      } else {
        setError("Error al cargar usuarios");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarUsuarios();
  }, [cargarUsuarios]);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ name: "", email: "", password: "" });
    setFormError("");
    setFormOk("");
    setShowPass(false);
    setModalOpen(true);
  };

  const abrirEditar = (u: UsuarioItem) => {
    setEditando(u);
    setForm({ name: u.name, email: u.email, password: "" });
    setFormError("");
    setFormOk("");
    setShowPass(false);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditando(null);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormOk("");

    if (!form.name.trim()) {
      setFormError("El nombre es requerido");
      return;
    }
    if (!form.email.trim()) {
      setFormError("El correo es requerido");
      return;
    }
    if (!editando && !form.password) {
      setFormError("La contraseña es requerida al crear un usuario");
      return;
    }
    if (form.password && form.password.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, string> = { name: form.name.trim(), email: form.email.trim() };
      if (form.password) body.password = form.password;

      const url = editando ? `/api/users/${editando.id}` : "/api/users";
      const method = editando ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json() as UsuarioItem & { error?: string };
      if (res.ok) {
        await cargarUsuarios();
        cerrarModal();
      } else {
        setFormError(data.error ?? "Error al guardar");
      }
    } catch {
      setFormError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirmEliminar) return;
    setEliminando(true);
    try {
      const res = await fetch(`/api/users/${confirmEliminar.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        await cargarUsuarios();
        setConfirmEliminar(null);
      } else {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Error al eliminar");
        setConfirmEliminar(null);
      }
    } catch {
      setError("Error de conexión");
      setConfirmEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const maestros = usuarios.filter((u) => u.role !== "admin");
  const admins = usuarios.filter((u) => u.role === "admin");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Gestión de Usuarios</h2>
          <p className="text-muted-foreground text-sm mt-1">Administra los maestros del sistema</p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-5 rounded-xl transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          Nuevo Maestro
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm font-medium mb-4">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Admins */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-purple-500" />
          <h3 className="font-bold text-foreground">Administradores</h3>
          <span className="text-xs text-muted-foreground">({admins.length})</span>
        </div>
        <div className="space-y-2">
          {admins.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30">
              <div>
                <p className="font-semibold text-foreground text-sm">{u.name}</p>
                <p className="text-muted-foreground text-xs">{u.email}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                Admin
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Maestros */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-foreground">Maestros</h3>
          <span className="text-xs text-muted-foreground">({maestros.length})</span>
        </div>
        {maestros.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserRound className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay maestros registrados</p>
            <p className="text-xs mt-1">Crea el primer maestro con el botón de arriba</p>
          </div>
        ) : (
          <div className="space-y-2">
            {maestros.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                <div>
                  <p className="font-semibold text-foreground text-sm">{u.name}</p>
                  <p className="text-muted-foreground text-xs">{u.email}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Creado: {new Date(u.createdAt).toLocaleDateString("es-MX")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => abrirEditar(u)}
                    className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmEliminar(u)}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={(e) => { if (e.target === e.currentTarget) cerrarModal(); }}>
          <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-foreground">
                {editando ? "Editar Maestro" : "Nuevo Maestro"}
              </h3>
              <button onClick={cerrarModal} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Nombre</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nombre completo"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="maestro@correo.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Contraseña {editando && <span className="text-muted-foreground font-normal">(dejar vacío para no cambiar)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder={editando ? "Nueva contraseña (opcional)" : "Mínimo 6 caracteres"}
                    required={!editando}
                    className="w-full px-4 py-2.5 pr-12 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-2.5 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}
              {formOk && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl px-4 py-2.5 text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {formOk}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-semibold hover:bg-muted transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-bold py-2.5 rounded-xl transition-all"
                >
                  {saving
                    ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Save className="w-4 h-4" />
                  }
                  {saving ? "Guardando..." : editando ? "Guardar" : "Crear Maestro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Eliminar */}
      {confirmEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">¿Eliminar maestro?</h3>
            <p className="text-muted-foreground text-sm mb-1">
              <span className="font-semibold text-foreground">{confirmEliminar.name}</span>
            </p>
            <p className="text-muted-foreground text-xs mb-6">{confirmEliminar.email}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmEliminar(null)}
                disabled={eliminando}
                className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-semibold hover:bg-muted transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={eliminando}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-all"
              >
                {eliminando
                  ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Trash2 className="w-4 h-4" />
                }
                {eliminando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
