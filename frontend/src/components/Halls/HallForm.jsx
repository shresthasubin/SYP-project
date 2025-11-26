import React, { useState, useEffect } from 'react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const HallForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '2D',
    capacity: '',
    location: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        type: initialData.type || '2D',
        capacity: initialData.capacity || '',
        location: initialData.location || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.capacity || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Hall Name *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Hall A"
        />
        
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-400">Hall Type *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="bg-dark-bg border border-gray-700 focus:border-neon-blue rounded-lg px-4 py-2.5 text-white outline-none transition-colors"
          >
            <option value="2D">Standard 2D</option>
            <option value="3D">IMAX 3D</option>
            <option value="VIP">VIP Lounge</option>
            <option value="4DX">4DX</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Capacity *"
          name="capacity"
          type="number"
          value={formData.capacity}
          onChange={handleChange}
          placeholder="e.g. 150"
        />
        <Input
          label="Location *"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g. Floor 2, East Wing"
        />
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          <Save size={18} />
          {initialData ? 'Update Hall' : 'Add Hall'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X size={18} />
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default HallForm;
