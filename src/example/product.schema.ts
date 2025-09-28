import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { Model, HydratedDocument, Types } from 'mongoose';

// https://mongoosejs.com/docs/typescript/statics-and-methods.html

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DISCONTINUED = 'DISCONTINUED',
}

export type ProductDocument = HydratedDocument<Product, ProductMethods>;

export interface ProductModel extends Model<ProductDocument> {
  createDraft(args: {
    name: string;
    basePrice: number; // 소수 지원: 내부에서 Decimal128로 저장
    attrs?: Record<string, any>; // Mixed
  }): ProductDocument;

  findActiveByTag(tag: string): Promise<ProductDocument[]>;
}

// 이건 단순히 TypeScript 타입 정의 + NestJS SchemaFactory용 메타데이터
// 런타임에 아래 class Product는 Mongoose Document 인스턴스가 아님. 그래서 class Product에 메서드를 선언해도 존재하지 않음.
// 이 클래스가 메서드를 갖게 하고 싶다면 맨 아래의 ProductSchema.loadClass(ProductMethods)를 보자.
@Schema({
  collection: 'products',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Product {
  @Prop({ type: String, required: true }) // required는 false가 기본값.
  name!: string;

  // Decimal128
  @Prop({ type: mongoose.Schema.Types.Decimal128, required: true })
  price!: mongoose.Types.Decimal128;

  // Enum
  @Prop({ type: String, enum: Object.values(ProductStatus), required: true })
  status!: ProductStatus;

  // Array<number>
  @Prop({ type: [Number], default: [] })
  sizes!: number[];

  // Map<string, string>
  @Prop({ type: Map, of: String, default: {} })
  metadata!: Map<string, string>;

  // Mixed
  @Prop({ type: Object, default: {} })
  attrs!: Record<string, any>;

  // Date
  @Prop({ type: Date, default: () => new Date() })
  available_from!: Date;

  // Optional Ref(ObjectId)
  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category_id?: Types.ObjectId;
}

// 여기서 Mongoose Schema 객체가 만들어지고, @Prop 메타데이터로 필드 정의만 들어감.
// 즉, 필드는 Document에 매핑되지만, 클래스 자체의 인스턴스 메서드나 get accessor는 자동으로 들어가지 않아.
export const ProductSchema = SchemaFactory.createForClass(Product);

// instance methods that live on documents
/** methods/statics/virtuals: loadClass 한 번으로 주입 */
class ProductMethods {
  // 정적 팩토리
  static createDraft(
    this: ProductModel,
    args: {
      name: string;
      basePrice: number;
      attrs?: Record<string, any>;
    },
  ) {
    const doc = new this();
    doc.name = args.name;
    doc.price = mongoose.Types.Decimal128.fromString(args.basePrice.toString());
    doc.status = ProductStatus.DRAFT;
    doc.sizes = [];
    doc.metadata = new Map<string, string>();
    doc.attrs = args.attrs ?? {};
    doc.available_from = new Date();
    return doc;
  }

  // 인스턴스: 상태 전환
  publish(this: ProductDocument) {
    this.status = ProductStatus.ACTIVE;
  }

  discontinue(this: ProductDocument, reason?: string) {
    this.status = ProductStatus.DISCONTINUED;
    if (reason) {
      this.metadata.set('discontinue_reason', reason);
      // Map 변경은 Mongoose가 추적하지만 안정적으로 표시 (경로 기반 set은 Mongoose가 자동으로 더티마킹)
      // (this as any).markModified('metadata');
    }
  }

  // 인스턴스: Mixed 안전 업데이트
  upsertAttr(this: ProductDocument, key: string, value: any) {
    this.set(`attrs.${key}`, value);
    // Map 변경은 Mongoose가 추적하지만 안정적으로 표시 (경로 기반 set은 Mongoose가 자동으로 더티마킹)
    // (this as any).markModified('attrs');
    return this;
  }

  // 인스턴스: 태그 추가(배열/중복 방지)
  addTag(this: ProductDocument, tag: string) {
    const tags: string[] = (this.attrs?.tags as string[]) ?? [];
    if (!tags.includes(tag)) {
      tags.push(tag);
      this.set('attrs.tags', tags);
      // Map 변경은 Mongoose가 추적하지만 안정적으로 표시 (경로 기반 set은 Mongoose가 자동으로 더티마킹)
      //   (this as any).markModified('attrs');
    }
    return this;
  }

  // 인스턴스: 세금 포함가 계산(Decimal128 → number)
  priceWithTax(this: ProductDocument, taxRate = 0.1): number {
    const base = Number(this.price.toString());
    return +(base * (1 + taxRate)).toFixed(2);
  }

  // 가상 getter: 태그 수
  get tagCount() {
    const tags: string[] = (this as any).attrs?.tags ?? [];
    return tags.length;
  }

  fixWithMarkModified(this: ProductDocument) {
    this.attrs.foo = 'Y';
    (this as any).markModified('attrs'); // ✅ Mixed 경로 더티마킹
    return this;
  }

  // statics
  static async findActiveByTag(this: ProductModel, tag: string) {
    return this.find({
      status: ProductStatus.ACTIVE,
      'attrs.tags': tag,
    }).exec();
  }
}

// 이걸 하면 ProductMethods.prototype의 메서드/접근자가
// schema.methods/schema.statics/schema.virtuals로 복사돼서, 최종 Document 인스턴스에서 사용할 수 있게 됨.
ProductSchema.loadClass(ProductMethods);
