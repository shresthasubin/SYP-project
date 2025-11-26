import React, { useState, useEffect } from 'react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import PosterUpload from '../Upload/PosterUpload';
import { Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const MovieForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    duration: '',
    releaseDate: '',
    trailerLink: '',
    poster: null,
  });
  const [posterPreview, setPosterPreview] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        genre: initialData.genre || '',
        duration: initialData.duration || '',
        releaseDate: initialData.releaseDate || '',
        trailerLink: initialData.trailerLink || '',
        poster: initialData.poster || null,
      });
      if (typeof initialData.poster === 'string') {
        setPosterPreview(initialData.poster);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePosterSelect = (file, previewUrl) => {
    setFormData(prev => ({ ...prev, poster: previewUrl })); // In a real app, we'd upload the file. Here we use the preview URL as the "path"
    setPosterPreview(previewUrl);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.genre) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Poster */}
        <div className="lg:col-span-1">
          <PosterUpload 
            onFileSelect={handlePosterSelect} 
            previewUrl={posterPreview}
          />
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-4">
          <Input
            label="Movie Title *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Inception"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Genre *"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              placeholder="e.g. Sci-Fi"
            />
            <Input
              label="Duration (mins) *"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g. 148"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Release Date *"
              name="releaseDate"
              type="date"
              value={formData.releaseDate}
              onChange={handleChange}
            />
            <Input
              label="Trailer Link (Optional)"
              name="trailerLink"
              value={formData.trailerLink}
              onChange={handleChange}
              placeholder="https://youtube.com/..."
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-400">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="bg-dark-bg border border-gray-700 focus:border-neon-blue rounded-lg px-4 py-2.5 text-white outline-none transition-colors placeholder:text-gray-600 resize-none"
              placeholder="Movie plot summary..."
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" isLoading={isLoading} className="flex-1">
              <Save size={18} />
              {initialData ? 'Update Movie' : 'Add Movie'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X size={18} />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default MovieForm;
