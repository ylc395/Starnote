import { singleton, container } from 'tsyringe';
import { isWithId, Star } from 'domain/entity';
import { STAR_DAO_TOKEN } from './daoTokens';
import { isEmpty, map, pick } from 'lodash';

@singleton()
export class StarRepository {
  private readonly starDao = container.resolve(STAR_DAO_TOKEN);
  createStar(star: Star) {
    this.starDao.create(star.toDataObject());
  }

  fetchAll() {
    return this.starDao.all().then((result) => result.map(Star.from));
  }

  updateStar(star: Star) {
    const payload = pick(star.toDataObject(), ['id', 'sortOrder']);

    if (!isWithId(payload)) {
      throw new Error('no starId when update');
    }

    return this.starDao.update(payload);
  }

  deleteStars(...stars: Star[]) {
    if (!isEmpty(stars)) {
      return this.starDao.deleteByIds(map(stars, 'id'));
    }
  }
}
