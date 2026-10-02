import { Button, Card, Flex, Layout, Space, Typography } from "antd";
import { BookOutlined, GithubOutlined } from "@ant-design/icons";

const resources = [
  { label: "Documentación de React Router", href: "https://reactrouter.com/docs", icon: <BookOutlined /> },
  { label: "Repositorio de React Router", href: "https://github.com/remix-run/react-router", icon: <GithubOutlined /> },
];

export function Welcome() {
  return (
    <Layout className="welcome-layout">
      <Layout.Content className="welcome-content">
        <Flex vertical align="center" gap={24}>
          <Space direction="vertical" size={4} align="center">
            <Typography.Title level={2}>Fábrica de Pastas 2025</Typography.Title>
            <Typography.Text type="secondary">
              Sistema de gestión de producción y ventas
            </Typography.Text>
          </Space>
          <Card className="welcome-card" bordered>
            <Flex vertical gap={12}>
              <Typography.Title level={5}>Recursos</Typography.Title>
              {resources.map((resource) => (
                <Button
                  key={resource.href}
                  type="default"
                  icon={resource.icon}
                  href={resource.href}
                  target="_blank"
                  rel="noreferrer"
                  block
                >
                  {resource.label}
                </Button>
              ))}
            </Flex>
          </Card>
        </Flex>
      </Layout.Content>
    </Layout>
  );
}
