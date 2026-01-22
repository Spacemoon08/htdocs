import { useState } from "react";
import { Save, X } from "lucide-react";
import { ViewType, Field } from "./types";
import { viewConfig } from "./config";
import { SelectWithActions } from "./SelectionWithActions";

export function FormModal(props: {
    view: ViewType;
    item: any;
    onSave: (data: any) => void;
    onCancel: () => void;
    countries: any[];
    lehrbetriebe: any[];
    lernende: any[];
    dozenten: any[];
    kurse: any[];
    setCountries: (data: any[]) => void;
    setLehrbetriebe: (data: any[]) => void;
    setLernende: (data: any[]) => void;
    setDozenten: (data: any[]) => void;
    setKurse: (data: any[]) => void;
}) {
    const {
        view,
        item,
        onSave,
        onCancel,
        countries,
        lehrbetriebe,
        lernende,
        dozenten,
        kurse,
        setCountries,
        setLehrbetriebe,
        setLernende,
        setDozenten,
        setKurse,
    } = props;

    const [formData, setFormData] = useState<any>(item ?? {});
    const [localCountries, setLocalCountries] = useState(countries);
    const [localLehrbetriebe, setLocalLehrbetriebe] = useState(lehrbetriebe);
    const [localLernende, setLocalLernende] = useState(lernende);
    const [localDozenten, setLocalDozenten] = useState(dozenten);
    const [localKurse, setLocalKurse] = useState(kurse);

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
                options: localCountries,
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
                options: localDozenten,
                valueKey: "id_dozent",
                labelKey: "nachname",
            },
        ],
        lehrbetriebe_lernende: [
            {
                name: "nr_lehrbetrieb",
                label: "Lehrbetrieb",
                type: "select",
                options: localLehrbetriebe,
                valueKey: "id_lehrbetrieb",
                labelKey: "firma",
            },
            {
                name: "nr_lernende",
                label: "Lernender",
                type: "select",
                options: localLernende,
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
                options: localKurse,
                valueKey: "id_kurs",
                labelKey: "kursthema",
            },
            {
                name: "nr_lernende",
                label: "Lernender",
                type: "select",
                options: localLernende,
                valueKey: "id_lernende",
                labelKey: "nachname",
            },
            { name: "note", label: "Note", type: "number" },
        ],
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    const handleRefresh = (fieldName: string, newData: any[]) => {
        if (fieldName === "nr_land") {
            setLocalCountries(newData);
            setCountries(newData);
        } else if (fieldName === "nr_lehrbetrieb") {
            setLocalLehrbetriebe(newData);
            setLehrbetriebe(newData);
        } else if (fieldName === "nr_lernende") {
            setLocalLernende(newData);
            setLernende(newData);
        } else if (fieldName === "nr_dozent") {
            setLocalDozenten(newData);
            setDozenten(newData);
        } else if (fieldName === "nr_kurs") {
            setLocalKurse(newData);
            setKurse(newData);
        }
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
                                <SelectWithActions
                                    field={field}
                                    value={formData[field.name] ?? ""}
                                    onChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            [field.name]: value,
                                        })
                                    }
                                    onRefresh={(newOptions) => handleRefresh(field.name, newOptions)}
                                />
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