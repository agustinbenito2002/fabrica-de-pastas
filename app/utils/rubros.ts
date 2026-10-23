export const RUBROS_STORAGE_KEY = "rubros-pastas-listado";

const RUBROS_INICIALES = [
  "Pastas frescas",
  "Pastas rellenas",
  "Pastas secas",
  "Ñoquis",
];

const RUBROS_EXISTENTES_KEYS = ["materias-listado", "productos-listado"];

export function getRubrosRegistrados(): string[] {
  if (typeof window === "undefined") return RUBROS_INICIALES;

  const rubrosGuardados = localStorage.getItem(RUBROS_STORAGE_KEY);
  let rubros: string[] = RUBROS_INICIALES;

  if (rubrosGuardados) {
    try {
      const parsed: unknown = JSON.parse(rubrosGuardados);
      if (Array.isArray(parsed) && parsed.every((rubro) => typeof rubro === "string")) {
        rubros = parsed;
      }
    } catch {
      rubros = RUBROS_INICIALES;
    }
  }

  const rubrosEnUso = RUBROS_EXISTENTES_KEYS.flatMap((key) => {
    const guardados = localStorage.getItem(key);
    if (!guardados) return [];

    try {
      const registros: unknown = JSON.parse(guardados);
      if (!Array.isArray(registros)) return [];
      return registros.flatMap((registro) =>
        registro && typeof registro.rubro === "string" && registro.rubro.trim()
          ? [registro.rubro.trim()]
          : []
      );
    } catch {
      return [];
    }
  });

  return [...new Set([...rubros, ...rubrosEnUso])];
}

export function saveRubrosRegistrados(rubros: string[]) {
  localStorage.setItem(RUBROS_STORAGE_KEY, JSON.stringify(rubros));
}

export function isRubroEnUso(rubro: string): boolean {
  if (typeof window === "undefined") return false;

  return RUBROS_EXISTENTES_KEYS.some((key) => {
    const guardados = localStorage.getItem(key);
    if (!guardados) return false;

    try {
      const registros: unknown = JSON.parse(guardados);
      return Array.isArray(registros) && registros.some(
        (registro) => registro && registro.rubro === rubro
      );
    } catch {
      return false;
    }
  });
}
