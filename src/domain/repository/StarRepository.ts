/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { singleton, inject } from 'tsyringe';
import { isWithId, StarDataObject, Star } from 'domain/entity';
import type { Dao } from './types';
import { STAR_DAO_TOKEN } from './daoTokens';
import { map, pick } from 'lodash';

@singleton()
export class StarRepository {
  constructor(
    @inject(STAR_DAO_TOKEN) protected starDao?: Dao<StarDataObject>,
  ) {}
  createStar(star: Star) {
    this.starDao!.create(star.toDataObject());
  }

  fetchAll() {
    return this.starDao!.all().then((result) => result.map(Star.from));
  }

  updateStar(star: Star) {
    const payload = pick(star.toDataObject(), ['id', 'sortOrder']);

    if (!isWithId(payload)) {
      throw new Error('no starId when update');
    }

    return this.starDao!.update(payload);
  }

  deleteStars(...stars: Star[]) {
    return this.starDao!.hardDeleteByIds(map(stars, 'id'));
  }
}
