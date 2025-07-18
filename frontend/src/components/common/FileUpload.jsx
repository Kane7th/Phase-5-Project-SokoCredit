import React, { useState, useRef } from 'react'
import { Upload, X, File, Check } from 'lucide-react'

const FileUpload = ({ 
  onFileSelect, 
  acceptedTypes = '.pdf,.jpg,.jpeg,.png',
  maxSize = 5, // MB
  label,
  required = false,
  existingFile = null
}) => {
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(existingFile)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSize}MB`
    }

    // Check file type
    const allowedTypes = acceptedTypes.split(',').map(type => type.trim())
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    
    if (!allowedTypes.includes(fileExtension)) {
      return `Only ${acceptedTypes} files are allowed`
    }

    return null
  }

  const handleFileSelect = (file) => {
    const validationError = validateFile(file)
    
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setUploadedFile({
      file,
      name: file.name,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    })
    
    onFileSelect(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onFileSelect(null)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}

      {!uploadedFile ? (
        <div
          className={`file-upload-area ${dragOver ? 'dragover' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="file-upload-icon" />
          <div className="file-upload-text">
            <strong>Click to upload</strong> or drag and drop
          </div>
          <div className="file-upload-hint">
            {acceptedTypes} up to {maxSize}MB
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="uploaded-file">
          <div className="file-info">
            {uploadedFile.preview ? (
              <img 
                src={uploadedFile.preview} 
                alt="Preview" 
                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
              />
            ) : (
              <File size={20} />
            )}
            <div>
              <div className="file-name">{uploadedFile.name}</div>
              <div className="file-size">{formatFileSize(uploadedFile.size)}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="remove-file"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="text-error">{error}</div>
      )}
    </div>
  )
}

export default FileUpload