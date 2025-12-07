import { useState, useEffect, useMemo, useCallback } from "react";
import { IPresenterProvider } from "@/utils/IPresenterProvider";

interface UsePresenterConfig<TViewHandlers, TPresenter> {
  presenterProvider: () => IPresenterProvider<TViewHandlers, TPresenter>;
  viewHandlers: TViewHandlers;
  autoInitialize?: boolean;
}

interface UsePresenterReturn<TPresenter> {
  presenter: TPresenter;
  isPresenterLoaded: boolean;
  reinitializePresenter: () => void;
}

export const usePresenter = <TViewHandlers, TPresenter>({
  presenterProvider,
  viewHandlers,
  autoInitialize = true
}: UsePresenterConfig<TViewHandlers, TPresenter>): UsePresenterReturn<TPresenter> => {
  const [isPresenterLoaded, setIsPresenterLoaded] = useState(false);

  // Memoizar el provider para evitar recreaciones innecesarias
  const memoizedProvider = useMemo(() => presenterProvider(), [presenterProvider]);

  // Crear el presenter cuando cambien los viewHandlers
  const presenter = useMemo(() => {
    return memoizedProvider.getPresenter(viewHandlers);
  }, [memoizedProvider, viewHandlers]);

  // Función para reinicializar el presenter si es necesario
  const reinitializePresenter = useCallback(() => {
    setIsPresenterLoaded(false);
    // Pequeño delay para asegurar que se resetee el estado
    setTimeout(() => setIsPresenterLoaded(true), 0);
  }, []);

  // Auto-inicializar si está habilitado
  useEffect(() => {
    if (autoInitialize && presenter) {
      setIsPresenterLoaded(true);
    }
  }, [presenter, autoInitialize]);

  return {
    presenter,
    isPresenterLoaded,
    reinitializePresenter
  };
}; 