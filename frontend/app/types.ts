/**
 * types.ts
 *
 * TypeScript type definitions for all entities used in the frontend.
 *
 * Philosophy:
 * - Each interface mirrors a database table exactly. Property names match column names.
 * - All ID fields (primary keys) are required and non-optional.
 * - Most other fields are optional (?) since they may be null in the database or
 *   may not be provided when creating records.
 * - String dates are stored in ISO 8601 format (YYYY-MM-DD) for consistency.
 * - Enums like `geschlecht` are represented as literal unions of the allowed values.
 *
 * Usage:
 * - Import types to provide type safety in components and API calls.
 * - Use `DataItem` union type when a function accepts any entity type.
 * - Use `ViewType` when identifying which table/endpoint to query.
 */

/**
 * Country
 * Database table: tbl_countries
 * Purpose: List of countries used as foreign key references in Lernende and Dozenten.
 */
export interface Country {
    id_country: number;      // Primary key
    country: string;         // Country name (e.g. 'Schweiz', 'Deutschland')
}

/**
 * Lehrbetrieb (apprenticeship company)
 * Database table: tbl_lehrbetriebe
 * Purpose: Companies where learners do their apprenticeship.
 */
export interface Lehrbetrieb {
    id_lehrbetrieb: number;  // Primary key
    firma: string;           // Company/firm name (required)
    strasse?: string;        // Street address
    plz?: string;            // Postal code
    ort?: string;            // City/location
}

/**
 * Lernende (learner/apprentice)
 * Database table: tbl_lernende
 * Purpose: Individual learner/apprentice records with personal details.
 * Note: nr_land is a foreign key to tbl_countries.
 */
export interface Lernende {
    id_lernende: number;     // Primary key
    vorname: string;         // First name (required)
    nachname: string;        // Last name (required)
    strasse?: string;        // Street address
    plz?: string;            // Postal code
    ort?: string;            // City/location
    nr_land?: number;        // Foreign key to Country
    geschlecht?: 'm' | 'w' | 'd';  // Gender: male, female, diverse
    telefon?: string;        // Landline phone
    handy?: string;          // Mobile phone
    email?: string;          // Work email
    email_privat?: string;   // Personal email
    birthdate?: string;      // Date of birth (ISO format: YYYY-MM-DD)
}

/**
 * Dozent (instructor/teacher)
 * Database table: tbl_dozenten
 * Purpose: Instructor records for courses.
 * Note: nr_land is a foreign key to tbl_countries.
 */
export interface Dozent {
    id_dozent: number;       // Primary key
    vorname: string;         // First name (required)
    nachname: string;        // Last name (required)
    strasse?: string;        // Street address
    plz?: string;            // Postal code
    ort?: string;            // City/location
    nr_land?: number;        // Foreign key to Country
    geschlecht?: 'm' | 'w' | 'd';  // Gender: male, female, diverse
    telefon?: string;        // Landline phone
    handy?: string;          // Mobile phone
    email?: string;          // Email address
    birthdate?: string;      // Date of birth (ISO format: YYYY-MM-DD)
}

/**
 * Kurs (course)
 * Database table: tbl_kurse
 * Purpose: Training courses offered to learners.
 * Note: nr_dozent is a foreign key to tbl_dozenten.
 */
export interface Kurs {
    id_kurs: number;         // Primary key
    kursnummer?: string;     // Course number/identifier
    kursthema?: string;      // Course topic/title
    inhalt?: string;         // Course content/description
    nr_dozent?: number;      // Foreign key to Dozent (instructor)
    startdatum?: string;     // Start date (ISO format: YYYY-MM-DD)
    enddatum?: string;       // End date (ISO format: YYYY-MM-DD)
    dauer?: number;          // Duration in days
}

/**
 * LehrbetriebLernende (apprenticeship assignment)
 * Database table: tbl_lehrbetriebe_lernende
 * Purpose: N:M junction table linking learners to companies where they work.
 * Note: Foreign keys: nr_lehrbetrieb (tbl_lehrbetriebe), nr_lernende (tbl_lernende).
 */
export interface LehrbetriebLernende {
    id_lehrbetriebe_lernende: number;  // Primary key
    nr_lehrbetrieb: number;            // Foreign key to Lehrbetrieb (required)
    nr_lernende: number;               // Foreign key to Lernende (required)
    start?: string;                    // Start date of apprenticeship (ISO format)
    ende?: string;                     // End date of apprenticeship (ISO format)
    beruf?: string;                    // Job title/profession
}

/**
 * KursLernende (course enrollment)
 * Database table: tbl_kurse_lernende
 * Purpose: N:M junction table linking learners to courses they take.
 * Stores the grade/note for each learner in a course.
 * Note: Foreign keys: nr_kurs (tbl_kurse), nr_lernende (tbl_lernende).
 */
export interface KursLernende {
    id_kurse_lernende: number;  // Primary key
    nr_kurs: number;            // Foreign key to Kurs (required)
    nr_lernende: number;        // Foreign key to Lernende (required)
    note?: number;              // Grade/score (scale: typically 1-6 in Swiss system)
}

/**
 * DataItem
 * Union type of all possible entity types.
 * Use this when writing a function that accepts any entity without knowing which one.
 * Example: function processRecord(item: DataItem) { ... }
 */
export type DataItem =
    | Country
    | Lehrbetrieb
    | Lernende
    | Dozent
    | Kurs
    | LehrbetriebLernende
    | KursLernende;

/**
 * ViewType
 * Literal union of all possible view/table identifiers used in the frontend.
 * Maps to API endpoints and database table names.
 * Example: const view: ViewType = 'lernende'
 */
export type ViewType =
    | "countries"
    | "lehrbetriebe"
    | "lernende"
    | "dozenten"
    | "kurse"
    | "lehrbetriebe_lernende"
    | "kurse_lernende";

/**
 * Field
 * Definition of a form field used by FormModal and NestedFormModal.
 *
 * Properties:
 * - name: database column name or field identifier
 * - label: human-readable label for the form (e.g. "E-Mail")
 * - type: input type; controls which HTML element and validation is used
 * - required: if true, displays a red asterisk (*) and may trigger validation
 * - options: array of available choices for select-type fields
 * - valueKey: for options, which property holds the value (e.g. 'id_country')
 * - labelKey: for options, which property holds the display label (e.g. 'country')
 */
export interface Field {
    name: string;
    label: string;
    type: "text" | "number" | "date" | "email" | "select" | "textarea";
    required?: boolean;
    options?: any[];
    valueKey?: string;
    labelKey?: string;
}