import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

/**
 * Resizes and compresses an image client-side to ensure ultra-fast loading,
 * optimized especially for mobile devices and high-resolution camera photos.
 */
export async function compressImage(file: File, maxWidth = 500, maxHeight = 500, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If already a tiny blob, return quickly
    if (file.size < 80 * 1024 && file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

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
          resolve(file);
          return;
        }

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Converts a file to base64 Data URL
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image to Firebase Storage and returns public URL.
 * Falls back to high-performance base64 data URL if storage is unavailable.
 */
export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  try {
    const safeUserId = (userId || 'user').toString().trim();
    const compressedBlob = await compressImage(file, 500, 500, 0.82);

    if (storage) {
      try {
        const fileExt = (file.name || 'avatar.jpg').split('.').pop() || 'jpg';
        const storagePath = `profile_photos/${safeUserId}_${Date.now()}.${fileExt}`;
        const storageRef = ref(storage, storagePath);

        const snapshot = await uploadBytes(storageRef, compressedBlob, {
          contentType: 'image/jpeg',
          customMetadata: {
            uploadedBy: safeUserId,
            uploadedAt: new Date().toISOString()
          }
        });

        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      } catch (storageError) {
        console.warn('Firebase Storage direct upload warning, using robust data URL fallback:', storageError);
      }
    }

    // Direct compressed base64 fallback (guarantees instantaneous mobile rendering)
    const dataUrl = await fileToDataUrl(compressedBlob);
    return dataUrl;
  } catch (error) {
    console.error('Error during image processing:', error);
    return fileToDataUrl(file);
  }
}

