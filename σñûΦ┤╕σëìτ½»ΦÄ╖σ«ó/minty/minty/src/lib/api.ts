import { NextResponse } from "next/server";

/** Unified response envelope: { code, message, data } (§5.1). */
export function ok<T>(data: T, message = "success") {
  return NextResponse.json({ code: 200, message, data });
}

export function fail(code: number, message: string, data: unknown = null) {
  return NextResponse.json({ code, message, data }, { status: code });
}

/**
 * Handler for unsupported HTTP methods on a route. Export it for every verb a
 * route does NOT implement so wrong-method requests return the standard
 * { code, message, data } envelope instead of the framework's empty-body 405.
 */
export function methodNotAllowed() {
  return fail(405, "Method Not Allowed");
}
