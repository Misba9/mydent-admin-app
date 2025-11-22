import React, { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  CssBaseline,
  Toolbar,
  AppBar,
  Divider,
  Container,
  Paper,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import CarouselIcon from "@mui/icons-material/PhotoLibrary";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import TransformIcon from "@mui/icons-material/Transform";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AlignHorizontalLeftIcon from "@mui/icons-material/AlignHorizontalLeft";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import AdImageUploader from "../components/AdImageUploader";
import CentersImageUploader from "../components/CentersImageUploader";
import AdminBeforeAfterUploader from "../components/TransformationUploader";
import ProductUploader from "../components/ProductUploader";
import MydentAlignerAdmin from "../components/AlignersUploader";
import ContactUsForm from "../components/ContactUsUploader";
import AdminAssignDoctor from "../pages/AdminAssignDoctor";
import AllDoctorsPage from "../pages/Doctors";
import AllUsersPage from "../pages/Users";
import DoctorUploader from "../components/DoctorUploader";
import {
  AirplaneTicket,
  Co2Outlined,
  DashboardCustomizeSharp,
  Google,
  ManageAccountsSharp,
  TerminalSharp,
  TypeSpecimen,
} from "@mui/icons-material";
import AdminCreateMeet from "../components/MeetAssign";
import BiteTypeForm from "../components/BiteType";
import BlogManager from "../components/BlogsUploader";
import AdminCreateDoctorsTeam from "../components/AdminCreateDoctorsTeam";
import CoinsForm from "../components/MydentCoins";
import AdminTicketsPage from "../components/TicketPage";

const drawerWidth = 260;

const menuItems = [
  {
    label: "Carousel Uploader",
    icon: <CarouselIcon />,
    component: <AdImageUploader />,
  },
  {
    label: "Blogs Manager",
    icon: <ManageAccountsSharp />,
    component: <BlogManager />,
  },
  {
    label: "Centers Uploader",
    icon: <LocationCityIcon />,
    component: <CentersImageUploader />,
  },
  {
    label: "Transformation Uploader",
    icon: <TransformIcon />,
    component: <AdminBeforeAfterUploader />,
  },
  {
    label: "Products Dashboard",
    icon: <ShoppingCartIcon />,
    component: <ProductUploader />,
  },
  {
    label: "Aligners Dashboard",
    icon: <AlignHorizontalLeftIcon />,
    component: <MydentAlignerAdmin />,
  },
  {
    label: "Contact Us Dashboard",
    icon: <ContactMailIcon />,
    component: <ContactUsForm />,
  },
  {
    label: "Bite Type Dashboard",
    icon: <TypeSpecimen />,
    component: <BiteTypeForm />,
  },
  {
    label: "Assign Doctor",
    icon: <LocalHospitalIcon />,
    component: <AdminAssignDoctor />,
  },
  {
    label: "Assign Doctors-Team",
    icon: <TerminalSharp />,
    component: <AdminCreateDoctorsTeam />,
  },
  {
    label: "Experts Uploader",
    icon: <DashboardCustomizeSharp />,
    component: <DoctorUploader />,
  },
  {
    label: "Create Meet Link",
    icon: <Google />,
    component: <AdminCreateMeet />,
  },
  {
    label: "Ticket Queries",
    icon: <AirplaneTicket />,
    component: <AdminTicketsPage />,
  },
  { label: "Coins Manager", icon: <Co2Outlined />, component: <CoinsForm /> },
];

export default function AdminLayout() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [topMenuComponent, setTopMenuComponent] =
    useState<React.ReactNode | null>(null);

  const navigate = useNavigate();

  // 🔐 Protect Admin Routes
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleListItemClick = (index: number) => {
    setSelectedIndex(index);
    setTopMenuComponent(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (type: "users" | "doctors") => {
    setTopMenuComponent(
      type === "users" ? <AllUsersPage /> : <AllDoctorsPage />
    );
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/admin/login");
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#1976d2",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" noWrap component="div">
            Admin Panel
          </Typography>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <AccountCircleIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleMenuItemClick("users")}>
              Manage Users
            </MenuItem>
            <MenuItem onClick={() => handleMenuItemClick("doctors")}>
              Manage Doctors
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#f4f6f8",
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {menuItems.map((item, index) => (
            <ListItemButton
              key={item.label}
              selected={selectedIndex === index}
              onClick={() => handleListItemClick(index)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "#1976d2",
                  color: "white",
                  "& .MuiListItemIcon-root": { color: "white" },
                },
                "&:hover": {
                  backgroundColor: "#e3f2fd",
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
          overflowY: "auto",
          height: "100vh",
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          <Paper elevation={3} sx={{ p: 4 }}>
            {topMenuComponent || menuItems[selectedIndex].component}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
