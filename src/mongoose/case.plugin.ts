import { keysToSnake, keysToCamel } from './case-utils';

export function CasePlugin(schema) {
  schema.pre('save', function (next) {
    const raw = this.toObject({ depopulate: true });
    const converted = keysToSnake(raw);

    Object.keys(this.toObject()).forEach((k) => {
      if (!['_id', '__v'].includes(k)) {
        this.set(k, undefined, { strict: false });
      }
    });

    Object.entries(converted).forEach(([k, v]) => {
      this.set(k, v, { strict: false });
    });

    next();
  });

  const transform = (_: any, ret: any) => {
    ret = keysToCamel(ret);

    if (ret._id) {
      ret.id = ret._id.toString();
      delete ret._id;
    }

    delete ret.__v;

    return ret;
  };

  schema.set('toObject', { virtuals: true, transform });
  schema.set('toJSON', { virtuals: true, transform });
}
