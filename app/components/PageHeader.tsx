import type { ReactNode } from "react";
import { Flex, Typography } from "antd";

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <Flex className="page-header" align="center" justify="space-between" wrap gap={16}>
      <Typography.Title level={2} className="page-title">
        {title}
      </Typography.Title>
      {actions}
    </Flex>
  );
}