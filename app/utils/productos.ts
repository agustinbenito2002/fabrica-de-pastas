export interface ProductoRegistrado {
  key?: string;
  id: number;
  nombre: string;
  precio?: number;
}

const PRODUCTOS_STORAGE_KEY = "productos-listado";

const productosIniciales: ProductoRegistrado[] = [
  { id: 1, nombre: "Fideo Tallarín", precio: 120 },
  { id: 2, nombre: "Ravioles", precio: 250 }
];

export function getProductosRegistrados(): ProductoRegistrado[] {
  if (typeof window === "undefined") return productosIniciales;

  const saved = localStorage.getItem(PRODUCTOS_STORAGE_KEY);
  if (!saved) return productosIniciales;

  try {
    const productos = JSON.parse(saved);
    return Array.isArray(productos) ? productos : productosIniciales;
  } catch {
    return productosIniciales;
  }
}
