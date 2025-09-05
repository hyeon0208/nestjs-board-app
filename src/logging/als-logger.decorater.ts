import { asyncContext } from './async-context';

export function AlsLogger(): MethodDecorator {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value as (...args: any[]) => unknown;

    descriptor.value = function <T>(...args: any[]): unknown {
      return asyncContext.startWithParent(
        {},
        () => original.apply(this, args) as T,
      );
    };

    return descriptor;
  };
}
