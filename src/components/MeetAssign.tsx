import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  Stack,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { api } from "../services/api"; // your Axios instance

interface User {
  _id: string;
  firstName?: string;
  email: string;
}

interface Doctor {
  _id: string;
  name?: string;
  email?: string;
}

export default function AdminCreateMeet() {
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [userId, setUserId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [meetLink, setMeetLink] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchUsers();
    fetchDoctors();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch {
      setError("Failed to fetch users");
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/admin/doctors");
      setDoctors(res.data);
    } catch {
      setError("Failed to fetch doctors");
    }
  };

  const handleCreateMeet = async () => {
    if (!userId || !doctorId || !meetLink || !date || !time) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post("/meet/create", {
        userId,
        doctorId,
        meetLink,
        date,
        time,
      });
      setMessage("Meet created successfully");
      setUserId("");
      setDoctorId("");
      setMeetLink("");
      setDate("");
      setTime("");
    } catch {
      setError("Failed to create meet");
    }

    setLoading(false);
  };

  return (
    <Box maxWidth={700} mx="auto" mt={5} px={2}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            📅 Schedule Meet for User & Doctor
          </Typography>

          {error && (
            <Alert severity="error" onClose={() => setError("")} sx={{ my: 2 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert
              severity="success"
              onClose={() => setMessage("")}
              sx={{ my: 2 }}
            >
              {message}
            </Alert>
          )}

          <Stack spacing={2} mt={3}>
            <FormControl fullWidth>
              <InputLabel>Select User</InputLabel>
              <Select
                value={userId}
                label="Select User"
                onChange={(e) => setUserId(e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.firstName || "Unnamed"} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Select Doctor</InputLabel>
              <Select
                value={doctorId}
                label="Select Doctor"
                onChange={(e) => setDoctorId(e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {doctors.map((doc) => (
                  <MenuItem key={doc._id} value={doc._id}>
                    {doc.name || "Unnamed"} ({doc.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Meet Link"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              fullWidth
            />

            <TextField
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: today }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
            />

            <TextField
              label="Time"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              fullWidth
            />

            <Box textAlign="right" mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateMeet}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? "Creating..." : "Create Meet"}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
