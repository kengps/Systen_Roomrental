// RouteRenderer.js
import React from "react";
import { Routes, Route } from "react-router-dom";

const RouteRenderer = ({ routes }) => {
    return (
        <Routes>
            {routes.map((route, index) => {
                const { path, element, children } = route;
                return (
                    <Route key={index} path={path} element={element}>
                        {children && <RouteRenderer routes={children} />}
                    </Route>
                );
            })}
        </Routes>
    );
};

export default RouteRenderer;
