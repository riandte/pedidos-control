import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClientMenu } from './pages/client/ClientMenu';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminPedidos } from './pages/admin/AdminPedidos';
import { AdminProdutos } from './pages/admin/AdminProdutos';
import { AdminIngredientes } from './pages/admin/AdminIngredientes';
import { AdminGruposAdicionais } from './pages/admin/AdminGruposAdicionais';
import { AdminConfiguracoes } from './pages/admin/AdminConfiguracoes';
import { KDS } from './pages/admin/KDS';
import { Login } from './pages/admin/Login';
import { ProductDetails } from './pages/client/ProductDetails';
import { CartProvider } from './contexts/CartProvider';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* Front do Cliente (Rota Raiz) */}
          <Route path="/" element={<ClientMenu />} />
          <Route path="/produto/:id" element={<ProductDetails />} />

          {/* Login Admin */}
        <Route path="/login" element={<Login />} />

        {/* Front da Empresa (Admin) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="pedidos" replace />} />
          <Route path="pedidos" element={<AdminPedidos />} />
          <Route path="produtos" element={<AdminProdutos />} />
          <Route path="ingredientes" element={<AdminIngredientes />} />
          <Route path="grupos-adicionais" element={<AdminGruposAdicionais />} />
          <Route path="configuracoes" element={<AdminConfiguracoes />} />
        </Route>

        {/* KDS (Rota Separada, Fullscreen) */}
        <Route path="/kds" element={<KDS />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
