import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllProducts,
  deleteProduct,
} from "../services/productService";

const ManageProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔄 Fetch products
  useEffect(() => {
    getAllProducts()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.content || []);
        setProducts(list);
        setFiltered(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 🔍 Search filter
  useEffect(() => {
    const result = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, products]);

  // ❌ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteProduct(id);
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      setFiltered(updated);
    } catch (err) {
      alert(err);
    }
  };

  if (loading) {
    return (
      <div className="center-flex h-[50vh]">
        <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div>

      {/* 🔥 Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="heading">Manage Products</h1>

        <button
          onClick={() => navigate("/admin/add-product")}
          className="btn-primary"
        >
          + Add Product
        </button>
      </div>

      {/* 🔍 Search */}
      <input
        type="text"
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-field mb-4"
      />

      {/* 📦 List */}
      {filtered.length === 0 ? (
        <p className="text-gray-500">No products found</p>
      ) : (
        <div className="space-y-4">

          {filtered.map((product) => (
            <div
              key={product.id}
              className="card flex justify-between items-center"
            >

              {/* Info */}
              <div>
                <h2 className="font-semibold">
                  {product.name}
                </h2>
                <p className="text-sm text-gray-500">
                  ₹{product.price}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">

                <button
                  onClick={() =>
                    navigate(`/admin/edit-product/${product.id}`)
                  }
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(product.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default ManageProducts;