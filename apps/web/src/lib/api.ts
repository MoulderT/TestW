const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export type ScenarioRunType =
  | "success"
  | "validation_error"
  | "system_error"
  | "slow_request"
  | "teapot";

export type RunScenarioPayload = {
  type: ScenarioRunType;
  name?: string;
};

export type RunScenarioOk = {
  id: string;
  status: "completed";
  duration: number;
};

export type RunScenarioResult =
  | { outcome: "ok"; data: RunScenarioOk }
  | { outcome: "teapot"; signal: number; message: string };

function parseErrorMessage(data: Record<string, unknown>, status: number): string {
  const m = data.message;
  if (typeof m === "string") return m;
  if (Array.isArray(m) && m.every((x) => typeof x === "string")) return m.join(", ");
  return `HTTP ${status}`;
}

export async function runScenario(
  payload: RunScenarioPayload,
): Promise<RunScenarioResult> {
  const res = await fetch(`${apiBase}/scenarios/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (res.status === 418) {
    return {
      outcome: "teapot",
      signal: typeof data.signal === "number" ? data.signal : 42,
      message: typeof data.message === "string" ? data.message : "I'm a teapot",
    };
  }

  if (!res.ok) {
    throw new Error(parseErrorMessage(data, res.status));
  }

  const id = typeof data.id === "string" ? data.id : "";
  const status = data.status === "completed" ? "completed" : "completed";
  const duration = typeof data.duration === "number" ? data.duration : 0;
  return { outcome: "ok", data: { id, status, duration } };
}

export type HistoryRow = {
  id: string;
  type: string;
  status: string;
  duration: number | null;
  error: string | null;
  createdAt: string;
};

export async function fetchHistory(): Promise<HistoryRow[]> {
  const res = await fetch(`${apiBase}/scenarios/history`, { cache: "no-store" });
  if (!res.ok) throw new Error(`history ${res.status}`);
  return res.json();
}
