#!/usr/bin/env tsx
import { storage } from "../server/storage";
import bcrypt from "bcrypt";

async function createSuperadmin() {
  try {
    console.log("Checking for existing admin user...");
    
    // Check if admin user already exists
    const existingAdmin = await storage.getUserByUsername("admin");
    
    if (existingAdmin) {
      console.log("Admin user already exists with username 'admin'");
      console.log(`Admin user ID: ${existingAdmin.id}, Role: ${existingAdmin.role}`);
      return;
    }
    
    console.log("Creating superadmin user...");
    
    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 12);
    
    // Create admin user
    const adminUser = await storage.createUser({
      username: "admin",
      email: "admin@varmepumpetilsynet.no",
      password: hashedPassword,
      firstName: "Super",
      lastName: "Admin",
      role: "admin"
    });
    
    console.log("✅ Superadmin user created successfully!");
    console.log(`Username: admin`);
    console.log(`Password: admin123`);
    console.log(`Email: admin@varmepumpetilsynet.no`);
    console.log(`User ID: ${adminUser.id}`);
    console.log(`Role: ${adminUser.role}`);
    
    console.log("\n🔑 You can now login with:");
    console.log("Username: admin");
    console.log("Password: admin123");
    
  } catch (error) {
    console.error("❌ Error creating superadmin:", error);
    process.exit(1);
  }
}

// Run the script
createSuperadmin().then(() => {
  console.log("\n✅ Superadmin setup complete!");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Failed to create superadmin:", error);
  process.exit(1);
});