export const getProgramDuration = (programName: string): number => {
  const lowerCaseName = programName.toLowerCase();
  if (lowerCaseName.includes('be') || lowerCaseName.includes('b. pharma'))
    return 4;
  if (lowerCaseName.includes('mba') || lowerCaseName.includes('m. pharma'))
    return 2;
  return 4; // Default
};
