import {useDependencyManager} from '../dependencyManager';
import {DependenciesContext} from '../context/DependenciesContexts';

/**
 * @name useDependency
 * @description Hook to resolve and return the given dependency
 * @param {string} dependencyKey The key of the dependency to resolve
 * @returns {object} The resolved dependency
 * @example
 *
 *     const SomeComponent = () => {
 *       const someService = useDependency('someService')
 *       return <div />
 *     }
 */
export const useDependency = <T extends any>(dependencyKey: string): T => {
  const dependencyManager = useDependencyManager(DependenciesContext);
  return dependencyManager.resolve(dependencyKey) as T;
};
