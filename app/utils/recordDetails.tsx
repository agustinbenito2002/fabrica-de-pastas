import type { ReactNode } from "react";
import { Descriptions, Modal } from "antd";

const fieldLabels: Record<string, string> = {
  id: "ID",
  key: "Clave",
  nombre: "Nombre",
  fecha: "Fecha",
  cliente: "Cliente",
  proveedor: "Proveedor",
  productos: "Productos",
  cantidad: "Cantidad",
  precio: "Precio unitario",
  total: "Total",
  estado: "Estado",
  tipo: "Tipo",
  email: "Email",
  telefono: "Teléfono",
  direccion: "Dirección",
  ciudad: "Ciudad",
  provincia: "Provincia",
  dni: "DNI",
  cuit: "CUIT",
  rubro: "Rubro",
  recetaId: "ID de receta",
  responsable: "Responsable",
  fechaMantenimiento: "Fecha de mantenimiento",
  tipoMantenimiento: "Tipo de mantenimiento",
  nroPedido: "Número de pedido",
  tipoOrden: "Tipo de orden",
  observaciones: "Observaciones",
  numero: "Número",
  deuda: "Deuda",
  estadoDeuda: "Estado de deuda",
  tipoCliente: "Tipo de cliente",
  nombreComercio: "Nombre del comercio",
  segmentoComercial: "Segmento comercial",
  condicionPago: "Condición de pago",
};

function getFieldLabel(field: string) {
  return fieldLabels[field] ?? field.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

function renderValue(value: unknown): ReactNode {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sí" : "No";

  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return (
      <ul className="record-details-list">
        {value.map((item, index) => (
          <li key={index}>{renderValue(item)}</li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    return (
      <Descriptions
        size="small"
        column={1}
        items={Object.entries(value).map(([field, fieldValue]) => ({
          key: field,
          label: getFieldLabel(field),
          children: renderValue(fieldValue),
        }))}
      />
    );
  }

  return String(value);
}

export function showRecordDetails(title: string, record: object) {
  Modal.info({
    title,
    width: 640,
    content: (
      <Descriptions
        bordered
        size="small"
        column={1}
        items={Object.entries(record).map(([field, value]) => ({
          key: field,
          label: getFieldLabel(field),
          children: renderValue(value),
        }))}
      />
    ),
  });
}
