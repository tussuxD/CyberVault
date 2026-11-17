import { Router, type Response } from "express";
import { activitiesTable, alertsTable, db, logsTable } from "@workspace/db";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";
import { ML_SERVICE_URL, MlServiceError, mlRequest } from "../lib/mlClient";

import { verifyAlertEvidence } from "../lib/evidence";

const router = Router();

/**
 * Maps failures from the Python service onto a consistent JSON error shape.
 */
function sendMlError(res: Response, error: unknown) {
  if (error instanceof MlServiceError) {
    res.status(error.statusCode).json({
      error: error.message,
      details: error.details ?? null,
      serviceUrl: ML_SERVICE_URL,
    });
    return;
  }

  res.status(500).json({
    error: error instanceof Error ? error.message : "Unexpected ML service error",
  });
}

// ML endpoints are used by authenticated dashboard pages only.
router.use(authMiddleware);

// GET /api/ml/health
router.get("/ml/health", async (_req, res) => {
  try {
    const health = await mlRequest<{ status: string; service?: string }>(
      "/health",
    );
    res.json({
      ...health,
      online: true,
      serviceUrl: ML_SERVICE_URL,
    });
  } catch (error) {
    if (error instanceof MlServiceError && error.statusCode === 503) {
      res.status(503).json({
        status: "offline",
        online: false,
        serviceUrl: ML_SERVICE_URL,
        error: error.message,
        details: error.details ?? null,
      });
      return;
    }
    sendMlError(res, error);
  }
});

// GET /api/ml/model-info
router.get("/ml/model-info", async (_req, res) => {
  try {
    const info = await mlRequest<Record<string, unknown>>("/model-info");
    res.json(info);
  } catch (error) {
    sendMlError(res, error);
  }
});

// POST /api/ml/predict
// Accepts a raw CIC-IDS2017 flow object or { flow: {...} } and forwards it.
router.post("/ml/predict", async (req: AuthRequest, res) => {
  try {
    const result = await mlRequest<{ prediction: Record<string, unknown> }>("/predict", {
      method: "POST",
      body: req.body,
    });
    const prediction = result.prediction;
    const isAttack = prediction.threat === "ATTACK";
    const category = typeof prediction.attack_type === "string" && prediction.attack_type.trim()
      ? prediction.attack_type
      : "Unclassified attack";
    const reportedSeverity = String(prediction.severity ?? "").toLowerCase();
    const severity = ["critical", "high", "medium", "low"].includes(reportedSeverity)
      ? reportedSeverity
      : "medium";
    const message = isAttack ? `Detected ${category}` : "Network flow classified as benign";
    const description = `ML alert #${prediction.alert_id} · risk ${prediction.risk_score ?? "unknown"}`;

    await db.transaction(async (tx) => {
      await tx.insert(logsTable).values({
        level: isAttack ? "warning" : "info",
        source: "ML Detection",
        message,
        details: description,
        userId: req.userId,
      });
      if (isAttack) {
        const [alert] = await tx.insert(alertsTable).values({
          title: message,
          description,
          source: "ML Detection",
          severity,
          attackType: category,
        }).returning({ id: alertsTable.id });
        await tx.insert(activitiesTable).values({
          type: "alert_created",
          message,
          severity,
          userId: req.userId,
          resourceType: "alert",
          resourceId: alert.id,
        });
      }
    });

    res.json(result);
  } catch (error) {
    sendMlError(res, error);
  }
});

// GET /api/ml/alerts
router.get("/ml/alerts", async (_req, res) => {
  try {
    const alerts = await mlRequest<Record<string, unknown>>("/alerts");
    res.json(alerts);
  } catch (error) {
    sendMlError(res, error);
  }
});

// GET /api/ml/alerts/:id
router.get("/ml/alerts/:id", async (req, res) => {
  try {
    const alert = await mlRequest<Record<string, unknown>>(
      `/alerts/${encodeURIComponent(String(req.params["id"]))}`,
    );
    res.json(alert);
  } catch (error) {
    sendMlError(res, error);
  }
});

// GET /api/ml/alerts/:id/evidence
router.get("/ml/alerts/:id/evidence", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const id = req.params["id"];
  const alertId = Number(id);
  if (!id || !/^[1-9][0-9]*$/.test(id) || !Number.isSafeInteger(alertId)) {
    res.status(400).json({ error: "Invalid alert ID" });
    return;
  }

  let alert: Record<string, unknown>;
  try {
    ({ alert } = await mlRequest<{ alert: Record<string, unknown> }>(`/alerts/${alertId}`));
  } catch (error) {
    sendMlError(res, error);
    return;
  }

  if (!alert || alert.id !== alertId) {
    res.status(502).json({ error: "ML service returned an invalid alert" });
    return;
  }

  try {
    res.json(await verifyAlertEvidence(alertId, alert));
  } catch {
    res.status(503).json({ error: "Sepolia evidence is unavailable. Try again later." });
  }
});

// PUT /api/ml/alerts/:id/status
router.put("/ml/alerts/:id/status", async (req, res) => {
  const status = String(req.body?.status ?? "").toUpperCase();
  const allowed = ["NEW", "INVESTIGATING", "RESOLVED"];

  if (!allowed.includes(status)) {
    res.status(400).json({
      error: "Invalid status",
      allowedStatuses: allowed,
    });
    return;
  }

  try {
    const updated = await mlRequest<Record<string, unknown>>(
      `/alerts/${encodeURIComponent(String(req.params["id"]))}/status`,
      { method: "PUT", body: { status } },
    );
    res.json(updated);
  } catch (error) {
    sendMlError(res, error);
  }
});

export default router;
