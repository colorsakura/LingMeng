import axios, { AxiosInstance, AxiosError } from 'axios';
import { BackendProvider, ChatSession } from '@shared/types';

const BASE_URLS: Record<BackendProvider, string> = {
  [BackendProvider.Kimi]: 'https://www.kimi.com',
  [BackendProvider.DeepSeek]: 'https://api.deepseek.com',
  [BackendProvider.Doubao]: 'https://ark.cn-beijing.volces.com',
  [BackendProvider.Qianwen]: 'https://qianwen.aliyun.com',
};

const API_PATHS = {
  [BackendProvider.Kimi]: {
    listChats: '/apiv2/kimi.gateway.chat.v1.ChatService/ListChats',
    getChat: '/apiv2/kimi.gateway.chat.v1.ChatService/GetChat',
    sendMessage: '/apiv2/kimi.gateway.chat.v1.ChatService/SendMessage',
  },
  [BackendProvider.DeepSeek]: {
    listChats: '/chat/sessions',
    sendMessage: '/chat/completions',
  },
  [BackendProvider.Doubao]: {
    listChats: '/api/v3/chat/sessions',
    sendMessage: '/api/v3/chat/completions',
  },
  [BackendProvider.Qianwen]: {
    listChats: '/api/chat/sessions',
    sendMessage: '/api/chat/completions',
  },
};

export class BackendException extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'BackendException';
  }
}

export interface ChatBackend {
  name: BackendProvider;
  setAccessToken(token: string): void;
  sendMessage(
    sessionId: string,
    content: string,
    messages: Array<{ role: string; content: string }>
  ): Promise<string>;
}

function createHttpClient(baseUrl: string, accessToken: string | null): AxiosInstance {
  const httpClient = axios.create({
    baseURL: baseUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  httpClient.interceptors.request.use((config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  httpClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data as Record<string, unknown> | undefined;
        const errorMessage = (data?.error && typeof data.error === 'object')
          ? (data.error as Record<string, unknown>)?.message as string
          : (data?.message as string);
        const errorCode = (data?.error && typeof data.error === 'object')
          ? (data.error as Record<string, unknown>)?.code as string
          : undefined;
        throw new BackendException(
          errorMessage || `HTTP ${status} error`,
          errorCode,
          status
        );
      } else if (error.request) {
        throw new BackendException('Network error - no response received');
      } else {
        throw new BackendException(error.message || 'Unknown error');
      }
    }
  );

  return httpClient;
}

function parseResponseObject(data: unknown): Record<string, unknown> {
  if (typeof data !== 'object' || data === null) {
    throw new BackendException('Expected response to be an object');
  }
  return data as Record<string, unknown>;
}

function getRequiredString(obj: Record<string, unknown>, key: string): string {
  const value = obj[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new BackendException(`Missing or empty required field: ${key}`);
  }
  return value;
}

function getOptionalString(obj: Record<string, unknown>, key: string): string | null {
  const value = obj[key];
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === 'string') {
    return value;
  }
  return String(value);
}

function parseTimestamp(timestampStr: string): number {
  const parsed = parseFloat(timestampStr);
  if (isNaN(parsed)) return 0;
  if (parsed < 1e12) {
    return parsed * 1000;
  }
  return parsed;
}

class KimiBackend implements ChatBackend {
  readonly name = BackendProvider.Kimi;
  private accessToken: string | null = null;

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  async listChats(): Promise<ChatSession[]> {
    const httpClient = createHttpClient(BASE_URLS.kimi, this.accessToken);
    const response = await httpClient.post(API_PATHS.kimi.listChats, {
      project_id: '',
      page_size: 20,
      page_token: '',
      query: '',
    });

    const data = parseResponseObject(response.data);
    const chats = data.chats as Array<Record<string, unknown>> | undefined;

    if (!Array.isArray(chats)) {
      return [];
    }

    return chats.map((chat) => {
      const createTimeStr = getOptionalString(chat, 'createTime') || '0';
      const updateTimeStr = getOptionalString(chat, 'updateTime') || '0';

      return {
        id: `${this.name}_${getRequiredString(chat, 'id')}`,
        name: getRequiredString(chat, 'name') || '新对话',
        lastMessage: getOptionalString(chat, 'messageContent') || null,
        backend: this.name,
        createdAt: parseTimestamp(createTimeStr),
        updatedAt: parseTimestamp(updateTimeStr),
      };
    });
  }

  async getChatDetail(chatId: string): Promise<{ messageContent: string } | null> {
    const httpClient = createHttpClient(BASE_URLS.kimi, this.accessToken);
    try {
      const response = await httpClient.post(API_PATHS.kimi.getChat, {
        chat_id: chatId,
      });

      const data = parseResponseObject(response.data);
      const chat = (data.chat || data) as Record<string, unknown>;
      return {
        messageContent: getOptionalString(chat, 'messageContent') || '',
      };
    } catch {
      return null;
    }
  }

  async sendMessage(): Promise<string> {
    throw new BackendException('Kimi sendMessage not implemented yet');
  }
}

class DeepSeekBackend implements ChatBackend {
  readonly name = BackendProvider.DeepSeek;
  private accessToken: string | null = null;

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  async listChats(): Promise<ChatSession[]> {
    const httpClient = createHttpClient(BASE_URLS.deepseek, this.accessToken);
    try {
      const response = await httpClient.get(API_PATHS.deepseek.listChats);
      const data = parseResponseObject(response.data);
      const items = data.sessions as Array<Record<string, unknown>> | undefined;

      if (!Array.isArray(items)) {
        return [];
      }

      return items.map((item) => ({
        id: `${this.name}_${getRequiredString(item, 'id')}`,
        name: getOptionalString(item, 'title') || '新对话',
        lastMessage: getOptionalString(item, 'last_message') || null,
        backend: this.name,
        createdAt: (item.created_at as number) * 1000,
        updatedAt: (item.updated_at as number) * 1000,
      }));
    } catch {
      return [];
    }
  }

  async sendMessage(
    sessionId: string,
    content: string,
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    const httpClient = createHttpClient(BASE_URLS.deepseek, this.accessToken);
    const response = await httpClient.post(API_PATHS.deepseek.sendMessage, {
      session_id: sessionId,
      messages: [...messages, { role: 'user', content }],
    });

    const data = parseResponseObject(response.data);
    const choices = data.choices as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(choices) && choices.length > 0) {
      const message = choices[0].message as Record<string, unknown> | undefined;
      return getOptionalString(message || {}, 'content') || '';
    }
    return '';
  }
}

class DoubaoBackend implements ChatBackend {
  readonly name = BackendProvider.Doubao;
  private accessToken: string | null = null;

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  async listChats(): Promise<ChatSession[]> {
    const httpClient = createHttpClient(BASE_URLS.doubao, this.accessToken);
    try {
      const response = await httpClient.get(API_PATHS.doubao.listChats);
      const data = parseResponseObject(response.data);
      const items = data.sessions as Array<Record<string, unknown>> | undefined;

      if (!Array.isArray(items)) {
        return [];
      }

      return items.map((item) => ({
        id: `${this.name}_${getRequiredString(item, 'id')}`,
        name: getOptionalString(item, 'name') || '新对话',
        lastMessage: getOptionalString(item, 'last_message') || null,
        backend: this.name,
        createdAt: (item.created_at as number) * 1000,
        updatedAt: (item.updated_at as number) * 1000,
      }));
    } catch {
      return [];
    }
  }

  async sendMessage(
    sessionId: string,
    content: string,
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    const httpClient = createHttpClient(BASE_URLS.doubao, this.accessToken);
    const response = await httpClient.post(API_PATHS.doubao.sendMessage, {
      session_id: sessionId,
      messages: [...messages, { role: 'user', content }],
    });

    const data = parseResponseObject(response.data);
    return getOptionalString(data, 'content') || '';
  }
}

class QianwenBackend implements ChatBackend {
  readonly name = BackendProvider.Qianwen;
  private accessToken: string | null = null;

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  async listChats(): Promise<ChatSession[]> {
    const httpClient = createHttpClient(BASE_URLS.qianwen, this.accessToken);
    try {
      const response = await httpClient.get(API_PATHS.qianwen.listChats);
      const data = parseResponseObject(response.data);
      const items = data.sessions as Array<Record<string, unknown>> | undefined;

      if (!Array.isArray(items)) {
        return [];
      }

      return items.map((item) => ({
        id: `${this.name}_${getRequiredString(item, 'id')}`,
        name: getOptionalString(item, 'name') || '新对话',
        lastMessage: getOptionalString(item, 'last_message') || null,
        backend: this.name,
        createdAt: (item.created_at as number) * 1000,
        updatedAt: (item.updated_at as number) * 1000,
      }));
    } catch {
      return [];
    }
  }

  async sendMessage(
    sessionId: string,
    content: string,
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    const httpClient = createHttpClient(BASE_URLS.qianwen, this.accessToken);
    const response = await httpClient.post(API_PATHS.qianwen.sendMessage, {
      session_id: sessionId,
      messages: [...messages, { role: 'user', content }],
    });

    const data = parseResponseObject(response.data);
    return getOptionalString(data, 'content') || '';
  }
}

const backends: Record<BackendProvider, ChatBackend> = {
  [BackendProvider.Kimi]: new KimiBackend(),
  [BackendProvider.DeepSeek]: new DeepSeekBackend(),
  [BackendProvider.Doubao]: new DoubaoBackend(),
  [BackendProvider.Qianwen]: new QianwenBackend(),
};

export function getBackend(provider: BackendProvider): ChatBackend {
  return backends[provider];
}
