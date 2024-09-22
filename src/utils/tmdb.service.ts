import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ETmdbUrls } from 'enums';

@Injectable()
export class TmdbService {
  constructor(private readonly configService: ConfigService) {}

  async getMovies(page: number) {
    const movieEndpoints = [
      ETmdbUrls.GET_NOW_PLAYING_MOVIES,
      ETmdbUrls.GET_POPULAR_MOVIES,
      ETmdbUrls.GET_TOP_RATED_MOVIES,
      ETmdbUrls.GET_UPCOMING_MOVIES,
    ];
    const [nowPlayingMovies, popularMovies, topRatedMovies, upcomingMovies] =
      await Promise.all(
        movieEndpoints.map((endpoint) =>
          axios
            .get(endpoint, {
              headers: {
                Authorization: `Bearer ${this.configService.get('TMDB_API_ACCESS_TOKEN')}`,
              },
              params: {
                page: page,
              },
            })
            .then((res) =>
              res.data.results.map((r) => {
                return {
                  ...r,
                  backdrop_path: ETmdbUrls.IMAGE_PREFIX + r.backdrop_path,
                  poster_path: ETmdbUrls.IMAGE_PREFIX + r.poster_path,
                };
              }),
            ),
        ),
      );
    return {
      nowPlayingMovies,
      popularMovies,
      topRatedMovies,
      upcomingMovies,
    };
  }
}
