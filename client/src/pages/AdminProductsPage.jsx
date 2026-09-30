import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';

const CATEGORIES = ['T-Shirts', 'Shirts', 'Jeans', 'Footwear', 'Jackets', 'Dresses', 'Accessories'];
const GENDERS = ['Men', 'Women', 'Unisex'];

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mainImg: '',
    category: 'T-Shirts',
    gender: 'Unisex',
    price: '',
    discount: '0',
    sizes: 'S, M, L, XL',
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      mainImg: '',
      category: 'T-Shirts',
      gender: 'Unisex',
      price: '',
      discount: '0',
      sizes: 'S, M, L, XL',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      title: prod.title,
      description: prod.description,
      mainImg: prod.mainImg,
      category: prod.category,
      gender: prod.gender || 'Unisex',
      price: prod.price,
      discount: prod.discount || 0,
      sizes: prod.sizes ? prod.sizes.join(', ') : 'S, M, L, XL',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const parsedSizes = formData.sizes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title,
        description: formData.description,
        mainImg: formData.mainImg,
        category: formData.category,
        gender: formData.gender,
        price: Number(formData.price),
        discount: Number(formData.discount),
        sizes: parsedSizes.length > 0 ? parsedSizes : ['S', 'M', 'L', 'XL'],
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, payload);
        setSuccessMsg('Product updated successfully!');
      } else {
        await productService.createProduct(payload);
        setSuccessMsg('Product created successfully!');
      }

      closeModal();
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error saving product');
    }
  };

  const handleDeleteProduct = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await productService.deleteProduct(id);
        setSuccessMsg('Product deleted successfully');
        await fetchProducts();
      } catch (err) {
        setError(err.response?.data?.message || 'Error deleting product');
      }
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Manage Products</h2>
          <p className="text-muted small mb-0">Add, edit, or remove products from the catalog</p>
        </div>
        <button className="btn btn-warning fw-bold px-3" onClick={openAddModal}>
          + Add New Product
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMsg}
          <button type="button" className="btn-close" onClick={() => setSuccessMsg(null)}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Products Table */}
      <div className="card border-0 shadow-sm p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading products...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-4 text-muted">No products found. Click "Add New Product" to create one.</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Gender</th>
                  <th>Price</th>
                  <th>Discount</th>
                  <th>Final Price</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => {
                  const finalPrice = Math.round(prod.price * (1 - (prod.discount || 0) / 100));
                  return (
                    <tr key={prod._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={prod.mainImg}
                            alt={prod.title}
                            className="rounded me-3 border"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="fw-bold text-truncate" style={{ maxWidth: '240px' }}>
                              {prod.title}
                            </div>
                            <small className="text-muted">
                              Sizes: {prod.sizes?.join(', ') || 'N/A'}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary">{prod.category}</span>
                      </td>
                      <td>{prod.gender || 'Unisex'}</td>
                      <td>₹{prod.price}</td>
                      <td>
                        {prod.discount > 0 ? (
                          <span className="badge bg-danger">{prod.discount}%</span>
                        ) : (
                          'None'
                        )}
                      </td>
                      <td className="fw-bold text-success">₹{finalPrice}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => openEditModal(prod)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteProduct(prod._id, prod.title)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Add / Edit Product */}
      {isModalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>

              <form onSubmit={handleSaveProduct}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Product Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        placeholder="e.g. Classic Cotton Crewneck"
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Description *</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        placeholder="Detailed product description..."
                        required
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Image URL (Direct link) *</label>
                      <input
                        type="url"
                        className="form-control"
                        name="mainImg"
                        value={formData.mainImg}
                        onChange={handleFormChange}
                        placeholder="https://images.unsplash.com/..."
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Category *</label>
                      <select
                        className="form-select"
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        required
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Target / Gender *</label>
                      <select
                        className="form-select"
                        name="gender"
                        value={formData.gender}
                        onChange={handleFormChange}
                        required
                      >
                        {GENDERS.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Price (₹) *</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        name="price"
                        value={formData.price}
                        onChange={handleFormChange}
                        placeholder="e.g. 999"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="form-control"
                        name="discount"
                        value={formData.discount}
                        onChange={handleFormChange}
                        placeholder="e.g. 15"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Available Sizes (Comma separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        name="sizes"
                        value={formData.sizes}
                        onChange={handleFormChange}
                        placeholder="S, M, L, XL"
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning fw-bold">
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
