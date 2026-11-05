import React, { useState, useRef } from 'react';
import { Upload, X, Check, Image as ImageIcon, AlertCircle } from 'lucide-react';

/**
 * Standardized High-Resolution Photo Upload Area
 */
export function UploadArea({
  onUpload,
  accept = 'image/jpeg,image/png,image/webp,image/heic',
  maxSizeMB = 25,
  currentPhoto = null,
  photoName = '',
  onRemove,
  isUploading = false,
  title = 'Upload High-Resolution Photo',
  subtitle = 'Drag & drop your photograph here, or browse from device',
  supportedFormats = 'JPG, PNG, HEIC & WebP up to 25MB',
  className = '',
  style = {}
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      validateAndProcess(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcess(file);
    }
  };

  const validateAndProcess = (file) => {
    setErrorMessage('');
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setErrorMessage(`File size is ${fileSizeMB.toFixed(1)}MB. Maximum allowed is ${maxSizeMB}MB.`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (onUpload) {
      onUpload(previewUrl, file.name, file.size, file);
    }
  };

  return (
    <div className={`upload-area-wrapper ${className}`} style={{ width: '100%', ...style }}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {currentPhoto ? (
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1.5px solid #171717',
            backgroundColor: '#FAF9F6',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#E6E2D8' }}>
            <img src={currentPhoto} alt="Uploaded preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={14} color="#15803d" />
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#171717', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {photoName || 'Custom Photo Uploaded'}
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#73716C', display: 'block', marginTop: '2px' }}>
              Ready for high-fidelity 6-colour printing
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #D6D1C6',
                borderRadius: '4px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#171717',
                cursor: 'pointer'
              }}
            >
              Replace
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D6D1C6',
                  borderRadius: '4px',
                  padding: '0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8A8780',
                  cursor: 'pointer'
                }}
                title="Remove photo"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragEnter}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragOver ? 'var(--accent-bronze)' : '#D6D1C6'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '2.25rem 1.5rem',
            textAlign: 'center',
            backgroundColor: isDragOver ? 'rgba(155, 122, 80, 0.05)' : '#FAF9F6',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E6E2D8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDragOver ? 'var(--accent-bronze)' : '#171717',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Upload size={20} />
          </div>

          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#171717' }}>
              {isUploading ? 'Processing upload...' : title}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#73716C', marginTop: '2px' }}>
              {subtitle}
            </div>
          </div>

          <div style={{ fontSize: '0.7rem', color: '#9E9B94', marginTop: '4px' }}>
            {supportedFormats}
          </div>
        </div>
      )}

      {errorMessage && (
        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#b91c1c' }}>
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

export default UploadArea;
