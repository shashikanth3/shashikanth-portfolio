import { lazy } from 'react';

type ComponentModule<T> = { default: T } | { [key: string]: T };

/**
 * Safely resolves lazy-loaded React components, handling both default and named exports.
 */
export function safeLazy<T extends React.ComponentType<any>>(
  importFn: () => Promise<ComponentModule<T>>
) {
  return lazy(() =>
    importFn().then((module) => {
      if ('default' in module) {
        return { default: module.default };
      }
      
      const namedExport = Object.values(module).find((val) => typeof val === 'function');
      if (namedExport) {
        return { default: namedExport as T };
      }
      
      throw new Error("Failed to resolve component export signature.");
    })
  );
}