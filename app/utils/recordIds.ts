type StoredRecord = Record<string, unknown>;
type StoredRecordWithId = StoredRecord & { id: number };

const MIGRATION_STORAGE_KEY = "numeric-ids-migrated-v1";
let hasMigrated = false;

const collectionKeys = [
  "clientes-listado",
  "materias-listado",
  "productos-listado",
  "proveedores-listado",
  "maquinas-listado",
  "recetas-listado",
  "ordenes-listado",
  "ordenes-mantenimiento-listado",
  "presupuestos-listado",
  "compras-listado",
  "comprobantes-listado",
];

export function getNextId(records: ReadonlyArray<{ id: number }>): number {
  return records.reduce((highest, record) => Math.max(highest, record.id), 0) + 1;
}

function readStoredArray(key: string): unknown[] | null {
  const saved = localStorage.getItem(key);
  if (!saved) return null;

  const records: unknown = JSON.parse(saved);
  if (!Array.isArray(records)) {
    console.error(`Los datos guardados en "${key}" no tienen el formato esperado.`);
    return null;
  }

  return records;
}

function isStoredRecord(value: unknown): value is StoredRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function remapProductReferences(
  key: string,
  productIds: Map<string, number>,
  productIdsByName: Map<string, number>,
) {
  const records = readStoredArray(key);
  if (!records) return;

  const updateProduct = (item: Record<string, unknown>) => {
    const name = item.nombre ?? item.descripcion;
    const id = item.id;
    const mappedId =
      (id !== undefined && productIds.get(String(id))) ??
      (typeof name === "string" ? productIdsByName.get(name) : undefined);

    return mappedId === undefined ? item : { ...item, id: mappedId };
  };

  const updated = records.map((value) => {
    if (!isStoredRecord(value)) return value;
    const record = value;

    if (key === "recetas-listado") {
      const productoFinal = record.productoFinal;
      return {
        ...record,
        ...(Array.isArray(record.ingredientes)
          ? {
              ingredientes: record.ingredientes.map((item) =>
                typeof item === "object" && item !== null
                  ? updateProduct(item as Record<string, unknown>)
                  : item
              ),
            }
          : {}),
        ...(typeof productoFinal === "object" && productoFinal !== null
          ? { productoFinal: updateProduct(productoFinal as Record<string, unknown>) }
          : {}),
      };
    }

    const itemKey =
      key === "presupuestos-listado" || key === "ventas-listado"
        ? "items"
        : "productos";
    return {
      ...record,
      ...(Array.isArray(record[itemKey])
        ? {
            [itemKey]: (record[itemKey] as unknown[]).map((item) =>
              typeof item === "object" && item !== null
                ? updateProduct(item as Record<string, unknown>)
                : item
            ),
          }
        : {}),
    };
  });

  const serialized = JSON.stringify(updated);
  if (localStorage.getItem(key) !== serialized) {
    localStorage.setItem(key, serialized);
  }
}

export function migrateStoredIds() {
  if (typeof window === "undefined" || hasMigrated) return;
  if (localStorage.getItem(MIGRATION_STORAGE_KEY) === "1") {
    hasMigrated = true;
    return;
  }

  const storedData = new Map<string, StoredRecord[]>();
  for (const key of collectionKeys) {
    const records = readStoredArray(key);
    if (!records) {
      if (localStorage.getItem(key) !== null) return;
      continue;
    }
    if (!records.every(isStoredRecord)) {
      console.error(`Los datos guardados en "${key}" contienen registros inválidos.`);
      return;
    }
    storedData.set(key, records);
  }

  const sales = readStoredArray("ventas-listado");
  if (!sales && localStorage.getItem("ventas-listado") !== null) return;

  const idMaps = new Map<string, Map<string, number>>();
  const dataByKey = new Map<string, StoredRecordWithId[]>();

  for (const key of collectionKeys) {
    const savedRecords = storedData.get(key);
    if (!savedRecords) continue;

    const idMap = new Map<string, number>();
    const duplicateIds = new Set<string>();
    const normalized = savedRecords.map((record, index): StoredRecordWithId => {
      const nextId = index + 1;
      if (record.id !== undefined) {
        const oldId = String(record.id);
        if (idMap.has(oldId)) {
          duplicateIds.add(oldId);
          idMap.delete(oldId);
        } else if (!duplicateIds.has(oldId)) {
          idMap.set(oldId, nextId);
        }
      }
      return { ...record, id: nextId };
    });

    idMaps.set(key, idMap);
    dataByKey.set(key, normalized);
    const serialized = JSON.stringify(normalized);
    if (localStorage.getItem(key) !== serialized) {
      localStorage.setItem(key, serialized);
    }
  }

  const products = dataByKey.get("productos-listado") ?? [];
  const productIds = idMaps.get("productos-listado") ?? new Map<string, number>();
  const productIdsByName = new Map(
    products.map((product) => [String(product.nombre), Number(product.id)])
  );

  for (const key of [
    "ordenes-listado",
    "compras-listado",
    "comprobantes-listado",
    "presupuestos-listado",
    "recetas-listado",
    "ventas-listado",
  ]) {
    remapProductReferences(key, productIds, productIdsByName);
  }

  const recipeIds = idMaps.get("recetas-listado");
  if (recipeIds) {
    const productRecords = dataByKey.get("productos-listado");
    if (productRecords) {
      const updated = productRecords.map((product) => {
        const recipeId = product.recetaId;
        const mappedId =
          recipeId === undefined ? undefined : recipeIds.get(String(recipeId));
        return mappedId === undefined
          ? product
          : { ...product, recetaId: String(mappedId) };
      });
      localStorage.setItem("productos-listado", JSON.stringify(updated));
    }
  }

  const machineIds = idMaps.get("maquinas-listado");
  const machines = dataByKey.get("maquinas-listado") ?? [];
  if (machineIds) {
    const maintenance = dataByKey.get("ordenes-mantenimiento-listado");
    if (maintenance) {
      const updated = maintenance.map((order) => {
        const maquinaId = order.maquinaId;
        const maquina = order.maquina;
        const matchingMachine =
          typeof maquina === "string"
            ? machines.find((machine) =>
                maquina.includes(String(machine.tipo))
              )
            : undefined;
        const mappedId =
          (maquinaId !== undefined && machineIds.get(String(maquinaId))) ??
          matchingMachine?.id;
        return {
          ...order,
          ...(mappedId === undefined ? {} : { maquinaId: mappedId }),
          ...(matchingMachine ? { maquina: matchingMachine.tipo } : {}),
        };
      });
      localStorage.setItem(
        "ordenes-mantenimiento-listado",
        JSON.stringify(updated)
      );
    }
  }

  localStorage.setItem(MIGRATION_STORAGE_KEY, "1");
  hasMigrated = true;
}
