import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  Modal,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState } from "react";
import { api } from "../services/api";

interface Blog {
  _id: string;
  title: string;
  date: string;
  author: string;
  category: string;
  images: string[];
  description: string;
  content: string;
}

export default function BlogManager() {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBlogs = async () => {
    try {
      const { data } = await api.get("/blogs");
      setBlogs(data);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDate("");
    setAuthor("");
    setCategory("");
    setDescription("");
    setContent("");
    setImageFiles([]);
    setEditId(null);
    setEditMode(false);
  };

  const handleUploadBlog = async () => {
    setError("");
    setSuccess("");

    if (!title || !date || !author || !category || !description || !content) {
      return setError("All fields are required");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("date", date);
    formData.append("author", author);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("content", content);
    imageFiles.forEach((file) => formData.append("images", file));

    try {
      if (editMode && editId) {
        await api.patch(`/blogs/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Blog updated successfully");
      } else {
        await api.post("/blogs", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Blog uploaded successfully");
      }

      resetForm();
      fetchBlogs();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setError("Upload failed");
    }
  };

  const handleEditBlog = (blog: Blog) => {
    setEditMode(true);
    setEditId(blog._id);
    setTitle(blog.title);
    setDate(blog.date);
    setAuthor(blog.author);
    setCategory(blog.category);
    setDescription(blog.description);
    setContent(blog.content);
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm("Delete this blog?")) return;

    try {
      await api.delete(`/blogs/${id}`);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      setError("Delete failed");
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 800, mx: "auto", mt: 8, p: 4 }}>
      <Stack spacing={4}>
        <Typography variant="h4" align="center">
          Manage Blogs
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Button variant="contained" onClick={() => setIsModalOpen(true)}>
          Add New Blog
        </Button>

        <Divider textAlign="left">All Blogs</Divider>
        <Stack spacing={3}>
          {blogs.map((blog) => (
            <Box
              key={blog._id}
              sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2 }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <img
                  src={blog.images?.[0]}
                  alt={blog.title}
                  width={80}
                  style={{ borderRadius: 8 }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{blog.title}</Typography>
                  <Typography variant="body2">{blog.author}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {blog.date}
                  </Typography>
                </Box>
                <IconButton onClick={() => handleEditBlog(blog)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteBlog(blog._id)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Stack>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            width: 500,
            maxHeight: "90vh",
            overflow: "auto",
            p: 4,
            bgcolor: "background.paper",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6">
              {editMode ? "Edit" : "Add"} Blog
            </Typography>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
            />
            <TextField
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
            />
            <TextField
              label="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              fullWidth
            />
            <TextField
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              fullWidth
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
              multiline
              rows={4}
            />
            <Button variant="outlined" component="label">
              Upload Images
              <input
                type="file"
                multiple
                hidden
                onChange={(e) =>
                  setImageFiles(
                    e.target.files ? Array.from(e.target.files) : []
                  )
                }
              />
            </Button>
            <Button variant="contained" onClick={handleUploadBlog}>
              {editMode ? "Update" : "Add"} Blog
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Paper>
  );
}
