import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Edit2, Eye, EyeOff, Plus, Search, Trash2 } from "lucide-react";
import { API_BASE_URL } from "../../../shared/config/api";

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toISOString().slice(0, 10);
};

const getUserStatus = (user) => {
  if (typeof user?.isDeleted === "boolean") {
    return user.isDeleted ? "inactive" : "active";
  }

  return user?.status || "active";
};

const User = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    status: "active",
    role: "user",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/user/get`, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
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

  const normalizedUsers = filteredUsers.map((user) => ({
    ...user,
    displayStatus: getUserStatus(user),
  }));

  const handleAddUser = () => {
    setEditingUser(null);
    setShowModal(true);
    setFormData({
      name: "",
      email: "",
      password: "",
      status: "active",
      role: "user",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = Boolean(editingUser);
    const hasRequiredFields = formData.name && formData.email && (isEditing || formData.password);

    if (!hasRequiredFields) return;

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      if (isEditing) {
        const body = {
          fullname: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status,
          isDeleted: formData.status === "inactive",
        };
        if (formData.password) body.password = formData.password;

        const response = await fetch(`${API_BASE_URL}/user/update/${editingUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
          body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error("Failed to update user");
      } else {
        const response = await fetch(`${API_BASE_URL}/user/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            fullname: formData.name,
            email: formData.email,
            password: formData.password,
            agreeTerm: true,
          }),
        });
        if (!response.ok) throw new Error("Failed to add user");
      }

      setShowModal(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        status: "active",
        role: "user",
      });
      await fetchUsers();
    } catch (err) {
      setError(err.message);
      console.error("Error submitting form:", err);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.fullname || "",
      email: user.email || "",
      password: "",
      status: getUserStatus(user),
      role: user.role || "user",
    });
    setShowModal(true);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/user/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      await fetchUsers();
    } catch (err) {
      setError(err.message);
      console.error("Error deleting user:", err);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Users Management
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage cinema users and their accounts.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus size={18} />}
          onClick={handleAddUser}
          sx={{ borderRadius: 2, px: 2.5, fontWeight: 700 }}
        >
          Add User
        </Button>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <TextField
          fullWidth
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        {error && <Alert severity="error">{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography color="text.secondary">No users found</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Password</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Join Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {normalizedUsers.map((user) => (
                  <TableRow hover key={user.id}>
                    <TableCell>
                      <Typography fontWeight={600}>{user.fullname}</Typography>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.password ? "••••••" : "Not set"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.displayStatus.replace(/^\w/, (c) => c.toUpperCase())}
                        color={user.displayStatus === "active" ? "success" : "error"}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role || "user"}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(user.joinDate || user.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Edit">
                          <IconButton color="primary" onClick={() => openEditModal(user)} size="small">
                            <Edit2 size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton color="error" onClick={() => handleDeleteUser(user.id)} size="small">
                            <Trash2 size={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={showModal} onClose={() => setShowModal(false)} fullWidth maxWidth="md">
        <DialogTitle>
          {editingUser ? "Edit User" : "Add New User"}
          <Typography variant="body2" color="text.secondary">
            {editingUser
              ? "Update account details and status."
              : "Create a new account for a user or admin."}
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <form id="user-form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  placeholder={editingUser ? "Leave blank to keep current password" : ""}
                  sx={{
                    "& input": { color: "text.primary" },
                    "& input:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0 1000px transparent inset",
                      WebkitTextFillColor: "inherit",
                      caretColor: "inherit",
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    label="Status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    label="Role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="hall-admin">Hall Admin</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowModal(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" color="primary" type="submit" form="user-form" disableElevation>
            {editingUser ? "Update User" : "Add User"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default User;
