import { useEffect, useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Stack,
  Paper,
  Avatar,
  CircularProgress,
  Box,
  IconButton,
} from "@mui/material";
import { api } from "../services/api";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

interface DoctorProfile {
  _id: string;
  imageUrl?: string;
  title?: string;
}

export default function DoctorUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [experts, setExperts] = useState<DoctorProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchExperts = async () => {
    try {
      const { data } = await api.get("/experts");
      setExperts(data);
    } catch (err) {
      console.error("Failed to fetch experts:", err);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  const handleUpload = async () => {
    if (!title && !file) {
      alert("Nothing to upload");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    if (file) formData.append("image", file);

    try {
      setLoading(true);
      if (selectedId) {
        await api.put(`/experts/${selectedId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Expert updated");
      } else {
        await api.post("/experts/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Expert added");
      }

      resetForm();
      fetchExperts();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload expert");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expert?")) return;

    try {
      await api.delete(`/experts/${id}`);
      fetchExperts();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete expert");
    }
  };

  const handleEdit = (expert: DoctorProfile) => {
    setSelectedId(expert._id);
    setTitle(expert.title || "");
    setPreview(expert.imageUrl || null);
    setFile(null);
  };

  const resetForm = () => {
    setSelectedId(null);
    setTitle("");
    setPreview(null);
    setFile(null);
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 600, mx: "auto", mt: 8, p: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        {selectedId ? "Edit Expert" : "Add New Expert"}
      </Typography>

      <Stack spacing={3}>
        <Button variant="outlined" component="label">
          Select Image
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              setFile(selected);
              if (selected) setPreview(URL.createObjectURL(selected));
            }}
          />
        </Button>

        {preview && (
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar src={preview} sx={{ width: 100, height: 100 }} />
            <Button onClick={() => setPreview(null)} color="error">
              Remove
            </Button>
          </Box>
        )}

        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
        />

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleUpload} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
          {selectedId && (
            <Button variant="outlined" onClick={resetForm}>
              Cancel Edit
            </Button>
          )}
        </Stack>
      </Stack>

      <Typography variant="h6" mt={6}>
        All Experts
      </Typography>

      <Stack spacing={2} mt={2}>
        {experts.map((expert) => (
          <Box
            key={expert._id}
            p={2}
            border="1px solid #ccc"
            borderRadius={2}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar src={expert.imageUrl} sx={{ width: 60, height: 60 }} />
              <Typography>{expert.title}</Typography>
            </Box>
            <Box>
              <IconButton onClick={() => handleEdit(expert)} color="primary">
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => handleDelete(expert._id)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
