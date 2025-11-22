import {
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useEffect, useState } from "react";
import { api } from "../services/api";

interface User {
  _id: string;
  firstName?: string;
  email: string;
  mobile?: string;
  balance?: number;
  ageGroup?: string;
  teethIssue?: string;
  problemText?: string;
  medicalHistory?: string[];
  gender?: string;
  smoker?: string;
  availability?: string;
  assignedDoctor?: {
    doctorId: string;
    step: number;
    assignedAt: string;
  };
  doctorsTeam?: string[];
}

export default function CoinsForm({ onSuccess }: { onSuccess?: () => void }) {
  const [coins, setCoins] = useState("");
  const [bonus, setBonus] = useState("");
  const [purchased, setPurchased] = useState("");
  const [consultation, setConsultation] = useState("");
  const [userId, setUserId] = useState("");

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      alert("Please select a user.");
      return;
    }

    const body = {
      coins: Number(coins),
      bonus: Number(bonus),
      purchased: Number(purchased),
      consultation: Number(consultation),
      userId,
    };

    try {
      setLoading(true);
      await api.post("/coins", body); // JSON by default
      alert("Coins record added successfully!");
      setCoins("");
      setBonus("");
      setPurchased("");
      setConsultation("");
      setUserId("");
      onSuccess?.();
    } catch (err) {
      console.error("Error submitting coins:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: "auto", my: 4 }}>
      <Typography variant="h6" gutterBottom>
        Add Coins Record
      </Typography>

      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}

      <Stack spacing={2}>
        <FormControl fullWidth>
          <InputLabel id="user-select-label">Select User</InputLabel>
          <Select
            labelId="user-select-label"
            value={userId}
            label="Select User"
            onChange={(e) => setUserId(e.target.value)}
          >
            {users.map((user) => (
              <MenuItem key={user._id} value={user._id}>
                {user.firstName || user.email}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Coins"
          type="number"
          value={coins}
          onChange={(e) => setCoins(e.target.value)}
        />
        <TextField
          label="Bonus"
          type="number"
          value={bonus}
          onChange={(e) => setBonus(e.target.value)}
        />
        <TextField
          label="Purchased"
          type="number"
          value={purchased}
          onChange={(e) => setPurchased(e.target.value)}
        />
        <TextField
          label="Consultation"
          type="number"
          value={consultation}
          onChange={(e) => setConsultation(e.target.value)}
        />

        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Submit"}
        </Button>
      </Stack>
    </Paper>
  );
}
