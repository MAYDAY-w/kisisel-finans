export const analyzeReceiptWithGemini = async (base64Image, apiKey, categoriesStr = '') => {
  if (!apiKey) {
    throw new Error('Lütfen Ayarlar sayfasından Gemini API anahtarınızı ekleyin.');
  }

  const base64Data = base64Image.split(',')[1] || base64Image;
  const mimeMatch = base64Image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

  const promptText = `
Sen bir finansal veri çıkarma asistanısın. Kullanıcı bir alışveriş fişi veya faturası fotoğrafı gönderdi.
Lütfen bu görseli analiz et ve aşağıdaki bilgileri JSON formatında döndür. JSON formatı dışında hiçbir şey yazma (markdown etiketleri dahil kullanma, sadece saf JSON döndür).

Mevcut kategoriler:
${categoriesStr || 'food, transport, shopping, bills, electronics, health, education, entertainment, other'}

İstenen JSON formatı:
{
  "totalAmount": 0.0,
  "date": "YYYY-MM-DD",
  "merchant": "Satıcı Adı",
  "category": "Mevcut kategorilerden en uygun olanının TAM ADINI (veya id'sini) yaz",
  "note": "Eğer fişte ürünlerin adedi (örn: 3 adet), gramajı, litresi (örn: 1 L) veya markası gibi detaylar varsa bunları özetleyerek not olarak yaz. (Örn: Süt 1 Litre, Su 5L, 3 adet ekmek)",
  "items": [
    {
      "name": "Ürün Adı",
      "price": 0.0,
      "quantity": 1
    }
  ]
}

Sadece okunabilir net ürünleri al. Eğer fiş tam okunamıyorsa, okunabilen kısımları doldur.
`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: promptText },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
    }
  };

  // 1. Auto-detect available models for this specific API key
  let availableModels = ['gemini-3.8-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash-latest', 'gemini-1.5-flash'];
  try {
    const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (modelsRes.ok) {
      const modelsData = await modelsRes.json();
      if (modelsData && modelsData.models) {
        availableModels = modelsData.models
          .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
          .map(m => m.name.replace('models/', ''));
      }
    }
  } catch (err) {
    console.warn("Model listesi alınamadı, varsayılan modeller kullanılacak.", err);
  }

  // Priority queue of models to try
  const modelsToTry = [
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ].filter(m => availableModels.includes(m));

  // Fallback to whatever is available if our priority list is empty
  if (modelsToTry.length === 0 && availableModels.length > 0) {
    modelsToTry.push(availableModels[0]);
  }

  let lastError = null;

  // 2. Perform the generation request with automatic retries
  for (const targetModel of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`${errorData.error?.message || response.statusText}`);
      }

      const responseData = await response.json();
      const textContent = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        throw new Error('API geçerli bir yanıt döndürmedi.');
      }

      const cleanedText = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedJson = JSON.parse(cleanedText);
      return parsedJson;

    } catch (err) {
      console.warn(`Model ${targetModel} başarısız oldu:`, err.message);
      lastError = err.message;
      // If error is about model not available, continue to next.
      // If error is high demand (503), continue to next.
    }
  }

  // If all failed
  throw new Error(`Google Yapay Zeka sunucuları şu an çok yoğun. (Hata: ${lastError}) Lütfen biraz sonra tekrar deneyin.`);
};
