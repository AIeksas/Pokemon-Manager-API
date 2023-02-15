import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Pokemon as PokemonModel } from '@prisma/client';
import { PokemonService } from './pokemon.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get('pokemon')
  async getPokemons(
    @Query('orderBy') orderBy?: string,
    @Query('orderDir') orderDir?: string,
    @Query('name') name?: string,
    @Query('height[gte]') heightGte?: string,
    @Query('height[leq]') heightLeq?: string,
    @Query('weight[gte]') weightGte?: string,
    @Query('weight[leq]') weightLeq?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<{ pokemons: PokemonModel[]; page: number }> {
    const params = this.pokemonService.constructParams({
      name,
      heightGte,
      heightLeq,
      weightGte,
      weightLeq,
      orderBy,
      orderDir,
      page,
      pageSize,
    });

    return this.pokemonService.getPokemons(params);
  }

  @Post('pokemon')
  @UseGuards(AuthGuard('basic'))
  async createPokemon(
    @Body()
    pokemonData: {
      name: string;
      height: number;
      weight: number;
      image: string;
    },
  ): Promise<PokemonModel> {
    const validationResult = this.pokemonService.validateData(pokemonData);
    if (validationResult !== null) {
      throw new BadRequestException(validationResult);
    }

    const input = this.pokemonService.resolveData(pokemonData);
    return this.pokemonService.createPokemon(input);
  }

  @Put('pokemon/:id')
  @UseGuards(AuthGuard('basic'))
  async publishPokemon(
    @Param('id') id: string,
    @Body()
    pokemonData: {
      name: string;
      height: number;
      weight: number;
      image: string;
    },
  ): Promise<PokemonModel> {
    const validationResult = this.pokemonService.validateData(pokemonData);
    if (validationResult !== null) {
      throw new BadRequestException(validationResult);
    }

    const idValidationResult = await this.pokemonService.validateId(Number(id));
    if (idValidationResult !== null) {
      throw new BadRequestException(idValidationResult);
    }

    const input = this.pokemonService.resolveData(pokemonData);
    return this.pokemonService.updatePokemon({
      where: { id: Number(id) },
      data: input,
    });
  }

  @Delete('pokemon/:id')
  @UseGuards(AuthGuard('basic'))
  async deletePokemon(@Param('id') id: string): Promise<PokemonModel> {
    const validationResult = await this.pokemonService.validateId(Number(id));
    if (validationResult !== null) {
      throw new BadRequestException(validationResult);
    }

    return this.pokemonService.deletePokemon({ id: Number(id) });
  }
}
