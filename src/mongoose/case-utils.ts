export function camelToSnake(str: string): string {
  return str.replace(/([A-Z])/g, (m) => `_${m.toLowerCase()}`);
}

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function keysToSnake(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(keysToSnake);
  } else if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (['_id', '__v'].includes(key)) {
        acc[key] = value;
      } else {
        acc[camelToSnake(key)] = keysToSnake(value); // ✅ 재귀
      }
      return acc;
    }, {} as any);
  }
  return obj;
}

export function keysToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(keysToCamel);
  } else if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (['_id', '__v'].includes(key)) {
        acc[key] = value; // ✅ 내부 키는 그대로 둠
      } else {
        acc[snakeToCamel(key)] = keysToCamel(value);
      }
      return acc;
    }, {} as any);
  }
  return obj;
}
