import { FastifyRequest, FastifyReply } from 'fastify';
import { ratesService } from './rates.service.js';

export async function getRatesHandler(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await ratesService.getRates();
    return reply.send(result);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return reply.status(500).send({
      error: `Failed to fetch currency rates: ${errorMessage}`,
    });
  }
}
