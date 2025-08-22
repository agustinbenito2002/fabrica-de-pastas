import React from "react";
import { Dropdown, Button, Menu } from "antd";
import { SidebarLayout } from "../SidebarLayout";

export default function Dashboard() {
		const menu = (
			<Menu>
				<Menu.Item key="add" onClick={() => alert("Agregar cliente")}>Agregar Cliente</Menu.Item>
				<Menu.Item key="edit" onClick={() => alert("Modificar cliente")}>Modificar Cliente</Menu.Item>
			</Menu>
		);

		return (
			<SidebarLayout>
				<h1 style={{ fontSize: 32, fontWeight: "bold" }}>Dashboard</h1>
				<p>Bienvenido al sistema de gestión de la fábrica de pastas.</p>
				<div style={{ marginTop: 32 }}>
					<Dropdown overlay={menu} trigger={["click"]}>
						<Button type="primary">Administración de Clientes</Button>
					</Dropdown>
				</div>
				{/* Aquí puedes agregar widgets, estadísticas, gráficos, etc. */}
			</SidebarLayout>
		);
}
