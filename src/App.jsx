// src/pages/ChecklistEntrega.jsx
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  User,
  Phone,
  Mail,
  CalendarDays,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  Loader2,
  ArrowRight,
  Search,
  Building2,
  UserRound,
  Clock,
} from "lucide-react";

// ─── CONSTANTES ──────────────────────────────────────────────────────────────
const DEALERS = ["Volvo"];
const ASESORES = [
  "Enrique Vazquez Islas",
  "Ricardo Platas",
  "Verónica Del Rayo Galindo León",
  "Julio Camacho Barragán",
  "Fernanda Romero Aguilar",
];
const CONTACTOS_PREFERIDOS = ["WhatsApp", "Teléfono", "Correo", "Presencial"];
const PST_OPCIONES = ["PST1", "PST2", "PST3"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function cls(...clases) {
  return clases.filter(Boolean).join(" ");
}
function normalizeStr(v) {
  return String(v ?? "").trim();
}
function normalizarBusqueda(v) {
  return normalizeStr(v).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// ─── COMPONENTES REUTILIZABLES (idénticos al Tráfico de Piso) ─────────────
function Campo({ label, requerido, error, ayuda, children, className = "" }) {
  return (
    <div className={cls("min-w-0", className)}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
        {requerido && <span className="ml-1 text-amber-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {ayuda && !error && <p className="mt-1 text-xs text-gray-400">{ayuda}</p>}
    </div>
  );
}

function Input({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      className={cls(
        "h-12 w-full rounded-xl border-2 bg-white px-4 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#1a2a3a] focus:shadow-[0_0_0_4px_rgba(26,42,58,0.08)]",
        error ? "border-red-300 focus:border-red-400" : "border-gray-200 hover:border-gray-300",
        className
      )}
    />
  );
}

function Select({ error, children, className = "", ...props }) {
  return (
    <select
      {...props}
      className={cls(
        "h-12 w-full rounded-xl border-2 bg-white px-4 pr-10 text-sm text-gray-800 outline-none transition-all appearance-none cursor-pointer focus:border-[#1a2a3a] focus:shadow-[0_0_0_4px_rgba(26,42,58,0.08)]",
        error ? "border-red-300" : "border-gray-200 hover:border-gray-300",
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 1rem center",
      }}
    >
      {children}
    </select>
  );
}

function Textarea({ error, className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={cls(
        "min-h-[92px] w-full resize-none rounded-xl border-2 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#1a2a3a] focus:shadow-[0_0_0_4px_rgba(26,42,58,0.08)]",
        error ? "border-red-300" : "border-gray-200 hover:border-gray-300",
        className
      )}
    />
  );
}

// ─── Autocomplete Asesor (igual al de Tráfico de Piso) ──────────────────
function AsesorAutocomplete({ value, onChange, error }) {
  const [abierto, setAbierto] = useState(false);
  const opciones = useMemo(() => {
    const q = normalizarBusqueda(value);
    if (!q) return ASESORES.slice(0, 8);
    return ASESORES.filter((a) => normalizarBusqueda(a).includes(q)).slice(0, 8);
  }, [value]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={value}
          error={error}
          onFocus={() => setAbierto(true)}
          onBlur={() => setTimeout(() => setAbierto(false), 140)}
          onChange={(e) => { onChange(e.target.value); setAbierto(true); }}
          placeholder="Buscar asesor..."
          className="pl-10"
        />
      </div>
      {abierto && (
        <div className="absolute left-0 right-0 z-30 mt-1.5 max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
          {opciones.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400">Sin coincidencias</div>
          ) : (
            opciones.map((asesor) => (
              <button
                key={asesor}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(asesor); setAbierto(false); }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                {asesor}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Componente para opciones del checklist (estilo toggle de 3 opciones) ──
function OpcionChecklist({ label, value, onChange, obligatorio = false }) {
  const opciones = [
    { key: "correcto", label: "Correcto", icon: CheckCircle2, color: "text-emerald-600 border-emerald-200 bg-emerald-50" },
    { key: "observar", label: "Observar", icon: AlertCircle, color: "text-amber-600 border-amber-200 bg-amber-50" },
    { key: "na", label: "N/A", icon: XCircle, color: "text-gray-400 border-gray-200 bg-gray-50" },
  ];

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {obligatorio && (
          <span className="text-[10px] font-bold uppercase text-amber-500">*Obligatorio</span>
        )}
      </div>
      <div className="flex gap-2">
        {opciones.map(({ key, label: optLabel, icon: Icon, color }) => {
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={cls(
                "flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-all",
                selected
                  ? color
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {optLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────
export default function ChecklistEntrega() {
  const [form, setForm] = useState({
    dealer: "Volvo",
    cliente: "",
    telefono: "",
    correo: "",
    pst: "",
    asesor: "",
    tecnico: "",
    fecha_entrega: "",
    contacto_preferido: "WhatsApp",
    // Checklist
    explicacion_tecnica: "",
    falla_detectada: "",
    causa_raiz: "",
    piezas_reemplazadas: "",
    trabajos_realizados: "",
    pruebas_validacion: "",
    garantias: "",
    recomendaciones: "",
    cliente_dudas: "",
    cliente_entendio: "",
    validacion_conformidad: "",
    comentarios: "",
  });

  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [mostrarErrores, setMostrarErrores] = useState(false);

  function updateField(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setGuardado(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMostrarErrores(true);
    setEnviando(true);
    setMensaje("");
    // Simulación de guardado
    setTimeout(() => {
      setGuardado(true);
      setMensaje("✅ Checklist guardado correctamente.");
      setEnviando(false);
      setMostrarErrores(false);
    }, 1000);
  };

  const itemsChecklist = [
    { key: "explicacion_tecnica", label: "Explicación técnica al cliente", obligatorio: true },
    { key: "falla_detectada", label: "Explicar claramente cuál era la falla detectada", obligatorio: true },
    { key: "causa_raiz", label: "Explicar la causa raíz encontrada", obligatorio: true },
    { key: "piezas_reemplazadas", label: "Mostrar piezas reemplazadas si aplica", obligatorio: false },
    { key: "trabajos_realizados", label: "Explicar los trabajos realizados punto por punto", obligatorio: true },
    { key: "pruebas_validacion", label: "Explicar pruebas realizadas para validar reparación", obligatorio: true },
    { key: "garantias", label: "Informar garantías aplicables", obligatorio: true },
    { key: "recomendaciones", label: "Explicar recomendaciones futuras o mantenimiento preventivo", obligatorio: true },
    { key: "cliente_dudas", label: "Preguntar al cliente si tiene dudas", obligatorio: true },
    { key: "cliente_entendio", label: "Confirmar que el cliente entendió el trabajo realizado", obligatorio: true },
    { key: "validacion_conformidad", label: "Solicitar validación verbal de conformidad", obligatorio: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60"
        >
          {/* ═══ HEADER — estilo VOLVO (idéntico al Tráfico de Piso) ═══ */}
          <div className="relative overflow-hidden bg-[#1a2a3a] px-8 py-6 md:px-12 md:py-8">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-amber-400/5 blur-2xl" />
            
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
               <h1
                  className="text-5xl font-extralight tracking-[0.6em] text-white uppercase"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  VOLVO
                </h1>
                <p
                  className="text-xs font-light uppercase tracking-[0.25em] text-white"
                  style={{
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
                  }}
                >
                  Checklist de entrega
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-2.5 backdrop-blur">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-white/80">
                  Automotriz R&amp;R
                </span>
              </div>
            </div>
          </div>

          {/* ═══ SUBHEADER ═══ */}
          <div className="border-b border-gray-100 bg-gray-50/50 px-8 py-4 md:px-12">
            <p className="text-sm text-gray-600">
              Explicación al cliente, revisión final, documentación y evidencias.
            </p>
          </div>

          {/* ═══ MENSAJE ═══ */}
          {mensaje && (
            <div className={cls(
              "mx-8 mt-6 rounded-xl border px-5 py-3.5 text-sm font-medium md:mx-12",
              guardado
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            )}>
              {mensaje}
            </div>
          )}

          {/* ═══ FORMULARIO ═══ */}
          <form onSubmit={handleSubmit} className="p-6 md:p-10">
            {/* ── DATOS GENERALES (grid de 3 columnas como Tráfico de Piso) ── */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Dealer */}
              <Campo label="Dealer" requerido>
                <Select
                  value={form.dealer}
                  onChange={(e) => updateField("dealer", e.target.value)}
                >
                  {DEALERS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
              </Campo>

              {/* Cliente */}
              <Campo label="Cliente" requerido>
                <Input
                  value={form.cliente}
                  onChange={(e) => updateField("cliente", e.target.value.toUpperCase())}
                  placeholder="NOMBRE COMPLETO"
                />
              </Campo>

              {/* Teléfono */}
              <Campo
                label="Teléfono"
                requerido
                ayuda="10 dígitos o 52 + 10 dígitos"
              >
                <Input
                  value={form.telefono}
                  onChange={(e) => updateField("telefono", e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder="2711234567"
                />
              </Campo>

              {/* Correo */}
              <Campo label="E-mail">
                <Input
                  type="email"
                  value={form.correo}
                  onChange={(e) => updateField("correo", e.target.value)}
                  placeholder="correo@dominio.com"
                />
              </Campo>

              {/* PST */}
              <Campo label="PST">
                <Select
                  value={form.pst}
                  onChange={(e) => updateField("pst", e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {PST_OPCIONES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </Select>
              </Campo>

              {/* Asesor (autocomplete) */}
              <Campo label="Asesor" requerido>
                <AsesorAutocomplete
                  value={form.asesor}
                  onChange={(valor) => updateField("asesor", valor)}
                />
              </Campo>

              {/* Técnico responsable */}
              <Campo label="Técnico responsable" requerido>
                <Input
                  value={form.tecnico}
                  onChange={(e) => updateField("tecnico", e.target.value)}
                  placeholder="Nombre técnico"
                />
              </Campo>

              {/* Fecha entrega */}
              <Campo label="Fecha entrega" requerido>
                <Input
                  type="datetime-local"
                  value={form.fecha_entrega}
                  onChange={(e) => updateField("fecha_entrega", e.target.value)}
                />
              </Campo>

              {/* Contacto preferido */}
              <Campo label="Contacto preferido">
                <Select
                  value={form.contacto_preferido}
                  onChange={(e) => updateField("contacto_preferido", e.target.value)}
                >
                  {CONTACTOS_PREFERIDOS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </Campo>
            </div>

            {/* ── CHECKLIST DE ENTREGA ── */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                CHECKLIST DE ENTREGA
              </h2>
              <p className="mb-4 text-xs text-gray-500">
                Obligatorio: no entregar unidad sin explicación clara y validada.
              </p>

              <div className="space-y-3">
                {itemsChecklist.map((item) => (
                  <OpcionChecklist
                    key={item.key}
                    label={item.label}
                    value={form[item.key]}
                    onChange={(valor) => updateField(item.key, valor)}
                    obligatorio={item.obligatorio}
                  />
                ))}
              </div>
            </div>

            {/* ── COMENTARIOS ADICIONALES ── */}
            <div className="mt-6">
              <Campo label="Comentarios adicionales">
                <Textarea
                  value={form.comentarios}
                  onChange={(e) => updateField("comentarios", e.target.value)}
                  placeholder="Notas adicionales sobre la entrega..."
                  rows={3}
                />
              </Campo>
            </div>

            {/* ── BOTONES RÁPIDOS ── */}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  const nuevos = {};
                  itemsChecklist.forEach((item) => {
                    nuevos[item.key] = "correcto";
                  });
                  setForm((prev) => ({ ...prev, ...nuevos }));
                }}
                className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
              >
                ✅ Todo OK
              </button>
              <button
                type="button"
                onClick={() => {
                  const nuevos = {};
                  itemsChecklist.forEach((item) => {
                    nuevos[item.key] = "na";
                  });
                  setForm((prev) => ({ ...prev, ...nuevos }));
                }}
                className="rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600 border border-gray-200 hover:bg-gray-200 transition"
              >
                ⚪ Todo N/A
              </button>
            </div>

            {/* ═══ FOOTER — Botón guardar (igual al Tráfico de Piso) ═══ */}
            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gray-50/80 px-6 py-4 md:flex-row">
              <p className="text-sm text-gray-500">
                📋 Revisa los datos y guarda el registro.
              </p>
              <button
                type="submit"
                disabled={enviando}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a2a3a] px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#2a3a4a] hover:shadow-lg hover:shadow-[#1a2a3a]/20 disabled:opacity-60 md:w-auto"
              >
                {enviando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    Guardar checklist
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}