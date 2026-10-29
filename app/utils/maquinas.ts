export interface MaquinaRegistrada {
  key?: string;
  id: number;
  tipo: string;
}

const MAQUINAS_STORAGE_KEY = "maquinas-listado";

const maquinasIniciales: MaquinaRegistrada[] = [
  { id: 1, tipo: "Amasadora" },
  { id: 2, tipo: "Cortadora" },
  { id: 3, tipo: "Empaquetadora" }
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
