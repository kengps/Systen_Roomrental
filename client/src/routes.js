import React from "react";
import IndexForm from "./pages/login/Index";

// Lazy load components
const HomePage = React.lazy(() => import("./pages/HomePage"));
const PageNotFound = React.lazy(() => import("./pages/404/PageNotFound"));
const AdminPages = React.lazy(() => import("./pages/admin/Admin"));
const TableAdmin = React.lazy(() => import("./pages/admin/Table"));
const MemberPage = React.lazy(() => import('./pages/member/Member'));

const ProtectedRoutes = React.lazy(() => import("./routes/ProtectedRoutes"));
const AdminRoutes = React.lazy(() => import("./routes/AdminRoutes"));
const MemberRoutes = React.lazy(() => import("./routes/MemberRoutes"));


const routes = [
    // Protected routes
    { path: '/login', element: IndexForm },
    {
        path: '/',
        element: ProtectedRoutes,
        children: [
            { path: 'homepage', element: HomePage }, // HomePage at root
            { path: '404', element: PageNotFound }, // PageNotFound route
        ],
    },

    // Admin routes
    {
        path: '/admin',
        title: 'Admin',
        element: AdminRoutes, // AdminRoutes should handle rendering child routes
        children: [
            {
                path: 'dashboard', // This path matches /admin/db
                title: 'Dashboard',
                element: AdminPages, // AdminPages component renders here
                children: [
                    { path: 'table', title: 'Table', element: TableAdmin }, // This matches /admin/db/table
                    { path: 'home', title: 'Home', element: HomePage }, // This matches /admin/db/home
                    { path: 'tableadmin', title: 'TableAdmin', element: TableAdmin }, // This matches /admin/db/table
                ],
            },
        ],
    },

    // Member routes
    {
        path: '/member',
        element: MemberRoutes,
        children: [
            { path: 'homepage', element: MemberPage }, // This matches /member/homepage
        ],
    },

    { path: '*', element: PageNotFound }, // Catch-all for unknown routes
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