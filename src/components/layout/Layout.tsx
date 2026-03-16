import { useState, createContext } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';

// Create context for sidebar state
export const SidebarContext = createContext({
  collapsed: false,
  setCollapsed: (_collapsed: boolean) => {},
});

export const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <Sidebar />
      <main className={`content ${collapsed ? 'collapsed' : ''}`}>
        <Header />
        <Outlet />
      </main>
    </SidebarContext.Provider>
  );
};
