import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Button,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";
import { api } from "../services/api";

type Ticket = {
  _id: string;
  title: string;
  message: string;
  category: string;
  status: string;
  fileUrl?: string;
  createdAt: string;
  userId: {
    _id: string;
    name?: string;
    email: string;
  };
};

const statusOptions = ["open", "in_progress", "resolved", "closed"];

const AdminTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const res = await api.get("/tickets", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log('✨ ~ res:', res)
      setTickets(res.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (ticketId: string, status: string) => {
    try {
      await api.patch(
        `/tickets/${ticketId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      await fetchTickets();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        All Support Tickets
      </Typography>

      <Stack spacing={3}>
        {tickets.map((ticket) => (
          <Card key={ticket._id} variant="outlined">
            <CardContent>
              <Typography variant="h6">{ticket.title}</Typography>

              <Typography variant="body2" color="text.secondary" mb={1}>
                {ticket.category} •{" "}
                {new Date(ticket.createdAt).toLocaleString()}
              </Typography>

              <Divider sx={{ my: 1 }} />

              <Typography variant="body1">{ticket.message}</Typography>

              <Typography variant="body2" mt={2} fontStyle="italic">
                User: {ticket.userId?.name || ticket.userId?.email}
              </Typography>

              {ticket.fileUrl && (
                <Button
                  href={ticket.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                >
                  View File
                </Button>
              )}

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={ticket.status}
                  label="Status"
                  onChange={(e) => updateStatus(ticket._id, e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option.replace("_", " ").toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default AdminTicketsPage;
