import { useEffect, useState } from "react";

import {
  getOrders,
  getOrderItems,
  getProducts,
  getPayments,
  createPayment,
  type Order,
  type OrderItem,
  type Product,
  type Payment,
} from "../services/api";

function formatOrderStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        setMessage("");

        const [data, productData, paymentData] = await Promise.all([
          getOrders(),
          getProducts(),
          getPayments(),
        ]);

        setOrders(data);
        setProducts(productData);
        setPayments(paymentData);

        const itemsByOrder: Record<string, OrderItem[]> = {};

        await Promise.all(
          data.map(async (order) => {
            const items = await getOrderItems(order.orderId);

            itemsByOrder[order.orderId] = items;
          }),
        );

        setOrderItems(itemsByOrder);

        if (data.length === 0) {
          setMessage("You have no orders yet.");
        }
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load orders.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  async function handlePayment(order: Order) {
    setMessage("");
    setPaymentLoading(order.orderId);

    try {
      const payment = await createPayment({
        orderId: order.orderId,
        amount: order.totalAmount,
        paymentMethod: "PAYFAST",
      });

      setPayments((currentPayments) => [payment, ...currentPayments]);

      setMessage(
        `Payment started successfully. Payment ID: ${payment.paymentId}`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not start payment.",
      );
    } finally {
      setPaymentLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="orders-loading">
        <p>Loading orders...</p>

        <style>
          {`
            .orders-loading {
              padding: 30px;
              text-align: center;
              color: #71858c;
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div className="orders-page">
      {message && <div className="orders-message">{message}</div>}

      {orders.length === 0 ? (
        <div className="orders-empty">
          <div className="orders-empty-icon">📦</div>

          <h3>No orders yet</h3>

          <p>
            Your Swivel Water orders will appear here once you place an order.
          </p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const items = orderItems[order.orderId] ?? [];

            const pendingPayment = payments.some(
              (payment) =>
                payment.orderId === order.orderId &&
                payment.paymentStatus === "PENDING",
            );

            const paidPayment = payments.some(
              (payment) =>
                payment.orderId === order.orderId &&
                payment.paymentStatus === "PAID",
            );

            const loyaltyFreeOrder = order.usesLoyaltyFreeRefill;

            const hasLoyaltyCardProduct = items.some((item) => {
              const product = products.find(
                (product) => product.productId === item.productId,
              );

              return product?.productType === "REFILL_CARD";
            });

            const hasRefillProduct = items.some((item) => {
              const product = products.find(
                (product) => product.productId === item.productId,
              );

              return product?.productType === "REFILL";
            });

            return (
              <article key={order.orderId} className="order-card">
                {/* ORDER HEADER */}

                <div className="order-card-header">
                  <div>
                    <span className="order-label">ORDER</span>

                    <h3>#{order.orderId.substring(0, 8)}</h3>

                    <p className="order-date">
                      {new Date(order.orderDate).toLocaleString("en-ZA")}
                    </p>
                  </div>

                  <div className="order-header-right">
                    <span
                      className={`order-status status-${order.orderStatus.toLowerCase()}`}
                    >
                      {order.orderStatus}
                    </span>

                    {loyaltyFreeOrder && (
                      <span className="order-special-badge">
                        🎁 FREE REFILL
                      </span>
                    )}

                    {hasLoyaltyCardProduct && !loyaltyFreeOrder && (
                      <span className="order-special-badge card-badge">
                        🎟️ LOYALTY CARD
                      </span>
                    )}
                  </div>
                </div>

                {/* ORDER SUMMARY */}

                <div className="order-summary-grid">
                  <div className="order-summary-box">
                    <span>Order Type</span>

                    <strong>{order.orderType}</strong>
                  </div>

                  <div className="order-summary-box">
                    <span>Total</span>

                    <strong>R {order.totalAmount.toFixed(2)}</strong>
                  </div>

                  <div className="order-summary-box">
                    <span>Delivery Fee</span>

                    <strong>
                      {order.deliveryFee > 0
                        ? `R ${order.deliveryFee.toFixed(2)}`
                        : "R 0.00"}
                    </strong>
                  </div>

                  <div className="order-summary-box">
                    <span>Payment</span>

                    <strong>
                      {loyaltyFreeOrder
                        ? "Not required"
                        : paidPayment
                          ? "Paid"
                          : pendingPayment
                            ? "Pending"
                            : "Unpaid"}
                    </strong>
                  </div>
                </div>

                {/* ORDER CONTENT */}

                <div className="order-content-grid">
                  {/* ORDER ITEMS */}

                  <section className="order-items-panel">
                    <div className="order-section-title">
                      <div>
                        <span className="section-eyebrow">ITEMS</span>
                        <h4>Order Items</h4>
                      </div>

                      <span className="item-count">
                        {items.length} {items.length === 1 ? "item" : "items"}
                      </span>
                    </div>

                    {items.length > 0 ? (
                      <div className="order-items-list">
                        {items.map((item) => {
                          const product = products.find(
                            (product) => product.productId === item.productId,
                          );

                          const isRefillCard =
                            product?.productType === "REFILL_CARD";

                          const isRefill = product?.productType === "REFILL";

                          return (
                            <div key={item.orderItemId} className="order-item">
                              <div className="order-item-icon">
                                {isRefillCard ? "🎟️" : isRefill ? "💧" : "🧴"}
                              </div>

                              <div className="order-item-main">
                                <strong>
                                  {product?.productName ?? "Unknown product"}
                                </strong>

                                <span>
                                  {isRefillCard
                                    ? "Digital loyalty card"
                                    : isRefill
                                      ? `${item.quantity} litre${
                                          item.quantity === 1 ? "" : "s"
                                        }`
                                      : `Quantity: ${item.quantity}`}
                                </span>
                              </div>

                              <div className="order-item-price">
                                <span>R {item.unitPrice.toFixed(2)} each</span>

                                <strong>R {item.subTotal.toFixed(2)}</strong>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="order-items-empty">
                        No items are attached to this order.
                      </div>
                    )}
                  </section>

                  {/* ORDER DETAILS */}

                  <aside className="order-details-panel">
                    <div className="order-section-title">
                      <div>
                        <span className="section-eyebrow">DETAILS</span>
                        <h4>Order Details</h4>
                      </div>
                    </div>

                    {loyaltyFreeOrder && (
                      <div className="special-order-box free-refill-box">
                        <strong>🎁 Loyalty Free Refill</strong>
                        <p>
                          One earned free 5L refill reward is being used for
                          this order.
                        </p>
                        <span>Collection only • R0.00</span>
                      </div>
                    )}

                    {hasLoyaltyCardProduct && !loyaltyFreeOrder && (
                      <div className="special-order-box loyalty-card-box">
                        <strong>🎟️ Refill Loyalty Card</strong>
                        <p>Digital 5L refill loyalty membership.</p>
                        <span>R50.00 • Collection only</span>
                      </div>
                    )}

                    {hasRefillProduct && !loyaltyFreeOrder && (
                      <div className="special-order-box refill-box">
                        <strong>💧 Water Refill</strong>
                        <p>Standard refill pricing is R1 per litre.</p>
                      </div>
                    )}

                    <div className="order-detail-list">
                      <div className="order-detail-row">
                        <span>Fulfilment</span>
                        <strong>
                          {order.orderType === "DELIVERY"
                            ? "Delivery"
                            : "Collection"}
                        </strong>
                      </div>

                      {order.orderType === "DELIVERY" ? (
                        <>
                          <div className="order-detail-row">
                            <span>Distance</span>
                            <strong>
                              {order.deliveryDistanceKm != null
                                ? `${order.deliveryDistanceKm.toFixed(2)} km`
                                : "Distance pending"}
                            </strong>
                          </div>

                          <div className="order-detail-row">
                            <span>Delivery fee</span>
                            <strong>R {order.deliveryFee.toFixed(2)}</strong>
                          </div>
                        </>
                      ) : (
                        <div className="collection-box">
                          📍 Bring your container for collection.
                        </div>
                      )}
                    </div>

                    {order.notes && (
                      <div className="order-notes">
                        <span>Notes</span>
                        <p>{order.notes}</p>
                      </div>
                    )}
                  </aside>
                </div>

                {/* PAYMENT ACTION */}

                {order.orderStatus === "PENDING" &&
                  order.totalAmount > 0 &&
                  !pendingPayment &&
                  !paidPayment &&
                  !loyaltyFreeOrder && (
                    <div className="order-payment-area">
                      <div>
                        <strong>Payment required</strong>

                        <span>
                          Complete payment to continue processing this order.
                        </span>
                      </div>

                      <button
                        type="button"
                        className="pay-button"
                        disabled={paymentLoading === order.orderId}
                        onClick={() => handlePayment(order)}
                      >
                        {paymentLoading === order.orderId
                          ? "Starting Payment..."
                          : `Pay R ${order.totalAmount.toFixed(2)}`}
                      </button>
                    </div>
                  )}

                {pendingPayment && (
                  <div className="payment-status pending">
                    <span>💳</span>

                    <div>
                      <strong>Payment pending</strong>

                      <p>Your payment is waiting for confirmation.</p>
                    </div>
                  </div>
                )}

                {paidPayment && (
                  <div className="payment-status paid">
                    <span>✓</span>

                    <div>
                      <strong>Payment confirmed</strong>

                      <p>
                        Payment for this order has been recorded successfully.
                      </p>
                    </div>
                  </div>
                )}

                {loyaltyFreeOrder && order.orderStatus === "PENDING" && (
                  <div className="payment-status free">
                    <span>🎁</span>

                    <div>
                      <strong>No payment required</strong>

                      <p>This is an earned free loyalty refill.</p>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <style>
        {`
          .orders-page {
            width: 100%;
          }

          .orders-message {
            margin-bottom: 18px;
            padding: 13px 15px;
            border-radius: 12px;
            background: rgba(41,199,201,0.08);
            border: 1px solid rgba(41,199,201,0.12);
            color: #05616a;
            font-size: 0.85rem;
          }

          .orders-list {
            display: grid;
            gap: 18px;
          }

          .order-card {
            padding: 22px;
            border-radius: 19px;
            background: white;
            border: 1px solid rgba(5,63,80,0.08);
            box-shadow:
              0 12px 32px
              rgba(5,63,80,0.045);
          }

          .order-card-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 18px;
            padding-bottom: 18px;
            border-bottom:
              1px solid
              rgba(5,63,80,0.07);
          }

          .order-label {
            color: #96a6ab;
            font-size: 0.65rem;
            font-weight: 800;
            letter-spacing: 0.14em;
          }

          .order-card-header h3 {
            margin: 4px 0 0;
            color: #053f50;
            font-size: 1.2rem;
          }

          .order-date {
            margin: 5px 0 0;
            color: #94a4aa;
            font-size: 0.72rem;
          }

          .order-header-right {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 7px;
          }

          .order-status,
          .order-special-badge {
            display: inline-flex;
            align-items: center;
            padding: 7px 10px;
            border-radius: 999px;
            font-size: 0.66rem;
            font-weight: 850;
          }

          .order-status {
            color: #053f50;
            background: #eefbfc;
          }

          .status-pending {
            background: #fff8df;
            color: #876814;
          }

          .status-completed {
            background: #e8f8f0;
            color: #22724d;
          }

          .status-ready_for_collection {
            background: #edf4ff;
            color: #315b91;
          }

          .status-cancelled {
            background: #fff0f0;
            color: #a33d3d;
          }

          .order-special-badge {
            background: #29c7c9;
            color: #03141f;
          }

          .card-badge {
            background: #d9f5f6;
            color: #05616a;
          }

          .order-summary-grid {
            margin-top: 18px;
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
          }

          .order-summary-box {
            min-width: 0;
            padding: 14px 15px;
            border-radius: 14px;
            background: #f7fbfc;
            border: 1px solid rgba(5,63,80,0.045);
          }

          .order-summary-box span {
            display: block;
            color: #8a9ba1;
            font-size: 0.64rem;
            font-weight: 700;
            letter-spacing: 0.02em;
          }

          .order-summary-box strong {
            display: block;
            margin-top: 6px;
            color: #053f50;
            font-size: 0.84rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .order-content-grid {
            margin-top: 18px;
            display: grid;
            grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.9fr);
            gap: 16px;
            align-items: start;
          }

          .order-items-panel,
          .order-details-panel {
            min-width: 0;
            padding: 17px;
            border-radius: 16px;
            background: #fbfdfe;
            border: 1px solid rgba(5,63,80,0.055);
          }

          .order-section-title {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 12px;
          }

          .section-eyebrow {
            display: block;
            margin-bottom: 3px;
            color: #9aa8ad;
            font-size: 0.58rem;
            font-weight: 850;
            letter-spacing: 0.14em;
          }

          .order-section-title h4 {
            margin: 0;
            color: #053f50;
            font-size: 0.92rem;
          }

          .item-count {
            color: #9aa8ad;
            font-size: 0.67rem;
            white-space: nowrap;
          }

          .order-items-list {
            display: grid;
            gap: 8px;
          }

          .order-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            border-radius: 13px;
            background: white;
            border: 1px solid rgba(5,63,80,0.06);
          }

          .order-item-icon {
            width: 38px;
            height: 38px;
            flex-shrink: 0;
            display: grid;
            place-items: center;
            border-radius: 11px;
            background: #eaf9fa;
            font-size: 1rem;
          }

          .order-item-main {
            min-width: 0;
            flex: 1;
          }

          .order-item-main strong {
            display: block;
            color: #053f50;
            font-size: 0.8rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .order-item-main span {
            display: block;
            margin-top: 3px;
            color: #8b9da3;
            font-size: 0.67rem;
          }

          .order-item-price {
            flex-shrink: 0;
            text-align: right;
          }

          .order-item-price span {
            display: block;
            color: #95a3a8;
            font-size: 0.6rem;
          }

          .order-item-price strong {
            display: block;
            margin-top: 3px;
            color: #05616a;
            font-size: 0.82rem;
          }

          .order-items-empty {
            padding: 22px 12px;
            text-align: center;
            border-radius: 12px;
            background: white;
            border: 1px dashed rgba(5,63,80,0.1);
            color: #8a9aa0;
            font-size: 0.72rem;
          }

          .special-order-box {
            margin-bottom: 12px;
            padding: 13px;
            border-radius: 13px;
          }

          .special-order-box strong {
            display: block;
            color: #053f50;
            font-size: 0.78rem;
          }

          .special-order-box p {
            margin: 5px 0 0;
            color: #71858c;
            font-size: 0.69rem;
            line-height: 1.5;
          }

          .special-order-box span {
            display: block;
            margin-top: 7px;
            color: #05616a;
            font-size: 0.66rem;
            font-weight: 800;
          }

          .free-refill-box {
            background: linear-gradient(135deg, #eefbf8, #ffffff);
            border: 1px solid rgba(41,199,201,0.15);
          }

          .loyalty-card-box {
            background: linear-gradient(135deg, #f1f8ff, #ffffff);
            border: 1px solid rgba(69,126,180,0.13);
          }

          .refill-box {
            background: #f6fbfc;
            border: 1px solid rgba(5,63,80,0.06);
          }

          .order-detail-list {
            display: grid;
            gap: 0;
            overflow: hidden;
            border-radius: 13px;
            background: white;
            border: 1px solid rgba(5,63,80,0.06);
          }

          .order-detail-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 11px 13px;
            border-bottom: 1px solid rgba(5,63,80,0.055);
          }

          .order-detail-row:last-child {
            border-bottom: none;
          }

          .order-detail-row span {
            color: #8a9ba1;
            font-size: 0.67rem;
          }

          .order-detail-row strong {
            color: #053f50;
            font-size: 0.72rem;
            text-align: right;
          }

          .collection-box {
            margin: 9px;
            padding: 10px 12px;
            border-radius: 11px;
            background: #eefbfc;
            color: #05616a;
            font-size: 0.67rem;
            font-weight: 750;
          }

          .order-notes {
            margin-top: 12px;
            padding: 13px;
            border-radius: 13px;
            background: white;
            border: 1px solid rgba(5,63,80,0.06);
          }

          .order-notes span {
            color: #8a9ba1;
            font-size: 0.63rem;
            font-weight: 800;
            letter-spacing: 0.03em;
          }

          .order-notes p {
            margin: 5px 0 0;
            color: #536d75;
            font-size: 0.71rem;
            line-height: 1.55;
          }

          .order-payment-area {
            margin-top: 16px;
            padding: 15px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            border-radius: 15px;
            background: linear-gradient(135deg, #effbfc, #ffffff);
            border: 1px solid rgba(41,199,201,0.14);
          }

          .order-payment-area strong {
            display: block;
            color: #053f50;
            font-size: 0.8rem;
          }

          .order-payment-area span {
            display: block;
            margin-top: 4px;
            color: #8a9ba1;
            font-size: 0.66rem;
          }

          .pay-button {
            border: none;
            border-radius: 11px;
            padding: 11px 17px;
            background: #29c7c9;
            color: #03141f;
            cursor: pointer;
            font-weight: 850;
            white-space: nowrap;
            box-shadow: 0 6px 14px rgba(41,199,201,0.15);
          }

          .pay-button:hover:not(:disabled) {
            transform: translateY(-1px);
          }

          .pay-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .payment-status {
            margin-top: 16px;
            padding: 13px 15px;
            display: flex;
            align-items: center;
            gap: 11px;
            border-radius: 14px;
          }

          .payment-status > span {
            width: 30px;
            height: 30px;
            flex-shrink: 0;
            display: grid;
            place-items: center;
            border-radius: 9px;
            background: rgba(255,255,255,0.65);
            font-size: 0.92rem;
          }

          .payment-status strong {
            display: block;
            font-size: 0.78rem;
          }

          .payment-status p {
            margin: 3px 0 0;
            font-size: 0.67rem;
            line-height: 1.45;
          }

          .payment-status.pending {
            background: #fff8df;
            color: #79601c;
          }

          .payment-status.pending p {
            color: #927a34;
          }

          .payment-status.paid {
            background: #e9f8f0;
            color: #27704d;
          }

          .payment-status.paid p {
            color: #4e8a6c;
          }

          .payment-status.free {
            background: #eefbfa;
            color: #05616a;
          }

          .payment-status.free p {
            color: #4e858a;
          }

          .orders-empty {
            padding: 50px 25px;
            text-align: center;
            border-radius: 18px;
            background: #f8fbfc;
          }

          .orders-empty-icon {
            font-size: 2rem;
          }

          .orders-empty h3 {
            margin: 12px 0 0;
            color: #053f50;
          }

          .orders-empty p {
            margin: 8px auto 0;
            max-width: 450px;
            color: #8a9aa0;
            font-size: 0.8rem;
            line-height: 1.6;
          }

          @media (max-width: 900px) {
            .order-content-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 850px) {
            .order-summary-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 650px) {
            .order-card-header {
              flex-direction: column;
            }

            .order-header-right {
              justify-content: flex-start;
            }

            .order-summary-grid {
              grid-template-columns: 1fr 1fr;
            }

            .order-payment-area {
              align-items: stretch;
              flex-direction: column;
            }

            .pay-button {
              width: 100%;
            }

            .order-item {
              align-items: flex-start;
            }

            .order-item-price {
              margin-left: auto;
            }
          }

          @media (max-width: 450px) {
            .order-summary-grid {
              grid-template-columns: 1fr;
            }

            .order-item {
              align-items: flex-start;
            }

            .order-item-price span {
              display: none;
            }

            .order-card {
              padding: 17px;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Orders;
