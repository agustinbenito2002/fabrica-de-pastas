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
          colorPrimary: "#43d9c2",
          colorInfo: "#43d9c2",
          colorBgBase: "#080d14",
          colorBgLayout: "#0a111a",
          colorBgContainer: "#111a25",
          colorBgElevated: "#172331",
          colorBorder: "#273746",
          colorSplit: "#202f3d",
          colorText: "#e8f1f7",
          colorTextSecondary: "#8fa5b5",
          borderRadius: 10,
          fontFamily: "Aptos, 'Segoe UI', sans-serif",
        },
        components: {
          Layout: {
            bodyBg: "#0a111a",
            siderBg: "#080d14",
            headerBg: "#0c141d",
          },
          Menu: {
            darkItemBg: "#090b0a",
            darkSubMenuItemBg: "#0d100e",
            darkItemSelectedBg: "#13343a",
            darkItemHoverBg: "#142431",
            itemBorderRadius: 8,
          },
          Table: {
            headerBg: "#172330",
            rowHoverBg: "#142735",
            borderColor: "#273746",
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
