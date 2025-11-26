import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import Table from '../../components/UI/Table';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import HallForm from '../../components/Halls/HallForm';
import { fetchHalls, createHall, updateHall, deleteHall } from '../../services/hallService';
import { Plus, Edit2, Trash2, Monitor, Armchair, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const HallList = () => {
  const [halls, setHalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHall, setEditingHall] = useState(null);

  useEffect(() => {
    loadHalls();
  }, []);

  const loadHalls = async () => {
    try {
      setIsLoading(true);
      const data = await fetchHalls();
      setHalls(data);
    } catch (error) {
      toast.error('Failed to load halls');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingHall(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (hall) => {
    setEditingHall(hall);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this hall?')) {
      try {
        await deleteHall(id);
        toast.success('Hall deleted successfully');
        loadHalls();
      } catch (error) {
        toast.error('Failed to delete hall');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingHall) {
        await updateHall(editingHall.id, formData);
        toast.success('Hall updated successfully');
      } else {
        await createHall(formData);
        toast.success('Hall created successfully');
      }
      setIsFormOpen(false);
      loadHalls();
    } catch (error) {
      toast.error('Failed to save hall');
    }
  };

  const getHallIcon = (type) => {
    switch (type) {
      case '3D': return <Monitor className="text-neon-blue" size={18} />;
      case 'VIP': return <Star className="text-yellow-400" size={18} />;
      default: return <Armchair className="text-gray-400" size={18} />;
    }
  };

  if (isFormOpen) {
    return (
      <Layout>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{editingHall ? 'Edit Hall' : 'Add New Hall'}</h1>
        </div>
        <Card>
          <HallForm 
            initialData={editingHall} 
            onSubmit={handleFormSubmit} 
            onCancel={() => setIsFormOpen(false)}
            isLoading={isLoading}
          />
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Halls</h1>
          <p className="text-gray-400 mt-1">Manage cinema halls and seating</p>
        </div>
        <Button onClick={handleAddClick}>
          <Plus size={20} />
          Add Hall
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading halls...</div>
      ) : (
        <Table headers={['Name', 'Type', 'Capacity', 'Location', 'Actions']}>
          {halls.length > 0 ? (
            halls.map((hall) => (
              <tr key={hall.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{hall.name}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getHallIcon(hall.type)}
                    <span>{hall.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400">{hall.capacity} Seats</td>
                <td className="px-6 py-4 text-gray-400">{hall.location}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" className="!p-2" onClick={() => handleEditClick(hall)}>
                      <Edit2 size={16} className="text-blue-400" />
                    </Button>
                    <Button variant="ghost" className="!p-2" onClick={() => handleDeleteClick(hall.id)}>
                      <Trash2 size={16} className="text-red-400" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                No halls found.
              </td>
            </tr>
          )}
        </Table>
      )}
    </Layout>
  );
};

export default HallList;
