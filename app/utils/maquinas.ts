export interface MaquinaRegistrada {
  key?: string;
  id: string;
  tipo: string;
}

const MAQUINAS_STORAGE_KEY = "maquinas-listado";

const maquinasIniciales: MaquinaRegistrada[] = [
  { id: "M-001", tipo: "Amasadora" },
  { id: "M-002", tipo: "Cortadora" },
  { id: "M-003", tipo: "Empaquetadora" }
];

export function getMaquinasRegistradas(): MaquinaRegistrada[] {
  if (typeof window === "undefined") return maquinasIniciales;

  const saved = localStorage.getItem(MAQUINAS_STORAGE_KEY);
  if (!saved) return maquinasIniciales;

  try {
    const maquinas = JSON.parse(saved);
    return Array.isArray(maquinas) ? maquinas : maquinasIniciales;
  } catch {
    return maquinasIniciales;
  }
}
