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
    // Foreign key references
    if (key === "nr_land")
        return context.countries.find((x) => x.id_country === value)?.country;
    if (key === "nr_lehrbetrieb")
        return context.lehrbetriebe.find((x) => x.id_lehrbetrieb === value)?.firma;
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

    // Gender display
    if (key === "geschlecht") {
        if (value === "m") return "Männlich";
        if (value === "w") return "Weiblich";
        if (value === "d") return "Divers";
        return value;
    }

    // Date formatting
    if (key === "birthdate" || key === "start" || key === "ende" ||
        key === "startdatum" || key === "enddatum") {
        if (!value) return "";
        try {
            const date = new Date(value);
            return date.toLocaleDateString("de-DE");
        } catch {
            return value;
        }
    }

    // Number formatting for grades
    if (key === "note" && value != null) {
        return Number(value).toFixed(1);
    }

    return value ?? "";
}