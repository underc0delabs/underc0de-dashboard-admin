import React from 'react';
import {createContext} from 'react';
import {DependencyManager} from '../dependencyManager';

export const DependenciesContext = createContext<DependencyManager>(
  {} as DependencyManager,
);

export function DependenciesContextProvider({children, dependencyManager}) {
  return (
    <DependenciesContext.Provider value={dependencyManager}>
      {children}
    </DependenciesContext.Provider>
  );
}
