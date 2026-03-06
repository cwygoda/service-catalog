import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { catalog } = await parent();

  return {
    useCases: catalog.useCases,
  };
};
