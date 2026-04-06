import { useState, useRef } from 'react'
import { Upload, FolderUp, Loader2 } from 'lucide-react'
import './FolderUpload.css'

export default function FolderUpload({ classroomId, onUploadComplete }) {
  const [files, setFiles] = useState([])
  const [paths, setPaths] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  function handleFolderSelect(e) {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length === 0) return

    const fileList = []
    const pathList = []

    selectedFiles.forEach((file) => {
      // webkitRelativePath gives us the folder hierarchy
      if (file.webkitRelativePath) {
        fileList.push(file)
        pathList.push(file.webkitRelativePath)
      }
    })

    setFiles(fileList)
    setPaths(pathList)
  }

  async function handleUpload() {
    if (files.length === 0) return

    setUploading(true)
    try {
      const { uploadFolder } = await import('../api/index.js')
      await uploadFolder(classroomId, files, paths)
      setFiles([])
      setPaths([])
      if (inputRef.current) inputRef.current.value = ''
      onUploadComplete()
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Upload failed. Please check the console for details.')
    } finally {
      setUploading(false)
    }
  }

  function handleClear() {
    setFiles([])
    setPaths([])
    if (inputRef.current) inputRef.current.value = ''
  }

  // Count unique folders from paths
  const folderCount = new Set(
    paths.map((p) => p.split('/').slice(0, -1).join('/'))
  ).size

  return (
    <div className="folder-upload" id="folder-upload-section">
      <div
        className={`upload-dropzone ${dragOver ? 'dropzone-active' : ''} ${files.length > 0 ? 'has-files' : ''}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false) }}
      >
        <input
          ref={inputRef}
          type="file"
          webkitdirectory=""
          multiple
          onChange={handleFolderSelect}
          className="upload-input"
          id="folder-upload-input"
          disabled={uploading}
        />

        {files.length === 0 ? (
          <div className="upload-placeholder">
            <div className="upload-icon-wrapper">
              <FolderUp size={28} />
            </div>
            <div className="upload-text">
              <strong>Select a folder to upload</strong>
              <span>Click to browse or drag a folder here</span>
            </div>
          </div>
        ) : (
          <div className="upload-preview">
            <div className="upload-icon-wrapper upload-ready">
              <Upload size={24} />
            </div>
            <div className="upload-text">
              <strong>{files.length} file{files.length !== 1 ? 's' : ''} selected</strong>
              <span>{folderCount} folder{folderCount !== 1 ? 's' : ''} detected</span>
            </div>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="upload-actions animate-fade-in">
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleClear}
            disabled={uploading}
          >
            Clear
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleUpload}
            disabled={uploading}
            id="upload-submit-btn"
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={14} />
                Upload {files.length} file{files.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
