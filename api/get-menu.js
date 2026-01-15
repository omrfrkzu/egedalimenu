import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Set headers
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');

  try {
    // Vercel includes files in deployment
    // Try multiple possible paths
    const basePath = process.cwd();
    const menuFile = path.join(basePath, 'data', 'menu.json');
    
    let menuData;
    try {
      menuData = fs.readFileSync(menuFile, 'utf8');
    } catch (readError) {
      // Try alternative path (for Vercel Lambda)
      try {
        const altPath = path.join('/var/task', 'data', 'menu.json');
        menuData = fs.readFileSync(altPath, 'utf8');
      } catch (altError) {
        console.error('File read errors:', { readError: readError.message, altError: altError.message, cwd: basePath });
        res.status(404).json({ 
          error: 'Menu file not found', 
          items: []
        });
        return;
      }
    }

    // Validate JSON
    let decoded;
    try {
      decoded = JSON.parse(menuData);
    } catch (error) {
      res.status(500).json({
        error: 'Invalid JSON format: ' + error.message,
        items: []
      });
      return;
    }

    // Ensure items array exists
    if (!decoded.items || !Array.isArray(decoded.items)) {
      decoded.items = [];
    }

    res.status(200).json(decoded);
  } catch (error) {
    console.error('Error reading menu:', error);
    res.status(500).json({
      error: 'Server error: ' + error.message,
      items: []
    });
  }
}
