import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('learnlog_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──

export async function registerUser(username, email, password) {
  const { data } = await api.post('/auth/register', { username, email, password });
  return data;
}

export async function loginUser(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data;
}

// ── Classrooms ──

export async function getClassrooms() {
  const { data } = await api.get('/classrooms');
  return data;
}

export async function getClassroom(id) {
  const { data } = await api.get(`/classrooms/${id}`);
  return data;
}

export async function createClassroom(name, description) {
  const { data } = await api.post('/classrooms', { name, description });
  return data;
}

export async function deleteClassroom(id) {
  const { data } = await api.delete(`/classrooms/${id}`);
  return data;
}

export async function getClassroomStudents(id) {
  const { data } = await api.get(`/classrooms/${id}/students`);
  return data;
}

export async function getClassroomPending(id) {
  const { data } = await api.get(`/classrooms/${id}/pending`);
  return data;
}

// ── Memberships ──

export async function joinClassroom(invite_code) {
  const { data } = await api.post('/memberships/join', { invite_code });
  return data;
}

export async function approveRequest(membershipId) {
  const { data } = await api.put(`/memberships/${membershipId}/approve`);
  return data;
}

export async function rejectRequest(membershipId) {
  const { data } = await api.put(`/memberships/${membershipId}/reject`);
  return data;
}

// ── Nodes ──

export async function getNodes(classroomId) {
  const { data } = await api.get('/nodes', { params: { classroomId } });
  return data;
}

export async function updateProgress(nodeId, completed) {
  const { data } = await api.put(`/nodes/${nodeId}/progress`, { completed });
  return data;
}

export async function deleteNode(id) {
  const { data } = await api.delete(`/nodes/${id}`);
  return data;
}

export async function renameNode(id, name) {
  const { data } = await api.put(`/nodes/${id}/rename`, { name });
  return data;
}

// ── Upload ──

export async function uploadFolder(classroomId, files, paths, parentId = null) {
  const formData = new FormData();
  formData.append('classroomId', classroomId);
  formData.append('paths', JSON.stringify(paths));
  if (parentId) formData.append('parentId', parentId);
  files.forEach((file) => formData.append('files', file));

  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export default api;
