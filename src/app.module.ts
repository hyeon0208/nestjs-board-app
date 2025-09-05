import { Module } from '@nestjs/common';
import { BoardsModule } from './boards/boards.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ScrapModule } from './scrap/scrap.module';
import { MongooseModule } from '@nestjs/mongoose';
// import { UserModule } from './users/user.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_URI!,
      }),
    }),
    PrismaModule,
    BoardsModule,
    AuthModule,
    // UserModule,
    ScrapModule,
  ],
})
export class AppModule {}
