import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { styled, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Bookings from './pages/Bookings';
import Rooms from './pages/Rooms';
import darkTheme from './theme'; // import your dark theme

const drawerWidth = 240;

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  height: '100vh',
  overflow: 'auto',
  padding: theme.spacing(3),
}));

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          <Navbar drawerWidth={drawerWidth} />
          <Sidebar drawerWidth={drawerWidth} />
          <Main>
            <Toolbar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/rooms" element={<Rooms />} />
            </Routes>
          </Main>
        </Box>
      </Router>
    </ThemeProvider>
  );
}
