
/**
 * Normaliza un string eliminando tildes, caracteres especiales y pasando a minúsculas.
 */
export const normalize = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, '')
    .trim();
};

/**
 * Calcula la distancia de Levenshtein entre dos strings.
 */
export const getLevenshteinDistance = (a: string, b: string): number => {
  const tmp = [];
  for (let i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
};

/**
 * Verifica si una respuesta es válida basado en el modo flexible.
 */
export const validateAnswer = (input: string, target: string, flexible: boolean): boolean => {
  const nInput = normalize(input);
  const nTarget = normalize(target);

  if (nInput === nTarget) return true;
  if (nInput.length < 2) return false;

  if (flexible) {
    // 1. Contenido parcial (ej: "Imagine" en "Imagine - Remastered")
    if (nTarget.includes(nInput) || nInput.includes(nTarget)) return true;
    
    // 2. Distancia de Levenshtein (tolerancia de 2 caracteres)
    const distance = getLevenshteinDistance(nInput, nTarget);
    if (distance <= 2) return true;
  }

  return false;
};
