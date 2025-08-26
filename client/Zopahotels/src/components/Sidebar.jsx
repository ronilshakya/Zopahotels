import * as React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { Dashboard, People, Hotel, Book } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function Sidebar({ drawerWidth }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon><Dashboard /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/users">
          <ListItemIcon><People /></ListItemIcon>
          <ListItemText primary="Users" />
        </ListItem>
        <ListItem button component={Link} to="/bookings">
          <ListItemIcon><Book /></ListItemIcon>
          <ListItemText primary="Bookings" />
        </ListItem>
        <ListItem button component={Link} to="/rooms">
          <ListItemIcon><Hotel /></ListItemIcon>
          <ListItemText primary="Rooms" />
        </ListItem>
      </List>
    </Drawer>
  );
}
