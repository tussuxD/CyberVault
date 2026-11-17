import { Router } from "express";
import { eq, and, ilike, count, desc } from "drizzle-orm";
import { db, alertsTable, activitiesTable } from "@workspace/db";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";

const router = Router();
router.use(authMiddleware);

function formatAlert(a: typeof alertsTable.$inferSelect) {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    severity: a.severity,
    status: a.status,
    source: a.source,
    sourceIp: a.sourceIp,
    targetIp: a.targetIp,
    deviceId: a.deviceId,
    deviceName: a.deviceName,
    attackType: a.attackType,
    mitreTactic: a.mitreTactic,
    resolvedAt: a.resolvedAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
  };
}

// GET /api/alerts
router.get("/alerts", async (req: AuthRequest, res) => {
  const { severity, status, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page) || 1;
  const limitNum = Math.min(parseInt(limit) || 20, 100);
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  if (severity) conditions.push(eq(alertsTable.severity, severity));
  if (status) conditions.push(eq(alertsTable.status, status));
  if (search) conditions.push(ilike(alertsTable.title, `%${search}%`));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, [{ total }]] = await Promise.all([
    db.select().from(alertsTable).where(whereClause).orderBy(desc(alertsTable.createdAt), desc(alertsTable.id)).limit(limitNum).offset(offset),
    db.select({ total: count() }).from(alertsTable).where(whereClause),
  ]);

  const [
    [{ criticalCount }], [{ highCount }], [{ mediumCount }], [{ lowCount }]
  ] = await Promise.all([
    db.select({ criticalCount: count() }).from(alertsTable).where(eq(alertsTable.severity, "critical")),
    db.select({ highCount: count() }).from(alertsTable).where(eq(alertsTable.severity, "high")),
    db.select({ mediumCount: count() }).from(alertsTable).where(eq(alertsTable.severity, "medium")),
    db.select({ lowCount: count() }).from(alertsTable).where(eq(alertsTable.severity, "low")),
  ]);

  res.json({
    data: data.map(formatAlert),
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
  });
});

// POST /api/alerts
router.post("/alerts", async (req: AuthRequest, res) => {
  const { title, severity, source, description, sourceIp, targetIp, deviceId, attackType, mitreTactic } = req.body;
  if (!title || !severity || !source) {
    res.status(400).json({ error: "title, severity, source required" });
    return;
  }
  const [alert] = await db.insert(alertsTable).values({ title, severity, source, description, sourceIp, targetIp, deviceId, attackType, mitreTactic, status: "open" }).returning();
  res.status(201).json(formatAlert(alert));
});

// GET /api/alerts/:id
router.get("/alerts/:id", async (req: AuthRequest, res) => {
  const id = parseInt(String(req.params["id"]));
  const [alert] = await db.select().from(alertsTable).where(eq(alertsTable.id, id)).limit(1);
  if (!alert) { res.status(404).json({ error: "Alert not found" }); return; }
  res.json(formatAlert(alert));
});

// PATCH /api/alerts/:id
router.patch("/alerts/:id", async (req: AuthRequest, res) => {
  const id = parseInt(String(req.params["id"]));
  const { status, description } = req.body;
  const [alert] = await db.update(alertsTable).set({ status, description, updatedAt: new Date() }).where(eq(alertsTable.id, id)).returning();
  if (!alert) { res.status(404).json({ error: "Alert not found" }); return; }
  res.json(formatAlert(alert));
});

// DELETE /api/alerts/:id
router.delete("/alerts/:id", async (req: AuthRequest, res) => {
  const id = parseInt(String(req.params["id"]));
  await db.delete(alertsTable).where(eq(alertsTable.id, id));
  res.json({ message: "Alert deleted" });
});

// PATCH /api/alerts/:id/resolve
router.patch("/alerts/:id/resolve", async (req: AuthRequest, res) => {
  const id = parseInt(String(req.params["id"]));
  const [alert] = await db.update(alertsTable).set({ status: "resolved", resolvedAt: new Date(), updatedAt: new Date() }).where(eq(alertsTable.id, id)).returning();
  if (!alert) { res.status(404).json({ error: "Alert not found" }); return; }
  await db.insert(activitiesTable).values({
    type: "alert_resolved",
    message: `Alert "${alert.title}" was resolved`,
    severity: alert.severity,
    resourceType: "alert",
    resourceId: alert.id,
  });
  res.json(formatAlert(alert));
});

export default router;
