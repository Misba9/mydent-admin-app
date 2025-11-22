import {
  Button,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  MenuItem,
  InputLabel,
  Select,
  IconButton,
} from "@mui/material";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const options = [
  "Under bite",
  "Open bite",
  "Crooked teeth",
  "Gap teeth",
  "Deep bite",
  "Cross bite",
  "Forwardly placed teeth",
  "Teeth Spacings",
  "Jaw correction",
];

export default function BiteTypeForm() {
  const [title, setTitle] = useState("");
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [biteTypes, setBiteTypes] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchBiteTypes = async () => {
    try {
      const res = await api.get("/bite");
      setBiteTypes(res.data);
    } catch (err) {
      console.error("Failed to fetch bite types:", err);
    }
  };

  useEffect(() => {
    fetchBiteTypes();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please select a title.");
      return;
    }

    if (videoFiles.length === 0) {
      alert("Please upload at least one video file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    videoFiles.forEach((file) => {
      formData.append("videos", file);
    });

    try {
      setLoading(true);
      if (editingId) {
        await api.patch(`/bite/${editingId}`, { title });
        alert("Title updated successfully!");
        setEditingId(null);
      } else {
        await api.post("/bite", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("BiteType submitted successfully!");
      }
      setTitle("");
      setVideoFiles([]);
      fetchBiteTypes();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/bite/${id}`);
      fetchBiteTypes();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete bite type.");
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item._id);
    setTitle(item.title);
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 800, mx: "auto", mt: 6, p: 4 }}>
      <Typography variant="h6" gutterBottom>
        {editingId ? "Edit Bite Type" : "Add Bite Type"}
      </Typography>

      <Stack spacing={3}>
        <InputLabel id="teeth-issue-label">Teeth Issue</InputLabel>
        <Select
          labelId="teeth-issue-label"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        >
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>

        <Button variant="outlined" component="label">
          Select Videos
          <input
            type="file"
            hidden
            accept="video/*"
            multiple
            onChange={(e) =>
              setVideoFiles(e.target.files ? Array.from(e.target.files) : [])
            }
          />
        </Button>

        {videoFiles.length > 0 && (
          <Stack spacing={1}>
            {videoFiles.map((file, index) => (
              <Typography key={index} variant="body2" color="textSecondary">
                {file.name}
              </Typography>
            ))}
          </Stack>
        )}

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          fullWidth
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : editingId ? (
            "Update"
          ) : (
            "Submit"
          )}
        </Button>
      </Stack>

      <Typography variant="h6" sx={{ mt: 5, mb: 2 }}>
        All Bite Types
      </Typography>

      <Stack spacing={3}>
        {biteTypes.map((item) => (
          <Paper key={item._id} sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle1">{item.title}</Typography>
              <Stack direction="row" spacing={1}>
                <IconButton color="primary" onClick={() => handleEdit(item)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDelete(item._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Stack>
            <Stack spacing={1} mt={2}>
              {item.videos.map((url: string, idx: number) => (
                <video key={idx} src={url} width="250" controls />
              ))}
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
}
