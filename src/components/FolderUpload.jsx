import { useEffect, useRef, useState } from 'react'

export function FolderUpload({ courseId, onUpload, isUploading }) {
  const inputRef = useRef(null)
  const filesInputRef = useRef(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploadMode, setUploadMode] = useState('folder')

  useEffect(() => {
    if (!inputRef.current) {
      return
    }

    inputRef.current.setAttribute('webkitdirectory', '')
    inputRef.current.setAttribute('directory', '')
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (selectedFiles.length === 0) {
      return
    }

    await onUpload(courseId, selectedFiles)
    setSelectedFiles([])
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    if (filesInputRef.current) {
      filesInputRef.current.value = ''
    }
  }

  return (
    <section className="upload-card">
      <div className="upload-card__head">
        <div>
          <h2>Upload content</h2>
          <p>
            Upload a full course directory, or individual files. LearnLog preserves folder hierarchies.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="upload-field">
          <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap', fontSize: '0.95rem' }}>
              <input type="radio" name="mode" style={{ width: 'auto', margin: 0, cursor: 'pointer' }} checked={uploadMode === 'folder'} onChange={() => { setSelectedFiles([]); setUploadMode('folder') }} />
              Folder
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap', fontSize: '0.95rem' }}>
              <input type="radio" name="mode" style={{ width: 'auto', margin: 0, cursor: 'pointer' }} checked={uploadMode === 'files'} onChange={() => { setSelectedFiles([]); setUploadMode('files') }} />
              Files
            </label>
          </div>
          
          <input
            style={{ display: uploadMode === 'folder' ? 'block' : 'none', padding: '10px 0' }}
            ref={inputRef}
            type="file"
            multiple
            onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))}
          />
          <input
            style={{ display: uploadMode === 'files' ? 'block' : 'none', padding: '10px 0' }}
            ref={filesInputRef}
            type="file"
            multiple
            onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))}
          />
          
          <p className="muted-copy" style={{ marginTop: '16px' }}>
            {selectedFiles.length === 0
              ? `No ${uploadMode === 'folder' ? 'folder' : 'files'} selected yet.`
              : `${selectedFiles.length} files ready to upload.`}
          </p>
        </div>

        {selectedFiles.length > 0 ? (
          <ol className="upload-list">
            {selectedFiles.slice(0, 6).map((file) => (
              <li key={file.webkitRelativePath || file.name}>{file.webkitRelativePath || file.name}</li>
            ))}
            {selectedFiles.length > 6 ? <li>…and {selectedFiles.length - 6} more files</li> : null}
          </ol>
        ) : null}

        <div className="upload-card__actions">
          <button className="button" type="submit" disabled={isUploading || selectedFiles.length === 0}>
            {isUploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </form>
    </section>
  )
}
