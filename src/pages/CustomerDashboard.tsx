import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  deleteProfileImage,
  getAddresses,
  getLoyaltyHistory,
  getLoyaltyStatus,
  getOrders,
  getPayments,
  getProfile,
  uploadProfileImage,
  type Address,
  type Order,
  type Payment,
  type Profile,
  type RefillLoyaltyStatus,
  type RefillLoyaltyTransaction,
} from "../services/api";

import Products from "./Products";
import Orders from "./Orders";
import Payments from "./Payments";

import { useAuth } from "../auth/AuthContext";

type DashboardSection =
  | "dashboard"
  | "orders"
  | "payments"
  | "products"
  | "loyalty"
  | "profile"
  | "Nono";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5230/api";

const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

function CustomerDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [activeSection, setActiveSection] =
    useState<DashboardSection>("dashboard");

  const [profile, setProfile] = useState<Profile | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);

  const [payments, setPayments] = useState<Payment[]>([]);

  const [addresses, setAddresses] = useState<Address[]>([]);

  const [loyaltyStatus, setLoyaltyStatus] =
    useState<RefillLoyaltyStatus | null>(null);

  const [loyaltyHistory, setLoyaltyHistory] = useState<
    RefillLoyaltyTransaction[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [currentTime, setCurrentTime] = useState(new Date());

  const [uploadingImage, setUploadingImage] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const firstName = profile?.firstName?.trim() || "there";

  const initials = useMemo(() => {
    if (!profile) {
      return "C";
    }

    const first = profile.firstName?.trim()?.[0] ?? "";
    const last = profile.lastName?.trim()?.[0] ?? "";

    return `${first}${last}`.toUpperCase() || "C";
  }, [profile]);

  const profileImageUrl = profile?.profileImageUrl
    ? `${API_ORIGIN}${profile.profileImageUrl}`
    : null;

  const pendingOrders = orders.filter(
    (order) => order.orderStatus === "PENDING",
  ).length;

  const completedOrders = orders.filter(
    (order) => order.orderStatus === "COMPLETED",
  ).length;

  const pendingPayments = payments.filter(
    (payment) => payment.paymentStatus === "PENDING",
  ).length;

  const totalPaid = payments
    .filter((payment) => payment.paymentStatus === "PAID")
    .reduce((total, payment) => total + payment.amount, 0);

  const loyaltyProgress = loyaltyStatus?.hasLoyaltyCard
    ? Math.min(
        100,
        (loyaltyStatus.tickCount / loyaltyStatus.ticksRequired) * 100,
      )
    : 0;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setMessage("");

        const [
          profileData,
          orderData,
          paymentData,
          addressData,
          loyaltyStatusData,
          loyaltyHistoryData,
        ] = await Promise.all([
          getProfile(),
          getOrders(),
          getPayments(),
          getAddresses(),
          getLoyaltyStatus(),
          getLoyaltyHistory(),
        ]);

        setProfile(profileData);
        setOrders(orderData);
        setPayments(paymentData);
        setAddresses(addressData);

        setLoyaltyStatus(loyaltyStatusData);
        setLoyaltyHistory(loyaltyHistoryData);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  function changeSection(section: DashboardSection) {
    setMessage("");
    setActiveSection(section);
  }

  function handleLogout() {
    setLogoutModalOpen(true);
  }

  function confirmLogout() {
    logout();

    navigate("/", {
      replace: true,
    });
  }
  async function handleProfileImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadingImage(true);
    setMessage("");

    try {
      const result = await uploadProfileImage(file);

      setProfile((current) =>
        current
          ? {
              ...current,
              profileImageUrl: result.profileImageUrl,
            }
          : current,
      );

      setMessage("Profile picture updated successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not upload profile picture.",
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  async function handleDeleteProfileImage() {
    setUploadingImage(true);
    setMessage("");

    try {
      await deleteProfileImage();

      setProfile((current) =>
        current
          ? {
              ...current,
              profileImageUrl: undefined,
            }
          : current,
      );

      setMessage("Profile picture removed successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not remove profile picture.",
      );
    } finally {
      setUploadingImage(false);
    }
  }

  function sectionTitle() {
    switch (activeSection) {
      case "orders":
        return "My Orders";

      case "payments":
        return "Payments";

      case "products":
        return "Products";

      case "loyalty":
        return "Refill Loyalty";

      case "profile":
        return "My Profile";

      case "Nono":
        return "Nono AI Assistant";

      default:
        return "Dashboard";
    }
  }

  function sectionSubtitle() {
    switch (activeSection) {
      case "orders":
        return "View and manage your Swivel Water orders.";

      case "payments":
        return "View your payment history.";

      case "products":
        return "Browse available Swivel Water products.";

      case "loyalty":
        return "Track your refill ticks and free refill rewards.";

      case "profile":
        return "Manage your account and saved addresses.";

      case "Nono":
        return "Your Swivel Water AI assistant.";

      default:
        return "Your personal Swivel Water workspace.";
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <img src="/swivel-water-logo.png" alt="Swivel Water" />

        <p>Preparing your dashboard...</p>

        <style>
          {`
            .dashboard-loading {
              min-height: 100vh;
              display: grid;
              place-items: center;
              align-content: center;
              gap: 18px;
              background:
                linear-gradient(
                  135deg,
                  #03141f,
                  #053f50,
                  #118a8c
                );
              color: white;
            }

            .dashboard-loading img {
              width: min(260px, 70vw);
            }

            .dashboard-loading p {
              margin: 0;
              color: rgba(255,255,255,0.65);
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          html {
            scroll-behavior: smooth;
          }

          body {
            margin: 0;
            background: #f5fafb;
            font-family:
              Inter,
              ui-sans-serif,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
            color: #18343e;
          }

          .customer-layout {
            min-height: 100vh;
            display: flex;
            background: #f5fafb;
          }

          /* =========================
             SIDEBAR
          ========================== */

          .customer-sidebar {
            position: fixed;
            inset: 0 auto 0 0;
            width: 255px;
            z-index: 100;

            display: flex;
            flex-direction: column;

            padding: 22px 16px;

            color: white;

            background:
              linear-gradient(
                180deg,
                #03141f 0%,
                #053f50 58%,
                #075d67 100%
              );
          }

          .sidebar-profile {
            padding: 10px 8px 22px;

            border-bottom:
              1px solid
              rgba(255,255,255,0.1);
          }

          .sidebar-avatar-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .sidebar-avatar {
            width: 68px;
            height: 68px;
            overflow: hidden;
            border-radius: 50%;

            display: grid;
            place-items: center;

            background:
              linear-gradient(
                135deg,
                #29c7c9,
                #8deff0
              );

            color: #03141f;
            font-size: 1.1rem;
            font-weight: 900;

            border:
              3px solid
              rgba(255,255,255,0.18);
          }

          .sidebar-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .sidebar-profile-name {
            margin-top: 10px;
            text-align: center;
          }

          .sidebar-profile-name strong {
            display: block;
            color: white;
            font-size: 0.9rem;
          }

          .sidebar-profile-name span {
            display: block;
            margin-top: 4px;
            color: rgba(255,255,255,0.46);
            font-size: 0.72rem;
          }

          .profile-photo-row {
            margin-top: 13px;
            display: flex;
            justify-content: center;
            gap: 7px;
          }

          .profile-photo-button {
            border:
              1px solid
              rgba(255,255,255,0.13);

            border-radius: 9px;

            padding: 7px 10px;

            color: rgba(255,255,255,0.75);

            background: rgba(255,255,255,0.05);

            cursor: pointer;

            font-size: 0.7rem;
            font-weight: 750;
          }

          .profile-photo-button:hover {
            color: white;
            border-color: #29c7c9;
          }

          .sidebar-nav {
            margin-top: 25px;
            display: grid;
            gap: 6px;
          }

          .sidebar-button {
            width: 100%;
            border: none;
            border-radius: 12px;

            padding: 12px 13px;

            display: flex;
            align-items: center;
            gap: 12px;

            color: rgba(255,255,255,0.63);

            background: transparent;

            cursor: pointer;
            text-align: left;

            font-weight: 650;
          }

          .sidebar-button:hover {
            color: white;
            background:
              rgba(255,255,255,0.06);
          }

          .sidebar-button.active {
            color: #03141f;
            background: #29c7c9;
            font-weight: 800;
          }

          .sidebar-icon {
            width: 24px;
            text-align: center;
          }

          .sidebar-bottom {
            margin-top: auto;
          }

          .sidebar-logout {
            width: 100%;
            border: none;
            border-radius: 12px;

            padding: 12px 13px;

            display: flex;
            align-items: center;
            gap: 12px;

            color: rgba(255,255,255,0.6);

            background:
              rgba(255,255,255,0.04);

            cursor: pointer;
            text-align: left;
            font-weight: 650;
          }

          .sidebar-logout:hover {
            color: #ffd6d6;
            background:
              rgba(255,80,80,0.1);
          }

          /* =========================
             MAIN
          ========================== */

          .customer-main {
            width: calc(100% - 255px);
            margin-left: 255px;
            min-height: 100vh;
          }

          .customer-header {
            min-height: 78px;
            padding: 0 38px;

            position: sticky;
            top: 0;
            z-index: 50;

            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;

            background:
              rgba(255,255,255,0.88);

            border-bottom:
              1px solid
              rgba(5,63,80,0.07);

            backdrop-filter: blur(16px);
          }

          .customer-header-title span {
            color: #8a999f;
            font-size: 0.75rem;
          }

          .customer-header-title strong {
            display: block;
            margin-top: 3px;
            color: #053f50;
            font-size: 1rem;
          }

          .customer-time {
            text-align: right;
          }

          .customer-time strong {
            display: block;
            color: #053f50;
            font-size: 0.92rem;
          }

          .customer-time span {
            display: block;
            margin-top: 3px;
            color: #83949a;
            font-size: 0.75rem;
          }

          .customer-content {
            width: min(
              1150px,
              calc(100% - 70px)
            );

            margin: 0 auto;
            padding: 38px 0 70px;
          }

          /* =========================
             WELCOME
          ========================== */

          .welcome-card {
            padding: 35px;
            border-radius: 27px;

            color: white;

            background:
              radial-gradient(
                circle at 90% 15%,
                rgba(41,199,201,0.17),
                transparent 28%
              ),
              linear-gradient(
                135deg,
                #053f50,
                #075d67
              );

            box-shadow:
              0 24px 60px
              rgba(5,63,80,0.12);
          }

          .welcome-card small {
            color: #8deff0;
            text-transform: uppercase;
            letter-spacing: 0.16em;
            font-size: 0.72rem;
            font-weight: 800;
          }

          .welcome-card h1 {
            margin: 10px 0 0;
            font-size:
              clamp(2rem, 4.5vw, 3.8rem);
            letter-spacing: -0.045em;
          }

          .welcome-card p {
            margin: 13px 0 0;
            color: rgba(255,255,255,0.67);
            line-height: 1.7;
          }

          .order-button {
            margin-top: 22px;
            border: none;
            border-radius: 12px;

            padding: 12px 20px;

            background: #29c7c9;
            color: #03141f !important;

            cursor: pointer;
            font-weight: 800;
          }

          /* =========================
             SUMMARY
          ========================== */

          .summary-grid {
            margin-top: 22px;

            display: grid;
            grid-template-columns:
              repeat(4, 1fr);

            gap: 15px;
          }

          .summary-card {
            padding: 20px;

            border:
              1px solid
              rgba(5,63,80,0.07);

            border-radius: 18px;
            background: white;

            box-shadow:
              0 12px 35px
              rgba(5,63,80,0.045);
          }

          .summary-card span {
            color: #85969c;
            font-size: 0.75rem;
          }

          .summary-card strong {
            display: block;
            margin-top: 8px;
            color: #053f50;
            font-size: 1.35rem;
          }

          .summary-card small {
            display: block;
            margin-top: 4px;
            color: #9ba9ae;
          }

          /* =========================
             SECTION CONTAINER
          ========================== */

          .section-card {
            padding: 30px;

            border-radius: 24px;

            background: white;

            border:
              1px solid
              rgba(5,63,80,0.07);

            box-shadow:
              0 15px 42px
              rgba(5,63,80,0.045);
          }

          .section-card-header {
            margin-bottom: 24px;
            padding-bottom: 20px;

            border-bottom:
              1px solid
              rgba(5,63,80,0.07);
          }

          .section-card-header h1 {
            margin: 0;
            color: #053f50;
            font-size: 1.5rem;
          }

          .section-card-header p {
            margin: 6px 0 0;
            color: #87979d;
            font-size: 0.85rem;
          }

          /* =========================
             IMPORTANT EMBEDDED CONTENT
          ========================== */

          .embedded-content {
            color: #18343e;
          }

          .embedded-content h1,
          .embedded-content h2,
          .embedded-content h3,
          .embedded-content h4 {
            color: #053f50 !important;
          }

          .embedded-content > div > h2:first-child {
            display: none;
          }

          .embedded-content p {
            color: #637980;
          }

          .embedded-content strong {
            color: #053f50;
          }

          .embedded-content hr {
            border: none;
            border-top:
              1px solid
              rgba(5,63,80,0.08);
            margin: 18px 0;
          }

          .embedded-content button {
            border:
              1px solid
              rgba(5,63,80,0.12);

            border-radius: 10px;

            padding: 10px 16px;

            color: #053f50 !important;
            background: #eefbfc !important;

            cursor: pointer;
            font-weight: 800;

            transition:
              background 0.2s ease,
              transform 0.2s ease;
          }

          .embedded-content button:hover {
            background:
              #d8f5f6 !important;

            transform: translateY(-1px);
          }

          .embedded-content input,
          .embedded-content select,
          .embedded-content textarea {
            border:
              1px solid
              rgba(5,63,80,0.12);

            border-radius: 11px;
            padding: 10px 12px;

            color: #18343e;
            background: white;
            outline: none;
          }

          .embedded-content input:focus,
          .embedded-content select:focus,
          .embedded-content textarea:focus {
            border-color: #29c7c9;
            box-shadow:
              0 0 0 3px
              rgba(41,199,201,0.1);
          }

          /* =========================
             LOYALTY
          ========================== */

          .loyalty-card {
            position: relative;
            overflow: hidden;

            padding: 30px;

            border-radius: 24px;

            color: white;

            background:
              radial-gradient(
                circle at 85% 20%,
                rgba(141,239,240,0.22),
                transparent 25%
              ),
              linear-gradient(
                135deg,
                #03141f,
                #053f50 55%,
                #075d67
              );

            box-shadow:
              0 20px 55px
              rgba(5,63,80,0.14);
          }

          .loyalty-card-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
          }

          .loyalty-card-eyebrow {
            color: #8deff0;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.16em;
            font-weight: 850;
          }

          .loyalty-card-title {
            margin: 8px 0 0;

            color: white;

            font-size: clamp(
              1.6rem,
              3vw,
              2.4rem
            );

            letter-spacing: -0.035em;
          }

          .loyalty-card-description {
            margin: 8px 0 0;

            max-width: 700px;

            color:
              rgba(255,255,255,0.64);

            line-height: 1.65;
          }

          .loyalty-badge {
            flex-shrink: 0;

            padding: 9px 12px;

            border-radius: 999px;

            color: #03141f;
            background: #29c7c9;

            font-size: 0.7rem;
            font-weight: 850;
            letter-spacing: 0.05em;
          }

          .loyalty-progress-area {
            margin-top: 28px;
          }

          .loyalty-progress-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
          }

          .loyalty-progress-head span {
            color:
              rgba(255,255,255,0.62);

            font-size: 0.78rem;
          }

          .loyalty-progress-head strong {
            color: white;
            font-size: 0.9rem;
          }

          .loyalty-progress-track {
            height: 12px;

            margin-top: 10px;

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

            transition:
              width 0.4s ease;
          }

          .loyalty-stat-grid {
            margin-top: 22px;

            display: grid;

            grid-template-columns:
              repeat(3, 1fr);

            gap: 12px;
          }

          .loyalty-stat {
            padding: 17px;

            border:
              1px solid
              rgba(255,255,255,0.09);

            border-radius: 16px;

            background:
              rgba(255,255,255,0.045);
          }

          .loyalty-stat span {
            display: block;

            color:
              rgba(255,255,255,0.5);

            font-size: 0.7rem;
          }

          .loyalty-stat strong {
            display: block;

            margin-top: 7px;

            color: white;

            font-size: 1.35rem;
          }

          .loyalty-history {
            margin-top: 22px;

            padding: 25px;

            border:
              1px solid
              rgba(5,63,80,0.07);

            border-radius: 22px;

            background: white;
          }

          .loyalty-history-header h2 {
            margin: 0;

            color: #053f50;

            font-size: 1.15rem;
          }

          .loyalty-history-header p {
            margin: 5px 0 0;

            color: #87979d;

            font-size: 0.8rem;
          }

          .loyalty-history-list {
            margin-top: 18px;

            display: grid;

            gap: 10px;
          }

          .loyalty-history-item {
            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 15px;

            padding: 15px;

            border-radius: 14px;

            background: #f7fbfc;

            border:
              1px solid
              rgba(5,63,80,0.06);
          }

          .loyalty-history-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .loyalty-history-icon {
            width: 38px;
            height: 38px;

            display: grid;
            place-items: center;

            border-radius: 50%;

            background: #e6f8f9;

            font-size: 1rem;
          }

          .loyalty-history-left strong {
            display: block;

            color: #053f50;

            font-size: 0.82rem;
          }

          .loyalty-history-left span {
            display: block;

            margin-top: 3px;

            color: #8a9ba1;

            font-size: 0.7rem;
          }

          .loyalty-history-value {
            text-align: right;
          }

          .loyalty-history-value strong {
            display: block;

            color: #05616a;

            font-size: 0.85rem;
          }

          .loyalty-history-value span {
            display: block;

            margin-top: 3px;

            color: #94a3a8;

            font-size: 0.68rem;
          }

          .loyalty-empty {
            margin-top: 18px;

            padding: 25px;

            border-radius: 16px;

            text-align: center;

            background: #f8fbfc;

            color: #8a9aa0;

            line-height: 1.65;
          }

          /* =========================
             PROFILE
          ========================== */

          .profile-main-card {
            display: grid;
            grid-template-columns: 170px 1fr;
            gap: 30px;
            align-items: start;
          }

          .profile-photo-panel {
            text-align: center;
          }

          .profile-large-avatar {
            width: 140px;
            height: 140px;
            margin: 0 auto;

            overflow: hidden;
            border-radius: 50%;

            display: grid;
            place-items: center;

            background:
              linear-gradient(
                135deg,
                #29c7c9,
                #8deff0
              );

            color: #03141f;
            font-size: 2rem;
            font-weight: 900;

            border:
              5px solid
              #eefbfc;

            box-shadow:
              0 15px 35px
              rgba(5,63,80,0.12);
          }

          .profile-large-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .profile-photo-actions {
            margin-top: 14px;
            display: grid;
            gap: 8px;
          }

          .profile-photo-actions label,
          .profile-photo-actions button {
            border:
              1px solid
              rgba(5,63,80,0.1);

            border-radius: 10px;
            padding: 9px;

            color: #053f50;
            background: #f2fbfc;

            cursor: pointer;
            font-size: 0.75rem;
            font-weight: 800;
          }

          .profile-information {
            display: grid;
            grid-template-columns:
              repeat(2, 1fr);
            gap: 13px;
          }

          .profile-information-card {
            padding: 17px;

            border-radius: 15px;

            background:
              #f7fbfc;

            border:
              1px solid
              rgba(5,63,80,0.07);
          }

          .profile-information-card small {
            color: #899ba1;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }

          .profile-information-card strong {
            display: block;
            margin-top: 7px;

            color: #053f50;
            font-size: 0.9rem;
          }

          .profile-address-area {
            margin-top: 30px;
            padding-top: 25px;

            border-top:
              1px solid
              rgba(5,63,80,0.07);
          }

          .profile-address-area h2 {
            margin: 0;
            color: #053f50;
            font-size: 1.1rem;
          }

          .address-grid {
            margin-top: 15px;

            display: grid;
            grid-template-columns:
              repeat(2, 1fr);

            gap: 13px;
          }

          .address-card {
            padding: 17px;

            border-radius: 15px;

            background:
              linear-gradient(
                135deg,
                #f1fbfc,
                #ffffff
              );

            border:
              1px solid
              rgba(5,63,80,0.07);
          }

          .address-card strong {
            color: #053f50;
            font-size: 0.88rem;
          }

          .address-card p {
            margin: 7px 0 0;
            color: #71858c;
            font-size: 0.8rem;
            line-height: 1.65;
          }

          .empty-state {
            padding: 28px;
            text-align: center;

            color: #8a9aa0;

            border-radius: 15px;
            background:
              #f8fbfc;
          }
          .logout-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background: rgba(3, 20, 31, 0.55);
  backdrop-filter: blur(5px);
}

.logout-modal {
  width: min(100%, 430px);

  padding: 30px;

  border-radius: 22px;

  background: #ffffff;

  border: 1px solid rgba(5, 63, 80, 0.08);

  box-shadow:
    0 24px 60px
    rgba(3, 20, 31, 0.22);

  text-align: center;
}

.logout-modal-icon {
  width: 58px;
  height: 58px;

  margin: 0 auto 16px;

  display: grid;
  place-items: center;

  border-radius: 16px;

  background: #fff1f1;

  font-size: 1.5rem;
}

.logout-modal h2 {
  margin: 0;

  color: #053f50;

  font-size: 1.2rem;
}

.logout-modal p {
  margin: 10px auto 0;

  max-width: 340px;

  color: #71858c;

  font-size: 0.8rem;

  line-height: 1.6;
}

.logout-modal-actions {
  display: flex;
  justify-content: center;

  gap: 10px;

  margin-top: 24px;
}

.logout-cancel,
.logout-confirm {
  border: none;

  padding: 11px 18px;

  border-radius: 11px;

  font-weight: 750;

  cursor: pointer;
}

.logout-cancel {
  background: #eef5f6;
  color: #49646d;
}

.logout-confirm {
  background: #053f50;
  color: white;
}

.logout-cancel:hover {
  background: #e3edef;
}

.logout-confirm:hover {
  background: #075d67;
}

@media (max-width: 500px) {
  .logout-modal {
    padding: 24px 20px;
  }

  .logout-modal-actions {
    flex-direction: column;
  }

  .logout-cancel,
  .logout-confirm {
    width: 100%;
  }
}
          /* =========================
             NONO
          ========================== */

          .Nono-card {
            padding: 35px;

            border-radius: 24px;

            color: white;

            background:
              linear-gradient(
                135deg,
                #03141f,
                #053f50,
                #075d67
              );

            box-shadow:
              0 20px 55px
              rgba(5,63,80,0.1);
          }

          .Nono-card h1 {
            margin: 0;
          }

          .Nono-card p {
            max-width: 650px;
            margin: 12px 0 0;
            color:
              rgba(255,255,255,0.65);
            line-height: 1.7;
          }

          .Nono-card button {
            margin-top: 20px;

            border: none;
            border-radius: 999px;

            padding: 12px 21px;

            background: #29c7c9;
            color: #03141f !important;

            cursor: pointer;
            font-weight: 800;
          }

          @media (max-width: 1050px) {
            .summary-grid {
              grid-template-columns:
                repeat(2, 1fr);
            }

            .profile-main-card {
              grid-template-columns: 1fr;
            }

            .profile-photo-panel {
              text-align: left;
            }

            .profile-large-avatar {
              margin: 0;
            }
          }

          @media (max-width: 760px) {
            .customer-sidebar {
              position: static;
              width: 100%;
            }

            .customer-layout {
              display: block;
            }

            .customer-main {
              width: 100%;
              margin-left: 0;
            }

            .sidebar-nav {
              grid-template-columns:
                repeat(3, 1fr);
            }

            .sidebar-button {
              justify-content: center;
            }

            .sidebar-icon {
              display: none;
            }

            .customer-content {
              width:
                min(100% - 28px, 1150px);
            }

            .customer-header {
              padding: 14px 18px;
              align-items: flex-start;
              flex-direction: column;
            }

            .customer-time {
              text-align: left;
            }

            .profile-information,
            .address-grid {
              grid-template-columns: 1fr;
            }

            .loyalty-stat-grid {
              grid-template-columns: 1fr;
            }

            .loyalty-card-top {
              flex-direction: column;
            }

            .loyalty-history-item {
              align-items: flex-start;
            }

            .section-card {
              padding: 22px;
            }
          }

          @media (max-width: 500px) {
            .summary-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="customer-layout">
        {/* SIDEBAR */}

        <aside className="customer-sidebar">
          <div>
            <div className="sidebar-profile">
              <div className="sidebar-avatar-wrapper">
                <div className="sidebar-avatar">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Customer profile" />
                  ) : (
                    initials
                  )}
                </div>

                <div className="sidebar-profile-name">
                  <strong>
                    {profile
                      ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`
                      : "Customer"}
                  </strong>

                  <span>Customer Account</span>
                </div>

                <div className="profile-photo-row">
                  <label className="profile-photo-button">
                    {uploadingImage ? "Uploading..." : "Edit Profile Photo"}

                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      hidden
                      disabled={uploadingImage}
                      onChange={handleProfileImageChange}
                    />
                  </label>
                </div>
              </div>
            </div>

            <nav className="sidebar-nav">
              <SidebarButton
                icon="🏠"
                label="Dashboard"
                active={activeSection === "dashboard"}
                onClick={() => changeSection("dashboard")}
              />

              <SidebarButton
                icon="📦"
                label="My Orders"
                active={activeSection === "orders"}
                onClick={() => changeSection("orders")}
              />

              <SidebarButton
                icon="💳"
                label="Payments"
                active={activeSection === "payments"}
                onClick={() => changeSection("payments")}
              />

              <SidebarButton
                icon="💧"
                label="Products"
                active={activeSection === "products"}
                onClick={() => changeSection("products")}
              />

              <SidebarButton
                icon="🎟️"
                label="Loyalty"
                active={activeSection === "loyalty"}
                onClick={() => changeSection("loyalty")}
              />

              <SidebarButton
                icon="👤"
                label="Profile"
                active={activeSection === "profile"}
                onClick={() => changeSection("profile")}
              />

              <SidebarButton
                icon="✦"
                label="Nono"
                active={activeSection === "Nono"}
                onClick={() => changeSection("Nono")}
              />
            </nav>
          </div>

          <div className="sidebar-bottom">
            <button
              type="button"
              className="sidebar-logout"
              onClick={handleLogout}
            >
              <span className="sidebar-icon">🚪</span>
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN */}

        <main className="customer-main">
          <header className="customer-header">
            <div className="customer-header-title">
              <span>Swivel Water</span>

              <strong>{sectionTitle()}</strong>
            </div>

            <div className="customer-time">
              <strong>
                {currentTime.toLocaleTimeString("en-ZA", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </strong>

              <span>
                {currentTime.toLocaleDateString("en-ZA", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </header>

          <div className="customer-content">
            {message && (
              <div
                style={{
                  marginBottom: "18px",
                  padding: "13px 15px",
                  borderRadius: "12px",
                  background: "rgba(41,199,201,0.08)",
                  color: "#05616a",
                  border: "1px solid rgba(41,199,201,0.12)",
                  fontSize: "0.85rem",
                }}
              >
                {message}
              </div>
            )}

            {/* DASHBOARD */}

            {activeSection === "dashboard" && (
              <>
                <section className="welcome-card">
                  <small>Welcome Back</small>

                  <h1>Hello, {firstName} 👋</h1>

                  <p>
                    Your Swivel Water account, orders, payments, products, and
                    refill rewards are all in one place.
                  </p>

                  <button
                    type="button"
                    className="order-button"
                    onClick={() => navigate("/customer/orders/new")}
                  >
                    + Order Water
                  </button>
                </section>

                <section className="summary-grid">
                  <SummaryCard
                    label="Total Orders"
                    value={orders.length}
                    note={`${completedOrders} completed`}
                  />

                  <SummaryCard
                    label="Active Orders"
                    value={pendingOrders}
                    note="Currently pending"
                  />

                  <SummaryCard
                    label="Pending Payments"
                    value={pendingPayments}
                    note="Awaiting confirmation"
                  />

                  <SummaryCard
                    label="Paid"
                    value={`R ${totalPaid.toFixed(2)}`}
                    note="Confirmed payments"
                  />
                </section>
              </>
            )}

            {/* ORDERS */}

            {activeSection === "orders" && (
              <section className="section-card">
                <div className="section-card-header">
                  <h1>My Orders</h1>

                  <p>View and manage your Swivel Water orders.</p>
                </div>

                <div className="embedded-content">
                  <Orders />
                </div>
              </section>
            )}

            {/* PAYMENTS */}

            {activeSection === "payments" && (
              <section className="section-card">
                <div className="section-card-header">
                  <h1>Payments</h1>

                  <p>View your payment history.</p>
                </div>

                <div className="embedded-content">
                  <Payments />
                </div>
              </section>
            )}

            {/* PRODUCTS */}

            {activeSection === "products" && (
              <section className="section-card">
                <div className="section-card-header">
                  <h1>Products</h1>

                  <p>Browse available Swivel Water products.</p>
                </div>

                <div className="embedded-content">
                  <Products />
                </div>
              </section>
            )}

            {/* LOYALTY */}

            {activeSection === "loyalty" && (
              <section>
                <div className="section-card">
                  <div className="section-card-header">
                    <h1>Refill Loyalty</h1>

                    <p>
                      Track your qualifying 5L refills and earned free refill
                      rewards.
                    </p>
                  </div>

                  {!loyaltyStatus?.hasLoyaltyCard ? (
                    <div className="loyalty-card">
                      <div className="loyalty-card-top">
                        <div>
                          <div className="loyalty-card-eyebrow">
                            Swivel Water Rewards
                          </div>

                          <h2 className="loyalty-card-title">
                            5L Refill Loyalty Card
                          </h2>

                          <p className="loyalty-card-description">
                            Get the R50 digital loyalty card and earn one tick
                            for every qualifying 5 litres of paid refill. After
                            10 ticks, you earn a free 5L refill.
                          </p>
                        </div>

                        <div className="loyalty-badge">R50 CARD</div>
                      </div>

                      <div
                        className="loyalty-empty"
                        style={{
                          marginTop: "24px",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.09)",
                          color: "rgba(255,255,255,0.65)",
                        }}
                      >
                        You don't have an active loyalty card yet. Normal
                        refills still work without a card at R1 per litre.
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="loyalty-card">
                        <div className="loyalty-card-top">
                          <div>
                            <div className="loyalty-card-eyebrow">
                              Active Membership
                            </div>

                            <h2 className="loyalty-card-title">
                              5L Refill Loyalty Card
                            </h2>

                            <p className="loyalty-card-description">
                              Keep refilling and watch your ticks build toward
                              your next free 5L refill.
                            </p>
                          </div>

                          <div className="loyalty-badge">ACTIVE</div>
                        </div>

                        <div className="loyalty-progress-area">
                          <div className="loyalty-progress-head">
                            <span>Progress to next reward</span>

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

                        <div className="loyalty-stat-grid">
                          <div className="loyalty-stat">
                            <span>Current Ticks</span>

                            <strong>{loyaltyStatus.tickCount}</strong>
                          </div>

                          <div className="loyalty-stat">
                            <span>Ticks Remaining</span>

                            <strong>{loyaltyStatus.remainingTicks}</strong>
                          </div>

                          <div className="loyalty-stat">
                            <span>Free 5L Refills</span>

                            <strong>
                              {loyaltyStatus.freeRefillsAvailable}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="loyalty-history">
                        <div className="loyalty-history-header">
                          <h2>Loyalty History</h2>

                          <p>Your qualifying refills and reward redemptions.</p>
                        </div>

                        {loyaltyHistory.length === 0 ? (
                          <div className="loyalty-empty">
                            No loyalty activity yet. Your first qualifying paid
                            refill will appear here.
                          </div>
                        ) : (
                          <div className="loyalty-history-list">
                            {loyaltyHistory.map((transaction) => {
                              const earned =
                                transaction.transactionType === "TICK_EARNED";

                              const transactionDate = new Date(
                                transaction.createdAt,
                              ).toLocaleDateString("en-ZA", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              });

                              return (
                                <div
                                  className="loyalty-history-item"
                                  key={transaction.refillLoyaltyTransactionId}
                                >
                                  <div className="loyalty-history-left">
                                    <div className="loyalty-history-icon">
                                      {earned ? "💧" : "🎁"}
                                    </div>

                                    <div>
                                      <strong>
                                        {earned
                                          ? "Qualifying refill"
                                          : "Free 5L refill redeemed"}
                                      </strong>

                                      <span>
                                        {transaction.litres}L •{" "}
                                        {transactionDate}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="loyalty-history-value">
                                    <strong>
                                      {earned
                                        ? `+${transaction.ticksAdded} tick${
                                            transaction.ticksAdded === 1
                                              ? ""
                                              : "s"
                                          }`
                                        : `-${transaction.freeRefillsUsed} free refill`}
                                    </strong>

                                    <span>
                                      {earned &&
                                        transaction.freeRefillsAdded > 0 &&
                                        `+${transaction.freeRefillsAdded} free reward`}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            {/* PROFILE */}

            {activeSection === "profile" && (
              <section className="section-card">
                <div className="section-card-header">
                  <h1>My Profile</h1>

                  <p>Manage your personal information and saved addresses.</p>
                </div>

                <div className="profile-main-card">
                  <div className="profile-photo-panel">
                    <div className="profile-large-avatar">
                      {profileImageUrl ? (
                        <img src={profileImageUrl} alt="Customer profile" />
                      ) : (
                        initials
                      )}
                    </div>

                    <div className="profile-photo-actions">
                      <label>
                        {uploadingImage ? "Uploading..." : "Edit Profile Photo"}

                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp"
                          hidden
                          disabled={uploadingImage}
                          onChange={handleProfileImageChange}
                        />
                      </label>

                      {profile?.profileImageUrl && (
                        <button
                          type="button"
                          disabled={uploadingImage}
                          onClick={handleDeleteProfileImage}
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="profile-information">
                    <div className="profile-information-card">
                      <small>First Name</small>

                      <strong>{profile?.firstName || "Not provided"}</strong>
                    </div>

                    <div className="profile-information-card">
                      <small>Last Name</small>

                      <strong>{profile?.lastName || "Not provided"}</strong>
                    </div>

                    <div className="profile-information-card">
                      <small>Email</small>

                      <strong>{profile?.email || "Not provided"}</strong>
                    </div>

                    <div className="profile-information-card">
                      <small>Phone</small>

                      <strong>{profile?.phone || "Not provided"}</strong>
                    </div>

                    <div className="profile-information-card">
                      <small>Account</small>

                      <strong>{profile?.role || "CUSTOMER"}</strong>
                    </div>

                    <div className="profile-information-card">
                      <small>Email Status</small>

                      <strong>
                        {profile?.isEmailVerified ? "Verified" : "Not Verified"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="profile-address-area">
                  <h2>My Addresses</h2>

                  {addresses.length === 0 ? (
                    <div
                      className="empty-state"
                      style={{
                        marginTop: "15px",
                      }}
                    >
                      No saved addresses.
                    </div>
                  ) : (
                    <div className="address-grid">
                      {addresses.map((address) => (
                        <div className="address-card" key={address.addressId}>
                          <strong>{address.addressLine1}</strong>

                          <p>
                            {address.addressLine2 && (
                              <>
                                {address.addressLine2}
                                <br />
                              </>
                            )}

                            {address.city}
                            <br />

                            {address.province}
                            <br />

                            {address.postalCode}
                            <br />

                            {address.country}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* NONO */}

            {activeSection === "Nono" && (
              <section className="Nono-card">
                <h1>Nono ✦</h1>

                <p>
                  Your Swivel Water AI assistant. Nono will help with products,
                  orders, payments, delivery, and collection questions.
                </p>

                <button
                  type="button"
                  onClick={() => alert("Nono will be connected here next.")}
                >
                  Start Conversation
                </button>
              </section>
            )}
          </div>
        </main>

        {logoutModalOpen && (
          <div
            className="logout-modal-overlay"
            onClick={() => setLogoutModalOpen(false)}
          >
            <div
              className="logout-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="logout-modal-icon">🚪</div>

              <h2>Log out of Swivel Water?</h2>

              <p>
                Are you sure you want to log out? You will need to sign in again
                to access your dashboard.
              </p>

              <div className="logout-modal-actions">
                <button
                  type="button"
                  className="logout-cancel"
                  onClick={() => setLogoutModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="logout-confirm"
                  onClick={confirmLogout}
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function SidebarButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`sidebar-button ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span className="sidebar-icon">{icon}</span>

      {label}
    </button>
  );
}

function SummaryCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <div className="summary-card">
      <span>{label}</span>

      <strong>{value}</strong>

      <small>{note}</small>
    </div>
  );
}

export default CustomerDashboard;
