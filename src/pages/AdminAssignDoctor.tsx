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
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Divider,
  Chip,
  Drawer,
  IconButton,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
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
  doctorsTeam?: {
    team: string;
    date: string;
    time: string;
  }[];
}

interface Doctor {
  _id: string;
  name?: string;
  email?: string;
}

interface DoctorTeam {
  _id: string;
  name: string;
}

export default function AdminAssignDoctor() {
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorTeams, setDoctorTeams] = useState<DoctorTeam[]>([]);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedUserDetails, setSelectedUserDetails] = useState<User | null>(
    null
  );

  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [step, setStep] = useState<number>(1);
  const [assignedDate, setAssignedDate] = useState<string>("");

  const [selectedTeams, setSelectedTeams] = useState<
    { teamId: string; date: string; time: string }[]
  >([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchDoctors();
    fetchDoctorTeams();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch {
      setError("Failed to load users");
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/admin/doctors");
      setDoctors(res.data);
    } catch {
      setError("Failed to load doctors");
    }
  };

  const fetchDoctorTeams = async () => {
    try {
      const res = await api.get("/team");
      setDoctorTeams(res.data);
    } catch {
      setError("Failed to load doctor teams");
    }
  };

  const handleUserSelect = async (userId: string) => {
    setSelectedUser(userId);
    setDrawerOpen(true);
    try {
      const res = await api.post("/admin/get-user-by-id", { userId });
      setSelectedUserDetails(res.data);
    } catch {
      setError("Failed to load user details");
    }
  };

  const handleAssignDoctor = async () => {
    if (!selectedUser || !selectedDoctor || !assignedDate) {
      setError("Please fill in all fields.");
      return;
    }
    if (step < 1 || step > 4) {
      setError("Step must be between 1 and 4.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await api.post("/admin/assign-doctor", {
        userId: selectedUser,
        doctorId: selectedDoctor,
        step,
        assignedAt: new Date(assignedDate),
      });
      setMessage(res.data.message || "Doctor assigned successfully");
    } catch {
      setError("Error assigning doctor. Please try again.");
    }
    setLoading(false);
  };

  const handleAssignTeam = async () => {
    if (!selectedUser) {
      setError("Please select a user first.");
      return;
    }
    if (selectedTeams.length !== 5) {
      setError("Please select exactly 5 doctor teams.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post(`/team/assign/${selectedUser}`, {
        teams: selectedTeams.map((t) => ({
          id: t.teamId,
          date: t.date,
          time: t.time,
        })),
      });

      setMessage("Doctor teams assigned successfully.");
    } catch {
      setError("Failed to assign doctor teams.");
    }

    setLoading(false);
  };

  return (
    <>
      <Box maxWidth={800} mx="auto" mt={5} px={3}>
        <Card elevation={4}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              🩺 Assign Doctor to User
            </Typography>

            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{ mb: 2 }}
              >
                {error}
              </Alert>
            )}

            {message && (
              <Alert
                severity="success"
                onClose={() => setMessage("")}
                sx={{ mb: 2 }}
              >
                {message}
              </Alert>
            )}

            <Stack spacing={2} mt={2}>
              <FormControl fullWidth>
                <InputLabel>Select User</InputLabel>
                <Select
                  value={selectedUser}
                  label="Select User"
                  onChange={(e) => handleUserSelect(e.target.value)}
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
                  value={selectedDoctor}
                  label="Select Doctor"
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor._id} value={doctor._id}>
                      {doctor.name || "Unnamed"} ({doctor.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Step (1-4)"
                type="number"
                inputProps={{ min: 1, max: 4 }}
                value={step}
                onChange={(e) => setStep(Number(e.target.value))}
                fullWidth
              />

              <TextField
                label="Assignment Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={assignedDate}
                onChange={(e) => setAssignedDate(e.target.value)}
              />

              <Button
                variant="contained"
                color="primary"
                onClick={handleAssignDoctor}
                disabled={
                  !selectedUser ||
                  !selectedDoctor ||
                  !assignedDate ||
                  step < 1 ||
                  step > 4 ||
                  loading
                }
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? "Assigning..." : "Assign Doctor"}
              </Button>

              {/* Doctor Team Assignment */}
              {selectedUser && (
                <>
                  {" "}
                  <FormControl fullWidth>
                    <InputLabel shrink>
                      Select Doctor Teams (Exactly 5)
                    </InputLabel>
                    {doctorTeams.map((team) => {
                      const selected = selectedTeams.find(
                        (t) => t.teamId === team._id
                      );

                      return (
                        <div
                          key={team._id}
                          style={{
                            border: "1px solid #ccc",
                            padding: 10,
                            marginBottom: 10,
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={!!selected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    if (selectedTeams.length < 5) {
                                      setSelectedTeams([
                                        ...selectedTeams,
                                        {
                                          teamId: team._id,
                                          date: "",
                                          time: "",
                                        },
                                      ]);
                                    }
                                  } else {
                                    setSelectedTeams(
                                      selectedTeams.filter(
                                        (t) => t.teamId !== team._id
                                      )
                                    );
                                  }
                                }}
                              />
                            }
                            label={team.name}
                          />
                          {selected && (
                            <div
                              style={{ display: "flex", gap: 10, marginTop: 5 }}
                            >
                              <TextField
                                label="Date"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={selected.date}
                                onChange={(e) => {
                                  setSelectedTeams((prev) =>
                                    prev.map((t) =>
                                      t.teamId === team._id
                                        ? { ...t, date: e.target.value }
                                        : t
                                    )
                                  );
                                }}
                                fullWidth
                              />
                              <TextField
                                label="Time"
                                type="time"
                                InputLabelProps={{ shrink: true }}
                                value={selected.time}
                                onChange={(e) => {
                                  setSelectedTeams((prev) =>
                                    prev.map((t) =>
                                      t.teamId === team._id
                                        ? { ...t, time: e.target.value }
                                        : t
                                    )
                                  );
                                }}
                                fullWidth
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </FormControl>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleAssignTeam}
                    disabled={
                      selectedTeams.length !== 5 ||
                      !selectedUser ||
                      loading ||
                      selectedTeams.some((t) => !t.date || !t.time)
                    }
                  >
                    {loading ? "Assigning Teams..." : "Assign Doctor Team"}
                  </Button>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {(selectedUser || selectedDoctor) && (
        <Box maxWidth={800} mx="auto" mt={3} px={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔄 Optional Updates
              </Typography>

              <Stack spacing={2}>
                {/* Update User Step */}
                {selectedUser && (
                  <FormControl fullWidth>
                    <InputLabel>Update Step</InputLabel>
                    <Select
                      value={step}
                      label="Update Step"
                      onChange={async (e) => {
                        const updatedStep = Number(e.target.value);
                        setStep(updatedStep);
                        try {
                          await api.patch(`/admin/user/step/${selectedUser}`, {
                            step: updatedStep,
                          });
                          setMessage("User step updated successfully.");
                        } catch {
                          setError("Failed to update user step.");
                        }
                      }}
                    >
                      <MenuItem value={1}>Step 1</MenuItem>
                      <MenuItem value={2}>Step 2</MenuItem>
                      <MenuItem value={3}>Step 3</MenuItem>
                      <MenuItem value={4}>Step 4</MenuItem>
                    </Select>
                  </FormControl>
                )}

                {/* Update Doctor Pass Info */}
                {selectedDoctor && (
                  <FormControl fullWidth>
                    <InputLabel>
                      Pass the user details to the assigned doctor
                    </InputLabel>
                    <Select
                      value=""
                      label="Pass the user details to the assigned doctor"
                      onChange={async (e) => {
                        const passInfo = String(e.target.value) === "true";
                        try {
                          await api.patch(
                            `/admin/doctor/passinfo/${selectedDoctor}`,
                            {
                              passInfo,
                            }
                          );
                          setMessage("Doctor passInfo updated successfully.");
                        } catch {
                          setError("Failed to update doctor passInfo.");
                        }
                      }}
                    >
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ zIndex: 1300 }}
      >
        <Box width={350} p={3}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">👤 User Details</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ my: 2 }} />

          {selectedUserDetails ? (
            <Stack spacing={1.5}>
              <Typography>
                <strong>Email:</strong> {selectedUserDetails.email}
              </Typography>
              <Typography>
                <strong>Name:</strong> {selectedUserDetails.firstName || "N/A"}
              </Typography>
              <Typography>
                <strong>Mobile:</strong> {selectedUserDetails.mobile || "N/A"}
              </Typography>
              <Typography>
                <strong>Balance:</strong> ₹{selectedUserDetails.balance ?? 0}
              </Typography>
              <Typography>
                <strong>Age Group:</strong>{" "}
                {selectedUserDetails.ageGroup || "N/A"}
              </Typography>
              <Typography>
                <strong>Teeth Issue:</strong>{" "}
                {selectedUserDetails.teethIssue || "N/A"}
              </Typography>
              <Typography>
                <strong>Problem Text:</strong>{" "}
                {selectedUserDetails.problemText || "N/A"}
              </Typography>
              <Typography>
                <strong>Medical History:</strong>{" "}
                {selectedUserDetails.medicalHistory?.join(", ") || "N/A"}
              </Typography>
              <Typography>
                <strong>Gender:</strong> {selectedUserDetails.gender || "N/A"}
              </Typography>
              <Typography>
                <strong>Smoker:</strong> {selectedUserDetails.smoker || "N/A"}
              </Typography>
              <Typography>
                <strong>Availability:</strong>{" "}
                {selectedUserDetails.availability || "N/A"}
              </Typography>

              {selectedUserDetails.assignedDoctor && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Chip
                    label="Current Assigned Doctor"
                    color="info"
                    variant="outlined"
                  />
                  <Typography>
                    <strong>Doctor ID:</strong>{" "}
                    {selectedUserDetails.assignedDoctor.doctorId}
                  </Typography>
                  <Typography>
                    <strong>Step:</strong>{" "}
                    {selectedUserDetails.assignedDoctor.step}
                  </Typography>
                  <Typography>
                    <strong>Assigned At:</strong>{" "}
                    {new Date(
                      selectedUserDetails.assignedDoctor.assignedAt
                    ).toLocaleDateString()}
                  </Typography>
                </>
              )}

              {Array.isArray(selectedUserDetails.doctorsTeam) &&
                selectedUserDetails.doctorsTeam.length > 0 && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Chip
                      label="Assigned Doctor Teams"
                      color="secondary"
                      variant="outlined"
                    />
                    <ul>
                      {selectedUserDetails.doctorsTeam.map((entry, index) => {
                        const team = doctorTeams.find(
                          (t) => t._id === entry.team
                        );
                        return (
                          <li key={index}>
                            {team?.name || "Unknown Team"} - {entry.date} at{" "}
                            {entry.time}
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
            </Stack>
          ) : (
            <Typography>Loading user info...</Typography>
          )}
        </Box>
      </Drawer>
    </>
  );
}
