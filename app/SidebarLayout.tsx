import React, { useState } from "react";
import { Layout, Menu, Typography } from "antd";
import {
  DashboardOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  DollarOutlined,
  OrderedListOutlined,
  ShoppingOutlined,
  ToolOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import ClientesPage from "./routes/clientes";
import ComprobantesVentaPage from "./routes/comprovantesventa";
import MateriasPage from "./routes/materias";
import MaquinasPage from "./routes/maquinas";
import OrdenesPage from "./routes/ordenes";
import OrdenesMantenimientoPage from "./routes/ordenesmantenimiento";
import PresupuestoPage from "./routes/presupuesto";
import ProductosPage from "./routes/productos";
import ProveedoresPage from "./routes/proveedores";
import RecetasPage from "./routes/recetas";  // Add this import

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "inventario",
    icon: <ShoppingOutlined />,
    label: "Inventario",
    children: [
      { key: "materia-prima", label: "Materia Prima" },
      { key: "productos", label: "Productos" },
      { key: "recetas", label: "Recetas" },
      { key: "maquinas", icon: <ToolOutlined />, label: "Máquinas" },
      { key: "ordenes-mantenimiento", icon: <FileDoneOutlined />, label: "Órdenes de Mantenimiento" },
    ],
  },
  {
    key: "venta",
    icon: <DollarOutlined />,
    label: "Venta",
    children: [
      { key: "clientes", icon: <UserOutlined />, label: "Administración de Clientes" },
      { key: "comprobantes-venta", icon: <FileTextOutlined />, label: "Comprobantes de Venta" },
      { key: "proveedores", icon: <UserOutlined />, label: "Administración de Proveedores" },
      { key: "ordenes", icon: <OrderedListOutlined />, label: "Administrar Órdenes" },
      { key: "presupuesto", icon: <DollarOutlined />, label: "Administrar Presupuesto" },
    ],
  },
  {
    key: "usuarios",
    icon: <UserOutlined />,
    label: "Usuarios",
  },
  {
    key: "configuracion",
    icon: <SettingOutlined />,
    label: "Configuración",
  },
];

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleMenuClick = ({ key }: { key: string }) => {
    setCurrentPage(key);
  };

  const renderContent = () => {
    switch (currentPage) {
      case "clientes":
        return <ClientesPage />;
      case "comprobantes-venta":
        return <ComprobantesVentaPage />;
      case "materia-prima":
        return <MateriasPage />;
      case "maquinas":
        return <MaquinasPage />;
      case "ordenes":
        return <OrdenesPage />;
      case "ordenes-mantenimiento":
        return <OrdenesMantenimientoPage />;
      case "presupuesto":
        return <PresupuestoPage />;
      case "productos":
        return <ProductosPage />;
      case "proveedores":
        return <ProveedoresPage />;
      case "recetas":     // Add this case
        return <RecetasPage />;
      default:
        return children;
    }
  };

  return (
    <Layout className="app-shell">
      <Sider
        className="app-sider"
        theme="dark"
        collapsible
        breakpoint="lg"
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className={`brand-lockup${collapsed ? " is-collapsed" : ""}`}>
          <img src="/logo.jpg" alt="Fábrica de Pastas" />
          {!collapsed && (
            <Typography.Text strong className="brand-name">Fábrica de Pastas</Typography.Text>
          )}
        </div>

        <Menu
          mode="inline"
          theme="dark"
          defaultSelectedKeys={["dashboard"]}
          selectedKeys={[currentPage]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout className="app-main">
        <Header className="app-header">
          <Typography.Text strong>Gestión de producción y ventas</Typography.Text>
          <Typography.Text type="secondary">Fábrica de Pastas 2025</Typography.Text>
        </Header>
        <Content className="app-content">
          <div className="page-surface">{renderContent()}</div>
        </Content>
      </Layout>
    </Layout>
  );
}
