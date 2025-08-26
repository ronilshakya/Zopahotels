import * as React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

export default function Navbar({ drawerWidth }) {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        ml: `${drawerWidth}px`,
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap>
          Zopahotels Admin
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
