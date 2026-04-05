import { mkdir, writeFile } from 'fs/promises';
import { dirname, extname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsRoot = join(__dirname, '..', 'uploads');

function sanitizeSegment(value) {
  return value
    .replace(/\\/g, '/')
    .split('/')
    .map((segment) => {
      const trimmed = segment.trim();
      const base = trimmed.replace(/[^a-zA-Z0-9._-]+/g, '-');
      return base.replace(/^-+|-+$/g, '') || 'item';
    })
    .filter(Boolean)
    .join('/');
}

function ensureExtension(fileName, fallback = '.bin') {
  return extname(fileName) ? fileName : `${fileName}${fallback}`;
}

export async function saveFileLocally({ courseTitle, relativePath, buffer }) {
  const safeCourse = sanitizeSegment(courseTitle || 'course');
  const safePath = sanitizeSegment(relativePath || 'upload');
  const normalizedPath = ensureExtension(safePath);
  const destination = join(uploadsRoot, safeCourse, normalizedPath);

  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, buffer);

  return `/uploads/${safeCourse}/${normalizedPath}`;
}
