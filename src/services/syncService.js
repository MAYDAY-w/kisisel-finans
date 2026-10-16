import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

// Helper to recursively remove undefined fields which Firestore rejects
const removeUndefined = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, removeUndefined(v)])
    );
  }
  return obj;
};

// Sync service for Firestore using a single document per user
export const SyncService = {
  subscribeToUserData(userId, onDataUpdate) {
    if (!userId) return () => {};

    const docRef = doc(db, 'users', userId);
    
    // Listen to real-time changes
    return onSnapshot(docRef, (docSnap) => {
      // Ignore snapshots that are generated from our own local writes
      if (docSnap.metadata.hasPendingWrites) {
        return;
      }

      if (docSnap.exists()) {
        const data = docSnap.data();
        onDataUpdate(data);
      } else {
        // Doc doesn't exist yet
        onDataUpdate(null);
      }
    }, (error) => {
      console.error("Firestore Dinleme Hatası:", error);
      if (error.code === 'permission-denied') {
        alert("Veritabanı erişim izni reddedildi. Lütfen Firebase Console'da Firestore Database oluşturduğunuzdan ve Test Modunda (veya doğru kurallarla) olduğundan emin olun.");
      }
    });
  },

  async saveUserData(userId, fullState) {
    if (!userId) return;
    
    const docRef = doc(db, 'users', userId);
    try {
      const cleanState = removeUndefined(fullState);
      await setDoc(docRef, cleanState, { merge: true });
    } catch (e) {
      console.error("Firebase sync error:", e);
      if (e.code === 'permission-denied') {
        alert("Buluta kaydetme başarısız: Yetki reddedildi. Firebase veritabanı kurallarınızı kontrol edin.");
      } else if (e.code === 'not-found') {
        alert("Buluta kaydetme başarısız: Veritabanı bulunamadı. Firebase Console'dan Firestore'u aktifleştirmemiş olabilirsiniz.");
      } else {
        alert("Buluta kaydetme başarısız: " + e.message);
      }
    }
  }
};
