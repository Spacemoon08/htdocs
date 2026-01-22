import {
    Database,
    Users,
    Building2,
    GraduationCap,
    BookMarked,
    Briefcase,
    ClipboardList,
} from "lucide-react";

export const viewConfig = {
    countries: { label: "Länder", icon: Database, color: "#3b82f6" },
    lehrbetriebe: { label: "Lehrbetriebe", icon: Building2, color: "#a855f7" },
    lernende: { label: "Lernende", icon: Users, color: "#22c55e" },
    dozenten: { label: "Dozenten", icon: GraduationCap, color: "#f97316" },
    kurse: { label: "Kurse", icon: BookMarked, color: "#ec4899" },
    lehrbetriebe_lernende: { label: "Lehrverhältnisse", icon: Briefcase, color: "#6366f1" },
    kurse_lernende: { label: "Kursanmeldungen", icon: ClipboardList, color: "#14b8a6" },
};