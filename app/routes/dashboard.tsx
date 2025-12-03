import React, { useState } from "react";
import { Button } from "antd";
import { SidebarLayout } from "../SidebarLayout";
import ClientesPage from "./clientes";
import ComprobantesVentaPage from "./comprovantesventa";
import MaquinasPage from "./maquinas";
import ProveedoresPage from "./proveedores";
import OrdenesPage from "./ordenes";
import compraspage from "./compras";
import ComprasPage from "./compras";
import OrdenesMantenimientoPage from "./ordenesmantenimiento";
import PresupuestoPage from "./presupuesto";

export default function Dashboard() {
    const [mostrarListado, setMostrarListado] = useState(false);
    const [mostrarComprobantes, setMostrarComprobantes] = useState(false);
    const [mostrarMaquinas, setMostrarMaquinas] = useState(false);
    const [mostrarProveedores, setMostrarProveedores] = useState(false);
    const [mostrarOrdenes, setMostrarOrdenes] = useState(false);
    const [mostrarOrdenesMantenimiento, setMostrarOrdenesMantenimiento] = useState(false);
    const [mostrarPresupuesto, setMostrarPresupuesto] = useState(false);

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
            ) : mostrarOrdenes ? (
                <div>
                    <Button style={{ marginBottom: 16 }} onClick={() => setMostrarOrdenes(false)}>
                        Volver al Dashboard
                    </Button>
                    <OrdenesPage />
                </div>
            ) : mostrarOrdenesMantenimiento ? (
                <div>
                    <Button style={{ marginBottom: 16 }} onClick={() => setMostrarOrdenesMantenimiento(false)}>
                        Volver al Dashboard
                    </Button>
                    <OrdenesMantenimientoPage />
                </div>
            ) : mostrarPresupuesto ? (
                <div>
                    <Button style={{ marginBottom: 16 }} onClick={() => setMostrarPresupuesto(false)}>
                        Volver al Dashboard
                    </Button>
                    <PresupuestoPage />
                </div>
            ) : (
                <>
                    <h1 style={{ fontSize: 32, fontWeight: "bold" }}>Dashboard</h1>
                    <p>Bienvenido al sistema de gestión de la fábrica de pastas.</p>

                    <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 16 }}>
                        <Button type="primary" onClick={() => setMostrarListado(true)}>
                            Administración de Clientes
                        </Button>
                        <Button type="primary" onClick={() => setMostrarComprobantes(true)}>
                            Comprobantes de Venta
                        </Button>
                        <Button type="primary" onClick={() => setMostrarMaquinas(true)}>
                            Administración de Máquinas
                        </Button>
                        <Button type="primary" onClick={() => setMostrarProveedores(true)}>
                            Administración de Proveedores
                        </Button>
                        <Button type="primary" onClick={() => setMostrarOrdenes(true)}>
                            Administrar Órdenes
                        </Button>
                        <Button type="primary" onClick={() => setMostrarOrdenesMantenimiento(true)}>
                            Administrar Órdenes de Mantenimiento
                        </Button>
                        <Button type="primary" onClick={() => setMostrarPresupuesto(true)}>
                            Administrar Presupuesto
                        </Button>
                    </div>
                </>
            )}
        </SidebarLayout>
    );
}
