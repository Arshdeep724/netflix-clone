import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { MovieRepository } from '../repositories/movie.repository';
import { Public } from 'src/auth/decorators';
import { CreateFavouriteMovieDto } from '../dto/create-favourite-movie.dto';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieRepository: MovieRepository) {}

  @Get('favourite')
  async getFavourites(@Req() req) {
    return this.movieRepository.getFavourites(req.user.id);
  }

  @Public()
  @Get()
  async getMovies(@Query('page') page: number) {
    return this.movieRepository.getMovies(+page);
  }

  @Post('favourite')
  async addFavourite(@Req() req, @Body() body: CreateFavouriteMovieDto) {
    return this.movieRepository.addFavourite(req.user.id, body);
  }

  @Delete('favourite')
  async deleteFavourite(@Req() req, @Query('movie_id') movie_id: number) {
    return this.movieRepository.deleteFavourite(req.user.id, +movie_id);
  }
}
