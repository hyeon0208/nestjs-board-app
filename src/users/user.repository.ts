// // src/mongoose/user.repository.ts
// import { InjectModel } from '@nestjs/mongoose';
// import { Injectable } from '@nestjs/common';
// import { User } from './user.schema';
// import { Model } from 'mongoose';
// import { UserDocument } from './user.schema';

// @Injectable()
// export class MongooseUserRepository {
//   constructor(
//     @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
//   ) {}

//   async create(data: Partial<User>): Promise<User> {
//     const user = new this.userModel(data);
//     return user.save(); // ✅ toJSON transform → camelCase 로 응답
//   }

//   async findById(id: string, lean = false): Promise<User | null> {
//     return lean
//       ? this.userModel.findById(id).lean().exec()
//       : this.userModel.findById(id).exec();
//   }

//   async findAll(lean = false): Promise<User[]> {
//     return lean
//       ? this.userModel.find().lean().exec()
//       : this.userModel.find().exec();
//   }

//   async findByFirstName(name: string, lean = false): Promise<User | null> {
//     // ⚠️ DB 필드는 snake_case 이므로 first_name
//     const query = this.userModel.findOne({ first_name: name });
//     return lean ? query.lean().exec() : query.exec();
//   }

//   async addTag(id: string, tag: string): Promise<User | null> {
//     const doc = await this.userModel.findById(id).exec();
//     if (!doc) return null;

//     // ✅ 메서드 호출 가능 (UserSchema.methods.addTag = ...)
//     doc.addTag(tag);
//     await doc.save();
//     return doc;
//   }
// }
