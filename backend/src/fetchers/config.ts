// Fetchers for config data

import { Config, Fetcher } from '..';
import { parse } from 'yaml';
import fs from 'fs-extra';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// Read in configuration for the fetchers
let yamlConfig: Partial<Config> = {};
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configFileLocation = resolve(__dirname, '../../../config.yml');
try {
  const configFile = fs.readFileSync(configFileLocation, 'utf-8');
  yamlConfig = parse(configFile) as Partial<Config>;
} catch (e) {
  console.error('Error reading config file at', configFileLocation);
  console.log(e);
}

export const addConfigToResult: Fetcher = async (result) => {
  return {
    ...result,
    config: {
      organization: yamlConfig.organization ?? '',
      includeForks: yamlConfig.includeForks,
      includeArchived: yamlConfig.includeArchived,
      since: yamlConfig.since,
    },
  };
};
