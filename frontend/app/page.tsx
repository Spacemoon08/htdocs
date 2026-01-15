"use client";

import { useState, useEffect } from 'react';
import { Home, Users, Briefcase, BookOpen, Plus, Edit2, Trash2, Search, Save, X, AlertCircle } from 'lucide-react';

// TypeScript Interfaces
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
    strasse?: string;
    plz?: string;
    ort?: string;
    nr_land?: number;
    geschlecht?: 'm' | 'w' | 'd';
    telefon?: string;
    handy?: string;
    email?: string;
    email_privat?: string;
    birthdate?: string;
}

interface Dozent {
    id_dozent: number;
    vorname: string;
    nachname: string;
    strasse?: string;
    plz?: string;
    ort?: string;
    nr_land?: number;
    geschlecht?: 'm' | 'w' | 'd';
    telefon?: string;
    handy?: string;
    email?: string;
    birthdate?: string;
}

interface Kurs {
    id_kurs: number;
    kursnummer?: string;
    kursthema?: string;
    inhalt?: string;
    nr_dozent?: number;
    startdatum?: string;
    enddatum?: string;
    dauer?: number;
}

type DataItem = Lernende | Lehrbetrieb | Kurs | Dozent;
type ViewType = 'lernende' | 'lehrbetriebe' | 'kurse' | 'dozenten';

interface Field {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    options?: any[];
    valueKey?: string;
    labelKey?: string;
}

// API Konfiguration - WICHTIG: Passen Sie dies an Ihre Umgebung an!
// Für XAMPP normalerweise: http://localhost
// Für andere Setups: http://localhost:8000 oder ähnlich
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

// Verbesserte API-Funktion mit detaillierter Fehlerbehandlung
const apiCall = async (endpoint: string, method: string = 'GET', data: any = null): Promise<any> => {
    try {
        const config: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors'
        };

        if (data && method !== 'GET') {
            config.body = JSON.stringify(data);
        }

        const url = `${API_BASE}${endpoint}`;
        console.log(`API Request: ${method} ${url}`, data || '');

        const response = await fetch(url, config);

        // Behandle verschiedene Response-Typen
        const contentType = response.headers.get('content-type');
        let responseData;

        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            const text = await response.text();
            console.error('Unexpected response format:', text);
            throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
        }

        if (!response.ok) {
            console.error('API Error Response:', responseData);

            // Behandle Validierungsfehler
            if (responseData.validation_errors) {
                throw new Error(`Validierung fehlgeschlagen:\n${responseData.validation_errors.join('\n')}`);
            }

            throw new Error(responseData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        console.log('API Response:', responseData);
        return responseData;

    } catch (error) {
        console.error('API Call failed:', error);

        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error(`Backend nicht erreichbar. Stellen Sie sicher, dass:\n1. Der PHP-Server läuft\n2. Die URL ${API_BASE} korrekt ist\n3. CORS richtig konfiguriert ist`);
        }

        throw error;
    }
};

// Hauptkomponente
export default function KursverwaltungApp() {
    const [activeView, setActiveView] = useState<ViewType>('lernende');
    const [data, setData] = useState<DataItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [editItem, setEditItem] = useState<DataItem | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Referenzdaten
    const [lehrbetriebe, setLehrbetriebe] = useState<Lehrbetrieb[]>([]);
    const [dozenten, setDozenten] = useState<Dozent[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);

    // Laden von Referenzdaten
    useEffect(() => {
        const loadReferenceData = async () => {
            try {
                const [lbData, dozData, countryData] = await Promise.all([
                    apiCall('/lehrbetriebe/all'),
                    apiCall('/dozenten/all'),
                    apiCall('/countries/all')
                ]);
                setLehrbetriebe(Array.isArray(lbData) ? lbData : []);
                setDozenten(Array.isArray(dozData) ? dozData : []);
                setCountries(Array.isArray(countryData) ? countryData : []);
                setError(null);
            } catch (err: any) {
                console.error('Fehler beim Laden der Referenzdaten:', err);
                setError(err.message || 'Fehler beim Laden der Referenzdaten');
            }
        };
        loadReferenceData();
    }, []);

    // Laden der Hauptdaten
    useEffect(() => {
        loadData();
    }, [activeView]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiCall(`/${activeView}/all`);
            setData(Array.isArray(result) ? result : []);
        } catch (err: any) {
            console.error('Fehler beim Laden:', err);
            setData([]);
            setError(err.message || 'Daten konnten nicht geladen werden');
        }
        setLoading(false);
    };

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    // CREATE
    const handleCreate = async (formData: any) => {
        try {
            setError(null);
            await apiCall(`/${activeView}`, 'POST', formData);
            await loadData();
            setShowForm(false);
            setEditItem(null);
            showSuccess('Erfolgreich erstellt!');
        } catch (err: any) {
            setError(err.message || 'Fehler beim Erstellen');
        }
    };

    // UPDATE
    const handleUpdate = async (id: number, formData: any) => {
        try {
            setError(null);
            await apiCall(`/${activeView}/${id}`, 'PUT', formData);
            await loadData();
            setShowForm(false);
            setEditItem(null);
            showSuccess('Erfolgreich aktualisiert!');
        } catch (err: any) {
            setError(err.message || 'Fehler beim Aktualisieren');
        }
    };

    // DELETE
    const handleDelete = async (id: number) => {
        if (!confirm('Wirklich löschen?')) return;
        try {
            setError(null);
            await apiCall(`/${activeView}/${id}`, 'DELETE');
            await loadData();
            showSuccess('Erfolgreich gelöscht!');
        } catch (err: any) {
            setError(err.message || 'Fehler beim Löschen');
        }
    };

    const navigation = [
        { id: 'lernende' as ViewType, label: 'Lernende', icon: Users },
        { id: 'lehrbetriebe' as ViewType, label: 'Lehrbetriebe', icon: Briefcase },
        { id: 'kurse' as ViewType, label: 'Kurse', icon: BookOpen },
        { id: 'dozenten' as ViewType, label: 'Dozenten', icon: Users }
    ];

    const filteredData = data.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Home className="w-8 h-8 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Kursverwaltung</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Suchen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="w-5 h-5 text-gray-400 -ml-10" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="w-full px-4 py-6">
                <div className="flex gap-6">
                    {/* Sidebar */}
                    <aside className="w-64 bg-white rounded-lg shadow-sm p-4">
                        <nav className="space-y-2">
                            {navigation.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => {
                                        setActiveView(id);
                                        setShowForm(false);
                                        setEditItem(null);
                                        setError(null);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                                        activeView === id
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {label}
                                </button>
                            ))}
                        </nav>

                        {/* API Status */}
                        <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs">
                            <div className="font-semibold mb-1">API Endpoint:</div>
                            <div className="text-gray-600 break-all">{API_BASE}</div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="bg-white rounded-lg shadow-sm">
                            {/* Toolbar */}
                            <div className="flex items-center justify-between p-4 border-b">
                                <h2 className="text-xl font-semibold capitalize">{activeView}</h2>
                                <button
                                    onClick={() => {
                                        setShowForm(true);
                                        setEditItem(null);
                                        setError(null);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    <Plus className="w-5 h-5" />
                                    Neu erstellen
                                </button>
                            </div>

                            {/* Success Message */}
                            {successMessage && (
                                <div className="m-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    {successMessage}
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <strong>Fehler:</strong>
                                            <pre className="mt-1 text-sm whitespace-pre-wrap">{error}</pre>
                                        </div>
                                        <button
                                            onClick={() => setError(null)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Form Modal */}
                            {showForm && (
                                <FormModal
                                    view={activeView}
                                    item={editItem}
                                    onSave={(data) => {
                                        if (editItem) {
                                            handleUpdate((editItem as any)[getPrimaryKey(activeView)], data);
                                        } else {
                                            handleCreate(data);
                                        }
                                    }}
                                    onCancel={() => {
                                        setShowForm(false);
                                        setEditItem(null);
                                        setError(null);
                                    }}
                                    lehrbetriebe={lehrbetriebe}
                                    dozenten={dozenten}
                                    countries={countries}
                                />
                            )}

                            {/* Data Table */}
                            <div className="p-4">
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <p className="mt-2 text-gray-500">Laden...</p>
                                    </div>
                                ) : (
                                    <DataTable
                                        view={activeView}
                                        data={filteredData}
                                        onEdit={(item) => {
                                            setEditItem(item);
                                            setShowForm(true);
                                            setError(null);
                                        }}
                                        onDelete={(id) => handleDelete(id)}
                                        lehrbetriebe={lehrbetriebe}
                                        dozenten={dozenten}
                                        countries={countries}
                                    />
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

const getPrimaryKey = (view: ViewType): string => {
    const keys: Record<ViewType, string> = {
        lernende: 'id_lernende',
        lehrbetriebe: 'id_lehrbetrieb',
        kurse: 'id_kurs',
        dozenten: 'id_dozent'
    };
    return keys[view] || 'id';
};

// DataTable Component
interface DataTableProps {
    view: ViewType;
    data: DataItem[];
    onEdit: (item: DataItem) => void;
    onDelete: (id: number) => void;
    lehrbetriebe: Lehrbetrieb[];
    dozenten: Dozent[];
    countries: Country[];
}

function DataTable({ view, data, onEdit, onDelete, lehrbetriebe, dozenten, countries }: DataTableProps) {
    const primaryKey = getPrimaryKey(view);

    const getDisplayValue = (key: string, value: any): string => {
        if (key === 'nr_lehrbetrieb') {
            const lb = lehrbetriebe.find(l => l.id_lehrbetrieb === value);
            return lb ? lb.firma : value;
        }
        if (key === 'nr_dozent') {
            const doz = dozenten.find(d => d.id_dozent === value);
            return doz ? `${doz.vorname} ${doz.nachname}` : value;
        }
        if (key === 'nr_land') {
            const country = countries.find(c => c.id_country === value);
            return country ? country.country : value;
        }
        return value || '-';
    };

    if (data.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Keine Daten vorhanden</p>
            </div>
        );
    }

    const columns = Object.keys(data[0]).filter(key => key !== primaryKey);

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b">
                <tr>
                    {columns.map(col => (
                        <th key={col} className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            {col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </th>
                    ))}
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Aktionen</th>
                </tr>
                </thead>
                <tbody className="divide-y">
                {data.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                        {columns.map(col => (
                            <td key={col} className="px-4 py-3 text-sm text-gray-900">
                                {getDisplayValue(col, (item as any)[col])}
                            </td>
                        ))}
                        <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => onEdit(item)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                    title="Bearbeiten"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onDelete((item as any)[primaryKey])}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
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
    );
}

// FormModal Component
interface FormModalProps {
    view: ViewType;
    item: DataItem | null;
    onSave: (data: any) => void;
    onCancel: () => void;
    lehrbetriebe: Lehrbetrieb[];
    dozenten: Dozent[];
    countries: Country[];
}

function FormModal({ view, item, onSave, onCancel, lehrbetriebe, dozenten, countries }: FormModalProps) {
    const [formData, setFormData] = useState<any>(item || {});

    const getFields = (): Field[] => {
        const fields: Record<ViewType, Field[]> = {
            lernende: [
                { name: 'vorname', label: 'Vorname', type: 'text', required: true },
                { name: 'nachname', label: 'Nachname', type: 'text', required: true },
                { name: 'strasse', label: 'Straße', type: 'text' },
                { name: 'plz', label: 'PLZ', type: 'text' },
                { name: 'ort', label: 'Ort', type: 'text' },
                { name: 'nr_land', label: 'Land', type: 'select', options: countries, valueKey: 'id_country', labelKey: 'country' },
                { name: 'geschlecht', label: 'Geschlecht', type: 'select', options: [{v:'m',l:'Männlich'},{v:'w',l:'Weiblich'},{v:'d',l:'Divers'}], valueKey: 'v', labelKey: 'l' },
                { name: 'telefon', label: 'Telefon', type: 'text' },
                { name: 'handy', label: 'Handy', type: 'text' },
                { name: 'email', label: 'E-Mail', type: 'email' },
                { name: 'email_privat', label: 'Private E-Mail', type: 'email' },
                { name: 'birthdate', label: 'Geburtsdatum', type: 'date' }
            ],
            lehrbetriebe: [
                { name: 'firma', label: 'Firma', type: 'text', required: true },
                { name: 'strasse', label: 'Straße', type: 'text' },
                { name: 'plz', label: 'PLZ', type: 'text' },
                { name: 'ort', label: 'Ort', type: 'text' }
            ],
            kurse: [
                { name: 'kursnummer', label: 'Kursnummer', type: 'text' },
                { name: 'kursthema', label: 'Kursthema', type: 'text' },
                { name: 'inhalt', label: 'Inhalt', type: 'textarea' },
                { name: 'nr_dozent', label: 'Dozent', type: 'select', options: dozenten, valueKey: 'id_dozent', labelKey: 'nachname' },
                { name: 'startdatum', label: 'Startdatum', type: 'date' },
                { name: 'enddatum', label: 'Enddatum', type: 'date' },
                { name: 'dauer', label: 'Dauer (Tage)', type: 'number' }
            ],
            dozenten: [
                { name: 'vorname', label: 'Vorname', type: 'text', required: true },
                { name: 'nachname', label: 'Nachname', type: 'text', required: true },
                { name: 'strasse', label: 'Straße', type: 'text' },
                { name: 'plz', label: 'PLZ', type: 'text' },
                { name: 'ort', label: 'Ort', type: 'text' },
                { name: 'nr_land', label: 'Land', type: 'select', options: countries, valueKey: 'id_country', labelKey: 'country' },
                { name: 'geschlecht', label: 'Geschlecht', type: 'select', options: [{v:'m',l:'Männlich'},{v:'w',l:'Weiblich'},{v:'d',l:'Divers'}], valueKey: 'v', labelKey: 'l' },
                { name: 'telefon', label: 'Telefon', type: 'text' },
                { name: 'handy', label: 'Handy', type: 'text' },
                { name: 'email', label: 'E-Mail', type: 'email' },
                { name: 'birthdate', label: 'Geburtsdatum', type: 'date' }
            ]
        };
        return fields[view] || [];
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-xl font-semibold">
                        {item ? 'Bearbeiten' : 'Neu erstellen'}
                    </h3>
                    <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {getFields().map(field => (
                        <div key={field.name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>

                            {field.type === 'select' ? (
                                <select
                                    value={formData[field.name] || ''}
                                    onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                                    required={field.required}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                                >
                                    <option value="">Bitte wählen...</option>
                                    {field.options?.map((opt, idx) => (
                                        <option key={idx} value={opt[field.valueKey!]}>
                                            {opt[field.labelKey!]}
                                        </option>
                                    ))}
                                </select>
                            ) : field.type === 'textarea' ? (
                                <textarea
                                    value={formData[field.name] || ''}
                                    onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                                    required={field.required}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                                    rows={4}
                                />
                            ) : (
                                <input
                                    type={field.type}
                                    value={formData[field.name] || ''}
                                    onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                                    required={field.required}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                                />
                            )}
                        </div>
                    ))}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Save className="w-5 h-5" />
                            Speichern
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            Abbrechen
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}