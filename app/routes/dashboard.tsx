import React from "react";
import { Dropdown, Button, Menu } from "antd";
import { SidebarLayout } from "../SidebarLayout";

export default function Dashboard() {
		const menu = (
			<Menu>
				<Menu.Item key="add" onClick={() => alert("Agregar cliente")}>Agregar Cliente</Menu.Item>
				<Menu.Item key="edit" onClick={() => alert("Modificar cliente")}>Modificar Cliente</Menu.Item>
				<Menu.Item key="list" onClick={() => alert("Listado de clientes")}>Listado de Clientes</Menu.Item>
			</Menu>
		);

		const ventas = (
			<Menu>
				<Menu.Item key="add" onClick={() => alert("registrar comprovante de venta")}>Registrar comprovante de venta</Menu.Item>
				<Menu.Item key="edit" onClick={() => alert("crear comprovante de venta")}>Crear comprovante de venta</Menu.Item>
			</Menu>
		);

		const maquinaria = (
			<Menu>
				<Menu.Item key="add" onClick={() => alert("Administrar maquinaria")}>Administrar Maquinaria</Menu.Item>
				<Menu.Item key="edit" onClick={() => alert("registrar mantenimiento")}>Registrar Mantenimiento</Menu.Item>
			</Menu>
		);

		const proveedores = (
			<Menu>
				<Menu.Item key="add" onClick={() => alert("Agregar proveedor")}>Agregar comprovante de compra</Menu.Item>
				<Menu.Item key="edit" onClick={() => alert("Modificar proveedor")}>Modificar Proveedor</Menu.Item>
				<Menu.Item key="edit" onClick={() => alert("crear presupuesto")}>Crear Presupuesto</Menu.Item>
				<Menu.Item key="edit" onClick={() => alert("registrar comprovante de venta")}>Registrar Comprovante de Venta</Menu.Item>
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
					
					<Dropdown overlay={ventas} trigger={["click"]}>
						<Button type="primary">Administración de ventas</Button>
					</Dropdown>

					<Dropdown overlay={maquinaria} trigger={["click"]}>
						<Button type="primary">Administración de maquinas</Button>
					</Dropdown>

					<Dropdown overlay={proveedores} trigger={["click"]}>
						<Button type="primary">Administración de proveedores</Button>
					</Dropdown>

					
				</div>
				{/* Aquí puedes agregar widgets, estadísticas, gráficos, etc. */}
			</SidebarLayout>
		);
}
