"use client"
/**
 * page.tsx — Single-file app mit sauberen Pfad-URLs
 *
 * URL-Schema:
 *   /lernende              → Lernende-Tab
 *   /kurse/create          → Kurse-Tab + Create-Modal
 *   /lernende/5/edit       → Lernende-Tab + Edit-Modal für ID 5
 *
 * Browser Back/Forward funktioniert, weil jede Aktion router.push() nutzt.
 * Kein Next.js Routing nötig — die URL wird client-seitig mit usePathname geparsed.
 */

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BookOpen, Plus, Search, Database, Edit2, Trash2 } from "lucide-react";
import { ViewType, DataItem } from "./types";
import { apiCall, getPrimaryKey } from "./api";
import { viewConfig } from "./config";
import { display } from "./utils";
import { FormModal } from "./FormModal";

// ─── URL Parser ────────────────────────────────────────────────────────────────
// Liest den aktuellen Pfad und gibt view, editId und create zurück.
//
// /lernende           → { view: "lernende" }
// /kurse/create       → { view: "kurse", create: true }
// /lernende/5/edit    → { view: "lernende", editId: "5" }
//
function parsePath(pathname: string): {
    view: ViewType;
    editId?: string;
    create?: boolean;
} {
    const parts = pathname.replace(/^\//, "").split("/");
    // parts[0] = view, parts[1] = id oder "create", parts[2] = "edit"
    const view = (parts[0] in viewConfig ? parts[0] : "lernende") as ViewType;

    if (parts[1] === "create") {
        return { view, create: true };
    }
    if (parts[2] === "edit" && parts[1]) {
        return { view, editId: parts[1] };
    }
    return { view };
}

// ─── Inner Component ──────────────────────────────────────────────────────────
function PageInner() {
    const router = useRouter();
    const pathname = usePathname();

    // URL auslesen — wird bei jeder Navigation automatisch neu berechnet
    const { view, editId, create } = parsePath(pathname);

    // ── State ──
    const [data, setData] = useState<DataItem[]>([]);
    const [edit, setEdit] = useState<DataItem | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");

    const [countries, setCountries] = useState<any[]>([]);
    const [lehrbetriebe, setLehrbetriebe] = useState<any[]>([]);
    const [lernende, setLernende] = useState<any[]>([]);
    const [dozenten, setDozenten] = useState<any[]>([]);
    const [kurse, setKurse] = useState<any[]>([]);

    // ── Stammdaten beim Start laden ──
    useEffect(() => {
        Promise.all([
            apiCall("/countries/all"),
            apiCall("/lehrbetriebe/all"),
            apiCall("/lernende/all"),
            apiCall("/dozenten/all"),
            apiCall("/kurse/all"),
        ]).then(([c, lb, l, d, k]) => {
            setCountries(c);
            setLehrbetriebe(lb);
            setLernende(l);
            setDozenten(d);
            setKurse(k);
        });
    }, []);

    // ── Daten für aktive View laden (bei Tab-Wechsel) ──
    useEffect(() => {
        setData([]);
        apiCall(`/${view}/all`).then(setData);
    }, [view]);

    // ── Create-Modal öffnen wenn URL /create enthält ──
    useEffect(() => {
        if (create) {
            setEdit(null);
            setShowForm(true);
        }
    }, [create]);

    // ── Edit-Modal öffnen sobald Daten geladen und editId in URL ──
    useEffect(() => {
        if (!editId || data.length === 0) return;
        const pk = getPrimaryKey(view);
        const item = data.find((d: any) => String(d[pk]) === editId);
        if (item) {
            setEdit(item);
            setShowForm(true);
        }
    }, [data, editId]);

    // ── Modal schliessen wenn URL kein create/edit mehr enthält ──
    // Reagiert auf Browser-Back, Abbrechen-Button, und direkte URL-Änderungen
    useEffect(() => {
        if (!create && !editId) {
            setShowForm(false);
            setEdit(null);
        }
    }, [create, editId]);

    // ── Handler ──
    function handleViewChange(newView: ViewType) {
        setSearch("");
        router.push(`/${newView}`);
    }

    function handleEdit(row: DataItem) {
        const pk = getPrimaryKey(view);
        const id = (row as any)[pk];
        router.push(`/${view}/${id}/edit`);
    }

    function handleNewEntry() {
        router.push(`/${view}/create`);
    }

    function handleCloseForm() {
        // Modal sofort schliessen
        setShowForm(false);
        setEdit(null);
        // URL zurücksetzen — replace damit kein extra History-Eintrag entsteht
        router.replace(`/${view}`);
    }

    async function save(formData: any) {
        if (edit) {
            await apiCall(`/${view}/${(edit as any)[getPrimaryKey(view)]}`, "PUT", formData);
        } else {
            await apiCall(`/${view}`, "POST", formData);
        }
        router.replace(`/${view}`);
        apiCall(`/${view}/all`).then(setData);
    }

    async function del(id: number) {
        await apiCall(`/${view}/${id}`, "DELETE");
        apiCall(`/${view}/all`).then(setData);
    }

    // ── Anzeige ──
    const filtered = data.filter((d) =>
        JSON.stringify(d).toLowerCase().includes(search.toLowerCase())
    );
    const currentView = viewConfig[view];
    const IconComponent = currentView.icon;

    // ── Render ──
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                            <Database className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Lernendenverwaltung</h1>
                            <p className="text-sm text-gray-500">Verwaltung von Lernenden, Kursen und Lehrbetrieben</p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-3 flex-wrap">
                        {(Object.entries(viewConfig) as Array<[ViewType, typeof viewConfig[ViewType]]>).map(([id, config]) => {
                            const Icon = config.icon;
                            const isActive = view === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => handleViewChange(id as ViewType)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                                        isActive
                                            ? "text-white shadow-md scale-105"
                                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                                    }`}
                                    style={isActive ? { backgroundColor: config.color } : undefined}
                                >
                                    <Icon className="w-4 h-4" />
                                    {config.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Inhalt */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Suchleiste + Neu-Button */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex-1 min-w-[300px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
                                <input
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                    placeholder="Durchsuchen..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                            onClick={handleNewEntry}
                        >
                            <Plus className="w-5 h-5" />
                            Neu erstellen
                        </button>
                    </div>
                </div>

                {/* Tabelle */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <IconComponent className="w-6 h-6 text-gray-700" />
                            <h2 className="text-xl font-semibold text-gray-900">{currentView.label}</h2>
                            <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {filtered.length} Einträge
                            </span>
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="text-center py-16 px-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                                <BookOpen className="w-10 h-10 text-gray-400" />
                            </div>
                            <p className="text-lg font-medium text-gray-900 mb-1">Keine Daten vorhanden</p>
                            <p className="text-sm text-gray-500">Erstellen Sie einen neuen Eintrag, um zu beginnen.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {Object.keys(filtered[0]).map((k) => (
                                            <th key={k} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                {k}
                                            </th>
                                        ))}
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Aktionen
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filtered.map((row: any, index: number) => (
                                        <tr
                                            key={row[getPrimaryKey(view)] || `row-${index}`}
                                            className="hover:bg-gray-50 transition-colors duration-150"
                                        >
                                            {Object.entries(row).map(([k, v]) => (
                                                <td key={k} className="px-6 py-4 text-sm text-gray-900">
                                                    {display(k, v, { countries, lehrbetriebe, lernende, dozenten, kurse })}
                                                </td>
                                            ))}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(row)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                                                        title="Bearbeiten"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => del(row[getPrimaryKey(view)])}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                                                        title="Löschen"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showForm && (
                <FormModal
                    view={view}
                    item={edit}
                    onSave={save}
                    onCancel={handleCloseForm}
                    countries={countries}
                    lehrbetriebe={lehrbetriebe}
                    lernende={lernende}
                    dozenten={dozenten}
                    kurse={kurse}
                    setCountries={setCountries}
                    setLehrbetriebe={setLehrbetriebe}
                    setLernende={setLernende}
                    setDozenten={setDozenten}
                    setKurse={setKurse}
                />
            )}
        </div>
    );
}

// Suspense-Wrapper nötig weil usePathname ein Client-Hook ist
export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Laden...</div>}>
            <PageInner />
        </Suspense>
    );
}