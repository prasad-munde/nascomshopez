import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['All', 'T-Shirts', 'Shirts', 'Jeans', 'Footwear', 'Jackets', 'Dresses', 'Accessories'];
const GENDERS = ['All', 'Men', 'Women', 'Unisex'];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [gender, setGender] = useState('All');
  const [sort, setSort] = useState('newest');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (category !== 'All') params.category = category;
      if (gender !== 'All') params.gender = gender;
      if (sort !== 'newest') params.sort = sort;

      const data = await productService.getAllProducts(params);
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, gender, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategory('All');
    setGender('All');
    setSort('newest');
    setSearchParams({});
  };

  return (
    <div className="container py-4">
      {/* Title & Search Bar */}
      <div className="d-md-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Browse Products</h2>
          <p className="text-muted small mb-0">Showing {products.length} items in the catalog</p>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="d-flex mt-3 mt-md-0" style={{ maxWidth: '350px' }}>
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search by title, style..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-warning fw-semibold">
            Search
          </button>
        </form>
      </div>

      <div className="row">
        {/* Filters Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="card shadow-sm border-0 p-3 sticky-top" style={{ top: '80px', zIndex: 10 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Filters</h5>
              <button
                className="btn btn-link btn-sm text-decoration-none text-muted p-0"
                onClick={handleResetFilters}
              >
                Reset All
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <label className="form-label fw-semibold small text-uppercase text-muted">Category</label>
              <div className="d-flex flex-column gap-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`btn btn-sm text-start ${
                      category === cat ? 'btn-warning fw-bold' : 'btn-light'
                    }`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Filter */}
            <div className="mb-4">
              <label className="form-label fw-semibold small text-uppercase text-muted">Gender / Target</label>
              <div className="d-flex flex-wrap gap-1">
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`btn btn-sm ${
                      gender === g ? 'btn-dark' : 'btn-outline-secondary'
                    }`}
                    onClick={() => setGender(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Filter */}
            <div className="mb-2">
              <label className="form-label fw-semibold small text-uppercase text-muted">Sort By</label>
              <select
                className="form-select form-select-sm"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="col-lg-9">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Loading products...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="card text-center p-5 border-0 shadow-sm">
              <div className="fs-1 mb-3">🔍</div>
              <h4>No products matched your criteria</h4>
              <p className="text-muted">Try changing filters or searching with a different keyword.</p>
              <div>
                <button className="btn btn-warning fw-semibold px-4" onClick={handleResetFilters}>
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {products.map((product) => (
                <div className="col-12 col-sm-6 col-md-4" key={product._id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
