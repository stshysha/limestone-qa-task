import { test, expect } from '../../src/fixtures';

/**
 * JSONPlaceholder API tests
 *
 * Design decision – POST /posts does not persist data:
 * JSONPlaceholder is a fake REST API. POST /posts returns HTTP 201
 * with a body that includes the auto-assigned id = 101, but nothing
 * is actually stored. A subsequent GET /posts/101 returns 404.
 *
 * We therefore assert only what the service genuinely guarantees:
 *   1. POST returns 201 with the echoed payload + a synthetic id.
 *   2. We do NOT assert that GET /posts/{newId} returns the same data,
 *      because that would be testing a persistence guarantee the service
 *      explicitly does not provide. Asserting a known-false guarantee
 *      produces a flaky test that teaches nothing.
 *
 * This decision is intentional and documented here as required.
 */

/** Minimal JSON Schema for a User object */
const userSchema = {
  type: 'object',
  required: ['id', 'name', 'username', 'email', 'address', 'phone', 'website', 'company'],
  properties: {
    id: { type: 'number' },
    name: { type: 'string', minLength: 1 },
    username: { type: 'string', minLength: 1 },
    email: { type: 'string', minLength: 1 },
    address: {
      type: 'object',
      required: ['street', 'city', 'zipcode'],
      properties: {
        street: { type: 'string' },
        city: { type: 'string' },
        zipcode: { type: 'string' },
      },
    },
    phone: { type: 'string', minLength: 1 },
    website: { type: 'string', minLength: 1 },
    company: {
      type: 'object',
      required: ['name'],
      properties: { name: { type: 'string' } },
    },
  },
};

function validateSchema(value: unknown, schema: Record<string, unknown>, path = ''): string[] {
  const errors: string[] = [];
  if (typeof schema.type === 'string' && typeof value !== schema.type) {
    errors.push(`${path || 'root'}: expected ${schema.type}, got ${typeof value}`);
    return errors;
  }
  if (schema.type === 'object' && schema.required) {
    for (const key of schema.required as string[]) {
      if (!(key in (value as Record<string, unknown>))) {
        errors.push(`${path}.${key}: required property missing`);
      }
    }
  }
  if (schema.type === 'string' && typeof schema.minLength === 'number') {
    if ((value as string).length < schema.minLength) {
      errors.push(`${path}: string must not be empty`);
    }
  }
  if (schema.type === 'object' && schema.properties) {
    const props = schema.properties as Record<string, Record<string, unknown>>;
    const obj = value as Record<string, unknown>;
    for (const [key, subSchema] of Object.entries(props)) {
      if (key in obj) {
        errors.push(...validateSchema(obj[key], subSchema, `${path}.${key}`));
      }
    }
  }
  return errors;
}

test.describe('GET /users/{id} – contract test', () => {
  test('returns 200 and a valid User object matching the schema', async ({ apiClient }) => {
    const { status, body } = await apiClient.getUser(1);

    expect(status).toBe(200);

    const errors = validateSchema(body, userSchema);
    expect(
      errors,
      `Schema validation failed:\n${errors.join('\n')}`,
    ).toHaveLength(0);
  });

  test('returns 404 for a non-existent user', async ({ apiClient }) => {
    const { status } = await apiClient.getUser(9999);
    expect(status).toBe(404);
  });
});

test.describe('POST /posts – create and read-back', () => {
  test('POST returns 201 and echoes the submitted payload with a synthetic id', async ({
    apiClient,
  }) => {
    const payload = {
      userId: 1,
      title: 'test title',
      body: 'test body',
    };

    const { status, body } = await apiClient.createPost(payload);

    // JSONPlaceholder returns 201 for successful creation
    expect(status).toBe(201);

    // The response echoes the payload fields
    expect(body.userId).toBe(payload.userId);
    expect(body.title).toBe(payload.title);
    expect(body.body).toBe(payload.body);

    // A synthetic id is assigned (always 101 on this fake API)
    expect(typeof body.id).toBe('number');
    expect(body.id).toBeGreaterThan(0);

    /**
     * We deliberately do NOT follow up with GET /posts/{body.id}.
     * The service documents that it does not persist data; a subsequent
     * GET would return 404, making a persistence assertion always-failing
     * and meaningless. See module-level design decision comment.
     */
  });
});
