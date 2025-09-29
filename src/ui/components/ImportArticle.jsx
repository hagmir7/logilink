import React from 'react'
import { UploadOutlined } from '@ant-design/icons'
import { Button, message, Upload } from 'antd'
import { api } from '../utils/api'
import { Download } from 'lucide-react'

const ImportArticle = () => {
  const customRequest = async ({ file, onSuccess, onError, onProgress }) => {
    const formData = new FormData()

    // Ensure file has proper name and extension
    const fileName = file.name || `upload.${getFileExtension(file.type)}`
    formData.append('file', file, fileName)

    try {
      const response = await api.post('articles/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress({ percent })
        },
      })

      onSuccess(response.data, file)
      message.success(`${file.name} file uploaded successfully`)
    } catch (error) {
      console.error('Upload error:', error)
      onError(error)

      const errorMessage =
        error.response?.data?.message || error.message || 'Upload failed'
      message.error(`${file.name} file upload failed: ${errorMessage}`)
    }
  }

  const getFileExtension = (mimeType) => {
    const mimeToExt = {
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'docx',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'xlsx',
      'application/vnd.ms-excel': 'xls',
      'text/csv': 'csv',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'text/plain': 'txt',
      'application/json': 'json',
    }
    return mimeToExt[mimeType] || 'bin'
  }

  const beforeUpload = (file) => {
    // File type validation
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain',
      'application/json',
    ]

    const isValidType = allowedTypes.includes(file.type)
    if (!isValidType) {
      message.error(
        'Please upload a valid file type (PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, JSON)!'
      )
      return false
    }

    // File size validation (10MB limit)
    const isLessThan10MB = file.size / 1024 / 1024 < 10
    if (!isLessThan10MB) {
      message.error('File must be smaller than 10MB!')
      return false
    }

    return true
  }

  const props = {
    name: 'file',
    customRequest,
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json',
    beforeUpload,
    showUploadList: true,
    maxCount: 1,
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList)
      }

      if (info.file.status === 'done') {
        console.log('Upload completed:', info.file.response)
      }
    },
  }

  return (
    <Upload {...props}>
      <Button icon={<Download size={15} />}>Importer</Button>
    </Upload>
  )
}

export default ImportArticle
