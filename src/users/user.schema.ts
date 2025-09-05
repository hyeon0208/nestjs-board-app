// // src/mongoose/user.schema.ts
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { HydratedDocument, Model } from 'mongoose';

// @Schema({
//   _id: false,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true },
// })
// export class Profile {
//   @Prop({ alias: 'displayName', type: String }) display_name: string; // save: display_name, use: displayName
//   @Prop({ alias: 'phoneNumber', type: String }) phone_number: string; // save: phone_number, use: phoneNumber
// }
// export const ProfileSchema = SchemaFactory.createForClass(Profile);

// @Schema({
//   collection: 'users',
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true },
// })
// export class User {
//   @Prop({ alias: 'firstName', type: String }) first_name: string; // save: first_name, use: firstName
//   @Prop({ alias: 'createdAt', type: Date }) created_at: Date; // save: created_at, use: createdAt
//   @Prop({ type: ProfileSchema }) profile: Profile;
//   @Prop([String]) tags: string[];

//   addTag(tag: string) {
//     if (!this.tags) this.tags = [];
//     if (!this.tags.includes(tag)) this.tags.push(tag);
//   }
//   getPhoneDigits(): string | undefined {
//     const num = this.profile?.phoneNumber; // alias 통해 접근
//     return num?.replace(/\D/g, '');
//   }
// }

// export type UserDocument = HydratedDocument<User>;
// export type UserModel = Model<UserDocument>;
// export const UserSchema = SchemaFactory.createForClass(User);
// UserSchema.methods.addTag = User.prototype.addTag;
// UserSchema.methods.getPhoneDigits = User.prototype.getPhoneDigits;
