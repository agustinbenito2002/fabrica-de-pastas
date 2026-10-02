import { Layout, Typography } from "antd";

export function TopBar() {
  return (
    <Layout.Header className="app-header">
      <Typography.Text strong>Fábrica de Pastas 2025</Typography.Text>
      <Typography.Text type="secondary">Gestión de producción y ventas</Typography.Text>
    </Layout.Header>
  );
}
