"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, Flag, Phone, Plus, CheckCircle2, LayoutGrid, List, Search, MoreHorizontal, ArrowRight, ArrowLeft } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type KanbanStatus = "a_faire" | "en_cours" | "en_validation" | "termine" | (string & {});

export interface KanbanTask {
    id:          number | string;
    name:        string;
    subtasks?:   number;
    assignees?:  { initials: string; first_name?: string; color?: string; src?: string }[];
    hasCal?:     boolean;
    due_date?:    string;   // ⬅ nouveau : ex "12/07/2026"
    hasFlag?:    boolean;
    status?:     KanbanStatus;
    priority?:   string;
    progress?:   number;
    onClick?:    () => void;
}

export interface KanbanColumn {
    status:    KanbanStatus;
    tasks:     KanbanTask[];
    label?:    string;
    color?:    string;
    onAdd?:    () => void;
    /** ID réel du statut back (nécessaire pour le déplacement) */
    statusId?: number;
}

// ── Config colonnes fixes ─────────────────────────────────────────────────────

interface ColCfg {
    label:     string;
    labelBg:   string;
    labelText: string;
    colBg:     string;
    countBg:   string;
    icon?:     React.ReactNode;
}

const FIXED_COL_CONFIG: Record<string, ColCfg> = {
    a_faire: {
        label: "À FAIRE", labelBg: "bg-slate-200", labelText: "text-slate-600",
        colBg: "bg-slate-50", countBg: "bg-slate-200 text-slate-600",
    },
    en_cours: {
        label: "EN COURS", labelBg: "bg-amber-100", labelText: "text-amber-700",
        colBg: "bg-amber-50/60", countBg: "bg-amber-100 text-amber-700",
    },
    en_validation: {
        label: "EN COURS DE VALIDATION", labelBg: "bg-blue-100", labelText: "text-blue-600",
        colBg: "bg-blue-50", countBg: "bg-blue-100 text-blue-700",
    },
    termine: {
        label: "TERMINÉ", labelBg: "bg-teal-500", labelText: "text-white",
        colBg: "bg-teal-50/40", countBg: "bg-teal-100 text-teal-700",
        icon: <CheckCircle2 size={12} className="text-white" />,
    },
};

function buildCustomCfg(label: string, hexColor?: string): ColCfg & { _hex: string } {
    return {
        label:     label.toUpperCase(),
        labelBg:   "",
        labelText: "text-white",
        colBg:     "",
        countBg:   "",
        _hex:      hexColor ?? "#6366f1",
    };
}

function resolveColCfg(column: KanbanColumn): ColCfg & { _hex?: string } {
    if (FIXED_COL_CONFIG[column.status]) return FIXED_COL_CONFIG[column.status];
    return buildCustomCfg(column.label ?? column.status, column.color);
}

// ── Priority / Status configs (liste) ─────────────────────────────────────────

const PRIORITY_CFG: Record<string, { label: string; color: string }> = {
    urgent: { label: "Urgent", color: "text-red-500"   },
    high:   { label: "Élevé",  color: "text-amber-500" },
    medium: { label: "Moyen",  color: "text-slate-500" },
    low:    { label: "Faible", color: "text-slate-400" },
};

const STATUS_CFG: Record<string, { label: string; bg: string; text: string }> = {
    a_faire:       { label: "À FAIRE",    bg: "bg-slate-100", text: "text-slate-500" },
    en_cours:      { label: "EN COURS",   bg: "bg-blue-100",  text: "text-blue-600"  },
    en_validation: { label: "VALIDATION", bg: "bg-teal-100",  text: "text-teal-600"  },
    termine:       { label: "TERMINÉ",    bg: "bg-green-100", text: "text-green-600" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Retourne le label affiché d'une colonne (label custom ou label fixe) */
function colDisplayLabel(col: KanbanColumn): string {
    if (col.label) return col.label;
    return FIXED_COL_CONFIG[col.status]?.label ?? col.status.toUpperCase();
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ av, idx }: { av: NonNullable<KanbanTask["assignees"]>[0]; idx: number }) {
    const COLORS = ["bg-orange-400", "bg-purple-400", "bg-blue-400", "bg-pink-400", "bg-teal-400"];
    const bg = av.color ?? COLORS[idx % COLORS.length];
    return (
        <div
            title={av.first_name ?? av.initials}
            style={{ marginLeft: idx === 0 ? 0 : -8, zIndex: 10 - idx }}
            className={`w-7 h-7 rounded-full border-2 border-white overflow-hidden flex items-center justify-center text-[10px] font-black text-white ${bg}`}
        >
            {av.src
                ? <img src={av.src} alt={av.initials} className="w-full h-full object-cover" />
                : av.initials}
        </div>
    );
}

// ── TaskContextMenu ───────────────────────────────────────────────────────────

interface TaskMenuProps {
    task:       KanbanTask;
    colIndex:   number;
    allColumns: KanbanColumn[];
    isAdmin:    boolean;
    /**
     * ✅ Signature enrichie : passe aussi taskName et targetLabel
     * pour que la page puisse ouvrir une modale avec le bon contexte
     */
    onMove: (
        taskId:         number | string,
        targetStatusId: number,
        direction:      "next" | "prev",
        taskName:       string,
        targetLabel:    string
    ) => void;
}

function TaskContextMenu({ task, colIndex, allColumns, isAdmin, onMove }: TaskMenuProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const prevCol = colIndex > 0 ? allColumns[colIndex - 1] : null;
    const nextCol = colIndex < allColumns.length - 1 ? allColumns[colIndex + 1] : null;

    const hasNext = !!nextCol?.statusId;
    const hasPrev = isAdmin && !!prevCol?.statusId;

    // ✅ Toujours afficher le bouton si onMove est fourni et qu'il y a une colonne adjacente,
    //    même sans statusId (cas user sans statuts chargés) → on affiche quand même le menu
    //    mais on masque si vraiment aucune action n'est possible
    if (!hasNext && !hasPrev) return null;

    return (
        <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
            <button
                onClick={() => setOpen(v => !v)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Actions"
            >
                <MoreHorizontal size={15} />
            </button>

            {open && (
                <div className="absolute right-0 top-7 z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 min-w-[190px] animate-in fade-in duration-100">

                    {/* ── Avancer ── */}
                    {hasNext && (
                        <button
                            onClick={() => {
                                onMove(
                                    task.id,
                                    nextCol!.statusId!,
                                    "next",
                                    task.name,
                                    colDisplayLabel(nextCol!)
                                );
                                setOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                            <ArrowRight size={14} className="text-orange-400 shrink-0" />
                            <span className="truncate">
                                Passer à{" "}
                                <span className="font-black">{colDisplayLabel(nextCol!)}</span>
                            </span>
                        </button>
                    )}

                    {/* ── Reculer (admin seulement) ── */}
                    {hasPrev && (
                        <>
                            {hasNext && <div className="mx-3 my-1 border-t border-slate-100" />}
                            <button
                                onClick={() => {
                                    onMove(
                                        task.id,
                                        prevCol!.statusId!,
                                        "prev",
                                        task.name,
                                        colDisplayLabel(prevCol!)
                                    );
                                    setOpen(false);
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                <ArrowLeft size={14} className="text-slate-400 shrink-0" />
                                <span className="truncate">
                                    Revenir à{" "}
                                    <span className="font-black">{colDisplayLabel(prevCol!)}</span>
                                </span>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// ── TaskCard ──────────────────────────────────────────────────────────────────

interface TaskCardProps {
    task:       KanbanTask;
    colIndex:   number;
    allColumns: KanbanColumn[];
    isAdmin:    boolean;
    onMove:     TaskMenuProps["onMove"];
}

function TaskCard({ task, colIndex, allColumns, isAdmin, onMove }: TaskCardProps) {
    return (
        <div
            onClick={task.onClick}
            className={`bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3
                ${task.onClick ? "cursor-pointer hover:shadow-md hover:border-slate-200 transition-all" : ""}`}
        >
            {/* Titre + 3pts */}
            <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-slate-800 text-[13px] leading-tight flex-1">{task.name}</p>
                <TaskContextMenu
                    task={task}
                    colIndex={colIndex}
                    allColumns={allColumns}
                    isAdmin={isAdmin}
                    onMove={onMove}
                />
            </div>

            <div className="flex items-center gap-2">
                {task.assignees && task.assignees.length > 0 && (
                    <div className="flex items-center">
                        {task.assignees.map((av, i) => <Avatar key={i} av={av} idx={i} />)}
                    </div>
                )}
                {task.hasCal  && <Calendar size={14} className="text-slate-400" strokeWidth={1.8} />}
                {task.hasFlag && <Flag     size={14} className="text-slate-400" strokeWidth={1.8} />}
            </div>

            {task.subtasks != null && task.subtasks > 0 && (
                <div className="flex items-center gap-1.5 text-slate-400">
                    <Phone size={12} strokeWidth={2} className="rotate-[135deg]" />
                    <span className="text-[11px] font-semibold">{task.subtasks} sous-tâche{task.subtasks > 1 ? "s" : ""}</span>
                </div>
            )}
        </div>
    );
}

// ── KanbanCol ─────────────────────────────────────────────────────────────────

interface KanbanColProps {
    column:     KanbanColumn;
    colIndex:   number;
    allColumns: KanbanColumn[];
    isAdmin:    boolean;
    onMove:     TaskMenuProps["onMove"];
}

function KanbanCol({ column, colIndex, allColumns, isAdmin, onMove }: KanbanColProps) {
    const cfg      = resolveColCfg(column);
    const hex      = (cfg as any)._hex as string | undefined;
    const count    = column.tasks.length;
    const isCustom = !!hex;

    return (
        <div
            className={`flex flex-col gap-3 min-h-[200px] min-w-[220px] flex-1 rounded-2xl p-3 border shadow-sm
                ${!isCustom
                    ? `${FIXED_COL_CONFIG[column.status]?.colBg ?? "bg-slate-50"} ${
                          column.status === "a_faire"       ? "border-slate-200"
                        : column.status === "en_cours"      ? "border-amber-200"
                        : column.status === "en_validation" ? "border-blue-200"
                        : "border-teal-200"}`
                    : ""}`}
            style={isCustom ? { background: `${hex}12`, border: `1px solid ${hex}40` } : undefined}
        >
            {/* Header */}
            <div className="flex items-center gap-2">
                {isCustom ? (
                    <>
                        <div
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wide text-white"
                            style={{ background: hex }}
                        >
                            {cfg.icon}{cfg.label}
                        </div>
                        <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                            style={{ background: hex }}
                        >
                            {count}
                        </span>
                    </>
                ) : (
                    <>
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wide ${cfg.labelBg} ${cfg.labelText}`}>
                            {cfg.icon}{cfg.label}
                        </div>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${cfg.countBg}`}>
                            {count}
                        </span>
                    </>
                )}

                {/* Bouton "+" en bout de header si onAdd défini */}
                {column.onAdd && (
                    <button
                        onClick={column.onAdd}
                        className="ml-auto w-6 h-6 rounded-lg bg-[#f97316]/10 text-[#f97316] flex items-center justify-center hover:bg-[#f97316]/20 transition"
                    >
                        <Plus size={13} strokeWidth={2.5} />
                    </button>
                )}
            </div>

            {/* Tâches */}
            {column.tasks.map((task) => (
                <TaskCard
                    key={task.id}
                    task={task}
                    colIndex={colIndex}
                    allColumns={allColumns}
                    isAdmin={isAdmin}
                    onMove={onMove}
                />
            ))}
        </div>
    );
}

// ── ListView ──────────────────────────────────────────────────────────────────

function ListView({
    columns,
    allColumns,
    isAdmin,
    onMove,
}: {
    columns:    KanbanColumn[];
    allColumns: KanbanColumn[];
    isAdmin:    boolean;
    onMove:     TaskMenuProps["onMove"];
}) {
    const allTasks = columns.flatMap((c, ci) =>
        c.tasks.map(t => ({
            ...t,
            _colStatus: c.status,
            _colLabel:  c.label,
            _colColor:  c.color,
            _colIndex:  ci,
        }))
    );

    return (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="bg-orange-50/60">
                        <th className="pl-5 pr-3 py-3 text-left w-8">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                        </th>
                        {["Nom de la tâche","Assigné","Sous-tâches","Priorité","Statut",""].map((h, i) => (
                            <th key={i} className="px-3 py-3 text-left text-[11px] font-black text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {allTasks.map(task => {
                        const fixedSt = STATUS_CFG[task._colStatus];
                        const pr = PRIORITY_CFG[task.priority ?? "medium"] ?? PRIORITY_CFG.medium;
                        return (
                            <tr
                                key={task.id}
                                onClick={task.onClick}
                                className={`hover:bg-slate-50/50 transition-colors ${task.onClick ? "cursor-pointer" : ""}`}
                            >
                                <td className="pl-5 pr-3 py-3.5">
                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300" onClick={e => e.stopPropagation()} />
                                </td>
                                <td className="px-3 py-3.5 text-[13px] font-bold text-slate-800 whitespace-nowrap">{task.name}</td>
                                <td className="px-3 py-3.5">
                                    {task.assignees && task.assignees.length > 0 ? (
                                        <div className="flex items-center">
                                            {task.assignees.slice(0, 3).map((av, i) => <Avatar key={i} av={av} idx={i} />)}
                                        </div>
                                    ) : <span className="text-slate-300 text-[12px]">—</span>}
                                </td>
                                <td className="px-3 py-3.5 text-[12px] text-slate-500">
                                    {task.subtasks != null && task.subtasks > 0
                                        ? `${task.subtasks} sous-tâche${task.subtasks > 1 ? "s" : ""}`
                                        : "—"}
                                </td>
                                <td className={`px-3 py-3.5 text-[12px] font-black ${pr.color}`}>{pr.label}</td>
                                <td className="px-3 py-3.5">
                                    {fixedSt ? (
                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${fixedSt.bg} ${fixedSt.text}`}>
                                            {fixedSt.label}
                                        </span>
                                    ) : (
                                        <span
                                            className="px-2.5 py-1 rounded-full text-[11px] font-black text-white"
                                            style={{ background: task._colColor ?? "#6366f1" }}
                                        >
                                            {(task._colLabel ?? task._colStatus).toUpperCase()}
                                        </span>
                                    )}
                                </td>
                                <td className="px-3 py-3.5" onClick={e => e.stopPropagation()}>
                                    <TaskContextMenu
                                        task={task}
                                        colIndex={task._colIndex}
                                        allColumns={allColumns}
                                        isAdmin={isAdmin}
                                        onMove={onMove}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                    {allTasks.length === 0 && (
                        <tr>
                            <td colSpan={7} className="py-10 text-center text-slate-400 text-sm italic">
                                Aucune tâche
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

// ── TasksCard (export) ────────────────────────────────────────────────────────

interface TasksCardProps {
    columns:         KanbanColumn[];
    onSearch?:       (q: string) => void;
    onAddTask?:      () => void;
    addTaskLabel?:   string;
    onAddStatus?:    () => void;
    addStatusLabel?: string;
    /** true = admin (avancer + reculer), false = user (avancer seulement) */
    isAdmin?:        boolean;
    /**
     * ✅ Signature alignée avec TaskContextMenu :
     * reçoit taskName et targetLabel pour ouvrir la modale avec le bon contexte
     */
    onMoveTask?: (
        taskId:         number | string,
        targetStatusId: number,
        direction:      "next" | "prev",
        taskName:       string,
        targetLabel:    string
    ) => void;
}

export default function TasksCard({
    columns,
    onSearch,
    onAddTask,
    addTaskLabel   = "Ajouter une tâche",
    onAddStatus,
    addStatusLabel = "Ajouter un statut",
    isAdmin        = false,
    onMoveTask,
}: TasksCardProps) {
    const [view,   setView]   = useState<"kanban" | "list">("kanban");
    const [search, setSearch] = useState("");

    const handleSearch = (q: string) => {
        setSearch(q);
        onSearch?.(q);
    };

    const filteredColumns = search.trim()
        ? columns.map(c => ({
            ...c,
            tasks: c.tasks.filter(t =>
                t.name.toLowerCase().includes(search.toLowerCase())
            ),
        }))
        : columns;

    /**
     * ✅ handleMove — proxy interne qui transmet les 5 paramètres à onMoveTask
     * TaskContextMenu → handleMove → onMoveTask (page) → MoveTaskModal
     */
    const handleMove = (
        taskId:         number | string,
        targetStatusId: number,
        direction:      "next" | "prev",
        taskName:       string,
        targetLabel:    string
    ) => {
        onMoveTask?.(taskId, targetStatusId, direction, taskName, targetLabel);
    };

    return (
        <div className="space-y-4">
            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Toggle vue */}
                <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-0.5">
                    <button
                        onClick={() => setView("kanban")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all
                            ${view === "kanban"
                                ? "bg-white shadow text-[#f97316] border-b-2 border-[#f97316]"
                                : "text-slate-400 hover:text-slate-700"}`}
                    >
                        <LayoutGrid size={14} /> Tableau
                    </button>
                    <button
                        onClick={() => setView("list")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all
                            ${view === "list"
                                ? "bg-white shadow text-[#f97316] border-b-2 border-[#f97316]"
                                : "text-slate-400 hover:text-slate-700"}`}
                    >
                        <List size={14} /> Liste
                    </button>
                </div>

                {/* Search */}
                <div className="flex-1 relative min-w-[180px] max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => handleSearch(e.target.value)}
                        placeholder="Rechercher une tâche"
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] placeholder:text-slate-400 focus:outline-none focus:border-[#f97316] transition"
                    />
                </div>

                {/* Boutons action */}
                <div className="flex items-center gap-2 ml-auto">
                    {onAddStatus && (
                        <button
                            onClick={onAddStatus}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-[13px] hover:bg-slate-50 transition"
                        >
                            <Plus size={15} strokeWidth={2.5} />
                            {addStatusLabel}
                        </button>
                    )}
                    {onAddTask && (
                        <button
                            onClick={onAddTask}
                            className="flex items-center gap-2 px-4 py-2 bg-[#f97316] text-white rounded-xl font-bold text-[13px] hover:opacity-90 transition shadow-md shadow-orange-200"
                        >
                            <Plus size={15} strokeWidth={2.5} />
                            {addTaskLabel}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Vue ── */}
            {view === "kanban" ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {filteredColumns.map((col, i) => (
                        <KanbanCol
                            key={col.status + i}
                            column={col}
                            colIndex={i}
                            allColumns={filteredColumns}
                            isAdmin={isAdmin}
                            onMove={handleMove}
                        />
                    ))}
                </div>
            ) : (
                <ListView
                    columns={filteredColumns}
                    allColumns={filteredColumns}
                    isAdmin={isAdmin}
                    onMove={handleMove}
                />
            )}
        </div>
    );
}