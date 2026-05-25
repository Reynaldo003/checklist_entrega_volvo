// src/App.jsx
import { useMemo, useState } from "react";
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
  Save,
  UserRound,
  Wrench,
} from "lucide-react";

import fondo3 from "./assets/fondo3.jpeg";
import { apiChecklistEntrega } from "./lib/apiChecklistEntrega";

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

function Field({ label, icon: Icon, error, children, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-white/70">
        {Icon ? <Icon className="h-3.5 w-3.5 text-white/45" /> : null}
        {label}
      </label>

      {children}

      {error ? <p className="mt-1 text-[11px] font-bold text-red-200">{error}</p> : null}
    </div>
  );
}

function Input({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      className={cls(
        "h-11 w-full rounded-xl border bg-white/10 px-3 text-sm font-bold text-white outline-none transition placeholder:text-white/35",
        error ? "border-red-200 ring-2 ring-red-300/20" : "border-white/10 focus:border-white/40 focus:ring-2 focus:ring-white/10",
        className,
      )}
    />
  );
}

function Select({ error, className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={cls(
        "h-11 w-full rounded-xl border bg-[#0b1b54]/95 px-3 text-sm font-bold text-white outline-none transition",
        error ? "border-red-200 ring-2 ring-red-300/20" : "border-white/10 focus:border-white/40 focus:ring-2 focus:ring-white/10",
        className,
      )}
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
        "min-h-[92px] w-full resize-y rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-sm font-bold text-white outline-none placeholder:text-white/35 focus:border-white/40 focus:ring-2 focus:ring-white/10",
        className,
      )}
    />
  );
}

function EstadoButton({ active, children, onClick, tone, disabled }) {
  const activeClass = {
    ok: "border-emerald-300/40 bg-emerald-400/20 text-emerald-100",
    observacion: "border-amber-300/40 bg-amber-400/20 text-amber-100",
    na: "border-slate-300/40 bg-slate-400/20 text-slate-100",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cls(
        "h-9 rounded-xl border px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-40",
        active ? activeClass : "border-white/10 bg-white/10 text-white/55 hover:bg-white/20",
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
    <div className="space-y-3">
      {CHECKLIST_ENTREGA.map((section) => (
        <section key={section.titulo} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]">
          <div className="flex flex-col gap-2 border-b border-white/10 bg-white/10 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-black text-white">{section.titulo}</h3>
              {section.ayuda ? <p className="mt-1 text-xs font-semibold text-white/45">{section.ayuda}</p> : null}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => marcarSeccion(section.items, "ok")}
                className="rounded-xl border border-emerald-300/30 bg-emerald-400/15 px-3 py-1.5 text-xs font-black text-emerald-100"
              >
                Todo OK
              </button>

              <button
                type="button"
                onClick={() => marcarSeccion(section.items, "na")}
                className="rounded-xl border border-slate-300/30 bg-slate-400/15 px-3 py-1.5 text-xs font-black text-slate-100"
              >
                Todo N/A
              </button>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {section.items.map(([itemId, description, obligatorio]) => {
              const current = checklist[itemId] || { estado: "", comentario: "" };
              const mostrarComentario = current.estado === "observacion";

              return (
                <div key={itemId} className="grid gap-3 p-3 lg:grid-cols-[1fr_310px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold leading-snug text-white/85">{description}</p>
                      <span
                        className={cls(
                          "rounded-full px-2 py-0.5 text-[10px] font-black",
                          obligatorio ? "bg-red-400/15 text-red-100" : "bg-slate-400/15 text-slate-100",
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
                        className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-sm font-semibold text-white outline-none placeholder:text-white/35"
                      />
                    ) : null}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <EstadoButton active={current.estado === "ok"} tone="ok" onClick={() => setEstado(itemId, "ok")}>
                      Correcto
                    </EstadoButton>
                    <EstadoButton active={current.estado === "observacion"} tone="observacion" onClick={() => setEstado(itemId, "observacion")}>
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
      <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-[#06122f]/60 px-4 py-5 text-center transition hover:bg-white/10">
        <Camera className="mb-2 h-7 w-7 text-white/70" />
        <span className="text-sm font-black text-white">Agregar evidencia</span>
        <span className="mt-1 text-xs font-semibold text-white/50">Fotos de entrega, piezas o conformidad.</span>
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
            <div key={`${file.name}-${index}`} className="truncate rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white/80">
              {file.name}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

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
    const completados = ids.filter((id) => ["ok", "observacion", "na"].includes(checklist[id]?.estado)).length;
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
      setMensaje("Checklist de entrega guardado correctamente.");
      setForm(FORM_INICIAL);
      setChecklist({});
      setEvidencias([]);
    } catch (error) {
      console.error(error);
      setMensaje(error.message || "No fue posible guardar la entrega.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${fondo3})` }}
        />
        <div className="absolute inset-0 bg-[#061126]/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(44,91,187,0.28),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.12),_transparent_28%)]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-2 py-4 sm:px-4">
        <form
          onSubmit={submit}
          className="w-full overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-3 shadow-[0_30px_90px_-25px_rgba(0,0,0,0.65)] backdrop-blur-md sm:p-5"
        >
          <header className="mb-4 text-center">
            <span className="inline-flex rounded-full border border-white/40 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wide text-white">
              Automotriz R&amp;R · Volvo
            </span>

            <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
              Checklist de entrega
            </h1>

            <p className="mt-1 text-sm font-semibold text-white/60">
              Explicación al cliente, revisión final, documentación y evidencias.
            </p>
          </header>

          {mensaje ? (
            <div
              className={cls(
                "mb-4 rounded-2xl border px-4 py-3 text-sm font-black",
                ok ? "border-emerald-300/30 bg-emerald-400/15 text-emerald-100" : "border-red-300/30 bg-red-400/15 text-red-100",
              )}
            >
              {mensaje}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
            <aside className="space-y-4">
              <section className="rounded-3xl border border-white/10 bg-[#06122f]/70 p-4">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-white/70">
                  <UserRound className="h-4 w-4" />
                  Datos generales
                </h2>

                <div className="grid gap-3">
                  <Field label="Dealer" icon={Building2}>
                    <Input value={form.agencia} disabled />
                  </Field>

                  <Field label="Cliente" icon={UserRound} error={errores.nombre}>
                    <Input
                      value={form.nombre}
                      error={errores.nombre}
                      onChange={(event) => setField("nombre", event.target.value.toUpperCase())}
                      placeholder="NOMBRE COMPLETO"
                    />
                  </Field>

                  <Field label="Teléfono" icon={Phone} error={errores.telefono}>
                    <Input
                      value={form.telefono}
                      error={errores.telefono}
                      onChange={(event) => setField("telefono", soloNumeros(event.target.value).slice(0, 12))}
                      inputMode="numeric"
                      placeholder="2711234567"
                    />
                  </Field>

                  <Field label="Correo" icon={Mail} error={errores.correo}>
                    <Input
                      type="email"
                      value={form.correo}
                      error={errores.correo}
                      onChange={(event) => setField("correo", event.target.value)}
                      placeholder="correo@dominio.com"
                    />
                  </Field>

                  <Field label="Asesor" icon={UserRound} error={errores.asesor}>
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
                  </Field>

                  <Field label="Técnico responsable" icon={Wrench} error={errores.tecnico}>
                    <Input
                      value={form.tecnico_responsable}
                      error={errores.tecnico}
                      onChange={(event) => setField("tecnico_responsable", event.target.value)}
                      placeholder="Nombre técnico"
                    />
                  </Field>

                  <Field label="Fecha entrega" icon={ClipboardList} error={errores.fecha}>
                    <Input
                      type="datetime-local"
                      value={form.fecha_hora_entrega}
                      error={errores.fecha}
                      onChange={(event) => setField("fecha_hora_entrega", event.target.value)}
                    />
                  </Field>

                  <Field label="Contacto preferido" icon={MessageSquareText}>
                    <Select
                      value={form.metodo_contacto_preferido}
                      onChange={(event) => setField("metodo_contacto_preferido", event.target.value)}
                    >
                      {METODOS_CONTACTO.map((metodo) => (
                        <option key={metodo.value} value={metodo.value}>
                          {metodo.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-[#06122f]/70 p-4">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-white/70">
                  <CarFront className="h-4 w-4" />
                  Vehículo y evidencia
                </h2>

                <div className="grid gap-3">
                  <Field label="Orden servicio" icon={ClipboardList} error={errores.orden}>
                    <Input
                      value={form.orden_servicio}
                      error={errores.orden}
                      onChange={(event) => setField("orden_servicio", event.target.value.toUpperCase())}
                      placeholder="OS-0001"
                    />
                  </Field>

                  <Field label="Factura" icon={ReceiptText}>
                    <Input
                      value={form.factura}
                      onChange={(event) => setField("factura", event.target.value.toUpperCase())}
                      placeholder="FAC-0001"
                    />
                  </Field>

                  <Field label="Placas" icon={CarFront}>
                    <Input
                      value={form.placas}
                      onChange={(event) => setField("placas", event.target.value.toUpperCase())}
                      placeholder="ABC123"
                    />
                  </Field>

                  <Field label="VIN" icon={ClipboardList}>
                    <Input
                      value={form.vin}
                      onChange={(event) => setField("vin", event.target.value.toUpperCase())}
                      placeholder="VIN"
                    />
                  </Field>

                  <Field label="Modelo" icon={CarFront}>
                    <Input
                      value={form.modelo}
                      onChange={(event) => setField("modelo", event.target.value)}
                      placeholder="XC60"
                    />
                  </Field>

                  <Field label="Kilometraje" icon={Gauge}>
                    <Input
                      value={form.kilometraje}
                      onChange={(event) => setField("kilometraje", soloNumeros(event.target.value))}
                      inputMode="numeric"
                      placeholder="35000"
                    />
                  </Field>

                  <Field label="Descripción evidencia" icon={Camera}>
                    <Input
                      value={form.descripcion_evidencia}
                      onChange={(event) => setField("descripcion_evidencia", event.target.value)}
                      placeholder="Ej. unidad entregada"
                    />
                  </Field>

                  <Field label="Observaciones" icon={MessageSquareText}>
                    <Textarea
                      value={form.observaciones}
                      onChange={(event) => setField("observaciones", event.target.value)}
                      placeholder="Comentarios generales de entrega..."
                    />
                  </Field>

                  <EvidenciasPicker evidencias={evidencias} setEvidencias={setEvidencias} />
                </div>
              </section>
            </aside>

            <section className="rounded-3xl border border-white/10 bg-[#06122f]/70 p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-white/70">
                  <ClipboardList className="h-4 w-4" />
                  Checklist de entrega
                </h2>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#212721]">
                  {progress.completados}/{progress.total} completados
                </span>
              </div>

              <ChecklistCard checklist={checklist} onChange={setChecklist} />
            </section>
          </div>

          <div className="sticky bottom-2 mt-4 rounded-2xl border border-white/10 bg-[#06122f]/90 p-3 backdrop-blur-xl">
            <button
              type="submit"
              disabled={saving}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-black text-[#212721] transition hover:bg-white/90 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Guardando..." : "Guardar checklist de entrega"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}