export interface Country {
    id_country: number;
    country: string;
}

export interface Lehrbetrieb {
    id_lehrbetrieb: number;
    firma: string;
    strasse?: string;
    plz?: string;
    ort?: string;
}

export interface Lernende {
    id_lernende: number;
    vorname: string;
    nachname: string;
}

export interface Dozent {
    id_dozent: number;
    vorname: string;
    nachname: string;
}

export interface Kurs {
    id_kurs: number;
    kursthema?: string;
}

export interface LehrbetriebLernende {
    id_lehrbetriebe_lernende: number;
    nr_lehrbetrieb: number;
    nr_lernende: number;
    start?: string;
    ende?: string;
    beruf?: string;
}

export interface KursLernende {
    id_kurse_lernende: number;
    nr_kurs: number;
    nr_lernende: number;
    note?: number;
}

export type DataItem =
    | Country
    | Lehrbetrieb
    | Lernende
    | Dozent
    | Kurs
    | LehrbetriebLernende
    | KursLernende;

export type ViewType =
    | "countries"
    | "lehrbetriebe"
    | "lernende"
    | "dozenten"
    | "kurse"
    | "lehrbetriebe_lernende"
    | "kurse_lernende";

export interface Field {
    name: string;
    label: string;
    type: "text" | "number" | "date" | "email" | "select" | "textarea";
    required?: boolean;
    options?: any[];
    valueKey?: string;
    labelKey?: string;
}