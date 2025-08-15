import React from "react";
import { SidebarLayout } from "../SidebarLayout";

export default function Dashboard() {
	return (
		<SidebarLayout>
			<h1 style={{ fontSize: 32, fontWeight: "bold" }}>Dashboard</h1>
			<p>Bienvenido al sistema de gestión de la fábrica de pastas.</p>
			{/* Aquí puedes agregar widgets, estadísticas, gráficos, etc. */}
		</SidebarLayout>
	);
}
