import { useState } from "react";
import { getAddresses, type Address } from "../services/api";

function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [message, setMessage] = useState("");

  async function loadAddresses() {
    setMessage("");

    try {
      const data = await getAddresses();

      setAddresses(data);

      if (data.length === 0) {
        setMessage("No addresses found.");
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load addresses.",
      );
    }
  }

  return (
    <div>
      <h1>Addresses</h1>

      <button onClick={loadAddresses}>Load Addresses</button>

      <p>{message}</p>

      {addresses.map((address) => (
        <div key={address.addressId}>
          <p>
            <strong>Address:</strong> {address.addressLine1}
          </p>

          {address.addressLine2 && <p>{address.addressLine2}</p>}

          <p>
            {address.city}, {address.province}
          </p>

          <p>
            {address.postalCode}, {address.country}
          </p>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default Addresses;
