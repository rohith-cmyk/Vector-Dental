'use client'

import { useState, useRef, DragEvent, ChangeEvent, useMemo, useEffect } from 'react'
import { Upload, X, File as FileIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  accept?: string
  maxSize?: number // in bytes
}

export function FileUpload({ files, onFilesChange, accept = '.jpg,.jpeg,.png,.pdf,.dcm,.dicom', maxSize = 10 * 1024 * 1024 }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File "${file.name}" is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`
    }

    // Check file type if accept is specified
    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim().toLowerCase())
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      const fileType = file.type.toLowerCase()
      
      const isAccepted = acceptedTypes.some(type => 
        fileExtension === type || fileType.includes(type.replace('.', ''))
      )
      
      if (!isAccepted) {
        return `File "${file.name}" is not a supported type. Accepted: ${accept}`
      }
    }

    return null
  }

  const handleFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const validFiles: File[] = []
    const errors: string[] = []

    fileArray.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(error)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      alert(errors.join('\n'))
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles])
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  const isImageFile = (file: File) => {
    if (file.type.startsWith('image/')) return true
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)
  }

  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        url: isImageFile(file) ? URL.createObjectURL(file) : null,
      })),
    [files]
  )

  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (preview.url) {
          URL.revokeObjectURL(preview.url)
        }
      })
    }
  }, [previews])

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border border-gray-200 rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-emerald-400 bg-emerald-50'
            : 'bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50/50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center">
            <FileIcon className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              Browse or drop files
            </p>
            <p className="text-xs text-gray-500 mt-1">
              X-Rays, DICOM, JPG, PDF and more
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Select Files
          </button>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {preview.url ? (
                  <img
                    src={preview.url}
                    alt={preview.file.name}
                    className="w-[100px] h-[100px] rounded-md object-cover border border-gray-200 flex-shrink-0"
                  />
                ) : (
                  <FileIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {preview.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(preview.file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(index)
                }}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

