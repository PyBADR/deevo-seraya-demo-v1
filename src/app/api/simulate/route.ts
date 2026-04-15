// ─────────────────────────────────────────────────────────────
// POST /api/simulate — Thin controller for scenario simulation
//
// Responsibilities: request parsing → service call → response.
// All business logic lives in simulationService.ts.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { handleSimulation } from "@/lib/services/simulationService";
import type { SimulationRequest } from "@/types/simulation";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SimulationRequest;

    const result = await handleSimulation(body);

    if (!result.success && !result.data) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json(
      { error: "Request parsing failed" },
      { status: 400 }
    );
  }
}
