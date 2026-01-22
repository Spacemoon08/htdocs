import { useState } from "react";
import { Edit2, Plus } from "lucide-react";
import { ViewType, Field } from "./types";
import { apiCall } from "./api";
import { NestedFormModal } from "./NestedFormModal";

export function SelectWithActions(props: {
    field: Field;
    value: any;
    onChange: (value: any) => void;
    onRefresh: (newOptions: any[]) => void;
}) {
    const { field, value, onChange, onRefresh } = props;
    const [showNestedForm, setShowNestedForm] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);

    const viewMap: Record<string, ViewType> = {
        nr_land: "countries",
        nr_lehrbetrieb: "lehrbetriebe",
        nr_lernende: "lernende",
        nr_dozent: "dozenten",
        nr_kurs: "kurse",
    };

    const nestedView = viewMap[field.name];

    const handleSaveNested = async (nestedData: any) => {
        try {
            if (editItem) {
                await apiCall(
                    `/${nestedView}/${editItem[field.valueKey!]}`,
                    "PUT",
                    nestedData
                );
            } else {
                await apiCall(`/${nestedView}`, "POST", nestedData);
            }
            const updated = await apiCall(`/${nestedView}/all`);
            onRefresh(updated);
            setShowNestedForm(false);
            setEditItem(null);
        } catch (err) {
            alert("Fehler beim Speichern: " + err);
        }
    };

    const handleEdit = () => {
        const selected = field.options?.find(
            (opt: any) => opt[field.valueKey!] == value
        );
        if (selected) {
            setEditItem(selected);
            setShowNestedForm(true);
        }
    };

    return (
        <>
            <div className="flex gap-2">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-150"
                >
                    <option value="">Bitte wählen...</option>
                    {field.options?.map((opt: any) => (
                        <option key={opt[field.valueKey!]} value={opt[field.valueKey!]}>
                            {nestedView === "lernende" || nestedView === "dozenten"
                                ? `${opt.vorname} ${opt.nachname}`
                                : opt[field.labelKey!]}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={() => {
                        setEditItem(null);
                        setShowNestedForm(true);
                    }}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-150"
                    title="Neu erstellen"
                >
                    <Plus className="w-5 h-5" />
                </button>
                {value && (
                    <button
                        type="button"
                        onClick={handleEdit}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-150"
                        title="Bearbeiten"
                    >
                        <Edit2 className="w-5 h-5" />
                    </button>
                )}
            </div>

            {showNestedForm && (
                <NestedFormModal
                    view={nestedView}
                    item={editItem}
                    onSave={handleSaveNested}
                    onCancel={() => {
                        setShowNestedForm(false);
                        setEditItem(null);
                    }}
                />
            )}
        </>
    );
}