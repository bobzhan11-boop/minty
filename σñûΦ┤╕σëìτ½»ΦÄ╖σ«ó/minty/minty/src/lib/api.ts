import { NextResponse } from "next/server";

/** Unified response envelope: { code, message, data } (§5.1). */
export function ok<T>(data: T, message = "success") {
  return NextResponse.json({ code: 200, message, data });
}

export function fail(code: number, message: string, data: unknown = null) {
  return NextResponse.json({ code, message, data }, { status: code });
}
