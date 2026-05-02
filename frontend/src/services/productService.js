import API from "./api";

/**
 * 📦 Get all products
 */
export const getAllProducts = async () => {
  try {
    const response = await API.get("/products?page=-1");
    const data = response.data?.content || response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch products";
  }
};

/**
 * 📦 Get product by ID
 */
export const getProductById = async (id) => {
  try {
    const response = await API.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Product not found";
  }
};

/**
 * ➕ Add product (Admin)
 */
export const addProduct = async (data) => {
  try {
    const response = await API.post("/products", data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to add product";
  }
};

/**
 * ✏️ Update product (Admin)
 */
export const updateProduct = async (id, data) => {
  try {
    const response = await API.put(`/products/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to update product";
  }
};

/**
 * ❌ Delete product (Admin)
 */
export const deleteProduct = async (id) => {
  try {
    const response = await API.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to delete product";
  }
};

/**
 * 🔍 Filter by category
 */
export const getProductsByCategory = async (category) => {
  try {
    const response = await API.get(`/products?category=${category}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to filter products";
  }
};