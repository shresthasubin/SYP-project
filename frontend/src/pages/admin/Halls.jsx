import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Upload,
  MapPin,
  Phone,
  Users,
  FileText,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const Halls = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingHall, setEditingHall] = useState(null);

  const [formData, setFormData] = useState({
    hall_name: "",
    hall_location: "",
    hall_contact: "",
    license: "",
    capacity: "",
    hallPoster: null,
    isActive: true,
  });

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/hall/get", {
        withCredentials: true,
      });
      if (response.data.success) {
        setHalls(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch halls");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("hall_name", formData.hall_name);
    data.append("hall_location", formData.hall_location);
    data.append("hall_contact", formData.hall_contact);
    data.append("license", formData.license);
    data.append("capacity", formData.capacity);
    data.append("isActive", formData.isActive);
    if (formData.hallPoster) data.append("hallPoster", formData.hallPoster);

    try {
      if (editingHall) {
        await axios.put(
          `http://localhost:3000/api/hall/update/${editingHall.id}`,
          data,
          {
            withCredentials: true,
          },
        );
        toast.success("Hall updated successfully");
      } else {
        await axios.post("http://localhost:3000/api/hall/register", data, {
          withCredentials: true,
        });
        toast.success("Hall registered successfully");
      }
      setShowModal(false);
      fetchHalls();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this hall?"))
      return;

    try {
      await axios.delete(`http://localhost:3000/api/hall/delete/${id}`, {
        withCredentials: true,
      });
      toast.success("Hall deactivated successfully");
      fetchHalls();
    } catch (error) {
      toast.error("Failed to deactivate hall");
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
      hallPoster: null,
      isActive: hall.isActive,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      hall_name: "",
      hall_location: "",
      hall_contact: "",
      license: "",
      capacity: "",
      hallPoster: null,
      isActive: true,
    });
    setEditingHall(null);
  };

  const filteredHalls = halls.filter((hall) =>
    hall.hall_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Halls Management</h1>
          <p className="mt-1 text-slate-400">
            Add, edit, and view cinema halls.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          Add New Hall
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search halls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 py-2 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Halls Table */}
      <div className="rounded-lg border border-slate-700 bg-slate-950 overflow-hidden">
        {filteredHalls.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-slate-400">No halls found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    HALL NAME
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    CAPACITY
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    SCREENS
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredHalls.map((hall) => (
                  <tr
                    key={hall.id}
                    className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors"
                  >
                    {/* Hall Name */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{hall.hall_name}</p>
                    </td>

                    {/* Capacity */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-300">
                        {hall.capacity} Seats
                      </p>
                    </td>

                    {/* Screens (placeholder - from capacity) */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-300">1</p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          hall.isActive
                            ? "bg-green-900/30 text-green-400"
                            : "bg-amber-900/30 text-amber-400"
                        }`}
                      >
                        {hall.isActive ? "Active" : "Under Maintenance"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          title="Layout"
                          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          <FileText size={18} />
                        </button>
                        <button
                          onClick={() => openEditModal(hall)}
                          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(hall.id)}
                          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-[#1a1a1a] p-6 shadow-xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingHall ? "Edit Hall" : "Add New Hall"}
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
                  <label className="text-sm font-medium text-slate-300">
                    Hall Name
                  </label>
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
                  <label className="text-sm font-medium text-slate-300">
                    Location
                  </label>
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
                  <label className="text-sm font-medium text-slate-300">
                    Contact
                  </label>
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
                  <label className="text-sm font-medium text-slate-300">
                    Capacity
                  </label>
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
                  <label className="text-sm font-medium text-slate-300">
                    License Number
                  </label>
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
                <label className="text-sm font-medium text-slate-300">
                  Hall Poster
                </label>
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
                    <span>
                      {formData.hallPoster
                        ? formData.hallPoster.name
                        : "Upload Hall Image"}
                    </span>
                  </label>
                </div>
              </div>

              {editingHall && (
                <div className="flex items-center gap-3 rounded-lg bg-black/50 p-4 border border-white/10">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="form-checkbox h-5 w-5 rounded border-white/20 bg-black text-[#D72626] focus:ring-[#D72626]/50 cursor-pointer"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-slate-300 cursor-pointer flex-1"
                  >
                    Hall is Active
                  </label>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      formData.isActive
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {formData.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              )}

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
                  {editingHall ? "Update Hall" : "Add Hall"}
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