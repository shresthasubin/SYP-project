import { useState, useEffect } from "react";
import { Edit2, Trash2, Search, Plus, X } from "lucide-react";
import { API_BASE_URL } from "../../../shared/config/api";

const User = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active",
    role: "user",
  });

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/user/get`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const result = await response.json();
      if (result.success && result.data) {
        setUsers(result.data);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.fullname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddUser = () => {
    setEditingUser(null);
    setShowModal(true);
    setFormData({
      name: "",
      email: "",
      phone: "",
      status: "active",
      role: "user",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone) {
      try {
        if (editingUser) {
          // Update user role
          const response = await fetch(
            `${API_BASE_URL}/user/update/${editingUser.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                role: formData.role,
              }),
            },
          );
          if (!response.ok) {
            throw new Error("Failed to update user");
          }
        } else {
          // Add new user - Note: Backend may require different fields
          const response = await fetch(`${API_BASE_URL}/user/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fullname: formData.name,
              email: formData.email,
              password: "defaultPassword123", // You may want to handle this differently
              agreeTerm: true,
            }),
          });
          if (!response.ok) {
            throw new Error("Failed to add user");
          }
        }
        setShowModal(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          status: "active",
          role: "user",
        });
        await fetchUsers(); // Refresh user list
      } catch (err) {
        setError(err.message);
        console.error("Error submitting form:", err);
      }
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.fullname || "",
      email: user.email || "",
      phone: user.phone || "",
      status: user.status || "active",
      role: user.role || "user",
    });
    setShowModal(true);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/user/delete/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to delete user");
        }
        await fetchUsers(); // Refresh user list
      } catch (err) {
        setError(err.message);
        console.error("Error deleting user:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Users Management</h1>
          <p className="mt-1 text-slate-400">
            Manage cinema users and their accounts.
          </p>
        </div>
        <button
          onClick={handleAddUser}
          className="flex items-center gap-2 rounded-lg bg-[#D72626] px-4 py-2 font-semibold text-white hover:bg-red-700 transition-colors"
        >
          <Plus size={20} />
          Add New User
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
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-cherry-700 py-2 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-cherry-700 bg-cherry-950 overflow-hidden">
        {error && (
          <div className="bg-red-900/30 border-b border-red-700 p-4 text-red-400">
            <p>Error: {error}</p>
          </div>
        )}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-slate-400">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-slate-400">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    NAME
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    EMAIL
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    PHONE
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    ROLE
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    JOIN DATE
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{user.fullname}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-300">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-300">{user.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          user.status === "active"
                            ? "bg-green-900/30 text-green-400"
                            : user.status === "pending"
                              ? "bg-amber-900/30 text-amber-400"
                              : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {(user.status || "active").charAt(0).toUpperCase() +
                          (user.status || "active").slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-full bg-blue-900/30 px-3 py-1 text-xs font-semibold text-blue-300">
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-300">
                        {user.joinDate || user.createdAt || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-[#1a1a1a] p-6 shadow-xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingUser ? "Edit User" : "Add New User"}
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
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter user name"
                    required
                    className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter email address"
                    required
                    className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                    required
                    className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="user">User</option>
                    <option value="hall-admin">Hall Admin</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg bg-slate-700 px-4 py-3 font-semibold text-white hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-[#D72626] px-4 py-3 font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  {editingUser ? "Update User" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;
