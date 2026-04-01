import cron from 'node-cron';
import { prisma } from './server.js';

/**
 * Keep-alive service to prevent Render free tier from sleeping
 * Runs every 12 minutes (720 seconds)
 */
let keepaliveInterval = null;
let pingCount = 0;

/**
 * Start keep-alive service
 */
export function startKeepalive() {
  if (keepaliveInterval) return;
  
  console.log('⏰ Starting keep-alive service (every 12 minutes)...');
  
  // Run every 12 minutes
  keepaliveInterval = cron.schedule('*/12 * * * *', async () => {
    await pingHealthCheck();
  });
  
  // Also run immediately on startup
  setTimeout(() => pingHealthCheck(), 5000);
}

/**
 * Stop keep-alive service
 */
export function stopKeepalive() {
  if (keepaliveInterval) {
    keepaliveInterval.stop();
    keepaliveInterval = null;
    console.log('⏰ Keep-alive service stopped');
  }
}

/**
 * Perform health check ping
 */
async function pingHealthCheck() {
  pingCount++;
  const timestamp = new Date().toISOString();
  
  try {
    // Simple database query to keep connection alive
    const result = await prisma.$queryRaw`SELECT 1 as ping`;
    
    console.log(`💓 Keep-alive #${pingCount} at ${timestamp} - Status: OK`);
    
    // Also log to admin console if needed
    if (pingCount % 10 === 0) {
      console.log(`📊 Keep-alive stats: ${pingCount} pings sent, all successful`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Keep-alive #${pingCount} failed at ${timestamp}:`, error.message);
    return false;
  }
}

/**
 * Get keep-alive statistics
 */
export function getKeepaliveStats() {
  return {
    pingCount,
    isRunning: keepaliveInterval !== null,
    lastPing: pingCount > 0 ? new Date().toISOString() : null
  };
}

/**
 * Manual ping trigger (for testing)
 */
export async function manualPing() {
  return await pingHealthCheck();
}