import React from "react";
import { Layout, Menu } from "antd";
// ...existing code...
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Sider, Content } = Layout;

const menuItems = [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "produccion",
    icon: <AppstoreOutlined />,
    label: "Producción",
    children: [
      { key: "ordenes", label: "Órdenes" },
      { key: "maquinas", label: "Máquinas" },
    ],
  },
  {
    key: "inventario",
    icon: <ShoppingOutlined />,
    label: "Inventario",
    children: [
      { key: "materia-prima", label: "Materia Prima" },
      { key: "productos", label: "Productos" },
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
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="light" collapsible>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 64,
          padding: "0 8px",
          borderBottom: "1px solid #eee",
          marginBottom: 8
        }}>
          <img src="/logo.jpg" alt="Logo" style={{ height: 40, marginRight: 8 }} />
          <span style={{ fontWeight: "bold", fontSize: 18, color: "#333" }}>
            Fabrica de Pastas 2025
          </span>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: "24px 16px 0", background: "#fff", padding: 24 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
