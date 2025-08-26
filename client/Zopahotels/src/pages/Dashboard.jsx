import * as React from "react";
import { Grid, Paper, Typography, Box } from "@mui/material";

export default function Dashboard() {
  return (
    <Grid container spacing={3}>
      {/* Stats Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, bgcolor: "primary.main", color: "primary.contrastText" }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Total Users
          </Typography>
          <Typography variant="h4">1,245</Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, bgcolor: "success.main", color: "success.contrastText" }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Bookings
          </Typography>
          <Typography variant="h4">325</Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, bgcolor: "warning.main", color: "warning.contrastText" }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Rooms
          </Typography>
          <Typography variant="h4">120</Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, bgcolor: "error.main", color: "error.contrastText" }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Revenue
          </Typography>
          <Typography variant="h4">$45,000</Typography>
        </Paper>
      </Grid>

      {/* Chart Placeholder */}
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 2,
            height: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.paper",
          }}
        >
          <Box>
            <Typography variant="h6" align="center">
              Bookings Overview
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 2 }}>
              Chart will be displayed here (future integration)
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
