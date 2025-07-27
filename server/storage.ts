import {
  users,
  customers,
  heatPumps,
  installers,
  serviceAreas,
  serviceRequests,
  serviceRequestContacts,
  customerInstallerContacts,
  postalCodes,
  type User,
  type InsertUser,
  type Customer,
  type InsertCustomer,
  type HeatPump,
  type InsertHeatPump,
  type Installer,
  type InsertInstaller,
  type ServiceArea,
  type InsertServiceArea,
  type ServiceRequest,
  type InsertServiceRequest,
  type ServiceRequestContact,
  type CustomerInstallerContact,
  type InsertContact,
  type PostalCode,
  type InsertPostalCode,
} from "@shared/schema";
import { norwegianPostalCodes } from "@shared/postal-codes";
import { db } from "./db";
import { eq, and, desc, asc, like, inArray, sql } from "drizzle-orm";
import bcrypt from 'bcrypt';

export interface IStorage {
  // User operations (custom auth)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updatePassword(userId: number, hashedPassword: string): Promise<void>;
  resetUserPassword(userId: number, newPassword: string): Promise<void>;
  setResetToken(userId: number, token: string, expiry: Date): Promise<void>;
  clearResetToken(userId: number): Promise<void>;
  
  // Customer operations
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomer(userId: number): Promise<Customer | undefined>;
  getCustomerById(id: number): Promise<Customer | undefined>;
  updateCustomer(customerId: number, updates: Partial<Customer>): Promise<Customer>;
  updateCustomerSubscription(customerId: number, active: boolean): Promise<Customer>;
  getCustomersByMunicipality(municipality: string): Promise<Customer[]>;
  getAllCustomers(): Promise<Customer[]>;
  
  // Heat pump operations
  createHeatPump(heatPump: InsertHeatPump): Promise<HeatPump>;
  getHeatPumpsByCustomer(customerId: number): Promise<HeatPump[]>;
  updateHeatPump(id: number, updates: Partial<HeatPump>): Promise<HeatPump>;
  
  // Installer operations
  createInstaller(installer: InsertInstaller): Promise<Installer>;
  getInstaller(userId: number): Promise<Installer | undefined>;
  getInstallerById(id: number): Promise<Installer | undefined>;
  getInstallerByCompanyName(companyName: string): Promise<Installer | undefined>;
  getInstallerByOrgNumber(orgNumber: string): Promise<Installer | undefined>;
  getInstallersByMunicipality(municipality: string): Promise<any[]>;
  getInstallersByCounty(county: string): Promise<any[]>;
  updateInstaller(installerId: number, updates: Partial<Installer>): Promise<Installer>;
  updateInstallerApproval(installerId: number, approved: boolean): Promise<Installer>;
  getAllInstallers(): Promise<Installer[]>;
  getPendingInstallers(): Promise<Installer[]>;
  
  // Service area operations
  createServiceArea(serviceArea: InsertServiceArea): Promise<ServiceArea>;
  getServiceArea(id: number): Promise<ServiceArea | undefined>;
  getServiceAreasByInstaller(installerId: number): Promise<ServiceArea[]>;
  deleteServiceArea(id: number): Promise<void>;
  deleteServiceAreasByInstaller(installerId: number): Promise<void>;
  
  // Service request operations (no auth required)
  createServiceRequest(serviceRequest: InsertServiceRequest): Promise<ServiceRequest>;
  getServiceRequestsForInstaller(installerId: number): Promise<ServiceRequest[]>;
  getAllServiceRequests(): Promise<ServiceRequest[]>;
  updateServiceRequestStatus(id: number, status: string): Promise<ServiceRequest>;
  updateServiceRequest(id: number, updates: Partial<ServiceRequest>): Promise<ServiceRequest>;
  deleteServiceRequest(id: number): Promise<void>;
  
  // Service request contact operations
  createServiceRequestContact(serviceRequestId: number, installerId: number, notes?: string): Promise<ServiceRequestContact>;
  getServiceRequestContacts(serviceRequestId: number): Promise<ServiceRequestContact[]>;
  
  // Contact operations
  createContact(contact: InsertContact): Promise<CustomerInstallerContact>;
  getContactsByCustomer(customerId: number): Promise<CustomerInstallerContact[]>;
  getContactsByInstaller(installerId: number): Promise<CustomerInstallerContact[]>;
  
  // Statistics
  getAdminStats(): Promise<{
    totalCustomers: number;
    activeInstallers: number;
    pendingApprovals: number;
    monthlyRevenue: number;
  }>;

  // GDPR compliance methods
  updateInstallerStatus(installerId: number, status: { approved?: boolean; active?: boolean }): Promise<void>;
  deleteInstaller(installerId: number): Promise<void>;
  deleteCustomer(customerId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetToken, token));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async resetUserPassword(userId: number, newPassword: string): Promise<void> {
    if (!newPassword || newPassword.length < 3) {
      throw new Error('Passord må være minst 3 tegn');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async setResetToken(userId: number, token: string, expiry: Date): Promise<void> {
    await db
      .update(users)
      .set({ 
        resetToken: token, 
        resetTokenExpiry: expiry,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }

  async clearResetToken(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        resetToken: null, 
        resetTokenExpiry: null,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }



  // Customer operations
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db
      .insert(customers)
      .values(customer)
      .returning();
    return newCustomer;
  }

  async getCustomer(userId: number): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, userId));
    return customer;
  }

  async getCustomerById(id: number): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id));
    return customer;
  }

  async updateCustomer(customerId: number, updates: Partial<Customer>): Promise<Customer> {
    const [customer] = await db
      .update(customers)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, customerId))
      .returning();
    return customer;
  }

  async updateCustomerSubscription(customerId: number, active: boolean): Promise<Customer> {
    const [customer] = await db
      .update(customers)
      .set({
        subscriptionActive: active,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, customerId))
      .returning();
    return customer;
  }

  async getCustomersByMunicipality(municipality: string): Promise<Customer[]> {
    return await db
      .select()
      .from(customers)
      .where(eq(customers.municipality, municipality))
      .orderBy(desc(customers.createdAt));
  }

  async getAllCustomers(): Promise<Customer[]> {
    const result = await db
      .select({
        id: customers.id,
        userId: customers.userId,
        fullName: customers.fullName,
        email: customers.email,
        municipality: customers.municipality,
        subscriptionActive: customers.subscriptionActive,
        createdAt: customers.createdAt,
        updatedAt: customers.updatedAt,
        username: users.username,
      })
      .from(customers)
      .leftJoin(users, eq(customers.userId, users.id))
      .orderBy(desc(customers.createdAt));
    
    return result;
  }

  // Heat pump operations
  async createHeatPump(heatPump: InsertHeatPump): Promise<HeatPump> {
    const [newHeatPump] = await db
      .insert(heatPumps)
      .values(heatPump)
      .returning();
    return newHeatPump;
  }

  async getHeatPumpsByCustomer(customerId: number): Promise<HeatPump[]> {
    return await db
      .select()
      .from(heatPumps)
      .where(eq(heatPumps.customerId, customerId))
      .orderBy(desc(heatPumps.createdAt));
  }

  async updateHeatPump(id: number, updates: Partial<HeatPump>): Promise<HeatPump> {
    const [heatPump] = await db
      .update(heatPumps)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(heatPumps.id, id))
      .returning();
    return heatPump;
  }

  // Installer operations
  async createInstaller(installer: InsertInstaller): Promise<Installer> {
    const [newInstaller] = await db
      .insert(installers)
      .values(installer)
      .returning();
    return newInstaller;
  }

  async getInstaller(userId: number): Promise<Installer | undefined> {
    const [installer] = await db
      .select()
      .from(installers)
      .where(eq(installers.userId, userId));
    return installer;
  }

  async getInstallerById(id: number): Promise<Installer | undefined> {
    const [installer] = await db
      .select()
      .from(installers)
      .where(eq(installers.id, id));
    return installer;
  }

  async getInstallerByCompanyName(companyName: string): Promise<Installer | undefined> {
    const [installer] = await db
      .select()
      .from(installers)
      .where(eq(installers.companyName, companyName));
    return installer;
  }

  async getInstallerByOrgNumber(orgNumber: string): Promise<Installer | undefined> {
    const [installer] = await db
      .select()
      .from(installers)
      .where(eq(installers.orgNumber, orgNumber));
    return installer;
  }

  async updateInstaller(installerId: number, updates: Partial<Installer>): Promise<Installer> {
    const [installer] = await db
      .update(installers)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(installers.id, installerId))
      .returning();
    return installer;
  }

  async updateInstallerApproval(installerId: number, approved: boolean): Promise<Installer> {
    const [installer] = await db
      .update(installers)
      .set({
        approved,
        updatedAt: new Date(),
      })
      .where(eq(installers.id, installerId))
      .returning();
    return installer;
  }

  async getInstallersByMunicipality(municipality: string): Promise<any[]> {
    // Get installers by their service areas
    const serviceAreaResults = await db
      .selectDistinct()
      .from(installers)
      .innerJoin(serviceAreas, eq(installers.id, serviceAreas.installerId))
      .where(
        and(
          eq(serviceAreas.municipality, municipality),
          eq(installers.approved, true),
          eq(installers.active, true)
        )
      );

    // Get installers by their primary location (fylke/kommune)
    const primaryLocationResults = await db
      .select()
      .from(installers)
      .where(
        and(
          eq(installers.municipality, municipality),
          eq(installers.approved, true),
          eq(installers.active, true)
        )
      );

    // Combine and deduplicate results
    const installerMap = new Map();
    
    // Add installers from service areas
    serviceAreaResults.forEach(row => {
      const installer = row.installers;
      const serviceArea = row.service_areas;
      
      if (!serviceArea || !serviceArea.county) return;
      
      if (installerMap.has(installer.id)) {
        const existing = installerMap.get(installer.id);
        if (!existing.counties.includes(serviceArea.county)) {
          existing.counties.push(serviceArea.county);
        }
      } else {
        installerMap.set(installer.id, {
          ...installer,
          counties: [serviceArea.county]
        });
      }
    });

    // Add installers from primary location
    primaryLocationResults.forEach(installer => {
      if (installerMap.has(installer.id)) {
        const existing = installerMap.get(installer.id);
        if (installer.county && !existing.counties.includes(installer.county)) {
          existing.counties.push(installer.county);
        }
      } else {
        installerMap.set(installer.id, {
          ...installer,
          counties: installer.county ? [installer.county] : []
        });
      }
    });
    
    return Array.from(installerMap.values()).sort((a, b) => Number(b.rating) - Number(a.rating));
  }

  async getInstallersByCounty(county: string): Promise<any[]> {
    // Get installers by their service areas
    const serviceAreaResults = await db
      .selectDistinct()
      .from(installers)
      .innerJoin(serviceAreas, eq(installers.id, serviceAreas.installerId))
      .where(
        and(
          eq(serviceAreas.county, county),
          eq(installers.approved, true),
          eq(installers.active, true)
        )
      );

    // Get installers by their primary location (fylke/kommune)
    const primaryLocationResults = await db
      .select()
      .from(installers)
      .where(
        and(
          eq(installers.county, county),
          eq(installers.approved, true),
          eq(installers.active, true)
        )
      );

    // Combine and deduplicate results
    const installerMap = new Map();
    
    // Add installers from service areas
    serviceAreaResults.forEach(row => {
      const installer = row.installers;
      const serviceArea = row.service_areas;
      
      if (!serviceArea || !serviceArea.county) return;
      
      if (installerMap.has(installer.id)) {
        const existing = installerMap.get(installer.id);
        if (!existing.counties.includes(serviceArea.county)) {
          existing.counties.push(serviceArea.county);
        }
      } else {
        installerMap.set(installer.id, {
          ...installer,
          counties: [serviceArea.county]
        });
      }
    });

    // Add installers from primary location
    primaryLocationResults.forEach(installer => {
      if (installerMap.has(installer.id)) {
        const existing = installerMap.get(installer.id);
        if (installer.county && !existing.counties.includes(installer.county)) {
          existing.counties.push(installer.county);
        }
      } else {
        installerMap.set(installer.id, {
          ...installer,
          counties: installer.county ? [installer.county] : []
        });
      }
    });
    
    return Array.from(installerMap.values()).sort((a, b) => Number(b.rating) - Number(a.rating));
  }

  async getAllInstallers(): Promise<any[]> {
    const result = await db
      .select({
        id: installers.id,
        userId: installers.userId,
        companyName: installers.companyName,
        orgNumber: installers.orgNumber,
        contactPerson: installers.contactPerson,
        email: installers.email,
        phone: installers.phone,
        address: installers.address,
        postalCode: installers.postalCode,
        city: installers.city,
        county: installers.county,
        municipality: installers.municipality,
        website: installers.website,
        certified: installers.certified,
        approved: installers.approved,
        active: installers.active,
        rating: installers.rating,
        totalServices: installers.totalServices,
        createdAt: installers.createdAt,
        updatedAt: installers.updatedAt,
        username: users.username,
      })
      .from(installers)
      .leftJoin(users, eq(installers.userId, users.id))
      .orderBy(desc(installers.createdAt));
    
    return result;
  }

  async getPendingInstallers(): Promise<Installer[]> {
    return await db
      .select()
      .from(installers)
      .where(eq(installers.approved, false))
      .orderBy(asc(installers.createdAt));
  }

  // Service area operations
  async createServiceArea(serviceArea: InsertServiceArea): Promise<ServiceArea> {
    const [newServiceArea] = await db
      .insert(serviceAreas)
      .values(serviceArea)
      .returning();
    return newServiceArea;
  }

  async getServiceArea(id: number): Promise<ServiceArea | undefined> {
    const [serviceArea] = await db
      .select()
      .from(serviceAreas)
      .where(eq(serviceAreas.id, id));
    return serviceArea;
  }

  async getServiceAreasByInstaller(installerId: number): Promise<ServiceArea[]> {
    return await db
      .select()
      .from(serviceAreas)
      .where(eq(serviceAreas.installerId, installerId))
      .orderBy(asc(serviceAreas.county), asc(serviceAreas.municipality));
  }

  async deleteServiceArea(id: number): Promise<void> {
    await db.delete(serviceAreas).where(eq(serviceAreas.id, id));
  }

  async clearServiceAreas(installerId: number): Promise<void> {
    await db.delete(serviceAreas).where(eq(serviceAreas.installerId, installerId));
  }

  async deleteServiceAreasByInstaller(installerId: number): Promise<void> {
    await db.delete(serviceAreas).where(eq(serviceAreas.installerId, installerId));
  }

  // Service request operations (no auth required)
  async createServiceRequest(serviceRequest: InsertServiceRequest): Promise<ServiceRequest> {
    const [newRequest] = await db
      .insert(serviceRequests)
      .values(serviceRequest)
      .returning();
    return newRequest;
  }

  async getServiceRequestsForInstaller(installerId: number): Promise<ServiceRequest[]> {
    // Get service requests for areas where installer provides service
    const installerServiceAreas = await db
      .select()
      .from(serviceAreas)
      .where(eq(serviceAreas.installerId, installerId));

    if (installerServiceAreas.length === 0) {
      return [];
    }

    const municipalities = installerServiceAreas.map(area => area.municipality);

    return await db
      .select()
      .from(serviceRequests)
      .where(inArray(serviceRequests.municipality, municipalities))
      .orderBy(desc(serviceRequests.createdAt));
  }

  async getAllServiceRequests(): Promise<ServiceRequest[]> {
    return await db
      .select()
      .from(serviceRequests)
      .orderBy(desc(serviceRequests.createdAt));
  }

  async updateServiceRequestStatus(id: number, status: string): Promise<ServiceRequest> {
    const [updated] = await db
      .update(serviceRequests)
      .set({ status })
      .where(eq(serviceRequests.id, id))
      .returning();
    return updated;
  }

  async updateServiceRequest(id: number, updates: Partial<ServiceRequest>): Promise<ServiceRequest> {
    const [updated] = await db
      .update(serviceRequests)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(serviceRequests.id, id))
      .returning();
    return updated;
  }

  async deleteServiceRequest(id: number): Promise<void> {
    // First delete any related contacts
    await db
      .delete(serviceRequestContacts)
      .where(eq(serviceRequestContacts.serviceRequestId, id));
    
    // Then delete the service request
    await db
      .delete(serviceRequests)
      .where(eq(serviceRequests.id, id));
  }







  // Service request contact operations
  async createServiceRequestContact(serviceRequestId: number, installerId: number, notes?: string): Promise<ServiceRequestContact> {
    const [newContact] = await db
      .insert(serviceRequestContacts)
      .values({
        serviceRequestId,
        installerId,
        notes: notes || null,
      })
      .returning();
    return newContact;
  }

  async getServiceRequestContacts(serviceRequestId: number): Promise<ServiceRequestContact[]> {
    return await db
      .select()
      .from(serviceRequestContacts)
      .where(eq(serviceRequestContacts.serviceRequestId, serviceRequestId))
      .orderBy(desc(serviceRequestContacts.contactedAt));
  }

  // Contact operations
  async createContact(contact: InsertContact): Promise<CustomerInstallerContact> {
    const [newContact] = await db
      .insert(customerInstallerContacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async getContactsByCustomer(customerId: number): Promise<CustomerInstallerContact[]> {
    return await db
      .select()
      .from(customerInstallerContacts)
      .where(eq(customerInstallerContacts.customerId, customerId))
      .orderBy(desc(customerInstallerContacts.contactedAt));
  }

  async getContactsByInstaller(installerId: number): Promise<CustomerInstallerContact[]> {
    return await db
      .select()
      .from(customerInstallerContacts)
      .where(eq(customerInstallerContacts.installerId, installerId))
      .orderBy(desc(customerInstallerContacts.contactedAt));
  }

  // Statistics
  async getAdminStats(): Promise<{
    totalCustomers: number;
    activeInstallers: number;
    pendingApprovals: number;
    monthlyRevenue: number;
  }> {
    const [customerCount] = await db
      .select({ count: customers.id })
      .from(customers);
    
    const [activeInstallerCount] = await db
      .select({ count: installers.id })
      .from(installers)
      .where(eq(installers.approved, true));
    
    const [pendingCount] = await db
      .select({ count: installers.id })
      .from(installers)
      .where(eq(installers.approved, false));
    
    const [subscriptionCount] = await db
      .select({ count: customers.id })
      .from(customers)
      .where(eq(customers.subscriptionActive, true));

    return {
      totalCustomers: customerCount?.count || 0,
      activeInstallers: activeInstallerCount?.count || 0,
      pendingApprovals: pendingCount?.count || 0,
      monthlyRevenue: (subscriptionCount?.count || 0) * 29,
    };
  }

  // GDPR compliance methods
  async updateInstallerStatus(installerId: number, status: { approved?: boolean; active?: boolean }): Promise<void> {
    await db
      .update(installers)
      .set({
        ...status,
        updatedAt: new Date(),
      })
      .where(eq(installers.id, installerId));
  }

  async deleteInstaller(installerId: number): Promise<void> {
    // First delete related service areas
    await this.clearServiceAreas(installerId);
    
    // Delete contacts
    await db.delete(customerInstallerContacts)
      .where(eq(customerInstallerContacts.installerId, installerId));
    
    // Delete installer
    await db.delete(installers)
      .where(eq(installers.id, installerId));
  }

  async deleteCustomer(customerId: number): Promise<void> {
    // Delete heat pumps
    await db.delete(heatPumps)
      .where(eq(heatPumps.customerId, customerId));
    
    // Delete contacts
    await db.delete(customerInstallerContacts)
      .where(eq(customerInstallerContacts.customerId, customerId));
    
    // Delete customer
    await db.delete(customers)
      .where(eq(customers.id, customerId));
  }

  // Postal code operations
  async initializePostalCodes(): Promise<void> {
    // Check if postal codes are already initialized
    const count = await db.select({ count: sql`count(*)` }).from(postalCodes);
    if (Number(count[0].count) > 0) {
      return; // Already initialized
    }

    // Insert Norwegian postal codes
    const postalCodeData = norwegianPostalCodes.map(pc => ({
      postalCode: pc.postalCode,
      postPlace: pc.postPlace,
      municipality: pc.municipality,
      county: pc.county
    }));

    await db.insert(postalCodes).values(postalCodeData);
  }

  async getPostalCodes(): Promise<PostalCode[]> {
    return await db.select().from(postalCodes).orderBy(asc(postalCodes.postalCode));
  }

  async getPostalCodeByCode(code: string): Promise<PostalCode | undefined> {
    const [postalCode] = await db.select().from(postalCodes).where(eq(postalCodes.postalCode, code));
    return postalCode;
  }

  async searchPostalCodes(query: string): Promise<PostalCode[]> {
    return await db.select().from(postalCodes)
      .where(
        sql`${postalCodes.postalCode} LIKE ${`%${query}%`} OR 
            ${postalCodes.postPlace} ILIKE ${`%${query}%`} OR
            ${postalCodes.municipality} ILIKE ${`%${query}%`}`
      )
      .orderBy(asc(postalCodes.postalCode))
      .limit(50);
  }

  async createPostalCode(postalCode: InsertPostalCode): Promise<PostalCode> {
    const [newPostalCode] = await db.insert(postalCodes).values(postalCode).returning();
    return newPostalCode;
  }

  async getPostalCode(id: number): Promise<PostalCode | undefined> {
    const [postalCode] = await db.select().from(postalCodes).where(eq(postalCodes.id, id));
    return postalCode;
  }

  async updatePostalCode(id: number, updates: Partial<PostalCode>): Promise<PostalCode> {
    const [postalCode] = await db.update(postalCodes)
      .set(updates)
      .where(eq(postalCodes.id, id))
      .returning();
    return postalCode;
  }

  async deletePostalCode(id: number): Promise<void> {
    await db.delete(postalCodes).where(eq(postalCodes.id, id));
  }
}

export const storage = new DatabaseStorage();
