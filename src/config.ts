/**
 * Centralised configuration.
 * Credentials are read from environment variables so that no secrets
 * are ever committed to source control.
 * Set them in a .env file (not checked in) or export them before running.
 */
export const config = {
  saucedemo: {
    baseUrl: process.env.SAUCEDEMO_URL ?? 'https://www.saucedemo.com',
    standardUser: {
      username: process.env.SAUCE_USER ?? 'standard_user',
      password: process.env.SAUCE_PASS ?? 'secret_sauce',
    },
    problemUser: {
      username: process.env.SAUCE_PROBLEM_USER ?? 'problem_user',
      password: process.env.SAUCE_PASS ?? 'secret_sauce',
    },
  },
  jsonPlaceholder: {
    baseUrl: process.env.JSON_PLACEHOLDER_URL ?? 'https://jsonplaceholder.typicode.com',
  },
};
