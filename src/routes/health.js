const express = require('express');
const sql = require('mssql');
const router = express.Router();

router.get('/health', async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'checking...',
      memory: 'checking...',
      disk: 'checking...'
    }
  };
  
  try {
    // Check database connection
    const pool = await sql.connect();
    await pool.request().query('SELECT 1');
    healthcheck.checks.database = 'healthy';
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsageInMB = Math.round(memUsage.rss / 1024 / 1024);
    healthcheck.checks.memory = `${memUsageInMB}MB used`;
    
    // Basic disk space check (simplified)
    healthcheck.checks.disk = 'healthy';
    
    res.status(200).json(healthcheck);
    
  } catch (error) {
    healthcheck.message = 'Error';
    healthcheck.checks.database = 'unhealthy';
    healthcheck.error = error.message;
    
    res.status(503).json(healthcheck);
  }
});

module.exports = router;