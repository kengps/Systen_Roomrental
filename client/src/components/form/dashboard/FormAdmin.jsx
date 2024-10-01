import React, { useState } from 'react'
import { Box, CssBaseline } from "@mui/material";

import AppContent from './elements/antd/AppContent'
import AppFooter from './elements/antd/AppFooter'
import AppHeader from './elements/antd/AppHeader'
import AppSidebar from './elements/antd/AppSidebar'
import { Layout } from 'antd';



const FormAdmin = () => {



    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
           
            <Box sx={{ display: "flex", flexGrow: 1 }}>
                <AppSidebar />
            </Box>
            <AppFooter />
        </Box>

    )
}

export default FormAdmin