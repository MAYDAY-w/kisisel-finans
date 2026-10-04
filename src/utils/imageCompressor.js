/**
 * Compresses an image file (File or Blob) using HTML5 Canvas.
 * Resizes the image to a maximum width/height while maintaining aspect ratio,
 * and compresses it to a lightweight JPEG or WebP data URL.
 *
 * @param {File|Blob} file - The image file from file picker or camera capture
 * @param {number} maxWidth - Maximum width in pixels (default: 1280)
 * @param {number} maxHeight - Maximum height in pixels (default: 1600)
 * @param {number} quality - Compression quality 0.0 - 1.0 (default: 0.75)
 * @returns {Promise<{ id: string, url: string, name: string, sizeKb: number, uploadedAt: string }>}
 */
export async function compressImage(file, maxWidth = 1280, maxHeight = 1600, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Lütfen geçerli bir görsel dosyası seçin.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Görsel yüklenemedi.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context oluşturulamadı.'));
        }

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Export as compressed JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const approxSizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);

        resolve({
          id: 'receipt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          url: compressedDataUrl,
          name: file.name || 'Fiş Görseli',
          sizeKb: approxSizeKb,
          uploadedAt: new Date().toISOString(),
        });
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Helper to process multiple files at once.
 * @param {FileList|Array<File>} files
 * @returns {Promise<Array<{ id: string, url: string, name: string, sizeKb: number, uploadedAt: string }>>}
 */
export async function compressMultipleImages(files) {
  const fileArray = Array.from(files);
  const results = [];

  for (const file of fileArray) {
    if (file.type.startsWith('image/')) {
      try {
        const compressed = await compressImage(file);
        results.push(compressed);
      } catch (err) {
        console.error('Failed to compress image:', file.name, err);
      }
    }
  }

  return results;
}
