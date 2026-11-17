import { Router } from "express";
import { eq, and, ilike, count, gte, lte, desc } from "drizzle-orm";
import { db, logsTable } from "@workspace/db";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";

const router = Router();
router.use(authMiddleware);

function formatLog(l: typeof logsTable.$inferSelect) {
  return {
    id: l.id,
    level: l.level,
    message: l.message,
    source: l.source,
    sourceIp: l.sourceIp,
    userId: l.userId,
    details: l.details,
    createdAt: l.createdAt.toISOString(),
  };
}

// GET /api/logs
router.get("/logs", async (req: AuthRequest, res) => {
  const { level, source, search, page = "1", limit = "50", startDate, endDate } = req.query as Record<string, string>;
  const pageNum = parseInt(page) || 1;
  const limitNum = Math.min(parseInt(limit) || 50, 200);
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  if (level) conditions.push(eq(logsTable.level, level));
  if (source) conditions.push(ilike(logsTable.source, `%${source}%`));
  if (search) conditions.push(ilike(logsTable.message, `%${search}%`));
  if (startDate) conditions.push(gte(logsTable.createdAt, new Date(startDate)));
  if (endDate) conditions.push(lte(logsTable.createdAt, new Date(endDate)));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, [{ total }]] = await Promise.all([
    db.select().from(logsTable).where(whereClause).orderBy(desc(logsTable.createdAt), desc(logsTable.id)).limit(limitNum).offset(offset),
    db.select({ total: count() }).from(logsTable).where(whereClause),
  ]);

  res.json({
    data: data.map(formatLog),
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

// GET /api/logs/:id
router.get("/logs/:id", async (req: AuthRequest, res) => {
  const id = parseInt(String(req.params["id"]));
  const [log] = await db.select().from(logsTable).where(eq(logsTable.id, id)).limit(1);
  if (!log) { res.status(404).json({ error: "Log not found" }); return; }
  res.json(formatLog(log));
});

export default router;
