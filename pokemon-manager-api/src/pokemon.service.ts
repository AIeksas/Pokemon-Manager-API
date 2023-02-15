import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Pokemon, Prisma } from '@prisma/client';

type PokemonParams = {
  where?: Prisma.PokemonWhereInput;
  orderBy?: Prisma.PokemonOrderByWithRelationInput;
  skip?: number;
  take?: number;
};

type PokemonQuery = {
  orderBy?: string;
  orderDir?: string;
  name?: string;
  heightGte?: string;
  heightLeq?: string;
  weightGte?: string;
  weightLeq?: string;
  page?: string;
  pageSize?: string;
};

type Error = string;
type PokemonInput = Prisma.PokemonCreateInput | Prisma.PokemonUpdateInput;

@Injectable()
export class PokemonService {
  constructor(private prisma: PrismaService) {}

  async getPokemons(
    params: PokemonParams,
  ): Promise<{ pokemons: Pokemon[]; page: number }> {
    const { where, orderBy, skip, take } = params;
    const pokemons = await this.prisma.pokemon.findMany({
      where,
      orderBy,
      skip,
      take,
    });

    return {
      pokemons,
      page: skip / take + 1,
    };
  }

  constructParams(pokemonQuery: PokemonQuery): PokemonParams {
    return {
      where: this.resolveWhere(pokemonQuery),
      orderBy: this.resolveOrderBy(pokemonQuery),
      ...this.resolvePage(pokemonQuery),
    };
  }

  async createPokemon(data: Prisma.PokemonCreateInput): Promise<Pokemon> {
    return this.prisma.pokemon.create({
      data,
    });
  }

  async updatePokemon(params: {
    where: Prisma.PokemonWhereUniqueInput;
    data: Prisma.PokemonUpdateInput;
  }): Promise<Pokemon> {
    const { data, where } = params;
    return this.prisma.pokemon.update({
      data,
      where,
    });
  }

  async deletePokemon(where: Prisma.PokemonWhereUniqueInput): Promise<Pokemon> {
    return this.prisma.pokemon.delete({
      where,
    });
  }

  async validateId(id: number): Promise<Error | null> {
    if (Number.isInteger(id) && id >= 0) {
      const exist = (await this.getPokemon(id)) !== null;
      if (exist) {
        return null;
      }
    }

    return 'Invalid id';
  }

  resolveData(data: PokemonInput): Prisma.PokemonCreateInput {
    const { name, height, weight, image } = data;
    return {
      name: String(name),
      height: Number(height),
      weight: Number(weight),
      image: String(image),
    };
  }

  validateData(data: PokemonInput): Error[] | null {
    const { name, height, weight, image } = data;
    const errors = [];
    const parsedHeight = Number(height);
    const parsedWeight = Number(weight);

    if (!name) {
      errors.push('Invalid name');
    }

    if (!Number.isInteger(parsedHeight) || parsedHeight < 0) {
      errors.push('Invalid height');
    }

    if (!Number.isInteger(parsedWeight) || parsedWeight < 0) {
      errors.push('Invalid weight');
    }

    //TODO: more complex url validation should be implemented
    if (!image) {
      errors.push('Invalid image url');
    }

    return errors.length > 0 ? errors : null;
  }

  private async getPokemon(id: number): Promise<Pokemon | null> {
    return this.prisma.pokemon.findUnique({
      where: { id },
    });
  }

  private resolvePage(pokemonQuery: PokemonQuery): {
    skip: number;
    take: number;
  } {
    const { pageSize, page } = pokemonQuery;
    const validPageSize = this.resolvePageSize(pageSize);
    const resolvedPage = this.resolveNumber(page);
    const validPage = !resolvedPage || resolvedPage < 1 ? 1 : resolvedPage;

    return {
      skip: validPageSize * (validPage - 1),
      take: validPageSize,
    };
  }

  private resolvePageSize(pageSize: string): number {
    switch (pageSize) {
      case undefined:
      case '10':
        return 10;
      case '20':
        return 20;
      case '50':
        return 50;
      default:
        throw new BadRequestException(
          'Invalid page size. Valid sizes: 10, 20, 50',
        );
    }
  }

  private resolveWhere(pokemonQuery: PokemonQuery): Prisma.PokemonWhereInput {
    const { name, heightGte, heightLeq, weightGte, weightLeq } = pokemonQuery;
    return {
      name: {
        contains: name,
      },
      height: {
        gte: this.resolveNumber(heightGte),
        lte: this.resolveNumber(heightLeq),
      },
      weight: {
        gte: this.resolveNumber(weightGte),
        lte: this.resolveNumber(weightLeq),
      },
    };
  }

  private resolveOrderBy(
    pokemonQuery: PokemonQuery,
  ): Prisma.PokemonOrderByWithRelationInput {
    const { orderBy, orderDir } = pokemonQuery;
    const orderDirValue = this.parseOrderDir(orderDir);

    switch (orderBy) {
      case 'name':
        return {
          name: orderDirValue,
        };
      case 'height':
        return {
          name: orderDirValue,
        };
      case 'weight':
        return {
          name: orderDirValue,
        };
      default:
        return undefined;
    }
  }

  private parseOrderDir(orderDir: string): Prisma.SortOrder {
    return String(orderDir) === 'desc' ? 'desc' : 'asc';
  }

  private resolveNumber(number?: string): number | undefined {
    const parsedNumber = Number(number);
    return Number.isInteger(parsedNumber) ? parsedNumber : undefined;
  }
}
