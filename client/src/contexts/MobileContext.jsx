import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

// Create Mobile Context
const MobileContext = createContext();

// Mobile Provider Component
export const MobileProvider = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto close mobile menu when screen size changes
  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  const value = {
    isMobile,
    mobileMenuOpen,
    setMobileMenuOpen,
    toggleMobileMenu: () => setMobileMenuOpen(prev => !prev),
    closeMobileMenu: () => setMobileMenuOpen(false),
    openMobileMenu: () => setMobileMenuOpen(true)
  };

  return (
    <MobileContext.Provider value={value}>
      {children}
    </MobileContext.Provider>
  );
};

// Custom Hook to use Mobile Context
export const useMobile = () => {
  const context = useContext(MobileContext);
  
  if (!context) {
    throw new Error('useMobile must be used within a MobileProvider');
  }
  
  return context;
};

// Export default
export default MobileContext;
