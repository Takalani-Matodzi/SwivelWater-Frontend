import { useEffect, useState } from "react";
import { getPayments, type Payment } from "../services/api";

function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        setMessage("");

        const data = await getPayments();

        setPayments(data);

        if (data.length === 0) {
          setMessage("You have no payments yet.");
        }
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load payments.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, []);

  if (loading) {
    return <p>Loading payments...</p>;
  }

  return (
    <div>
      <h2>My Payments</h2>

      {message && <p>{message}</p>}

      {payments.map((payment) => (
        <div key={payment.paymentId}>
          <h3>Payment {payment.paymentId.substring(0, 8)}</h3>

          <p>
            <strong>Order:</strong> {payment.orderId.substring(0, 8)}
          </p>

          <p>
            <strong>Amount:</strong> R {payment.amount.toFixed(2)}
          </p>

          <p>
            <strong>Method:</strong> {payment.paymentMethod}
          </p>

          <p>
            <strong>Status:</strong> {payment.paymentStatus}
          </p>

          {payment.transactionReference && (
            <p>
              <strong>Reference:</strong> {payment.transactionReference}
            </p>
          )}

          {payment.paymentDate && (
            <p>
              <strong>Payment Date:</strong>{" "}
              {new Date(payment.paymentDate).toLocaleString()}
            </p>
          )}

          <hr />
        </div>
      ))}
    </div>
  );
}

export default Payments;
