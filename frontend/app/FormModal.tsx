import { useState } from "react";
import { Save, X } from "lucide-react";
import { ViewType, Field } from "./types";
import { viewConfig } from "./config";
import { SelectWithActions } from "./SelectionWithActions";
import { getPrimaryKey } from "./api";

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

    // Define all expected fields for each view type
    const viewFields: Record<ViewType, string[]> = {
        countries: ["country"],
        lehrbetriebe: ["firma", "strasse", "plz", "ort"],
        lernende: ["vorname", "nachname", "strasse", "plz", "ort", "nr_land", "geschlecht", "telefon", "handy", "email", "email_privat", "birthdate"],
        dozenten: ["vorname", "nachname", "strasse", "plz", "ort", "nr_land", "geschlecht", "telefon", "handy", "email", "birthdate"],
        kurse: ["kursnummer", "kursthema", "inhalt", "nr_dozent", "startdatum", "enddatum", "dauer"],
        lehrbetriebe_lernende: ["nr_lehrbetrieb", "nr_lernende", "start", "ende", "beruf"],
        kurse_lernende: ["nr_kurs", "nr_lernende", "note"],
    };

    // Field configuration for select fields and special types
    const fieldConfig: Record<string, Partial<Field>> = {
        nr_land: {
            label: "Land",
            type: "select",
            options: localCountries,
            valueKey: "id_country",
            labelKey: "country",
        },
        nr_lehrbetrieb: {
            label: "Lehrbetrieb",
            type: "select",
            options: localLehrbetriebe,
            valueKey: "id_lehrbetrieb",
            labelKey: "firma",
        },
        nr_lernende: {
            label: "Lernender",
            type: "select",
            options: localLernende,
            valueKey: "id_lernende",
            labelKey: "nachname",
        },
        nr_dozent: {
            label: "Dozent",
            type: "select",
            options: localDozenten,
            valueKey: "id_dozent",
            labelKey: "nachname",
        },
        nr_kurs: {
            label: "Kurs",
            type: "select",
            options: localKurse,
            valueKey: "id_kurs",
            labelKey: "kursthema",
        },
        geschlecht: {
            label: "Geschlecht",
            type: "select",
            options: [
                { value: "m", label: "Männlich" },
                { value: "w", label: "Weiblich" },
                { value: "d", label: "Divers" }
            ],
            valueKey: "value",
            labelKey: "label",
        },
        start: { label: "Start", type: "date" },
        ende: { label: "Ende", type: "date" },
        startdatum: { label: "Startdatum", type: "date" },
        enddatum: { label: "Enddatum", type: "date" },
        birthdate: { label: "Geburtsdatum", type: "date" },
        note: { label: "Note", type: "number" },
        dauer: { label: "Dauer (Tage)", type: "number" },
        vorname: { label: "Vorname", type: "text", required: true },
        nachname: { label: "Nachname", type: "text", required: true },
        country: { label: "Land", type: "text", required: true },
        firma: { label: "Firma", type: "text", required: true },
        strasse: { label: "Straße", type: "text" },
        plz: { label: "PLZ", type: "text" },
        ort: { label: "Ort", type: "text" },
        telefon: { label: "Telefon", type: "text" },
        handy: { label: "Handy", type: "text" },
        email: { label: "E-Mail", type: "email" },
        email_privat: { label: "E-Mail Privat", type: "email" },
        kursnummer: { label: "Kursnummer", type: "text" },
        kursthema: { label: "Kursthema", type: "text" },
        inhalt: { label: "Inhalt", type: "textarea" },
        beruf: { label: "Beruf", type: "text" },
    };

    // Generate fields based on view type
    const generateFields = (): Field[] => {
        const expectedFields = viewFields[view];

        return expectedFields.map(key => {
            const config = fieldConfig[key];

            // Generate label from key if not in config
            const defaultLabel = key
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            return {
                name: key,
                label: config?.label || defaultLabel,
                type: config?.type || "text",
                required: config?.required,
                options: config?.options,
                valueKey: config?.valueKey,
                labelKey: config?.labelKey,
            } as Field;
        });
    };

    const fields = generateFields();

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
                    {fields.map((field) => (
                        <div key={field.name}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>

                            {field.type === "select" ? (
                                field.name === "geschlecht" ? (
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
                                            <option key={opt[field.valueKey!]} value={opt[field.valueKey!]}>
                                                {opt[field.labelKey!]}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
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
                                )
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