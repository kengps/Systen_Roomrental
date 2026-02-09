import React from "react";



// Route Constants
export const ROUTES = {
    AUTH: '/auth',
    ADMIN: '/admin',
    MEMBER: '/member',
    HOME: '/homepage',
    LOGIN: '/auth/login',
    NOT_FOUND: '/404'
};

// Lazy load all components for better performance
const HomePage = React.lazy(() => import("./pages/HomePage"));
const PageNotFound = React.lazy(() => import("./pages/404/PageNotFound"));
const AdminPages = React.lazy(() => import("./pages/admin/Admin"));
const MemberPage = React.lazy(() => import('./pages/member/Member'));

// Auth components
const IndexForm = React.lazy(() => import("./pages/login/Index"));

// Admin components
const BankAccountPage = React.lazy(() => import("./pages/admin/apartment/BankAccountPage"));
const MetersPages = React.lazy(() => import("./pages/admin/apartment/Meters"));
const SettingApartment = React.lazy(() => import("./pages/admin/apartment/SettingApartment"));
const ManageServicesPage = React.lazy(() => import("./pages/admin/apartment/SevicesPage"));
const TenantManagementPage = React.lazy(() => import("./pages/admin/apartment/TenantManagementPage"));
const BillingSystem = React.lazy(() => import("./pages/admin/bill/BillingPage"));
const PaymentsPage = React.lazy(() => import("./pages/admin/bill/PaymentsPage"));
const CreateRoom = React.lazy(() => import("./pages/admin/CreateRoom"));
const ListRoom = React.lazy(() => import("./pages/admin/ListRoom"));
const StepperForm = React.lazy(() => import("./pages/admin/StepperForm/StepperForm"));
const AddUserPage = React.lazy(() => import("./pages/admin/setting/AddUser"));
const ListRoomChangeUnitPage = React.lazy(() => import("./pages/admin/setting/ListRoomChangeUnit"));
const ManageUserPage = React.lazy(() => import("./pages/admin/setting/ManageUser"));
const RentalContractPage = React.lazy(() => import("./pages/admin/apartment/RentalContractPage"));

// Member components
const History = React.lazy(() => import("./pages/member/history/History"));
const ApartmentInformations = React.lazy(() => import("./pages/member/informations/InformationsPage"));
const PayMent = React.lazy(() => import("./pages/member/payments/PayMent"));

// Utility components
const LoadingSpinner = React.lazy(() => import("./components/LoadingSpinner/LoadingSpinner"));
const ProtectedRoutes = React.lazy(() => import("./routes/ProtectedRoutes"));
const AdminRoutes = React.lazy(() => import("./routes/AdminRoutes"));
const MemberRoutes = React.lazy(() => import("./routes/MemberRoutes"));
const NavigateToDb = React.lazy(() => import("./utilities/Navigate/NavigateToDb"));
// const RedirectToDashboard = () => {
//     return <Navigate to="/admin/dashboard" replace />;
// };

const BotTelegram = React.lazy(() => import("./pages/admin/apartment/BotTelegram"));

const GetUpdateLog = React.lazy(() => import("./pages/admin/setting/GetUpdateLog"));


// Route configuration objects
const adminRouteConfig = [
    { path: 'leaseAgreement', title: 'RentalContract', element: RentalContractPage },
    { path: 'addroom', title: 'CreateRoom', element: CreateRoom },
    { path: 'listroom', title: 'ListRoom', element: ListRoom },
    { path: 'tenantManagement', title: 'TenantManagement', element: TenantManagementPage },
    { path: 'stepper', title: 'stepper', element: StepperForm },
    { path: 'setting', title: 'Setting', element: SettingApartment },
    { path: 'billing', title: 'Billing', element: BillingSystem },
    { path: 'payment', title: 'Payment', element: PaymentsPage },
    { path: 'payment/:id', title: 'Payment', element: PaymentsPage },
    { path: 'unitMeter', title: 'meters', element: ListRoomChangeUnitPage },
    { path: 'meters', title: 'meters', element: MetersPages },
    { path: 'manageUser', title: 'manageUser', element: ManageUserPage },
    { path: 'sevices', title: 'sevices', element: ManageServicesPage },
    { path: 'bank', title: 'bank', element: BankAccountPage },
    { path: 'addUser', title: 'addUser', element: AddUserPage },
    { path: 'botTelegram', title: 'botTelegram', element: BotTelegram },
    { path: 'log', title: 'log', element: GetUpdateLog },
    { path: '*', element: PageNotFound },
];

const memberRouteConfig = [
    { path: 'bills', title: 'bills', element: PayMent },
    { path: 'bills/:id', title: 'bills', element: PayMent },
    { path: 'history', title: 'History', element: History },
    { path: 'stepper2', title: 'stepper2', element: StepperForm },
    { path: 'apartmentInformations', title: 'apartmentInformations', element: ApartmentInformations },
    { path: '*', element: PageNotFound },
];

// Unified route creator function
const createRoute = (path, title, element, children) => ({
    path,
    title,
    element,
    children: children || []
});

// Route creators
const createAdminRoute = (path, title) => createRoute(path, title, AdminPages, adminRouteConfig);
const createUserRoute = (path, title) => createRoute(path, title, MemberPage, memberRouteConfig);

// Main routes configuration
const routes = [
    // Auth routes
    { path: ROUTES.LOGIN, element: IndexForm },
    { path: '/test/loading', element: LoadingSpinner },

    // Protected routes
    {
        element: ProtectedRoutes,
        children: [
            { path: ROUTES.HOME, element: HomePage },
            { path: ROUTES.NOT_FOUND, element: PageNotFound },
        ],
    },

    // Admin routes
    {
        element: AdminRoutes,
        children: [
            { index: true, element: NavigateToDb },
            createAdminRoute('/admin/dashboard', 'Dashboard'),
            createAdminRoute('/setting', 'Setting'),
            createAdminRoute('/system', 'System'),
            createAdminRoute('/apartment', 'Apartment'),
            { path: '*', element: PageNotFound }
        ],
    },

    // Member routes
    {
        element: MemberRoutes,
        children: [
            { index: true, element: NavigateToDb },
            createUserRoute('/member/homepage', 'HomePage'),
            createUserRoute('/member/listbills', 'Payments'),
            { path: '*', element: PageNotFound }
        ],
    },

    // Catch-all route
    { path: '*', element: ProtectedRoutes },
];

export default routes;