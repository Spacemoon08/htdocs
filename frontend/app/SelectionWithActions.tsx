/**
 * SelectionWithActions.tsx
 *
 * A select control with inline create/edit actions for related entities.
 *
 * Purpose:
 * - Provides a dropdown to choose an existing related record.
 * - Two buttons allow users to quickly create or edit related records without
 *   leaving the current form.
 * - When changes are made via the nested modal, the parent is notified so its
 *   select options stay in sync.
 *
 * Props:
 * - field: Field definition (includes options, valueKey, labelKey, etc.)
 * - value: currently selected option value
 * - onChange: callback when user selects a different option
 * - onRefresh: callback when nested entity list changes (after create/update)
 * - countries/lehrbetriebe/...: optional lists for populating nested forms
 *
 * Behavior:
 * - "Neu erstellen" button: opens NestedFormModal in create mode (editItem = null)
 * - "Bearbeiten" button: only appears when a value is selected; opens NestedFormModal
 *   with the selected record pre-filled
 * - After successful nested save, calls `handleSaveNested` to update the API and
 *   refresh the parent's list via `onRefresh`.
 */

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
    countries?: any[];
    lehrbetriebe?: any[];
    lernende?: any[];
    dozenten?: any[];
    kurse?: any[];
}) {
    const {
        field,
        value,
        onChange,
        onRefresh,
        countries = [],
        lehrbetriebe = [],
        lernende = [],
        dozenten = [],
        kurse = []
    } = props;

    // Component state for the nested modal:
    // - showNestedForm: controls visibility of the NestedFormModal
    // - editItem: when non-null, the NestedFormModal operates in edit mode
    const [showNestedForm, setShowNestedForm] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);

    // Map field names to their corresponding view (e.g. 'nr_land' -> 'countries')
    // This tells us which API endpoint and nested form to use.
    const viewMap: Record<string, ViewType> = {
        nr_land: "countries",
        nr_lehrbetrieb: "lehrbetriebe",
        nr_lernende: "lernende",
        nr_dozent: "dozenten",
        nr_kurs: "kurse",
    };

    const nestedView = viewMap[field.name];

    // ================ HANDLERS ================
    // handleSaveNested: called when the nested form is submitted.
    // - Sends the nested data to the API (POST for create, PUT for edit).
    // - Fetches the updated list and calls onRefresh so FormModal's lists stay in sync.
    // - Closes the nested modal and resets editItem.
    const handleSaveNested = async (nestedData: any) => {
        try {
            if (editItem) {
                // UPDATE nested entity
                await apiCall(
                    `/${nestedView}/${editItem[field.valueKey!]}`,
                    "PUT",
                    nestedData
                );
            } else {
                // CREATE new nested entity
                await apiCall(`/${nestedView}`, "POST", nestedData);
            }
            // Fetch the updated list and notify the parent
            const updated = await apiCall(`/${nestedView}/all`);
            onRefresh(updated);
            setShowNestedForm(false);
            setEditItem(null);
        } catch (err) {
            alert("Fehler beim Speichern: " + err);
        }
    };

    // handleEdit: opens the nested modal in edit mode with the selected record.
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
                    countries={countries}
                    lehrbetriebe={lehrbetriebe}
                    lernende={lernende}
                    dozenten={dozenten}
                    kurse={kurse}
                />
            )}
        </>
    );
}