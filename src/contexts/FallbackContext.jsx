import { createContext, useContext } from 'react';

export const FallbackContext = createContext(false);

export function useFallback() {
  return useContext(FallbackContext);
}
