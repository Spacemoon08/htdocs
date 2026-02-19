/**
 * api.ts
 *
 * Client-side API helper module for communicating with the PHP backend.
 *
 * Overview:
 * - Provides two key exports: `apiCall` (generic HTTP client) and `getPrimaryKey` (PK lookup).
 * - All requests use `http://localhost` as the base URL. Update `API_BASE` if deploying to
 *   another host or port.
 * - Expects all responses to be JSON. Errors should also be JSON objects with an `error` field.
 *
 * Error handling:
 * - Non-2xx responses cause an Error to be thrown (not silently ignored).
 * - Callers must wrap `apiCall` in try/catch or use `.catch()` to handle errors.
 * - Error messages are displayed to users via the UI or console logs.
 */

import {ViewType} from "@/app/types";

// Base URL for all API requests. Points to the same host running the PHP backend.
const API_BASE = "http://localhost";

/**
 * apiCall(endpoint, method, data)
 *
 * Generic REST client for calling the backend API.
 *
 * Parameters:
 * - endpoint: API path, e.g. '/lernende/all', '/lernende/1', '/kurse'
 * - method: HTTP method (default: 'GET'). Can be 'GET', 'POST', 'PUT', 'DELETE'.
 * - data: optional payload for POST/PUT requests. Will be stringified to JSON.
 *
 * Behavior:
 * - Constructs the full URL as `API_BASE + endpoint`.
 * - Sets Content-Type header to 'application/json'.
 * - For GET requests, no body is sent. For other methods, `data` is JSON-encoded.
 * - If the response status is not 2xx, throws an Error. The error message is taken from
 *   the response JSON `error` field if available, otherwise a generic message is used.
 * - If the response is 2xx, returns the parsed JSON object (assumed to be the API result).
 *
 * Usage example:
 *   await apiCall('/lernende', 'POST', { vorname: 'Test', nachname: 'User' })
 *   const records = await apiCall('/lernende/all')
 *   await apiCall('/lernende/1', 'DELETE')
 */
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

/**
 * getPrimaryKey(view)
 *
 * Returns the primary key column name for a given view.
 *
 * Parameters:
 * - view: ViewType identifier (e.g. 'lernende', 'kurse', 'countries')
 *
 * Returns:
 * - The column name (string) that is the primary key for that table.
 *   For example, getPrimaryKey('lernende') returns 'id_lernende'.
 *
 * Notes:
 * - This mapping must match the database schema exactly.
 * - Keep this in sync with the backend when schema changes are made.
 * - Used internally to construct UPDATE/DELETE URL paths and to extract
 *   the record ID when displaying/editing records.
 */
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
