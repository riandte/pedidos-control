import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Settings, 
  Utensils, 
  Layers, 
  LogOut, 
  Menu, 
  X,
  ChefHat
} from 'lucide-react';

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false); // Reset on desktop
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/login');
  }, [navigate]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location, isMobile]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/pedidos', label: 'Pedidos', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/produtos', label: 'Produtos', icon: <Utensils size={20} /> },
    { path: '/admin/ingredientes', label: 'Ingredientes', icon: <ChefHat size={20} /> },
    { path: '/admin/grupos-adicionais', label: 'Adicionais', icon: <Layers size={20} /> },
    { path: '/admin/configuracoes', label: 'Configurações', icon: <Settings size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5', position: 'relative' }}>
      
      {/* Mobile Header */}
      {isMobile && (
        <header style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, 
          height: '60px', background: '#1e293b', color: 'white', 
          display: 'flex', alignItems: 'center', padding: '0 1rem', zIndex: 1000,
          justifyContent: 'space-between'
        }}>
          <h3>Admin</h3>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: 'none', color: 'white' }}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>
      )}

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <aside style={{ 
        width: '190px', 
        background: '#1e293b', 
        color: 'white', 
        padding: '1rem', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        height: '100vh',
        zIndex: 999,
        transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.3s ease-in-out',
        paddingTop: isMobile ? '80px' : '1rem', // Space for header on mobile
        overflowY: 'auto'
      }}>
        {!isMobile && <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Admin</h2>}
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              style={{
                ...navLinkStyle,
                background: location.pathname === item.path ? '#334155' : 'transparent'
              }}
            >
              {item.icon} {item.label}
            </Link>
          ))}
          
          <Link to="/kds" target="_blank" style={navLinkStyle}>
             <ShoppingBag size={20} /> Abrir KDS
          </Link>
        </nav>

        <a href="#" onClick={handleLogout} style={{ ...navLinkStyle, marginTop: 'auto', background: '#ef4444' }}>
          <LogOut size={20} /> Sair
        </a>
      </aside>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 900 }}
        />
      )}

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        padding: '1rem', 
        marginTop: isMobile ? '60px' : 0, 
        marginLeft: isMobile ? 0 : '190px', // Push content on desktop
        overflowY: 'auto', // Allow main scroll
        width: isMobile ? '100%' : 'calc(100% - 190px)', // Ensure full width
        height: isMobile ? 'calc(100vh - 60px)' : '100vh',
        boxSizing: 'border-box'
      }}>
        <Outlet />
      </main>
    </div>
  );
}

const navLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  color: 'white',
  textDecoration: 'none',
  padding: '12px',
  borderRadius: '6px',
  transition: 'background 0.2s',
  cursor: 'pointer'
} as React.CSSProperties;
