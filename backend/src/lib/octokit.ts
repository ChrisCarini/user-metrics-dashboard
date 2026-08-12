import { paginateGraphql } from '@octokit/plugin-paginate-graphql';
import { retry } from '@octokit/plugin-retry';
import { throttling } from '@octokit/plugin-throttling';
import { Octokit } from '@octokit/rest';

export const SECONDARY_RATE_LIMIT_RETRY_ATTEMPTS = 3;

export const onSecondaryRateLimit = (
  retryAfter: number,
  options: { method: string; url: string },
  octokit: { log: Pick<Octokit['log'], 'warn'> },
  retryCount: number,
) => {
  if (retryCount < SECONDARY_RATE_LIMIT_RETRY_ATTEMPTS) {
    const retryAttempt = retryCount + 1;
    octokit.log.warn(
      `Secondary rate limit detected for request ${options.method} ${options.url} - retrying in ${retryAfter} seconds (attempt ${retryAttempt}/${SECONDARY_RATE_LIMIT_RETRY_ATTEMPTS})`,
    );
    return true;
  }

  octokit.log.warn(
    `Secondary rate limit retry limit reached for request ${options.method} ${options.url} after ${SECONDARY_RATE_LIMIT_RETRY_ATTEMPTS} attempts`,
  );
  return false;
};

/**
 * Creates a new octokit instance that is authenticated as the user
 * @param token personal access token
 * @returns Octokit authorized with the personal access token
 */
export const personalOctokit = (token: string) => {
  // Not sure if plugin order matters
  const ModifiedOctokit = Octokit.plugin(paginateGraphql, retry, throttling);
  return new ModifiedOctokit({
    auth: token,
    throttle: {
      onRateLimit: (retryAfter, options, octokit, retryCount) => {
        octokit.log.warn(
          `Request quota exhausted for request ${options.method} ${options.url} - retrying in ${retryAfter} seconds`,
        );

        if (retryCount < 1) {
          // only retries once
          octokit.log.info(`Retry attempt ${retryCount + 1}, retrying...`);
          return true;
        }
      },
      onSecondaryRateLimit,
    },
  });
};

export const checkRateLimit = async (octokit: CustomOctokit) => {
  const rateLimit = await octokit.rateLimit.get();
  const {
    core: { limit, remaining, reset },
  } = rateLimit.data.resources;
  const resetDate = new Date(reset * 1000);

  return {
    limit,
    remaining,
    reset,
    resetDate,
  };
};

export type CustomOctokit = ReturnType<typeof personalOctokit>;
