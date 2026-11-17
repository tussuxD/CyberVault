import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, activitiesTable, notificationsTable } from "@workspace/db";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";

const router = Router();
router.use(authMiddleware);

// GET /api/activities
router.get("/activities", async (req: AuthRequest, res) => {
  const limit = Math.min(parseInt((req.query["limit"] as string) || "20"), 100);
  const data = await db.select().from(activitiesTable).orderBy(desc(activitiesTable.createdAt), desc(activitiesTable.id)).limit(limit);
  res.json(data.map(a => ({
    id: a.id, type: a.type, message: a.message, userId: a.userId,
    userName: a.userName, resourceType: a.resourceType, resourceId: a.resourceId,
    severity: a.severity, createdAt: a.createdAt.toISOString(),
  })));
});

// GET /api/activities/system-status
router.get("/activities/system-status", (_req, res) => {
  const now = new Date().toISOString();
  res.json([
    { name: "Threat Detection Engine", status: "operational", uptime: 99.97, lastCheck: now, responseTime: 12 },
    { name: "Firewall Service", status: "operational", uptime: 99.99, lastCheck: now, responseTime: 3 },
    { name: "SIEM Integration", status: "operational", uptime: 99.82, lastCheck: now, responseTime: 28 },
    { name: "Endpoint Agent (EDR)", status: "degraded", uptime: 97.34, lastCheck: now, responseTime: 145 },
    { name: "Vulnerability Scanner", status: "operational", uptime: 99.41, lastCheck: now, responseTime: 67 },
    { name: "Log Aggregator", status: "operational", uptime: 99.95, lastCheck: now, responseTime: 8 },
    { name: "Identity & Access Mgmt", status: "operational", uptime: 99.88, lastCheck: now, responseTime: 21 },
    { name: "Backup & Recovery", status: "maintenance", uptime: 98.12, lastCheck: now, responseTime: null },
  ]);
});

// GET /api/notifications
router.get("/notifications", async (req: AuthRequest, res) => {
  const unreadOnly = req.query["unreadOnly"] === "true";
  let query = db.select().from(notificationsTable).where(eq(notificationsTable.userId, req.userId!));
  const data = await query.orderBy(notificationsTable.createdAt).limit(50);
  const filtered = unreadOnly ? data.filter(n => !n.read) : data;
  res.json(filtered.map(n => ({
    id: n.id, title: n.title, message: n.message, type: n.type,
    read: n.read, severity: n.severity, linkUrl: n.linkUrl, createdAt: n.createdAt.toISOString(),
  })));
});

// PATCH /api/notifications/:id/read
router.patch("/notifications/:id/read", async (req: AuthRequest, res) => {
  const id = parseInt(String(req.params["id"]));
  await db.update(notificationsTable).set({ read: true }).where(eq(notificationsTable.id, id));
  res.json({ message: "Notification marked as read" });
});

export default router;
