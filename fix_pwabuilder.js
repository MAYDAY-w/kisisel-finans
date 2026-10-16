import fs from 'fs';

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
  "lang": "tr",
  "dir": "ltr",
  "categories": ["finance", "productivity", "utilities"],
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
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
  "shortcuts": [
    {
      "name": "İşlem Ekle",
      "short_name": "Ekle",
      "description": "Yeni bir gelir veya gider ekle",
      "url": "/",
      "icons": [
        {
          "src": "/icon-192.png",
          "sizes": "192x192"
        }
      ]
    }
  ]
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log('Manifest updated for PWABuilder');
