import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.db';
import { TmdbService } from 'src/utils/tmdb.service';
import { CreateFavouriteMovieDto } from '../dto/create-favourite-movie.dto';

@Injectable()
export class MovieRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tmdbService: TmdbService,
  ) {}

  async getMovies(page: number) {
    return this.tmdbService.getMovies(page);
  }

  async getFavourites(userId: string) {
    return this.prismaService.favouriteMovie.findMany({
      where: {
        user_id: userId,
      },
      select: {
        movie_id: true,
        backdrop_path: true,
        original_title: true,
        title: true,
        poster_path: true,
        overview: true,
      },
    });
  }

  async addFavourite(userId: string, favouriteMovie: CreateFavouriteMovieDto) {
    const doesFavouriteExist =
      await this.prismaService.favouriteMovie.findUnique({
        where: {
          user_id_movie_id: {
            user_id: userId,
            movie_id: favouriteMovie.movie_id,
          },
        },
        select: {
          movie_id: true,
          backdrop_path: true,
          original_title: true,
          poster_path: true,
          title: true,
        },
      });
    if (doesFavouriteExist) {
      Logger.log(`Movie with id ${favouriteMovie.movie_id} Already exists`);
      return;
    }
    return this.prismaService.favouriteMovie.create({
      data: {
        user_id: userId,
        ...favouriteMovie,
      },
    });
  }

  async deleteFavourite(userId: string, movie_id: number) {
    return this.prismaService.favouriteMovie.delete({
      where: {
        user_id_movie_id: {
          user_id: userId,
          movie_id: movie_id,
        },
      },
    });
  }
}
