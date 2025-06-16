const productModel = require("../models/productModels");
const mongoose = require("mongoose");

const updateProductStock = async (id, size, quantity) => {
  try {
    console.log(`Received ID: ${id}`);
    console.log(`Size: ${size}, Quantity: ${quantity}`);

    let product;

    // Try to find the product using both methods
    // First, try as a numeric ID
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      console.log(`Trying to find product with numeric ID: ${numericId}`);
      product = await productModel.findOne({ id: numericId });
    }

    // If not found and the ID looks like an ObjectId, try that
    if (!product && mongoose.Types.ObjectId.isValid(id)) {
      console.log(`Trying to find product with ObjectId: ${id}`);
      product = await productModel.findById(id);
    }

    // If still not found and the ID is a string, try that
    if (!product) {
      console.log(`Trying to find product with string ID: ${id}`);
      product = await productModel.findOne({ id: id });
    }

    if (!product) {
      console.log(`Product not found with any ID format. Searched for: ${id}`);
      // Let's also log what products exist for debugging
      const allProducts = await productModel.find({}, { id: 1, name: 1 }).limit(5);
      console.log(`Sample products in DB:`, allProducts);
      throw new Error("Product not found");
    }

    console.log(`Found product: ${product.name} (ID: ${product.id})`);

    // Update stock based on size
    switch (size) {
      case "S":
        console.log(`Current S stock: ${product.s_stock}, Reducing by: ${quantity}`);
        if (product.s_stock < quantity) throw new Error("Not enough S stock");
        product.s_stock -= quantity;
        break;
      case "M":
        console.log(`Current M stock: ${product.m_stock}, Reducing by: ${quantity}`);
        if (product.m_stock < quantity) throw new Error("Not enough M stock");
        product.m_stock -= quantity;
        break;
      case "L":
        console.log(`Current L stock: ${product.l_stock}, Reducing by: ${quantity}`);
        if (product.l_stock < quantity) throw new Error("Not enough L stock");
        product.l_stock -= quantity;
        break;
      case "XL":
        console.log(`Current XL stock: ${product.xl_stock}, Reducing by: ${quantity}`);
        if (product.xl_stock < quantity) throw new Error("Not enough XL stock");
        product.xl_stock -= quantity;
        break;
      default:
        throw new Error(`Invalid size: ${size}`);
    }

    await product.save();
    console.log("Stock updated successfully");
    console.log(`New stock levels - S: ${product.s_stock}, M: ${product.m_stock}, L: ${product.l_stock}, XL: ${product.xl_stock}`);
  } catch (error) {
    console.error(`Error updating stock: ${error.message}`);
    throw new Error(`Error updating stock: ${error.message}`);
  }
};

module.exports = { updateProductStock };
