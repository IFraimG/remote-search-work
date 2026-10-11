interface TranslateRequestPayload {
  title?: string;
  description?: string;
  requirements?: string[];
  experience?: string;
  location?: string;
  text?: string;
}

interface TranslateResponsePayload {
  title?: string;
  description?: string;
  requirements?: string[];
  experience?: string;
  location?: string;
  text?: string;
  sourceLang?: string;
  targetLang: string;
}

export class TranslateService {
  private cache = new Map<string, string>();
  private readonly MAX_CACHE_SIZE = 10000;

  private isAlreadyRussian(text: string): boolean {
    const cleaned = text.replace(/[\s\d.,!?;:()"'«»\-_/\\#@$%^&*+=<>~`]/g, '');
    if (!cleaned) return true;
    const cyrillicMatches = cleaned.match(/[\u0400-\u04FF]/g) || [];
    // If more than 40% of letters are Cyrillic, consider it already Russian
    return cyrillicMatches.length / cleaned.length > 0.4;
  }

  public async translateText(text: string, targetLang = 'ru'): Promise<string> {
    const trimmed = text.trim();
    if (!trimmed) return text;

    if (this.isAlreadyRussian(trimmed)) {
      return trimmed;
    }

    const cacheKey = `${targetLang}:${trimmed}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // 1. Primary provider: Google Chrome Extension endpoint (most reliable & fast)
    try {
      const translated = await this.translateViaClients5(trimmed, targetLang);
      if (translated) {
        this.setCache(cacheKey, translated);
        return translated;
      }
    } catch (err) {
      console.warn('[Translate] Clients5 translate failed, trying fallback:', (err as Error).message);
    }

    // 2. Secondary provider: Google GTX endpoint
    try {
      const translated = await this.translateViaGtx(trimmed, targetLang);
      if (translated) {
        this.setCache(cacheKey, translated);
        return translated;
      }
    } catch (err) {
      console.warn('[Translate] GTX translate failed, trying MyMemory:', (err as Error).message);
    }

    // 3. Tertiary provider: MyMemory API
    try {
      const fallback = await this.translateViaMyMemory(trimmed, targetLang);
      if (fallback) {
        this.setCache(cacheKey, fallback);
        return fallback;
      }
    } catch (err) {
      console.warn('[Translate] MyMemory fallback failed:', (err as Error).message);
    }

    // If all fail, return original text safely
    return text;
  }

  private async translateViaClients5(text: string, targetLang: string): Promise<string> {
    const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=${encodeURIComponent(
      targetLang
    )}&q=${encodeURIComponent(text)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Clients5 status ${response.status}`);
      }

      const data = (await response.json()) as unknown;
      if (Array.isArray(data) && Array.isArray(data[0]) && typeof data[0][0] === 'string') {
        return data[0][0];
      }
      if (Array.isArray(data) && typeof data[0] === 'string') {
        return data[0];
      }

      throw new Error('Unexpected Clients5 response format');
    } finally {
      clearTimeout(timeout);
    }
  }

  private async translateViaGtx(text: string, targetLang: string): Promise<string> {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
      targetLang
    )}&dt=t&q=${encodeURIComponent(text)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`GTX status ${response.status}`);
      }

      const data = (await response.json()) as unknown;
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const parts = data[0]
          .map((part: unknown) => (Array.isArray(part) && typeof part[0] === 'string' ? part[0] : ''))
          .filter(Boolean);
        return parts.join('');
      }

      throw new Error('Unexpected GTX response format');
    } finally {
      clearTimeout(timeout);
    }
  }

  private async translateViaMyMemory(text: string, targetLang: string): Promise<string> {
    const safeText = text.slice(0, 500);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      safeText
    )}&langpair=en|${encodeURIComponent(targetLang)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`MyMemory status ${response.status}`);
      }

      const data = (await response.json()) as { responseData?: { translatedText?: string } };
      if (data?.responseData?.translatedText && !data.responseData.translatedText.includes('INVALID SOURCE LANGUAGE')) {
        return data.responseData.translatedText;
      }

      throw new Error('Empty MyMemory translation');
    } finally {
      clearTimeout(timeout);
    }
  }

  private setCache(key: string, value: string): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  public async translateVacancy(payload: TranslateRequestPayload): Promise<TranslateResponsePayload> {
    if (payload.text) {
      const translatedText = await this.translateText(payload.text);
      return {
        text: translatedText,
        targetLang: 'ru',
      };
    }

    const [title, description, experience, location] = await Promise.all([
      payload.title ? this.translateText(payload.title) : Promise.resolve(''),
      payload.description ? this.translateText(payload.description) : Promise.resolve(''),
      payload.experience ? this.translateText(payload.experience) : Promise.resolve(''),
      payload.location ? this.translateText(payload.location) : Promise.resolve(''),
    ]);

    let requirements: string[] = [];
    if (payload.requirements && Array.isArray(payload.requirements)) {
      requirements = await Promise.all(
        payload.requirements.map((req) => this.translateText(req))
      );
    }

    return {
      title,
      description,
      experience,
      location,
      requirements,
      targetLang: 'ru',
    };
  }
}

export const translateService = new TranslateService();
