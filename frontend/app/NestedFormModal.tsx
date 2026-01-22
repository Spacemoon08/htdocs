import { useState } from "react";
import { Save, X } from "lucide-react";
import { ViewType, Field } from "./types";
import { viewConfig } from "./config";

export function NestedFormModal(props: {
    view: ViewType;
    item: any;
    onSave: (data: any) => void;
    onCancel: () => void;
}) {
    const { view, item, onSave, onCancel } = props;
    const [formData, setFormData] = useState<any>(item ?? {});

    const nestedFields: Record<string, Field[]> = {
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
        ],
        dozenten: [
            { name: "vorname", label: "Vorname", type: "text", required: true },
            { name: "nachname", label: "Nachname", type: "text", required: true },
        ],
        kurse: [
            { name: "kursthema", label: "Kursthema", type: "text" },
        ],
    };

    const currentConfig = viewConfig[view];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            {item ? "Bearbeiten" : "Neu erstellen"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {currentConfig?.label}
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-150"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                    {nestedFields[view]?.map((field) => (
                        <div key={field.name}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <input
                                type={field.type}
                                value={formData[field.name] ?? ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        [field.name]: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 transition-all duration-150"
                            />
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 p-5 border-t border-gray-200 bg-gray-50">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150 font-medium"
                    >
                        Abbrechen
                    </button>
                    <button
                        type="button"
                        onClick={() => onSave(formData)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-150 shadow-md hover:shadow-lg font-medium"
                    >
                        <Save className="w-5 h-5" />
                        Speichern
                    </button>
                </div>
            </div>
        </div>
    );
}