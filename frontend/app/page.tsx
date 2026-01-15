"use client";

import { useEffect, useState } from "react";
import {
    Edit2,
    Trash2,
    Save,
    X,
    BookOpen,
    Plus,
    Search,
    Database,
    Users,
    Building2,
    GraduationCap,
    BookMarked,
    Briefcase,
    ClipboardList,
} from "lucide-react";

/* =======================
   Types
======================= */
interface Country {
    id_country: number;
    country: string;
}

interface Lehrbetrieb {
    id_lehrbetrieb: number;
    firma: string;
    strasse?: string;
    plz?: string;
    ort?: string;
}

interface Lernende {
    id_lernende: number;
    vorname: string;
    nachname: string;
}

interface Dozent {
    id_dozent: number;
    vorname: string;
    nachname: string;
}

interface Kurs {
    id_kurs: number;
    kursthema?: string;
}

interface LehrbetriebLernende {
    id_lehrbetriebe_lernende: number;
    nr_lehrbetrieb: number;
    nr_lernende: number;
    start?: string;
    ende?: string;
    beruf?: string;
}

interface KursLernende {
    id_kurse_lernende: number;
    nr_kurs: number;
    nr_lernende: number;
    note?: number;
}

type DataItem =
    | Country
    | Lehrbetrieb
    | Lernende
    | Dozent
    | Kurs
    | LehrbetriebLernende
    | KursLernende;

type ViewType =
    | "countries"
    | "lehrbetriebe"
    | "lernende"
    | "dozenten"
    | "kurse"
    | "lehrbetriebe_lernende"
    | "kurse_lernende";

interface Field {
    name: string;
    label: string;
    type: "text" | "number" | "date" | "email" | "select" | "textarea";
    required?: boolean;
    options?: any[];
    valueKey?: string;
    labelKey?: string;
}

/* =======================
   API
======================= */
const API_BASE = "http://localhost";

async function apiCall(endpoint: string, method = "GET", data?: any) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method !== "GET" ? JSON.stringify(data) : undefined,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "API Fehler");
    return json;
}

const getPrimaryKey = (view: ViewType) =>
    ({
        countries: "id_country",
        lehrbetriebe: "id_lehrbetrieb",
        lernende: "id_lernende",
        dozenten: "id_dozent",
        kurse: "id_kurs",
        lehrbetriebe_lernende: "id_lehrbetriebe_lernende",
        kurse_lernende: "id_kurse_lernende",
    }[view]);

const viewConfig = {
    countries: { label: "Länder", icon: Database, color: "#3b82f6" },
    lehrbetriebe: { label: "Lehrbetriebe", icon: Building2, color: "#a855f7" },
    lernende: { label: "Lernende", icon: Users, color: "#22c55e" },
    dozenten: { label: "Dozenten", icon: GraduationCap, color: "#f97316" },
    kurse: { label: "Kurse", icon: BookMarked, color: "#ec4899" },
    lehrbetriebe_lernende: { label: "Lehrverhältnisse", icon: Briefcase, color: "#6366f1" },
    kurse_lernende: { label: "Kursanmeldungen", icon: ClipboardList, color: "#14b8a6" },
};

/* =======================
   Page
======================= */
export default function Page() {
    const [view, setView] = useState<ViewType>("lernende");
    const [data, setData] = useState<DataItem[]>([]);
    const [edit, setEdit] = useState<DataItem | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");

    const [countries, setCountries] = useState<Country[]>([]);
    const [lehrbetriebe, setLehrbetriebe] = useState<Lehrbetrieb[]>([]);
    const [lernende, setLernende] = useState<Lernende[]>([]);
    const [dozenten, setDozenten] = useState<Dozent[]>([]);
    const [kurse, setKurse] = useState<Kurs[]>([]);

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

    useEffect(() => {
        apiCall(`/${view}/all`).then(setData);
    }, [view]);

    async function save(formData: any) {
        if (edit) {
            await apiCall(
                `/${view}/${(edit as any)[getPrimaryKey(view)]}`,
                "PUT",
                formData
            );
        } else {
            await apiCall(`/${view}`, "POST", formData);
        }
        setShowForm(false);
        setEdit(null);
        apiCall(`/${view}/all`).then(setData);
    }

    async function del(id: number) {
        await apiCall(`/${view}/${id}`, "DELETE");
        apiCall(`/${view}/all`).then(setData);
    }

    const filtered = data.filter((d) =>
        JSON.stringify(d).toLowerCase().includes(search.toLowerCase())
    );

    const currentView = viewConfig[view];
    const IconComponent = currentView.icon;

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
                            <h1 className="text-3xl font-bold text-gray-900">Datenbankverwaltung</h1>
                            <p className="text-sm text-gray-500">Verwaltung von Lernenden, Kursen und Lehrbetrieben</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-3 flex-wrap">
                        {(Object.entries(viewConfig) as [ViewType, typeof viewConfig[ViewType]][]).map(([id, config]) => {
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
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
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
                />
            )}
        </div>
    );
}

/* =======================
   Display helper
======================= */
function display(
    key: string,
    value: any,
    { countries, lehrbetriebe, lernende, dozenten, kurse }: any
) {
    if (key === "nr_land")
        return countries.find((x: any) => x.id_country === value)?.country;
    if (key === "nr_lehrbetrieb")
        return lehrbetriebe.find((x: any) => x.id_lehrbetrieb === value)?.firma;
    if (key === "nr_lernende") {
        const l = lernende.find((x: any) => x.id_lernende === value);
        return l ? `${l.vorname} ${l.nachname}` : value;
    }
    if (key === "nr_dozent") {
        const d = dozenten.find((x: any) => x.id_dozent === value);
        return d ? `${d.vorname} ${d.nachname}` : value;
    }
    if (key === "nr_kurs")
        return kurse.find((x: any) => x.id_kurs === value)?.kursthema;
    return value ?? "";
}

/* =======================
   Form Modal
======================= */
function FormModal({
                       view,
                       item,
                       onSave,
                       onCancel,
                       countries,
                       lehrbetriebe,
                       lernende,
                       dozenten,
                       kurse,
                   }: any) {
    const [formData, setFormData] = useState<any>(item ?? {});

    const fields: Record<ViewType, Field[]> = {
        countries: [
            { name: "country", label: "Land", type: "text", required: true },
        ],
        lehrbetriebe: [
            { name: "firma", label: "Firma", type: "text", required: true },
            { name: "strasse", label: "Straße", type: "text" },
            { name: "plz", label: "PLZ", type: "text" },
            { name: "ort", label: "Ort", type: "text" },
        ],
        lernende: [
            { name: "vorname", label: "Vorname", type: "text", required: true },
            { name: "nachname", label: "Nachname", type: "text", required: true },
            {
                name: "nr_land",
                label: "Land",
                type: "select",
                options: countries,
                valueKey: "id_country",
                labelKey: "country",
            },
        ],
        dozenten: [
            { name: "vorname", label: "Vorname", type: "text", required: true },
            { name: "nachname", label: "Nachname", type: "text", required: true },
        ],
        kurse: [
            { name: "kursthema", label: "Kursthema", type: "text" },
            {
                name: "nr_dozent",
                label: "Dozent",
                type: "select",
                options: dozenten,
                valueKey: "id_dozent",
                labelKey: "nachname",
            },
        ],
        lehrbetriebe_lernende: [
            {
                name: "nr_lehrbetrieb",
                label: "Lehrbetrieb",
                type: "select",
                options: lehrbetriebe,
                valueKey: "id_lehrbetrieb",
                labelKey: "firma",
            },
            {
                name: "nr_lernende",
                label: "Lernender",
                type: "select",
                options: lernende,
                valueKey: "id_lernende",
                labelKey: "nachname",
            },
            { name: "start", label: "Start", type: "date" },
            { name: "ende", label: "Ende", type: "date" },
            { name: "beruf", label: "Beruf", type: "text" },
        ],
        kurse_lernende: [
            {
                name: "nr_kurs",
                label: "Kurs",
                type: "select",
                options: kurse,
                valueKey: "id_kurs",
                labelKey: "kursthema",
            },
            {
                name: "nr_lernende",
                label: "Lernender",
                type: "select",
                options: lernende,
                valueKey: "id_lernende",
                labelKey: "nachname",
            },
            { name: "note", label: "Note", type: "number" },
        ],
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {item ? "Eintrag bearbeiten" : "Neuer Eintrag"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {viewConfig[view].label}
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-150"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {fields[view].map((field) => (
                        <div key={field.name}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>

                            {field.type === "select" ? (
                                <select
                                    value={formData[field.name] ?? ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            [field.name]: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-150"
                                >
                                    <option value="">Bitte wählen...</option>
                                    {field.options?.map((opt: any) => (
                                        <option
                                            key={opt[field.valueKey!]}
                                            value={opt[field.valueKey!]}
                                        >
                                            {opt[field.labelKey!]}
                                        </option>
                                    ))}
                                </select>
                            ) : field.type === "textarea" ? (
                                <textarea
                                    value={formData[field.name] ?? ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            [field.name]: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-150"
                                    rows={4}
                                />
                            ) : (
                                <input
                                    type={field.type}
                                    value={formData[field.name] ?? ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            [field.name]: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-150"
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150 font-medium"
                    >
                        Abbrechen
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-150 shadow-md hover:shadow-lg font-medium"
                    >
                        <Save className="w-5 h-5" />
                        Speichern
                    </button>
                </div>
            </div>
        </div>
    );
}