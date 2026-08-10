import { impactSnapshot, type ImpactSnapshot } from '@/content/impact';

export interface ImpactRepository {
  getPublicSnapshot(): Promise<ImpactSnapshot>;
}

export const localImpactRepository: ImpactRepository = {
  async getPublicSnapshot() {
    return impactSnapshot;
  },
};
