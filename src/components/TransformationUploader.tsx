import { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Stack,
  TextField,
  Paper,
  Box,
  IconButton,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { api } from "../services/api";

interface BeforeAfterPost {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export default function AdminBeforeAfterUploader() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [posts, setPosts] = useState<BeforeAfterPost[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get("/admin/blogs");
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setEditingId(null);
  };

  const handleUpload = async () => {
    if (!title || !description || (!file && !editingId)) {
      return alert("All fields are required.");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (file) formData.append("image", file);

    try {
      if (editingId) {
        await api.put(`/admin/blogs/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Post updated successfully!");
      } else {
        await api.post("/admin/blogs/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Post uploaded successfully!");
      }

      resetForm();
      fetchPosts();
    } catch (err) {
      console.error(err);
      setError("Operation failed.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await api.delete(`/admin/blogs/${id}`);
      setPosts((prev) => prev.filter((post) => post._id !== id));
      setSuccess("Post deleted successfully!");
    } catch (err) {
      console.error("Failed to delete post", err);
      setError("Deletion failed.");
    }
  };

  const handleEdit = (post: BeforeAfterPost) => {
    setEditingId(post._id);
    setTitle(post.title);
    setDescription(post.description);
    setFile(null); // user may or may not choose a new image
    setError("");
    setSuccess("");
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 600, mx: "auto", mt: 8, p: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        {editingId
          ? "Edit Before vs After Post"
          : "Upload Before vs After Post"}
      </Typography>

      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <TextField
          label="Before vs After Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          label="Description"
          fullWidth
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Button variant="outlined" component="label">
          {file ? "Change Image" : "Select Image File"}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </Button>

        <Button
          variant="contained"
          onClick={handleUpload}
          fullWidth
          disabled={!title || !description || (!file && !editingId)}
        >
          {editingId ? "Update Post" : "Upload Post"}
        </Button>

        {editingId && (
          <Button onClick={resetForm} color="secondary">
            Cancel Edit
          </Button>
        )}
      </Stack>

      <Typography variant="h6" sx={{ mt: 6, mb: 2 }}>
        Uploaded Posts
      </Typography>

      <Stack spacing={2}>
        {posts.map((post) => (
          <Box
            key={post._id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              border: "1px solid #ccc",
              borderRadius: 1,
              p: 1,
            }}
          >
            <img
              src={post.imageUrl}
              alt={post.title}
              style={{
                width: 80,
                height: 60,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
            <Typography sx={{ flexGrow: 1 }}>{post.title}</Typography>
            <IconButton color="primary" onClick={() => handleEdit(post)}>
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={() => handleDelete(post._id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
