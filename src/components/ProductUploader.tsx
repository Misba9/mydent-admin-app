import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import { api } from "../services/api";
import { Delete, Edit } from "@mui/icons-material";

interface Product {
  _id: string;
  title: string;
  categoryKey: string;
  price: number;
  originalPrice?: number;
  description?: string;
  tags: string[];
  productDetails?: string;
  benefits?: string;
  howToUse?: string;
  ingredients?: string;
  caution?: string;
  information?: string;
  contents?: string;
  bestSeller?: boolean;
  combos?: boolean;
  recommended?: boolean;
  quantity?: number;
  images?: string[];
}

const initialFormState = {
  title: "",
  categoryKey: "",
  price: "",
  originalPrice: "",
  description: "",
  tags: "",
  productDetails: "",
  benefits: "",
  howToUse: "",
  ingredients: "",
  caution: "",
  information: "",
  contents: "",
  bestSeller: false,
  combos: false,
  recommended: false,
  quantity: "",
};

const ProductForm: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] =
    useState<typeof initialFormState>(initialFormState);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? value.replace(/\D/, "") : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = new FormData();

    // ✅ If no new images uploaded but existing ones are present, keep existing
    if (images.length === 0 && existingImages.length > 0) {
      existingImages.forEach((url) => payload.append("images", url));
    }

    // Append new image files (if any)
    images.forEach((file) => {
      payload.append("images", file);
    });

    // Append other fields
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === "boolean" || typeof value === "number") {
        payload.append(key, value.toString());
      } else if (Array.isArray(value)) {
        value.forEach((v) => payload.append(`${key}[]`, v));
      } else {
        payload.append(key, value || "");
      }
    });

    // Special handling for tags (comma-separated string to array)
    if (formData.tags) {
      formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "")
        .forEach((tag) => payload.append("tags[]", tag));
    }

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product updated successfully");
        setEditingId(null);
      } else {
        await api.post("/products", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product created successfully");
      }

      setFormData(initialFormState);
      setImages([]);
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save product");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product._id);
    setExistingImages(product.images || []);
    setFormData({
      title: product.title || "",
      categoryKey: product.categoryKey || "",
      price: product.price?.toString() || "",
      originalPrice: product.originalPrice?.toString() || "",
      description: product.description || "",
      tags: product.tags?.join(", ") || "",
      productDetails: product.productDetails || "",
      benefits: product.benefits || "",
      howToUse: product.howToUse || "",
      ingredients: product.ingredients || "",
      caution: product.caution || "",
      information: product.information || "",
      contents: product.contents || "",
      bestSeller: product.bestSeller || false,
      combos: product.combos || false,
      recommended: product.recommended || false,
      quantity: product.quantity?.toString() || "",
    });
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Product Form
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              name="title"
              label="Title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              name="categoryKey"
              label="Category Key"
              value={formData.categoryKey}
              onChange={handleChange}
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              name="price"
              label="Price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              name="originalPrice"
              label="Original Price"
              type="number"
              value={formData.originalPrice}
              onChange={handleChange}
              fullWidth
            />
          </Stack>

          <TextField
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
          />
          <TextField
            name="tags"
            label="Tags (comma separated)"
            value={formData.tags}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="productDetails"
            label="Product Details"
            value={formData.productDetails}
            onChange={handleChange}
            fullWidth
            multiline
          />
          <TextField
            name="benefits"
            label="Benefits"
            value={formData.benefits}
            onChange={handleChange}
            fullWidth
            multiline
          />
          <TextField
            name="howToUse"
            label="How To Use"
            value={formData.howToUse}
            onChange={handleChange}
            fullWidth
            multiline
          />
          <TextField
            name="ingredients"
            label="Ingredients"
            value={formData.ingredients}
            onChange={handleChange}
            fullWidth
            multiline
          />
          <TextField
            name="caution"
            label="Caution"
            value={formData.caution}
            onChange={handleChange}
            fullWidth
            multiline
          />
          <TextField
            name="information"
            label="Information"
            value={formData.information}
            onChange={handleChange}
            fullWidth
            multiline
          />
          <TextField
            name="contents"
            label="Contents"
            value={formData.contents}
            onChange={handleChange}
            fullWidth
            multiline
          />

          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.bestSeller}
                  onChange={handleCheckboxChange}
                  name="bestSeller"
                />
              }
              label="Best Seller"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.combos}
                  onChange={handleCheckboxChange}
                  name="combos"
                />
              }
              label="Combos"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.recommended}
                  onChange={handleCheckboxChange}
                  name="recommended"
                />
              }
              label="Recommended"
            />
          </Stack>

          <TextField
            name="quantity"
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            fullWidth
          />

          <Button variant="outlined" component="label">
            Select Images
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) {
                  setImages(Array.from(e.target.files));
                }
              }}
            />
          </Button>
          <Box mt={2} display="flex" flexWrap="wrap" gap={2}>
            {images.map((file, index) => (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                alt="preview"
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 8,
                  objectFit: "cover",
                }}
              />
            ))}
          </Box>

          <Button type="submit" variant="contained" color="primary">
            {editingId ? "Update" : "Submit"}
          </Button>
        </Stack>
      </form>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Existing Products
        </Typography>
        <Stack spacing={2}>
          {products.map((product) => (
            <Card
              key={product._id}
              sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}
            >
              {product.images?.[0] && (
                <CardMedia
                  component="img"
                  sx={{ width: 100, height: 100, borderRadius: 2 }}
                  image={product.images[0]}
                  alt={product.title}
                />
              )}
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6">{product.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  ₹{product.price}
                </Typography>
              </CardContent>
              <Stack direction="row" spacing={1}>
                <IconButton onClick={() => handleEdit(product)} color="primary">
                  <Edit />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(product._id)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default ProductForm;
