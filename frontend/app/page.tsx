/**
 * page.tsx
 *
 * Main page component: renders navigation tabs, search bar, data table and modal form.
 *
 * Responsibilities:
 * - Initialize and maintain state for the current view and its displayed data.
 * - Load master data (countries, lehrbetriebe, lernende, dozenten, kurse) on component
 *   mount so that select controls in FormModal and SelectWithActions are available.
 * - Load and display the current view's records whenever the `view` state changes.
 * - Provide CRUD operations:
 *   * CREATE: open FormModal with no `item` and POST via apiCall.
 *   * READ: fetch from API and display in table (search filter applied client-side).
 *   * UPDATE: open FormModal with existing `item` and PUT via apiCall.
 *   * DELETE: call apiCall with DELETE method and refresh the view.
 * - After any mutation, refresh the current view's data to reflect server state.
 *
 * Architecture notes:
 * - State is local-only (no Redux, context, or external store).
 * - Search filtering happens on the client (JavaScript array filter).
 * - No data caching; mutations trigger immediate re-fetch for consistency.
 * - FormModal and lists (countries, lehrbetriebe, ...) are passed as props to allow
 *   nested forms to keep lists in sync.
 */

"use client"
import { useEffect, useState } from "react";
import {
    BookOpen,
    Plus,
    Search,
    Database,
    Edit2,
    Trash2,
} from "lucide-react";
import { ViewType, DataItem } from "./types";
import { apiCall, getPrimaryKey } from "./api";
import { viewConfig } from "./config";
import { display } from "./utils";
import { FormModal } from "./FormModal";

export default function Page() {
    // ================ STATE ================
    // `view`: currently selected entity type (e.g. 'lernende', 'kurse')
    // `data`: array of records for the current view (loaded from API)
    const [view, setView] = useState<ViewType>("lernende");
    const [data, setData] = useState<DataItem[]>([]);
    
    // Form modal state:
    // `edit`: when non-null, the FormModal opens in edit mode with this record's data.
    // `showForm`: controls visibility of FormModal (true = shown, false = hidden)
    // `search`: user's input in the search box; used to filter `data` client-side.
    const [edit, setEdit] = useState<DataItem | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");

    // Master data lists used by FormModal and SelectWithActions for populating dropdowns
    // and enabling inline create/edit of related entities.
    const [countries, setCountries] = useState<any[]>([]);
    const [lehrbetriebe, setLehrbetriebe] = useState<any[]>([]);
    const [lernende, setLernende] = useState<any[]>([]);
    const [dozenten, setDozenten] = useState<any[]>([]);
    const [kurse, setKurse] = useState<any[]>([]);

    // ================ EFFECTS ================
    // Load master data on component mount ([]).
    // These lists are needed immediately by FormModal to populate select controls.
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

    // Load (or reload) records for the current view whenever `view` changes.
    // This effect runs after the user clicks a navigation tab to switch views.
    useEffect(() => {
        apiCall(`/${view}/all`).then(setData);
    }, [view]);

    // ================ HANDLERS ================
    // save(formData): called when FormModal's "Speichern" button is clicked.
    // - If `edit` is set, performs a PUT request to update the record (sends the PK in URL).
    // - If `edit` is null, performs a POST request to create a new record.
    // - After success, closes the modal and refreshes the view's data.
    async function save(formData: any) {
        if (edit) {
            // UPDATE: PUT /<view>/<id> with the form data.
            await apiCall(
                `/${view}/${(edit as any)[getPrimaryKey(view)]}`,
                "PUT",
                formData
            );
        } else {
            // CREATE: POST /<view> with the form data.
            await apiCall(`/${view}`, "POST", formData);
        }
        setShowForm(false);
        setEdit(null);
        // After a successful save (create or update), refresh the view's data list.
        apiCall(`/${view}/all`).then(setData);
    }

    // del(id): called when the delete button is clicked for a record.
    // - Sends DELETE request to /<view>/<id>.
    // - After success, refreshes the view's data.
    async function del(id: number) {
        await apiCall(`/${view}/${id}`, "DELETE");
        // After deletion, refresh the view to reflect the server state.
        apiCall(`/${view}/all`).then(setData);
    }

    // ================ DISPLAY LOGIC ================
    // filtered: Apply client-side search filter by converting each record to JSON
    // and checking if it contains the search string (case-insensitive).
    const filtered = data.filter((d) =>
        JSON.stringify(d).toLowerCase().includes(search.toLowerCase())
    );

    // currentView and IconComponent: Look up the configuration (label, icon, color)
    // for the active view from `viewConfig`.
    const currentView = viewConfig[view];
    const IconComponent = currentView.icon;

    // ================ RENDER ================
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

                    {/* Navigation */}
                    <div className="flex gap-3 flex-wrap">
                        {(Object.entries(viewConfig) as Array<[ViewType, typeof viewConfig[ViewType]]>).map(([id, config]) => {
                            const Icon = config.icon;
                            const isActive = view === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setView(id)}
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

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Controls */}
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
                            onClick={() => {
                                setEdit(null);
                                setShowForm(true);
                            }}
                        >
                            <Plus className="w-5 h-5" />
                            Neu erstellen
                        </button>
                    </div>
                </div>

                {/* Data Display */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* View Header */}
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
                                        <th
                                            key={k}
                                            className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                        >
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
                                            <td
                                                key={k}
                                                className="px-6 py-4 text-sm text-gray-900"
                                            >
                                                {display(k, v, {
                                                    countries,
                                                    lehrbetriebe,
                                                    lernende,
                                                    dozenten,
                                                    kurse,
                                                })}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEdit(row);
                                                        setShowForm(true);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                                                    title="Bearbeiten"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        del(row[getPrimaryKey(view)])
                                                    }
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

            {showForm && (
                <FormModal
                    view={view}
                    item={edit}
                    onSave={save}
                    onCancel={() => setShowForm(false)}
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