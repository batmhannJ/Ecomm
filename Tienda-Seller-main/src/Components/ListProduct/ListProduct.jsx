import React, { useEffect, useState } from 'react';
import './ListProduct.css';
import './modal.css';

export const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', old_price: '', new_price: '', category: '', s_stock: '', m_stock: '', l_stock: '', xl_stock: '', stock: '', image: null
  });
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state

  const fetchInfo = async () => {
    const res = await fetch('http://localhost:4000/allproducts');
    const data = await res.json();
    console.log('Fetched data:', data); // Check what is returned

    // Append a timestamp query to force image refresh
  const updatedProducts = data.map(product => ({
    ...product,
    image: product.image ? `http://localhost:4000/images/${product.image}?t=${new Date().getTime()}` : null
  }));
  console.log('Fetched products with updated images:', updatedProducts); // Log the updated products

    setAllProducts(updatedProducts);
  };
  
  const fetchAllProducts = async () => {
    try {
      const response = await fetch("http://localhost:4000/allproducts");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const allProducts = await response.json();
      
      // Construct the full image URL for each product
      const updatedProducts = allProducts.map(product => ({
        ...product,
        image: product.image ? `http://localhost:4000/images/${product.image}?t=${new Date().getTime()}` : null
      }));

      return updatedProducts;
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const remove_product = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await fetch('http://localhost:4000/removeproduct', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });
      await fetchInfo();
    }
  };

  const handleEdit = (product) => {
    console.log('Editing product ID:', product._id); // I-log ang ID ng product
  
    setEditProduct(product);
    setFormData({
      name: product.name,
      old_price: product.old_price,
      new_price: product.new_price,
      category: product.category,
      s_stock: product.s_stock || '',
      m_stock: product.m_stock || '',
      l_stock: product.l_stock || '',
      xl_stock: product.xl_stock || '',
      image: product.image || null
    });
    setIsModalOpen(true);
  };

  const updateProduct = async () => {
    // Validate form data
    if (!formData.name || !formData.old_price || !formData.new_price || !formData.category) {
      alert('Please fill out all required fields.');
      return;
    }

    const computedStock = (parseInt(formData.s_stock) || 0) +
      (parseInt(formData.m_stock) || 0) +
      (parseInt(formData.l_stock) || 0) +
      (parseInt(formData.xl_stock) || 0);
  
    const formDataToSend = new FormData();
    formDataToSend.append('_id', editProduct._id);
    formDataToSend.append('name', formData.name);
    formDataToSend.append('old_price', formData.old_price);
    formDataToSend.append('new_price', formData.new_price);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('s_stock', formData.s_stock);
    formDataToSend.append('m_stock', formData.m_stock);
    formDataToSend.append('l_stock', formData.l_stock);
    formDataToSend.append('xl_stock', formData.xl_stock);
    formDataToSend.append('stock', computedStock);
  
    // Assuming formData.image is a file input (HTML input type="file")
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }
  
    const response = await fetch('http://localhost:4000/editproduct', {
      method: 'POST',
      body: formDataToSend, // No need for 'Content-Type', fetch will handle it automatically
    });
  
    const data = await response.json();
    console.log('Response from server:', data);
  
    if (!response.ok) {
      console.error('Error updating product:', data.message);
    } else {
      setIsModalOpen(false);
      await fetchInfo();
      const updatedProducts = await fetchAllProducts(); // Fetch updated products after edit
      setAllProducts(updatedProducts); // Update state with the new products
    }
  };

  // Close modal when clicking outside of it
  const closeModal = (e) => {
    if (e.target.className === 'modal-overlay') {
      setIsModalOpen(false);
    }
  };

const handleFileChange = (e) => {
  const file = e.target.files[0];
  console.log('Selected file:', file); // Check if the file is selected
  setFormData({ ...formData, image: file });
};

  return (
    <div className='list-product'>
      <h3>All Products List</h3>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Stock</p>
        <p>Action</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product) => (
          <React.Fragment key={product.id}>
            <div className="listproduct-format-main listproduct-format">
              <img src={product.image} alt={product.name} className="listproduct-product-icon" />
              <p>{product.name}</p>
              <p>₱{product.old_price}</p>
              <p>₱{product.new_price}</p>
              <p>{product.category}</p>
              <p>{product.stock}</p>
              <div class="button">
              <button onClick={() => handleEdit(product)} className="edit-button">Edit</button>
              <button onClick={() => remove_product(product.id)} className='delete-button'>
                Delete
              </button>
              </div>
            </div>
            <hr />
          </React.Fragment>
        ))}
      </div>

      {/* Modal for Editing Product */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="edit-form">
            <h2>Edit Product</h2>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Product Name"
              autoFocus
            />
            <input
              type="number"
              value={formData.old_price}
              onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
              placeholder="Old Price"
            />
            <input
              type="number"
              value={formData.new_price}
              onChange={(e) => setFormData({ ...formData, new_price: e.target.value })}
              placeholder="New Price"
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="" disabled>Select Category</option>
              <option value="crafts">Craft</option>
              <option value="food">Food</option>
              <option value="clothes">Clothes</option>
            </select>

            <input
              type="number"
              value={formData.s_stock}
              onChange={(e) => setFormData({ ...formData, s_stock: e.target.value })}
              placeholder="Small Stock"
            />
            <input
              type="number"
              value={formData.m_stock}
              onChange={(e) => setFormData({ ...formData, m_stock: e.target.value })}
              placeholder="Medium Stock"
            />
            <input
              type="number"
              value={formData.l_stock}
              onChange={(e) => setFormData({ ...formData, l_stock: e.target.value })}
              placeholder="Large Stock"
            />
            <input
              type="number"
              value={formData.xl_stock}
              onChange={(e) => setFormData({ ...formData, xl_stock: e.target.value })}
              placeholder="XL Stock"
            />

            {/* Image input field */}
            <input type="file" name="image" onChange={handleFileChange} />

            <button onClick={updateProduct}>Update</button>
            <button onClick={() => {
                setEditProduct(null);
                setIsModalOpen(false); // Close the modal when canceling
              }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListProduct;
