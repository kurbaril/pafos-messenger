#!/usr/bin/env node

/**
 * Keep-alive script to prevent Render free tier from sleeping
 * Can be run as a cron job or external service
 * 
 * Usage: node scripts/keepalive.js
 */

const https = require('https');
const http = require('http');

const URL = process.env.KEEPALIVE_URL || 'https://pafos-backend.onrender.com/api/health';
const INTERVAL = process.env.KEEPALIVE_INTERVAL || 12 * 60 * 1000; // 12 minutes

let pingCount = 0;
let successCount = 0;
let failCount = 0;

console.log('🚀 Keep-alive service started');
console.log(`📍 Target: ${URL}`);
console.log(`⏱️  Interval: ${INTERVAL / 1000} seconds`);
console.log('----------------------------------------');

/**
 * Perform health check ping
 */
function ping() {
  const client = URL.startsWith('https') ? https : http;
  const startTime = Date.now();
  
  client.get(URL, (res) => {
    const duration = Date.now() - startTime;
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      pingCount++;
      
      if (res.statusCode === 200) {
        successCount++;
        console.log(`✅ Ping #${pingCount} | Status: ${res.statusCode} | Duration: ${duration}ms | ${new Date().toISOString()}`);
      } else {
        failCount++;
        console.log(`⚠️  Ping #${pingCount} | Status: ${res.statusCode} | Duration: ${duration}ms | ${new Date().toISOString()}`);
      }
      
      // Log stats every 10 pings
      if (pingCount % 10 === 0) {
        console.log(`📊 Stats: ${successCount}/${pingCount} successful (${Math.round((successCount/pingCount)*100)}%)`);
      }
    });
  }).on('error', (err) => {
    pingCount++;
    failCount++;
    console.log(`❌ Ping #${pingCount} | Error: ${err.message} | ${new Date().toISOString()}`);
  });
}

// Run immediately on start
ping();

// Set up interval
const intervalId = setInterval(ping, INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Keep-alive service stopped');
  console.log(`📊 Final stats: ${successCount}/${pingCount} successful`);
  clearInterval(intervalId);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Keep-alive service terminated');
  console.log(`📊 Final stats: ${successCount}/${pingCount} successful`);
  clearInterval(intervalId);
  process.exit(0);
});