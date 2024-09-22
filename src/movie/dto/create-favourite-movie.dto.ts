import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateFavouriteMovieDto {
  @IsNumber()
  @IsNotEmpty()
  movie_id: number;

  @IsString()
  @IsNotEmpty()
  backdrop_path: string;

  @IsString()
  @IsNotEmpty()
  original_title: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  poster_path: string;
  
  @IsString()
  @IsNotEmpty()
  overview: string;
}
