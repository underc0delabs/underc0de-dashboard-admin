import { ReactNode, useState } from 'react';
import { Box, UnstyledButton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconMenu2 } from '@tabler/icons-react';
import { Sidebar } from './Sidebar';
import classes from './MainLayout.module.css';

interface MainLayoutProps {
  children: ReactNode;
}

const MOBILE_BREAKPOINT = 768;

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);

  const handleCloseSidebar = () => setSidebarOpen(false);
  const handleOpenSidebar = () => setSidebarOpen(true);

  return (
    <Box className={classes.layout}>
      {isMobile && sidebarOpen && (
        <button
          type="button"
          className={classes.overlay}
          onClick={handleCloseSidebar}
          aria-label="Cerrar menú"
        />
      )}
      <Sidebar
        open={!isMobile || sidebarOpen}
        onClose={handleCloseSidebar}
      />
      <main className={classes.main}>
        {isMobile && (
          <header className={classes.mobileHeader}>
            <UnstyledButton
              onClick={handleOpenSidebar}
              className={classes.burgerButton}
              aria-label="Abrir menú"
            >
              <IconMenu2 size={28} stroke={1.5} />
            </UnstyledButton>
            <span className={classes.mobileTitle}>Underc0de</span>
          </header>
        )}
        {children}
      </main>
    </Box>
  );
}
