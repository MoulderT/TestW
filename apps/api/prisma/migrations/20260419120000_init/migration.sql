-- CreateTable
CREATE TABLE "ScenarioRun" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "ok" BOOLEAN NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScenarioRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScenarioRun_scenarioId_idx" ON "ScenarioRun"("scenarioId");

-- CreateIndex
CREATE INDEX "ScenarioRun_createdAt_idx" ON "ScenarioRun"("createdAt");
