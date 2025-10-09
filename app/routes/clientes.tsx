import React, { useState, useEffect } from "react";

const LOCAL_STORAGE_KEY = "clientes-listado";

function getInitialClientes() {
	const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
	if (stored) return JSON.parse(stored);
	return [
		{ id: 1, nombre: "Juan Pérez", email: "juan@example.com", telefono: "1122334455", direccion: "Calle 1", estadoDeuda: false, deuda: 0 },
		{ id: 2, nombre: "María Gómez", email: "maria@example.com", telefono: "1199887766", direccion: "Calle 2", estadoDeuda: true, deuda: 5000 },
		{ id: 3, nombre: "Carlos López", email: "carlos@example.com", telefono: "1144556677", direccion: "Calle 3", estadoDeuda: false, deuda: 0 },
	];
}

type Cliente = {
	id: number;
	nombre: string;
	email: string;
	telefono: string;
	direccion: string;
	estadoDeuda: boolean;
	deuda: number;
};

const ClientesPage: React.FC = () => {
	const [busqueda, setBusqueda] = useState("");
	const [clientes, setClientes] = useState<Cliente[]>(getInitialClientes);
	const [showForm, setShowForm] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
	const [nuevoCliente, setNuevoCliente] = useState<Partial<Cliente>>({
		nombre: "",
		email: "",
		telefono: "",
		direccion: "",
		estadoDeuda: false,
		deuda: 0,
	});
	const [showEditDeuda, setShowEditDeuda] = useState(false);
	const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
	const [nuevoMonto, setNuevoMonto] = useState("");

	useEffect(() => {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clientes));
	}, [clientes]);

	const clientesFiltrados = clientes.filter((c) =>
		c.nombre.toLowerCase().includes(busqueda.toLowerCase())
	);

	function validarCliente(cliente: Partial<Cliente>) {
		const errores: { nombre?: string; email?: string } = {};
		if (!cliente.nombre?.trim()) errores.nombre = "El nombre es obligatorio.";
		if (!cliente.email?.trim()) errores.email = "El email es obligatorio.";
		else if (!/^\S+@\S+\.\S+$/.test(cliente.email)) errores.email = "El email no es válido.";
		return errores;
	}

	function handleAddOrEditCliente(e: React.FormEvent) {
		e.preventDefault();
		const validacion = validarCliente(nuevoCliente);
		if (validacion.nombre || validacion.email) {
			alert("Por favor complete los campos correctamente");
			return;
		}

		if (editMode && clienteEditando) {
			// Editar cliente existente
			setClientes((prev) =>
				prev.map((c) =>
					c.id === clienteEditando.id ? { ...c, ...nuevoCliente } : c
				)
			);
		} else {
			// Agregar nuevo cliente
			const nuevo = {
				id: Date.now(),
				nombre: nuevoCliente.nombre || "",
				email: nuevoCliente.email || "",
				telefono: nuevoCliente.telefono || "",
				direccion: nuevoCliente.direccion || "",
				estadoDeuda: nuevoCliente.estadoDeuda || false,
				deuda: nuevoCliente.deuda || 0,
			};
			setClientes([...clientes, nuevo]);
		}

		setNuevoCliente({ nombre: "", email: "", telefono: "", direccion: "", estadoDeuda: false, deuda: 0 });
		setShowForm(false);
		setEditMode(false);
		setClienteEditando(null);
	}

	return (
		<div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
			<h1>Listado de Clientes</h1>

			{/* Botón Agregar */}
			<button
				onClick={() => {
					setShowForm(true);
					setEditMode(false);
					setNuevoCliente({ nombre: "", email: "", telefono: "", direccion: "", estadoDeuda: false, deuda: 0 });
				}}
				style={{
					marginBottom: 16,
					padding: "8px 16px",
					fontSize: 16,
					color: "#fff",
					background: "#1890ff",
					border: "none",
					borderRadius: 4,
					cursor: "pointer",
				}}
			>
				Agregar Cliente
			</button>

			{/* Buscar */}
			<input
				type="text"
				placeholder="Buscar por nombre..."
				value={busqueda}
				onChange={(e) => setBusqueda(e.target.value)}
				style={{
					width: "100%",
					padding: 8,
					marginBottom: 16,
					fontSize: 16,
					borderRadius: 4,
					border: "1px solid #ccc",
				}}
			/>

			{/* Tabla */}
			<table style={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr style={{ backgroundColor: "#f5f5f5" }}>
						<th style={{ border: "1px solid #ddd", padding: 10 }}>ID</th>
						<th style={{ border: "1px solid #ddd", padding: 10 }}>Nombre</th>
						<th style={{ border: "1px solid #ddd", padding: 10 }}>Email</th>
						<th style={{ border: "1px solid #ddd", padding: 10 }}>Teléfono</th>
						<th style={{ border: "1px solid #ddd", padding: 10 }}>Dirección</th>
						<th style={{ border: "1px solid #ddd", padding: 10 }}>Estado Deuda</th>
						<th style={{ border: "1px solid #ddd", padding: 10 }}>Monto</th>
						<th style={{ border: "1px solid #ddd", padding: 10 }}>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{clientesFiltrados.length === 0 ? (
						<tr>
							<td colSpan={8} style={{ textAlign: "center", padding: 20 }}>
								No se encontraron clientes.
							</td>
						</tr>
					) : (
						clientesFiltrados.map((cliente) => (
							<tr key={cliente.id} style={{ borderBottom: "1px solid #eee" }}>
								<td style={{ padding: 10 }}>{cliente.id}</td>
								<td style={{ padding: 10 }}>{cliente.nombre}</td>
								<td style={{ padding: 10 }}>{cliente.email}</td>
								<td style={{ padding: 10 }}>{cliente.telefono}</td>
								<td style={{ padding: 10 }}>{cliente.direccion}</td>
								<td style={{ padding: 10 }}>
									{cliente.estadoDeuda ? (
										<span style={{ color: "red", fontWeight: "bold" }}>Con deuda</span>
									) : (
										<span style={{ color: "green" }}>Sin deuda</span>
									)}
								</td>
								<td style={{ padding: 10 }}>
									{cliente.estadoDeuda ? (
										<>
											${cliente.deuda.toFixed(2)}{" "}
											<button
												onClick={() => {
													setClienteSeleccionado(cliente);
													setShowEditDeuda(true);
												}}
												style={{
													marginLeft: 8,
													background: "#faad14",
													color: "#fff",
													border: "none",
													padding: "4px 8px",
													borderRadius: 4,
													cursor: "pointer",
												}}
											>
												Agregar
											</button>
										</>
									) : (
										"$0.00"
									)}
								</td>
								<td style={{ padding: 10 }}>
									<button
										onClick={() => {
											setShowForm(true);
											setEditMode(true);
											setClienteEditando(cliente);
											setNuevoCliente(cliente);
										}}
										style={{
											padding: "6px 12px",
											background: "#1677ff",
											color: "#fff",
											border: "none",
											borderRadius: 4,
											cursor: "pointer",
										}}
									>
										Editar
									</button>
								</td>
							</tr>
						))
					)}
				</tbody>
			</table>

			{/* MODAL agregar o editar cliente */}
			{showForm && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100vh",
						background: "rgba(0,0,0,0.3)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 1000,
					}}
				>
					<form
						onSubmit={handleAddOrEditCliente}
						style={{
							minWidth: 400,
							background: "#fff",
							borderRadius: 12,
							boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
							padding: 32,
							display: "flex",
							flexDirection: "column",
							gap: 12,
						}}
					>
						<h2>{editMode ? "Editar cliente" : "Agregar nuevo cliente"}</h2>
						<label>Nombre</label>
						<input
							type="text"
							value={nuevoCliente.nombre}
							onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
						/>
						<label>Email</label>
						<input
							type="email"
							value={nuevoCliente.email}
							onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
						/>
						<label>Teléfono</label>
						<input
							type="text"
							value={nuevoCliente.telefono}
							onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
						/>
						<label>Dirección</label>
						<input
							type="text"
							value={nuevoCliente.direccion}
							onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
						/>
						<label>
							<input
								type="checkbox"
								checked={nuevoCliente.estadoDeuda}
								onChange={(e) =>
									setNuevoCliente({ ...nuevoCliente, estadoDeuda: e.target.checked })
								}
							/>
							Tiene deuda
						</label>
						{nuevoCliente.estadoDeuda && (
							<>
								<label>Monto de deuda</label>
								<input
									type="number"
									value={nuevoCliente.deuda}
									onChange={(e) =>
										setNuevoCliente({
											...nuevoCliente,
											deuda: parseFloat(e.target.value) || 0,
										})
									}
								/>
							</>
						)}
						<div style={{ display: "flex", justifyContent: "space-between" }}>
							<button type="submit" style={{ background: "#1677ff", color: "#fff", padding: 8 }}>
								{editMode ? "Guardar cambios" : "Guardar"}
							</button>
							<button onClick={() => setShowForm(false)} type="button" style={{ padding: 8 }}>
								Cancelar
							</button>
						</div>
					</form>
				</div>
			)}

			{/* MODAL agregar monto de deuda */}
			{showEditDeuda && clienteSeleccionado && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100vh",
						background: "rgba(0,0,0,0.3)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 1000,
					}}
				>
					<div
						style={{
							minWidth: 320,
							background: "#fff",
							borderRadius: 12,
							padding: 24,
							boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
						}}
					>
						<h3>Agregar monto a la deuda</h3>
						<p>
							Cliente: <b>{clienteSeleccionado.nombre}</b>
						</p>
						<input
							type="number"
							placeholder="Ingrese monto"
							value={nuevoMonto}
							onChange={(e) => setNuevoMonto(e.target.value)}
							style={{ width: "100%", padding: 8, marginBottom: 12 }}
						/>
						<div style={{ display: "flex", justifyContent: "space-between" }}>
							<button
								onClick={() => setShowEditDeuda(false)}
								style={{ padding: 8, background: "#eee" }}
							>
								Cancelar
							</button>
							<button
								onClick={() => {
									const monto = parseFloat(nuevoMonto);
									if (!isNaN(monto) && monto > 0) {
										setClientes((prev) =>
											prev.map((c) =>
												c.id === clienteSeleccionado.id
													? { ...c, deuda: c.deuda + monto }
													: c
											)
										);
										setShowEditDeuda(false);
										setNuevoMonto("");
									}
								}}
								style={{ padding: 8, background: "#faad14", color: "#fff", border: "none" }}
							>
								Agregar
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ClientesPage;
