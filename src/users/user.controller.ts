// import { Body, Controller, Get, Param, Post } from '@nestjs/common';
// import { ApiTags } from '@nestjs/swagger';
// import { UserService } from './user.service';
// import { CreateUserDto } from './create-user.dto';
// import { User } from './user.schema';

// @ApiTags('users')
// @Controller('users')
// export class UserController {
//   constructor(private readonly userService: UserService) {}

//   @Post()
//   async create(@Body() dto: CreateUserDto): Promise<User> {
//     return this.userService.create(dto);
//   }

//   @Get()
//   async findAll(): Promise<User[]> {
//     return this.userService.findAll();
//   }

//   @Get(':id')
//   async findOne(@Param('id') id: string): Promise<User | null> {
//     return this.userService.findOne(id);
//   }
// }
