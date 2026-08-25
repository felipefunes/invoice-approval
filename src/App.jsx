import React, { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Users,
  Building2,
  ChevronRight,
  X,
  ShieldAlert,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Reference date for the prototype (simulates "today")
// ---------------------------------------------------------------------------
const TODAY = new Date(2026, 7, 25); // 2026-08-25

const formatDate = (d) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
};

const formatCLP = (n) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);

// Ley 19.983: the 8-day term is calendar days ("corridos") counted from the
// date the document is received in the SII platforms — not the issue date.
const daysRemaining = (receivedAtSii) => {
  const ms = TODAY - receivedAtSii;
  const elapsedDays = Math.floor(ms / 86400000);
  return 8 - elapsedDays;
};

// The legal term is fatal and does not admit extensions: once it elapses
// without an express acknowledgement or claim, the invoice is tacitly
// accepted by operation of law. The UI must reflect that even if the record
// in the data store hasn't been closed out yet by a backend job — otherwise
// Finance could still act on a document past the point the law allows it.
function effectiveSiiStatus(inv) {
  if (inv.siiStatus === "pending" && daysRemaining(inv.receivedAtSii) < 0) {
    return "tacitly_accepted";
  }
  return inv.siiStatus;
}

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
const OWNERS = ["Gerencia de Operaciones", "Gerencia de Finanzas", "Bodega Central", "TI"];

const initialInvoices = [
  {
    id: 1,
    folio: 4521,
    rut: "76.123.456-7",
    companyName: "Proveedor A SpA",
    amount: 1250000,
    issuedAt: new Date(2026, 7, 15),
    receivedAtSii: new Date(2026, 7, 24),
    teamStatus: "pending",
    teamComment: "",
    siiStatus: "pending",
    claimReason: null,
    costCenter: "Operaciones",
    owner: "",
    items: [{ description: "Servicio de mantención", qty: 1, unitPrice: 1250000 }],
  },
  {
    id: 2,
    folio: 987,
    rut: "81.987.654-3",
    companyName: "Servicios Cloud Ltda.",
    amount: 340500,
    issuedAt: new Date(2026, 7, 19),
    receivedAtSii: new Date(2026, 7, 22),
    teamStatus: "confirmed_ok",
    teamComment: "",
    siiStatus: "pending",
    claimReason: null,
    costCenter: "TI",
    owner: "TI",
    items: [{ description: "Suscripción mensual", qty: 1, unitPrice: 340500 }],
  },
  {
    id: 3,
    folio: 12,
    rut: "99.555.222-K",
    companyName: "Mockup Supplies SpA",
    amount: 15000000,
    issuedAt: new Date(2026, 7, 10),
    receivedAtSii: new Date(2026, 7, 17),
    teamStatus: "pending",
    teamComment: "",
    siiStatus: "pending",
    claimReason: null,
    costCenter: "",
    owner: "",
    items: [{ description: "Insumos de bodega", qty: 100, unitPrice: 150000 }],
  },
  {
    id: 4,
    folio: 205,
    rut: "77.888.111-9",
    companyName: "Repuestos Andina Ltda.",
    amount: 4200000,
    issuedAt: new Date(2026, 7, 16),
    receivedAtSii: new Date(2026, 7, 18),
    teamStatus: "issue",
    teamComment: "Llegaron 8 de las 10 cajas indicadas en la guía de despacho.",
    siiStatus: "pending",
    claimReason: null,
    costCenter: "Operaciones",
    owner: "",
    items: [{ description: "Repuestos línea 3", qty: 10, unitPrice: 420000 }],
  },
  {
    id: 5,
    folio: 3390,
    rut: "70.222.333-5",
    companyName: "Consultora Fiscal Norte SpA",
    amount: 980000,
    issuedAt: new Date(2026, 7, 20),
    receivedAtSii: new Date(2026, 7, 20),
    teamStatus: "confirmed_ok",
    teamComment: "",
    siiStatus: "pending",
    claimReason: null,
    costCenter: "Finanzas",
    owner: "Gerencia de Finanzas",
    items: [{ description: "Asesoría tributaria agosto", qty: 1, unitPrice: 980000 }],
  },
  {
    id: 6,
    folio: 118,
    rut: "76.444.999-1",
    companyName: "TransLog Chile SpA",
    amount: 2100000,
    issuedAt: new Date(2026, 7, 9),
    receivedAtSii: new Date(2026, 7, 10),
    teamStatus: "confirmed_ok",
    teamComment: "",
    // Left as "pending" on purpose: the 8-day term already elapsed relative
    // to TODAY, so effectiveSiiStatus() derives "tacitly_accepted" on its
    // own — this is the case that exercises the auto-lock behavior.
    siiStatus: "pending",
    claimReason: null,
    costCenter: "Operaciones",
    owner: "Gerencia de Operaciones",
    items: [{ description: "Flete nacional", qty: 1, unitPrice: 2100000 }],
  },
  {
    id: 7,
    folio: 76,
    rut: "81.000.222-4",
    companyName: "Insumos Maule Ltda.",
    amount: 560000,
    issuedAt: new Date(2026, 7, 5),
    receivedAtSii: new Date(2026, 7, 6),
    teamStatus: "issue",
    teamComment: "Faltaron 3 unidades del ítem principal.",
    siiStatus: "claimed",
    claimReason: "Falta parcial de entrega de mercaderías o servicios",
    costCenter: "Operaciones",
    owner: "Bodega Central",
    items: [{ description: "Cajas de embalaje", qty: 20, unitPrice: 28000 }],
  },
  {
    id: 8,
    folio: 4530,
    rut: "76.123.456-7",
    companyName: "Proveedor A SpA",
    amount: 180000,
    issuedAt: new Date(2026, 7, 23),
    receivedAtSii: new Date(2026, 7, 25),
    teamStatus: "pending",
    teamComment: "",
    siiStatus: "pending",
    claimReason: null,
    costCenter: "",
    owner: "",
    items: [{ description: "Artículos de oficina", qty: 1, unitPrice: 180000 }],
  },
];

const CLAIM_REASONS = [
  "Contenido de la factura (error en datos, montos o ítems)",
  "Falta total de entrega de mercaderías o servicios",
  "Falta parcial de entrega de mercaderías o servicios",
];

// ---------------------------------------------------------------------------
// Urgency
// ---------------------------------------------------------------------------
function urgency(inv) {
  const status = effectiveSiiStatus(inv);
  if (status === "tacitly_accepted")
    return { key: "tacit", label: "Aceptada tácitamente", color: "slate", Icon: Info };
  if (status === "claimed")
    return { key: "claimed", label: "Reclamada ante SII", color: "slate", Icon: XCircle };
  if (status === "expressly_accepted")
    return { key: "accepted", label: "Acuse confirmado", color: "emerald", Icon: CheckCircle2 };

  const r = daysRemaining(inv.receivedAtSii);
  if (r <= 0) return { key: "today", label: "Vence hoy", color: "red", Icon: AlertTriangle, r };
  if (r === 1) return { key: "tomorrow", label: "Vence mañana", color: "red", Icon: AlertTriangle, r };
  if (r <= 2) return { key: "urgent", label: `Quedan ${r} días`, color: "red", Icon: AlertTriangle, r };
  if (r <= 4) return { key: "warning", label: `Quedan ${r} días`, color: "amber", Icon: Clock, r };
  return { key: "ok", label: `Quedan ${r} días`, color: "emerald", Icon: Clock, r };
}

function queueSortKey(inv) {
  if (effectiveSiiStatus(inv) !== "pending") return 999;
  return daysRemaining(inv.receivedAtSii);
}

const colorClasses = {
  red: "bg-red-50 text-red-700 border-red-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  slate: "bg-slate-100 text-slate-500 border-slate-200",
};

function UrgencyBadge({ inv }) {
  const u = urgency(inv);
  const Icon = u.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${colorClasses[u.color]}`}
    >
      <Icon size={13} />
      {u.label}
    </span>
  );
}

function TeamStatusTag({ status }) {
  if (status === "confirmed_ok")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
        <CheckCircle2 size={13} /> Recibido conforme
      </span>
    );
  if (status === "issue")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-700">
        <AlertTriangle size={13} /> Reportó un problema
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
      <Clock size={13} /> Equipo aún no responde
    </span>
  );
}

// Closes a panel on Escape without stealing the key from inputs/selects.
function useEscapeKey(onEscape) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onEscape]);
}

// ---------------------------------------------------------------------------
// Root app
// ---------------------------------------------------------------------------
export default function App() {
  const [role, setRole] = useState("finance"); // 'team' | 'finance'
  const [invoices, setInvoices] = useState(initialInvoices);
  const [selectedId, setSelectedId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // {type, invoiceId, reason}
  const [reasonDraft, setReasonDraft] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [toast, setToast] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  };

  const selected = invoices.find((i) => i.id === selectedId) || null;

  const updateInvoice = (id, patch) =>
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  // ---- team actions (never touch the SII) ----
  const submitTeamResponse = (id, teamStatus, comment) => {
    updateInvoice(id, { teamStatus, teamComment: comment || "" });
    showToast("Respuesta enviada a Finanzas.");
    setSelectedId(null);
    setCommentDraft("");
  };

  // ---- finance legal actions (irreversible) ----
  const confirmPendingAction = () => {
    if (!pendingAction) return;
    if (pendingAction.type === "confirm") {
      updateInvoice(pendingAction.invoiceId, { siiStatus: "expressly_accepted" });
      showToast("Acuse de recibo confirmado y enviado al SII.");
    } else {
      updateInvoice(pendingAction.invoiceId, {
        siiStatus: "claimed",
        claimReason: pendingAction.reason,
      });
      showToast("Reclamo enviado al SII.");
    }
    setPendingAction(null);
    setReasonDraft("");
  };

  const teamPending = invoices.filter(
    (i) => i.teamStatus === "pending" && effectiveSiiStatus(i) === "pending"
  );

  const financeFiltered = invoices
    .filter(
      (i) =>
        supplierFilter.trim() === "" ||
        i.rut.includes(supplierFilter) ||
        i.companyName.toLowerCase().includes(supplierFilter.toLowerCase())
    )
    .slice()
    .sort((a, b) => queueSortKey(a) - queueSortKey(b));

  const urgentCount = invoices.filter((i) => {
    if (effectiveSiiStatus(i) !== "pending") return false;
    const r = daysRemaining(i.receivedAtSii);
    return r <= 2;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-700 text-white">
              <ShieldAlert size={17} />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Recepción de Facturas</p>
              <p className="text-xs leading-tight text-slate-400">Prototipo de prueba</p>
            </div>
          </div>

          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-sm">
            <button
              onClick={() => {
                setRole("team");
                setSelectedId(null);
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition ${
                role === "team" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"
              }`}
            >
              <Users size={14} /> Equipo
            </button>
            <button
              onClick={() => {
                setRole("finance");
                setSelectedId(null);
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition ${
                role === "finance" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"
              }`}
            >
              <Building2 size={14} /> Finanzas
            </button>
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-1.5 text-center text-xs text-slate-400">
          Vista de prueba — cambia de rol arriba a la derecha para simular a cada persona usuaria.
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {role === "team" ? (
          <TeamView
            pending={teamPending}
            selected={selected}
            setSelectedId={setSelectedId}
            submitTeamResponse={submitTeamResponse}
            commentDraft={commentDraft}
            setCommentDraft={setCommentDraft}
          />
        ) : (
          <FinanceView
            invoices={financeFiltered}
            urgentCount={urgentCount}
            supplierFilter={supplierFilter}
            setSupplierFilter={setSupplierFilter}
            selected={selected}
            setSelectedId={setSelectedId}
            updateInvoice={updateInvoice}
            setPendingAction={setPendingAction}
            reasonDraft={reasonDraft}
            setReasonDraft={setReasonDraft}
          />
        )}
      </main>

      {/* Confirmation modal for irreversible legal actions */}
      {pendingAction && (
        <ConfirmModal
          pendingAction={pendingAction}
          onCancel={() => setPendingAction(null)}
          onConfirm={confirmPendingAction}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Team view — simple, no legal jargon, no action reaches the SII
// ---------------------------------------------------------------------------
function TeamView({ pending, selected, setSelectedId, submitTeamResponse, commentDraft, setCommentDraft }) {
  if (selected) {
    return (
      <div className="mx-auto max-w-md">
        <button
          onClick={() => setSelectedId(null)}
          className="-ml-2 mb-4 rounded-lg px-2 py-2 text-sm text-slate-500 hover:text-slate-700"
        >
          ← Volver a la lista
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-400">Folio {selected.folio}</p>
          <h2 className="text-lg font-semibold">{selected.companyName}</h2>
          <p className="mt-1 text-2xl font-mono font-semibold">{formatCLP(selected.amount)}</p>

          <p className="mt-5 text-sm font-medium text-slate-700">
            ¿Llegó esta mercadería o servicio conforme a lo indicado en la factura?
          </p>

          <div className="mt-3 space-y-2">
            <button
              onClick={() => submitTeamResponse(selected.id, "confirmed_ok", "")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-700"
            >
              <CheckCircle2 size={18} /> Sí, todo llegó conforme
            </button>
            <details className="rounded-xl border border-slate-200">
              <summary className="cursor-pointer list-none rounded-xl px-4 py-3 font-medium text-amber-700 hover:bg-amber-50">
                <span className="inline-flex items-center gap-2">
                  <AlertTriangle size={18} /> No, hay un problema
                </span>
              </summary>
              <div className="space-y-2 px-4 pb-4">
                <textarea
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="Cuéntanos qué faltó o qué llegó mal…"
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                />
                <button
                  onClick={() => submitTeamResponse(selected.id, "issue", commentDraft)}
                  disabled={!commentDraft.trim()}
                  className="w-full rounded-lg bg-amber-600 py-2 font-medium text-white disabled:opacity-40"
                >
                  Enviar a Finanzas
                </button>
              </div>
            </details>
          </div>

          <p className="mt-5 text-xs text-slate-400">
            Esta respuesta no aprueba ni rechaza la factura ante el SII — solo informa a Finanzas
            si la mercadería o el servicio llegó bien.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-lg font-semibold">Facturas por confirmar</h1>
      <p className="mb-4 text-sm text-slate-500">
        {pending.length === 0
          ? "No tienes facturas pendientes. 🎉"
          : `Tienes ${pending.length} por responder.`}
      </p>
      <div className="space-y-3">
        {pending.map((inv) => {
          const r = daysRemaining(inv.receivedAtSii);
          return (
            <button
              key={inv.id}
              onClick={() => setSelectedId(inv.id)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-indigo-300"
            >
              <div>
                <p className="font-medium">{inv.companyName}</p>
                <p className="text-sm text-slate-400">
                  Folio {inv.folio} · {formatCLP(inv.amount)}
                </p>
                {r <= 2 && (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-600">
                    <AlertTriangle size={12} /> Responde hoy si puedes
                  </p>
                )}
              </div>
              <ChevronRight className="text-slate-300" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Finance view — prioritized queue + detail panel with the legal action
// ---------------------------------------------------------------------------
function FinanceView({
  invoices,
  urgentCount,
  supplierFilter,
  setSupplierFilter,
  selected,
  setSelectedId,
  updateInvoice,
  setPendingAction,
  reasonDraft,
  setReasonDraft,
}) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold">Facturas recibidas</h1>
            <p className="text-sm text-slate-500">
              Ordenadas por urgencia: días corridos restantes antes del vencimiento legal.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 sm:block sm:text-center">
            <p className="text-xl font-semibold text-red-700">{urgentCount}</p>
            <p className="text-xs text-red-600">vencen en ≤ 2 días</p>
          </div>
        </div>

        <input
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
          placeholder="Filtrar por RUT o proveedor…"
          aria-label="Filtrar por RUT o proveedor"
          className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm sm:max-w-xs sm:py-2"
        />

        {/* Mobile: card list — a 6-column table forces horizontal scrolling
            on a phone, which is unusable when someone needs to act fast on
            an invoice about to expire. Desktop keeps the denser table. */}
        <div className="space-y-3 sm:hidden">
          {invoices.map((inv) => (
            <button
              key={inv.id}
              onClick={() => setSelectedId(inv.id)}
              className="flex w-full items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left active:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <UrgencyBadge inv={inv} />
                <p className="mt-2 truncate font-medium">{inv.companyName}</p>
                <p className="truncate font-mono text-xs text-slate-400">
                  {inv.rut} · Folio {inv.folio}
                </p>
                <p className="mt-1 font-mono text-sm">{formatCLP(inv.amount)}</p>
                <div className="mt-1.5">
                  <TeamStatusTag status={inv.teamStatus} />
                </div>
              </div>
              <ChevronRight size={18} className="mt-1 shrink-0 text-slate-300" />
            </button>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th scope="col" className="px-4 py-3">Urgencia</th>
                <th scope="col" className="px-4 py-3">Proveedor</th>
                <th scope="col" className="px-4 py-3">Folio</th>
                <th scope="col" className="px-4 py-3 text-right">Monto</th>
                <th scope="col" className="px-4 py-3">Equipo</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Ver detalle</span></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => setSelectedId(inv.id)}
                  className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <UrgencyBadge inv={inv} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{inv.companyName}</p>
                    <p className="font-mono text-xs text-slate-400">{inv.rut}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500">{inv.folio}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatCLP(inv.amount)}</td>
                  <td className="px-4 py-3">
                    <TeamStatusTag status={inv.teamStatus} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight size={16} className="text-slate-300" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-400">
          <Info size={14} className="mt-0.5 shrink-0" />
          Plazo fatal de 8 días corridos desde la recepción del documento en el SII (Ley 19.983).
          Vencido el plazo sin acción, la factura se acepta tácitamente y no puede revertirse.
        </p>
      </div>

      {selected && (
        <DetailDrawer
          inv={selected}
          onClose={() => setSelectedId(null)}
          updateInvoice={updateInvoice}
          setPendingAction={setPendingAction}
          reasonDraft={reasonDraft}
          setReasonDraft={setReasonDraft}
        />
      )}
    </div>
  );
}

function DetailDrawer({ inv, onClose, updateInvoice, setPendingAction, reasonDraft, setReasonDraft }) {
  useEscapeKey(onClose);

  const u = urgency(inv);
  const status = effectiveSiiStatus(inv);
  const resolved = status !== "pending";
  const dueDate = new Date(inv.receivedAtSii);
  dueDate.setDate(dueDate.getDate() + 8);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle factura folio ${inv.folio}`}
      className="fixed inset-0 z-30 flex justify-end bg-black/20 sm:static sm:z-auto sm:block sm:w-[380px] sm:bg-transparent"
    >
      <div className="h-full w-full overflow-y-auto bg-white p-5 shadow-xl sm:h-auto sm:rounded-xl sm:border sm:border-slate-200 sm:shadow-none">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400">Folio {inv.folio}</p>
            <h2 className="font-semibold">{inv.companyName}</h2>
            <p className="font-mono text-xs text-slate-400">{inv.rut}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar panel de detalle"
            className="-m-2 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className={`mb-4 rounded-lg border px-3 py-2 text-sm ${colorClasses[u.color]}`}>
          <p className="font-medium">{u.label}</p>
          <p className="text-xs opacity-80">
            Recepción SII: {formatDate(inv.receivedAtSii)} · Vence: {formatDate(dueDate)}
          </p>
        </div>

        <div className="mb-4 rounded-lg bg-slate-50 p-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            Respuesta del equipo
          </p>
          <TeamStatusTag status={inv.teamStatus} />
          {inv.teamComment && (
            <p className="mt-1 text-sm text-slate-600">"{inv.teamComment}"</p>
          )}
        </div>

        <div className="mb-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Ítems</p>
          <table className="w-full text-xs">
            <tbody>
              {inv.items.map((it, idx) => (
                <tr key={idx} className="border-b border-slate-50 last:border-0">
                  <td className="py-1.5">{it.description}</td>
                  <td className="py-1.5 text-right font-mono text-slate-400">×{it.qty}</td>
                  <td className="py-1.5 text-right font-mono">{formatCLP(it.unitPrice * it.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-5">
          <label htmlFor="owner-select" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
            Clasificación interna (no afecta el plazo SII)
          </label>
          <select
            id="owner-select"
            value={inv.owner}
            onChange={(e) => updateInvoice(inv.id, { owner: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Asignar responsable…</option>
            {OWNERS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {resolved ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            {status === "tacitly_accepted" &&
              "El plazo venció sin acción: la factura quedó aceptada tácitamente y no puede revertirse."}
            {status === "expressly_accepted" && "Acuse de recibo confirmado ante el SII."}
            {status === "claimed" && <>Reclamada ante el SII por: {inv.claimReason}.</>}
          </div>
        ) : (
          <div className="border-t border-slate-100 pt-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-red-500">
              <ShieldAlert size={13} /> Acción legal ante el SII — es irreversible
            </p>
            <button
              onClick={() => setPendingAction({ type: "confirm", invoiceId: inv.id })}
              className="mb-2 w-full rounded-lg bg-indigo-700 py-2.5 text-sm font-medium text-white hover:bg-indigo-800"
            >
              Confirmar recepción (Acuse de Recibo)
            </button>

            <label htmlFor="claim-reason-select" className="sr-only">
              Motivo del reclamo
            </label>
            <select
              id="claim-reason-select"
              value={reasonDraft}
              onChange={(e) => setReasonDraft(e.target.value)}
              className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Motivo del reclamo…</option>
              {CLAIM_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                setPendingAction({ type: "claim", invoiceId: inv.id, reason: reasonDraft })
              }
              disabled={!reasonDraft}
              className="w-full rounded-lg border border-red-300 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
            >
              Enviar reclamo al SII
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfirmModal({ pendingAction, onCancel, onConfirm }) {
  useEscapeKey(onCancel);
  const isClaim = pendingAction.type === "claim";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="w-full max-w-sm rounded-2xl bg-white p-5"
      >
        <div className="mb-3 flex items-center gap-2 text-red-600">
          <ShieldAlert size={20} />
          <p id="confirm-modal-title" className="font-semibold">Confirma esta acción</p>
        </div>
        {isClaim ? (
          <p className="text-sm text-slate-600">
            Se registrará un reclamo formal ante el SII por:{" "}
            <span className="font-medium">{pendingAction.reason}</span>. Esto no anula el
            documento tributario — el proveedor deberá emitir una Nota de Crédito para
            corregirlo. ¿Confirmas el envío?
          </p>
        ) : (
          <p className="text-sm text-slate-600">
            Esta acción registra el Acuse de Recibo ante el SII. Es irreversible y otorga mérito
            ejecutivo a la factura (Ley 19.983): el proveedor podrá cobrarla o cederla a un
            factoring. ¿Confirmas?
          </p>
        )}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            autoFocus
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:py-2"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-lg py-3 text-sm font-medium text-white sm:py-2 ${
              isClaim ? "bg-red-600 hover:bg-red-700" : "bg-indigo-700 hover:bg-indigo-800"
            }`}
          >
            Sí, confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
