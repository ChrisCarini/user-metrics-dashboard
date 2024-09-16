// Fetchers for organization data and metrics

import { Fetcher } from '..';

export const addOrganizationInfoToResult: Fetcher = async (
  result,
  octokit,
  config,
) => {
  const user = await octokit.users.getByUsername({ username: config.organization });

  return {
    ...result,
    orgInfo: {
      login: user.data.login,
      name: user.data.name ?? user.data.login,
      description: user.data?.description ?? "No Description for Users",
      createdAt: user.data.created_at,
      repositoriesCount: user.data.public_repos,
    },
  };
};
