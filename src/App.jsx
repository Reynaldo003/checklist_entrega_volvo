// src/App.jsx
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Camera,
  CarFront,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Loader2,
  Mail,
  MessageSquareText,
  Phone,
  ReceiptText,
  Sparkles,
  UserRound,
  Wrench,
  ArrowRight,
} from "lucide-react";

import { apiChecklistEntrega } from "./lib/apiChecklistEntrega";

// ─── CONSTANTES ───
const ASESORES_VOLVO = [
  "Edgar Valencia",
  "Carlos Macedonio",
  "Luis Enrique Ramos",
  "Juan Carlos Ubaldo",
];

const METODOS_CONTACTO = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "correo", label: "Correo" },
  { value: "llamada", label: "Llamada" },
];

const CHECKLIST_ENTREGA = [
  {
    titulo: "Explicación técnica al cliente",
    ayuda: "Obligatorio: no entregar unidad sin explicación clara y validada.",
    items: [
      ["explicar_falla_detectada", "Explicar claramente cuál era la falla detectada", true],
      ["explicar_causa_raiz", "Explicar la causa raíz encontrada", true],
      ["mostrar_piezas_reemplazadas", "Mostrar piezas reemplazadas si aplica", false],
      ["explicar_trabajos_realizados", "Explicar los trabajos realizados punto por punto", true],
      ["explicar_pruebas_realizadas", "Explicar pruebas realizadas para validar reparación", true],
      ["informar_garantias_aplicables", "Informar garantías aplicables", true],
      ["explicar_recomendaciones_futuras", "Explicar recomendaciones futuras o mantenimiento preventivo", true],
    ],
  },
  {
    titulo: "Confirmación de comprensión del cliente",
    ayuda: "Debe quedar medible que el cliente entendió y validó la explicación.",
    items: [
      ["preguntar_cliente_dudas", "Preguntar al cliente si tiene dudas", true],
      ["confirmar_cliente_entendio", "Confirmar que el cliente entendió el trabajo realizado", true],
      ["validacion_verbal_conformidad", "Solicitar validación verbal de conformidad", true],
    ],
  },
  {
    titulo: "Revisión conjunta de entrega",
    items: [
      ["revisar_fisicamente_vehiculo", "Revisar físicamente el vehículo con el cliente", true],
      ["prueba_ruta_cliente_entrega", "Realizar prueba de ruta con el cliente si aplica", false],
      ["validar_estado_estetico", "Validar estado estético del vehículo", true],
      ["confirmar_sistemas_intervenidos", "Confirmar funcionamiento de sistemas intervenidos", true],
      ["entregar_refacciones_reemplazadas", "Entregar refacciones reemplazadas si aplica", false],
    ],
  },
  {
    titulo: "Documentación final",
    items: [
      ["entregar_factura_orden_final", "Entregar factura y orden de servicio final", true],
      ["entregar_desglose_trabajos_costos", "Entregar desglose de trabajos y costos", true],
      ["obtener_firma_conformidad", "Obtener firma de conformidad de los trabajos realizados", true],
    ],
  },
];

const FORM_INICIAL = {
  agencia: "Volvo",
  nombre: "",
  telefono: "",
  correo: "",
  asesor_servicio: "",
  tecnico_responsable: "",
  placas: "",
  vin: "",
  modelo: "",
  kilometraje: "",
  orden_servicio: "",
  factura: "",
  fecha_hora_entrega: dateTimeLocalActual(),
  metodo_contacto_preferido: "whatsapp",
  observaciones: "",
  descripcion_evidencia: "",
};

// ─── UTILITY FUNCTIONS ───
function dateTimeLocalActual() {
  const date = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}
function soloNumeros(value) {
  return String(value || "").replace(/\D/g, "");
}
function normalizarTelefonoMx(value) {
  const digits = soloNumeros(value);
  if (digits.length === 10) return `52${digits}`;
  return digits;
}
function telefonoValido(value) {
  const digits = soloNumeros(value);
  return digits.length === 10 || (digits.length === 12 && digits.startsWith("52"));
}
function emailValido(value) {
  const email = String(value || "").trim();
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
function cls(...values) {
  return values.filter(Boolean).join(" ");
}

// ─── COMPONENTES BASE (mismo lenguaje visual que Tráfico de Piso) ───

function Campo({ label, requerido, icon: Icon, error, ayuda, children, className = "" }) {
  return (
    <div className={cls("min-w-0", className)}>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
        {Icon && <Icon className="h-3.5 w-3.5 text-gray-400" />}
        {label}
        {requerido && <span className="ml-0.5 text-amber-500">*</span>}
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
        "h-12 w-full rounded-2xl border-2 bg-white px-4 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#1a2a3a] focus:shadow-[0_0_0_4px_rgba(26,42,58,0.08)] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
        error ? "border-red-300 focus:border-red-400" : "border-gray-200 hover:border-gray-300",
        className,
      )}
    />
  );
}

function Select({ error, children, className = "", ...props }) {
  return (
    <select
      {...props}
      className={cls(
        "h-12 w-full cursor-pointer appearance-none rounded-2xl border-2 bg-white px-4 pr-10 text-sm text-gray-800 outline-none transition-all focus:border-[#1a2a3a] focus:shadow-[0_0_0_4px_rgba(26,42,58,0.08)]",
        error ? "border-red-300" : "border-gray-200 hover:border-gray-300",
        className,
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

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={cls(
        "min-h-[92px] w-full resize-none rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-[#1a2a3a] focus:shadow-[0_0_0_4px_rgba(26,42,58,0.08)]",
        className,
      )}
    />
  );
}

// ─── COMPONENTES DE CHECKLIST ───

function EstadoButton({ active, children, onClick, tone, disabled }) {
  const activeClass = {
    ok: "border-emerald-300 bg-emerald-50 text-emerald-700",
    observacion: "border-amber-300 bg-amber-50 text-amber-700",
    na: "border-gray-300 bg-gray-100 text-gray-600",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cls(
        "h-9 rounded-xl border-2 px-3 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40",
        active ? activeClass : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
      )}
    >
      {children}
    </button>
  );
}

function ChecklistCard({ checklist, onChange }) {
  function setEstado(itemId, estado) {
    onChange((prev) => {
      const actual = prev[itemId] || { estado: "", comentario: "" };
      const nextEstado = actual.estado === estado ? "" : estado;
      const next = { ...prev, [itemId]: { ...actual, estado: nextEstado } };

      if (!next[itemId].estado && !next[itemId].comentario) {
        delete next[itemId];
      }

      return next;
    });
  }

  function setComentario(itemId, comentario) {
    onChange((prev) => {
      const actual = prev[itemId] || { estado: "", comentario: "" };
      const next = { ...prev, [itemId]: { ...actual, comentario } };

      if (!next[itemId].estado && !next[itemId].comentario) {
        delete next[itemId];
      }

      return next;
    });
  }

  function marcarSeccion(items, estado) {
    onChange((prev) => {
      const next = { ...prev };

      items.forEach(([itemId, _description, obligatorio]) => {
        if (estado === "na" && obligatorio) return;

        next[itemId] = {
          ...(next[itemId] || { comentario: "" }),
          estado,
        };
      });

      return next;
    });
  }

  return (
    <div className="space-y-4">
      {CHECKLIST_ENTREGA.map((section) => (
        <section
          key={section.titulo}
          className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white"
        >
          <div className="flex flex-col gap-2 border-b border-gray-100 bg-gray-50/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1a2a3a]">{section.titulo}</h3>
              {section.ayuda ? (
                <p className="mt-0.5 text-xs text-gray-400">{section.ayuda}</p>
              ) : null}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => marcarSeccion(section.items, "ok")}
                className="rounded-full border-2 border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
              >
                Todo OK
              </button>
              <button
                type="button"
                onClick={() => marcarSeccion(section.items, "na")}
                className="rounded-full border-2 border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-600 transition hover:bg-gray-100"
              >
                Todo N/A
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {section.items.map(([itemId, description, obligatorio]) => {
              const current = checklist[itemId] || { estado: "", comentario: "" };
              const mostrarComentario = current.estado === "observacion";

              return (
                <div key={itemId} className="grid gap-3 p-4 lg:grid-cols-[1fr_310px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium leading-snug text-gray-700">
                        {description}
                      </p>
                      <span
                        className={cls(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold",
                          obligatorio
                            ? "bg-red-50 text-red-500"
                            : "bg-gray-100 text-gray-500",
                        )}
                      >
                        {obligatorio ? "OBLIGATORIO" : "SI APLICA"}
                      </span>
                    </div>

                    {mostrarComentario ? (
                      <input
                        value={current.comentario || ""}
                        onChange={(event) => setComentario(itemId, event.target.value)}
                        placeholder="Comentario de la observación..."
                        className="mt-2 h-10 w-full rounded-xl border-2 border-amber-200 bg-amber-50/40 px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-amber-300"
                      />
                    ) : null}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <EstadoButton
                      active={current.estado === "ok"}
                      tone="ok"
                      onClick={() => setEstado(itemId, "ok")}
                    >
                      Correcto
                    </EstadoButton>
                    <EstadoButton
                      active={current.estado === "observacion"}
                      tone="observacion"
                      onClick={() => setEstado(itemId, "observacion")}
                    >
                      Observ.
                    </EstadoButton>
                    <EstadoButton
                      active={current.estado === "na"}
                      tone="na"
                      disabled={obligatorio}
                      onClick={() => setEstado(itemId, "na")}
                    >
                      N/A
                    </EstadoButton>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function EvidenciasPicker({ evidencias, setEvidencias }) {
  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white p-4">
      <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/60 px-4 py-5 text-center transition hover:border-gray-400 hover:bg-gray-50">
        <Camera className="mb-2 h-7 w-7 text-gray-400" />
        <span className="text-sm font-bold text-gray-700">Agregar evidencia</span>
        <span className="mt-1 text-xs text-gray-400">
          Fotos de entrega, piezas o conformidad.
        </span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(event) => setEvidencias(Array.from(event.target.files || []))}
        />
      </label>

      {evidencias.length ? (
        <div className="mt-3 grid gap-2">
          {evidencias.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="truncate rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600"
            >
              {file.name}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ───

export default function App() {
  const [form, setForm] = useState(FORM_INICIAL);
  const [checklist, setChecklist] = useState({});
  const [evidencias, setEvidencias] = useState([]);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [ok, setOk] = useState(false);

  const errores = useMemo(() => {
    const result = {};
    if (!form.nombre.trim()) result.nombre = "Requerido";
    if (!telefonoValido(form.telefono)) result.telefono = "Teléfono inválido";
    if (!emailValido(form.correo)) result.correo = "Correo inválido";
    if (!form.fecha_hora_entrega) result.fecha = "Requerido";
    if (!form.asesor_servicio) result.asesor = "Selecciona asesor";
    if (!form.tecnico_responsable.trim()) result.tecnico = "Requerido";
    if (!form.orden_servicio.trim()) result.orden = "Requerido";
    return result;
  }, [form]);

  const progress = useMemo(() => {
    const ids = CHECKLIST_ENTREGA.flatMap((section) => section.items.map(([id]) => id));
    const completados = ids.filter((id) =>
      ["ok", "observacion", "na"].includes(checklist[id]?.estado),
    ).length;
    return { completados, total: ids.length };
  }, [checklist]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setOk(false);
  }

  async function submit(event) {
    event.preventDefault();
    setMensaje("");
    setOk(false);

    if (Object.keys(errores).length) {
      setMensaje(Object.values(errores)[0]);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);

    try {
      await apiChecklistEntrega.create({
        ...form,
        telefono: normalizarTelefonoMx(form.telefono),
        checklist,
        evidencias_nuevas: evidencias,
        descripcion_evidencia: form.descripcion_evidencia,
      });

      setOk(true);
      setMensaje("✅ Checklist de entrega guardado correctamente.");
      setForm(FORM_INICIAL);
      setChecklist({});
      setEvidencias([]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      setMensaje(error.message || "No fue posible guardar la entrega.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60"
        >
          {/* HEADER — Estilo Volvo */}
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
                  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                >
                  CHECKLIST DE ENTREGA
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-2.5 backdrop-blur">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-white/80">Automotriz R&amp;R</span>
              </div>
            </div>
          </div>

          {/* SUBHEADER */}
          <div className="flex flex-col gap-2 border-b border-gray-100 bg-gray-50/50 px-8 py-4 md:flex-row md:items-center md:justify-between md:px-12">
            <p className="text-sm text-gray-600">
              Explicación al cliente, revisión final, documentación y evidencias.
            </p>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#1a2a3a] px-3.5 py-1 text-xs font-bold text-white">
              {progress.completados}/{progress.total} completados
            </span>
          </div>

          {/* MENSAJE */}
          {mensaje && (
            <div
              className={cls(
                "mx-8 mt-6 rounded-2xl border px-5 py-3.5 text-sm font-medium md:mx-12",
                ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700",
              )}
            >
              {mensaje}
            </div>
          )}

          {/* FORMULARIO */}
          <form onSubmit={submit} className="p-6 md:p-10">
            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              {/* ── Columna izquierda: datos generales ── */}
              <aside className="space-y-6">
                <section className="rounded-2xl border-2 border-gray-200 bg-white p-5">
                  <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <UserRound className="h-4 w-4 text-[#1a2a3a]" />
                    Datos generales
                  </h2>

                  <div className="grid gap-4">
                    <Campo label="Dealer" icon={Building2}>
                      <Input value={form.agencia} disabled />
                    </Campo>

                    <Campo label="Cliente" icon={UserRound} requerido error={errores.nombre}>
                      <Input
                        value={form.nombre}
                        error={errores.nombre}
                        onChange={(event) => setField("nombre", event.target.value.toUpperCase())}
                        placeholder="NOMBRE COMPLETO"
                      />
                    </Campo>

                    <Campo
                      label="Teléfono"
                      icon={Phone}
                      requerido
                      error={errores.telefono}
                      ayuda="10 dígitos o 52 + 10 dígitos"
                    >
                      <Input
                        value={form.telefono}
                        error={errores.telefono}
                        onChange={(event) =>
                          setField("telefono", soloNumeros(event.target.value).slice(0, 12))
                        }
                        inputMode="numeric"
                        placeholder="2711234567"
                      />
                    </Campo>

                    <Campo label="Correo" icon={Mail} error={errores.correo}>
                      <Input
                        type="email"
                        value={form.correo}
                        error={errores.correo}
                        onChange={(event) => setField("correo", event.target.value)}
                        placeholder="correo@dominio.com"
                      />
                    </Campo>

                    <Campo label="PST" icon={UserRound} requerido error={errores.asesor}>
                      <Select
                        value={form.asesor_servicio}
                        error={errores.asesor}
                        onChange={(event) => setField("asesor_servicio", event.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        {ASESORES_VOLVO.map((asesor) => (
                          <option key={asesor} value={asesor}>
                            {asesor}
                          </option>
                        ))}
                      </Select>
                    </Campo>

                    <Campo
                      label="Técnico responsable"
                      icon={Wrench}
                      requerido
                      error={errores.tecnico}
                    >
                      <Input
                        value={form.tecnico_responsable}
                        error={errores.tecnico}
                        onChange={(event) => setField("tecnico_responsable", event.target.value)}
                        placeholder="Nombre técnico"
                      />
                    </Campo>

                    <Campo
                      label="Fecha entrega"
                      icon={ClipboardList}
                      requerido
                      error={errores.fecha}
                    >
                      <Input
                        type="datetime-local"
                        value={form.fecha_hora_entrega}
                        error={errores.fecha}
                        onChange={(event) => setField("fecha_hora_entrega", event.target.value)}
                      />
                    </Campo>

                    <Campo label="Contacto preferido" icon={MessageSquareText}>
                      <Select
                        value={form.metodo_contacto_preferido}
                        onChange={(event) =>
                          setField("metodo_contacto_preferido", event.target.value)
                        }
                      >
                        {METODOS_CONTACTO.map((metodo) => (
                          <option key={metodo.value} value={metodo.value}>
                            {metodo.label}
                          </option>
                        ))}
                      </Select>
                    </Campo>
                  </div>
                </section>

                <section className="rounded-2xl border-2 border-gray-200 bg-white p-5">
                  <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <CarFront className="h-4 w-4 text-[#1a2a3a]" />
                    Vehículo y evidencia
                  </h2>

                  <div className="grid gap-4">
                    <Campo
                      label="Orden servicio"
                      icon={ClipboardList}
                      requerido
                      error={errores.orden}
                    >
                      <Input
                        value={form.orden_servicio}
                        error={errores.orden}
                        onChange={(event) =>
                          setField("orden_servicio", event.target.value.toUpperCase())
                        }
                        placeholder="OS-0001"
                      />
                    </Campo>

                    <Campo label="Factura" icon={ReceiptText}>
                      <Input
                        value={form.factura}
                        onChange={(event) => setField("factura", event.target.value.toUpperCase())}
                        placeholder="FAC-0001"
                      />
                    </Campo>

                    <Campo label="Placas" icon={CarFront}>
                      <Input
                        value={form.placas}
                        onChange={(event) => setField("placas", event.target.value.toUpperCase())}
                        placeholder="ABC123"
                      />
                    </Campo>

                    <Campo label="VIN" icon={ClipboardList}>
                      <Input
                        value={form.vin}
                        onChange={(event) => setField("vin", event.target.value.toUpperCase())}
                        placeholder="VIN"
                      />
                    </Campo>

                    <Campo label="Modelo" icon={CarFront}>
                      <Input
                        value={form.modelo}
                        onChange={(event) => setField("modelo", event.target.value)}
                        placeholder="XC60"
                      />
                    </Campo>

                    <Campo label="Kilometraje" icon={Gauge}>
                      <Input
                        value={form.kilometraje}
                        onChange={(event) => setField("kilometraje", soloNumeros(event.target.value))}
                        inputMode="numeric"
                        placeholder="35000"
                      />
                    </Campo>

                    <Campo label="Descripción evidencia" icon={Camera}>
                      <Input
                        value={form.descripcion_evidencia}
                        onChange={(event) =>
                          setField("descripcion_evidencia", event.target.value)
                        }
                        placeholder="Ej. unidad entregada"
                      />
                    </Campo>

                    <Campo label="Observaciones" icon={MessageSquareText}>
                      <Textarea
                        value={form.observaciones}
                        onChange={(event) => setField("observaciones", event.target.value)}
                        placeholder="Comentarios generales de entrega..."
                        rows={3}
                      />
                    </Campo>

                    <EvidenciasPicker evidencias={evidencias} setEvidencias={setEvidencias} />
                  </div>
                </section>
              </aside>

              {/* ── Columna derecha: checklist ── */}
              <section className="rounded-2xl border-2 border-gray-200 bg-white p-5">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <ClipboardList className="h-4 w-4 text-[#1a2a3a]" />
                    Checklist de entrega
                  </h2>
                  <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                    {progress.completados}/{progress.total} completados
                  </span>
                </div>

                <ChecklistCard checklist={checklist} onChange={setChecklist} />
              </section>
            </div>

            {/* FOOTER — Botón guardar */}
            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gray-50/80 px-6 py-4 md:flex-row">
              <p className="text-sm text-gray-500">
                {Object.keys(errores).length
                  ? `⚠️ ${Object.values(errores)[0]}`
                  : "📋 Revisa el checklist y guarda la entrega."}
              </p>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a2a3a] px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#2a3a4a] hover:shadow-lg hover:shadow-[#1a2a3a]/20 disabled:opacity-60 md:w-auto"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    Guardar checklist de entrega
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
