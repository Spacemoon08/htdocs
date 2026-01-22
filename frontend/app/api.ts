import {ViewType} from "@/app/types";

const API_BASE = "http://localhost";

export async function apiCall(endpoint: string, method = "GET", data?: any) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method !== "GET" ? JSON.stringify(data) : undefined,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "API Fehler");
    return json;
}

export const getPrimaryKey = (view: ViewType) => {
    const keys: Record<ViewType, string> = {
        countries: "id_country",
        lehrbetriebe: "id_lehrbetrieb",
        lernende: "id_lernende",
        dozenten: "id_dozent",
        kurse: "id_kurs",
        lehrbetriebe_lernende: "id_lehrbetriebe_lernende",
        kurse_lernende: "id_kurse_lernende",
    };
    return keys[view];
};
