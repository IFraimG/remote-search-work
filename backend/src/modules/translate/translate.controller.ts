import { FastifyRequest, FastifyReply } from 'fastify';
import { translateService } from './translate.service.js';

interface TranslateBody {
  text?: string;
  title?: string;
  description?: string;
  requirements?: string[];
  experience?: string;
  location?: string;
}

export async function translateHandler(
  request: FastifyRequest<{ Body: TranslateBody }>,
  reply: FastifyReply
) {
  const body = request.body || {};

  if (!body.text && !body.title && !body.description) {
    return reply.status(400).send({
      error: 'At least one field (text, title, or description) must be provided for translation.',
    });
  }

  try {
    const result = await translateService.translateVacancy(body);
    return reply.send({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return reply.status(500).send({
      success: false,
      error: `Translation failed: ${errorMessage}`,
    });
  }
}
