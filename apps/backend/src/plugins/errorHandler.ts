import type { FastifyInstance } from "fastify";
import { AppError } from "../lib/errors.js";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        code: error.code,
        message: error.message
      });
    }

    app.log.error(error);
    return reply.status(500).send({
      code: "INTERNAL_ERROR",
      message: "Unexpected server error."
    });
  });
}
