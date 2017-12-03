let generation = 0 ;

export const didUpdate = () => generation++;
export const getGeneration = () => generation;