import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Upload, MapPin, Phone, Users, FileText } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Halls = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingHall, setEditingHall] = useState(null);

  const [formData, setFormData] = useState({
    hall_name: '',
    hall_location: '',
    hall_contact: '',
    license: '',
    capacity: '',
    hallPoster: null
  });

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/hall/get');
      if (response.data.success) {
        setHalls(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch halls');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('hall_name', formData.hall_name);
    data.append('hall_location', formData.hall_location);
    data.append('hall_contact', formData.hall_contact);
    data.append('license', formData.license);
    data.append('capacity', formData.capacity);
    if (formData.hallPoster) data.append('hallPoster', formData.hallPoster);

    try {
      if (editingHall) {
        await axios.put(`http://localhost:3000/api/hall/update/${editingHall.id}`, data, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Hall updated successfully');
      } else {
        await axios.post('http://localhost:3000/api/hall/register', data, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Hall registered successfully');
      }
      setShowModal(false);
      fetchHalls();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this hall?')) return;
    
    try {
      await axios.delete(`http://localhost:3000/api/hall/delete/${id}`, {
        withCredentials: true
      });
      toast.success('Hall deactivated successfully');
      fetchHalls();
    } catch (error) {
      toast.error('Failed to deactivate hall');
    }
  };

  const openEditModal = (hall) => {
    setEditingHall(hall);
    setFormData({
      hall_name: hall.hall_name,
      hall_location: hall.hall_location,
      hall_contact: hall.hall_contact,
      license: hall.license,
      capacity: hall.capacity,
      hallPoster: null
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      hall_name: '',
      hall_location: '',
      hall_contact: '',
      license: '',
      capacity: '',
      hallPoster: null
    });
    setEditingHall(null);
  };

  const filteredHalls = halls.filter(hall => 
    hall.hall_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Halls</h1>
          <p className="mt-2 text-slate-400">Manage your cinema halls</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 rounded-lg bg-[#D72626] px-4 py-2 font-semibold text-white hover:bg-[#D72626]/90 transition-colors"
        >
          <Plus size={20} />
          Add Hall
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search halls..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl bg-black border border-white/10 py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-[#D72626] focus:outline-none"
        />
      </div>

      {/* Halls Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredHalls.map((hall) => (
          <div key={hall.id} className={`group relative overflow-hidden rounded-xl bg-black border ${hall.isActive ? 'border-white/10' : 'border-red-900/50 opacity-75'} transition-all hover:border-[#D72626]/50`}>
            <div className="aspect-video w-full bg-slate-800 relative">
              {hall.hallPoster ? (
                <img 
                  src={`http://localhost:3000/uploads/${hall.hallPoster}`} 
                  alt={hall.hall_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <MapPin size={48} className="text-slate-600" />
                </div>
              )}
              <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/80 text-xs text-white">
                {hall.isActive ? 'Active' : 'Inactive'}
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-4">
                <button 
                  onClick={() => openEditModal(hall)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <Edit2 size={20} />
                </button>
                {hall.isActive && (
                  <button 
                    onClick={() => handleDelete(hall.id)}
                    className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-bold text-white text-lg">{hall.hall_name}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin size={16} className="text-[#D72626]" />
                <span className="truncate">{hall.hall_location}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Phone size={14} />
                  <span>{hall.hall_contact}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} />
                  <span>{hall.capacity} Seats</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-[#1a1a1a] p-6 shadow-xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingHall ? 'Edit Hall' : 'Add New Hall'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Hall Name</label>
                  <input
                    type="text"
                    name="hall_name"
                    value={formData.hall_name}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Location</label>
                  <input
                    type="text"
                    name="hall_location"
                    value={formData.hall_location}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Contact</label>
                  <input
                    type="text"
                    name="hall_contact"
                    value={formData.hall_contact}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-300">License Number</label>
                  <input
                    type="text"
                    name="license"
                    value={formData.license}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Hall Poster</label>
                <div className="relative">
                  <input
                    type="file"
                    name="hallPoster"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    id="hall-poster-upload"
                  />
                  <label
                    htmlFor="hall-poster-upload"
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/10 bg-black/50 p-4 text-slate-400 hover:border-[#D72626]/50 hover:text-[#D72626] transition-colors"
                  >
                    <Upload size={20} />
                    <span>{formData.hallPoster ? formData.hallPoster.name : 'Upload Hall Image'}</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg px-6 py-2 font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#D72626] px-6 py-2 font-semibold text-white hover:bg-[#D72626]/90 transition-colors"
                >
                  {editingHall ? 'Update Hall' : 'Add Hall'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Halls;