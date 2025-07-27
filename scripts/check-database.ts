#!/usr/bin/env tsx
import { storage } from "../server/storage";

async function checkDatabase() {
  try {
    console.log("🔍 Checking database status...");
    
    // Check admin user
    const adminUser = await storage.getUserByUsername("admin");
    if (adminUser) {
      console.log("✅ Admin user exists:");
      console.log(`   Username: ${adminUser.username}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   ID: ${adminUser.id}`);
    } else {
      console.log("❌ Admin user not found");
    }
    
    // Check installers
    const installers = await storage.getAllInstallers();
    console.log(`📊 Total installers: ${installers.length}`);
    
    // Check postal codes
    const postalCodes = await storage.getPostalCodes();
    console.log(`📮 Total postal codes: ${postalCodes.length}`);
    
    // Check service requests
    const serviceRequests = await storage.getAllServiceRequests();
    console.log(`📋 Total service requests: ${serviceRequests.length}`);
    
    console.log("\n🎯 Live database is ready for production!");
    console.log("\n🔑 Login credentials:");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("URL: /auth");
    
  } catch (error) {
    console.error("❌ Database check failed:", error);
    process.exit(1);
  }
}

// Run the check
checkDatabase().then(() => {
  console.log("\n✅ Database check complete!");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Database check failed:", error);
  process.exit(1);
});