/**
 * utils.ts
 *
 * Utility functions for formatting and display in the frontend.
 *
 * Purpose:
 * - Centralize display logic so table cells show human-readable values.
 * - Handle special cases: foreign keys, enums, dates, numbers.
 * - Keep component render code clean by delegating formatting to this module.
 */

/**
 * display(key, value, context)
 *
 * Formats a database column value for display in the UI.
 *
 * Parameters:
 * - key: column name (e.g. 'vorname', 'nr_land', 'geschlecht', 'birthdate')
 * - value: the raw value from the database
 * - context: object containing lookup lists
 *   { countries, lehrbetriebe, lernende, dozenten, kurse }
 *
 * Returns:
 * - A formatted string suitable for display in a table cell.
 *
 * Handling:
 * 1. Foreign key references (nr_land, nr_lehrbetrieb, nr_lernende, nr_dozent, nr_kurs):
 *    Looks up the related record and returns a human-readable label.
 * 2. Gender enum (geschlecht): Converts 'm', 'w', 'd' to German labels.
 * 3. Date fields (birthdate, start, ende, startdatum, enddatum):
 *    Converts ISO date strings to localized German date format (de-DE).
 * 4. Grade/note fields: Formats numbers to 1 decimal place.
 * 5. Other fields: Returns the value as-is (or empty string if null/undefined).
 *
 * Example:
 *   display('geschlecht', 'w', context) → 'Weiblich'
 *   display('birthdate', '2005-03-15', context) → '15.3.2005'
 *   display('nr_land', 1, context) → 'Schweiz' (from countries lookup)
 */
export function display(
    key: string,
    value: any,
    context: {
        countries: any[];
        lehrbetriebe: any[];
        lernende: any[];
        dozenten: any[];
        kurse: any[];
    }
) {
    // FOREIGN KEY RESOLUTION: Look up related entities and display their names/labels
    if (key === "nr_land")
        return context.countries.find((x) => x.id_country === value)?.country;
    if (key === "nr_lehrbetrieb")
        return context.lehrbetriebe.find((x) => x.id_lehrbetrieb === value)?.firma;
    // For people (learners and teachers), display "Vorname Nachname"
    if (key === "nr_lernende") {
        const l = context.lernende.find((x) => x.id_lernende === value);
        return l ? `${l.vorname} ${l.nachname}` : value;
    }
    if (key === "nr_dozent") {
        const d = context.dozenten.find((x) => x.id_dozent === value);
        return d ? `${d.vorname} ${d.nachname}` : value;
    }
    if (key === "nr_kurs")
        return context.kurse.find((x) => x.id_kurs === value)?.kursthema;

    // ENUM HANDLING: Convert database enums to German labels
    if (key === "geschlecht") {
        if (value === "m") return "Männlich";
        if (value === "w") return "Weiblich";
        if (value === "d") return "Divers";
        return value;
    }

    // DATE FORMATTING: Convert ISO dates to German locale format
    if (key === "birthdate" || key === "start" || key === "ende" ||
        key === "startdatum" || key === "enddatum") {
        if (!value) return "";
        try {
            const date = new Date(value);
            // toLocaleDateString('de-DE') produces format like "15. März 2005"
            return date.toLocaleDateString("de-DE");
        } catch {
            return value;
        }
    }

    // NUMBER FORMATTING: Format grades/notes to 1 decimal place
    if (key === "note" && value != null) {
        return Number(value).toFixed(1);
    }

    // DEFAULT: Return the value as-is or empty string if falsy
    return value ?? "";
}