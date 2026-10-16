import fs from 'fs';
import https from 'https';
import path from 'path';

// Fix webmanifest
const manifestPath = 'public/manifest.webmanifest';
const manifest = {
  "name": "Kişisel Finans",
  "short_name": "Finans",
  "description": "Fiş tara, sesle harcama kaydet, bütçeni ve yatırımlarını yönet.",
  "id": "/",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f8fafc",
  "theme_color": "#059669",
  "orientation": "portrait-primary",
  "prefer_related_applications": false,
  "icons": [
    {
      "src": "/icon.svg",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshot-1.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshot-2.png",
      "sizes": "720x1280",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "categories": ["finance", "productivity", "utilities"]
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

// Download placeholders
const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

async function run() {
  await download('https://placehold.co/192x192/059669/FFF.png?text=$', 'public/icon-192.png');
  await download('https://placehold.co/512x512/059669/FFF.png?text=$', 'public/icon-512.png');
  await download('https://placehold.co/1280x720/059669/FFF.png?text=Masaustu+Gorunumu', 'public/screenshot-1.png');
  await download('https://placehold.co/720x1280/059669/FFF.png?text=Mobil+Gorunum', 'public/screenshot-2.png');
  console.log('Manifest and images updated!');
}

run();
