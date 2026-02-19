import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Bekannte View-Namen aus der App
const VIEWS = ["lernende", "kurse", "dozenten", "lehrbetriebe", "countries", "kurse_lernende", "lehrbetriebe_lernende"];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const firstSegment = pathname.split("/")[1];

    // Wenn die URL mit einem bekannten View beginnt → intern auf / umleiten
    // aber die URL im Browser bleibt /lernende, /kurse/create, /lernende/5/edit
    if (VIEWS.includes(firstSegment)) {
        return NextResponse.rewrite(new URL("/", request.url));
    }
}

export const config = {
    // Alle Pfade ausser Next.js-interne (_next, api, statische Dateien)
    matcher: ["/((?!_next|api|favicon.ico).*)"],
};