import fs from 'fs';
import path from 'path';
import { parse } from 'cookie';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  // Set headers
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');

  // Check authentication
  const cookies = parse(req.headers.cookie || '');
  if (cookies.authed !== 'true') {
    res.status(401).json({ success: false, error: 'Yetkisiz erişim' });
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({ success: false, error: 'Geçersiz JSON' });
      return;
    }

    // Note: Vercel has a read-only filesystem in serverless functions
    // For production, you should use Vercel KV, Vercel Blob, or another storage solution
    // This will work in development but may fail in production
    
    try {
      const jsonData = JSON.stringify(req.body, null, 2);
      
      // Try to save to both data and public directories
      let saved = false;
      
      // Try public directory first (for Vercel static serving)
      try {
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        const publicFile = path.join(publicDir, 'menu.json');
        fs.writeFileSync(publicFile, jsonData, 'utf8');
        saved = true;
      } catch (publicError) {
        console.log('Could not write to public:', publicError.message);
      }
      
      // Also try data directory
      try {
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        const dataFile = path.join(dataDir, 'menu.json');
        fs.writeFileSync(dataFile, jsonData, 'utf8');
        saved = true;
      } catch (dataError) {
        console.log('Could not write to data:', dataError.message);
      }
      
      if (!saved) {
        throw new Error('Could not write to any directory');
      }
    } catch (writeError) {
      // If file write fails (Vercel read-only filesystem), return error
      console.error('File write error (Vercel read-only filesystem):', writeError);
      res.status(500).json({ 
        success: false, 
        error: 'Dosya yazılamadı. Vercel\'de dosya yazma için Vercel KV veya Blob Storage kullanmanız gerekiyor.' 
      });
      return;
    }

    res.status(200).json({ success: true, message: 'Menü başarıyla kaydedildi!' });
  } catch (error) {
    console.error('Save menu error:', error);
    res.status(500).json({ success: false, error: 'Dosya yazılamadı: ' + error.message });
  }
}
