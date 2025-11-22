import {
  Button,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { format } from "date-fns";

type VideoItem = {
  url: string;
  createdAt: string;
};

export default function ContactUsForm() {
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVideos = async () => {
    try {
      const res = await api.get("/contact-us");
      const all: VideoItem[] = res.data.flatMap((entry: any) =>
        entry.videos.map((url: string) => ({
          url,
          createdAt: entry.createdAt,
        }))
      );
      setUploadedVideos(all);
    } catch (err) {
      console.error("Failed to fetch videos:", err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSubmit = async () => {
    if (videoFiles.length === 0) {
      alert("Please upload at least one video file.");
      return;
    }

    const formData = new FormData();
    videoFiles.forEach((file) => formData.append("videos", file));

    try {
      setLoading(true);
      await api.post("/contact-us", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Videos submitted successfully!");
      setVideoFiles([]);
      fetchVideos();
    } catch (err) {
      console.error("Video upload failed:", err);
      alert("Failed to submit videos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (url: string) => {
    try {
      await api.delete("/contact-us/remove-video", { params: { url } });
      setUploadedVideos((prev) => prev.filter((v) => v.url !== url));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete video.");
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 800, mx: "auto", mt: 6, p: 4 }}>
      <Typography variant="h6" gutterBottom>
        Upload Videos
      </Typography>

      <Stack spacing={3}>
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
          {loading ? <CircularProgress size={24} /> : "Submit"}
        </Button>
      </Stack>

      <Typography variant="h6" sx={{ mt: 5, mb: 2 }}>
        Uploaded Videos
      </Typography>

      <Stack spacing={2}>
        {uploadedVideos.length === 0 ? (
          <Typography color="textSecondary">No videos found.</Typography>
        ) : (
          uploadedVideos.map((video, idx) => (
            <Stack
              key={idx}
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ borderBottom: "1px solid #ddd", pb: 2 }}
            >
              <video src={video.url} width="250" controls />
              <div>
                <Typography variant="body2" color="textSecondary">
                  Created:{" "}
                  {format(new Date(video.createdAt), "dd MMM yyyy, hh:mm a")}
                </Typography>
                <IconButton
                  onClick={() => handleDelete(video.url)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            </Stack>
          ))
        )}
      </Stack>
    </Paper>
  );
}
