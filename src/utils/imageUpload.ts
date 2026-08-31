import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

/**
 * Resizes and compresses an image client-side to ensure fast loading and reasonable storage size
 */
export async function compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
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

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          file.type || 'image/jpeg',
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
 * Falls back to base64 data URL if storage is unavailable.
 */
export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  try {
    const compressedBlob = await compressImage(file, 600, 600, 0.85);

    if (storage) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const storagePath = `profile_photos/${userId}_${Date.now()}.${fileExt}`;
        const storageRef = ref(storage, storagePath);

        const snapshot = await uploadBytes(storageRef, compressedBlob, {
          contentType: file.type || 'image/jpeg',
          customMetadata: {
            uploadedBy: userId,
            uploadedAt: new Date().toISOString()
          }
        });

        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      } catch (storageError) {
        console.warn('Firebase Storage direct upload warning, using robust data URL fallback:', storageError);
      }
    }

    // Fallback if storage failed or unconfigured
    const dataUrl = await fileToDataUrl(compressedBlob);
    return dataUrl;
  } catch (error) {
    console.error('Error during image processing:', error);
    // Last resort fallback
    return fileToDataUrl(file);
  }
}
