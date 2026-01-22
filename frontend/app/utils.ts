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
    return value ?? "";
}