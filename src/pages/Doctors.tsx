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
import { api } from "../services/api";

interface Doctor {
  _id: string;
  name?: string;
  email?: string;
  mobile?: string;
}

export default function AllDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/doctors");
      setDoctors(res.data);
    } catch {
      setError("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setOpenEdit(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      await api.delete(`/admin/doctor/${id}`);
      setDoctors((prev) => prev.filter((d) => d._id !== id));
      setSuccess("Doctor deleted successfully");
    } catch {
      setError("Failed to delete doctor");
    }
  };

  const handleUpdate = async () => {
    if (!selectedDoctor) return;
    try {
      await api.patch(`/admin/doctor/${selectedDoctor._id}`, selectedDoctor);
      setDoctors((prev) =>
        prev.map((d) => (d._id === selectedDoctor._id ? selectedDoctor : d))
      );
      setOpenEdit(false);
      setSuccess("Doctor updated successfully");
    } catch {
      setError("Failed to update doctor");
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        All Doctors
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
            {doctors.map((doctor) => (
              <TableRow key={doctor._id}>
                <TableCell>{doctor.name || "—"}</TableCell>
                <TableCell>{doctor.email || "—"}</TableCell>
                <TableCell>{doctor.mobile || "—"}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(doctor)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(doctor._id)}
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
        <DialogTitle>Edit Doctor</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={selectedDoctor?.name || ""}
            fullWidth
            margin="normal"
            onChange={(e) =>
              setSelectedDoctor((prev) =>
                prev ? { ...prev, name: e.target.value } : prev
              )
            }
          />
          <TextField
            label="Mobile"
            value={selectedDoctor?.mobile || ""}
            fullWidth
            margin="normal"
            onChange={(e) =>
              setSelectedDoctor((prev) =>
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
