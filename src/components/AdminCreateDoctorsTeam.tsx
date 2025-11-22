import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Stack,
  CardMedia,
  MenuItem,
} from "@mui/material";
import { api } from "../services/api";

export default function AdminCreateDoctorsTeam() {
  const [name, setName] = useState("");
  const [type, setType] = useState(""); // New state for team type
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [doctorTeams, setDoctorTeams] = useState<
    { _id: string; name: string; type: string; image: string }[]
  >([]);

  const fetchTeams = async () => {
    try {
      const res = await api.get("/team");
      setDoctorTeams(res.data);
    } catch (error) {
      console.error("Failed to fetch doctor teams:", error);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleSubmit = async () => {
    if (!name || !type || !imageFile) {
      setErrorMsg("All fields are required.");
      return;
    }

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("image", imageFile);

    try {
      await api.post("/team", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccessMsg("Doctor team created successfully!");
      setName("");
      setType("");
      setImageFile(null);
      fetchTeams();
    } catch (err) {
      setErrorMsg("Failed to create doctor team. Please try again.");
    }

    setLoading(false);
  };

  return (
    <Box maxWidth={800} mx="auto" mt={5} px={3}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            🩺 Create Doctor Team
          </Typography>

          {errorMsg && (
            <Alert
              severity="error"
              onClose={() => setErrorMsg("")}
              sx={{ mb: 2 }}
            >
              {errorMsg}
            </Alert>
          )}

          {successMsg && (
            <Alert
              severity="success"
              onClose={() => setSuccessMsg("")}
              sx={{ mb: 2 }}
            >
              {successMsg}
            </Alert>
          )}

          <Stack spacing={3} mt={2}>
            <TextField
              label="Doctor Team Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />

            <TextField
              label="Doctor Team Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              fullWidth
              select
            >
              <MenuItem value="Orthodontist">Orthodontist</MenuItem>
              <MenuItem value="Endodontist">Endodontist</MenuItem>
              <MenuItem value="General Dentist">General Dentist</MenuItem>
              <MenuItem value="Surgeon">Surgeon</MenuItem>
            </TextField>

            <Button variant="outlined" component="label">
              Upload Team Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setImageFile(file);
                }}
              />
            </Button>
            {imageFile && <Typography>Selected: {imageFile.name}</Typography>}

            <Box textAlign="right">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!name || !type || !imageFile || loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? "Creating..." : "Create Team"}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Doctor Team List */}
      <Box mt={5}>
        <Typography variant="h6" gutterBottom>
          👨‍⚕️ All Doctor Teams
        </Typography>

        <Box
          display="flex"
          flexWrap="wrap"
          gap={3}
          justifyContent="flex-start"
          mt={2}
        >
          {doctorTeams.map((team) => (
            <Card
              key={team._id}
              sx={{
                width: 230,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <CardMedia
                component="img"
                height="160"
                image={team.image}
                alt={team.name}
              />
              <CardContent>
                <Typography variant="subtitle1" noWrap>
                  {team.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" noWrap>
                  {team.type}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
