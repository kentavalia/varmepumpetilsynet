import { Express } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { storage } from "./storage";
import { z } from "zod";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      role: string;
    }
    interface Request {
      session: session.Session & Partial<session.SessionData> & {
        userId?: number;
      };
    }
  }
}

const loginSchema = z.object({
  username: z.string().min(1, "Brukernavn er påkrevd"),
  password: z.string().min(1, "Passord er påkrevd"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Brukernavn må være minst 3 tegn"),
  email: z.string().email("Ugyldig e-postadresse"),
  password: z.string().min(6, "Passord må være minst 6 tegn"),
  firstName: z.string().min(1, "Fornavn er påkrevd"),
  lastName: z.string().min(1, "Etternavn er påkrevd"),
  companyName: z.string().min(1, "Firmanavn er påkrevd"),
  orgNumber: z.string().min(9, "Organisasjonsnummer må være 9 siffer").max(9, "Organisasjonsnummer må være 9 siffer"),
  phone: z.string().min(8, "Telefonnummer er påkrevd"),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  website: z.string().optional(),
  role: z.enum(["customer", "installer", "admin"]).default("installer"),
});

const resetPasswordSchema = z.object({
  email: z.string().email("Ugyldig e-postadresse"),
});

const newPasswordSchema = z.object({
  token: z.string().min(1, "Token er påkrevd"),
  password: z.string().min(6, "Passord må være minst 6 tegn"),
});

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "fallback-secret-change-in-production";
  
  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax",
    },
  }));

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Ugyldig brukernavn eller passord" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Ugyldig brukernavn eller passord" });
      }

      // Check if installer is active (if user is an installer)
      if (user.role === 'installer') {
        const installer = await storage.getInstaller(user.id);
        if (installer && !installer.active) {
          return res.status(403).json({ message: "Kontoen din er deaktivert. Ta kontakt med support." });
        }
      }

      // Store user in session
      req.session.userId = user.id;
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Innlogging feilet" });
    }
  });

  // Register endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Brukernavn er allerede i bruk" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "E-post er allerede i bruk" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // If registering as installer, create installer profile with company info
      if (userData.role === 'installer') {
        await storage.createInstaller({
          userId: user.id,
          companyName: userData.companyName,
          orgNumber: userData.orgNumber,
          contactPerson: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          phone: userData.phone,
          address: userData.address || "",
          postalCode: userData.postalCode || "",
          city: userData.city || "",
          website: userData.website || "",
          approved: true, // Auto-approve new installers
          active: true, // Make them active immediately
        });
      }

      // Don't auto-login, just return user data for confirmation
      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registrering feilet" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Utlogging feilet" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logget ut" });
    });
  });

  // Get current user endpoint
  app.get("/api/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Ikke innlogget" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "Bruker ikke funnet" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Kunne ikke hente brukerinformasjon" });
    }
  });

  // Reset password request
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { email } = resetPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not
        return res.json({ message: "Hvis e-posten eksisterer, har du mottatt en reset-lenke" });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await storage.setResetToken(user.id, resetToken, resetTokenExpiry);

      // In a real app, you would send an email here
      console.log(`Reset token for ${email}: ${resetToken}`);
      
      res.json({ message: "Hvis e-posten eksisterer, har du mottatt en reset-lenke" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Kunne ikke behandle forespørsel" });
    }
  });

  // Set new password with token
  app.post("/api/new-password", async (req, res) => {
    try {
      const { token, password } = newPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByResetToken(token);
      if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        return res.status(400).json({ message: "Ugyldig eller utløpt token" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Update password and clear reset token
      await storage.updatePassword(user.id, hashedPassword);
      await storage.clearResetToken(user.id);

      res.json({ message: "Passord oppdatert" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("New password error:", error);
      res.status(500).json({ message: "Kunne ikke oppdatere passord" });
    }
  });

  // Note: Global auth middleware is removed
  // Individual routes now use requireAuth middleware explicitly
}