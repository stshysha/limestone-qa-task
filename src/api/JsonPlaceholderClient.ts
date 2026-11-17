import { APIRequestContext } from '@playwright/test';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: { lat: string; lng: string };
  };
  phone: string;
  website: string;
  company: { name: string; catchPhrase: string; bs: string };
}

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface CreatePostPayload {
  userId: number;
  title: string;
  body: string;
}

export class JsonPlaceholderClient {
  constructor(private readonly request: APIRequestContext) {}

  async getUser(id: number): Promise<{ status: number; body: unknown }> {
    const response = await this.request.get(`/users/${id}`);
    return { status: response.status(), body: await response.json() };
  }

  async createPost(payload: CreatePostPayload): Promise<{ status: number; body: Post }> {
    const response = await this.request.post('/posts', { data: payload });
    return { status: response.status(), body: (await response.json()) as Post };
  }

  async getPost(id: number): Promise<{ status: number; body: unknown }> {
    const response = await this.request.get(`/posts/${id}`);
    return { status: response.status(), body: await response.json() };
  }
}
