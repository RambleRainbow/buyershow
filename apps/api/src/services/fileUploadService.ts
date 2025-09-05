import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { createHash } from 'node:crypto';
import { z } from 'zod';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface UploadResult {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  path: string;
  url: string;
}

export interface UploadError {
  code: string;
  message: string;
  details?: any;
}

const uploadSchema = z.object({
  maxSize: z.number().optional(),
  allowedTypes: z.array(z.string()).optional(),
});

export class FileUploadService {
  constructor(
    private fastify: FastifyInstance,
    private uploadDir: string = 'uploads/scenes'
  ) {}

  async init(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  private generateFilename(originalName: string, buffer: Buffer): string {
    const ext = path.extname(originalName);
    const hash = createHash('md5').update(buffer).digest('hex').substring(0, 8);
    const timestamp = Date.now();
    return `scene_${timestamp}_${hash}${ext}`;
  }

  private validateFile(file: MultipartFile): UploadError | null {
    if (!file.mimetype || !ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
      return {
        code: 'INVALID_FILE_TYPE',
        message: `File type ${file.mimetype} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        details: { allowedTypes: ALLOWED_MIME_TYPES, receivedType: file.mimetype },
      };
    }

    if (file.file.readableLength && file.file.readableLength > MAX_FILE_SIZE) {
      return {
        code: 'FILE_TOO_LARGE',
        message: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`,
        details: { maxSize: MAX_FILE_SIZE, receivedSize: file.file.readableLength },
      };
    }

    return null;
  }

  async uploadScenePhoto(file: MultipartFile): Promise<UploadResult> {
    const validationError = this.validateFile(file);
    if (validationError) {
      throw new Error(JSON.stringify(validationError));
    }

    const buffer = await file.toBuffer();
    
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error(JSON.stringify({
        code: 'FILE_TOO_LARGE',
        message: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`,
        details: { maxSize: MAX_FILE_SIZE, receivedSize: buffer.length },
      }));
    }

    const filename = this.generateFilename(file.filename || 'scene.jpg', buffer);
    const filePath = path.join(this.uploadDir, filename);

    try {
      await fs.writeFile(filePath, buffer);
      
      const stats = await fs.stat(filePath);
      
      return {
        filename,
        originalName: file.filename || 'scene.jpg',
        size: stats.size,
        mimeType: file.mimetype || 'application/octet-stream',
        path: filePath,
        url: `/static/uploads/scenes/${filename}`,
      };
    } catch (error) {
      this.fastify.log.error({ error, filename }, 'Failed to save uploaded file');
      throw new Error(JSON.stringify({
        code: 'UPLOAD_FAILED',
        message: 'Failed to save uploaded file',
        details: { filename, error: error instanceof Error ? error.message : 'Unknown error' },
      }));
    }
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = path.join(this.uploadDir, filename);
    
    try {
      await fs.unlink(filePath);
      this.fastify.log.info({ filename }, 'File deleted successfully');
    } catch (error) {
      this.fastify.log.error({ error, filename }, 'Failed to delete file');
      throw new Error(JSON.stringify({
        code: 'DELETE_FAILED',
        message: 'Failed to delete file',
        details: { filename, error: error instanceof Error ? error.message : 'Unknown error' },
      }));
    }
  }

  getFileInfo(filename: string): { path: string; url: string } {
    return {
      path: path.join(this.uploadDir, filename),
      url: `/static/uploads/scenes/${filename}`,
    };
  }
}

export const createFileUploadService = (fastify: FastifyInstance): FileUploadService => {
  return new FileUploadService(fastify);
};