import { useState } from "react";
import { Button } from "antd";
import { SidebarLayout } from "../SidebarLayout";
import ComprobantesVentaPage from "./comprovantesventa";
import OrdenesPage from "./ordenes";

export default function Dashboard() {
    const [mostrarNuevaOrden, setMostrarNuevaOrden] = useState(false);
    const [mostrarNuevoComprobante, setMostrarNuevoComprobante] = useState(false);

    return (
        <SidebarLayout>
            {mostrarNuevaOrden ? (
                <>
                    <Button style={{ marginBottom: 16 }} onClick={() => setMostrarNuevaOrden(false)}>
                        Volver al Dashboard
                    </Button>
                    <OrdenesPage abrirNuevaOrden />
                </>
            ) : mostrarNuevoComprobante ? (
                <>
                    <Button style={{ marginBottom: 16 }} onClick={() => setMostrarNuevoComprobante(false)}>
                        Volver al Dashboard
                    </Button>
                    <ComprobantesVentaPage abrirNuevo />
                </>
            ) : (
                <>
                    <h1 style={{ fontSize: 32, fontWeight: "bold" }}>Dashboard</h1>
                    <p>Bienvenido al sistema de gestión de la fábrica de pastas.</p>
                    <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 16 }}>
                        <Button type="primary" onClick={() => setMostrarNuevaOrden(true)}>
                            Crear Nueva Orden de Pedido
                        </Button>
                        <Button type="primary" onClick={() => setMostrarNuevoComprobante(true)}>
                            Crear Comprobante de Venta
                        </Button>
                    </div>
                </>
            )}
        </SidebarLayout>
    );
}
