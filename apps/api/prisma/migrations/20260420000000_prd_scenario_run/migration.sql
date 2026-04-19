-- Align ScenarioRun with PRD 001 / 002 (breaking change)

DROP TABLE IF EXISTS "ScenarioRun" CASCADE;

CREATE TABLE "ScenarioRun" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "duration" INTEGER,
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScenarioRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ScenarioRun_type_idx" ON "ScenarioRun"("type");
CREATE INDEX "ScenarioRun_createdAt_idx" ON "ScenarioRun"("createdAt");
