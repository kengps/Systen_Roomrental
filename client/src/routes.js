import React from "react";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";
import BankAccountPage from "./pages/admin/apartment/BankAccountPage";
import MetersPages from "./pages/admin/apartment/Meters";
import SettingApartment from "./pages/admin/apartment/SettingApartment";
import ManageServicesPage from "./pages/admin/apartment/SevicesPage";
import TenantManagementPage from "./pages/admin/apartment/TenantManagementPage";
import BillingSystem from "./pages/admin/bill/BillingPage";
import DormBillingSystem from "./pages/admin/bill/BillPage";
import CreateRoom from "./pages/admin/CreateRoom";
import ListRoom from "./pages/admin/ListRoom";
import StepperForm from "./pages/admin/StepperForm/StepperForm";
import IndexForm from "./pages/login/Index";
import History from "./pages/member/history/History";
import ApartmentInformations from "./pages/member/informations/InformationsPage";
import { PayMent } from "./pages/member/payments/PayMent";



// import NavigateToDb from "./utilities/Navigate/NavigateToDb";

// Lazy load components
const HomePage = React.lazy(() => import("./pages/HomePage"));
const PageNotFound = React.lazy(() => import("./pages/404/PageNotFound"));
const AdminPages = React.lazy(() => import("./pages/admin/Admin"));
const TableAdmin = React.lazy(() => import("./pages/admin/Table"));
const MemberPage = React.lazy(() => import('./pages/member/Member'));

const ProtectedRoutes = React.lazy(() => import("./routes/ProtectedRoutes"));
const AdminRoutes = React.lazy(() => import("./routes/AdminRoutes"));
const MemberRoutes = React.lazy(() => import("./routes/MemberRoutes"));
const NavigateToDb = React.lazy(() => import("./utilities/Navigate/NavigateToDb"));
// const RedirectToDashboard = () => {
//     return <Navigate to="/admin/dashboard" replace />;
// };


const createAdminRoute = (path, title) => ({ //* Utility function to create admin routes
    path,
    title,
    element: AdminPages,
    children: [
        { path: 'addroom', title: 'CreateRoom', element: CreateRoom },
        { path: 'listroom', title: 'ListRoom', element: ListRoom },
        { path: 'tenantManagement', title: 'TenantManagement', element: TenantManagementPage },
        { path: 'stepper', title: 'stepper', element: StepperForm },
        { path: 'setting', title: 'Setting', element: SettingApartment },
        { path: 'billing', title: 'Billing', element: BillingSystem },
        { path: 'payment', title: 'Payment', element: DormBillingSystem },
        { path: 'meters', title: 'meters', element: MetersPages },
        { path: 'sevices', title: 'sevices', element: ManageServicesPage },
        { path: 'bank', title: 'bank', element: BankAccountPage },
        { path: '*', element: PageNotFound },
    ],
});
const createUserRoute = (path, title) => ({ //* Utility function to create admin routes
    path,
    title,
    element: MemberPage,
    children: [
        { path: 'bill', title: 'Bill', element: PayMent },
        {
            path: 'history', title: 'History', element: History
        },
        { path: 'stepper2', title: 'stepper2', element: StepperForm },
        { path: 'apartmentInformations', title: 'apartmentInformations', element: ApartmentInformations },
        { path: '*', element: PageNotFound },
    ],
});

const routes = [
    // Protected routes
    { path: '/auth/login', element: IndexForm },
    { path: '/test/loading', element: LoadingSpinner },
    {
        // path: '/',
        element: ProtectedRoutes,
        children: [
            { path: '/homepage', element: HomePage }, // HomePage at root
            { path: '/404', element: PageNotFound }, // PageNotFound route
        ],
    },

    // Admin routes
    {

        element: AdminRoutes, //* AdminRoutes should handle rendering child routes
        children: [
            { index: true, element: NavigateToDb },
            createAdminRoute('/admin/dashboard', 'Dashboard'),//! ถ้าเอา // path: '/admin' กลับมาใช้ ตรงนี้ไม่ต้องมี / เพราะมันจะถือว่าเป็น child
            createAdminRoute('/setting', 'Setting'),
            createAdminRoute('/system', 'System'),
            createAdminRoute('/apartment', 'apartment'),

            { path: '*', element: PageNotFound }
        ],
    },
    // { path: '*', element: PageNotFound },

    // Member routes
    {
        // path: '/member',
        element: MemberRoutes,
        children: [
            { index: true, element: NavigateToDb },
            createUserRoute('/member/homepage', 'HomePage'),//! ถ้าเอา // path: '/admin' กลับมาใช้ ตรงนี้ไม่ต้องมี / เพราะมันจะถือว่าเป็น child
            createUserRoute('/member/payments', 'Payments'),//! ถ้าเอา // path: '/admin' กลับมาใช้ 
            // createAdminRoute('/setting', 'Setting'),
            // createAdminRoute('/system', 'System'),

            { path: '*', element: PageNotFound }
        ],
    },

    { path: '*', element: ProtectedRoutes }, // Catch-all for unknown routes
];

export default routes;




// <Suspense fallback={<div>Loading</div>}>
// <Routes>
//     {routes.map((route, index) => {
//         // //! ตรวจสอบว่า route มี children หรือไม่
//         if (route.children) {
//             // //* ถ้ามี children ให้สร้าง Route หลัก
//             return (
//                 <Route key={index} path={route.path} element={<route.element />}>
//                     {/* //TODO: ตรวจสอบ children และสร้าง Route สำหรับ children */}
//                     {route.children.map((childRoute, childIndex) => {
//                         // //! ตรวจสอบว่า childRoute มี children หรือไม่
//                         if (childRoute.children) {
//                             // //* ถ้ามี children ให้สร้าง Route สำหรับ childRoute
//                             return (
//                                 <Route key={childIndex} path={childRoute.path} element={<childRoute.element />}>
//                                     {/* //TODO: ตรวจสอบ grandChildRoute และสร้าง Route สำหรับ grandChildRoute */}
//                                     {childRoute.children.map((grandChildRoute, grandChildIndex) => (
//                                         <Route
//                                             key={grandChildIndex}
//                                             path={grandChildRoute.path}
//                                             element={<grandChildRoute.element />}
//                                         />
//                                     ))}
//                                 </Route>
//                             );
//                         }
//                         // //* ถ้าไม่มี children ให้สร้าง Route ปกติ
//                         return (
//                             <Route
//                                 key={childIndex}
//                                 path={childRoute.path}
//                                 element={<childRoute.element />}
//                             />
//                         );
//                     })}
//                 </Route>
//             );
//         }
//         // //* ถ้าไม่มี children ให้สร้าง Route ปกติ
//         return (
//             <Route key={index} path={route.path} element={<route.element />} />
//         );
//     })}
// </Routes>

// </Suspense>