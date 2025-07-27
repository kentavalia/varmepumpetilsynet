import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertCustomerSchema, 
  insertHeatPumpSchema, 
  insertInstallerSchema, 
  insertServiceAreaSchema,
  insertContactSchema,
  insertServiceRequestSchema,
} from "@shared/schema";
import { ZodError } from "zod";
import bcrypt from 'bcrypt';

// Middleware to check authentication
function requireAuth(req: any, res: any, next: any) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Ikke autorisert" });
  }
  next();
}

// Middleware to check admin role
async function requireAdmin(req: any, res: any, next: any) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Ikke autorisert" });
  }
  
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Ikke tilgang" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ message: "Serverfeil" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint - works in all environments
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      message: 'VarmepumpeTilsynet API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Health check endpoint specifically for deployment services
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      message: 'VarmepumpeTilsynet API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Special health check path for Replit deployment (if needed)
  app.get('/.well-known/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      message: 'VarmepumpeTilsynet API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Setup authentication
  setupAuth(app);

  // Get service requests for installer (in their service areas)
  app.get('/api/service-requests/installer', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const installer = await storage.getInstaller(userId);
      
      if (!installer) {
        return res.status(404).json({ message: "Installatør ikke funnet" });
      }
      
      const serviceRequests = await storage.getServiceRequestsForInstaller(installer.id);
      res.json(serviceRequests);
    } catch (error) {
      console.error("Error fetching service requests for installer:", error);
      res.status(500).json({ message: "Kunne ikke hente serviceforespørsler" });
    }
  });

  // Service request API (anonymous, no auth required)
  app.post('/api/service-requests', async (req, res) => {
    try {
      const serviceRequestData = insertServiceRequestSchema.parse(req.body);
      const serviceRequest = await storage.createServiceRequest(serviceRequestData);
      res.status(201).json(serviceRequest);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Ugyldig data", errors: error.errors });
      } else {
        console.error("Error creating service request:", error);
        res.status(500).json({ message: "Kunne ikke opprette serviceforespørsel" });
      }
    }
  });

  // Get all service requests (admin only)
  app.get('/api/service-requests', requireAdmin, async (req: any, res) => {
    try {
      const serviceRequests = await storage.getAllServiceRequests();
      res.json(serviceRequests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ message: "Kunne ikke hente serviceforespørsler" });
    }
  });

  // Get service requests for logged-in installer
  app.get('/api/service-requests/for-installer', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const installer = await storage.getInstaller(userId);
      if (!installer) {
        return res.status(404).json({ message: "Installatør ikke funnet" });
      }

      const serviceRequests = await storage.getServiceRequestsForInstaller(installer.id);
      res.json(serviceRequests);
    } catch (error) {
      console.error("Error fetching service requests for installer:", error);  
      res.status(500).json({ message: "Kunne ikke hente serviceforespørsler" });
    }
  });

  // Installer expresses interest in service request
  app.post('/api/service-requests/:id/contact', requireAuth, async (req: any, res) => {
    try {
      const serviceRequestId = parseInt(req.params.id);
      const userId = req.session.userId;
      const installer = await storage.getInstaller(userId);
      
      if (!installer) {
        return res.status(404).json({ message: "Installatør ikke funnet" });
      }

      const contact = await storage.createServiceRequestContact(
        serviceRequestId, 
        installer.id, 
        req.body.notes
      );
      
      res.status(201).json(contact);
    } catch (error) {
      console.error("Error creating service request contact:", error);
      res.status(500).json({ message: "Kunne ikke registrere interesse" });
    }
  });

  // Update service request (admin only)
  app.put('/api/service-requests/:id', requireAdmin, async (req: any, res) => {
    try {
      const serviceRequestId = parseInt(req.params.id);
      const updateData = req.body;
      
      const updatedRequest = await storage.updateServiceRequest(serviceRequestId, updateData);
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating service request:", error);
      res.status(500).json({ message: "Kunne ikke oppdatere serviceforespørsel" });
    }
  });

  // Delete service request (admin only)
  app.delete('/api/service-requests/:id', requireAdmin, async (req: any, res) => {
    try {
      const serviceRequestId = parseInt(req.params.id);
      
      await storage.deleteServiceRequest(serviceRequestId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting service request:", error);
      res.status(500).json({ message: "Kunne ikke slette serviceforespørsel" });
    }
  });

  // Customer routes
  app.post('/api/customers', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const customerData = insertCustomerSchema.parse({
        ...req.body,
        userId,
      });
      
      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Ugyldig data", errors: error.errors });
      } else {
        console.error("Error creating customer:", error);
        res.status(500).json({ message: "Kunne ikke opprette kunde" });
      }
    }
  });

  app.get('/api/customers/me', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const customer = await storage.getCustomer(userId);
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Kunne ikke hente kunde" });
    }
  });

  app.get('/api/customers', requireAdmin, async (req: any, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Kunne ikke hente kunder" });
    }
  });

  // Installer routes
  app.post('/api/installers', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const installerData = insertInstallerSchema.parse({
        ...req.body,
        userId,
      });
      
      // Check if installer with same company name or org number already exists
      const existingByCompany = await storage.getInstallerByCompanyName(installerData.companyName);
      const existingByOrgNumber = await storage.getInstallerByOrgNumber(installerData.orgNumber);
      
      if (existingByCompany) {
        return res.status(400).json({ 
          message: `En installatør med firmanavnet "${installerData.companyName}" eksisterer allerede.` 
        });
      }
      
      if (existingByOrgNumber) {
        return res.status(400).json({ 
          message: `En installatør med organisasjonsnummer "${installerData.orgNumber}" eksisterer allerede.` 
        });
      }
      
      const installer = await storage.createInstaller(installerData);
      res.json(installer);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Ugyldig data", errors: error.errors });
      } else {
        console.error("Error creating installer:", error);
        res.status(500).json({ message: "Kunne ikke opprette installatør" });
      }
    }
  });

  app.get('/api/installers/me', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const installer = await storage.getInstaller(userId);
      res.json(installer);
    } catch (error) {
      console.error("Error fetching installer:", error);
      res.status(500).json({ message: "Kunne ikke hente installatør" });
    }
  });

  // Update installer profile via /me endpoint
  app.put('/api/installers/me', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const installer = await storage.getInstaller(userId);
      
      if (!installer) {
        return res.status(404).json({ message: "Installatør ikke funnet" });
      }

      const updateData = req.body;
      const updatedInstaller = await storage.updateInstaller(installer.id, updateData);
      res.json(updatedInstaller);
    } catch (error) {
      console.error("Error updating installer:", error);
      res.status(500).json({ message: "Kunne ikke oppdatere installatør" });
    }
  });

  // Update installer profile
  app.put('/api/installers/profile', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const installer = await storage.getInstaller(userId);
      
      if (!installer) {
        return res.status(404).json({ message: "Installatør ikke funnet" });
      }

      const updateData = req.body;
      const updatedInstaller = await storage.updateInstaller(installer.id, updateData);
      res.json(updatedInstaller);
    } catch (error) {
      console.error("Error updating installer profile:", error);
      res.status(500).json({ message: "Kunne ikke oppdatere profil" });
    }
  });

  // Change user password
  app.put('/api/user/password', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Nåværende passord og nytt passord er påkrevd" });
      }

      if (newPassword.length < 3) {
        return res.status(400).json({ message: "Nytt passord må være minst 3 tegn" });
      }

      // Verify current password
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Bruker ikke funnet" });
      }

      const bcrypt = await import('bcrypt');
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Nåværende passord er feil" });
      }

      // Update password
      await storage.resetUserPassword(userId, newPassword);
      res.json({ message: "Passord endret" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Kunne ikke endre passord" });
    }
  });

  app.get('/api/installers', async (req, res) => {
    try {
      const installers = await storage.getAllInstallers();
      res.json(installers);
    } catch (error) {
      console.error("Error fetching installers:", error);
      res.status(500).json({ message: "Kunne ikke hente installatører" });
    }
  });

  // Get installers by municipality (public endpoint for customers)
  app.get('/api/installers/municipality/:municipality', async (req: any, res) => {
    try {
      const municipality = decodeURIComponent(req.params.municipality);
      const installers = await storage.getInstallersByMunicipality(municipality);
      res.json(installers);
    } catch (error) {
      console.error("Error fetching installers by municipality:", error);
      res.status(500).json({ message: "Kunne ikke hente installatører" });
    }
  });

  // Get installers by county (public endpoint for customers)
  app.get('/api/installers/county/:county', async (req: any, res) => {
    try {
      const county = decodeURIComponent(req.params.county);
      const installers = await storage.getInstallersByCounty(county);
      res.json(installers);
    } catch (error) {
      console.error("Error fetching installers by county:", error);
      res.status(500).json({ message: "Kunne ikke hente installatører" });
    }
  });

  app.get('/api/installers/pending', requireAdmin, async (req: any, res) => {
    try {
      const pendingInstallers = await storage.getPendingInstallers();
      res.json(pendingInstallers);
    } catch (error) {
      console.error("Error fetching pending installers:", error);
      res.status(500).json({ message: "Kunne ikke hente ventende installatører" });
    }
  });

  app.post('/api/installers/:id/approve', requireAdmin, async (req: any, res) => {
    try {
      const installerId = parseInt(req.params.id);
      const { approved } = req.body;
      
      const installer = await storage.updateInstallerApproval(installerId, approved);
      res.json(installer);
    } catch (error) {
      console.error("Error updating installer approval:", error);
      res.status(500).json({ message: "Kunne ikke oppdatere godkjenning" });
    }
  });

  // Delete installer (superadmin only)
  app.delete('/api/installers/:id', requireAdmin, async (req: any, res) => {
    try {
      const installerId = parseInt(req.params.id);
      
      await storage.deleteInstaller(installerId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting installer:", error);
      res.status(500).json({ message: "Kunne ikke slette installatør" });
    }
  });

  // Update installer information
  app.put('/api/installers/:id', requireAdmin, async (req: any, res) => {
    try {
      const installerId = parseInt(req.params.id);
      const updateData = req.body;
      
      const installer = await storage.updateInstaller(installerId, updateData);
      res.json(installer);
    } catch (error) {
      console.error("Error updating installer:", error);
      res.status(500).json({ message: "Kunne ikke oppdatere installatør" });
    }
  });

  // Delete installer
  app.delete('/api/installers/:id', requireAdmin, async (req: any, res) => {
    try {
      const installerId = parseInt(req.params.id);
      await storage.deleteInstaller(installerId);
      res.json({ message: "Installatør slettet" });
    } catch (error) {
      console.error("Error deleting installer:", error);
      res.status(500).json({ message: "Kunne ikke slette installatør" });
    }
  });

  // Reset user password (admin only)
  app.post("/api/admin/reset-password", requireAdmin, async (req: any, res) => {
    try {
      const { userId, newPassword } = req.body;
      
      if (!userId || !newPassword) {
        return res.status(400).json({ message: "Mangler userId eller newPassword" });
      }
      
      await storage.resetUserPassword(userId, newPassword);
      res.json({ message: "Passord oppdatert" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Kunne ikke endre passord" });
    }
  });

  // Heat pump routes
  app.post('/api/heat-pumps', requireAuth, async (req: any, res) => {
    try {
      const heatPumpData = insertHeatPumpSchema.parse(req.body);
      const heatPump = await storage.createHeatPump(heatPumpData);
      res.json(heatPump);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Ugyldig data", errors: error.errors });
      } else {
        console.error("Error creating heat pump:", error);
        res.status(500).json({ message: "Kunne ikke opprette varmepumpe" });
      }
    }
  });

  app.get('/api/heat-pumps/customer/:customerId', requireAuth, async (req: any, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const heatPumps = await storage.getHeatPumpsByCustomer(customerId);
      res.json(heatPumps);
    } catch (error) {
      console.error("Error fetching heat pumps:", error);
      res.status(500).json({ message: "Kunne ikke hente varmepumper" });
    }
  });

  // Service area routes
  app.post('/api/service-areas', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      
      // Get installer ID for this user
      const installer = await storage.getInstaller(userId);
      if (!installer) {
        return res.status(404).json({ message: "Installatør ikke funnet" });
      }
      
      const { serviceAreas: serviceAreasData } = req.body;
      
      if (!Array.isArray(serviceAreasData)) {
        return res.status(400).json({ message: "serviceAreas må være en array" });
      }
      
      // Get existing service areas to avoid duplicates
      const existingServiceAreas = await storage.getServiceAreasByInstaller(installer.id);
      const existingCombinations = new Set(
        existingServiceAreas.map(area => `${area.county}-${area.municipality}`)
      );
      
      // Create new service areas (only new ones, not duplicates)
      const createdServiceAreas = [];
      for (const serviceAreaData of serviceAreasData) {
        const combination = `${serviceAreaData.county}-${serviceAreaData.municipality}`;
        
        // Skip if this combination already exists
        if (existingCombinations.has(combination)) {
          continue;
        }
        
        const fullServiceAreaData = {
          ...serviceAreaData,
          installerId: installer.id,
        };
        const validatedData = insertServiceAreaSchema.parse(fullServiceAreaData);
        const serviceArea = await storage.createServiceArea(validatedData);
        createdServiceAreas.push(serviceArea);
      }
      
      res.json(createdServiceAreas);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Ugyldig data", errors: error.errors });
      } else {
        console.error("Error creating service areas:", error);
        res.status(500).json({ message: "Kunne ikke opprette serviceområder" });
      }
    }
  });

  app.get('/api/service-areas/me', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const installer = await storage.getInstaller(userId);
      if (!installer) {
        return res.status(404).json({ message: "Installatør ikke funnet" });
      }
      
      const serviceAreas = await storage.getServiceAreasByInstaller(installer.id);
      res.json(serviceAreas);
    } catch (error) {
      console.error("Error fetching service areas:", error);
      res.status(500).json({ message: "Kunne ikke hente serviceområder" });
    }
  });

  // Delete service area
  app.delete('/api/service-areas/:id', requireAuth, async (req: any, res) => {
    try {
      const serviceAreaId = parseInt(req.params.id);
      const userId = req.session.userId;
      const installer = await storage.getInstaller(userId);
      
      if (!installer) {
        return res.status(404).json({ message: "Installatør ikke funnet" });
      }

      // Verify the service area belongs to this installer
      const serviceArea = await storage.getServiceArea(serviceAreaId);
      if (!serviceArea || serviceArea.installerId !== installer.id) {
        return res.status(403).json({ message: "Ikke autorisert til å slette dette serviceområdet" });
      }

      await storage.deleteServiceArea(serviceAreaId);
      res.json({ message: "Serviceområde slettet" });
    } catch (error) {
      console.error("Error deleting service area:", error);
      res.status(500).json({ message: "Kunne ikke slette serviceområde" });
    }
  });

  app.get('/api/service-areas/installer/:installerId', requireAuth, async (req: any, res) => {
    try {
      const installerId = parseInt(req.params.installerId);
      const serviceAreas = await storage.getServiceAreasByInstaller(installerId);
      res.json(serviceAreas);
    } catch (error) {
      console.error("Error fetching service areas:", error);
      res.status(500).json({ message: "Kunne ikke hente serviceområder" });
    }
  });

  // Update service areas (bulk update/replace)
  app.put('/api/service-areas/me', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const installer = await storage.getInstaller(userId);
      if (!installer) {
        return res.status(404).json({ message: "Installatør ikke funnet" });
      }

      const { municipalities } = req.body;
      
      if (!Array.isArray(municipalities)) {
        return res.status(400).json({ message: "municipalities må være en array" });
      }

      console.log(`Updating service areas for installer ${installer.id}:`, municipalities);

      // Clear existing service areas for this installer
      await storage.clearServiceAreas(installer.id);

      // Create new service areas
      const serviceAreas = [];
      for (const municipality of municipalities) {
        const serviceAreaData = {
          installerId: installer.id,
          county: municipality.county,
          municipality: municipality.municipality,
        };
        
        const validatedData = insertServiceAreaSchema.parse(serviceAreaData);
        const serviceArea = await storage.createServiceArea(validatedData);
        serviceAreas.push(serviceArea);
      }

      console.log(`Created ${serviceAreas.length} service areas for installer ${installer.id}`);
      res.json(serviceAreas);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Validation error:", error.errors);
        res.status(400).json({ message: "Ugyldig data", errors: error.errors });
      } else {
        console.error("Error updating service areas:", error);
        res.status(500).json({ message: "Kunne ikke oppdatere serviceområder" });
      }
    }
  });

  // Contact routes
  app.post('/api/contacts', requireAuth, async (req: any, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.json(contact);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Ugyldig data", errors: error.errors });
      } else {
        console.error("Error creating contact:", error);
        res.status(500).json({ message: "Kunne ikke opprette kontakt" });
      }
    }
  });

  // Admin routes
  app.get('/api/admin/stats', requireAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Kunne ikke hente statistikk" });
    }
  });

  // Get all installers (for admin)
  app.get('/api/installers/all', requireAdmin, async (req: any, res) => {
    try {
      const installers = await storage.getAllInstallers();
      res.json(installers);
    } catch (error) {
      console.error("Error fetching all installers:", error);
      res.status(500).json({ message: "Kunne ikke hente installatører" });
    }
  });

  // Update installer status (approve/deactivate)
  app.post('/api/installers/:id/status', requireAdmin, async (req: any, res) => {
    try {
      const installerId = parseInt(req.params.id);
      const { approved, active } = req.body;
      
      await storage.updateInstallerStatus(installerId, { approved, active });
      
      if (active === false) {
        res.json({ message: "Installatør er deaktivert" });
      } else if (active === true) {
        res.json({ message: "Installatør er aktivert" });
      } else if (approved === true) {
        res.json({ message: "Installatør er godkjent" });
      } else {
        res.json({ message: "Installatør status oppdatert" });
      }
    } catch (error) {
      console.error("Error updating installer status:", error);
      res.status(500).json({ message: "Kunne ikke oppdatere status" });
    }
  });

  // Delete installer (GDPR compliance)
  app.delete('/api/installers/:id', requireAdmin, async (req: any, res) => {
    try {
      const installerId = parseInt(req.params.id);
      await storage.deleteInstaller(installerId);
      res.json({ message: "Installatør slettet permanent" });
    } catch (error) {
      console.error("Error deleting installer:", error);
      res.status(500).json({ message: "Kunne ikke slette installatør" });
    }
  });

  // Update customer information
  app.put('/api/customers/:id', requireAdmin, async (req: any, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const updateData = req.body;
      
      const customer = await storage.updateCustomer(customerId, updateData);
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Kunne ikke oppdatere kunde" });
    }
  });

  // Delete customer (GDPR compliance)
  app.delete('/api/customers/:id', requireAdmin, async (req: any, res) => {
    try {
      const customerId = parseInt(req.params.id);
      await storage.deleteCustomer(customerId);
      res.json({ message: "Kunde slettet permanent" });
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Kunne ikke slette kunde" });
    }
  });

  // Change user password (admin only)
  app.put('/api/users/:id/password', requireAdmin, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { password } = req.body;
      
      if (!password || password.length < 6) {
        return res.status(400).json({ message: "Passord må være minst 6 tegn" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 12);
      await storage.updatePassword(userId, hashedPassword);
      res.json({ message: "Passord endret" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Kunne ikke endre passord" });
    }
  });

  // Postal codes API routes
  app.get('/api/postal-codes', async (req, res) => {
    try {
      const postalCodes = await storage.getPostalCodes();
      res.json(postalCodes);
    } catch (error) {
      console.error("Error fetching postal codes:", error);
      res.status(500).json({ message: "Kunne ikke hente postnummer" });
    }
  });

  app.get('/api/postal-codes/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Søkeparameter mangler" });
      }
      
      const results = await storage.searchPostalCodes(q);
      res.json(results);
    } catch (error) {
      console.error("Error searching postal codes:", error);
      res.status(500).json({ message: "Kunne ikke søke i postnummer" });
    }
  });

  app.get('/api/postal-codes/:code', async (req, res) => {
    try {
      const { code } = req.params;
      const postalCode = await storage.getPostalCodeByCode(code);
      
      if (!postalCode) {
        return res.status(404).json({ message: "Postnummer ikke funnet" });
      }
      
      res.json(postalCode);
    } catch (error) {
      console.error("Error fetching postal code:", error);
      res.status(500).json({ message: "Kunne ikke hente postnummer" });
    }
  });

  app.post('/api/postal-codes', requireAuth, async (req, res) => {
    try {
      const postalCodeData = req.body;
      const newPostalCode = await storage.createPostalCode(postalCodeData);
      res.status(201).json(newPostalCode);
    } catch (error) {
      console.error("Error creating postal code:", error);
      res.status(500).json({ message: "Kunne ikke opprette postnummer" });
    }
  });

  app.put('/api/postal-codes/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const postalCode = await storage.updatePostalCode(id, updates);
      res.json(postalCode);
    } catch (error) {
      console.error("Error updating postal code:", error);
      res.status(500).json({ message: "Kunne ikke oppdatere postnummer" });
    }
  });

  app.delete('/api/postal-codes/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePostalCode(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting postal code:", error);
      res.status(500).json({ message: "Kunne ikke slette postnummer" });
    }
  });

  // Import postal codes
  app.post("/api/postal-codes/import", requireAuth, async (req, res) => {
    try {
      const { data } = req.body;
      
      if (!data || !Array.isArray(data)) {
        return res.status(400).json({ message: "Ugyldig data format" });
      }

      let created = 0;
      let updated = 0;
      const errors = [];

      for (const item of data) {
        try {
          if (!item.postalCode || !item.postPlace || !item.municipality || !item.county) {
            errors.push(`Ugyldig data: ${JSON.stringify(item)}`);
            continue;
          }

          if (item.id && item.id > 0) {
            // Update existing postal code
            const existing = await storage.getPostalCode(item.id);
            if (existing) {
              await storage.updatePostalCode(item.id, {
                postalCode: item.postalCode,
                postPlace: item.postPlace,
                municipality: item.municipality,
                county: item.county
              });
              updated++;
            } else {
              // ID provided but doesn't exist, create new
              await storage.createPostalCode({
                postalCode: item.postalCode,
                postPlace: item.postPlace,
                municipality: item.municipality,
                county: item.county
              });
              created++;
            }
          } else {
            // Create new postal code
            await storage.createPostalCode({
              postalCode: item.postalCode,
              postPlace: item.postPlace,
              municipality: item.municipality,
              county: item.county
            });
            created++;
          }
        } catch (itemError) {
          console.error("Error processing item:", item, itemError);
          errors.push(`Feil ved behandling av ${item.postalCode}: ${itemError instanceof Error ? itemError.message : "Ukjent feil"}`);
        }
      }

      res.json({ 
        created, 
        updated, 
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined // Only return first 10 errors
      });
    } catch (error) {
      console.error("Error importing postal codes:", error);
      res.status(500).json({ message: "Kunne ikke importere postnummer" });
    }
  });

  // Initialize postal codes on startup
  try {
    await storage.initializePostalCodes();
    console.log("Postal codes initialized successfully");
  } catch (error) {
    console.error("Failed to initialize postal codes:", error);
  }

  // Coordinate lookup endpoint for Norwegian addresses
  app.get("/api/coordinates", async (req, res) => {
    const { address, postalCode, city } = req.query;
    
    if (!address || !postalCode || !city) {
      return res.status(400).json({ error: "Address, postal code, and city are required" });
    }

    console.log(`Looking up coordinates for: ${address}, ${postalCode} ${city}`);
    
    // Hardcoded postal code coordinates - comprehensive Norwegian postal codes
    const postalCodeCoordinates: { [key: string]: {lat: number, lng: number} } = {
      // Oslo postal codes
      '0001': { lat: 59.9139, lng: 10.7522 }, // Oslo sentrum
      '0150': { lat: 59.9150, lng: 10.7580 },
      '0250': { lat: 59.9200, lng: 10.7450 },
      '0349': { lat: 59.9050, lng: 10.7600 },
      '0350': { lat: 59.9050, lng: 10.7600 },
      '0450': { lat: 59.9100, lng: 10.7400 },
      '0550': { lat: 59.9200, lng: 10.7500 },
      '0582': { lat: 59.928534, lng: 10.831278 }, // 0582 Oslo - EXACT coordinates from Kartverket
      '0650': { lat: 59.9300, lng: 10.7300 },
      '0750': { lat: 59.9400, lng: 10.7200 },
      '0850': { lat: 59.9500, lng: 10.7100 },
      '0950': { lat: 59.9600, lng: 10.7000 },
      // Akershus/Viken
      '2074': { lat: 60.3013, lng: 11.1666 }, // Eidsvoll Verk
      '2000': { lat: 59.9556, lng: 11.0458 }, // Lillestrøm
      '1470': { lat: 59.9262, lng: 10.9540 }, // Lørenskog
      '1350': { lat: 60.1695, lng: 11.0681 }, // Lommedalen
      '2040': { lat: 60.0833, lng: 11.1167 }, // Kløfta
      '2050': { lat: 60.1394, lng: 11.1742 }, // Jessheim
    };

    try {
      // Try online APIs first for exact coordinates
      const searchQueries = [
        `${address}, ${postalCode} ${city}`,
        `${address}, ${city}`,
        `${postalCode} ${city}`
      ];

      // Try Kartverket (Norwegian Mapping Authority) API first - the REAL solution
      const kartverketSearches = [
        `${address}, ${postalCode} ${city}`,
        `${address} ${postalCode}`,
        `${address}, ${city}`,
        `${postalCode} ${city}`
      ];

      for (const searchQuery of kartverketSearches) {
        try {
          const query = encodeURIComponent(searchQuery);
          const kartverketUrl = `https://ws.geonorge.no/adresser/v1/sok?sok=${query}&treffPerSide=1`;
          
          console.log(`🔍 Trying Kartverket with query: "${searchQuery}"`);
          const kartverketResponse = await fetch(kartverketUrl);
          
          if (kartverketResponse.ok) {
            const data = await kartverketResponse.json();
            console.log(`📍 Kartverket response for "${searchQuery}":`, data.metadata?.totaltAntallTreff || 0, 'results');
            
            if (data.adresser && data.adresser.length > 0) {
              const result = data.adresser[0];
              const coords = result.representasjonspunkt;
              
              if (coords && coords.lat && coords.lon) {
                console.log(`✅ SUCCESS! Found exact coordinates from Kartverket:`, {
                  query: searchQuery,
                  address: result.adressetekst,
                  postalCode: result.postnummer,
                  city: result.poststed,
                  coordinates: { lat: coords.lat, lng: coords.lon }
                });
                
                return res.json({ 
                  lat: coords.lat, 
                  lng: coords.lon,
                  source: 'Kartverket',
                  foundAddress: result.adressetekst,
                  foundPostalCode: result.postnummer,
                  foundCity: result.poststed
                });
              }
            }
          } else {
            console.log(`❌ Kartverket API returned status: ${kartverketResponse.status}`);
          }
        } catch (e) {
          console.log(`❌ Kartverket API error for "${searchQuery}":`, e);
        }
      }

      // Try OpenStreetMap as secondary
      const osmSearches = [
        `${address}, ${postalCode} ${city}, Norway`,
        `${address}, ${city}, Norway`,
        `${postalCode} ${city}, Norway`
      ];

      for (const searchQuery of osmSearches) {
        try {
          const query = encodeURIComponent(searchQuery);
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=no&q=${query}&limit=1`;
          
          console.log(`🔍 Trying OpenStreetMap with query: "${searchQuery}"`);
          const nominatimResponse = await fetch(nominatimUrl);
          
          if (nominatimResponse.ok) {
            const nominatimData = await nominatimResponse.json();
            console.log(`📍 OpenStreetMap response for "${searchQuery}":`, nominatimData.length, 'results');
            
            if (nominatimData.length > 0) {
              const coords = {
                lat: parseFloat(nominatimData[0].lat),
                lng: parseFloat(nominatimData[0].lon)
              };
              
              console.log(`✅ SUCCESS! Found coordinates from OpenStreetMap:`, {
                query: searchQuery,
                coordinates: coords,
                displayName: nominatimData[0].display_name
              });
              
              return res.json({
                ...coords,
                source: 'OpenStreetMap',
                foundAddress: nominatimData[0].display_name
              });
            }
          } else {
            console.log(`❌ OpenStreetMap API returned status: ${nominatimResponse.status}`);
          }
        } catch (e) {
          console.log(`❌ OpenStreetMap API error for "${searchQuery}":`, e);
        }
      }

    } catch (error) {
      console.log(`API lookup failed, using postal code fallback`);
    }

    // Last resort: Use postal code coordinates if we have them
    console.log(`⚠️  All APIs failed. Using postal code fallback for: ${postalCode}`);
    
    if (postalCodeCoordinates[postalCode as string]) {
      const coords = postalCodeCoordinates[postalCode as string];
      console.log(`📍 Using hardcoded postal code coordinates for ${postalCode}:`, coords);
      
      return res.json({
        ...coords,
        source: 'PostalCode-Fallback',
        warning: 'Using approximate coordinates - exact address lookup failed'
      });
    }

    // Absolute last resort: Oslo center
    console.log(`❌ No coordinates found anywhere. Using Oslo center as final fallback`);
    return res.json({
      lat: 59.9139,
      lng: 10.7522,
      source: 'Oslo-Center-Fallback',
      warning: 'Could not find address - using Oslo center'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}