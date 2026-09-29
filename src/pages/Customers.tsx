import { useState } from "react";
import { getCustomers } from "../services/api";

interface Customer {
  customerId: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
}

function Customers() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [message, setMessage] = useState("");

  async function loadCustomer() {
    setMessage("");

    try {
      const data = await getCustomers();

      setCustomer(data);

      console.log("Customer:", data);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load customer.",
      );
    }
  }

  return (
    <div>
      <h1>Customer Profile</h1>

      <button onClick={loadCustomer}>Load Customer</button>

      <p>{message}</p>

      {customer && (
        <div>
          <h2>
            {customer.firstName} {customer.lastName}
          </h2>

          <p>
            <strong>Email/User ID:</strong> {customer.userId}
          </p>

          <p>
            <strong>Phone:</strong> {customer.phone}
          </p>

          <hr />
        </div>
      )}
    </div>
  );
}

export default Customers;
