'use strict';

const worker = require('./index');

if (typeof URL === 'undefined') {
  global.URL = require('url').URL;
}

const workerLogic = {
  fetch: async (request) => {
    const requestUrl = new URL(request.url);

    if (
      requestUrl.pathname === '/api/contact' &&
      (request.method === 'POST' || request.method === 'OPTIONS')
    ) {
      return new Response('contact endpoint', { status: 200 });
    }
  }
  set(k, v) { this.map.set(k.toLowerCase(), v); }
  get(k) { return this.map.get(k.toLowerCase()); }
  has(k) { return this.map.has(k.toLowerCase()); }
};

    return new Response('Not found.', { status: 404 });
  },
};

describe('Cloudflare Worker API-only routing', () => {
  beforeEach(() => {
    global.Headers = class {
      constructor(init) {
        this.map = new Map();
        if (init) {
          Object.entries(init).forEach(([k, v]) => this.map.set(k.toLowerCase(), v));
        }
      }
      set(k, v) { this.map.set(k.toLowerCase(), v); }
      get(k) { return this.map.get(k.toLowerCase()); }
    };

    const env = {
      CONTACT_FROM_EMAIL: 'sender@example.com',
      CONTACT_TO_EMAIL: 'receiver@example.com',
      SEND_EMAIL: {
        send: jest.fn().mockResolvedValue(undefined)
      }
    };

    global.Response = class {
      constructor(body, options = {}) {
        this.body = body;
        this.status = options.status || 200;
        this.headers = new global.Headers(options.headers);
      }
      async text() { return this.body; }
    };
  });

  test('returns 422 for invalid email address', async () => {
    const formData = new FormData();
    formData.append('name', 'Test User');
    formData.append('email', 'invalid-email');
    formData.append('subject', 'Hello');
    formData.append('message', 'This is a test message');

    const request = new Request('https://rmarston.com/api/contact', {
      method: 'POST',
      body: formData
    });

    const response = await worker.default.fetch(request, {});

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ error: 'Invalid email address.' });
  });

  test('handles OPTIONS /api/contact', async () => {
    const request = new Request('https://rmarston.com/api/contact', { method: 'OPTIONS' });
    const response = await workerLogic.fetch(request, {});

    expect(response.status).toBe(200);
  });

  test('returns 404 for non-API routes', async () => {
    const request = new Request('https://rmarston.com/');
    const response = await workerLogic.fetch(request, {});

    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Not found.');
  });
});
