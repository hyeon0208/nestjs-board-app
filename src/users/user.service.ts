// import { Injectable } from '@nestjs/common';
// import { User } from './user.schema';
// import { CreateUserDto } from './create-user.dto';
// import { MongooseUserRepository } from './user.repository';

// @Injectable()
// export class UserService {
//   constructor(private readonly userRepository: MongooseUserRepository) {}

//   async create(dto: CreateUserDto) {
//     return this.userRepository.create(dto as Partial<User>);
//   }

//   async findAll() {
//     return this.userRepository.findAll();
//   }

//   async findOne(id: string) {
//     return this.userRepository.findById(id);
//   }

//   async findByFirstName(name: string) {
//     return this.userRepository.findByFirstName(name);
//   }

//   async addTag(id: string, tag: string) {
//     return this.userRepository.addTag(id, tag);
//   }
// }
