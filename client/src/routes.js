import React from "react";

// Lazy load components
const IndexLogin = React.lazy(() => import("./pages/login/Index"));
const HomePage = React.lazy(() => import("./pages/HomePage"));
const PageNotFound = React.lazy(() => import("./pages/404/PageNotFound"));
const AdminPages = React.lazy(() => import("./pages/admin/Admin"));
const TableAdmin = React.lazy(() => import("./pages/admin/Table"));
const MemberPage = React.lazy(() => import('./pages/member/Member'));

const ProtectedRoutes = React.lazy(() => import("./routes/ProtectedRoutes"));
const AdminRoutes = React.lazy(() => import("./routes/AdminRoutes"));
const MemberRoutes = React.lazy(() => import("./routes/MemberRoutes"));


const routes = [
    { path: '/login', element: IndexLogin },

    // Protected routes
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
        element: AdminRoutes, // AdminRoutes should handle rendering child routes
        children: [
            {
                path: 'db', // This path matches /admin/db
                element: AdminPages, // AdminPages component renders here
                children: [
                    { path: 'table', element: TableAdmin  }, // This matches /admin/db/table
                    { path: 'home', element: HomePage }, // This matches /admin/db/home
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
