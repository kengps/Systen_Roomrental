import React from "react";
import { Box, Typography } from "@mui/material";

function AppFooter() {
    return (
        <Box sx={{
            p: 2,
            bgcolor: "background.paper",
            textAlign: "center",
            mt: "auto",
            borderTop: "1px solid #ccc" // เพิ่มเส้นกรอบด้านบน
        }}>
            <Typography variant="body2">
                © 2024 Your Company. All rights reserved.
            </Typography>
        </Box>
    );
}

export default AppFooter;
