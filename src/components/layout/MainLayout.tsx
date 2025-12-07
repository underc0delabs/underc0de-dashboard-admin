import { ReactNode } from 'react';
import { Box } from '@mantine/core';
import { Sidebar } from './Sidebar';
import classes from './MainLayout.module.css';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box className={classes.layout}>
      <Sidebar />
      <main className={classes.main}>
        {children}
      </main>
    </Box>
  );
}
