import { useState } from "react";
import { Button, Input, message, Modal, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "../components/PageHeader";
import {
  getRubrosRegistrados,
  isRubroEnUso,
  saveRubrosRegistrados,
} from "../utils/rubros";
import { textSorter } from "../utils/tableSort";
import { showRecordDetails } from "../utils/recordDetails";

interface Rubro {
  nombre: string;
}

export default function RubrosPage() {
  const [rubros, setRubros] = useState(getRubrosRegistrados);
  const [nuevoRubro, setNuevoRubro] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const agregarRubro = () => {
    const nombre = nuevoRubro.trim();
    if (!nombre) {
      message.warning("Ingrese el nombre del rubro");
      return;
    }
    if (rubros.some((rubro) => rubro.toLocaleLowerCase() === nombre.toLocaleLowerCase())) {
      message.error("Ese rubro ya existe");
      return;
    }

    const actualizados = [...rubros, nombre];
    saveRubrosRegistrados(actualizados);
    setRubros(actualizados);
    setNuevoRubro("");
    message.success("Rubro agregado");
  };

  const eliminarRubro = (nombre: string) => {
    Modal.confirm({
      title: "¿Eliminar rubro?",
      content: `Se eliminará el rubro "${nombre}"`,
      okText: "Eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: () => {
        if (isRubroEnUso(nombre)) {
          message.error("No se puede eliminar un rubro asignado a insumos o productos");
          return;
        }

        const actualizados = rubros.filter((rubro) => rubro !== nombre);
        saveRubrosRegistrados(actualizados);
        setRubros(actualizados);
        message.success("Rubro eliminado");
      },
    });
  };

  const q = busqueda.trim().toLocaleLowerCase();
  const rubrosFiltrados = rubros
    .filter((nombre) => nombre.toLocaleLowerCase().includes(q))
    .map((nombre) => ({ nombre }));

  const columns: ColumnsType<Rubro> = [
    { title: "Rubro", dataIndex: "nombre", key: "nombre", sorter: textSorter((rubro: Rubro) => rubro.nombre) },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: unknown, record: Rubro) => (
        <>
          <Button type="link" onClick={() => showRecordDetails("Detalle del rubro", record)}>
            Ver
          </Button>
          <Button type="link" danger onClick={() => eliminarRubro(record.nombre)}>
            Eliminar
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <PageHeader title="Rubros para Pastas" />
      <Space wrap style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Space.Compact>
          <Input
            aria-label="Nombre del nuevo rubro"
            placeholder="Nuevo rubro"
            value={nuevoRubro}
            onChange={(event) => setNuevoRubro(event.target.value)}
            onPressEnter={agregarRubro}
          />
          <Button type="primary" onClick={agregarRubro}>
            Agregar rubro
          </Button>
        </Space.Compact>
        <Input.Search
          placeholder="Buscar rubro"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          style={{ width: 360 }}
          allowClear
        />
      </Space>
      <Table
        columns={columns}
        dataSource={rubrosFiltrados}
        rowKey="nombre"
        bordered
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
