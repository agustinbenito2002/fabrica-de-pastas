import React, { useState, useEffect } from "react";

const LOCAL_STORAGE_KEY = "clientes-listado";

function getInitialClientes() {
	const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
	if (stored) return JSON.parse(stored);
	return [
		{ id: 1, nombre: "Juan Pérez", email: "juan@example.com" },
		{ id: 2, nombre: "María Gómez", email: "maria@example.com" },
		{ id: 3, nombre: "Carlos López", email: "carlos@example.com" },
	];
}

type Cliente = { id: number; nombre: string; email: string };

const ClientesPage: React.FC = () => {
	const [busqueda, setBusqueda] = useState("");
	const [clientes, setClientes] = useState<Cliente[]>(getInitialClientes);
	const [showForm, setShowForm] = useState(false);
	const [nuevoCliente, setNuevoCliente] = useState<{ nombre: string; email: string }>({ nombre: "", email: "" });
	const [errores, setErrores] = useState<{ nombre?: string; email?: string }>({});
	// Estados para edición
	const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
	const [showEditOptions, setShowEditOptions] = useState(false);
	const [showEditName, setShowEditName] = useState(false);
	const [nuevoNombre, setNuevoNombre] = useState("");
	const [showConfirmName, setShowConfirmName] = useState(false);
	// Estados para edición de email
	const [showEditEmail, setShowEditEmail] = useState(false);
	const [nuevoEmail, setNuevoEmail] = useState("");
	const [showConfirmEmail, setShowConfirmEmail] = useState(false);
	// Estado para borrado de cliente
	const [showConfirmDelete, setShowConfirmDelete] = useState(false);

	useEffect(() => {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clientes));
	}, [clientes]);

	const clientesFiltrados = clientes.filter((cliente: Cliente) =>
		cliente.nombre.toLowerCase().includes(busqueda.toLowerCase())
	);

	function validarCliente(cliente: { nombre: string; email: string }) {
		const errores: { nombre?: string; email?: string } = {};
		if (!cliente.nombre.trim()) {
			errores.nombre = "El nombre es obligatorio.";
		}
		if (!cliente.email.trim()) {
			errores.email = "El email es obligatorio.";
		} else if (!/^\S+@\S+\.\S+$/.test(cliente.email)) {
			errores.email = "El email no es válido.";
		}
		return errores;
	}

	function handleAddCliente(e: React.FormEvent) {
		e.preventDefault();
		const validacion = validarCliente(nuevoCliente);
		if (validacion.nombre || validacion.email) {
			setErrores(validacion);
			return;
		}
		setClientes([
			...clientes,
			{
				id: Date.now(),
				nombre: nuevoCliente.nombre,
				email: nuevoCliente.email,
			},
		]);
		setNuevoCliente({ nombre: "", email: "" });
		setErrores({});
		setShowForm(false);
	}

	function handleCancel() {
		setShowForm(false);
		setNuevoCliente({ nombre: "", email: "" });
		setErrores({});
	}

	return (
		<div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
			<h1>Listado de Clientes</h1>
			<button
				onClick={() => setShowForm(true)}
				style={{ marginBottom: 16, padding: "8px 16px", fontSize: 16 , color: "#fff", background: "#1890ff", border: "none", borderRadius: 4, cursor: "pointer"}}
			>
				Agregar Cliente
			</button>
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
						onSubmit={handleAddCliente}
						style={{
							minWidth: 320,
							maxWidth: 400,
							width: "100%",
							background: "#fff",
							borderRadius: 12,
							boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
							padding: 32,
							display: "flex",
							flexDirection: "column",
							gap: 18,
							position: "relative",
							color: "#111", // texto negro en todo el pop-up
						}}
					>
						<h2 style={{ marginBottom: 8, textAlign: "center", color: "#111" }}>Agregar nuevo cliente</h2>
						<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
							<label htmlFor="nombre" style={{ fontWeight: "bold", color: "#111" }}>Nombre</label>
							<input
								id="nombre"
								type="text"
								placeholder="Ingrese el nombre del cliente"
								value={nuevoCliente.nombre}
								onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
								style={{ width: "100%", padding: 8, fontSize: 16, borderRadius: 4, border: "1px solid #ccc", color: "#111" }}
								autoFocus
							/>
							{errores.nombre && (
								<span style={{ color: "red", fontSize: 14 }}>{errores.nombre}</span>
							)}
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
							<label htmlFor="email" style={{ fontWeight: "bold", color: "#111" }}>Email</label>
							<input
								id="email"
								type="email"
								placeholder="Ingrese el email del cliente"
								value={nuevoCliente.email}
								onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
								style={{ width: "100%", padding: 8, fontSize: 16, borderRadius: 4, border: "1px solid #ccc", color: "#111" }}
							/>
							{errores.email && (
								<span style={{ color: "red", fontSize: 14 }}>{errores.email}</span>
							)}
						</div>
						<div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 8 }}>
							<button
								type="submit"
								style={{ padding: "8px 24px", fontSize: 16, background: "#1677ff", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
							>
								Guardar
							</button>
							<button
								type="button"
								onClick={handleCancel}
								style={{ padding: "8px 24px", fontSize: 16, background: "#eee", color: "#333", border: "none", borderRadius: 4, cursor: "pointer" }}
							>
								Cancelar
							</button>
						</div>
					</form>
				</div>
			)}
			<input
				type="text"
				placeholder="Buscar por nombre..."
				value={busqueda}
				onChange={(e) => setBusqueda(e.target.value)}
				style={{ width: "100%", padding: 8, marginBottom: 16, fontSize: 16 }}
			/>
			<ul style={{ listStyle: "none", padding: 0 }}>
				{clientesFiltrados.length === 0 ? (
					<li>No se encontraron clientes.</li>
				) : (
					clientesFiltrados.map((cliente: Cliente) => (
						<li
							key={cliente.id}
							style={{
								padding: "12px 0",
								borderBottom: "1px solid #eee",
								display: "flex",
								flexDirection: "column",
								cursor: "pointer",
								background: clienteSeleccionado?.id === cliente.id ? "#e6f7ff" : undefined,
							}}
							onClick={() => {
								setClienteSeleccionado(cliente);
								setShowEditOptions(true);
							}}
						>
							<span style={{ fontWeight: "bold" }}>{cliente.nombre}</span>
							<span style={{ color: "#888" }}>{cliente.email}</span>
						</li>
					))
				)}
			</ul>

			{/* Pop-up de opciones de edición */}
			{showEditOptions && clienteSeleccionado && (
				<div style={{
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
				}}>
					<div style={{
						minWidth: 320,
						maxWidth: 400,
						width: "100%",
						background: "#fff",
						borderRadius: 12,
						boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
						padding: 32,
						display: "flex",
						flexDirection: "column",
						gap: 18,
						position: "relative",
						color: "#111",
					}}>
						<h2 style={{ marginBottom: 8, textAlign: "center", color: "#111" }}>Opciones para {clienteSeleccionado.nombre}</h2>
						<button style={{ marginBottom: 8, padding: "8px 16px", fontSize: 16 }} onClick={() => {
							// setShowEditOptions(false); // Commented out to keep the options open
							setShowEditName(true);
							setNuevoNombre("");
						}}>Modificar nombre</button>
						<button style={{ marginBottom: 8, padding: "8px 16px", fontSize: 16 }} onClick={() => {
							// setShowEditOptions(false); // Commented out to keep the options open
							setShowEditEmail(true);
							setNuevoEmail("");
						}}>Modificar email</button>
			{/* Pop-up para ingresar nuevo email */}
			{showEditEmail && clienteSeleccionado && (
				<div style={{
					position: "fixed",
					top: 0,
					left: 0,
					width: "100vw",
					height: "100vh",
					background: "rgba(0,0,0,0.3)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 1001,
				}}>
					<div style={{
						minWidth: 320,
						maxWidth: 400,
						width: "100%",
						background: "#fff",
						borderRadius: 12,
						boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
						padding: 32,
						display: "flex",
						flexDirection: "column",
						gap: 18,
						position: "relative",
						color: "#111",
					}}>
						<h2 style={{ marginBottom: 8, textAlign: "center", color: "#111" }}>Modificar email</h2>
						<label htmlFor="nuevo-email">Nuevo email:</label>
						<input
							id="nuevo-email"
							type="email"
							value={nuevoEmail}
							onChange={e => setNuevoEmail(e.target.value)}
							style={{ padding: "8px", fontSize: 16, marginBottom: 8 }}
							autoFocus
						/>
						<div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
							<button style={{ padding: "8px 16px", fontSize: 16, background: "#eee", color: "#333" }} onClick={() => {
								setShowEditEmail(false);
							}}>Cancelar</button>
							<button
								style={{ padding: "8px 16px", fontSize: 16, background: nuevoEmail.trim() ? "#1890ff" : "#ccc", color: "#fff" }}
								disabled={!nuevoEmail.trim()}
								onClick={() => {
									if (nuevoEmail.trim()) {
										setShowConfirmEmail(true);
									}
								}}
							>Confirmar</button>
						</div>
					</div>
				</div>
			)}

			{/* Pop-up de confirmación "¿Estás seguro?" para email */}
			{showConfirmEmail && clienteSeleccionado && (
				<div style={{
					position: "fixed",
					top: 0,
					left: 0,
					width: "100vw",
					height: "100vh",
					background: "rgba(0,0,0,0.3)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 1002,
				}}>
					<div style={{
						minWidth: 320,
						maxWidth: 400,
						width: "100%",
						background: "#fff",
						borderRadius: 12,
						boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
						padding: 32,
						display: "flex",
						flexDirection: "column",
						gap: 18,
						position: "relative",
						color: "#111",
						alignItems: "center",
					}}>
						<h2 style={{ marginBottom: 8, textAlign: "center", color: "#111" }}>¿Estás seguro?</h2>
						<p>¿Deseas cambiar el email de <b>{clienteSeleccionado.nombre}</b> por <b>{nuevoEmail}</b>?</p>
						<div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
							<button style={{ padding: "8px 16px", fontSize: 16, background: "#eee", color: "#333" }} onClick={() => {
								setShowConfirmEmail(false);
								setShowEditEmail(true);
							}}>No</button>
							<button
								style={{ padding: "8px 16px", fontSize: 16, background: "#1890ff", color: "#fff" }}
								onClick={() => {
									// Actualizar email
									setClientes(prev => {
										const actualizados = prev.map(c =>
											c.id === clienteSeleccionado.id ? { ...c, email: nuevoEmail } : c
										);
										localStorage.setItem("clientes", JSON.stringify(actualizados));
										return actualizados;
									});
									setShowConfirmEmail(false);
									setShowEditEmail(false);
									setNuevoEmail("");
								}}
							>Sí</button>
						</div>
					</div>
				</div>
			)}
						<button style={{ marginBottom: 8, padding: "8px 16px", fontSize: 16, background: "#ff4d4f", color: "#fff" }} onClick={() => {
							setShowConfirmDelete(true);
							setShowEditOptions(true);
						}}>Borrar cliente</button>
			{/* Pop-up de confirmación "¿Estás seguro?" para borrar cliente */}
			{showConfirmDelete && clienteSeleccionado && (
				<div style={{
					position: "fixed",
					top: 0,
					left: 0,
					width: "100vw",
					height: "100vh",
					background: "rgba(0,0,0,0.3)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 1002,
				}}>
					<div style={{
						minWidth: 320,
						maxWidth: 400,
						width: "100%",
						background: "#fff",
						borderRadius: 12,
						boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
						padding: 32,
						display: "flex",
						flexDirection: "column",
						gap: 18,
						position: "relative",
						color: "#111",
						alignItems: "center",
					}}>
						<h2 style={{ marginBottom: 8, textAlign: "center", color: "#111" }}>¿Estás seguro?</h2>
						<p>¿Deseas borrar al cliente <b>{clienteSeleccionado.nombre}</b>?</p>
						<div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
							<button style={{ padding: "8px 16px", fontSize: 16, background: "#eee", color: "#333" }} onClick={() => {
								setShowConfirmDelete(false);
							}}>No</button>
							<button
								style={{ padding: "8px 16px", fontSize: 16, background: "#ff4d4f", color: "#fff" }}
								onClick={() => {
									// Borrar cliente
									setClientes(prev => {
										const actualizados = prev.filter(c => c.id !== clienteSeleccionado.id);
										localStorage.setItem("clientes", JSON.stringify(actualizados));
										return actualizados;
									});
									setShowConfirmDelete(false);
									setClienteSeleccionado(null);
								}}
							>Sí</button>
						</div>
					</div>
				</div>
			)}
						<button style={{ padding: "8px 16px", fontSize: 16, background: "#eee", color: "#333" }} onClick={() => { setShowEditOptions(false); setClienteSeleccionado(null); }}>Cancelar</button>
					</div>
				</div>
			)}

			{/* Pop-up para ingresar nuevo nombre */}
			{showEditName && clienteSeleccionado && (
				<div style={{
					position: "fixed",
					top: 0,
					left: 0,
					width: "100vw",
					height: "100vh",
					background: "rgba(0,0,0,0.3)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 1001,
				}}>
					<div style={{
						minWidth: 320,
						maxWidth: 400,
						width: "100%",
						background: "#fff",
						borderRadius: 12,
						boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
						padding: 32,
						display: "flex",
						flexDirection: "column",
						gap: 18,
						position: "relative",
						color: "#111",
					}}>
						<h2 style={{ marginBottom: 8, textAlign: "center", color: "#111" }}>Modificar nombre</h2>
						<label htmlFor="nuevo-nombre">Nuevo nombre:</label>
						<input
							id="nuevo-nombre"
							type="text"
							value={nuevoNombre}
							onChange={e => setNuevoNombre(e.target.value)}
							style={{ padding: "8px", fontSize: 16, marginBottom: 8 }}
							autoFocus
						/>
						<div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
							<button style={{ padding: "8px 16px", fontSize: 16, background: "#eee", color: "#333" }} onClick={() => {
								setShowEditName(false);
							}}>Cancelar</button>
							<button
								style={{ padding: "8px 16px", fontSize: 16, background: nuevoNombre.trim() ? "#1890ff" : "#ccc", color: "#fff" }}
								disabled={!nuevoNombre.trim()}
								onClick={() => {
									if (nuevoNombre.trim()) {
										setShowConfirmName(true);
									}
								}}
							>Confirmar</button>
						</div>
					</div>
				</div>
			)}

			{/* Pop-up de confirmación "¿Estás seguro?" */}
			{showConfirmName && clienteSeleccionado && (
				<div style={{
					position: "fixed",
					top: 0,
					left: 0,
					width: "100vw",
					height: "100vh",
					background: "rgba(0,0,0,0.3)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 1002,
				}}>
					<div style={{
						minWidth: 320,
						maxWidth: 400,
						width: "100%",
						background: "#fff",
						borderRadius: 12,
						boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
						padding: 32,
						display: "flex",
						flexDirection: "column",
						gap: 18,
						position: "relative",
						color: "#111",
						alignItems: "center",
					}}>
						<h2 style={{ marginBottom: 8, textAlign: "center", color: "#111" }}>¿Estás seguro?</h2>
						<p>¿Deseas cambiar el nombre de <b>{clienteSeleccionado.nombre}</b> por <b>{nuevoNombre}</b>?</p>
						<div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
							<button style={{ padding: "8px 16px", fontSize: 16, background: "#eee", color: "#333" }} onClick={() => {
								setShowConfirmName(false);
								setShowEditName(true);
							}}>No</button>
							<button
								style={{ padding: "8px 16px", fontSize: 16, background: "#1890ff", color: "#fff" }}
								onClick={() => {
									// Actualizar nombre
									setClientes(prev => {
										const actualizados = prev.map(c =>
											c.id === clienteSeleccionado.id ? { ...c, nombre: nuevoNombre } : c
										);
										localStorage.setItem("clientes", JSON.stringify(actualizados));
										return actualizados;
									});
									setShowConfirmName(false);
									setShowEditName(false);
									setShowEditOptions(false);
									setClienteSeleccionado(null);
									setNuevoNombre("");
								}}
							>Sí</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ClientesPage;
