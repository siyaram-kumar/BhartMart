// Firebase Storage upload helpers
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export async function uploadImage(path: string, file: File): Promise<string> {
  const r = ref(storage, path);
  await uploadBytes(r, file);
  return await getDownloadURL(r);
}

export async function uploadProductImage(productId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  return uploadImage(`products/${productId}/${Date.now()}.${ext}`, file);
}

export async function uploadUserAvatar(uid: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  return uploadImage(`users/${uid}/avatar.${ext}`, file);
}

export async function deleteStorageFile(path: string) {
  try { await deleteObject(ref(storage, path)); } catch (e) { console.error('delete file', e); }
}
