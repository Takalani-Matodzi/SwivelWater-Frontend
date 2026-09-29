import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  deleteProfileImage,
  getDriverDashboard,
  getProfile,
  updateDriverDeliveryStatus,
  updateEmployeeProfile,
  uploadProfileImage,
  type DriverDashboardData,
  type DriverDashboardDelivery,
  type Profile,
} from "../services/api";
import { useAuth } from "../auth/AuthContext";

type DriverSection = "dashboard" | "deliveries" | "completed" | "profile";

function DriverDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [activeSection, setActiveSection] =
    useState<DriverSection>("dashboard");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [dashboardData, setDashboardData] =
    useState<DriverDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [currentTime, setCurrentTime] = useState(new Date());

  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [editFirstName, setEditFirstName] = useState("");

  const [editLastName, setEditLastName] = useState("");

  const [editPhone, setEditPhone] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const firstName = profile?.firstName?.trim() || "there";
  const [updatingDeliveryId, setUpdatingDeliveryId] = useState<string | null>(
    null,
  );
  const fullName = profile
    ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || "Driver"
    : "Driver";

  const initials = useMemo(() => {
    if (!profile) {
      return "DR";
    }

    const first = profile.firstName?.trim()?.[0] ?? "";

    const last = profile.lastName?.trim()?.[0] ?? "";

    return `${first}${last}`.toUpperCase() || "DR";
  }, [profile]);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5230/api";

  const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

  const profileImageUrl = profile?.profileImageUrl
    ? `${API_ORIGIN}${profile.profileImageUrl}`
    : null;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    async function loadDriverDashboard() {
      try {
        setLoading(true);
        setMessage("");

        const [profileData, dashboardData] = await Promise.all([
          getProfile(),
          getDriverDashboard(),
        ]);

        setProfile(profileData);
        setDashboardData(dashboardData);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load driver dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDriverDashboard();
  }, []);

  function changeSection(section: DriverSection) {
    setMessage("");
    setActiveSection(section);
  }

  function handleLogout() {
    setLogoutModalOpen(true);
  }

  function confirmLogout() {
    setLogoutModalOpen(false);

    logout();

    navigate("/login", {
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
  function handleEditProfile() {
    setEditFirstName(profile?.firstName ?? "");
    setEditLastName(profile?.lastName ?? "");
    setEditPhone(profile?.phone ?? "");

    setIsEditingProfile(true);
    setMessage("");
  }

  function handleCancelEditProfile() {
    setIsEditingProfile(false);
    setMessage("");
  }

  async function handleSaveProfile() {
    if (!editFirstName.trim()) {
      setMessage("First name is required.");
      return;
    }

    if (!editLastName.trim()) {
      setMessage("Last name is required.");
      return;
    }

    if (!editPhone.trim()) {
      setMessage("Phone number is required.");
      return;
    }

    setSavingProfile(true);
    setMessage("");

    try {
      const result = await updateEmployeeProfile({
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        phone: editPhone.trim(),
      });

      setProfile((current) =>
        current
          ? {
              ...current,
              firstName: result.firstName,
              lastName: result.lastName,
              phone: result.phone,
            }
          : current,
      );

      setIsEditingProfile(false);

      setMessage(result.message);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not update driver profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  }
  function sectionTitle() {
    switch (activeSection) {
      case "deliveries":
        return "My Deliveries";

      case "completed":
        return "Completed Deliveries";

      case "profile":
        return "My Profile";

      default:
        return "Dashboard";
    }
  }
  async function handleDeliveryStatusUpdate(
    deliveryId: string,
    deliveryStatus: "OUT_FOR_DELIVERY" | "DELIVERED",
  ) {
    setUpdatingDeliveryId(deliveryId);
    setMessage("");

    try {
      await updateDriverDeliveryStatus(deliveryId, deliveryStatus);

      const refreshedDashboard = await getDriverDashboard();

      setDashboardData(refreshedDashboard);

      setMessage(
        deliveryStatus === "OUT_FOR_DELIVERY"
          ? "Delivery marked as out for delivery."
          : "Delivery marked as delivered successfully.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not update delivery status.",
      );
    } finally {
      setUpdatingDeliveryId(null);
    }
  }

  function sectionSubtitle() {
    switch (activeSection) {
      case "deliveries":
        return "View and manage your assigned deliveries.";

      case "completed":
        return "Review deliveries you have completed.";

      case "profile":
        return "Manage your driver account information.";

      default:
        return "Your Swivel Water driver workspace.";
    }
  }

  if (loading) {
    return (
      <div className="driver-loading">
        <img src="/swivel-water-logo.png" alt="Swivel Water" />

        <p>Preparing your driver dashboard...</p>

        <style>{`
          .driver-loading {
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

          .driver-loading img {
            width: min(260px, 70vw);
          }

          .driver-loading p {
            margin: 0;
            color:
              rgba(255,255,255,0.65);
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
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

        .driver-layout {
          min-height: 100vh;
          display: flex;
          background: #f5fafb;
        }

        /* =========================
           SIDEBAR
        ========================== */

        .driver-sidebar {
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

        .driver-sidebar-profile {
          padding: 10px 8px 22px;

          border-bottom:
            1px solid
            rgba(255,255,255,0.1);
        }

        .driver-avatar-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .driver-avatar {
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

        .driver-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .driver-profile-name {
          margin-top: 10px;
          text-align: center;
        }

        .driver-profile-name strong {
          display: block;

          color: white;

          font-size: 0.9rem;
        }

        .driver-profile-name span {
          display: block;

          margin-top: 4px;

          color:
            rgba(255,255,255,0.46);

          font-size: 0.72rem;
        }

        .driver-role-badge {
          margin-top: 11px;

          padding: 6px 10px;

          border-radius: 999px;

          color: #8deff0;

          background:
            rgba(41,199,201,0.09);

          border:
            1px solid
            rgba(41,199,201,0.12);

          font-size: 0.65rem;
          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: 0.08em;
        }

        .driver-sidebar-nav {
          margin-top: 25px;

          display: grid;
          gap: 6px;
        }

        .driver-sidebar-button {
          width: 100%;

          border: none;

          border-radius: 12px;

          padding: 12px 13px;

          display: flex;
          align-items: center;

          gap: 12px;

          color:
            rgba(255,255,255,0.63);

          background: transparent;

          cursor: pointer;

          text-align: left;

          font-size: 0.86rem;

          font-weight: 650;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .driver-sidebar-button:hover {
          color: white;

          background:
            rgba(255,255,255,0.06);

          transform: translateX(2px);
        }

        .driver-sidebar-button.active {
          color: #03141f;

          background: #29c7c9;

          font-weight: 800;

          box-shadow:
            0 10px 25px
            rgba(41,199,201,0.14);
        }

        .driver-sidebar-icon {
          width: 24px;
          text-align: center;
        }

        .driver-sidebar-bottom {
          margin-top: auto;
          padding-top: 20px;
        }

        .driver-logout {
          width: 100%;

          border: none;

          border-radius: 12px;

          padding: 12px 13px;

          display: flex;
          align-items: center;

          gap: 12px;

          color:
            rgba(255,255,255,0.72);

          background:
            rgba(255,255,255,0.05);

          cursor: pointer;

          text-align: left;

          font-size: 0.86rem;

          font-weight: 700;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .driver-logout:hover {
          color: #ffdada;

          background:
            rgba(255,80,80,0.11);
        }

        /* =========================
           MAIN
        ========================== */

        .driver-main {
          width:
            calc(100% - 255px);

          margin-left: 255px;

          min-height: 100vh;
        }

        .driver-header {
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

          backdrop-filter:
            blur(16px);
        }

        .driver-header-title span {
          color: #8a999f;
          font-size: 0.75rem;
        }

        .driver-header-title strong {
          display: block;

          margin-top: 3px;

          color: #053f50;

          font-size: 1rem;
        }

        .driver-time {
          text-align: right;
        }

        .driver-time strong {
          display: block;

          color: #053f50;

          font-size: 0.92rem;
        }

        .driver-time span {
          display: block;

          margin-top: 3px;

          color: #83949a;

          font-size: 0.75rem;
        }

        .driver-content {
          width:
            min(
              1150px,
              calc(100% - 70px)
            );

          margin: 0 auto;

          padding:
            38px 0 70px;
        }

        /* =========================
           WELCOME
        ========================== */

        .driver-welcome {
          position: relative;

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

        .driver-welcome small {
          color: #8deff0;

          text-transform: uppercase;

          letter-spacing: 0.16em;

          font-size: 0.72rem;

          font-weight: 800;
        }

        .driver-welcome h1 {
          margin: 10px 0 0;

          font-size:
            clamp(2rem, 4.5vw, 3.5rem);

          letter-spacing: -0.045em;
        }

        .driver-welcome p {
          margin: 13px 0 0;

          max-width: 760px;

          color:
            rgba(255,255,255,0.67);

          line-height: 1.7;
        }

        .driver-online {
          position: absolute;

          top: 32px;
          right: 32px;

          display: flex;
          align-items: center;

          gap: 7px;

          padding: 8px 12px;

          border-radius: 999px;

          color: #8deff0;

          background:
            rgba(255,255,255,0.07);

          border:
            1px solid
            rgba(255,255,255,0.1);

          font-size: 0.68rem;

          font-weight: 800;
        }

        .driver-online-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #45e89e;
        }

        /* =========================
           SUMMARY
        ========================== */

        .driver-summary-grid {
          margin-top: 22px;

          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 15px;
        }

        .driver-summary-card {
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

        .driver-summary-card span {
          color: #85969c;

          font-size: 0.75rem;
        }

        .driver-summary-card strong {
          display: block;

          margin-top: 8px;

          color: #053f50;

          font-size: 1.35rem;
        }

        .driver-summary-card small {
          display: block;

          margin-top: 4px;

          color: #9ba9ae;
        }

        .driver-summary-accent {
          color: #118a8c !important;
        }

        /* =========================
           SECTION
        ========================== */

        .driver-section-card {
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

        .driver-section-header {
          margin-bottom: 24px;

          padding-bottom: 20px;

          border-bottom:
            1px solid
            rgba(5,63,80,0.07);
        }

        .driver-section-header h1 {
          margin: 0;

          color: #053f50;

          font-size: 1.5rem;
        }

        .driver-section-header p {
          margin: 6px 0 0;

          color: #87979d;

          font-size: 0.85rem;
        }

        /* =========================
           DELIVERY CARDS
        ========================== */

        .driver-delivery-grid {
          display: grid;

          gap: 13px;
        }

        .driver-delivery-card {
          padding: 18px;

          border-radius: 16px;

          background:
            linear-gradient(
              135deg,
              #f3fbfc,
              #ffffff
            );

          border:
            1px solid
            rgba(5,63,80,0.07);
        }

        .driver-delivery-top {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;
        }

        .driver-order-id {
          color: #118a8c;

          font-size: 0.8rem;

          font-weight: 850;
        }

        .driver-status {
          display: inline-flex;

          padding: 6px 9px;

          border-radius: 999px;

          color: #117678;

          background:
            rgba(17,138,140,0.1);

          font-size: 0.68rem;

          font-weight: 800;
        }

        .driver-delivery-card h3 {
          margin: 10px 0 0;

          color: #053f50;

          font-size: 1rem;
        }

        .driver-address {
          margin-top: 5px;

          color: #7a8c93;

          font-size: 0.78rem;
        }

        .driver-delivery-meta {
          margin-top: 14px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;

          color: #6f838a;

          font-size: 0.74rem;
        }

        .driver-delivery-meta strong {
          color: #053f50;
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
           DASHBOARD LOWER GRID
        ========================== */

        .driver-dashboard-grid {
          margin-top: 22px;

          display: grid;

          grid-template-columns:
            minmax(0, 1.55fr)
            minmax(300px, 0.85fr);

          gap: 18px;
        }

        .driver-card {
          overflow: hidden;

          border:
            1px solid
            rgba(5,63,80,0.07);

          border-radius: 22px;

          background: white;

          box-shadow:
            0 15px 42px
            rgba(5,63,80,0.045);
        }

        .driver-card-header {
          padding:
            19px 20px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          border-bottom:
            1px solid
            rgba(5,63,80,0.07);
        }

        .driver-card-header h2 {
          margin: 0;

          color: #053f50;

          font-size: 0.98rem;
        }

        .driver-card-header button {
          border: none;

          color: #118a8c;

          background: transparent;

          cursor: pointer;

          font-size: 0.75rem;

          font-weight: 800;
        }

        .driver-quick-list {
          padding:
            10px 20px 18px;
        }

        .driver-quick-item {
          padding: 15px 0;

          border-bottom:
            1px solid
            rgba(5,63,80,0.06);
        }

        .driver-quick-item:last-child {
          border-bottom: none;
        }

        .driver-quick-item strong {
          display: block;

          color: #053f50;

          font-size: 0.82rem;
        }

        .driver-quick-item span {
          display: block;

          margin-top: 5px;

          color: #88999f;

          font-size: 0.72rem;

          line-height: 1.5;
        }
.driver-delivery-actions {
  margin-top: 18px;

  display: grid;

  grid-template-columns: 1fr;

  gap: 10px;
}

.driver-action-button {
  width: 100%;

  min-height: 48px;

  border: none;

  border-radius: 13px;

  padding: 12px 16px;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 10px;

  color: #03141f;

  background:
    linear-gradient(
      135deg,
      #29c7c9,
      #8deff0
    );

  cursor: pointer;

  font-size: 0.8rem;

  font-weight: 900;

  letter-spacing: 0.01em;

  box-shadow:
    0 10px 24px
    rgba(41,199,201,0.16);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease,
    opacity 0.2s ease;
}

.driver-action-button:hover:not(:disabled) {
  transform: translateY(-2px);

  filter: brightness(1.02);

  box-shadow:
    0 14px 30px
    rgba(41,199,201,0.23);
}

.driver-action-button:active:not(:disabled) {
  transform: translateY(0);
}

.driver-action-button:disabled {
  opacity: 0.55;

  cursor: not-allowed;

  box-shadow: none;
}

.driver-action-complete {
  color: white;

  background:
    linear-gradient(
      135deg,
      #053f50,
      #075d67
    );

  box-shadow:
    0 10px 24px
    rgba(5,63,80,0.16);
}

.driver-action-complete:hover:not(:disabled) {
  box-shadow:
    0 14px 30px
    rgba(5,63,80,0.22);
}
        /* =========================
           PROFILE
        ========================== */

        .driver-profile-grid {
          display: grid;

          grid-template-columns:
            170px 1fr;

          gap: 30px;
        }

        .driver-profile-photo-panel {
          text-align: center;
        }

        .driver-profile-large-avatar {
          width: 140px;
          height: 140px;

          margin: 0 auto;

          overflow: hidden;

          display: grid;
          place-items: center;

          border-radius: 50%;

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

        .driver-profile-large-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .driver-profile-actions {
          margin-top: 14px;

          display: grid;

          gap: 8px;
        }

        .driver-profile-actions label,
        .driver-profile-actions button {
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

        .driver-information {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap: 13px;
        }

        .driver-information-card {
          padding: 17px;

          border-radius: 15px;

          background: #f7fbfc;

          border:
            1px solid
            rgba(5,63,80,0.07);
        }

        .driver-information-card small {
          color: #899ba1;

          font-size: 0.7rem;

          text-transform: uppercase;

          letter-spacing: 0.08em;
        }

        .driver-information-card strong {
          display: block;

          margin-top: 7px;

          color: #053f50;

          font-size: 0.9rem;
        }

        .driver-empty {
          padding: 30px;

          text-align: center;

          color: #8a9aa0;

          border-radius: 15px;

          background: #f8fbfc;
        }

        @media (max-width: 1050px) {
          .driver-summary-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .driver-dashboard-grid {
            grid-template-columns: 1fr;
          }

          .driver-profile-grid {
            grid-template-columns: 1fr;
          }

          .driver-profile-photo-panel {
            text-align: left;
          }

          .driver-profile-large-avatar {
            margin: 0;
          }
        }

        @media (max-width: 760px) {
          .driver-sidebar {
            position: static;

            width: 100%;

            min-height: auto;
          }

          .driver-layout {
            display: block;
          }

          .driver-main {
            width: 100%;

            margin-left: 0;
          }
        
          .driver-sidebar-nav {
            grid-template-columns:
              repeat(3, 1fr);
          }

          .driver-sidebar-button {
            justify-content: center;
          }

          .driver-sidebar-icon {
            display: none;
          }

          .driver-content {
            width:
              min(100% - 28px, 1150px);
          }

          .driver-header {
            padding:
              14px 18px;

            align-items: flex-start;

            flex-direction: column;
          }

          .driver-time {
            text-align: left;
          }

          .driver-online {
            position: static;

            width: fit-content;

            margin-top: 18px;
          }

          .driver-information {
            grid-template-columns: 1fr;
          }

          .driver-section-card {
            padding: 22px;
          }
        }

        @media (max-width: 500px) {
          .driver-summary-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="driver-layout">
        <aside className="driver-sidebar">
          <div>
            <div className="driver-sidebar-profile">
              <div className="driver-avatar-wrapper">
                <div className="driver-avatar">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Driver profile" />
                  ) : (
                    initials
                  )}
                </div>

                <div className="driver-profile-name">
                  <strong>{fullName}</strong>

                  <span>Driver Account</span>
                </div>

                <div className="driver-role-badge">
                  {profile?.employeeRole || "Driver"}
                </div>
              </div>
            </div>

            <nav className="driver-sidebar-nav">
              <SidebarButton
                icon="🏠"
                label="Dashboard"
                active={activeSection === "dashboard"}
                onClick={() => changeSection("dashboard")}
              />

              <SidebarButton
                icon="🚚"
                label="My Deliveries"
                active={activeSection === "deliveries"}
                onClick={() => changeSection("deliveries")}
              />

              <SidebarButton
                icon="✓"
                label="Completed"
                active={activeSection === "completed"}
                onClick={() => changeSection("completed")}
              />

              <SidebarButton
                icon="👤"
                label="My Profile"
                active={activeSection === "profile"}
                onClick={() => changeSection("profile")}
              />
            </nav>
          </div>

          <div className="driver-sidebar-bottom">
            <button
              type="button"
              className="driver-logout"
              onClick={handleLogout}
            >
              <span className="driver-sidebar-icon">🚪</span>
              Logout
            </button>
          </div>
        </aside>

        <main className="driver-main">
          <header className="driver-header">
            <div className="driver-header-title">
              <span>Swivel Water</span>

              <strong>{sectionTitle()}</strong>
            </div>

            <div className="driver-time">
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

          <div className="driver-content">
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

            {activeSection === "dashboard" && (
              <>
                <section className="driver-welcome">
                  <small>Driver Overview</small>

                  <h1>Hello, {firstName} 👋🏽</h1>

                  <p>
                    Manage your assigned deliveries, keep customers updated and
                    stay on top of today's delivery route.
                  </p>

                  <div className="driver-online">
                    <span className="driver-online-dot" />
                    Online & Ready
                  </div>
                </section>

                <section className="driver-summary-grid">
                  <SummaryCard
                    label="Today's Deliveries"
                    value={dashboardData?.summary.todayDeliveries ?? 0}
                    note={`${dashboardData?.summary.remainingToday ?? 0} remaining`}
                  />

                  <SummaryCard
                    label="Completed"
                    value={dashboardData?.summary.completedToday ?? 0}
                    note="Completed today"
                  />

                  <SummaryCard
                    label="Water Delivered"
                    value={`${
                      dashboardData?.deliveries
                        .filter(
                          (delivery) => delivery.deliveryStatus === "DELIVERED",
                        )
                        .reduce(
                          (total, delivery) =>
                            total +
                            delivery.order.items.reduce(
                              (itemTotal, item) => itemTotal + item.quantity,
                              0,
                            ),
                          0,
                        ) ?? 0
                    } units`}
                    note="Delivered today"
                  />
                  <SummaryCard
                    label="Driver Status"
                    value="Online"
                    note="Ready for orders"
                    accent
                  />
                </section>

                <section className="driver-dashboard-grid">
                  <div className="driver-card">
                    <div className="driver-card-header">
                      <h2>Today's Deliveries</h2>

                      <button
                        type="button"
                        onClick={() => changeSection("deliveries")}
                      >
                        View All
                      </button>
                    </div>

                    <div className="driver-delivery-grid">
                      {dashboardData?.deliveries.length ? (
                        dashboardData.deliveries
                          .filter(
                            (delivery) =>
                              delivery.deliveryStatus !== "DELIVERED",
                          )
                          .slice(0, 3)
                          .map((delivery) => (
                            <DeliveryCard
                              key={delivery.deliveryId}
                              delivery={delivery}
                              onStatusUpdate={handleDeliveryStatusUpdate}
                              updatingDeliveryId={updatingDeliveryId}
                            />
                          ))
                      ) : (
                        <div className="driver-empty">
                          No assigned deliveries right now.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="driver-card">
                    <div className="driver-card-header">
                      <h2>Quick Actions</h2>
                    </div>

                    <div className="driver-quick-list">
                      <div className="driver-quick-item">
                        <strong>Start Delivery</strong>

                        <span>Open your next assigned delivery.</span>
                      </div>

                      <div className="driver-quick-item">
                        <strong>Update Delivery Status</strong>

                        <span>
                          Mark an order as picked up, out for delivery or
                          delivered.
                        </span>
                      </div>

                      <div className="driver-quick-item">
                        <strong>Customer Contact</strong>

                        <span>
                          Driver communication tools will be connected during
                          backend integration.
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeSection === "deliveries" && (
              <section className="driver-section-card">
                <div className="driver-section-header">
                  <h1>My Deliveries</h1>

                  <p>View and manage your assigned deliveries.</p>
                </div>

                <div className="driver-delivery-grid">
                  {dashboardData?.deliveries.filter(
                    (delivery) => delivery.deliveryStatus !== "DELIVERED",
                  ).length ? (
                    dashboardData.deliveries
                      .filter(
                        (delivery) => delivery.deliveryStatus !== "DELIVERED",
                      )
                      .map((delivery) => (
                        <DeliveryCard
                          key={delivery.deliveryId}
                          delivery={delivery}
                          onStatusUpdate={handleDeliveryStatusUpdate}
                          updatingDeliveryId={updatingDeliveryId}
                        />
                      ))
                  ) : (
                    <div className="driver-empty">
                      You currently have no active deliveries.
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeSection === "completed" && (
              <section className="driver-section-card">
                <div className="driver-section-header">
                  <h1>Completed Deliveries</h1>

                  <p>Review deliveries you have successfully completed.</p>
                </div>

                <div className="driver-delivery-grid">
                  {dashboardData?.deliveries.filter(
                    (delivery) => delivery.deliveryStatus === "DELIVERED",
                  ).length ? (
                    dashboardData.deliveries
                      .filter(
                        (delivery) => delivery.deliveryStatus === "DELIVERED",
                      )
                      .map((delivery) => (
                        <DeliveryCard
                          key={delivery.deliveryId}
                          delivery={delivery}
                          onStatusUpdate={handleDeliveryStatusUpdate}
                          updatingDeliveryId={updatingDeliveryId}
                        />
                      ))
                  ) : (
                    <div className="driver-empty">
                      No completed deliveries yet.
                    </div>
                  )}
                </div>
              </section>
            )}
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

                  <h2>Are you sure you want to logout?</h2>

                  <p>
                    You will be signed out of your Swivel Water administrator
                    account and returned to the login page.
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
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
            {activeSection === "profile" && (
              <section className="driver-section-card">
                <div
                  className="driver-section-header"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "18px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h1>My Profile</h1>

                    <p>
                      View and manage your driver account information and
                      profile photo.
                    </p>
                  </div>

                  {!isEditingProfile && (
                    <button
                      type="button"
                      onClick={handleEditProfile}
                      style={{
                        border: "none",
                        borderRadius: "10px",
                        padding: "10px 16px",
                        color: "#03141f",
                        background: "#29c7c9",
                        cursor: "pointer",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                      }}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                <div className="driver-profile-grid">
                  {/* PROFILE PHOTO */}
                  <div className="driver-profile-photo-panel">
                    <div className="driver-profile-large-avatar">
                      {profileImageUrl ? (
                        <img src={profileImageUrl} alt="Driver profile" />
                      ) : (
                        initials
                      )}
                    </div>

                    <div className="driver-profile-actions">
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

                  {/* PROFILE INFORMATION */}
                  <div>
                    {!isEditingProfile ? (
                      <div className="driver-information">
                        <div className="driver-information-card">
                          <small>First Name</small>

                          <strong>
                            {profile?.firstName || "Not provided"}
                          </strong>
                        </div>

                        <div className="driver-information-card">
                          <small>Last Name</small>

                          <strong>{profile?.lastName || "Not provided"}</strong>
                        </div>

                        <div className="driver-information-card">
                          <small>Email</small>

                          <strong>{profile?.email || "Not provided"}</strong>
                        </div>

                        <div className="driver-information-card">
                          <small>Phone</small>

                          <strong>{profile?.phone || "Not provided"}</strong>
                        </div>

                        <div className="driver-information-card">
                          <small>Employee Number</small>

                          <strong>
                            {profile?.employeeNumber || "Not provided"}
                          </strong>
                        </div>

                        <div className="driver-information-card">
                          <small>Employee Role</small>

                          <strong>{profile?.employeeRole || "DRIVER"}</strong>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gap: "16px",
                        }}
                      >
                        <div>
                          <label
                            htmlFor="driver-first-name"
                            style={{
                              display: "block",
                              marginBottom: "7px",
                              color: "#44616a",
                              fontSize: "0.8rem",
                              fontWeight: 750,
                            }}
                          >
                            First Name
                          </label>

                          <input
                            id="driver-first-name"
                            type="text"
                            value={editFirstName}
                            onChange={(event) =>
                              setEditFirstName(event.target.value)
                            }
                            style={{
                              width: "100%",
                              border: "1px solid rgba(5,63,80,0.11)",
                              borderRadius: "12px",
                              padding: "12px 13px",
                              color: "#17343e",
                              background: "white",
                              outline: "none",
                              fontSize: "0.88rem",
                            }}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="driver-last-name"
                            style={{
                              display: "block",
                              marginBottom: "7px",
                              color: "#44616a",
                              fontSize: "0.8rem",
                              fontWeight: 750,
                            }}
                          >
                            Last Name
                          </label>

                          <input
                            id="driver-last-name"
                            type="text"
                            value={editLastName}
                            onChange={(event) =>
                              setEditLastName(event.target.value)
                            }
                            style={{
                              width: "100%",
                              border: "1px solid rgba(5,63,80,0.11)",
                              borderRadius: "12px",
                              padding: "12px 13px",
                              color: "#17343e",
                              background: "white",
                              outline: "none",
                              fontSize: "0.88rem",
                            }}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="driver-phone"
                            style={{
                              display: "block",
                              marginBottom: "7px",
                              color: "#44616a",
                              fontSize: "0.8rem",
                              fontWeight: 750,
                            }}
                          >
                            Phone
                          </label>

                          <input
                            id="driver-phone"
                            type="text"
                            value={editPhone}
                            onChange={(event) =>
                              setEditPhone(event.target.value)
                            }
                            style={{
                              width: "100%",
                              border: "1px solid rgba(5,63,80,0.11)",
                              borderRadius: "12px",
                              padding: "12px 13px",
                              color: "#17343e",
                              background: "white",
                              outline: "none",
                              fontSize: "0.88rem",
                            }}
                          />
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                            marginTop: "4px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={handleSaveProfile}
                            disabled={savingProfile}
                            style={{
                              border: "none",
                              borderRadius: "10px",
                              padding: "11px 18px",
                              color: "#03141f",
                              background: "#29c7c9",
                              cursor: savingProfile ? "not-allowed" : "pointer",
                              fontSize: "0.78rem",
                              fontWeight: 800,
                              opacity: savingProfile ? 0.65 : 1,
                            }}
                          >
                            {savingProfile ? "Saving..." : "Save Changes"}
                          </button>

                          <button
                            type="button"
                            onClick={handleCancelEditProfile}
                            disabled={savingProfile}
                            style={{
                              border: "1px solid rgba(5,63,80,0.12)",
                              borderRadius: "10px",
                              padding: "11px 18px",
                              color: "#053f50",
                              background: "#f2fbfc",
                              cursor: savingProfile ? "not-allowed" : "pointer",
                              fontSize: "0.78rem",
                              fontWeight: 800,
                              opacity: savingProfile ? 0.65 : 1,
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
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
      className={`driver-sidebar-button ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span className="driver-sidebar-icon">{icon}</span>

      {label}
    </button>
  );
}

function SummaryCard({
  label,
  value,
  note,
  accent = false,
}: {
  label: string;
  value: string | number;
  note: string;
  accent?: boolean;
}) {
  return (
    <div className="driver-summary-card">
      <span>{label}</span>

      <strong className={accent ? "driver-summary-accent" : ""}>{value}</strong>

      <small>{note}</small>
    </div>
  );
}

function DeliveryCard({
  delivery,
  onStatusUpdate,
  updatingDeliveryId,
}: {
  delivery: DriverDashboardDelivery;
  onStatusUpdate: (
    deliveryId: string,
    deliveryStatus: "OUT_FOR_DELIVERY" | "DELIVERED",
  ) => Promise<void>;
  updatingDeliveryId: string | null;
}) {
  const customerName =
    `${delivery.customer.firstName} ${delivery.customer.lastName}`.trim() ||
    "Customer";

  const address = [
    delivery.address.addressLine1,
    delivery.address.addressLine2,
    delivery.address.city,
    delivery.address.province,
  ]
    .filter(Boolean)
    .join(", ");

  const waterSummary = delivery.order.items
    .map((item) => `${item.productName} × ${item.quantity}`)
    .join(" • ");

  const scheduledTime = delivery.scheduledDate
    ? new Date(delivery.scheduledDate).toLocaleTimeString("en-ZA", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not scheduled";

  const statusLabel = delivery.deliveryStatus
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <div className="driver-delivery-card">
      <div className="driver-delivery-top">
        <span className="driver-order-id">
          Order #{delivery.orderId.slice(0, 8)}
        </span>

        <span className="driver-status">{statusLabel}</span>
      </div>

      <h3>{customerName}</h3>

      <div className="driver-address">{address || "Address not provided"}</div>

      <div className="driver-delivery-meta">
        <span>{waterSummary || "No items"}</span>

        <span>{scheduledTime}</span>

        <strong>R {delivery.order.totalAmount.toFixed(2)}</strong>
      </div>

      <div className="driver-delivery-actions">
        {(delivery.deliveryStatus === "SCHEDULED" ||
          delivery.deliveryStatus === "PENDING") && (
          <button
            type="button"
            className="driver-action-button"
            disabled={updatingDeliveryId === delivery.deliveryId}
            onClick={() =>
              onStatusUpdate(delivery.deliveryId, "OUT_FOR_DELIVERY")
            }
          >
            {updatingDeliveryId === delivery.deliveryId
              ? "Updating..."
              : "🚚 Start Delivery"}
          </button>
        )}

        {delivery.deliveryStatus === "OUT_FOR_DELIVERY" && (
          <button
            type="button"
            className="driver-action-button driver-action-complete"
            disabled={updatingDeliveryId === delivery.deliveryId}
            onClick={() => onStatusUpdate(delivery.deliveryId, "DELIVERED")}
          >
            {updatingDeliveryId === delivery.deliveryId
              ? "Updating..."
              : "✅ Mark Delivered"}
          </button>
        )}
      </div>
    </div>
  );
}

export default DriverDashboard;
