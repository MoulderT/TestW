"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchHistory,
  type ScenarioRunType,
  runScenario,
} from "@/lib/api";

const grafanaPublicBase = (() => {
  const raw = process.env.NEXT_PUBLIC_GRAFANA_URL?.trim();
  return raw ? raw.replace(/\/$/, "") : "http://localhost:3010";
})();

const lokiExploreHref = `${grafanaPublicBase}/explore`;

const sentryProjectHref =
  process.env.NEXT_PUBLIC_SENTRY_PROJECT_URL?.trim() || "https://sentry.io/";

const scenarioSelectChevron = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
)}")`;

const schema = z.object({
  type: z.enum([
    "success",
    "validation_error",
    "system_error",
    "slow_request",
    "teapot",
  ] satisfies [ScenarioRunType, ...ScenarioRunType[]]),
  runName: z.string().max(200).optional(),
});

type FormValues = z.infer<typeof schema>;

function statusBadgeClass(status: string): string {
  if (status === "completed")
    return "border-emerald-800 bg-emerald-950 text-emerald-300 hover:bg-emerald-950";
  if (status === "failed")
    return "border-amber-800 bg-amber-950 text-amber-200 hover:bg-amber-950";
  if (status === "error")
    return "border-red-900 bg-red-950 text-red-300 hover:bg-red-950";
  return "border-zinc-700 bg-zinc-900 text-zinc-300";
}

export default function Home() {
  const qc = useQueryClient();
  const history = useQuery({
    queryKey: ["scenario-history"],
    queryFn: fetchHistory,
    refetchInterval: 8_000,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "success", runName: "" },
  });

  const mutation = useMutation({
    mutationFn: (v: FormValues) =>
      runScenario({
        type: v.type,
        name: v.runName?.trim() ? v.runName.trim() : undefined,
      }),
    onSuccess: (result) => {
      void qc.invalidateQueries({ queryKey: ["scenario-history"] });
      if (result.outcome === "ok") {
        toast.success(`Success — ${result.data.duration} ms`);
      } else {
        toast.success('{ "signal": 42, "message": "I\'m a teapot" }');
      }
    },
    onError: (err: Error) => {
      void qc.invalidateQueries({ queryKey: ["scenario-history"] });
      toast.error(err.message);
    },
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Signal Lab</h1>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle>Run scenario</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                autoComplete="off"
                onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
              >
                <div className="space-y-2">
                  <Label htmlFor="type">Тип сценария</Label>
                  <select
                    id="type"
                    className="h-10 w-full cursor-pointer appearance-none rounded-md border border-zinc-700 bg-zinc-950 bg-no-repeat pl-3 pr-10 text-sm text-zinc-100"
                    style={{
                      backgroundImage: scenarioSelectChevron,
                      backgroundPosition: "right 0.75rem center",
                      backgroundSize: "1rem 1rem",
                    }}
                    {...form.register("type")}
                  >
                    <option value="success">success</option>
                    <option value="validation_error">validation_error</option>
                    <option value="system_error">system_error</option>
                    <option value="slow_request">slow_request</option>
                    <option value="teapot">teapot</option>
                  </select>
                  {form.formState.errors.type && (
                    <p className="text-sm text-red-400">
                      {form.formState.errors.type.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scenario-run-label">Произвольное название (опционально)</Label>
                  <Input
                    id="scenario-run-label"
                    autoComplete="off"
                    className="bg-zinc-950 border-zinc-700"
                    {...form.register("runName")}
                  />
                </div>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending &&
                  mutation.variables?.type === "slow_request"
                    ? "Running…"
                    : "Run Scenario"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle>Observability links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <a
                  className="text-sky-400 hover:underline"
                  href={grafanaPublicBase}
                  target="_blank"
                  rel="noreferrer"
                >
                  Grafana
                </a>
              </p>
              <p>
                <a
                  className="text-sky-400 hover:underline"
                  href={sentryProjectHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  Sentry
                </a>
              </p>
              <p>
                <a
                  className="text-sky-400 hover:underline"
                  href={lokiExploreHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  Loki
                </a>
              </p>
              <p>
                <a
                  className="text-sky-400 hover:underline"
                  href={process.env.NEXT_PUBLIC_PROMETHEUS_URL ?? "http://localhost:9090"}
                  target="_blank"
                  rel="noreferrer"
                >
                  Prometheus
                </a>
              </p>
              <p>
                <a
                  className="text-sky-400 hover:underline text-sm"
                  href={process.env.NEXT_PUBLIC_METRICS_URL ?? "http://localhost:3001/metrics"}
                  target="_blank"
                  rel="noreferrer"
                >
                  Метрики API (Prometheus)
                </a>
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Run history</CardTitle>
            <CardDescription>Последние 20 запусков</CardDescription>
          </CardHeader>
          <CardContent>
            {history.isLoading && <p className="text-sm text-zinc-500">Loading…</p>}
            {history.isError && (
              <p className="text-sm text-red-400">{(history.error as Error).message}</p>
            )}
            {history.data && history.data.length === 0 && (
              <p className="text-sm text-zinc-500">Пока пусто — запустите сценарий.</p>
            )}
            {history.data && history.data.length > 0 && (
              <ul className="space-y-3 text-sm">
                {history.data.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3"
                  >
                    <Badge variant="outline" className={statusBadgeClass(row.status)}>
                      {row.status}
                    </Badge>
                    <span className="font-mono text-zinc-200">{row.type}</span>
                    <span className="text-zinc-400">
                      {row.duration != null ? `${row.duration} ms` : "—"}
                    </span>
                    <span className="text-zinc-500 text-xs ml-auto">
                      {new Date(row.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
