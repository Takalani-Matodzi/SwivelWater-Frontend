import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAdminCustomers,
  getAdminDashboard,
  getAdminPayments,
  getAdminDeliveries,
  getAdminProducts,
  getAdminEmployees,
  getAdminReports,
  getProfile,
  updateEmployeeProfile,
  uploadProfileImage,
  deleteProfileImage,
  getAdminEmployeeShifts,
  createAdminEmployeeShift,
  updateAdminEmployeeShift,
  cancelAdminEmployeeShift,
  type AdminCustomer,
  type AdminDashboardData,
  type AdminReportsData,
  type AdminPayment,
  type AdminProduct,
  type AdminDelivery,
  type AdminEmployee,
  type AdminEmployeeShift,
  type Profile,
} from "../services/api";
import { useAuth } from "../auth/AuthContext";

type AdminSection =
  | "dashboard"
  | "orders"
  | "customers"
  | "products"
  | "payments"
  | "deliveries"
  | "employees"
  | "reports"
  | "profile";

const menuItems: {
  id: AdminSection;
  icon: string;
  label: string;
}[] = [
  {
    id: "dashboard",
    icon: "🏠",
    label: "Dashboard",
  },
  {
    id: "orders",
    icon: "📦",
    label: "Orders",
  },
  {
    id: "customers",
    icon: "👥",
    label: "Customers",
  },
  {
    id: "products",
    icon: "💧",
    label: "Products",
  },
  {
    id: "payments",
    icon: "💳",
    label: "Payments",
  },
  {
    id: "deliveries",
    icon: "🚚",
    label: "Deliveries",
  },
  {
    id: "employees",
    icon: "👨🏽‍💼",
    label: "Employees",
  },
  {
    id: "reports",
    icon: "📊",
    label: "Reports",
  },
  {
    id: "profile",
    icon: "👤",
    label: "My Profile",
  },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  const [employeeShifts, setEmployeeShifts] = useState<AdminEmployeeShift[]>(
    [],
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [shiftNotes, setShiftNotes] = useState("");
  const [savingShift, setSavingShift] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [employeeShiftsLoading, setEmployeeShiftsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [employeeTab, setEmployeeTab] = useState<"TEAM" | "SHIFTS">("TEAM");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeRoleFilter, setEmployeeRoleFilter] = useState<
    "ALL" | "EMPLOYEE" | "DRIVER"
  >("ALL");
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [creatingEmployee, setCreatingEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    employeeRole: "EMPLOYEE",
    password: "",
    confirmPassword: "",
  });
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [deliveries, setDeliveries] = useState<AdminDelivery[]>([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [reports, setReports] = useState<AdminReportsData | null>(null);
  const [reportsLoading, setReportsLoading] = useState(false);

  const [reportPeriod, setReportPeriod] = useState<
    "TODAY" | "WEEK" | "MONTH" | "YEAR" | "ALL"
  >("MONTH");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    async function loadAdminDashboard() {
      try {
        setLoading(true);
        setMessage("");

        const data = await getAdminDashboard();

        setDashboardData(data);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load admin dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadAdminDashboard();
  }, []);
  useEffect(() => {
    async function loadAdminCustomers() {
      if (activeSection !== "customers") {
        return;
      }

      try {
        setCustomersLoading(true);

        const data = await getAdminCustomers();

        setCustomers(data);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load customers.",
        );
      } finally {
        setCustomersLoading(false);
      }
    }

    loadAdminCustomers();
  }, [activeSection]);

  useEffect(() => {
    async function loadAdminProducts() {
      if (activeSection !== "products") {
        return;
      }

      try {
        setProductsLoading(true);

        const data = await getAdminProducts();

        setProducts(data);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load products.",
        );
      } finally {
        setProductsLoading(false);
      }
    }

    loadAdminProducts();
  }, [activeSection]);
  useEffect(() => {
    async function loadAdminPayments() {
      if (activeSection !== "payments") {
        return;
      }

      try {
        setPaymentsLoading(true);

        const data = await getAdminPayments();

        setPayments(data);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load payments.",
        );
      } finally {
        setPaymentsLoading(false);
      }
    }

    loadAdminPayments();
  }, [activeSection]);
  useEffect(() => {
    async function loadAdminDeliveries() {
      if (activeSection !== "deliveries") {
        return;
      }

      try {
        setDeliveriesLoading(true);

        const data = await getAdminDeliveries();

        setDeliveries(data);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load deliveries.",
        );
      } finally {
        setDeliveriesLoading(false);
      }
    }

    loadAdminDeliveries();
  }, [activeSection]);
  useEffect(() => {
    async function loadAdminEmployees() {
      if (activeSection !== "employees") {
        return;
      }

      try {
        setEmployeesLoading(true);

        const data = await getAdminEmployees();

        setEmployees(data);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load employees.",
        );
      } finally {
        setEmployeesLoading(false);
      }
    }

    loadAdminEmployees();
  }, [activeSection]);
  useEffect(() => {
    async function loadAdminEmployeeShifts() {
      if (activeSection !== "employees") {
        return;
      }

      try {
        setEmployeeShiftsLoading(true);

        const data = await getAdminEmployeeShifts();

        setEmployeeShifts(data);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load employee shifts.",
        );
      } finally {
        setEmployeeShiftsLoading(false);
      }
    }

    loadAdminEmployeeShifts();
  }, [activeSection]);
  useEffect(() => {
    async function loadAdminReports() {
      if (activeSection !== "reports") {
        return;
      }

      try {
        setReportsLoading(true);

        const data = await getAdminReports(reportPeriod);

        setReports(data);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load reports.",
        );
      } finally {
        setReportsLoading(false);
      }
    }

    loadAdminReports();
  }, [activeSection, reportPeriod]);

  useEffect(() => {
    async function loadAdminProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load administrator profile.",
        );
      }
    }

    loadAdminProfile();
  }, []);

  const adminProfileImageUrl = profile?.profileImageUrl
    ? `${(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5230/api").replace(/\/api$/, "")}${profile.profileImageUrl}`
    : null;

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

    try {
      setSavingProfile(true);
      setMessage("");

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
          : "Could not update administrator profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAdminProfileImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploadingProfileImage(true);
      setMessage("");

      const result = await uploadProfileImage(file);

      setProfile((current) =>
        current
          ? { ...current, profileImageUrl: result.profileImageUrl }
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
      setUploadingProfileImage(false);
      event.target.value = "";
    }
  }

  async function handleDeleteAdminProfileImage() {
    try {
      setUploadingProfileImage(true);
      setMessage("");

      await deleteProfileImage();

      setProfile((current) =>
        current ? { ...current, profileImageUrl: undefined } : current,
      );

      setMessage("Profile picture removed successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not remove profile picture.",
      );
    } finally {
      setUploadingProfileImage(false);
    }
  }

  function toDateTimeLocal(value: string) {
    const date = new Date(value);
    const offset = date.getTimezoneOffset();

    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
  }

  function handleEditShift(shift: AdminEmployeeShift) {
    setEditingShiftId(shift.employeeShiftId);
    setSelectedEmployeeId(shift.employeeId);
    setShiftStart(toDateTimeLocal(shift.shiftStart));
    setShiftEnd(toDateTimeLocal(shift.shiftEnd));
    setShiftNotes(shift.notes ?? "");
    setMessage("");
  }

  function handleCancelEditShift() {
    setEditingShiftId(null);
    setSelectedEmployeeId("");
    setShiftStart("");
    setShiftEnd("");
    setShiftNotes("");
    setMessage("");
  }

  async function handleSaveShift() {
    if (!selectedEmployeeId) {
      setMessage("Please select an employee.");
      return;
    }

    if (!shiftStart) {
      setMessage("Please select the shift start date and time.");
      return;
    }

    if (!shiftEnd) {
      setMessage("Please select the shift end date and time.");
      return;
    }

    const start = new Date(shiftStart);
    const end = new Date(shiftEnd);

    if (end <= start) {
      setMessage("Shift end time must be after shift start time.");
      return;
    }

    try {
      setSavingShift(true);
      setMessage("");

      if (editingShiftId) {
        await updateAdminEmployeeShift(editingShiftId, {
          employeeId: selectedEmployeeId,
          shiftStart: start.toISOString(),
          shiftEnd: end.toISOString(),
          status: "SCHEDULED",
          notes: shiftNotes.trim() || undefined,
        });

        setMessage("Employee shift updated successfully.");
      } else {
        await createAdminEmployeeShift({
          employeeId: selectedEmployeeId,
          shiftStart: start.toISOString(),
          shiftEnd: end.toISOString(),
          status: "SCHEDULED",
          notes: shiftNotes.trim() || undefined,
        });

        setMessage("Employee shift scheduled successfully.");
      }

      const updatedShifts = await getAdminEmployeeShifts();

      setEmployeeShifts(updatedShifts);

      setEditingShiftId(null);
      setSelectedEmployeeId("");
      setShiftStart("");
      setShiftEnd("");
      setShiftNotes("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save employee shift.",
      );
    } finally {
      setSavingShift(false);
    }
  }

  async function handleCancelShift(shiftId: string) {
    try {
      setMessage("");

      await cancelAdminEmployeeShift(shiftId);

      const updatedShifts = await getAdminEmployeeShifts();

      setEmployeeShifts(updatedShifts);

      setMessage("Employee shift cancelled successfully.");

      if (editingShiftId === shiftId) {
        handleCancelEditShift();
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not cancel employee shift.",
      );
    }
  }
  function resetEmployeeForm() {
    setNewEmployee({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      employeeRole: "EMPLOYEE",
      password: "",
      confirmPassword: "",
    });
  }

  function closeEmployeeModal() {
    if (creatingEmployee) {
      return;
    }

    setShowEmployeeModal(false);
    resetEmployeeForm();
  }

  async function handleCreateEmployee() {
    const firstName = newEmployee.firstName.trim();
    const lastName = newEmployee.lastName.trim();
    const email = newEmployee.email.trim().toLowerCase();
    const phone = newEmployee.phone.trim();

    if (!firstName || !lastName || !email || !phone) {
      setMessage("Please complete all employee details.");
      return;
    }

    if (!newEmployee.password) {
      setMessage("Please enter a password for the employee.");
      return;
    }

    if (newEmployee.password !== newEmployee.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("You are not logged in.");
      return;
    }

    try {
      setCreatingEmployee(true);
      setMessage("");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5230/api"}/Auth/register-employee`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            phone,
            employeeRole: newEmployee.employeeRole,
            password: newEmployee.password,
            confirmPassword: newEmployee.confirmPassword,
          }),
        },
      );

      const responseText = await response.text();

      let responseData: {
        message?: string;
        employeeNumber?: string;
      } = {};

      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch {
        responseData = {};
      }

      if (!response.ok) {
        throw new Error(
          responseData.message ||
            responseText ||
            "Could not create the employee.",
        );
      }

      const updatedEmployees = await getAdminEmployees();
      setEmployees(updatedEmployees);

      setShowEmployeeModal(false);
      resetEmployeeForm();
      setEmployeeTab("TEAM");

      setMessage(
        responseData.employeeNumber
          ? `Employee created successfully. Employee No. ${responseData.employeeNumber}`
          : "Employee created successfully.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not create the employee.",
      );
    } finally {
      setCreatingEmployee(false);
    }
  }

  const filteredEmployees = useMemo(() => {
    const search = employeeSearch.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesRole =
        employeeRoleFilter === "ALL" || employee.role === employeeRoleFilter;

      const haystack = [
        employee.firstName,
        employee.lastName,
        employee.employeeNumber,
        employee.phone,
        employee.role,
      ]
        .join(" ")
        .toLowerCase();

      return matchesRole && (!search || haystack.includes(search));
    });
  }, [employees, employeeRoleFilter, employeeSearch]);

  const adminName = useMemo(() => {
    const profileName =
      `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim();

    if (profileName) {
      return profileName;
    }

    if (!user?.email) {
      return "Administrator";
    }

    const username = user.email.split("@")[0];

    const cleaned = username.replace(/[._-]+/g, " ").trim();

    if (!cleaned) {
      return "Administrator";
    }

    return cleaned
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }, [profile, user]);

  const adminInitials = useMemo(() => {
    if (profile?.firstName || profile?.lastName) {
      const first = profile.firstName?.trim()?.[0] ?? "";
      const last = profile.lastName?.trim()?.[0] ?? "";
      return `${first}${last}`.toUpperCase() || "AD";
    }

    if (!user?.email) {
      return "AD";
    }

    const username = user.email.split("@")[0];

    const parts = username
      .replace(/[._-]+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean);

    const initials = parts
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");

    return initials || "AD";
  }, [profile, user]);

  function changeSection(section: AdminSection) {
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

  function sectionTitle() {
    switch (activeSection) {
      case "orders":
        return "Orders";

      case "customers":
        return "Customers";

      case "products":
        return "Products";

      case "payments":
        return "Payments";

      case "deliveries":
        return "Deliveries";

      case "employees":
        return "Employees";

      case "reports":
        return "Reports";

      case "profile":
        return "My Profile";

      default:
        return "Dashboard";
    }
  }

  function sectionSubtitle() {
    switch (activeSection) {
      case "orders":
        return "Monitor and manage customer orders.";

      case "customers":
        return "View and manage Swivel Water customers.";

      case "products":
        return "Manage your water and refill catalogue.";

      case "payments":
        return "Monitor payment activity across the system.";

      case "deliveries":
        return "Monitor delivery operations and drivers.";

      case "employees":
        return "Manage employees and driver operations.";

      case "reports":
        return "Review Swivel Water business performance.";

      case "profile":
        return "Manage your administrator account.";

      default:
        return "Your Swivel Water administration workspace.";
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f5fafb",
          color: "#053f50",
          fontSize: "1rem",
          fontWeight: 700,
        }}
      >
        Loading Swivel Water administration...
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

          .admin-layout {
            min-height: 100vh;
            display: flex;
            background: #f5fafb;
          }

          /* =========================
             SIDEBAR
          ========================== */

          .admin-sidebar {
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

          .admin-sidebar-profile {
            padding: 10px 8px 22px;

            border-bottom:
              1px solid
              rgba(255,255,255,0.1);
          }

          .admin-avatar-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .admin-avatar {
            width: 68px;
            height: 68px;

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

            box-shadow:
              0 10px 30px
              rgba(0,0,0,0.14);
          }

          .admin-profile-name {
            margin-top: 10px;
            text-align: center;
          }

          .admin-profile-name strong {
            display: block;

            color: white;

            font-size: 0.9rem;
          }

          .admin-profile-name span {
            display: block;

            margin-top: 4px;

            color:
              rgba(255,255,255,0.46);

            font-size: 0.72rem;
          }

          .admin-role-badge {
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

          .admin-sidebar-nav {
            margin-top: 25px;

            display: grid;
            gap: 6px;
          }

          .admin-sidebar-button {
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

          .admin-sidebar-button:hover {
            color: white;

            background:
              rgba(255,255,255,0.06);

            transform: translateX(2px);
          }

          .admin-sidebar-button.active {
            color: #03141f;

            background: #29c7c9;

            font-weight: 800;

            box-shadow:
              0 10px 25px
              rgba(41,199,201,0.14);
          }

          .admin-sidebar-icon {
            width: 24px;

            text-align: center;

            font-size: 1rem;
          }

          .admin-sidebar-bottom {
            margin-top: auto;

            padding-top: 20px;
          }

          .admin-logout {
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

          .admin-logout:hover {
            color: #ffdada;

            background:
              rgba(255,80,80,0.11);
          }

          /* =========================
             MAIN
          ========================== */

          .admin-main {
            width:
              calc(100% - 255px);

            margin-left: 255px;

            min-height: 100vh;
          }

          .admin-header {
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

          .admin-header-title span {
            color: #8a999f;

            font-size: 0.75rem;
          }

          .admin-header-title strong {
            display: block;

            margin-top: 3px;

            color: #053f50;

            font-size: 1rem;
          }

          .admin-time {
            text-align: right;
          }

          .admin-time strong {
            display: block;

            color: #053f50;

            font-size: 0.92rem;
          }

          .admin-time span {
            display: block;

            margin-top: 3px;

            color: #83949a;

            font-size: 0.75rem;
          }

          .admin-content {
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

          .admin-welcome {
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

          .admin-welcome small {
            color: #8deff0;

            text-transform: uppercase;

            letter-spacing: 0.16em;

            font-size: 0.72rem;

            font-weight: 800;
          }

          .admin-welcome h1 {
            margin: 10px 0 0;

            font-size:
              clamp(2rem, 4.5vw, 3.6rem);

            letter-spacing: -0.045em;
          }

          .admin-welcome p {
            margin: 13px 0 0;

            max-width: 760px;

            color:
              rgba(255,255,255,0.67);

            line-height: 1.7;
          }

          /* =========================
             SUMMARY
          ========================== */

          .admin-summary-grid {
            margin-top: 22px;

            display: grid;

            grid-template-columns:
              repeat(4, 1fr);

            gap: 15px;
          }

          .admin-summary-card {
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

          .admin-summary-card span {
            color: #85969c;

            font-size: 0.75rem;
          }

          .admin-summary-card strong {
            display: block;

            margin-top: 8px;

            color: #053f50;

            font-size: 1.35rem;
          }

          .admin-summary-card small {
            display: block;

            margin-top: 4px;

            color: #9ba9ae;
          }

          .admin-summary-accent {
            color: #118a8c !important;
          }

          /* =========================
             SECTION CONTAINER
          ========================== */

          .admin-section-card {
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

          .admin-section-card-header {
            margin-bottom: 24px;

            padding-bottom: 20px;

            border-bottom:
              1px solid
              rgba(5,63,80,0.07);
          }

          .admin-section-card-header h1 {
            margin: 0;

            color: #053f50;

            font-size: 1.5rem;
          }

          .admin-section-card-header p {
            margin: 6px 0 0;

            color: #87979d;

            font-size: 0.85rem;
          }

          /* =========================
             TABLE
          ========================== */

          .admin-table-wrap {
            overflow-x: auto;
          }

          .admin-table {
            width: 100%;

            border-collapse: collapse;
          }

          .admin-table th {
            padding:
              12px 14px;

            color: #8a9ba1;

            font-size: 0.7rem;

            text-align: left;

            text-transform: uppercase;

            letter-spacing: 0.07em;
          }

          .admin-table td {
            padding:
              14px;

            color: #50666f;

            border-top:
              1px solid
              rgba(5,63,80,0.06);

            font-size: 0.8rem;
          }

          .admin-table td strong {
            color: #053f50;
          }

          .admin-order-id {
            color: #118a8c !important;

            font-weight: 800;
          }

          .admin-status {
            display: inline-flex;

            padding:
              6px 9px;

            border-radius: 999px;

            color: #117678;

            background:
              rgba(17,138,140,0.1);

            font-size: 0.68rem;

            font-weight: 800;
          }
/* =========================
   REPORTS
========================= */

.admin-report-toolbar {
  margin-bottom: 22px;

  padding: 18px 20px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  border:
    1px solid
    rgba(5,63,80,0.07);

  border-radius: 17px;

  background:
    linear-gradient(
      135deg,
      #f3fbfc,
      #ffffff
    );
}

.admin-report-toolbar > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-report-label {
  color: #899ba1;

  font-size: 0.68rem;

  font-weight: 800;

  text-transform: uppercase;

  letter-spacing: 0.08em;
}

.admin-report-toolbar strong {
  color: #053f50;

  font-size: 0.95rem;
}

.admin-report-toolbar select {
  min-width: 160px;

  padding: 11px 13px;

  border:
    1px solid
    rgba(5,63,80,0.12);

  border-radius: 11px;

  background: white;

  color: #053f50;

  font-family: inherit;

  font-size: 0.78rem;

  font-weight: 700;

  outline: none;

  cursor: pointer;
}

.admin-report-toolbar select:focus {
  border-color: #118a8c;

  box-shadow:
    0 0 0 3px
    rgba(17,138,140,0.1);
}

.admin-report-list {
  padding: 8px 20px 18px;
}

.admin-report-row {
  min-height: 64px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding: 13px 0;

  border-bottom:
    1px solid
    rgba(5,63,80,0.06);
}

.admin-report-row:last-child {
  border-bottom: none;
}

.admin-report-row > div {
  min-width: 0;
}

.admin-report-row strong {
  display: block;

  color: #053f50;

  font-size: 0.8rem;
}

.admin-report-row span {
  display: block;

  margin-top: 4px;

  color: #899ba1;

  font-size: 0.7rem;
}

.admin-report-row > strong {
  flex-shrink: 0;

  color: #118a8c;

  font-size: 0.86rem;
}

.admin-report-card-spacing {
  margin-top: 18px;
}

.admin-report-loading {
  padding: 50px 20px;

  text-align: center;

  color: #053f50;

  font-size: 0.85rem;

  font-weight: 700;
}

.admin-report-empty {
  padding: 30px 20px;

  text-align: center;

  color: #87979d;

  font-size: 0.8rem;

  background: #f8fbfc;

  border-radius: 15px;
}

/* Report cards get a little more breathing room */
.admin-report-card-spacing.admin-mini-grid {
  margin-top: 18px;
}

@media (max-width: 760px) {
  .admin-report-toolbar {
    align-items: stretch;

    flex-direction: column;
  }

  .admin-report-toolbar select {
    width: 100%;
  }

  .admin-report-row {
    align-items: flex-start;
  }

  .admin-report-row > strong {
    text-align: right;
  }
}

          /* =========================
   EMPLOYEE SHIFT FORM
========================= */

.admin-shift-form {
  padding: 22px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  background:
    linear-gradient(
      135deg,
      #f7fcfd,
      #ffffff
    );
}

.admin-shift-form label {
  display: flex;
  flex-direction: column;
  gap: 8px;

  color: #053f50;

  font-size: 0.75rem;
  font-weight: 800;
}

.admin-shift-form select,
.admin-shift-form input,
.admin-shift-form textarea {
  width: 100%;

  padding: 12px 14px;

  border:
    1px solid
    rgba(5,63,80,0.12);

  border-radius: 12px;

  background: white;

  color: #18343e;

  font-family: inherit;
  font-size: 0.82rem;

  outline: none;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.admin-shift-form select:focus,
.admin-shift-form input:focus,
.admin-shift-form textarea:focus {
  border-color: #118a8c;

  box-shadow:
    0 0 0 3px
    rgba(17,138,140,0.1);
}

.admin-shift-form textarea {
  min-height: 92px;

  resize: vertical;
}

.admin-shift-form button {
  grid-column: 1 / -1;

  justify-self: start;

  min-width: 180px;

  padding: 12px 20px;

  border: none;

  border-radius: 12px;

  color: white;

  background:
    linear-gradient(
      135deg,
      #053f50,
      #118a8c
    );

  font-family: inherit;

  font-size: 0.8rem;
  font-weight: 800;

  cursor: pointer;

  box-shadow:
    0 8px 20px
    rgba(5,63,80,0.14);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.admin-shift-form button:hover:not(:disabled) {
  transform: translateY(-1px);

  box-shadow:
    0 11px 24px
    rgba(5,63,80,0.18);
}

.admin-shift-form button:disabled {
  opacity: 0.6;

  cursor: not-allowed;
}

/* =========================
   SHIFT ACTIONS
========================= */

.admin-shift-actions {
  grid-column: 1 / -1;

  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-primary-button {
  min-width: 180px;

  padding: 12px 20px;

  border: none;

  border-radius: 12px;

  color: white;

  background:
    linear-gradient(
      135deg,
      #053f50,
      #118a8c
    );

  font-family: inherit;

  font-size: 0.8rem;
  font-weight: 800;

  cursor: pointer;

  box-shadow:
    0 8px 20px
    rgba(5,63,80,0.14);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.admin-primary-button:hover:not(:disabled) {
  transform: translateY(-1px);

  box-shadow:
    0 11px 24px
    rgba(5,63,80,0.18);
}

.admin-primary-button:disabled {
  opacity: 0.6;

  cursor: not-allowed;
}

.admin-secondary-button {
  padding: 12px 18px;

  border:
    1px solid
    rgba(5,63,80,0.14);

  border-radius: 12px;

  background: white;

  color: #053f50;

  font-family: inherit;

  font-size: 0.8rem;
  font-weight: 800;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.admin-secondary-button:hover:not(:disabled) {
  transform: translateY(-1px);

  background: #f4fafb;
}

.admin-secondary-button:disabled {
  opacity: 0.6;

  cursor: not-allowed;
}

.admin-shift-row-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-edit-button,
.admin-cancel-button {
  padding: 7px 11px;

  border-radius: 9px;

  font-family: inherit;

  font-size: 0.7rem;
  font-weight: 800;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.admin-edit-button {
  border:
    1px solid
    rgba(17,138,140,0.2);

  color: #117678;

  background:
    rgba(17,138,140,0.08);
}

.admin-edit-button:hover {
  transform: translateY(-1px);

  background:
    rgba(17,138,140,0.14);
}

.admin-cancel-button {
  border:
    1px solid
    rgba(180,60,60,0.16);

  color: #a33a3a;

  background:
    rgba(180,60,60,0.07);
}

.admin-cancel-button:hover {
  transform: translateY(-1px);

  background:
    rgba(180,60,60,0.12);
}

/* =========================
   SHIFT FORM RESPONSIVE
========================= */

@media (max-width: 760px) {
  .admin-shift-form {
    grid-template-columns: 1fr;
  }

  .admin-shift-form button {
    grid-column: auto;

    width: 100%;
  }
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
             EMPLOYEE MANAGEMENT
          ========================== */

          .admin-employee-page-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
          }

          .admin-add-employee-button {
            min-width: auto !important;
            padding: 11px 18px !important;
            flex-shrink: 0;
          }

          .admin-employee-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
            margin-bottom: 24px;
          }

          .admin-employee-stat {
            padding: 18px 19px;
            border: 1px solid rgba(5,63,80,0.07);
            border-radius: 18px;
            background: linear-gradient(135deg, #f5fbfc, #ffffff);
          }

          .admin-employee-stat span {
            display: block;
            color: #8a9ba1;
            font-size: 0.68rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }

          .admin-employee-stat strong {
            display: block;
            margin-top: 7px;
            color: #053f50;
            font-size: 1.45rem;
            line-height: 1;
          }

          .admin-employee-stat small {
            display: block;
            margin-top: 6px;
            color: #93a2a7;
            font-size: 0.7rem;
          }

          .admin-employee-tabs {
            display: flex;
            gap: 8px;
            padding: 6px;
            margin-bottom: 20px;
            border: 1px solid rgba(5,63,80,0.07);
            border-radius: 15px;
            background: #f6fbfc;
          }

          .admin-employee-tab {
            flex: 1;
            border: none;
            border-radius: 11px;
            padding: 11px 14px;
            color: #7b9098;
            background: transparent;
            font-family: inherit;
            font-size: 0.78rem;
            font-weight: 800;
            cursor: pointer;
            transition: 0.2s ease;
          }

          .admin-employee-tab:hover {
            color: #053f50;
          }

          .admin-employee-tab.active {
            color: #03141f;
            background: #29c7c9;
            box-shadow: 0 8px 20px rgba(41,199,201,0.14);
          }

          .admin-employee-workspace {
            min-width: 0;
          }

          .admin-employee-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 16px;
          }

          .admin-employee-search {
            flex: 1;
            min-width: 0;
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 11px 13px;
            border: 1px solid rgba(5,63,80,0.1);
            border-radius: 12px;
            background: #fbfdfe;
          }

          .admin-employee-search span {
            color: #8da0a7;
            font-size: 1rem;
          }

          .admin-employee-search input {
            width: 100%;
            border: none;
            outline: none;
            background: transparent;
            color: #18343e;
            font-family: inherit;
            font-size: 0.78rem;
          }

          .admin-employee-search input::placeholder {
            color: #a0adb2;
          }

          .admin-employee-filter {
            min-width: 150px;
            padding: 11px 12px;
            border: 1px solid rgba(5,63,80,0.1);
            border-radius: 12px;
            background: white;
            color: #053f50;
            font-family: inherit;
            font-size: 0.78rem;
            font-weight: 700;
            outline: none;
          }

          .admin-employee-name-cell {
            display: flex;
            align-items: center;
            gap: 11px;
          }

          .admin-employee-name-cell > div:last-child {
            min-width: 0;
          }

          .admin-employee-name-cell span {
            display: block;
            margin-top: 3px;
            color: #8e9ea4;
            font-size: 0.68rem;
          }

          .admin-employee-duty {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            width: auto;
            height: auto;
            color: #55717a;
            background: transparent;
            font-size: 0.72rem;
            font-weight: 700;
          }

          .admin-employee-duty-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #23a96f;
          }

          .admin-offline.admin-employee-duty .admin-employee-duty-dot {
            background: #aab8bd;
          }

          .admin-inactive-status {
            color: #8a6666;
            background: rgba(163,58,58,0.08);
          }

          .admin-card-subtitle {
            display: block;
            margin-top: 4px;
            color: #93a2a7;
            font-size: 0.69rem;
          }

          .admin-section-count {
            color: #118a8c;
            font-size: 0.7rem;
            font-weight: 800;
          }

          .admin-shifts-list-card {
            margin-top: 18px;
          }

          /* =========================
             ADD EMPLOYEE MODAL
          ========================== */

          .admin-modal-backdrop {
            position: fixed;
            inset: 0;
            z-index: 200;
            display: grid;
            place-items: center;
            padding: 24px;
            background: rgba(2,21,30,0.54);
            backdrop-filter: blur(7px);
          }

          .admin-employee-modal {
            width: min(720px, 100%);
            max-height: min(88vh, 820px);
            overflow-y: auto;
            border: 1px solid rgba(255,255,255,0.18);
            border-radius: 24px;
            background: white;
            box-shadow: 0 30px 90px rgba(3,20,31,0.28);
          }

          .admin-employee-modal-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
            padding: 25px 26px 20px;
            border-bottom: 1px solid rgba(5,63,80,0.07);
          }

          .admin-modal-eyebrow {
            display: block;
            margin-bottom: 7px;
            color: #118a8c;
            font-size: 0.62rem;
            font-weight: 900;
            letter-spacing: 0.12em;
          }

          .admin-employee-modal-header h2 {
            margin: 0;
            color: #053f50;
            font-size: 1.2rem;
          }

          .admin-employee-modal-header p {
            margin: 5px 0 0;
            color: #8a9aa0;
            font-size: 0.76rem;
          }

          .admin-modal-close {
            width: 34px;
            height: 34px;
            display: grid;
            place-items: center;
            border: 1px solid rgba(5,63,80,0.08);
            border-radius: 10px;
            color: #698089;
            background: #f5fafb;
            font-size: 1.2rem;
            line-height: 1;
            cursor: pointer;
          }

          .admin-modal-close:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }

          .admin-employee-modal-body {
            padding: 24px 26px 26px;
          }

          .admin-modal-form-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }

          .admin-modal-form-grid label {
            display: flex;
            flex-direction: column;
            gap: 8px;
            color: #053f50;
            font-size: 0.73rem;
            font-weight: 800;
          }

          .admin-modal-form-grid input,
          .admin-modal-form-grid select {
            width: 100%;
            padding: 12px 13px;
            border: 1px solid rgba(5,63,80,0.11);
            border-radius: 12px;
            background: white;
            color: #18343e;
            font-family: inherit;
            font-size: 0.8rem;
            outline: none;
          }

          .admin-modal-form-grid input:focus,
          .admin-modal-form-grid select:focus {
            border-color: #118a8c;
            box-shadow: 0 0 0 3px rgba(17,138,140,0.1);
          }

          .admin-employee-number-note {
            align-self: end;
            min-height: 72px;
            padding: 12px 13px;
            border: 1px dashed rgba(17,138,140,0.22);
            border-radius: 12px;
            background: #f5fbfc;
          }

          .admin-employee-number-note span {
            display: block;
            color: #87999f;
            font-size: 0.64rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.07em;
          }

          .admin-employee-number-note strong {
            display: block;
            margin-top: 4px;
            color: #053f50;
            font-size: 0.78rem;
          }

          .admin-employee-number-note small {
            display: block;
            margin-top: 3px;
            color: #8c9da3;
            font-size: 0.64rem;
            line-height: 1.4;
          }

          .admin-employee-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 22px;
            padding-top: 18px;
            border-top: 1px solid rgba(5,63,80,0.07);
          }

          .admin-employee-modal-footer .admin-primary-button {
            min-width: 180px;
          }

          /* =========================
             DASHBOARD LOWER CARDS
          ========================== */

          .admin-dashboard-grid {
            margin-top: 22px;

            display: grid;

            grid-template-columns:
              minmax(0, 1.55fr)
              minmax(300px, 0.85fr);

            gap: 18px;
          }

          .admin-card {
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

          .admin-card-header {
            padding:
              19px 20px;

            display: flex;
            align-items: center;
            justify-content: space-between;

            border-bottom:
              1px solid
              rgba(5,63,80,0.07);
          }

          .admin-card-header h2 {
            margin: 0;

            color: #053f50;

            font-size: 0.98rem;
          }

          .admin-card-header button {
            border: none;

            color: #118a8c;

            background: transparent;

            cursor: pointer;

            font-size: 0.75rem;

            font-weight: 800;
          }

          .admin-team {
            padding:
              10px 20px 18px;
          }

          .admin-team-member {
            display: flex;
            align-items: center;

            gap: 12px;

            padding:
              13px 0;

            border-bottom:
              1px solid
              rgba(5,63,80,0.06);
          }

          .admin-team-member:last-child {
            border-bottom: none;
          }

          .admin-team-avatar {
            width: 42px;
            height: 42px;

            border-radius: 13px;

            display: grid;
            place-items: center;

            color: #03141f;

            background:
              linear-gradient(
                135deg,
                #29c7c9,
                #8deff0
              );

            font-weight: 900;
          }

          .admin-team-info {
            flex: 1;
          }

          .admin-team-info strong {
            display: block;

            color: #053f50;

            font-size: 0.82rem;
          }

          .admin-team-info span {
            display: block;

            margin-top: 3px;

            color: #88999f;

            font-size: 0.7rem;
          }

          .admin-online {
            width: 8px;
            height: 8px;

            border-radius: 50%;

            background: #23a96f;
          }

          .admin-offline {
            width: 8px;
            height: 8px;

            border-radius: 50%;

            background: #aab8bd;
          }

          /* =========================
             PROFILE
          ========================== */

          .admin-profile-main-card {
            overflow: hidden;

            border: 1px solid rgba(5,63,80,0.07);
            border-radius: 22px;

            background: white;

            box-shadow: 0 15px 42px rgba(5,63,80,0.045);
          }

          .admin-profile-hero {
            padding: 24px 26px;

            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;

            color: white;

            background:
              radial-gradient(
                circle at 88% 20%,
                rgba(41,199,201,0.18),
                transparent 30%
              ),
              linear-gradient(135deg, #053f50, #075d67);
          }

          .admin-profile-hero-copy small {
            display: block;

            color: #8deff0;

            font-size: 0.68rem;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }

          .admin-profile-hero-copy h2 {
            margin: 7px 0 0;

            color: white;
            font-size: 1.45rem;
            letter-spacing: -0.03em;
          }

          .admin-profile-hero-copy p {
            margin: 6px 0 0;

            max-width: 620px;
            color: rgba(255,255,255,0.68);
            font-size: 0.78rem;
            line-height: 1.6;
          }

          .admin-profile-badge {
            flex-shrink: 0;

            padding: 9px 12px;
            border: 1px solid rgba(141,239,240,0.16);
            border-radius: 999px;

            color: #8deff0;
            background: rgba(255,255,255,0.05);

            font-size: 0.66rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .admin-profile-body {
            padding: 26px;

            display: grid;
            grid-template-columns: 190px 1fr;
            gap: 26px;
          }

          .admin-profile-photo-panel {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
          }

          .admin-profile-avatar-large {
            width: 136px;
            height: 136px;

            display: grid;
            place-items: center;

            border-radius: 50%;

            background:
              linear-gradient(135deg, #29c7c9, #8deff0);

            color: #03141f;
            font-size: 2rem;
            font-weight: 900;

            border: 5px solid #eefbfc;
            box-shadow: 0 15px 34px rgba(5,63,80,0.10);
          }

          .admin-profile-photo-caption {
            margin-top: 13px;

            text-align: center;
          }

          .admin-profile-photo-caption strong {
            display: block;
            color: #053f50;
            font-size: 0.9rem;
          }

          .admin-profile-photo-caption span {
            display: block;
            margin-top: 4px;
            color: #899ba1;
            font-size: 0.7rem;
          }

          .admin-profile-information {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 13px;
          }

          .admin-info-card {
            padding: 17px;

            border-radius: 15px;
            background: #f7fbfc;
            border: 1px solid rgba(5,63,80,0.07);

            min-height: 86px;
          }

          .admin-info-card small {
            color: #899ba1;
            font-size: 0.68rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }

          .admin-info-card strong {
            display: block;
            margin-top: 7px;
            color: #053f50;
            font-size: 0.88rem;
            line-height: 1.45;
            word-break: break-word;
          }

          .admin-profile-security {
            margin: 0 26px 26px;

            padding: 18px 20px;

            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;

            border-radius: 16px;
            border: 1px solid rgba(17,138,140,0.10);
            background: rgba(17,138,140,0.05);
          }

          .admin-profile-security-copy strong {
            display: block;
            color: #053f50;
            font-size: 0.82rem;
          }

          .admin-profile-security-copy span {
            display: block;
            margin-top: 4px;
            color: #80939a;
            font-size: 0.7rem;
          }

          .admin-profile-security-status {
            display: inline-flex;
            align-items: center;
            gap: 7px;

            padding: 7px 10px;
            border-radius: 999px;

            color: #117678;
            background: rgba(17,138,140,0.09);

            font-size: 0.67rem;
            font-weight: 800;
          }

          .admin-profile-security-status::before {
            content: "";
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #23a96f;
          }

          .admin-avatar {
            overflow: hidden;
          }

          .admin-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .admin-profile-section-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
          }

          .admin-profile-edit-button {
            flex-shrink: 0;
            border: none;
            border-radius: 10px;
            padding: 10px 16px;
            color: #03141f;
            background: #29c7c9;
            cursor: pointer;
            font-family: inherit;
            font-size: 0.78rem;
            font-weight: 800;
            box-shadow: 0 8px 18px rgba(41,199,201,0.14);
          }

          .admin-profile-edit-button:hover:not(:disabled) {
            transform: translateY(-1px);
          }

          .admin-profile-edit-button:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }

          .admin-profile-avatar-large {
            overflow: hidden;
          }

          .admin-profile-avatar-large img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .admin-profile-photo-actions {
            margin-top: 14px;
            display: grid;
            gap: 8px;
            width: 100%;
            max-width: 160px;
          }

          .admin-profile-photo-button,
          .admin-profile-remove-photo {
            width: 100%;
            border: 1px solid rgba(5,63,80,0.1);
            border-radius: 10px;
            padding: 9px 10px;
            color: #053f50;
            background: #f2fbfc;
            cursor: pointer;
            text-align: center;
            font-family: inherit;
            font-size: 0.72rem;
            font-weight: 800;
          }

          .admin-profile-photo-button:hover,
          .admin-profile-remove-photo:hover:not(:disabled) {
            background: #eaf8fa;
          }

          .admin-profile-remove-photo {
            color: #a33a3a;
            border-color: rgba(163,58,58,0.14);
            background: rgba(163,58,58,0.05);
          }

          .admin-profile-remove-photo:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }

          .admin-profile-edit-form {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }

          .admin-profile-edit-form label {
            display: flex;
            flex-direction: column;
            gap: 7px;
            color: #44616a;
            font-size: 0.78rem;
            font-weight: 750;
          }

          .admin-profile-edit-form input {
            width: 100%;
            border: 1px solid rgba(5,63,80,0.11);
            border-radius: 12px;
            padding: 12px 13px;
            color: #17343e;
            background: white;
            outline: none;
            font-family: inherit;
            font-size: 0.86rem;
          }

          .admin-profile-edit-form input:focus {
            border-color: #118a8c;
            box-shadow: 0 0 0 3px rgba(17,138,140,0.1);
          }

          .admin-profile-edit-full {
            grid-column: 1 / -1;
          }

          .admin-profile-edit-actions {
            grid-column: 1 / -1;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 2px;
          }

          .admin-profile-save-button,
          .admin-profile-cancel-button {
            border-radius: 10px;
            padding: 11px 18px;
            cursor: pointer;
            font-family: inherit;
            font-size: 0.78rem;
            font-weight: 800;
          }

          .admin-profile-save-button {
            border: none;
            color: #03141f;
            background: #29c7c9;
          }

          .admin-profile-cancel-button {
            border: 1px solid rgba(5,63,80,0.12);
            color: #053f50;
            background: #f2fbfc;
          }

          .admin-profile-save-button:disabled,
          .admin-profile-cancel-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          /* =========================
             GENERIC CARDS
          ========================== */

          .admin-mini-grid {
            display: grid;

            grid-template-columns:
              repeat(3, 1fr);

            gap: 14px;
          }

          .admin-mini-card {
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

          .admin-mini-card strong {
            display: block;

            color: #053f50;

            font-size: 0.88rem;
          }

          .admin-mini-card span {
            display: block;

            margin-top: 7px;

            color: #86989e;

            font-size: 0.75rem;

            line-height: 1.5;
          }

          .admin-empty {
            padding: 30px;

            text-align: center;

            color: #87979d;

            border-radius: 16px;

            background: #f8fbfc;
          }

          @media (max-width: 1050px) {
            .admin-employee-stats {
              grid-template-columns: repeat(2, 1fr);
            }

            .admin-employee-modal {
              max-height: 92vh;
            }

            .admin-summary-grid {
              grid-template-columns:
                repeat(2, 1fr);
            }

            .admin-dashboard-grid {
              grid-template-columns: 1fr;
            }

            .admin-profile-body {
              grid-template-columns: 1fr;
            }

            .admin-profile-photo-panel {
              align-items: flex-start;
            }

            .admin-mini-grid {
              grid-template-columns:
                repeat(2, 1fr);
            }
          }

          @media (max-width: 760px) {
            .admin-employee-page-header {
              flex-direction: column;
            }

            .admin-add-employee-button {
              width: 100%;
            }

            .admin-employee-toolbar {
              align-items: stretch;
              flex-direction: column;
            }

            .admin-employee-filter {
              width: 100%;
            }

            .admin-modal-form-grid {
              grid-template-columns: 1fr;
            }

            .admin-employee-modal-header,
            .admin-employee-modal-body {
              padding-left: 20px;
              padding-right: 20px;
            }

            .admin-sidebar {
              position: static;

              width: 100%;

              min-height: auto;
            }

            .admin-layout {
              display: block;
            }

            .admin-main {
              width: 100%;

              margin-left: 0;
            }

            .admin-sidebar-nav {
              grid-template-columns:
                repeat(3, 1fr);
            }

            .admin-sidebar-button {
              justify-content: center;
            }

            .admin-sidebar-icon {
              display: none;
            }

            .admin-content {
              width:
                min(100% - 28px, 1150px);
            }

            .admin-header {
              padding:
                14px 18px;

              align-items: flex-start;

              flex-direction: column;
            }
            .admin-time {
              text-align: left;
            }

            .admin-profile-information {
              grid-template-columns: 1fr;
            }

            .admin-profile-hero {
              align-items: flex-start;
              flex-direction: column;
            }

            .admin-profile-security {
              align-items: flex-start;
              flex-direction: column;
            }

            .admin-profile-section-header {
              align-items: stretch;
              flex-direction: column;
            }

            .admin-profile-edit-button {
              width: 100%;
            }

            .admin-profile-edit-form {
              grid-template-columns: 1fr;
            }

            .admin-profile-edit-full,
            .admin-profile-edit-actions {
              grid-column: auto;
            }

            .admin-profile-save-button,
            .admin-profile-cancel-button {
              flex: 1;
            }

            .admin-profile-photo-actions {
              max-width: 180px;
              align-items: flex-start;
            }

            .admin-mini-grid {
              grid-template-columns: 1fr;
            }

            .admin-section-card {
              padding: 22px;
            }

            .admin-table {
              min-width: 700px;
            }
          }

          @media (max-width: 500px) {
            .admin-employee-stats {
              grid-template-columns: 1fr;
            }

            .admin-employee-tabs {
              flex-direction: column;
            }

            .admin-summary-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="admin-layout">
        {/* SIDEBAR */}

        <aside className="admin-sidebar">
          <div>
            <div className="admin-sidebar-profile">
              <div className="admin-avatar-wrapper">
                <div className="admin-avatar">
                  {adminProfileImageUrl ? (
                    <img
                      src={adminProfileImageUrl}
                      alt="Administrator profile"
                    />
                  ) : (
                    adminInitials
                  )}
                </div>

                <div className="admin-profile-name">
                  <strong>{adminName}</strong>

                  <span>{user?.email ?? "Administrator"}</span>
                </div>

                <div className="admin-role-badge">System Administrator</div>
              </div>
            </div>

            <nav className="admin-sidebar-nav">
              {menuItems.map((item) => (
                <SidebarButton
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={activeSection === item.id}
                  onClick={() => changeSection(item.id)}
                />
              ))}
            </nav>
          </div>

          {/* LOGOUT IS INTENTIONALLY IN THE SIDEBAR */}
          <div className="admin-sidebar-bottom">
            <button
              type="button"
              className="admin-logout"
              onClick={handleLogout}
            >
              <span className="admin-sidebar-icon">🚪</span>
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN */}

        <main className="admin-main">
          <header className="admin-header">
            <div className="admin-header-title">
              <span>Swivel Water</span>

              <strong>{sectionTitle()}</strong>
            </div>

            <div className="admin-time">
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

          <div className="admin-content">
            {message && (
              <div
                style={{
                  marginBottom: "18px",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  background: "#fff4f4",
                  border: "1px solid #ffd4d4",
                  color: "#a33a3a",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                }}
              >
                {message}
              </div>
            )}

            {/* DASHBOARD */}

            {activeSection === "dashboard" && (
              <>
                <section className="admin-welcome">
                  <small>Administration Overview</small>

                  <h1>Welcome back, {adminName} 👋🏽</h1>

                  <p>
                    Manage orders, customers, products, payments, deliveries,
                    employees and business performance from your Swivel Water
                    administration workspace.
                  </p>
                </section>

                <section className="admin-summary-grid">
                  <SummaryCard
                    label="Total Orders"
                    value="24"
                    note="Today's orders"
                  />

                  <SummaryCard
                    label="Today's Revenue"
                    value="R8,450"
                    note="+8.2% today"
                    accent
                  />

                  <SummaryCard
                    label="Active Customers"
                    value="186"
                    note="Registered customers"
                  />

                  <SummaryCard
                    label="Pending Deliveries"
                    value={dashboardData?.summary.pendingDeliveries ?? 0}
                    note="Currently active"
                  />
                </section>

                <section className="admin-dashboard-grid">
                  <div className="admin-card">
                    <div className="admin-card-header">
                      <h2>Recent Orders</h2>

                      <button
                        type="button"
                        onClick={() => changeSection("orders")}
                      >
                        View All
                      </button>
                    </div>

                    <div className="admin-table-wrap">
                      <table className="admin-table">
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
                                <strong className="admin-order-id">
                                  #{order.orderId.slice(0, 8).toUpperCase()}
                                </strong>
                              </td>

                              <td>{order.customerName}</td>

                              <td>{order.orderType}</td>

                              <td>
                                <strong>
                                  R
                                  {order.amount.toLocaleString("en-ZA", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </strong>
                              </td>

                              <td>
                                <span className="admin-status">
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="admin-card">
                    <div className="admin-card-header">
                      <h2>Team Status</h2>

                      <button
                        type="button"
                        onClick={() => changeSection("employees")}
                      >
                        Manage
                      </button>
                    </div>

                    <div className="admin-team">
                      {dashboardData?.teamMembers.map((member) => (
                        <div className="admin-team-member" key={member.name}>
                          <div className="admin-team-avatar">
                            {member.name
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")}
                          </div>

                          <div className="admin-team-info">
                            <strong>{member.name}</strong>

                            <span>{member.role}</span>
                          </div>

                          <div
                            className={
                              member.status === "Online"
                                ? "admin-online"
                                : "admin-offline"
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* ORDERS */}

            {activeSection === "orders" && (
              <section className="admin-section-card">
                <div className="admin-section-card-header">
                  <h1>Orders</h1>

                  <p>Monitor and manage all Swivel Water customer orders.</p>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
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
                            <strong className="admin-order-id">
                              #{order.orderId.slice(0, 8).toUpperCase()}
                            </strong>
                          </td>

                          <td>{order.customerName}</td>

                          <td>{order.orderType}</td>

                          <td>
                            <strong>
                              R
                              {order.amount.toLocaleString("en-ZA", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </strong>
                          </td>

                          <td>
                            <span className="admin-status">{order.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* CUSTOMERS */}
            {activeSection === "customers" && (
              <section className="admin-section-card">
                <div className="admin-section-card-header">
                  <h1>Customers</h1>

                  <p>View registered Swivel Water customer accounts.</p>
                </div>

                <div className="admin-mini-grid">
                  <MiniCard
                    title="Registered Customers"
                    text={`${customers.length} customer account${
                      customers.length === 1 ? "" : "s"
                    } currently registered.`}
                  />

                  <MiniCard
                    title="Active Accounts"
                    text={`${customers.filter((customer) => customer.isActive).length} active customer accounts.`}
                  />

                  <MiniCard
                    title="Customer Records"
                    text="Customer information is loaded directly from the database."
                  />
                </div>

                {customersLoading ? (
                  <div
                    style={{
                      padding: "24px 0",
                      textAlign: "center",
                      color: "#053f50",
                      fontWeight: 700,
                    }}
                  >
                    Loading customers...
                  </div>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Status</th>
                          <th>Joined</th>
                        </tr>
                      </thead>

                      <tbody>
                        {customers.map((customer) => (
                          <tr key={customer.customerId}>
                            <td>
                              <strong>
                                {customer.firstName} {customer.lastName}
                              </strong>
                            </td>

                            <td>{customer.email}</td>

                            <td>{customer.phone}</td>

                            <td>
                              <span className="admin-status">
                                {customer.isActive ? "ACTIVE" : "INACTIVE"}
                              </span>
                            </td>

                            <td>
                              {new Date(customer.createdAt).toLocaleDateString(
                                "en-ZA",
                              )}
                            </td>
                          </tr>
                        ))}

                        {customers.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              style={{ textAlign: "center", padding: "24px" }}
                            >
                              No customer accounts found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
            {/* PRODUCTS */}

            {activeSection === "products" && (
              <section className="admin-section-card">
                <div className="admin-section-card-header">
                  <h1>Products</h1>

                  <p>
                    Manage bottled water, accessories, refills and loyalty
                    products.
                  </p>
                </div>

                <div className="admin-mini-grid">
                  <MiniCard
                    title="Total Products"
                    text={`${products.length} products in the catalogue.`}
                  />

                  <MiniCard
                    title="Active Products"
                    text={`${products.filter((product) => product.isActive).length} active products.`}
                  />

                  <MiniCard
                    title="Catalogue"
                    text="Product information is loaded directly from PostgreSQL."
                  />
                </div>

                {productsLoading ? (
                  <div
                    style={{
                      padding: "24px 0",
                      textAlign: "center",
                      color: "#053f50",
                      fontWeight: 700,
                    }}
                  >
                    Loading products...
                  </div>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Type</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {products.map((product) => (
                          <tr key={product.productId}>
                            <td>
                              <strong>{product.productName}</strong>
                            </td>

                            <td>{product.productType}</td>

                            <td>
                              <strong>
                                R
                                {product.price.toLocaleString("en-ZA", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </strong>
                            </td>

                            <td>{product.stockQuantity}</td>

                            <td>
                              <span className="admin-status">
                                {product.isActive ? "ACTIVE" : "INACTIVE"}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {products.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              style={{ textAlign: "center", padding: "24px" }}
                            >
                              No products found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
            {/* PAYMENTS */}
            {activeSection === "payments" && (
              <section className="admin-section-card">
                <div className="admin-section-card-header">
                  <h1>Payments</h1>

                  <p>Monitor payment activity and transaction status.</p>
                </div>

                <div className="admin-mini-grid">
                  <MiniCard
                    title="Total Payments"
                    text={`${payments.length} payment transaction${
                      payments.length === 1 ? "" : "s"
                    } recorded.`}
                  />

                  <MiniCard
                    title="Paid"
                    text={`${
                      payments.filter(
                        (payment) => payment.paymentStatus === "PAID",
                      ).length
                    } completed payments.`}
                  />

                  <MiniCard
                    title="Pending"
                    text={`${
                      payments.filter(
                        (payment) => payment.paymentStatus === "PENDING",
                      ).length
                    } payments awaiting confirmation.`}
                  />
                </div>

                {paymentsLoading ? (
                  <div
                    style={{
                      padding: "24px 0",
                      textAlign: "center",
                      color: "#053f50",
                      fontWeight: 700,
                    }}
                  >
                    Loading payments...
                  </div>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Order</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Status</th>
                          <th>Transaction</th>
                          <th>Date</th>
                        </tr>
                      </thead>

                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.paymentId}>
                            <td>
                              <strong>{payment.customerName}</strong>
                            </td>

                            <td>
                              #{payment.orderId.slice(0, 8).toUpperCase()}
                            </td>

                            <td>
                              <strong>
                                R
                                {payment.amount.toLocaleString("en-ZA", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </strong>
                            </td>

                            <td>{payment.paymentMethod}</td>

                            <td>
                              <span className="admin-status">
                                {payment.paymentStatus}
                              </span>
                            </td>

                            <td>{payment.transactionReference ?? "—"}</td>

                            <td>
                              {new Date(
                                payment.paymentDate ?? payment.createdAt,
                              ).toLocaleDateString("en-ZA")}
                            </td>
                          </tr>
                        ))}

                        {payments.length === 0 && (
                          <tr>
                            <td
                              colSpan={7}
                              style={{
                                textAlign: "center",
                                padding: "24px",
                              }}
                            >
                              No payment records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
            {/* DELIVERIES */}

            {activeSection === "deliveries" && (
              <section className="admin-section-card">
                <div className="admin-section-card-header">
                  <h1>Deliveries</h1>
                  <p>Monitor delivery operations and driver activity.</p>
                </div>

                <div className="admin-mini-grid">
                  <MiniCard
                    title="Pending Deliveries"
                    text={`${
                      deliveries.filter(
                        (delivery) =>
                          delivery.deliveryStatus !== "OUT_FOR_DELIVERY" &&
                          delivery.deliveryStatus !== "DELIVERED" &&
                          delivery.deliveryStatus !== "CANCELLED",
                      ).length
                    } deliveries are awaiting dispatch.`}
                  />

                  <MiniCard
                    title="Out for Delivery"
                    text={`${
                      deliveries.filter(
                        (delivery) =>
                          delivery.deliveryStatus === "OUT_FOR_DELIVERY",
                      ).length
                    } deliveries are currently with drivers.`}
                  />

                  <MiniCard
                    title="Completed"
                    text={`${
                      deliveries.filter(
                        (delivery) => delivery.deliveryStatus === "DELIVERED",
                      ).length
                    } deliveries have been completed.`}
                  />
                </div>

                <div className="admin-table-wrapper">
                  {deliveriesLoading ? (
                    <p>Loading deliveries...</p>
                  ) : deliveries.length === 0 ? (
                    <p>No deliveries found.</p>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Customer</th>
                          <th>Phone</th>
                          <th>Address</th>
                          <th>Driver</th>
                          <th>Status</th>
                          <th>Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {deliveries.map((delivery) => (
                          <tr key={delivery.deliveryId}>
                            <td>
                              #{delivery.orderId.slice(0, 8).toUpperCase()}
                            </td>

                            <td>{delivery.customerName}</td>

                            <td>{delivery.phone}</td>

                            <td>
                              {delivery.address.addressLine1},{" "}
                              {delivery.address.city}
                            </td>

                            <td>{delivery.driverName || "Unassigned"}</td>

                            <td>
                              <span className="admin-status-badge">
                                {delivery.deliveryStatus}
                              </span>
                            </td>

                            <td>R{delivery.totalAmount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
            {/* EMPLOYEES */}

            {activeSection === "employees" && (
              <>
                <section className="admin-section-card">
                  <div className="admin-section-card-header admin-employee-page-header">
                    <div>
                      <h1>Employees</h1>
                      <p>
                        Manage staff accounts, roles and workforce schedules
                        from one workspace.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="admin-primary-button admin-add-employee-button"
                      onClick={() => {
                        setMessage("");
                        setShowEmployeeModal(true);
                      }}
                    >
                      + Add Employee
                    </button>
                  </div>

                  <div className="admin-employee-stats">
                    <div className="admin-employee-stat">
                      <span>Total Staff</span>
                      <strong>{employees.length}</strong>
                      <small>All employee records</small>
                    </div>

                    <div className="admin-employee-stat">
                      <span>Active</span>
                      <strong>
                        {
                          employees.filter((employee) => employee.isActive)
                            .length
                        }
                      </strong>
                      <small>Active employee accounts</small>
                    </div>

                    <div className="admin-employee-stat">
                      <span>On Duty</span>
                      <strong>
                        {
                          employees.filter((employee) => employee.isOnDuty)
                            .length
                        }
                      </strong>
                      <small>Currently on shift</small>
                    </div>

                    <div className="admin-employee-stat">
                      <span>Drivers</span>
                      <strong>
                        {
                          employees.filter(
                            (employee) => employee.role === "DRIVER",
                          ).length
                        }
                      </strong>
                      <small>Delivery staff</small>
                    </div>
                  </div>

                  <div className="admin-employee-tabs">
                    <button
                      type="button"
                      className={`admin-employee-tab ${
                        employeeTab === "TEAM" ? "active" : ""
                      }`}
                      onClick={() => setEmployeeTab("TEAM")}
                    >
                      Team Members
                    </button>

                    <button
                      type="button"
                      className={`admin-employee-tab ${
                        employeeTab === "SHIFTS" ? "active" : ""
                      }`}
                      onClick={() => setEmployeeTab("SHIFTS")}
                    >
                      Shift Schedule
                    </button>
                  </div>

                  {employeeTab === "TEAM" ? (
                    <div className="admin-employee-workspace">
                      <div className="admin-employee-toolbar">
                        <div className="admin-employee-search">
                          <span>⌕</span>
                          <input
                            type="text"
                            value={employeeSearch}
                            onChange={(event) =>
                              setEmployeeSearch(event.target.value)
                            }
                            placeholder="Search by name, employee number or phone"
                          />
                        </div>

                        <select
                          value={employeeRoleFilter}
                          onChange={(event) =>
                            setEmployeeRoleFilter(
                              event.target.value as
                                "ALL" | "EMPLOYEE" | "DRIVER",
                            )
                          }
                          className="admin-employee-filter"
                        >
                          <option value="ALL">All Roles</option>
                          <option value="EMPLOYEE">Employees</option>
                          <option value="DRIVER">Drivers</option>
                        </select>
                      </div>

                      {employeesLoading ? (
                        <div className="admin-report-loading">
                          Loading employees...
                        </div>
                      ) : filteredEmployees.length === 0 ? (
                        <div className="admin-empty">
                          {employees.length === 0
                            ? "No employees have been created yet."
                            : "No employees match your search or role filter."}
                        </div>
                      ) : (
                        <div className="admin-table-wrap">
                          <table className="admin-table admin-employee-table">
                            <thead>
                              <tr>
                                <th>Employee</th>
                                <th>Employee No.</th>
                                <th>Role</th>
                                <th>Phone</th>
                                <th>Duty Status</th>
                                <th>Account</th>
                              </tr>
                            </thead>

                            <tbody>
                              {filteredEmployees.map((employee) => (
                                <tr key={employee.employeeId}>
                                  <td>
                                    <div className="admin-employee-name-cell">
                                      <div className="admin-team-avatar">
                                        {`${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase()}
                                      </div>
                                      <div>
                                        <strong>
                                          {employee.firstName}{" "}
                                          {employee.lastName}
                                        </strong>
                                        <span>
                                          {employee.role === "DRIVER"
                                            ? "Delivery Driver"
                                            : "Staff Member"}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  <td>
                                    <strong className="admin-order-id">
                                      {employee.employeeNumber}
                                    </strong>
                                  </td>

                                  <td>{employee.role}</td>

                                  <td>{employee.phone}</td>

                                  <td>
                                    <span
                                      className={
                                        employee.isOnDuty
                                          ? "admin-online admin-employee-duty"
                                          : "admin-offline admin-employee-duty"
                                      }
                                    >
                                      <span className="admin-employee-duty-dot" />
                                      {employee.isOnDuty
                                        ? "On Duty"
                                        : "Off Duty"}
                                    </span>
                                  </td>

                                  <td>
                                    <span
                                      className={
                                        employee.isActive
                                          ? "admin-status"
                                          : "admin-status admin-inactive-status"
                                      }
                                    >
                                      {employee.isActive
                                        ? "Active"
                                        : "Inactive"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="admin-employee-workspace">
                      {/* SCHEDULE EMPLOYEE SHIFT */}
                      <div className="admin-card">
                        <div className="admin-card-header">
                          <div>
                            <h2>
                              {editingShiftId
                                ? "Edit Shift"
                                : "Schedule Employee Shift"}
                            </h2>
                            <span className="admin-card-subtitle">
                              Assign a working period to an active employee.
                            </span>
                          </div>
                        </div>

                        <div className="admin-shift-form">
                          <label>
                            Employee
                            <select
                              value={selectedEmployeeId}
                              onChange={(event) =>
                                setSelectedEmployeeId(event.target.value)
                              }
                            >
                              <option value="">Select employee</option>

                              {employees
                                .filter((employee) => employee.isActive)
                                .map((employee) => (
                                  <option
                                    key={employee.employeeId}
                                    value={employee.employeeId}
                                  >
                                    {employee.firstName} {employee.lastName} —{" "}
                                    {employee.employeeNumber}
                                  </option>
                                ))}
                            </select>
                          </label>

                          <label>
                            Shift Start
                            <input
                              type="datetime-local"
                              value={shiftStart}
                              onChange={(event) =>
                                setShiftStart(event.target.value)
                              }
                            />
                          </label>

                          <label>
                            Shift End
                            <input
                              type="datetime-local"
                              value={shiftEnd}
                              onChange={(event) =>
                                setShiftEnd(event.target.value)
                              }
                            />
                          </label>

                          <label>
                            Notes
                            <textarea
                              value={shiftNotes}
                              onChange={(event) =>
                                setShiftNotes(event.target.value)
                              }
                              placeholder="Optional shift notes"
                              rows={3}
                            />
                          </label>

                          <div className="admin-shift-actions">
                            <button
                              type="button"
                              className="admin-primary-button"
                              onClick={handleSaveShift}
                              disabled={savingShift}
                            >
                              {savingShift
                                ? editingShiftId
                                  ? "Updating..."
                                  : "Scheduling..."
                                : editingShiftId
                                  ? "Update Shift"
                                  : "Schedule Shift"}
                            </button>

                            {editingShiftId && (
                              <button
                                type="button"
                                className="admin-secondary-button"
                                onClick={handleCancelEditShift}
                                disabled={savingShift}
                              >
                                Cancel Edit
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* SCHEDULED SHIFTS */}
                      <div className="admin-card admin-shifts-list-card">
                        <div className="admin-card-header">
                          <div>
                            <h2>Scheduled Shifts</h2>
                            <span className="admin-card-subtitle">
                              Review, edit or cancel scheduled working periods.
                            </span>
                          </div>
                          <span className="admin-section-count">
                            {employeeShifts.length} shifts
                          </span>
                        </div>

                        {employeeShiftsLoading ? (
                          <p style={{ padding: "20px" }}>Loading shifts...</p>
                        ) : employeeShifts.length === 0 ? (
                          <p style={{ padding: "20px" }}>
                            No employee shifts have been scheduled.
                          </p>
                        ) : (
                          <div className="admin-table-wrap">
                            <table className="admin-table">
                              <thead>
                                <tr>
                                  <th>Employee</th>
                                  <th>Employee No.</th>
                                  <th>Role</th>
                                  <th>Shift Start</th>
                                  <th>Shift End</th>
                                  <th>Status</th>
                                  <th>Notes</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>

                              <tbody>
                                {employeeShifts.map((shift) => (
                                  <tr key={shift.employeeShiftId}>
                                    <td>
                                      <strong>{shift.employeeName}</strong>
                                    </td>

                                    <td>{shift.employeeNumber}</td>

                                    <td>{shift.employeeRole}</td>

                                    <td>
                                      {new Date(
                                        shift.shiftStart,
                                      ).toLocaleString("en-ZA", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                      })}
                                    </td>

                                    <td>
                                      {new Date(shift.shiftEnd).toLocaleString(
                                        "en-ZA",
                                        {
                                          dateStyle: "medium",
                                          timeStyle: "short",
                                        },
                                      )}
                                    </td>

                                    <td>
                                      <span className="admin-status">
                                        {shift.status}
                                      </span>
                                    </td>

                                    <td>{shift.notes || "—"}</td>

                                    <td>
                                      <div className="admin-shift-row-actions">
                                        <button
                                          type="button"
                                          className="admin-edit-button"
                                          onClick={() => handleEditShift(shift)}
                                        >
                                          Edit
                                        </button>

                                        {shift.status !== "CANCELLED" && (
                                          <button
                                            type="button"
                                            className="admin-cancel-button"
                                            onClick={() =>
                                              handleCancelShift(
                                                shift.employeeShiftId,
                                              )
                                            }
                                          >
                                            Cancel
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </section>

                {showEmployeeModal && (
                  <div
                    className="admin-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                      if (event.target === event.currentTarget) {
                        closeEmployeeModal();
                      }
                    }}
                  >
                    <div
                      className="admin-employee-modal"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="add-employee-title"
                    >
                      <div className="admin-employee-modal-header">
                        <div>
                          <span className="admin-modal-eyebrow">
                            STAFF MANAGEMENT
                          </span>
                          <h2 id="add-employee-title">Add New Employee</h2>
                          <p>
                            Create a staff account and assign their system role.
                          </p>
                        </div>

                        <button
                          type="button"
                          className="admin-modal-close"
                          onClick={closeEmployeeModal}
                          disabled={creatingEmployee}
                          aria-label="Close"
                        >
                          ×
                        </button>
                      </div>

                      <div className="admin-employee-modal-body">
                        <div className="admin-modal-form-grid">
                          <label>
                            First Name
                            <input
                              type="text"
                              value={newEmployee.firstName}
                              onChange={(event) =>
                                setNewEmployee((current) => ({
                                  ...current,
                                  firstName: event.target.value,
                                }))
                              }
                              placeholder="Enter first name"
                            />
                          </label>

                          <label>
                            Last Name
                            <input
                              type="text"
                              value={newEmployee.lastName}
                              onChange={(event) =>
                                setNewEmployee((current) => ({
                                  ...current,
                                  lastName: event.target.value,
                                }))
                              }
                              placeholder="Enter last name"
                            />
                          </label>

                          <label>
                            Email Address
                            <input
                              type="email"
                              value={newEmployee.email}
                              onChange={(event) =>
                                setNewEmployee((current) => ({
                                  ...current,
                                  email: event.target.value,
                                }))
                              }
                              placeholder="employee@example.com"
                            />
                          </label>

                          <label>
                            Phone Number
                            <input
                              type="tel"
                              value={newEmployee.phone}
                              onChange={(event) =>
                                setNewEmployee((current) => ({
                                  ...current,
                                  phone: event.target.value,
                                }))
                              }
                              placeholder="Enter phone number"
                            />
                          </label>

                          <label>
                            Employee Role
                            <select
                              value={newEmployee.employeeRole}
                              onChange={(event) =>
                                setNewEmployee((current) => ({
                                  ...current,
                                  employeeRole: event.target.value,
                                }))
                              }
                            >
                              <option value="EMPLOYEE">Employee</option>
                              <option value="DRIVER">Driver</option>
                            </select>
                          </label>

                          <div className="admin-employee-number-note">
                            <span>Employee Number</span>
                            <strong>Generated automatically</strong>
                            <small>
                              The system assigns the employee number after
                              creation.
                            </small>
                          </div>

                          <label>
                            Password
                            <input
                              type="password"
                              value={newEmployee.password}
                              onChange={(event) =>
                                setNewEmployee((current) => ({
                                  ...current,
                                  password: event.target.value,
                                }))
                              }
                              placeholder="Create a password"
                            />
                          </label>

                          <label>
                            Confirm Password
                            <input
                              type="password"
                              value={newEmployee.confirmPassword}
                              onChange={(event) =>
                                setNewEmployee((current) => ({
                                  ...current,
                                  confirmPassword: event.target.value,
                                }))
                              }
                              placeholder="Repeat the password"
                            />
                          </label>
                        </div>

                        <div className="admin-employee-modal-footer">
                          <button
                            type="button"
                            className="admin-secondary-button"
                            onClick={closeEmployeeModal}
                            disabled={creatingEmployee}
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            className="admin-primary-button"
                            onClick={handleCreateEmployee}
                            disabled={creatingEmployee}
                          >
                            {creatingEmployee
                              ? "Creating Employee..."
                              : "Create Employee"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* REPORTS */}

            {activeSection === "reports" && (
              <section className="admin-section-card">
                <div className="admin-section-card-header">
                  <div>
                    <h1>Reports</h1>

                    <p>
                      Review Swivel Water sales, deliveries and inventory
                      performance.
                    </p>
                  </div>
                </div>

                {/* REPORT PERIOD */}
                <div className="admin-report-toolbar">
                  <div>
                    <span className="admin-report-label">Report Period</span>

                    <strong>
                      {reportPeriod === "TODAY"
                        ? "Today"
                        : reportPeriod === "WEEK"
                          ? "This Week"
                          : reportPeriod === "MONTH"
                            ? "This Month"
                            : reportPeriod === "YEAR"
                              ? "This Year"
                              : "All Time"}
                    </strong>
                  </div>

                  <select
                    value={reportPeriod}
                    onChange={(event) =>
                      setReportPeriod(
                        event.target.value as
                          "TODAY" | "WEEK" | "MONTH" | "YEAR" | "ALL",
                      )
                    }
                  >
                    <option value="TODAY">Today</option>
                    <option value="WEEK">This Week</option>
                    <option value="MONTH">This Month</option>
                    <option value="YEAR">This Year</option>
                    <option value="ALL">All Time</option>
                  </select>
                </div>

                {reportsLoading ? (
                  <div className="admin-report-loading">
                    Loading report data...
                  </div>
                ) : reports ? (
                  <>
                    {/* SALES SUMMARY */}
                    <div className="admin-mini-grid">
                      <MiniCard
                        title="Total Orders"
                        text={`${reports.sales.totalOrders} orders in this period.`}
                      />

                      <MiniCard
                        title="Completed Orders"
                        text={`${reports.sales.completedOrders} completed orders.`}
                      />

                      <MiniCard
                        title="Gross Sales"
                        text={`R${reports.sales.grossSales.toLocaleString(
                          "en-ZA",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}`}
                      />

                      <MiniCard
                        title="Average Order"
                        text={`R${reports.sales.averageCompletedOrderValue.toLocaleString(
                          "en-ZA",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )} per completed order.`}
                      />
                    </div>

                    {/* SALES + DELIVERY */}
                    <div className="admin-dashboard-grid">
                      <div className="admin-card">
                        <div className="admin-card-header">
                          <h2>Sales Breakdown</h2>
                        </div>

                        <div className="admin-report-list">
                          {reports.sales.salesByOrderType.map((item) => (
                            <div
                              className="admin-report-row"
                              key={item.orderType}
                            >
                              <div>
                                <strong>{item.orderType}</strong>
                                <span>Sales</span>
                              </div>

                              <strong>
                                R
                                {item.sales.toLocaleString("en-ZA", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </strong>
                            </div>
                          ))}

                          <div className="admin-report-row">
                            <div>
                              <strong>Cancelled Orders</strong>
                              <span>Orders cancelled during period</span>
                            </div>

                            <strong>{reports.sales.cancelledOrders}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="admin-card">
                        <div className="admin-card-header">
                          <h2>Delivery Performance</h2>
                        </div>

                        <div className="admin-report-list">
                          <div className="admin-report-row">
                            <div>
                              <strong>Total Deliveries</strong>
                              <span>Delivery orders</span>
                            </div>

                            <strong>
                              {reports.deliveries.totalDeliveries}
                            </strong>
                          </div>

                          <div className="admin-report-row">
                            <div>
                              <strong>Delivered</strong>
                              <span>Successfully completed</span>
                            </div>

                            <strong>
                              {reports.deliveries.deliveredDeliveries}
                            </strong>
                          </div>

                          <div className="admin-report-row">
                            <div>
                              <strong>Out for Delivery</strong>
                              <span>Currently with drivers</span>
                            </div>

                            <strong>{reports.deliveries.outForDelivery}</strong>
                          </div>

                          <div className="admin-report-row">
                            <div>
                              <strong>Pending</strong>
                              <span>Awaiting delivery</span>
                            </div>

                            <strong>
                              {reports.deliveries.pendingDeliveries}
                            </strong>
                          </div>

                          <div className="admin-report-row">
                            <div>
                              <strong>Completion Rate</strong>
                              <span>Delivered / total</span>
                            </div>

                            <strong>
                              {reports.deliveries.deliveryCompletionRate}%
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TOP PRODUCTS */}
                    <div className="admin-card admin-report-card-spacing">
                      <div className="admin-card-header">
                        <h2>Top Products</h2>
                      </div>

                      <div className="admin-table-wrap">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Quantity Sold</th>
                              <th>Sales</th>
                            </tr>
                          </thead>

                          <tbody>
                            {reports.topProducts.map((product) => (
                              <tr key={product.productId}>
                                <td>
                                  <strong>{product.productName}</strong>
                                </td>

                                <td>{product.quantitySold}</td>

                                <td>
                                  <strong>
                                    R
                                    {product.sales.toLocaleString("en-ZA", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </strong>
                                </td>
                              </tr>
                            ))}

                            {reports.topProducts.length === 0 && (
                              <tr>
                                <td
                                  colSpan={3}
                                  style={{
                                    textAlign: "center",
                                    padding: "24px",
                                  }}
                                >
                                  No completed product sales found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* INVENTORY */}
                    <div className="admin-dashboard-grid">
                      <div className="admin-card">
                        <div className="admin-card-header">
                          <h2>Inventory Overview</h2>
                        </div>

                        <div className="admin-report-list">
                          <div className="admin-report-row">
                            <div>
                              <strong>Active Products</strong>
                              <span>Products currently active</span>
                            </div>

                            <strong>{reports.inventory.activeProducts}</strong>
                          </div>

                          <div className="admin-report-row">
                            <div>
                              <strong>Bottled Units</strong>
                              <span>Total bottled stock</span>
                            </div>

                            <strong>{reports.inventory.bottledUnits}</strong>
                          </div>

                          <div className="admin-report-row">
                            <div>
                              <strong>Refill Litres</strong>
                              <span>Available refill stock</span>
                            </div>

                            <strong>{reports.inventory.refillLitres} L</strong>
                          </div>
                        </div>
                      </div>

                      <div className="admin-card">
                        <div className="admin-card-header">
                          <h2>Low Stock</h2>
                        </div>

                        <div className="admin-report-list">
                          {reports.inventory.lowStockProducts.length === 0 ? (
                            <div className="admin-report-empty">
                              No low-stock products.
                            </div>
                          ) : (
                            reports.inventory.lowStockProducts.map(
                              (product) => (
                                <div
                                  className="admin-report-row"
                                  key={product.productId}
                                >
                                  <div>
                                    <strong>{product.productName}</strong>
                                    <span>{product.productType}</span>
                                  </div>

                                  <strong>{product.stockQuantity}</strong>
                                </div>
                              ),
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* CUSTOMER SUMMARY */}
                    <div className="admin-mini-grid admin-report-card-spacing">
                      <MiniCard
                        title="Registered Customers"
                        text={`${reports.registeredCustomers} customer accounts.`}
                      />

                      <MiniCard
                        title="Completed Sales"
                        text={`${reports.sales.completedOrders} completed orders.`}
                      />

                      <MiniCard
                        title="Cancelled Sales"
                        text={`${reports.sales.cancelledOrders} cancelled orders.`}
                      />
                    </div>
                  </>
                ) : (
                  <div className="admin-report-empty">
                    No report data available.
                  </div>
                )}
              </section>
            )}
            {/* PROFILE */}

            {activeSection === "profile" && (
              <section className="admin-section-card">
                <div className="admin-section-card-header admin-profile-section-header">
                  <div>
                    <h1>My Profile</h1>

                    <p>
                      View and manage your administrator account information and
                      profile photo.
                    </p>
                  </div>

                  {!isEditingProfile && (
                    <button
                      type="button"
                      className="admin-profile-edit-button"
                      onClick={handleEditProfile}
                      disabled={!profile}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                <div className="admin-profile-main-card">
                  <div className="admin-profile-hero">
                    <div className="admin-profile-hero-copy">
                      <small>Administrator Account</small>
                      <h2>{adminName}</h2>
                      <p>
                        Your Swivel Water administration profile and system
                        access information.
                      </p>
                    </div>

                    <div className="admin-profile-badge">
                      System Administrator
                    </div>
                  </div>

                  <div className="admin-profile-body">
                    <div className="admin-profile-photo-panel">
                      <div className="admin-profile-avatar-large">
                        {adminProfileImageUrl ? (
                          <img
                            src={adminProfileImageUrl}
                            alt="Administrator profile"
                          />
                        ) : (
                          adminInitials
                        )}
                      </div>

                      <div className="admin-profile-photo-actions">
                        <label className="admin-profile-photo-button">
                          {uploadingProfileImage
                            ? "Uploading..."
                            : "Edit Profile Photo"}

                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            hidden
                            disabled={uploadingProfileImage}
                            onChange={handleAdminProfileImageChange}
                          />
                        </label>

                        {profile?.profileImageUrl && (
                          <button
                            type="button"
                            className="admin-profile-remove-photo"
                            disabled={uploadingProfileImage}
                            onClick={handleDeleteAdminProfileImage}
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>

                      <div className="admin-profile-photo-caption">
                        <strong>Administrator</strong>
                        <span>Profile photo</span>
                      </div>
                    </div>

                    <div className="admin-profile-information">
                      {!isEditingProfile ? (
                        <>
                          <div className="admin-info-card">
                            <small>First Name</small>
                            <strong>
                              {profile?.firstName || "Not provided"}
                            </strong>
                          </div>

                          <div className="admin-info-card">
                            <small>Last Name</small>
                            <strong>
                              {profile?.lastName || "Not provided"}
                            </strong>
                          </div>

                          <div className="admin-info-card">
                            <small>Email</small>
                            <strong>
                              {profile?.email || user?.email || "Not available"}
                            </strong>
                          </div>

                          <div className="admin-info-card">
                            <small>Phone</small>
                            <strong>{profile?.phone || "Not provided"}</strong>
                          </div>

                          <div className="admin-info-card">
                            <small>Staff Number</small>
                            <strong>
                              {profile?.employeeNumber || "Not provided"}
                            </strong>
                          </div>

                          <div className="admin-info-card">
                            <small>Role</small>
                            <strong>
                              {profile?.employeeRole || user?.role || "ADMIN"}
                            </strong>
                          </div>
                        </>
                      ) : (
                        <div className="admin-profile-edit-form">
                          <label>
                            First Name
                            <input
                              type="text"
                              value={editFirstName}
                              onChange={(event) =>
                                setEditFirstName(event.target.value)
                              }
                            />
                          </label>

                          <label>
                            Last Name
                            <input
                              type="text"
                              value={editLastName}
                              onChange={(event) =>
                                setEditLastName(event.target.value)
                              }
                            />
                          </label>

                          <label className="admin-profile-edit-full">
                            Phone
                            <input
                              type="text"
                              value={editPhone}
                              onChange={(event) =>
                                setEditPhone(event.target.value)
                              }
                            />
                          </label>

                          <div className="admin-profile-edit-actions">
                            <button
                              type="button"
                              className="admin-profile-save-button"
                              onClick={handleSaveProfile}
                              disabled={savingProfile}
                            >
                              {savingProfile ? "Saving..." : "Save Changes"}
                            </button>

                            <button
                              type="button"
                              className="admin-profile-cancel-button"
                              onClick={handleCancelEditProfile}
                              disabled={savingProfile}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="admin-profile-security">
                    <div className="admin-profile-security-copy">
                      <strong>Account Status</strong>
                      <span>
                        Your administrator account is currently active and
                        signed in.
                      </span>
                    </div>

                    <div className="admin-profile-security-status">
                      Active Account
                    </div>
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
      className={`admin-sidebar-button ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span className="admin-sidebar-icon">{icon}</span>

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
    <div className="admin-summary-card">
      <span>{label}</span>

      <strong className={accent ? "admin-summary-accent" : ""}>{value}</strong>

      <small>{note}</small>
    </div>
  );
}

function MiniCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="admin-mini-card">
      <strong>{title}</strong>

      <span>{text}</span>
    </div>
  );
}

export default AdminDashboard;
