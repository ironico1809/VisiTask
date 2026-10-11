import { useEffect } from 'react';

export function useTituloPagina(titulo: string) {
  useEffect(() => {
    const tituloPrevio = document.title;
    document.title = `${titulo} — visitask`;
    return () => {
      document.title = tituloPrevio;
    };
  }, [titulo]);
}

export const usePageTitle = useTituloPagina;
