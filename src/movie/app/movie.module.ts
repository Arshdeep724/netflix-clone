import { Module } from '@nestjs/common';
import { MovieController } from '../controllers/movie.controller';
import { MovieRepository } from '../repositories/movie.repository';
import { PrismaService } from 'src/db/prisma.db';
import { TmdbService } from 'src/utils/tmdb.service';

@Module({
  controllers: [MovieController],
  providers: [MovieRepository, PrismaService,TmdbService],
})
export class MovieModule {}
