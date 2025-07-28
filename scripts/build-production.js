#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🏗️  Building Varmepumpetilsynet for production...');

// Run vite build
console.log('📦 Building frontend with Vite...');
const viteBuild = spawn('npx', ['vite', 'build'], { stdio: 'inherit' });

viteBuild.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Vite build failed');
    process.exit(1);
  }
  
  console.log('✅ Frontend build completed');
  
  // Build the main server
  console.log('🔧 Building main server...');
  const serverBuild = spawn('npx', ['esbuild', 'server/index.ts', '--platform=node', '--packages=external', '--bundle', '--format=esm', '--outdir=dist'], { stdio: 'inherit' });
  
  serverBuild.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Server build failed');
      process.exit(1);
    }
    
    console.log('✅ Main server build completed');
    
    // Build the production server
    console.log('🚀 Building production server...');
    const prodServerBuild = spawn('npx', ['esbuild', 'server/production-server.ts', '--platform=node', '--packages=external', '--bundle', '--format=esm', '--outdir=dist'], { stdio: 'inherit' });
    
    prodServerBuild.on('close', (code) => {
      if (code !== 0) {
        console.error('❌ Production server build failed');
        process.exit(1);
      }
      
      console.log('✅ Production server build completed');
      console.log('🎉 All builds completed successfully!');
    });
  });
});