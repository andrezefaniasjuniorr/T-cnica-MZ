import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

/**
 * Resizes and compresses an image client-side to ensure ultra-fast loading,
 * optimized especially for mobile devices and high-resolution camera photos (> 1MB).
 * Resizes max dimension to 800px with 0.60 (60%) JPEG quality for instant uploads.
 */
export async function compressImage(
  fileOrBlob: File | Blob,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.6
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If already a tiny blob (e.g. < 40KB), return quickly
    if (fileOrBlob.size < 40 * 1024 && fileOrBlob.type.startsWith('image/jpeg')) {
      resolve(fileOrBlob);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(fileOrBlob);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(fileOrBlob);
          return;
        }

        // Smooth high quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(fileOrBlob);
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
 * Compresses an image file, blob, or existing large data URL down to max 800px and 0.60 quality,
 * returning an optimized base64 Data URL.
 */
export async function compressImageToDataUrl(
  input: File | Blob | string,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.6
): Promise<string> {
  return new Promise((resolve, reject) => {
    const processImageSource = (src: string) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (e) {
          resolve(src);
        }
      };
      img.onerror = (err) => reject(err);
    };

    if (typeof input === 'string') {
      if (input.startsWith('http://') || input.startsWith('https://')) {
        // External URLs don't need local canvas compression unless needed
        resolve(input);
        return;
      }
      processImageSource(input);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (!result) {
          resolve('');
          return;
        }
        processImageSource(result);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(input);
    }
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
 * Uploads an image (File, Blob, or base64 data URL) to Firebase Storage after client-side compression.
 * Falls back safely to high-performance compressed base64 data URL if storage bucket is unreachable.
 */
export async function uploadImageFile(
  fileOrData: File | Blob | string,
  pathPrefix = 'uploads',
  customId?: string,
  maxWidth = 800,
  quality = 0.6
): Promise<string> {
  try {
    const compressedDataUrl = await compressImageToDataUrl(fileOrData, maxWidth, maxWidth, quality);

    if (storage) {
      try {
        const id = customId || `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const storagePath = `${pathPrefix}/${id}.jpg`;
        const storageRef = ref(storage, storagePath);

        // Convert base64 data URL to blob for Firebase upload
        const response = await fetch(compressedDataUrl);
        const blob = await response.blob();

        const snapshot = await uploadBytes(storageRef, blob, {
          contentType: 'image/jpeg',
          customMetadata: {
            uploadedAt: new Date().toISOString()
          }
        });

        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      } catch (storageError) {
        console.warn('Firebase Storage upload warning, using compressed data URL:', storageError);
      }
    }

    return compressedDataUrl;
  } catch (err) {
    console.error('Error during image upload/compression:', err);
    if (typeof fileOrData === 'string') return fileOrData;
    return fileToDataUrl(fileOrData);
  }
}

/**
 * Uploads a profile photo with compression up to 800px and 0.6 quality.
 */
export async function uploadProfilePhoto(userId: string, file: File | Blob | string): Promise<string> {
  const safeUserId = (userId || 'user').toString().trim();
  return uploadImageFile(file, 'profile_photos', `profile_${safeUserId}_${Date.now()}`, 800, 0.6);
}


