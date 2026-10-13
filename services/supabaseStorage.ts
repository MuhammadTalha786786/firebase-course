import 'react-native-get-random-values';
import { supabase } from '../config/initSupabase';
import { decode } from 'base64-arraybuffer';
import RNFS from 'react-native-fs';
import uuid from 'react-native-uuid';

export interface SupabaseUploadOptions {
  bucket?: string;
  folder?: string;
  fileName?: string;
  contentType?: string;
  base64Data?: string;
}

/**
 * Derives content type / MIME type from a file path or extension.
 */
export const getContentTypeFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'mp4':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'image/jpeg';
  }
};

/**
 * Extracts file extension including dot, or defaults to .jpg.
 */
export const getFileExtension = (path: string): string => {
  if (path && path.includes('.')) {
    const ext = path.substring(path.lastIndexOf('.'));
    return ext.split('?')[0].toLowerCase();
  }
  return '.jpg';
};

/**
 * Uploads a local file or base64 image data to Supabase Storage and returns its public URL.
 *
 * @param filePathOrUri - Local file path (e.g. from react-native-image-crop-picker)
 * @param options - Upload options (bucket, folder, base64 data, custom filename, contentType)
 * @returns Public URL of the uploaded file
 */
export const uploadFileToSupabase = async (
  filePathOrUri: string,
  options: SupabaseUploadOptions = {}
): Promise<string> => {
  const bucket = options.bucket || 'social-bea';
  const folder = options.folder ? `${options.folder}/` : '';
  const ext = getFileExtension(filePathOrUri);
  const randomId = typeof uuid?.v4 === 'function' ? uuid.v4() : `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const fileName = options.fileName || `${randomId}${ext}`;
  const targetPath = `${folder}${fileName}`;
  const contentType =
    options.contentType || getContentTypeFromPath(filePathOrUri);

  try {
    let base64 = options.base64Data;

    if (!base64) {
      const cleanPath = filePathOrUri.startsWith('file://')
        ? filePathOrUri.replace('file://', '')
        : filePathOrUri;
      base64 = await RNFS.readFile(cleanPath, 'base64');
    }

    const arrayBuffer = decode(base64);

    const { data: uploadData, error } = await supabase.storage
      .from(bucket)
      .upload(targetPath, arrayBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      const errAny = error as any;
      if (
        error.message?.includes('Bucket not found') ||
        errAny.code === 'NoSuchBucket' ||
        errAny.statusCode === '404'
      ) {
        throw new Error(
          `Supabase bucket '${bucket}' not found. Please create a public bucket named '${bucket}' in your Supabase Dashboard under Storage.`
        );
      }
      if (
        errAny.statusCode === '403' ||
        error.message?.includes('row-level security') ||
        errAny.code === 'AccessDenied'
      ) {
        throw new Error(
          `Permission denied on bucket '${bucket}'. Please make sure the bucket is public or has INSERT policies in Supabase Storage.`
        );
      }
      throw new Error(error.message || 'Failed to upload to Supabase Storage');
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(targetPath);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to retrieve public URL from Supabase Storage');
    }

    console.log('File uploaded to Supabase Storage:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Error in uploadFileToSupabase:', error);
    throw error;
  }
};

/**
 * Deletes a file from Supabase Storage.
 */
export const deleteFileFromSupabase = async (
  filePath: string,
  bucket: string = 'social-bea'
): Promise<void> => {
  const { error } = await supabase.storage.from(bucket).remove([filePath]);
  if (error) {
    console.error('Supabase storage delete error:', error);
    throw error;
  }
};

/**
 * Retrieves the public URL for a given file path in Supabase Storage.
 */
export const getSupabaseFileUrl = (
  filePath: string,
  bucket: string = 'social-bea'
): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
};
