import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createOrder,
  createOrderItem,
  getAddresses,
  getLoyaltyStatus,
  getProducts,
  type Address,
  type Product,
  type RefillLoyaltyStatus,
} from "../services/api";

type OrderMode = "BOTTLED" | "REFILL" | "LOYALTY_CARD";

function CreateOrder() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loyaltyStatus, setLoyaltyStatus] =
    useState<RefillLoyaltyStatus | null>(null);

  const [addressId, setAddressId] = useState("");
  const [productId, setProductId] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [orderMode, setOrderMode] = useState<OrderMode>("BOTTLED");

  const [orderType, setOrderType] = useState<"DELIVERY" | "COLLECTION">(
    "DELIVERY",
  );

  const [useFreeRefill, setUseFreeRefill] = useState(false);
  const [refillMethod, setRefillMethod] = useState<"NORMAL" | "LOYALTY">(
    "NORMAL",
  );
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setMessage("");

        const [addressData, productData, loyaltyStatusData] = await Promise.all(
          [getAddresses(), getProducts(), getLoyaltyStatus()],
        );

        setAddresses(addressData);
        setProducts(productData);
        setLoyaltyStatus(loyaltyStatusData);

        if (addressData.length > 0) {
          setAddressId(addressData[0].addressId);
        }

        const customerProducts = productData.filter(
          (product) =>
            product.productType !== "REFILL" &&
            product.productType !== "REFILL_CARD",
        );

        if (customerProducts.length > 0) {
          setProductId(customerProducts[0].productId);
        }
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load order information.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  /*
   * Water refill is kept in the backend catalogue as
   * ProductType = REFILL, but it is NOT shown as a
   * normal bottled-water product.
   */
  const bottledProducts = products.filter(
    (product) =>
      product.productType !== "REFILL" && product.productType !== "REFILL_CARD",
  );

  const refillProduct = products.find(
    (product) => product.productType === "REFILL",
  );

  const loyaltyCardProduct = products.find(
    (product) => product.productType === "REFILL_CARD",
  );

  const selectedBottledProduct = bottledProducts.find(
    (product) => product.productId === productId,
  );

  const selectedProduct =
    orderMode === "REFILL"
      ? refillProduct
      : orderMode === "LOYALTY_CARD"
        ? loyaltyCardProduct
        : selectedBottledProduct;

  const effectiveOrderType =
    orderMode === "REFILL" || orderMode === "LOYALTY_CARD"
      ? "COLLECTION"
      : orderType;

  const estimatedTotal = useFreeRefill
    ? 0
    : selectedProduct
      ? selectedProduct.price * quantity
      : 0;

  function handleModeChange(mode: OrderMode) {
    setOrderMode(mode);
    setMessage("");
    setUseFreeRefill(false);

    if (mode === "REFILL") {
      setOrderType("COLLECTION");
      setQuantity(1);
      setRefillMethod("NORMAL");
      setUseFreeRefill(false);

      if (refillProduct) {
        setProductId(refillProduct.productId);
      }

      return;
    }

    if (mode === "LOYALTY_CARD") {
      setOrderType("COLLECTION");
      setQuantity(1);

      if (loyaltyCardProduct) {
        setProductId(loyaltyCardProduct.productId);
      }

      return;
    }

    setOrderType("DELIVERY");
    setQuantity(1);

    if (bottledProducts.length > 0) {
      setProductId(bottledProducts[0].productId);
    }
  }

  function handleUseFreeRefill() {
    if (
      !loyaltyStatus?.hasLoyaltyCard ||
      loyaltyStatus.freeRefillsAvailable <= 0
    ) {
      return;
    }

    if (!refillProduct) {
      setMessage("Water Refill is currently unavailable.");
      return;
    }

    setOrderMode("REFILL");
    setOrderType("COLLECTION");
    setRefillMethod("LOYALTY");
    setProductId(refillProduct.productId);
    setQuantity(5);
    setUseFreeRefill(true);
    setMessage("");
  }
  function increaseQuantity() {
    if (orderMode === "LOYALTY_CARD" || useFreeRefill || !selectedProduct) {
      return;
    }

    const max = selectedProduct.stockQuantity ?? 1;

    if (quantity < max) {
      setQuantity((current) => current + 1);
    }
  }

  function decreaseQuantity() {
    if (orderMode === "LOYALTY_CARD" || useFreeRefill) {
      return;
    }

    setQuantity((current) => Math.max(1, current - 1));
  }

  function handleQuantityInputChange(value: string) {
    if (orderMode === "LOYALTY_CARD" || useFreeRefill) {
      return;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 1) {
      setQuantity(1);
      return;
    }

    const max = selectedProduct?.stockQuantity ?? parsed;

    setQuantity(Math.min(Math.floor(parsed), max));

    if (useFreeRefill) {
      setUseFreeRefill(false);
    }
  }

  async function handleCreateOrder() {
    setMessage("");

    if (!addressId) {
      setMessage("Please select a saved address.");
      return;
    }

    if (orderMode === "REFILL" && !refillProduct) {
      setMessage("Water Refill is currently unavailable.");
      return;
    }

    if (orderMode === "LOYALTY_CARD" && !loyaltyCardProduct) {
      setMessage("The Refill Loyalty Card is currently unavailable.");
      return;
    }

    if (!selectedProduct) {
      setMessage("Please select a product.");
      return;
    }

    if (orderMode === "LOYALTY_CARD" && loyaltyStatus?.hasLoyaltyCard) {
      setMessage("You already have an active refill loyalty card.");
      return;
    }

    /*
     * LOYALTY FREE REFILL
     * Must be:
     * - Water Refill
     * - Use Loyalty Card selected
     * - Active loyalty card
     * - At least 1 free refill available
     * - Exactly 5L
     * - Collection only
     */
    if (orderMode === "REFILL" && refillMethod === "LOYALTY") {
      if (!loyaltyStatus?.hasLoyaltyCard) {
        setMessage("You do not have an active loyalty card.");
        return;
      }

      if (loyaltyStatus.freeRefillsAvailable <= 0) {
        setMessage("You do not have an available free 5L refill.");
        return;
      }

      if (quantity !== 5) {
        setMessage("A loyalty card refill must be exactly 5 litres.");
        return;
      }

      if (effectiveOrderType !== "COLLECTION") {
        setMessage("Loyalty card refills are collection only.");
        return;
      }

      setUseFreeRefill(true);
    }

    /*
     * NORMAL REFILL
     * Normal refill remains R1 per litre.
     */
    if (orderMode === "REFILL" && refillMethod === "NORMAL") {
      setUseFreeRefill(false);
    }

    /*
     * LOYALTY CARD PURCHASE
     */
    if (orderMode === "LOYALTY_CARD" && quantity !== 1) {
      setMessage("The loyalty card quantity must be 1.");
      return;
    }

    if (quantity <= 0) {
      setMessage(
        orderMode === "REFILL"
          ? "Litres must be greater than zero."
          : "Quantity must be greater than zero.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const order = await createOrder({
        addressId,
        orderType: effectiveOrderType,
        useLoyaltyFreeRefill:
          orderMode === "REFILL" && refillMethod === "LOYALTY",
        notes: notes.trim() || undefined,
      });

      await createOrderItem({
        orderId: order.orderId,
        productId: selectedProduct.productId,
        quantity,
      });

      navigate("/customer");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not create order.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  const loyaltyProgress = loyaltyStatus?.hasLoyaltyCard
    ? Math.min(
        100,
        (loyaltyStatus.tickCount / loyaltyStatus.ticksRequired) * 100,
      )
    : 0;

  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: #f4fafb;
            font-family:
              Inter,
              ui-sans-serif,
              system-ui,
              sans-serif;
            color: #17343e;
          }

          .order-page {
            min-height: 100vh;
            background:
              radial-gradient(
                circle at 85% 10%,
                rgba(41, 199, 201, 0.08),
                transparent 26%
              ),
              linear-gradient(
                180deg,
                #f1fafb,
                #ffffff
              );
          }

          .order-topbar {
            min-height: 76px;
            padding: 0 35px;

            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;

            background:
              rgba(255,255,255,0.9);

            border-bottom:
              1px solid
              rgba(5,63,80,0.07);

            backdrop-filter: blur(16px);
          }

          .order-topbar img {
            width: 145px;
          }

          .order-back {
            border: none;
            background: transparent;
            color: #053f50;
            cursor: pointer;
            font-weight: 750;
          }

          .order-container {
            width: min(
              1080px,
              calc(100% - 40px)
            );

            margin: 0 auto;

            padding: 45px 0 70px;
          }

          .order-heading {
            margin-bottom: 28px;
          }

          .order-eyebrow {
            color: #118a8c;
            font-size: 0.75rem;
            font-weight: 800;
            letter-spacing: 0.16em;
            text-transform: uppercase;
          }

          .order-heading h1 {
            margin: 10px 0 0;
            color: #053f50;
            font-size:
              clamp(2.2rem, 5vw, 3.7rem);
            letter-spacing: -0.045em;
            line-height: 1;
          }

          .order-heading p {
            margin: 12px 0 0;
            color: #73888f;
            line-height: 1.7;
          }

          .order-layout {
            display: grid;
            grid-template-columns:
              1.35fr 0.65fr;
            gap: 22px;
            align-items: start;
          }

          .order-card {
            padding: 28px;

            border-radius: 25px;

            background: white;

            border:
              1px solid
              rgba(5,63,80,0.07);

            box-shadow:
              0 18px 50px
              rgba(5,63,80,0.06);
          }

          .order-section-title {
            margin: 0 0 17px;
            color: #053f50;
            font-size: 1rem;
          }

          .order-mode-grid {
            display: grid;
            grid-template-columns:
              repeat(3, 1fr);
            gap: 12px;
          }

          .order-mode-button {
            position: relative;

            border:
              1px solid
              rgba(5,63,80,0.1);

            border-radius: 17px;

            padding: 20px;

            text-align: left;

            background: #f8fcfd;
            color: #526a72;

            cursor: pointer;

            transition:
              border-color 0.2s ease,
              background 0.2s ease,
              transform 0.2s ease;
          }

          .order-mode-button:hover {
            transform: translateY(-2px);
            border-color: #29c7c9;
          }

          .order-mode-button.active {
            color: #053f50;
            background:
              rgba(41,199,201,0.08);

            border-color: #29c7c9;

            box-shadow:
              0 8px 25px
              rgba(41,199,201,0.08);
          }

          .order-mode-icon {
            font-size: 1.45rem;
          }

          .order-mode-button strong {
            display: block;
            margin-top: 10px;
            font-size: 0.95rem;
          }

          .order-mode-button span {
            display: block;
            margin-top: 5px;
            color: #87999f;
            font-size: 0.75rem;
            line-height: 1.5;
          }

          .order-form-section {
            margin-top: 25px;
          }

          .order-field {
            display: grid;
            gap: 8px;
            margin-top: 15px;
          }

          .order-field label {
            color: #44616a;
            font-size: 0.8rem;
            font-weight: 750;
          }

          .order-input,
          .order-select,
          .order-textarea {
            width: 100%;

            border:
              1px solid
              rgba(5,63,80,0.11);

            border-radius: 12px;

            padding: 12px 13px;

            color: #17343e;
            background: white;

            outline: none;
          }

          .order-input:focus,
          .order-select:focus,
          .order-textarea:focus {
            border-color: #29c7c9;

            box-shadow:
              0 0 0 3px
              rgba(41,199,201,0.09);
          }

          .order-textarea {
            min-height: 110px;
            resize: vertical;
          }

          .delivery-type-grid {
            display: grid;
            grid-template-columns:
              1fr 1fr;
            gap: 10px;
          }

          .delivery-type-button {
            border:
              1px solid
              rgba(5,63,80,0.1);

            border-radius: 13px;

            padding: 12px;

            background: #f8fcfd;
            color: #526a72;

            cursor: pointer;
            font-weight: 700;
          }

          .delivery-type-button.active {
            color: #03141f;
            background: #29c7c9;
            border-color: #29c7c9;
          }

          .collection-only-box {
            display: flex;
            align-items: center;
            gap: 10px;

            padding: 13px 14px;

            border-radius: 13px;

            background:
              rgba(41,199,201,0.08);

            border:
              1px solid
              rgba(41,199,201,0.13);

            color: #05616a;

            font-size: 0.78rem;
            font-weight: 800;
          }

          .quantity-control {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .quantity-control button {
            width: 40px;
            height: 40px;

            border:
              1px solid
              rgba(5,63,80,0.1);

            border-radius: 10px;

            color: #053f50;
            background: #f2fbfc;

            cursor: pointer;

            font-weight: 900;
            font-size: 1.1rem;
          }

          .quantity-control button:disabled {
            opacity: 0.45;
            cursor: not-allowed;
          }

          .quantity-value {
            min-width: 85px;

            text-align: center;

            border:
              1px solid
              rgba(5,63,80,0.1);

            border-radius: 10px;

            padding: 10px;

            color: #053f50;
            background: white;

            font-weight: 800;
          }

          .order-message {
            margin-top: 18px;

            padding: 13px 14px;

            border-radius: 13px;

            color: #8a4545;

            background:
              rgba(255,90,90,0.07);

            border:
              1px solid
              rgba(255,90,90,0.12);

            font-size: 0.82rem;
            line-height: 1.55;
          }

          .order-action {
            width: 100%;
            margin-top: 20px;

            border: none;
            border-radius: 13px;

            padding: 14px;

            color: #03141f;
            background:
              linear-gradient(
                135deg,
                #29c7c9,
                #58e1e2
              );

            cursor: pointer;

            font-weight: 850;
            box-shadow:
              0 12px 28px
              rgba(41,199,201,0.16);
          }

          .order-action:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          /* =========================
             LOYALTY
          ========================== */

          .loyalty-panel {
            margin-top: 20px;
            padding: 20px;

            border-radius: 18px;

            background:
              linear-gradient(
                135deg,
                #053f50,
                #075d67
              );

            color: white;
          }

          .loyalty-panel-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 15px;
          }

          .loyalty-panel-eyebrow {
            color: #8deff0;
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.13em;
            font-weight: 850;
          }

          .loyalty-panel h3 {
            margin: 7px 0 0;
            font-size: 1.05rem;
          }

          .loyalty-panel p {
            margin: 7px 0 0;
            color:
              rgba(255,255,255,0.62);
            font-size: 0.74rem;
            line-height: 1.55;
          }

          .loyalty-badge {
            padding: 7px 10px;
            border-radius: 999px;

            background: #29c7c9;
            color: #03141f;

            font-size: 0.62rem;
            font-weight: 850;
          }

          .loyalty-progress {
            margin-top: 18px;
          }

          .loyalty-progress-head {
            display: flex;
            justify-content: space-between;
            gap: 10px;
          }

          .loyalty-progress-head span {
            color:
              rgba(255,255,255,0.58);
            font-size: 0.7rem;
          }

          .loyalty-progress-head strong {
            color: white;
            font-size: 0.76rem;
          }

          .loyalty-progress-track {
            height: 9px;
            margin-top: 8px;

            overflow: hidden;
            border-radius: 999px;

            background:
              rgba(255,255,255,0.1);
          }

          .loyalty-progress-fill {
            height: 100%;

            border-radius: inherit;

            background:
              linear-gradient(
                90deg,
                #29c7c9,
                #8deff0
              );
          }

          .loyalty-stats {
            margin-top: 14px;

            display: grid;
            grid-template-columns:
              1fr 1fr;
            gap: 9px;
          }

          .loyalty-stat {
            padding: 12px;

            border:
              1px solid
              rgba(255,255,255,0.08);

            border-radius: 12px;

            background:
              rgba(255,255,255,0.045);
          }

          .loyalty-stat span {
            display: block;
            color:
              rgba(255,255,255,0.48);
            font-size: 0.62rem;
          }

          .loyalty-stat strong {
            display: block;
            margin-top: 5px;
            color: white;
            font-size: 1rem;
          }

          .loyalty-free-button {
            width: 100%;
            margin-top: 15px;

            border: none;
            border-radius: 11px;

            padding: 11px 14px;

            background: #29c7c9;
            color: #03141f;

            cursor: pointer;
            font-weight: 850;
          }

          .loyalty-free-button:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }

          .loyalty-card-prompt {
            margin-top: 20px;
            padding: 17px;

            border-radius: 16px;

            background:
              linear-gradient(
                135deg,
                #f2fbfc,
                #ffffff
              );

            border:
              1px solid
              rgba(41,199,201,0.12);
          }

          .loyalty-card-prompt strong {
            display: block;
            color: #053f50;
            font-size: 0.85rem;
          }

          .loyalty-card-prompt p {
            margin: 6px 0 0;
            color: #71858c;
            font-size: 0.72rem;
            line-height: 1.55;
          }

          .loyalty-card-prompt button {
            margin-top: 11px;

            border: none;
            border-radius: 10px;

            padding: 10px 14px;

            background: #29c7c9;
            color: #03141f;

            cursor: pointer;
            font-size: 0.72rem;
            font-weight: 850;
          }

          .collection-only-card {
            margin-top: 17px;

            padding: 14px;

            border-radius: 13px;

            background: #eefbfc;

            color: #05616a;

            font-size: 0.75rem;
            font-weight: 800;
          }

          /* SUMMARY */

          .order-summary {
            position: sticky;
            top: 95px;
          }

          .order-summary-heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }

          .order-summary-heading h2 {
            margin: 0;
            color: #053f50;
            font-size: 1.1rem;
          }

          .order-summary-label {
            color: #118a8c;
            font-size: 0.7rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }

          .order-summary-product {
            margin-top: 22px;

            padding: 18px;

            border-radius: 17px;

            background:
              linear-gradient(
                135deg,
                #f0fbfc,
                #ffffff
              );
          }
          .refill-method-selector {
            margin-top: 20px;

            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .refill-method-button {
            border:
              1px solid
              rgba(5,63,80,0.1);

            border-radius: 15px;

            padding: 15px;

            display: flex;
            align-items: center;
            gap: 10px;

            background: #f8fcfd;
            color: #526a72;

            cursor: pointer;

            text-align: left;

            transition:
              border-color 0.2s ease,
              background 0.2s ease;
          }

          .refill-method-button.active {
            color: #053f50;

            background:
              rgba(41,199,201,0.08);

            border-color: #29c7c9;
          }

          .refill-method-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .refill-method-icon {
            font-size: 1.25rem;
          }

          .refill-method-button strong {
            font-size: 0.8rem;
          }

          .refill-method-button small {
            margin-left: auto;

            color: #87999f;

            font-size: 0.66rem;
          }

          .refill-card-use-panel {
            border-color:
              rgba(41,199,201,0.18);
          }

          .loyalty-remaining-box {
            margin-top: 14px;

            padding: 15px;

            border-radius: 13px;

            background:
              #eefbfc;

            text-align: center;
          }

          .loyalty-remaining-box span {
            display: block;

            color: #7b9299;

            font-size: 0.68rem;
          }

          .loyalty-remaining-box strong {
            display: block;

            margin-top: 5px;

            color: #053f50;

            font-size: 1.6rem;
          }

          .loyalty-remaining-box small {
            display: block;

            margin-top: 3px;

            color: #05616a;

            font-size: 0.68rem;
          }

          .free-refill-choice {
            margin-top: 12px;

            padding: 13px;

            display: flex;

            align-items: center;

            justify-content: space-between;

            border-radius: 12px;

            background:
              rgba(41,199,201,0.08);

            color: #05616a;

            font-size: 0.75rem;

            font-weight: 750;
          }

          .no-free-refill {
            margin-top: 12px;

            padding: 12px;

            border-radius: 12px;

            background:
              rgba(255,90,90,0.06);

            color: #8a5555;

            font-size: 0.72rem;
          }

          @media (max-width: 600px) {
            .refill-method-selector {
              grid-template-columns: 1fr;
            }

            .refill-method-button {
              align-items: flex-start;
            }
          }
          .order-summary-product strong {
            color: #053f50;
          }

          .order-summary-product p {
            margin: 7px 0 0;
            color: #7b8d93;
            font-size: 0.78rem;
            line-height: 1.6;
          }

          .order-total {
            margin-top: 20px;
            padding-top: 18px;

            border-top:
              1px solid
              rgba(5,63,80,0.08);
          }

          .order-total span {
            color: #87999f;
            font-size: 0.78rem;
          }

          .order-total strong {
            display: block;
            margin-top: 6px;

            color: #053f50;
            font-size: 2rem;
          }

          .refill-note {
            margin-top: 17px;

            padding: 13px 14px;

            border-radius: 13px;

            background:
              rgba(41,199,201,0.07);

            color: #4f7178;

            font-size: 0.75rem;
            line-height: 1.6;
          }

          .free-refill-summary {
            background:
              linear-gradient(
                135deg,
                #eefbf9,
                #ffffff
              );
          }

          .loyalty-card-summary {
            background:
              linear-gradient(
                135deg,
                #f0f8ff,
                #ffffff
              );
          }

          .order-loading {
            min-height: 100vh;
            display: grid;
            place-items: center;

            color: #053f50;

            background:
              linear-gradient(
                180deg,
                #f1fafb,
                #ffffff
              );
          }

          @media (max-width: 980px) {
            .order-mode-grid {
              grid-template-columns:
                1fr;
            }
          }

          @media (max-width: 900px) {
            .order-layout {
              grid-template-columns: 1fr;
            }

            .order-summary {
              position: static;
            }
          }

          @media (max-width: 600px) {
            .order-topbar {
              padding: 0 18px;
            }

            .order-container {
              width: min(
                100% - 28px,
                1080px
              );

              padding-top: 28px;
            }

            .order-card {
              padding: 22px;
            }

            .delivery-type-grid,
            .loyalty-stats {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="order-page">
        <header className="order-topbar">
          <img src="/swivel-water-logo.png" alt="Swivel Water" />

          <button
            type="button"
            className="order-back"
            onClick={() => navigate("/customer")}
          >
            ← Back to Dashboard
          </button>
        </header>

        <main className="order-container">
          <div className="order-heading">
            <div className="order-eyebrow">Swivel Water</div>

            <h1>Create Your Order</h1>

            <p>Choose your water, refill, or loyalty service.</p>
          </div>

          <div className="order-layout">
            {/* FORM */}

            <section className="order-card">
              <h2 className="order-section-title">What would you like?</h2>

              <div className="order-mode-grid">
                <button
                  type="button"
                  className={`order-mode-button ${
                    orderMode === "BOTTLED" ? "active" : ""
                  }`}
                  onClick={() => handleModeChange("BOTTLED")}
                >
                  <div className="order-mode-icon">💧</div>

                  <strong>Bottled Water</strong>

                  <span>
                    Choose from our available bottled water and water
                    containers.
                  </span>
                </button>

                <button
                  type="button"
                  className={`order-mode-button ${
                    orderMode === "REFILL" ? "active" : ""
                  }`}
                  onClick={() => handleModeChange("REFILL")}
                >
                  <div className="order-mode-icon">♻️</div>

                  <strong>Water Refill</strong>

                  <span>
                    Refill your container at R1 per litre. Collection only.
                  </span>
                </button>

                <button
                  type="button"
                  className={`order-mode-button ${
                    orderMode === "LOYALTY_CARD" ? "active" : ""
                  }`}
                  onClick={() => handleModeChange("LOYALTY_CARD")}
                  disabled={loyaltyStatus?.hasLoyaltyCard === true}
                >
                  <div className="order-mode-icon">🎟️</div>

                  <strong>Refill Loyalty Card</strong>

                  <span>R50 digital card with refill rewards.</span>
                </button>
              </div>

              {orderMode === "REFILL" && (
                <>
                  {!refillProduct && (
                    <div className="order-message">
                      Water Refill is currently unavailable.
                    </div>
                  )}

                  {refillProduct && (
                    <>
                      {/* REFILL METHOD */}

                      <div className="refill-method-selector">
                        <button
                          type="button"
                          className={`refill-method-button ${
                            refillMethod === "NORMAL" ? "active" : ""
                          }`}
                          onClick={() => {
                            setRefillMethod("NORMAL");
                            setUseFreeRefill(false);
                            setQuantity(1);
                            setMessage("");
                          }}
                        >
                          <span className="refill-method-icon">💧</span>

                          <div>
                            <strong>Normal Refill</strong>

                            <small>R1.00 per litre</small>
                          </div>
                        </button>

                        <button
                          type="button"
                          className={`refill-method-button ${
                            refillMethod === "LOYALTY" ? "active" : ""
                          }`}
                          onClick={() => {
                            setRefillMethod("LOYALTY");

                            if (
                              loyaltyStatus?.hasLoyaltyCard &&
                              loyaltyStatus.freeRefillsAvailable > 0
                            ) {
                              setQuantity(5);
                              setUseFreeRefill(true);
                            } else {
                              setUseFreeRefill(false);
                            }

                            setMessage("");
                          }}
                          disabled={!loyaltyStatus?.hasLoyaltyCard}
                        >
                          <span className="refill-method-icon">🎟️</span>

                          <div>
                            <strong>Use Loyalty Card</strong>

                            <small>
                              {loyaltyStatus?.hasLoyaltyCard
                                ? `${(
                                    loyaltyStatus.freeRefillsAvailable * 5
                                  ).toFixed(0)}L remaining`
                                : "No loyalty card"}
                            </small>
                          </div>
                        </button>
                      </div>

                      {/* NORMAL REFILL */}

                      {refillMethod === "NORMAL" && (
                        <>
                          {loyaltyStatus?.hasLoyaltyCard ? (
                            <div className="loyalty-panel">
                              <div className="loyalty-panel-header">
                                <div>
                                  <div className="loyalty-panel-eyebrow">
                                    Your Loyalty
                                  </div>

                                  <h3>5L Refill Loyalty</h3>

                                  <p>
                                    Earn one tick for every qualifying paid 5L
                                    refill.
                                  </p>
                                </div>

                                <div className="loyalty-badge">ACTIVE</div>
                              </div>

                              <div className="loyalty-progress">
                                <div className="loyalty-progress-head">
                                  <span>Progress to next free refill</span>

                                  <strong>
                                    {loyaltyStatus.tickCount} /{" "}
                                    {loyaltyStatus.ticksRequired}
                                  </strong>
                                </div>

                                <div className="loyalty-progress-track">
                                  <div
                                    className="loyalty-progress-fill"
                                    style={{
                                      width: `${loyaltyProgress}%`,
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="loyalty-stats">
                                <div className="loyalty-stat">
                                  <span>Current Ticks</span>

                                  <strong>{loyaltyStatus.tickCount}</strong>
                                </div>

                                <div className="loyalty-stat">
                                  <span>Free 5L Refills</span>

                                  <strong>
                                    {loyaltyStatus.freeRefillsAvailable}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="loyalty-card-prompt">
                              <strong>🎟️ Want to earn free refills?</strong>

                              <p>
                                Get the R50 digital loyalty card and earn one
                                tick for every qualifying paid 5L refill. After
                                10 ticks, you receive a free 5L refill.
                              </p>

                              <button
                                type="button"
                                onClick={() => handleModeChange("LOYALTY_CARD")}
                              >
                                Get Loyalty Card — R50
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      {/* LOYALTY CARD REFILL */}

                      {refillMethod === "LOYALTY" && (
                        <div className="loyalty-card-prompt refill-card-use-panel">
                          <strong>🎟️ Use Your Loyalty Card</strong>

                          <p>
                            Your free refill balance is shown below. Each free
                            reward gives you one free 5L refill.
                          </p>

                          <div className="loyalty-remaining-box">
                            <span>Remaining free refill balance</span>

                            <strong>
                              {(loyaltyStatus?.freeRefillsAvailable ?? 0) * 5}L
                            </strong>

                            <small>
                              {loyaltyStatus?.freeRefillsAvailable ?? 0} free 5L
                              refill
                              {(loyaltyStatus?.freeRefillsAvailable ?? 0) === 1
                                ? ""
                                : "s"}{" "}
                              available
                            </small>
                          </div>

                          {loyaltyStatus?.freeRefillsAvailable &&
                          loyaltyStatus.freeRefillsAvailable > 0 ? (
                            <div className="free-refill-choice">
                              <span>Refill amount</span>

                              <strong>5L</strong>

                              <span>R0.00</span>
                            </div>
                          ) : (
                            <div className="no-free-refill">
                              You have no free 5L refill available.
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
              {orderMode === "REFILL" && refillMethod === "NORMAL" && (
                <div className="loyalty-card-prompt">
                  <strong>🎟️ 5L Refill Loyalty Card</strong>

                  <p>
                    Pay R50 once for your digital loyalty membership. Qualifying
                    paid refills earn ticks toward free 5L refills.
                  </p>

                  <div className="collection-only-card">📍 Collection only</div>
                </div>
              )}
              <div className="order-form-section">
                <h2 className="order-section-title">Order Details</h2>

                {orderMode === "BOTTLED" && (
                  <div className="order-field">
                    <label htmlFor="product">Product</label>

                    <select
                      id="product"
                      className="order-select"
                      value={productId}
                      onChange={(event) => {
                        setProductId(event.target.value);

                        setQuantity(1);
                        setUseFreeRefill(false);
                      }}
                    >
                      {bottledProducts.map((product) => (
                        <option
                          key={product.productId}
                          value={product.productId}
                        >
                          {product.productName}
                          {" - R "}
                          {product.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {orderMode === "REFILL" && refillProduct && (
                  <div className="order-field">
                    <label>Refill</label>

                    <div
                      style={{
                        padding: "13px",
                        borderRadius: "12px",
                        background: "#f2fbfc",
                        color: "#053f50",
                        fontWeight: 750,
                      }}
                    >
                      Water Refill —{" R1.00 per litre"}
                    </div>
                  </div>
                )}

                {orderMode === "LOYALTY_CARD" && loyaltyCardProduct && (
                  <div className="order-field">
                    <label>Loyalty Card</label>

                    <div
                      style={{
                        padding: "13px",
                        borderRadius: "12px",
                        background: "#f2fbfc",
                        color: "#053f50",
                        fontWeight: 750,
                      }}
                    >
                      5L Refill Loyalty Card — R50.00
                    </div>
                  </div>
                )}

                {orderMode !== "LOYALTY_CARD" && (
                  <div className="order-field">
                    <label>
                      {orderMode === "REFILL" ? "Litres" : "Quantity"}
                    </label>

                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1 || useFreeRefill}
                      >
                        −
                      </button>

                      <div className="quantity-value">
                        {quantity}
                        {orderMode === "REFILL" ? " L" : ""}
                      </div>

                      <button
                        type="button"
                        onClick={increaseQuantity}
                        disabled={
                          useFreeRefill ||
                          !selectedProduct ||
                          quantity >= selectedProduct.stockQuantity
                        }
                      >
                        +
                      </button>
                    </div>

                    {useFreeRefill && (
                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#05616a",
                          fontSize: "0.74rem",
                          fontWeight: 750,
                        }}
                      >
                        Free loyalty refill is fixed at 5L.
                      </p>
                    )}
                  </div>
                )}

                {orderMode === "LOYALTY_CARD" ? (
                  <div className="order-field">
                    <label>Quantity</label>

                    <div className="quantity-value">1</div>
                  </div>
                ) : null}

                <div className="order-field">
                  <label>Order Method</label>

                  {orderMode === "BOTTLED" ? (
                    <div className="delivery-type-grid">
                      <button
                        type="button"
                        className={`delivery-type-button ${
                          orderType === "DELIVERY" ? "active" : ""
                        }`}
                        onClick={() => setOrderType("DELIVERY")}
                      >
                        🚚 Delivery
                      </button>

                      <button
                        type="button"
                        className={`delivery-type-button ${
                          orderType === "COLLECTION" ? "active" : ""
                        }`}
                        onClick={() => setOrderType("COLLECTION")}
                      >
                        📦 Collection
                      </button>
                    </div>
                  ) : (
                    <div className="collection-only-box">
                      📍 Collection only
                    </div>
                  )}
                </div>

                <div className="order-field">
                  <label htmlFor="address">Saved Address</label>

                  <select
                    id="address"
                    className="order-select"
                    value={addressId}
                    onChange={(event) => setAddressId(event.target.value)}
                  >
                    {addresses.map((address) => (
                      <option key={address.addressId} value={address.addressId}>
                        {address.addressLine1}
                        {", "}
                        {address.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="order-field">
                  <label htmlFor="notes">Notes</label>

                  <textarea
                    id="notes"
                    className="order-textarea"
                    placeholder="Optional notes for your order"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </div>
              </div>

              {message && <div className="order-message">{message}</div>}

              <button
                type="button"
                className="order-action"
                disabled={
                  submitting || !selectedProduct || addresses.length === 0
                }
                onClick={handleCreateOrder}
              >
                {submitting
                  ? "Creating Order..."
                  : orderMode === "LOYALTY_CARD"
                    ? "Continue to Payment"
                    : useFreeRefill
                      ? "Claim Free 5L Refill"
                      : "Create Order"}
              </button>
            </section>

            {/* SUMMARY */}

            <aside className="order-card order-summary">
              <div className="order-summary-heading">
                <h2>Order Summary</h2>

                <span className="order-summary-label">
                  {effectiveOrderType}
                </span>
              </div>

              <div
                className={`order-summary-product ${
                  useFreeRefill
                    ? "free-refill-summary"
                    : orderMode === "LOYALTY_CARD"
                      ? "loyalty-card-summary"
                      : ""
                }`}
              >
                <strong>
                  {selectedProduct
                    ? selectedProduct.productName
                    : orderMode === "REFILL"
                      ? "Water Refill"
                      : orderMode === "LOYALTY_CARD"
                        ? "5L Refill Loyalty Card"
                        : "Select a product"}
                </strong>

                <p>
                  {useFreeRefill
                    ? "Earned free 5L refill"
                    : orderMode === "REFILL"
                      ? "Purified water refill"
                      : orderMode === "LOYALTY_CARD"
                        ? "Digital refill loyalty membership"
                        : (selectedProduct?.description ??
                          "Swivel Water purified drinking water.")}
                </p>

                <p>
                  {orderMode === "LOYALTY_CARD"
                    ? "1 digital card"
                    : orderMode === "REFILL"
                      ? `${quantity} litre${quantity === 1 ? "" : "s"}`
                      : `${quantity} item${quantity === 1 ? "" : "s"}`}
                </p>
              </div>

              <div className="order-total">
                <span>{useFreeRefill ? "Amount Due" : "Estimated Total"}</span>

                <strong>R {estimatedTotal.toFixed(2)}</strong>
              </div>

              {orderMode === "REFILL" && (
                <div className="refill-note">
                  Water refill pricing is
                  <strong>{" R1.00 per litre"}</strong>
                  .
                  <br />
                  All refill orders are
                  <strong>{" collection only"}</strong>.
                </div>
              )}

              {orderMode === "LOYALTY_CARD" && (
                <div className="refill-note">
                  The loyalty card costs
                  <strong>{" R50.00"}</strong>
                  and is a digital membership.
                  <br />
                  Collection only.
                </div>
              )}

              {useFreeRefill && (
                <div className="refill-note">
                  🎁 Your earned free refill is being redeemed.
                  <br />
                  Exactly 5L • R0.00 • Collection only.
                </div>
              )}
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}

export default CreateOrder;
