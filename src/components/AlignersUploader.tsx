import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  Box,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { api } from "../services/api";

interface AlignerData {
  _id: string;
  image: string[];
  video: string[];
  price: string;
}

export default function MydentAlignerAdmin() {
  const [aligner, setAligner] = useState<AlignerData | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAligner = async () => {
    try {
      const { data } = await api.get("/admin/mydent-aligners");
      if (data.length > 0) {
        setAligner(data[0]);
        setPrice(data[0].price);
      }
    } catch (err) {
      console.error("Failed to fetch aligner:", err);
    }
  };

  useEffect(() => {
    fetchAligner();
  }, []);

  const handleUpload = async () => {
    const formData = new FormData();
    imageFiles.forEach((file) => formData.append("image", file));
    videoFiles.forEach((file) => formData.append("video", file));
    formData.append("price", price);

    try {
      setLoading(true);
      if (aligner?._id) {
        await api.patch(`/admin/mydent-aligners/${aligner._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.post("/admin/mydent-aligners", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      alert("Aligner data saved successfully.");
      setImageFiles([]);
      setVideoFiles([]);
      fetchAligner();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!aligner?._id || !window.confirm("Delete this aligner?")) return;
    try {
      await api.delete(`/admin/mydent-aligners/${aligner._id}`);
      setAligner(null);
      setPrice("");
      alert("Aligner deleted successfully.");
    } catch (err) {
      console.error("Deletion failed:", err);
      alert("Failed to delete.");
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 900, mx: "auto", mt: 8, p: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        MyDent Aligners Admin Panel
      </Typography>

      <Stack spacing={3}>
        <Button variant="outlined" component="label">
          Select Images
          <input
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
          />
        </Button>

        <Button variant="outlined" component="label">
          Select Videos
          <input
            type="file"
            hidden
            multiple
            accept="video/*"
            onChange={(e) => setVideoFiles(Array.from(e.target.files || []))}
          />
        </Button>

        <TextField
          label="Aligner Price"
          fullWidth
          multiline
          rows={4}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : aligner ? (
            "Update"
          ) : (
            "Upload"
          )}
        </Button>

        {aligner && (
          <>
            <Typography variant="h6">Preview</Typography>
            <Card>
              {aligner.image?.map((img, idx) => (
                <CardMedia
                  key={idx}
                  component="img"
                  height="160"
                  image={img}
                  alt={`Aligner Image ${idx + 1}`}
                  sx={{ mb: 1 }}
                />
              ))}
              {aligner.video?.map((vid, idx) => (
                <Box key={idx} sx={{ mt: 1 }}>
                  <video src={vid} controls width="100%" />
                </Box>
              ))}
              <Typography sx={{ p: 2 }}>{aligner.price}</Typography>
              <CardActions>
                <IconButton color="error" onClick={handleDelete}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </>
        )}
      </Stack>
    </Paper>
  );
}
