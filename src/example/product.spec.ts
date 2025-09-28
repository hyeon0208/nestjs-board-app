import mongoose from 'mongoose';
import { Product, ProductStatus } from './product.schema';
import { connectMongo, closeMongo, clearDB } from './in-memory-mongo';

describe('Product model (mixed + various types + instance methods)', () => {
  let M: Product;

  beforeAll(async () => {
    await connectMongo();
    M = mongoose.model<Product>;
  });

  afterAll(closeMongo);
  beforeEach(clearDB);

  test('static factory createDraft → create/save', async () => {
    const draft = M.createDraft({
      name: 'Basic Tee',
      basePrice: 19.9,
      attrs: { color: 'black' },
    });
    await M.create(draft);

    const found = await M.findOne({ name: 'Basic Tee' });

    expect(found).not.toBeNull();
    expect(found!.status).toBe(ProductStatus.DRAFT);
    expect(Number(found!.price.toString())).toBeCloseTo(19.9, 3);
    expect(found!.attrs.color).toBe('black');
  });

  test('instance methods: publish, discontinue(with metadata)', async () => {
    const p = await M.create(M.createDraft({ name: 'Mug', basePrice: 7.5 }));
    p.publish();
    await p.save();

    const re = await M.findById(p._id);
    expect(re!.status).toBe(ProductStatus.ACTIVE);

    re!.discontinue('outdated');
    await re!.save();
    const re2 = await M.findById(p._id);
    expect(re2!.status).toBe(ProductStatus.DISCONTINUED);
    expect(re2!.metadata.get('discontinue_reason')).toBe('outdated');
  });

  test('Mixed update via upsertAttr + markModified', async () => {
    const p = await M.create(M.createDraft({ name: 'Hat', basePrice: 12 }));
    p.upsertAttr('material', 'cotton');
    await p.save();

    const re = await M.findById(p._id).lean(false);
    expect(re!.attrs.material).toBe('cotton');
  });

  test('Array-in-Mixed: addTag, findActiveByTag', async () => {
    const p = await M.create(
      M.createDraft({ name: 'Sneakers', basePrice: 79 }),
    );
    p.addTag('shoes').addTag('sport');
    p.publish();
    await p.save();

    const list = await M.findActiveByTag('shoes');
    expect(list.length).toBe(1);
    expect(list[0].tagCount).toBe(2);
  });

  test('Decimal128 math helper: priceWithTax', async () => {
    const p = await M.create(M.createDraft({ name: 'Bottle', basePrice: 10 }));
    expect(p.priceWithTax(0.1)).toBe(11.0);
  });

  test('Map persistence and change tracking', async () => {
    const p = await M.create(
      M.createDraft({ name: 'Notebook', basePrice: 3.2 }),
    );
    p.metadata.set('pages', '120');
    await p.save(); // Map은 자동 추적되지만 안전하게 쓰려면 markModified 고려
    const re = await M.findById(p._id).lean().exec();
    console.log(re?.tagCount());
    // re?.tagCount();
    // expect(re!.metadata.get('pages')).toBe('120');
  });

  test('lean 결과에는 인스턴스 메서드가 없다', async () => {
    const p = await M.create(M.createDraft({ name: 'Pen', basePrice: 1.5 }));
    const plain = await M.findById(p._id).lean();
    expect(typeof (plain as any).publish).toBe('undefined');
  });

  test('markModified로 Mixed 변경을 저장한다', async () => {
    const p = await M.create(M.createDraft({ name: 'B', basePrice: 1 }));
    p.fixWithMarkModified();
    await p.save();

    const re = await M.findById(p._id).lean(false);
    expect(re!.attrs.foo).toBe('Y'); // ✅ 저장됨
  });
});
