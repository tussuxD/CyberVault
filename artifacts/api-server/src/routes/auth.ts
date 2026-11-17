import { Router } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable, settingsTable, notificationsTable } from "@workspace/db";
import { authMiddleware, signToken, type AuthRequest } from "../middlewares/auth";

const router = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
  };
}

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  await db.update(usersTable).set({ lastLogin: new Date() }).where(eq(usersTable.id, user.id));

  const token = signToken(user.id, user.email, user.role);
  res.json({ token, user: formatUser(user) });
});

// POST /api/auth/register
router.post("/auth/register", async (req, res) => {
  const { name, email, password, role = "analyst" } = req.body as { name: string; email: string; password: string; role?: string };
  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email and password required" });
    return;
  }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (existing) {
    res.status(409).json({ error: "User already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: process.env.NODE_ENV === "production" ? "analyst" : role,
  }).returning();

  // Create default settings
  await db.insert(settingsTable).values({ userId: user.id }).onConflictDoNothing();

  // Create welcome notification
  await db.insert(notificationsTable).values({
    userId: user.id,
    title: "Welcome to CyberVault",
    message: "Your account has been created successfully. Start monitoring your infrastructure.",
    type: "info",
  });

  const token = signToken(user.id, user.email, user.role);
  res.status(201).json({ token, user: formatUser(user) });
});

// POST /api/auth/forgot-password
router.post("/auth/forgot-password", async (_req, res) => {
  // In production this would send an email
  res.json({ message: "If that email address is in our system, you will receive a password reset link." });
});

// GET /api/auth/me
router.get("/auth/me", authMiddleware, async (req: AuthRequest, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

export default router;
