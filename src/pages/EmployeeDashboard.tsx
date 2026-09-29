import { useEffect, useMemo, useState, type ChangeEvent } from "react";

import { useNavigate } from "react-router-dom";

import {
  deleteProfileImage,
  getEmployeeDashboard,
  getMyEmployeeShifts,
  getProfile,
  updateEmployeeProfile,
  uploadProfileImage,
  type EmployeeDashboardData,
  type EmployeeShiftsResponse,
  type Profile,
} from "../services/api";

import { useAuth } from "../auth/AuthContext";

type EmployeeSection =
  "dashboard" | "orders" | "customers" | "inventory" | "shifts" | "profile";

function EmployeeDashboard() {
  const navigate = useNavigate();

  const { logout } = useAuth();

  const [activeSection, setActiveSection] =
    useState<EmployeeSection>("dashboard");

  const [profile, setProfile] = useState<Profile | null>(null);

  const [dashboardData, setDashboardData] =
    useState<EmployeeDashboardData | null>(null);

  const [shiftData, setShiftData] = useState<EmployeeShiftsResponse | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [editFirstName, setEditFirstName] = useState("");

  const [editLastName, setEditLastName] = useState("");

  const [editPhone, setEditPhone] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);

  const firstName = profile?.firstName?.trim() || "there";

  const fullName = profile
    ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
      "Employee"
    : "Employee";

  const initials = useMemo(() => {
    if (!profile) {
      return "EM";
    }

    const first = profile.firstName?.trim()?.[0] ?? "";

    const last = profile.lastName?.trim()?.[0] ?? "";

    return `${first}${last}`.toUpperCase() || "EM";
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
    async function loadDashboardData() {
      try {
        setLoading(true);
        setMessage("");

        const [profileData, dashboardDataResult, shiftDataResult] =
          await Promise.all([
            getProfile(),
            getEmployeeDashboard(),
            getMyEmployeeShifts(),
          ]);

        setProfile(profileData);
        setDashboardData(dashboardDataResult);
        setShiftData(shiftDataResult);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load employee dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  function changeSection(section: EmployeeSection) {
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
          : "Could not update employee profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  }
  function sectionTitle() {
    switch (activeSection) {
      case "orders":
        return "Orders";

      case "customers":
        return "Customers";

      case "inventory":
        return "Inventory";

      case "shifts":
        return "My Shift";

      case "profile":
        return "My Profile";

      default:
        return "Dashboard";
    }
  }

  function sectionSubtitle() {
    switch (activeSection) {
      case "orders":
        return "View and manage daily customer orders.";

      case "customers":
        return "View customer information and activity.";

      case "inventory":
        return "Monitor Swivel Water stock levels.";

      case "shifts":
        return "View your current work shift.";

      case "profile":
        return "Manage your employee account information.";

      default:
        return "Your Swivel Water operations workspace.";
    }
  }

  if (loading) {
    return (
      <div className="employee-loading">
        <img src="/swivel-water-logo.png" alt="Swivel Water" />

        <p>Preparing your employee dashboard...</p>

        <style>{`
          .employee-loading {
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

          .employee-loading img {
            width: min(260px, 70vw);
          }

          .employee-loading p {
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

        .employee-layout {
          min-height: 100vh;
          display: flex;
          background: #f5fafb;
        }

        /* =========================
           SIDEBAR
        ========================== */

        .employee-sidebar {
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

          overflow-y: auto;
        }

        .employee-sidebar-profile {
          padding: 10px 8px 22px;

          border-bottom:
            1px solid
            rgba(255,255,255,0.1);
        }

        .employee-avatar-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .employee-avatar {
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

        .employee-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .employee-profile-name {
          margin-top: 10px;
          text-align: center;
        }

        .employee-profile-name strong {
          display: block;
          color: white;
          font-size: 0.9rem;
        }

        .employee-profile-name span {
          display: block;
          margin-top: 4px;
          color:
            rgba(255,255,255,0.46);
          font-size: 0.72rem;
        }

        .employee-role-badge {
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

        .employee-sidebar-nav {
          margin-top: 25px;

          display: grid;
          gap: 6px;
        }

        .employee-sidebar-button {
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

        .employee-sidebar-button:hover {
          color: white;

          background:
            rgba(255,255,255,0.06);

          transform: translateX(2px);
        }

        .employee-sidebar-button.active {
          color: #03141f;

          background: #29c7c9;

          font-weight: 800;

          box-shadow:
            0 10px 25px
            rgba(41,199,201,0.14);
        }

        .employee-sidebar-icon {
          width: 24px;
          text-align: center;
        }

        .employee-sidebar-bottom {
          margin-top: auto;
          padding-top: 20px;
        }

        .employee-logout {
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

        .employee-logout:hover {
          color: #ffdada;

          background:
            rgba(255,80,80,0.11);
        }

        /* =========================
           MAIN
        ========================== */

        .employee-main {
          width:
            calc(100% - 255px);

          margin-left: 255px;

          min-height: 100vh;
        }

        .employee-header {
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

        .employee-header-title span {
          color: #8a999f;
          font-size: 0.75rem;
        }

        .employee-header-title strong {
          display: block;

          margin-top: 3px;

          color: #053f50;

          font-size: 1rem;
        }

        .employee-time {
          text-align: right;
        }

        .employee-time strong {
          display: block;

          color: #053f50;

          font-size: 0.92rem;
        }

        .employee-time span {
          display: block;

          margin-top: 3px;

          color: #83949a;

          font-size: 0.75rem;
        }

        .employee-content {
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

        .employee-welcome {
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

        .employee-welcome small {
          color: #8deff0;

          text-transform: uppercase;

          letter-spacing: 0.16em;

          font-size: 0.72rem;
          font-weight: 800;
        }

        .employee-welcome h1 {
          margin: 10px 0 0;

          font-size:
            clamp(2rem, 4.5vw, 3.6rem);

          letter-spacing: -0.045em;
        }

        .employee-welcome p {
          margin: 13px 0 0;

          max-width: 760px;

          color:
            rgba(255,255,255,0.67);

          line-height: 1.7;
        }

        .employee-status {
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

        .employee-status-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #45e89e;
        }

        /* =========================
           SUMMARY
        ========================== */

        .employee-summary-grid {
          margin-top: 22px;

          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 15px;
        }

        .employee-summary-card {
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

        .employee-summary-card span {
          color: #85969c;

          font-size: 0.75rem;
        }

        .employee-summary-card strong {
          display: block;

          margin-top: 8px;

          color: #053f50;

          font-size: 1.35rem;
        }

        .employee-summary-card small {
          display: block;

          margin-top: 4px;

          color: #9ba9ae;
        }

        .employee-summary-accent {
          color: #118a8c !important;
        }

        /* =========================
           SECTION CONTAINER
        ========================== */

        .employee-section-card {
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

        .employee-section-header {
          margin-bottom: 24px;

          padding-bottom: 20px;

          border-bottom:
            1px solid
            rgba(5,63,80,0.07);
        }

        .employee-section-header h1 {
          margin: 0;

          color: #053f50;

          font-size: 1.5rem;
        }

        .employee-section-header p {
          margin: 6px 0 0;

          color: #87979d;

          font-size: 0.85rem;
        }

        /* =========================
           DASHBOARD GRID
        ========================== */

        .employee-dashboard-grid {
          margin-top: 22px;

          display: grid;

          grid-template-columns:
            minmax(0, 1.55fr)
            minmax(300px, 0.85fr);

          gap: 18px;
        }

        .employee-card {
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

        .employee-card-header {
          padding:
            19px 20px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          border-bottom:
            1px solid
            rgba(5,63,80,0.07);
        }

        .employee-card-header h2 {
          margin: 0;

          color: #053f50;

          font-size: 0.98rem;
        }

        .employee-card-header button {
          border: none;

          color: #118a8c;

          background: transparent;

          cursor: pointer;

          font-size: 0.75rem;
          font-weight: 800;
        }

        /* =========================
           TABLE
        ========================== */

        .employee-table-wrap {
          overflow-x: auto;
        }

        .employee-table {
          width: 100%;
          border-collapse: collapse;
        }

        .employee-table th {
          padding:
            12px 14px;

          color: #8a9ba1;

          font-size: 0.7rem;

          text-align: left;

          text-transform: uppercase;

          letter-spacing: 0.07em;
        }

        .employee-table td {
          padding:
            14px;

          color: #50666f;

          border-top:
            1px solid
            rgba(5,63,80,0.06);

          font-size: 0.8rem;
        }

        .employee-table td strong {
          color: #053f50;
        }

        .employee-order-id {
          color: #118a8c !important;
          font-weight: 800;
        }

        .employee-status-badge {
          display: inline-flex;

          padding: 6px 9px;

          border-radius: 999px;

          color: #117678;

          background:
            rgba(17,138,140,0.1);

          font-size: 0.68rem;

          font-weight: 800;
        }

        /* =========================
           TASKS
        ========================== */

        .employee-task {
          padding:
            15px 20px;

          border-bottom:
            1px solid
            rgba(5,63,80,0.06);
        }

        .employee-task:last-child {
          border-bottom: none;
        }

        .employee-task-top {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 10px;
        }

        .employee-task strong {
          color: #053f50;

          font-size: 0.82rem;
        }

        .employee-priority {
          padding: 5px 8px;

          border-radius: 999px;

          color: #118a8c;

          background: #f3fafb;

          font-size: 0.65rem;

          font-weight: 800;
        }

        .employee-task p {
          margin: 5px 0 0;

          color: #87999f;

          font-size: 0.72rem;

          line-height: 1.5;
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
           MINI CARDS
        ========================== */

        .employee-mini-grid {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 14px;
        }

        .employee-mini-card {
          padding: 20px;

          border-radius: 17px;

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

        .employee-mini-card strong {
          display: block;

          color: #053f50;

          font-size: 0.88rem;
        }

        .employee-mini-card span {
          display: block;

          margin-top: 7px;

          color: #86989e;

          font-size: 0.75rem;

          line-height: 1.5;
        }

        /* =========================
           PROFILE
        ========================== */

        .employee-profile-grid {
          display: grid;

          grid-template-columns:
            170px 1fr;

          gap: 30px;
        }

        .employee-profile-photo-panel {
          text-align: center;
        }

        .employee-profile-large-avatar {
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

        .employee-profile-large-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .employee-profile-actions {
          margin-top: 14px;

          display: grid;

          gap: 8px;
        }

        .employee-profile-actions label,
        .employee-profile-actions button {
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

        .employee-information {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap: 13px;
        }

        .employee-information-card {
          padding: 17px;

          border-radius: 15px;

          background: #f7fbfc;

          border:
            1px solid
            rgba(5,63,80,0.07);
        }

        .employee-information-card small {
          color: #899ba1;

          font-size: 0.7rem;

          text-transform: uppercase;

          letter-spacing: 0.08em;
        }

        .employee-information-card strong {
          display: block;

          margin-top: 7px;

          color: #053f50;

          font-size: 0.9rem;
        }

        .employee-empty {
          padding: 30px;

          text-align: center;

          color: #8a9aa0;

          border-radius: 15px;

          background: #f8fbfc;
        }

        @media (max-width: 1050px) {
          .employee-summary-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .employee-dashboard-grid {
            grid-template-columns: 1fr;
          }

          .employee-profile-grid {
            grid-template-columns: 1fr;
          }

          .employee-profile-photo-panel {
            text-align: left;
          }

          .employee-profile-large-avatar {
            margin: 0;
          }

          .employee-mini-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        @media (max-width: 760px) {
          .employee-sidebar {
            position: static;

            width: 100%;

            min-height: auto;
          }

          .employee-layout {
            display: block;
          }

          .employee-main {
            width: 100%;

            margin-left: 0;
          }

          .employee-sidebar-nav {
            grid-template-columns:
              repeat(3, 1fr);
          }

          .employee-sidebar-button {
            justify-content: center;
          }

          .employee-sidebar-icon {
            display: none;
          }

          .employee-content {
            width:
              min(100% - 28px, 1150px);
          }

          .employee-header {
            padding:
              14px 18px;

            align-items: flex-start;

            flex-direction: column;
          }

          .employee-time {
            text-align: left;
          }

          .employee-status {
            position: static;

            width: fit-content;

            margin-top: 18px;
          }

          .employee-information {
            grid-template-columns: 1fr;
          }

          .employee-section-card {
            padding: 22px;
          }

          .employee-table {
            min-width: 700px;
          }
        }

        @media (max-width: 500px) {
          .employee-summary-grid {
            grid-template-columns: 1fr;
          }

          .employee-mini-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="employee-layout">
        {/* SIDEBAR */}

        <aside className="employee-sidebar">
          <div>
            <div className="employee-sidebar-profile">
              <div className="employee-avatar-wrapper">
                <div className="employee-avatar">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Employee profile" />
                  ) : (
                    initials
                  )}
                </div>

                <div className="employee-profile-name">
                  <strong>{fullName}</strong>

                  <span>Employee Account</span>
                </div>

                <div className="employee-role-badge">
                  {profile?.employeeRole || "Employee"}
                </div>
              </div>
            </div>

            <nav className="employee-sidebar-nav">
              <SidebarButton
                icon="🏠"
                label="Dashboard"
                active={activeSection === "dashboard"}
                onClick={() => changeSection("dashboard")}
              />

              <SidebarButton
                icon="📦"
                label="Orders"
                active={activeSection === "orders"}
                onClick={() => changeSection("orders")}
              />

              <SidebarButton
                icon="👥"
                label="Customers"
                active={activeSection === "customers"}
                onClick={() => changeSection("customers")}
              />

              <SidebarButton
                icon="💧"
                label="Inventory"
                active={activeSection === "inventory"}
                onClick={() => changeSection("inventory")}
              />

              <SidebarButton
                icon="◷"
                label="My Shift"
                active={activeSection === "shifts"}
                onClick={() => changeSection("shifts")}
              />

              <SidebarButton
                icon="👤"
                label="My Profile"
                active={activeSection === "profile"}
                onClick={() => changeSection("profile")}
              />
            </nav>
          </div>

          {/* LOGOUT */}

          <div className="employee-sidebar-bottom">
            <button
              type="button"
              className="employee-logout"
              onClick={handleLogout}
            >
              <span className="employee-sidebar-icon">🚪</span>
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN */}

        <main className="employee-main">
          <header className="employee-header">
            <div className="employee-header-title">
              <span>Swivel Water</span>

              <strong>{sectionTitle()}</strong>
            </div>

            <div className="employee-time">
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

          <div className="employee-content">
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
                <section className="employee-welcome">
                  <small>Employee Overview</small>

                  <h1>Hello, {firstName} 👋🏽</h1>

                  <p>
                    Manage daily operations, monitor customer orders, check
                    inventory and stay on top of your assigned responsibilities.
                  </p>

                  <div className="employee-status">
                    <span className="employee-status-dot" />
                    On Duty
                  </div>
                </section>

                <section className="employee-summary-grid">
                  <SummaryCard
                    label="Orders Today"
                    value={String(dashboardData?.summary.ordersToday ?? 0)}
                    note={`${dashboardData?.summary.ordersRequiringAttention ?? 0} require attention`}
                  />

                  <SummaryCard
                    label="Customers"
                    value={String(dashboardData?.summary.activeCustomers ?? 0)}
                    note="Active customers"
                  />

                  <SummaryCard
                    label="Water Stock"
                    value={String(dashboardData?.summary.bottledStock ?? 0)}
                    note="Bottled units"
                  />

                  <SummaryCard
                    label="Refill Stock"
                    value={`${dashboardData?.summary.refillLitres ?? 0}L`}
                    note="Available refill water"
                    accent
                  />
                </section>
                <section className="employee-dashboard-grid">
                  <div className="employee-card">
                    <div className="employee-card-header">
                      <h2>Recent Orders</h2>

                      <button
                        type="button"
                        onClick={() => changeSection("orders")}
                      >
                        View All
                      </button>
                    </div>

                    <div className="employee-table-wrap">
                      <table className="employee-table">
                        <thead>
                          <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {dashboardData?.recentOrders.map((order) => (
                            <tr key={order.orderId}>
                              <td>
                                <strong className="employee-order-id">
                                  #{order.orderId.slice(0, 8).toUpperCase()}
                                </strong>
                              </td>

                              <td>{order.customer}</td>

                              <td>{order.type}</td>

                              <td>
                                <strong>R {order.amount.toFixed(2)}</strong>
                              </td>

                              <td>
                                <span className="employee-status-badge">
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="employee-card">
                    <div className="employee-card-header">
                      <h2>Work Queue</h2>

                      <button
                        type="button"
                        onClick={() => changeSection("orders")}
                      >
                        View Orders
                      </button>
                    </div>

                    <div className="employee-task">
                      <div className="employee-task-top">
                        <strong>Orders Requiring Attention</strong>

                        <span className="employee-priority">
                          {dashboardData?.summary.ordersRequiringAttention ?? 0}
                        </span>
                      </div>

                      <p>
                        Orders currently waiting for employee attention or
                        processing.
                      </p>
                    </div>

                    <div className="employee-task">
                      <div className="employee-task-top">
                        <strong>Today's Orders</strong>

                        <span className="employee-priority">
                          {dashboardData?.summary.ordersToday ?? 0}
                        </span>
                      </div>

                      <p>
                        Total orders recorded today across collection and
                        delivery.
                      </p>
                    </div>

                    <div className="employee-task">
                      <div className="employee-task-top">
                        <strong>Inventory Products</strong>

                        <span className="employee-priority">
                          {dashboardData?.inventory.length ?? 0}
                        </span>
                      </div>

                      <p>
                        Active products currently being tracked in the inventory
                        system.
                      </p>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* ORDERS */}

            {activeSection === "orders" && (
              <section className="employee-section-card">
                <div className="employee-section-header">
                  <h1>Orders</h1>

                  <p>View and manage today's customer orders.</p>
                </div>

                <div className="employee-table-wrap">
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {dashboardData?.recentOrders.map((order) => (
                        <tr key={order.orderId}>
                          <td>
                            <strong className="employee-order-id">
                              #{order.orderId.slice(0, 8).toUpperCase()}
                            </strong>
                          </td>

                          <td>{order.customer}</td>

                          <td>{order.type}</td>

                          <td>
                            <strong>R {order.amount.toFixed(2)}</strong>
                          </td>

                          <td>
                            <span className="employee-status-badge">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
            {/* CUSTOMERS */}

            {activeSection === "customers" && (
              <section className="employee-section-card">
                <div className="employee-section-header">
                  <h1>Customers</h1>

                  <p>View customer accounts and daily activity.</p>
                </div>

                <div className="employee-table-wrap">
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Phone</th>
                      </tr>
                    </thead>

                    <tbody>
                      {dashboardData?.customers.map((customer) => (
                        <tr key={customer.customerId}>
                          <td>
                            <strong>
                              {customer.firstName} {customer.lastName}
                            </strong>
                          </td>

                          <td>{customer.email}</td>

                          <td>{customer.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* INVENTORY */}

            {activeSection === "inventory" && (
              <section className="employee-section-card">
                <div className="employee-section-header">
                  <h1>Inventory</h1>

                  <p>Monitor bottled water and refill stock.</p>
                </div>

                <div className="employee-table-wrap">
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Stock</th>
                      </tr>
                    </thead>

                    <tbody>
                      {dashboardData?.inventory.map((product) => (
                        <tr key={product.productId}>
                          <td>
                            <strong>{product.productName}</strong>
                          </td>

                          <td>{product.productType}</td>

                          <td>R {product.price.toFixed(2)}</td>

                          <td>
                            <strong>
                              {product.productType === "REFILL"
                                ? `${product.stockQuantity}L`
                                : product.stockQuantity}
                            </strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* SHIFT */}
            {activeSection === "shifts" && (
              <section className="employee-section-card">
                <div className="employee-section-header">
                  <h1>My Shift</h1>

                  <p>
                    View your current work shift and upcoming scheduled shifts.
                  </p>
                </div>

                <div className="employee-mini-grid">
                  <MiniCard
                    title="Current Status"
                    text={
                      shiftData?.currentShift
                        ? shiftData.currentShift.status
                        : "Not currently on shift"
                    }
                  />

                  <MiniCard
                    title="Current Shift"
                    text={
                      shiftData?.currentShift
                        ? `${new Date(
                            shiftData.currentShift.shiftStart,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} - ${new Date(
                            shiftData.currentShift.shiftEnd,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : "No active shift"
                    }
                  />

                  <MiniCard
                    title="Upcoming Shifts"
                    text={`${shiftData?.upcomingShifts.length ?? 0} scheduled`}
                  />
                </div>

                <div className="employee-table-wrap">
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Status</th>
                        <th>Notes</th>
                      </tr>
                    </thead>

                    <tbody>
                      {shiftData?.upcomingShifts.length ? (
                        shiftData.upcomingShifts.map((shift) => (
                          <tr key={shift.employeeShiftId}>
                            <td>
                              {new Date(shift.shiftStart).toLocaleDateString()}
                            </td>

                            <td>
                              {new Date(shift.shiftStart).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </td>

                            <td>
                              {new Date(shift.shiftEnd).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>

                            <td>{shift.status}</td>

                            <td>{shift.notes || "—"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5}>No upcoming shifts scheduled.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* PROFILE */}

            {/* PROFILE */}

            {activeSection === "profile" && (
              <section className="employee-section-card">
                <div
                  className="employee-section-header"
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
                      View and manage your employee account information and
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

                <div className="employee-profile-grid">
                  {/* PROFILE PHOTO */}
                  <div className="employee-profile-photo-panel">
                    <div className="employee-profile-large-avatar">
                      {profileImageUrl ? (
                        <img src={profileImageUrl} alt="Employee profile" />
                      ) : (
                        initials
                      )}
                    </div>

                    <div className="employee-profile-actions">
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
                      <div className="employee-information">
                        <div className="employee-information-card">
                          <small>First Name</small>

                          <strong>
                            {profile?.firstName || "Not provided"}
                          </strong>
                        </div>

                        <div className="employee-information-card">
                          <small>Last Name</small>

                          <strong>{profile?.lastName || "Not provided"}</strong>
                        </div>

                        <div className="employee-information-card">
                          <small>Email</small>

                          <strong>{profile?.email || "Not provided"}</strong>
                        </div>

                        <div className="employee-information-card">
                          <small>Phone</small>

                          <strong>{profile?.phone || "Not provided"}</strong>
                        </div>

                        <div className="employee-information-card">
                          <small>Employee Number</small>

                          <strong>
                            {profile?.employeeNumber || "Not provided"}
                          </strong>
                        </div>

                        <div className="employee-information-card">
                          <small>Employee Role</small>

                          <strong>{profile?.employeeRole || "Employee"}</strong>
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
                            htmlFor="employee-first-name"
                            style={{
                              display: "block",
                              marginBottom: "7px",
                              color: "#536970",
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            First Name
                          </label>

                          <input
                            id="employee-first-name"
                            type="text"
                            value={editFirstName}
                            onChange={(event) =>
                              setEditFirstName(event.target.value)
                            }
                            disabled={savingProfile}
                            style={{
                              width: "100%",
                              padding: "13px 14px",
                              borderRadius: "12px",
                              border: "1px solid rgba(5,63,80,0.12)",
                              outline: "none",
                              color: "#053f50",
                              background: "#f8fbfc",
                              fontSize: "0.9rem",
                            }}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="employee-last-name"
                            style={{
                              display: "block",
                              marginBottom: "7px",
                              color: "#536970",
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            Last Name
                          </label>

                          <input
                            id="employee-last-name"
                            type="text"
                            value={editLastName}
                            onChange={(event) =>
                              setEditLastName(event.target.value)
                            }
                            disabled={savingProfile}
                            style={{
                              width: "100%",
                              padding: "13px 14px",
                              borderRadius: "12px",
                              border: "1px solid rgba(5,63,80,0.12)",
                              outline: "none",
                              color: "#053f50",
                              background: "#f8fbfc",
                              fontSize: "0.9rem",
                            }}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="employee-phone"
                            style={{
                              display: "block",
                              marginBottom: "7px",
                              color: "#536970",
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            Phone
                          </label>

                          <input
                            id="employee-phone"
                            type="tel"
                            value={editPhone}
                            onChange={(event) =>
                              setEditPhone(event.target.value)
                            }
                            disabled={savingProfile}
                            style={{
                              width: "100%",
                              padding: "13px 14px",
                              borderRadius: "12px",
                              border: "1px solid rgba(5,63,80,0.12)",
                              outline: "none",
                              color: "#053f50",
                              background: "#f8fbfc",
                              fontSize: "0.9rem",
                            }}
                          />
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: "12px",
                            marginTop: "4px",
                          }}
                        >
                          <div className="employee-information-card">
                            <small>Email</small>

                            <strong>{profile?.email || "Not provided"}</strong>
                          </div>

                          <div className="employee-information-card">
                            <small>Employee Number</small>

                            <strong>
                              {profile?.employeeNumber || "Not provided"}
                            </strong>
                          </div>

                          <div className="employee-information-card">
                            <small>Employee Role</small>

                            <strong>
                              {profile?.employeeRole || "Employee"}
                            </strong>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                            marginTop: "6px",
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
                              opacity: savingProfile ? 0.7 : 1,
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
                              opacity: savingProfile ? 0.7 : 1,
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
      className={`employee-sidebar-button ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span className="employee-sidebar-icon">{icon}</span>

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
    <div className="employee-summary-card">
      <span>{label}</span>

      <strong className={accent ? "employee-summary-accent" : ""}>
        {value}
      </strong>

      <small>{note}</small>
    </div>
  );
}

function MiniCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="employee-mini-card">
      <strong>{title}</strong>

      <span>{text}</span>
    </div>
  );
}

export default EmployeeDashboard;
