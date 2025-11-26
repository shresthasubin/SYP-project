import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const PosterUpload = ({ onFileSelect, previewUrl: initialPreview }) => {
  const [preview, setPreview] = useState(initialPreview || null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPG or PNG.');
      return false;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB
      toast.error('File size too large. Max 2MB allowed.');
      return false;
    }
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        handleFile(file);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        handleFile(file);
      }
    }
  };

  const handleFile = (file) => {
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onFileSelect(file, objectUrl); // Pass both file and preview URL
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setPreview(null);
    onFileSelect(null, null);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-400 mb-1">Movie Poster</label>
      
      <div 
        className={`relative h-64 w-full rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden
          ${dragActive ? 'border-neon-blue bg-neon-blue/5' : 'border-gray-700 hover:border-gray-500 bg-dark-bg'}
          ${preview ? 'border-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          className="hidden" 
          id="poster-upload"
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleChange}
        />
        
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={removeImage}
                className="bg-red-500/80 p-2 rounded-full text-white hover:bg-red-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </>
        ) : (
          <label htmlFor="poster-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
            <div className="bg-gray-800 p-4 rounded-full mb-3">
              <Upload size={24} className="text-neon-blue" />
            </div>
            <p className="text-sm font-medium text-gray-300">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG (max 2MB)</p>
          </label>
        )}
      </div>
    </div>
  );
};

export default PosterUpload;
