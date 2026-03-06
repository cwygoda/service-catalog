import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { catalog } = await parent();

  return {
    dataStores: catalog.dataStores,
  };
};
