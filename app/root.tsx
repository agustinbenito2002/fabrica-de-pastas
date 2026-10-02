import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { App as AntApp, Button, ConfigProvider, Result, theme, Typography } from "antd";
import esES from "antd/locale/es_ES";

import type { Route } from "./+types/root";
import "antd/dist/reset.css";
import "./app.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ConfigProvider
      locale={esES}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#45a875",
          colorInfo: "#45a875",
          colorBgBase: "#090b0a",
          colorBgLayout: "#0b0e0c",
          colorBgContainer: "#151a17",
          colorBgElevated: "#1b211d",
          colorBorder: "#424d46",
          colorSplit: "#343e37",
          colorText: "#edf3ee",
          colorTextSecondary: "#a4b0a7",
          borderRadius: 6,
          fontFamily: "Aptos, 'Segoe UI', sans-serif",
        },
        components: {
          Layout: {
            bodyBg: "#0b0e0c",
            siderBg: "#090b0a",
            headerBg: "#101411",
          },
          Menu: {
            darkItemBg: "#090b0a",
            darkSubMenuItemBg: "#0d100e",
            darkItemSelectedBg: "#183323",
            darkItemHoverBg: "#1a211c",
            itemBorderRadius: 4,
          },
          Table: {
            headerBg: "#202722",
            rowHoverBg: "#1d2520",
            borderColor: "#424d46",
          },
        },
      }}
    >
      <AntApp>
        <Outlet />
      </AntApp>
    </ConfigProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <Result
      status={message === "404" ? "404" : "error"}
      title={message}
      subTitle={details}
      extra={<Button type="primary" href="/">Volver al inicio</Button>}
    >
      {stack && <Typography.Paragraph code>{stack}</Typography.Paragraph>}
    </Result>
  );
}
