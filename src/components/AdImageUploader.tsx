import { useEffect, useState } from "react";
import {
  Button,
  Typography,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  CircularProgress,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { api } from "../services/api";

type CarouselType =
  | "top"
  | "bottom"
  | "mydent"
  | "shop-top"
  | "shop-middle"
  | "shop-bottom"
  | "bite-type";

interface CarouselItem {
  _id: string;
  imageUrl: string;
  type: CarouselType;
  screenName?: string;
}

const ALL_SCREENS = [
  "BookingSuccessScreen",
  "SmilePreview",
  "TeethWhiteningScreen",
  "TermsAndConditionsScreen",
  "TeethAlignmentProblems",
  "ShowAllBlogsScreen",
  "MyDentCoinsScreen",
  "NewTicketScreen",
  "CancelTicketScreen",
  "CartScreen",
  "BlogScreen",
  "ContactUs",
  "Centers",
  "MedicalHistory",
  "EComScreen",
  "AlignersForTeensScreen",
  "MyDentAlignersScreen",
  "TeethTreatmentScreen",
  "TransformationScreen",
  "TreatmentInfoScreen",
  "FindBiteTypeScreen",
  "FavProductScreen",
];

export default function AdImageUploader() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [screenNames, setScreenNames] = useState<string[]>([]);
  const [type, setType] = useState<CarouselType>("top");
  const [ads, setAds] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAds = async () => {
    try {
      const { data } = await api.get("/carousels");

      const combinedAds: CarouselItem[] = [
        ...data.home.topCarousel.map((ad: any) => ({ ...ad, type: "top" })),
        ...data.home.bottomCarousel.map((ad: any) => ({
          ...ad,
          type: "bottom",
        })),
        ...data.home.mydentCarousel.map((ad: any) => ({
          ...ad,
          type: "mydent",
        })),
        ...data.shop.topCarousel.map((ad: any) => ({
          ...ad,
          type: "shop-top",
        })),
        ...data.shop.middleCarousel.map((ad: any) => ({
          ...ad,
          type: "shop-middle",
        })),
        ...data.shop.bottomCarousel.map((ad: any) => ({
          ...ad,
          type: "shop-bottom",
        })),
        ...data.biteTypeCarousel.map((ad: any) => ({
          ...ad,
          type: "bite-type",
        })),
      ];

      setAds(combinedAds);
    } catch (err) {
      console.error("Failed to fetch ads:", err);
      setAds([]);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleUpload = async () => {
    if (!files) return alert("Please select image files to upload.");
    if (screenNames.length !== files.length)
      return alert("Please select a screen name for each image.");

    const formData = new FormData();
    Array.from(files).forEach((file, index) => {
      formData.append("images", file);
      formData.append("screenNames", screenNames[index] || "");
    });
    formData.append("type", type);

    try {
      setLoading(true);
      await api.post("/carousels/multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Images uploaded successfully.");
      setFiles(null);
      setScreenNames([]);
      setType("top");
      fetchAds();
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this ad?")) return;
    try {
      await api.delete(`/carousels/${id}`);
      setAds((prev) => prev.filter((ad) => ad._id !== id));
    } catch (err) {
      console.error("Failed to delete ad:", err);
      alert("Deletion failed.");
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 1000, mx: "auto", mt: 8, p: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Upload Carousel Images
      </Typography>

      <Stack spacing={3} direction="row" justifyContent="space-between">
        <FormControl>
          <Button variant="outlined" component="label">
            Select Image Files
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={(e) => {
                setFiles(e.target.files);
                if (e.target.files) {
                  setScreenNames(new Array(e.target.files.length).fill(""));
                }
              }}
            />
          </Button>
        </FormControl>

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel id="position-type-label">Position Type</InputLabel>
          <Select
            labelId="position-type-label"
            value={type}
            label="Position Type"
            onChange={(e) => setType(e.target.value as CarouselType)}
          >
            <MenuItem value="top">Home Top Carousel</MenuItem>
            <MenuItem value="bottom">Home Bottom Carousel</MenuItem>
            <MenuItem value="mydent">MyDent Carousel</MenuItem>
            <MenuItem value="shop-top">Shop Top Carousel</MenuItem>
            <MenuItem value="shop-middle">Shop Middle Carousel</MenuItem>
            <MenuItem value="shop-bottom">Shop Bottom Carousel</MenuItem>
            <MenuItem value="bite-type">Bite Type Carousel</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!files || loading}
        >
          {loading ? <CircularProgress size={24} /> : "Upload Images"}
        </Button>
      </Stack>

      {files && (
        <Box mt={4}>
          <Typography variant="h6">Assign Screen Names</Typography>
          {Array.from(files).map((file, index) => (
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              key={index}
              my={1}
            >
              <Typography sx={{ width: 200 }}>{file.name}</Typography>
              <FormControl fullWidth>
                <InputLabel>Select Screen</InputLabel>
                <Select
                  value={screenNames[index] || ""}
                  label="Select Screen"
                  onChange={(e) => {
                    const newScreens = [...screenNames];
                    newScreens[index] = e.target.value;
                    setScreenNames(newScreens);
                  }}
                >
                  {ALL_SCREENS.map((screen) => (
                    <MenuItem key={screen} value={screen}>
                      {screen}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          ))}
        </Box>
      )}

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Uploaded Ads
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
          justifyContent: "flex-start",
        }}
      >
        {ads.map((ad) => (
          <Card key={ad._id} sx={{ width: "100%" }}>
            <CardMedia
              component="img"
              height="160"
              image={ad.imageUrl}
              alt="Carousel"
            />
            <CardActions>
              <Typography sx={{ ml: 1 }}>{ad.type.toUpperCase()}</Typography>
              <Typography
                sx={{ ml: 1 }}
                color="text.secondary"
                fontSize="0.8rem"
              >
                {ad.screenName}
              </Typography>
              <IconButton
                onClick={() => handleDelete(ad._id)}
                color="error"
                sx={{ ml: "auto" }}
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Paper>
  );
}
