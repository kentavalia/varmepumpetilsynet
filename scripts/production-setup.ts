#!/usr/bin/env tsx
/**
 * Production Database Setup Script
 * This script sets up the production database with essential data
 */
import { db } from "../server/db";
import { users, postalCodes } from "../shared/schema";
import { norwegianPostalCodes } from "../shared/postal-codes";
import bcrypt from "bcrypt";

async function setupProductionDatabase() {
  try {
    console.log("🚀 Setting up production database...");
    
    // 1. Create superadmin user
    console.log("1. Creating superadmin user...");
    
    const hashedPassword = await bcrypt.hash("admin123", 12);
    
    try {
      const [adminUser] = await db
        .insert(users)
        .values({
          username: "admin",
          email: "admin@varmepumpetilsynet.no",
          password: hashedPassword,
          firstName: "Super",
          lastName: "Admin",
          role: "admin"
        })
        .returning();
      
      console.log(`✅ Admin user created: ID ${adminUser.id}`);
    } catch (error: any) {
      if (error.message?.includes('duplicate') || error.code === '23505') {
        console.log("ℹ️ Admin user already exists, skipping...");
      } else {
        throw error;
      }
    }
    
    // 2. Initialize postal codes
    console.log("2. Initializing postal codes...");
    
    try {
      // Check if postal codes already exist
      const existingCodes = await db.select().from(postalCodes).limit(1);
      
      if (existingCodes.length === 0) {
        console.log("   Inserting Norwegian postal codes...");
        
        // Insert in batches to avoid memory issues
        const batchSize = 500;
        for (let i = 0; i < norwegianPostalCodes.length; i += batchSize) {
          const batch = norwegianPostalCodes.slice(i, i + batchSize);
          await db.insert(postalCodes).values(batch);
          console.log(`   Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(norwegianPostalCodes.length / batchSize)}`);
        }
        
        console.log(`✅ Inserted ${norwegianPostalCodes.length} postal codes`);
      } else {
        console.log("ℹ️ Postal codes already exist, skipping...");
      }
    } catch (error) {
      console.error("❌ Error setting up postal codes:", error);
    }
    
    console.log("\n🎉 Production database setup complete!");
    console.log("\n🔑 Admin Login Credentials:");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("Role: admin");
    console.log("\n📍 You can now:");
    console.log("• Login at /auth");
    console.log("• Access admin panel");
    console.log("• Manage installers and service requests");
    console.log("• Import/export postal codes");
    
  } catch (error) {
    console.error("❌ Production setup failed:", error);
    throw error;
  }
}

// Self-executing setup - only when run directly, not when imported
// Never exit when in production mode to prevent deployment failures
if (import.meta.url === `file://${process.argv[1]}` && process.env.NODE_ENV !== "production") {
  setupProductionDatabase()
    .then(() => {
      console.log("\n✅ Setup completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Setup failed:", error);
      process.exit(1);
    });
}

export { setupProductionDatabase };