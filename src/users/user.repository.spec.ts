// test/user.repository.spec.ts
import mongoose, { Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User, UserSchema } from './user.schema';
import { MongooseUserRepository } from './user.repository';
import type { UserDocument, UserModel } from './user.schema';

let mongod: MongoMemoryServer;
let conn: mongoose.Connection;
let UserModelImpl: Model<UserDocument> & UserModel;
let repo: MongooseUserRepository;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  conn = await mongoose.createConnection(mongod.getUri()).asPromise();
  UserModelImpl =
    (conn.models[User.name] as any) ??
    conn.model<UserDocument>(User.name, UserSchema as any);
  repo = new MongooseUserRepository(UserModelImpl as any);
});
afterAll(async () => {
  await conn?.close();
  await mongod?.stop();
});
beforeEach(async () => {
  await UserModelImpl.deleteMany({});
});

it('저장 시 snake, 조회 시 camel(Document)', async () => {
  


  const created = await repo.create({
    firstName: 'Neo',
    createdAt: new Date('2025-09-01T00:00:00Z'),
    profile: { displayName: 'neo99', phoneNumber: '010-1234-5678' },
    tags: ['a', 'b'],
  });

  const raw = await conn.db.collection('users').findOne({ _id: created._id });
  console.log('저장된 raw : ', raw);
  expect(raw).toMatchObject({
    first_name: 'Neo',
    created_at: new Date('2025-09-01T00:00:00Z'),
    profile: { display_name: 'neo99', phone_number: '010-1234-5678' },
    tags: ['a', 'b'],
  });

  const doc = await repo.findById(String(created._id));
  expect(doc).toMatchObject({
    firstName: 'Neo',
    profile: { displayName: 'neo99', phoneNumber: '010-1234-5678' },
  });
});

it('lean() 조회도 camel', async () => {
  const created = await repo.create({
    firstName: 'Trinity',
    createdAt: new Date(),
    profile: { displayName: 'trin', phoneNumber: '010-1111-2222' },
    tags: [],
  });
  const lean = await repo.findById(String(created._id), true);
  console.log('저장된 lean : ', lean);
  expect(lean).toMatchObject({
    firstName: 'Trinity',
    profile: { displayName: 'trin', phoneNumber: '010-1111-2222' },
  });

  const byName = await repo.findByFirstName('Trinity', true);
  expect(byName).toMatchObject({
    firstName: 'Trinity',
    profile: { displayName: 'trin' },
  });
});

it('인스턴스 메서드(addTag, getPhoneDigits)', async () => {
  const created = await repo.create({
    firstName: 'Trinity',
    createdAt: new Date(),
    profile: { displayName: 'trin', phoneNumber: '010-1111-2222' },
    tags: [],
  });

  const d = await repo.findById(String(created._id));
  d!.addTag('hero');
  expect(d!.getPhoneDigits()).toBe('01011112222');
  await d!.save();

  const raw = await conn.db
    .collection('users')
    .findOne({ _id: created._id }, { projection: { _id: 0 } });
  expect(raw?.tags).toContain('hero');
});
