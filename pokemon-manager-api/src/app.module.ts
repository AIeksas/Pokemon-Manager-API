import { Module } from '@nestjs/common';
import { AuthModule } from 'auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PokemonService } from './pokemon.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, PokemonService],
})
export class AppModule {}
