import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Landing/Home";
import Dashboard from "../pages/Dashboard/Dashboard";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;