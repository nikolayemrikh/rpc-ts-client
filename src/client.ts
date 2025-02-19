export type TMethod = (...args: unknown[]) => Promise<unknown>

export interface IMethods {
  [key: string]: TMethod | IMethods
}

export const createRpcClient = <T extends object>(baseUrl: string): T => {
  const createHandler = (path: string[] = []): ProxyHandler<IMethods> => ({
    get: (_target, prop, receiver) => {
      console.log('get', prop, receiver);
      if (typeof prop === 'string') {
        const newPath = [...path, prop];
        
        return new Proxy(() => {}, 
        // @ts-ignore
        createHandler(newPath));
      }
    },
    apply: async (_target, _thisArg, args) => {
      const res = await fetch(`${baseUrl}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          method: path.join('.'), 
          params: args 
        }),
      });
      const data = await res.json();
      return data.result;
    }
  });

  return new Proxy({}, createHandler()) as T;
};
