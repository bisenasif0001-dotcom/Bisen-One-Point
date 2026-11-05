export const DUA_PRINT_SPEC = '250 GSM glossy';
// A-series paper doubles in area at each larger size; round up to whole rupees.
export const DUA_PRINT_PRICES = Object.fromEntries(
  ['A5', 'A4', 'A3', 'A2', 'A1'].map((size, index) => [size, Math.ceil(85 * 2 ** (index - 2))])
);
