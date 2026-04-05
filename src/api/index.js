import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export async function getCourses() {
  const { data } = await api.get('/courses')
  return data
}

export async function createCourse(payload) {
  const { data } = await api.post('/courses', payload)
  return data
}

export async function deleteCourse(courseId) {
  const { data } = await api.delete(`/courses/${courseId}`)
  return data
}

export async function getCourse(courseId) {
  const { data } = await api.get(`/courses/${courseId}`)
  return data
}

export async function getNodes(courseId) {
  const { data } = await api.get('/nodes', {
    params: { courseId },
  })
  return data
}

export async function updateNode(nodeId, payload) {
  const { data } = await api.put(`/nodes/${nodeId}`, payload)
  return data
}

export async function deleteNode(nodeId) {
  const { data } = await api.delete(`/nodes/${nodeId}`)
  return data
}

export async function uploadFolder(courseId, files) {
  const formData = new FormData()
  const paths = []

  files.forEach((file) => {
    formData.append('files', file)
    paths.push(file.webkitRelativePath || file.name)
  })

  formData.append('courseId', String(courseId))
  formData.append('paths', JSON.stringify(paths))

  const { data } = await api.post('/upload', formData)
  return data
}

export async function getHealth() {
  const { data } = await api.get('/health')
  return data
}
