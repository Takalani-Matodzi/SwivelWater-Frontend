import { useEffect, useState } from "react";
import {
  getProducts,
  type Product,
} from "../services/api";

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        setMessage("");

        const data = await getProducts();

        setProducts(data);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load products.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) {
    return <p>Loading products...</p>;
  }

  return (
    <div>
      <h2>Swivel Water Products</h2>

      {message && <p>{message}</p>}

      {products.length === 0 && !message && (
        <p>No products available.</p>
      )}

      {products.map((product) => (
        <div key={product.productId}>
          <h3>{product.productName}</h3>

          {product.description && (
            <p>{product.description}</p>
          )}

          <p>
            <strong>Price:</strong> R{" "}
            {product.price.toFixed(2)}
          </p>

          <p>
  <strong>Stock:</strong>{" "}
  {product.stockQuantity}
</p>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default Products;