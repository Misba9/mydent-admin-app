import { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Typography,
  Stack,
  Paper,
  Alert,
  Modal,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { api } from "../services/api";

interface Clinic {
  _id: string;
  clinicName: string;
  address: string;
  timeFrom: string;
  timeTo: string;
  centerNumber: string;
  directions?: string;
  clinicImage: string;
}

interface Center {
  _id: string;
  cityName: string;
  imageUrl: string;
  clinic?: Clinic[];
}

export default function CityImageUploader() {
  const [cityName, setCityName] = useState("");
  const [centerFile, setCenterFile] = useState<File | null>(null);

  const [clinicCityName, setClinicCityName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [address, setAddress] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [centerNumber, setCenterNumber] = useState("");
  const [directions, setDirections] = useState("");
  const [clinicFile, setClinicFile] = useState<File | null>(null);

  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [serviceFile, setServiceFile] = useState<File | null>(null);
  const [serviceCityName, setServiceCityName] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClinicId, setEditingClinicId] = useState<string | null>(null);
  const [editingCenterId, setEditingCenterId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [centers, setCenters] = useState<Center[]>([]);

  const fetchCenters = async () => {
    try {
      const { data } = await api.get("/admin/centers");
      setCenters(data);
    } catch (err) {
      console.error("Failed to fetch centers", err);
    }
  };

  const handleAddService = async () => {
    setError("");
    setSuccess("");

    if (
      !serviceCityName ||
      !serviceTitle ||
      !serviceDescription ||
      !serviceFile
    ) {
      return setError("All service fields are required");
    }

    const formData = new FormData();
    formData.append("title", serviceTitle);
    formData.append("description", serviceDescription);
    formData.append("image", serviceFile);

    try {
      await api.post(
        `/admin/centers/${encodeURIComponent(serviceCityName)}/services`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setSuccess("Service added successfully");
      setServiceTitle("");
      setServiceDescription("");
      setServiceFile(null);
      setServiceCityName("");
      fetchCenters();
    } catch (err) {
      console.error(err);
      setError("Service upload failed");
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  const handleUploadCenter = async () => {
    setError("");
    setSuccess("");

    if (!cityName || !centerFile)
      return setError("City name and image are required");

    const formData = new FormData();
    formData.append("cityName", cityName);
    formData.append("centerImage", centerFile);

    try {
      await api.post("/admin/centers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Center uploaded successfully");
      setCityName("");
      setCenterFile(null);
      fetchCenters();
    } catch (err) {
      console.error(err);
      setError("Upload failed");
    }
  };

  const handleAddClinic = async () => {
    setError("");
    setSuccess("");

    if (
      !clinicCityName ||
      !clinicName ||
      !address ||
      !timeFrom ||
      !timeTo ||
      !centerNumber ||
      !clinicFile
    ) {
      return setError("All clinic fields are required");
    }

    const formData = new FormData();
    formData.append("clinicName", clinicName);
    formData.append("address", address);
    formData.append("timeFrom", timeFrom);
    formData.append("timeTo", timeTo);
    formData.append("centerNumber", centerNumber);
    formData.append("directions", directions);
    formData.append("clinicImage", clinicFile);

    try {
      await api.post(
        `/admin/centers/${encodeURIComponent(clinicCityName)}/clinics`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setSuccess("Clinic added successfully");
      resetClinicForm();
      fetchCenters();
    } catch (err) {
      console.error(err);
      setError("Clinic upload failed");
    }
  };

  const handleEditClinic = (centerId: string, clinic: Clinic) => {
    setEditingCenterId(centerId);
    setClinicName(clinic.clinicName);
    setAddress(clinic.address);
    setTimeFrom(clinic.timeFrom);
    setTimeTo(clinic.timeTo);
    setCenterNumber(clinic.centerNumber);
    setDirections(clinic.directions || "");
    setClinicFile(null);
    setEditingClinicId(clinic._id);
    setIsEditModalOpen(true);
  };

  const handleUpdateClinic = async () => {
    if (!editingClinicId || !editingCenterId) return;

    const formData = new FormData();
    formData.append("clinicName", clinicName);
    formData.append("address", address);
    formData.append("timeFrom", timeFrom);
    formData.append("timeTo", timeTo);
    formData.append("centerNumber", centerNumber);
    formData.append("directions", directions);
    if (clinicFile) formData.append("clinicImage", clinicFile);

    try {
      await api.patch(
        `/admin/centers/${editingCenterId}/clinics/${editingClinicId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setSuccess("Clinic updated successfully");
      resetClinicForm();
      setIsEditModalOpen(false);
      fetchCenters();
    } catch (err) {
      console.error(err);
      setError("Clinic update failed");
    }
  };

  const handleDeleteClinic = async (centerId: string, clinicId: string) => {
    if (!window.confirm("Are you sure you want to delete this clinic?")) return;

    try {
      await api.delete(`/admin/centers/${centerId}/clinics/${clinicId}`);
      fetchCenters();
    } catch (err) {
      console.error("Failed to delete clinic", err);
      setError("Clinic deletion failed");
    }
  };

  const handleDeleteCenter = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this center?")) return;

    try {
      await api.delete(`/admin/centers/${id}`);
      setCenters((prev) => prev.filter((center) => center._id !== id));
    } catch (err) {
      console.error("Failed to delete center", err);
      setError("Center deletion failed");
    }
  };

  const resetClinicForm = () => {
    setClinicCityName("");
    setClinicName("");
    setAddress("");
    setTimeFrom("");
    setTimeTo("");
    setCenterNumber("");
    setDirections("");
    setClinicFile(null);
    setEditingClinicId(null);
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 800, mx: "auto", mt: 8, p: 4 }}>
      <Stack spacing={4}>
        <Typography variant="h4" align="center">
          Manage Centers & Clinics
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Divider textAlign="left">Add New Center</Divider>
        <Stack spacing={2}>
          <TextField
            label="City Name"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            fullWidth
          />
          <Button variant="outlined" component="label">
            Upload Center Image
            <input
              hidden
              type="file"
              onChange={(e) => setCenterFile(e.target.files?.[0] || null)}
            />
          </Button>
          <Button variant="contained" onClick={handleUploadCenter}>
            Add Center
          </Button>
        </Stack>

        <Divider textAlign="left">Add Clinic</Divider>
        <Stack spacing={2}>
          <TextField
            label="City Name"
            value={clinicCityName}
            onChange={(e) => setClinicCityName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Clinic Name"
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            fullWidth
          />
          <TextField
            label="Time From"
            value={timeFrom}
            onChange={(e) => setTimeFrom(e.target.value)}
            fullWidth
          />
          <TextField
            label="Time To"
            value={timeTo}
            onChange={(e) => setTimeTo(e.target.value)}
            fullWidth
          />
          <TextField
            label="Center Number"
            value={centerNumber}
            onChange={(e) => setCenterNumber(e.target.value)}
            fullWidth
          />
          <TextField
            label="Directions"
            value={directions}
            onChange={(e) => setDirections(e.target.value)}
            fullWidth
          />
          <Button variant="outlined" component="label">
            Upload Clinic Image
            <input
              hidden
              type="file"
              onChange={(e) => setClinicFile(e.target.files?.[0] || null)}
            />
          </Button>
          <Button variant="contained" onClick={handleAddClinic}>
            Add Clinic
          </Button>
        </Stack>

        <Divider textAlign="left">Add Service</Divider>
        <Stack spacing={2}>
          <TextField
            label="City Name"
            value={serviceCityName}
            onChange={(e) => setServiceCityName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Service Title"
            value={serviceTitle}
            onChange={(e) => setServiceTitle(e.target.value)}
            fullWidth
          />
          <TextField
            label="Service Description"
            value={serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
            fullWidth
          />
          <Button variant="outlined" component="label">
            Upload Service Image
            <input
              hidden
              type="file"
              onChange={(e) => setServiceFile(e.target.files?.[0] || null)}
            />
          </Button>
          <Button variant="contained" onClick={handleAddService}>
            Add Service
          </Button>
        </Stack>

        <Divider textAlign="left">Centers & Clinics</Divider>
        <Stack spacing={3}>
          {centers.map((center) => (
            <Box
              key={center._id}
              sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2 }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <img src={center.imageUrl} alt={center.cityName} width={80} />
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {center.cityName}
                </Typography>
                <IconButton onClick={() => handleDeleteCenter(center._id)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>

              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                {center.clinic?.map((clinic) => (
                  <Box
                    key={clinic._id}
                    sx={{ display: "flex", alignItems: "center", gap: 2 }}
                  >
                    <img
                      src={clinic.clinicImage}
                      alt={clinic.clinicName}
                      width={60}
                    />
                    <Typography sx={{ flexGrow: 1 }}>
                      {clinic.clinicName}
                    </Typography>
                    <IconButton
                      onClick={() => handleEditClinic(center._id, clinic)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClinic(center._id, clinic._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Stack>

      <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <Box
          sx={{
            width: 400,
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
            <Typography variant="h6">Edit Clinic</Typography>
            <TextField
              label="Clinic Name"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              fullWidth
            />
            <TextField
              label="Time From"
              value={timeFrom}
              onChange={(e) => setTimeFrom(e.target.value)}
              fullWidth
            />
            <TextField
              label="Time To"
              value={timeTo}
              onChange={(e) => setTimeTo(e.target.value)}
              fullWidth
            />
            <TextField
              label="Center Number"
              value={centerNumber}
              onChange={(e) => setCenterNumber(e.target.value)}
              fullWidth
            />
            <TextField
              label="Directions"
              value={directions}
              onChange={(e) => setDirections(e.target.value)}
              fullWidth
            />
            <Button variant="outlined" component="label">
              Upload New Clinic Image
              <input
                hidden
                type="file"
                onChange={(e) => setClinicFile(e.target.files?.[0] || null)}
              />
            </Button>
            <Button variant="contained" onClick={handleUpdateClinic}>
              Update Clinic
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Paper>
  );
}
