import React, { useState } from "react";
import { Dropdown, Button, Menu } from "antd";
import { SidebarLayout } from "../SidebarLayout";
import ClientesPage from "./clientes";
import ComprobantesVentaPage from "./comprovantesventa";
import MaquinasPage from "./maquinas";
import ProveedoresPage from "./proveedores";

export default function Dashboard() {
	const [mostrarListado, setMostrarListado] = useState(false);
	const [mostrarComprobantes, setMostrarComprobantes] = useState(false);
	const [mostrarMaquinas, setMostrarMaquinas] = useState(false);
	const [mostrarProveedores, setMostrarProveedores] = useState(false);



	return (
		<SidebarLayout>
			{mostrarListado ? (
				<div>
					<Button style={{ marginBottom: 16 }} onClick={() => setMostrarListado(false)}>
						Volver al Dashboard
					</Button>
					<ClientesPage />
				</div>
			) : mostrarComprobantes ? (
				<div>
					<Button style={{ marginBottom: 16 }} onClick={() => setMostrarComprobantes(false)}>
						Volver al Dashboard
					</Button>
					<ComprobantesVentaPage />
				</div>
			) : mostrarMaquinas ? (
				<div>
					<Button style={{ marginBottom: 16 }} onClick={() => setMostrarMaquinas(false)}>
						Volver al Dashboard
					</Button>
					<MaquinasPage />
				</div>
			) : mostrarProveedores ? (
				<div>
					<Button style={{ marginBottom: 16 }} onClick={() => setMostrarProveedores(false)}>
						Volver al Dashboard
					</Button>
					<ProveedoresPage />
				</div>
			) : (
				<>
					<h1 style={{ fontSize: 32, fontWeight: "bold" }}>Dashboard</h1>
					<p>Bienvenido al sistema de gestión de la fábrica de pastas.</p>

					<div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 16 }}>
						<Button type="primary" onClick={() => setMostrarListado(true)}>Administración de Clientes</Button>
						<Button type="primary" onClick={() => setMostrarComprobantes(true)}>Comprobantes de Venta</Button>
						<Button type="primary" onClick={() => setMostrarMaquinas(true)}>Administración de Máquinas</Button>

						{/* 🔹 Este botón va directo a la página de proveedores */}
						<Button type="primary" onClick={() => setMostrarProveedores(true)}>
							Administración de Proveedores
						</Button>
					</div>
				</>
			)}
		</SidebarLayout>
	);
}
