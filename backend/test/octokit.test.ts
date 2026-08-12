import { describe, expect, it, vi } from 'vitest';
import {
  SECONDARY_RATE_LIMIT_RETRY_ATTEMPTS,
  onSecondaryRateLimit,
} from '../src/lib/octokit';

const requestOptions = {
  method: 'POST',
  url: '/graphql',
};

describe('onSecondaryRateLimit', () => {
  it.each([0, 1, 2])(
    'retries after the requested delay for retry count %i',
    (retryCount) => {
      const warn = vi.fn();

      const shouldRetry = onSecondaryRateLimit(
        60,
        requestOptions,
        { log: { warn } },
        retryCount,
      );

      expect(shouldRetry).toBe(true);
      expect(warn).toHaveBeenCalledWith(
        `Secondary rate limit detected for request POST /graphql - retrying in 60 seconds (attempt ${retryCount + 1}/${SECONDARY_RATE_LIMIT_RETRY_ATTEMPTS})`,
      );
    },
  );

  it('stops retrying after the retry limit is reached', () => {
    const warn = vi.fn();

    const shouldRetry = onSecondaryRateLimit(
      60,
      requestOptions,
      { log: { warn } },
      SECONDARY_RATE_LIMIT_RETRY_ATTEMPTS,
    );

    expect(shouldRetry).toBe(false);
    expect(warn).toHaveBeenCalledWith(
      'Secondary rate limit retry limit reached for request POST /graphql after 3 attempts',
    );
  });
});
