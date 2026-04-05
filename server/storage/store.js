import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pool, { initializeDatabase } from '../db/connection.js';
import { deleteManagedS3Objects, getAccessibleResourceUrl } from '../services/s3.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, '..', 'data');
const dataFile = join(dataDir, 'store.json');

let mode = 'file';
let fileStore = null;
let writeQueue = Promise.resolve();

function timestamp() {
  return new Date().toISOString();
}

function createEmptyStore() {
  return {
    meta: {
      mode: 'file',
      created_at: timestamp(),
    },
    users: [{ id: 1, username: 'default_user', github_id: null, created_at: timestamp() }],
    courses: [],
    nodes: [],
    counters: {
      courses: 1,
      nodes: 1,
    },
  };
}

async function ensureFileStore() {
  if (fileStore) {
    return fileStore;
  }

  await mkdir(dataDir, { recursive: true });

  try {
    const raw = await readFile(dataFile, 'utf-8');
    fileStore = JSON.parse(raw);
  } catch {
    fileStore = createEmptyStore();
    await writeFile(dataFile, JSON.stringify(fileStore, null, 2));
  }

  return fileStore;
}

async function persistFileStore() {
  await ensureFileStore();
  writeQueue = writeQueue.then(() =>
    writeFile(dataFile, JSON.stringify(fileStore, null, 2))
  );
  return writeQueue;
}

function mapCourseWithProgress(course, nodes) {
  const lessons = nodes.filter(
    (node) => node.course_id === course.id && node.type === 'file'
  );
  const completedLessons = lessons.filter((node) => node.completed).length;

  return {
    ...course,
    total_lessons: lessons.length,
    completed_lessons: completedLessons,
    progress:
      lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0,
  };
}

async function mapNodeResource(node) {
  if (!node?.resource_url) {
    return node;
  }

  return {
    ...node,
    resource_url: await getAccessibleResourceUrl(node.resource_url),
  };
}

async function mapNodesWithAccessibleResources(nodes) {
  return Promise.all(nodes.map(mapNodeResource));
}

async function mapCreatedFilesWithAccessibleResources(files) {
  return Promise.all(
    files.map(async (file) => ({
      ...file,
      resource_url: await getAccessibleResourceUrl(file.resource_url),
    }))
  );
}

async function initMySqlMode() {
  await initializeDatabase();
  await pool.query('SELECT 1');
  mode = 'mysql';
  return mode;
}

async function initFileMode() {
  await ensureFileStore();
  mode = 'file';
  return mode;
}

export async function initializeStore() {
  try {
    return await initMySqlMode();
  } catch (error) {
    console.warn(
      `MySQL unavailable, switching to local JSON storage: ${error.code || error.message}`
    );
    return initFileMode();
  }
}

export function getStorageMode() {
  return mode;
}

export async function createCourse(title, userId = 1) {
  if (mode === 'mysql') {
    const [result] = await pool.execute(
      'INSERT INTO courses (user_id, title) VALUES (?, ?)',
      [userId, title]
    );

    return {
      id: result.insertId,
      user_id: userId,
      title,
      created_at: timestamp(),
      total_lessons: 0,
      completed_lessons: 0,
      progress: 0,
    };
  }

  const store = await ensureFileStore();
  const course = {
    id: store.counters.courses++,
    user_id: userId,
    title,
    created_at: timestamp(),
  };

  store.courses.push(course);
  await persistFileStore();

  return mapCourseWithProgress(course, store.nodes);
}

export async function listCourses(userId = 1) {
  if (mode === 'mysql') {
    const [courses] = await pool.execute(
      `SELECT
        c.id, c.user_id, c.title, c.created_at,
        COUNT(CASE WHEN n.type = 'file' THEN 1 END) AS total_lessons,
        COUNT(CASE WHEN n.type = 'file' AND n.completed = true THEN 1 END) AS completed_lessons
      FROM courses c
      LEFT JOIN nodes n ON n.course_id = c.id
      WHERE c.user_id = ?
      GROUP BY c.id
      ORDER BY c.created_at DESC`,
      [userId]
    );

    return courses.map((course) => ({
      ...course,
      progress:
        course.total_lessons > 0
          ? Math.round((course.completed_lessons / course.total_lessons) * 100)
          : 0,
    }));
  }

  const store = await ensureFileStore();
  return [...store.courses]
    .filter((course) => course.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((course) => mapCourseWithProgress(course, store.nodes));
}

export async function getCourseById(courseId, userId = 1) {
  const normalizedId = Number(courseId);

  if (mode === 'mysql') {
    const [rows] = await pool.execute(
      `SELECT
        c.id, c.user_id, c.title, c.created_at,
        COUNT(CASE WHEN n.type = 'file' THEN 1 END) AS total_lessons,
        COUNT(CASE WHEN n.type = 'file' AND n.completed = true THEN 1 END) AS completed_lessons
      FROM courses c
      LEFT JOIN nodes n ON n.course_id = c.id
      WHERE c.id = ? AND c.user_id = ?
      GROUP BY c.id`,
      [normalizedId, userId]
    );

    if (rows.length === 0) {
      return null;
    }

    const course = rows[0];
    return {
      ...course,
      progress:
        course.total_lessons > 0
          ? Math.round((course.completed_lessons / course.total_lessons) * 100)
          : 0,
    };
  }

  const store = await ensureFileStore();
  const course = store.courses.find(
    (item) => item.id === normalizedId && item.user_id === userId
  );

  return course ? mapCourseWithProgress(course, store.nodes) : null;
}

export async function deleteCourseById(courseId, userId = 1) {
  const normalizedId = Number(courseId);

  if (mode === 'mysql') {
    const connection = await pool.getConnection();

    try {
      const [resourceRows] = await connection.execute(
        `SELECT n.resource_url
        FROM nodes n
        JOIN courses c ON c.id = n.course_id
        WHERE c.id = ? AND c.user_id = ? AND n.resource_url IS NOT NULL`,
        [normalizedId, userId]
      );

      const [result] = await connection.execute(
        'DELETE FROM courses WHERE id = ? AND user_id = ?',
        [normalizedId, userId]
      );

      if (result.affectedRows === 0) {
        return false;
      }

      try {
        await deleteManagedS3Objects(resourceRows.map((row) => row.resource_url));
      } catch (cleanupError) {
        console.warn(`S3 cleanup failed for course ${normalizedId}: ${cleanupError.message}`);
      }

      return true;
    } finally {
      connection.release();
    }
  }

  const store = await ensureFileStore();
  const previousLength = store.courses.length;
  const deletedResources = store.nodes
    .filter((node) => node.course_id === normalizedId)
    .map((node) => node.resource_url)
    .filter(Boolean);
  store.courses = store.courses.filter(
    (course) => !(course.id === normalizedId && course.user_id === userId)
  );

  if (store.courses.length === previousLength) {
    return false;
  }

  store.nodes = store.nodes.filter((node) => node.course_id !== normalizedId);
  await persistFileStore();

  try {
    await deleteManagedS3Objects(deletedResources);
  } catch (cleanupError) {
    console.warn(`S3 cleanup failed for course ${normalizedId}: ${cleanupError.message}`);
  }

  return true;
}

export async function listNodesByCourse(courseId, userId = 1) {
  const normalizedId = Number(courseId);

  if (mode === 'mysql') {
    const [courseRows] = await pool.execute(
      'SELECT id FROM courses WHERE id = ? AND user_id = ?',
      [normalizedId, userId]
    );

    if (courseRows.length === 0) {
      return null;
    }

    const [nodes] = await pool.execute(
      `SELECT * FROM nodes
      WHERE course_id = ?
      ORDER BY CASE WHEN type = 'folder' THEN 0 ELSE 1 END, name ASC`,
      [normalizedId]
    );
    return mapNodesWithAccessibleResources(nodes);
  }

  const store = await ensureFileStore();
  const courseExists = store.courses.some(
    (course) => course.id === normalizedId && course.user_id === userId
  );

  if (!courseExists) {
    return null;
  }

  return mapNodesWithAccessibleResources(
    [...store.nodes]
    .filter((node) => node.course_id === normalizedId)
    .sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'folder' ? -1 : 1;
    })
  );
}

export async function updateNodeCompletion(nodeId, completed, userId = 1) {
  const normalizedId = Number(nodeId);

  if (mode === 'mysql') {
    const [result] = await pool.execute(
      `UPDATE nodes n
      JOIN courses c ON c.id = n.course_id
      SET n.completed = ?
      WHERE n.id = ? AND c.user_id = ?`,
      [completed, normalizedId, userId]
    );
    return result.affectedRows > 0;
  }

  const store = await ensureFileStore();
  const node = store.nodes.find((item) => item.id === normalizedId);

  if (!node) {
    return false;
  }

  const course = store.courses.find(
    (item) => item.id === node.course_id && item.user_id === userId
  );

  if (!course) {
    return false;
  }

  node.completed = completed;
  await persistFileStore();
  return true;
}

function collectDescendantNodeIds(nodes, rootId) {
  const ids = new Set([rootId]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const node of nodes) {
      if (node.parent_id !== null && ids.has(node.parent_id) && !ids.has(node.id)) {
        ids.add(node.id);
        changed = true;
      }
    }
  }

  return ids;
}

export async function deleteNodeById(nodeId, userId = 1) {
  const normalizedId = Number(nodeId);

  if (mode === 'mysql') {
    const connection = await pool.getConnection();

    try {
      const [nodeRows] = await connection.execute(
        `SELECT n.id, n.course_id
        FROM nodes n
        JOIN courses c ON c.id = n.course_id
        WHERE n.id = ? AND c.user_id = ?`,
        [normalizedId, userId]
      );

      if (nodeRows.length === 0) {
        return false;
      }

      const courseId = nodeRows[0].course_id;
      const idsToVisit = [normalizedId];
      const idsToDelete = new Set();

      while (idsToVisit.length > 0) {
        const currentId = idsToVisit.pop();
        if (idsToDelete.has(currentId)) {
          continue;
        }

        idsToDelete.add(currentId);

        const [childRows] = await connection.execute(
          'SELECT id FROM nodes WHERE course_id = ? AND parent_id = ?',
          [courseId, currentId]
        );

        for (const child of childRows) {
          idsToVisit.push(child.id);
        }
      }

      const nodeIds = [...idsToDelete];
      const placeholders = nodeIds.map(() => '?').join(', ');
      const [resourceRows] = await connection.execute(
        `SELECT resource_url FROM nodes
        WHERE id IN (${placeholders}) AND resource_url IS NOT NULL`,
        nodeIds
      );

      const [result] = await connection.execute(
        `DELETE FROM nodes
        WHERE id IN (${placeholders})`,
        nodeIds
      );

      if (result.affectedRows === 0) {
        return false;
      }

      try {
        await deleteManagedS3Objects(resourceRows.map((row) => row.resource_url));
      } catch (cleanupError) {
        console.warn(`S3 cleanup failed for node ${normalizedId}: ${cleanupError.message}`);
      }

      return true;
    } finally {
      connection.release();
    }
  }

  const store = await ensureFileStore();
  const node = store.nodes.find((item) => item.id === normalizedId);

  if (!node) {
    return false;
  }

  const course = store.courses.find(
    (item) => item.id === node.course_id && item.user_id === userId
  );

  if (!course) {
    return false;
  }

  const idsToDelete = collectDescendantNodeIds(store.nodes, normalizedId);
  const deletedResources = store.nodes
    .filter((item) => idsToDelete.has(item.id))
    .map((item) => item.resource_url)
    .filter(Boolean);
  store.nodes = store.nodes.filter((item) => !idsToDelete.has(item.id));
  await persistFileStore();

  try {
    await deleteManagedS3Objects(deletedResources);
  } catch (cleanupError) {
    console.warn(`S3 cleanup failed for node ${normalizedId}: ${cleanupError.message}`);
  }

  return true;
}

export async function addUploadedTree({ courseId, files, userId = 1 }) {
  const normalizedCourseId = Number(courseId);

  if (mode === 'mysql') {
    const connection = await pool.getConnection();

    try {
      const [courseRows] = await connection.execute(
        'SELECT id FROM courses WHERE id = ? AND user_id = ?',
        [normalizedCourseId, userId]
      );

      if (courseRows.length === 0) {
        return null;
      }

      await connection.beginTransaction();

      const folderMap = new Map();
      const createdFiles = [];

      for (const file of files) {
        const segments = file.relativePath.split('/').filter(Boolean);
        let parentId = null;

        for (let index = 0; index < segments.length - 1; index += 1) {
          const folderPath = segments.slice(0, index + 1).join('/');
          const folderName = segments[index];

          if (folderMap.has(folderPath)) {
            parentId = folderMap.get(folderPath);
            continue;
          }

          const [existing] = await connection.execute(
            `SELECT id FROM nodes
            WHERE course_id = ? AND name = ? AND type = 'folder' AND ${
              parentId === null ? 'parent_id IS NULL' : 'parent_id = ?'
            }`,
            parentId === null
              ? [normalizedCourseId, folderName]
              : [normalizedCourseId, folderName, parentId]
          );

          if (existing.length > 0) {
            parentId = existing[0].id;
          } else {
            const [insertResult] = await connection.execute(
              'INSERT INTO nodes (course_id, name, type, parent_id) VALUES (?, ?, ?, ?)',
              [normalizedCourseId, folderName, 'folder', parentId]
            );
            parentId = insertResult.insertId;
          }

          folderMap.set(folderPath, parentId);
        }

        const fileName = segments[segments.length - 1];
        const [insertResult] = await connection.execute(
          'INSERT INTO nodes (course_id, name, type, parent_id, resource_url, completed) VALUES (?, ?, ?, ?, ?, ?)',
          [
            normalizedCourseId,
            fileName,
            'file',
            parentId,
            file.resourceUrl,
            false,
          ]
        );

        createdFiles.push({
          id: insertResult.insertId,
          name: fileName,
          resource_url: file.resourceUrl,
          storage_provider: file.storageProvider || 'local',
        });
      }

      await connection.commit();
      return mapCreatedFilesWithAccessibleResources(createdFiles);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  const store = await ensureFileStore();
  const course = store.courses.find(
    (item) => item.id === normalizedCourseId && item.user_id === userId
  );

  if (!course) {
    return null;
  }

  const folderMap = new Map();
  const createdFiles = [];

  for (const file of files) {
    const segments = file.relativePath.split('/').filter(Boolean);
    let parentId = null;

    for (let index = 0; index < segments.length - 1; index += 1) {
      const folderPath = segments.slice(0, index + 1).join('/');
      const folderName = segments[index];

      if (folderMap.has(folderPath)) {
        parentId = folderMap.get(folderPath);
        continue;
      }

      const existingFolder = store.nodes.find(
        (node) =>
          node.course_id === normalizedCourseId &&
          node.type === 'folder' &&
          node.name === folderName &&
          node.parent_id === parentId
      );

      if (existingFolder) {
        parentId = existingFolder.id;
      } else {
        const folderNode = {
          id: store.counters.nodes++,
          course_id: normalizedCourseId,
          name: folderName,
          type: 'folder',
          parent_id: parentId,
          resource_url: null,
          completed: false,
        };
        store.nodes.push(folderNode);
        parentId = folderNode.id;
      }

      folderMap.set(folderPath, parentId);
    }

    const fileName = segments[segments.length - 1];
    const fileNode = {
      id: store.counters.nodes++,
      course_id: normalizedCourseId,
      name: fileName,
      type: 'file',
      parent_id: parentId,
      resource_url: file.resourceUrl,
      completed: false,
    };

    store.nodes.push(fileNode);
    createdFiles.push({
      id: fileNode.id,
      name: fileName,
      resource_url: file.resourceUrl,
      storage_provider: file.storageProvider || 'local',
    });
  }

  await persistFileStore();
  return mapCreatedFilesWithAccessibleResources(createdFiles);
}
