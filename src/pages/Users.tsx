import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { api } from "../services/api"; // make sure this has baseURL set

interface User {
  _id: string;
  firstName?: string;
  email: string;
  mobile?: string;
}

export default function AllUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setOpenEdit(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/admin/user/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setSuccess("User deleted successfully");
    } catch {
      setError("Failed to delete user");
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    try {
      await api.patch(`/admin/user/${selectedUser._id}`, selectedUser);
      setUsers((prev) =>
        prev.map((u) => (u._id === selectedUser._id ? selectedUser : u))
      );
      setOpenEdit(false);
      setSuccess("User updated successfully");
    } catch {
      setError("Failed to update user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        All Users
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.firstName || "—"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.mobile || "—"}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(user)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(user._id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            label="First Name"
            value={selectedUser?.firstName || ""}
            fullWidth
            margin="normal"
            onChange={(e) =>
              setSelectedUser((prev) =>
                prev ? { ...prev, firstName: e.target.value } : prev
              )
            }
          />
          <TextField
            label="Mobile"
            value={selectedUser?.mobile || ""}
            fullWidth
            margin="normal"
            onChange={(e) =>
              setSelectedUser((prev) =>
                prev ? { ...prev, mobile: e.target.value } : prev
              )
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
