import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import { jwt } from "better-auth/plugins";
import { toNextJsHandler } from "better-auth/next-js";

let authHandlers: ReturnType<typeof toNextJsHandler> | undefined;

function getRegistrationValidationError(body: Record<string, unknown> | undefined) {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const image = body?.image;

  if (name.length < 2 || name.length > 80) return "Name must be between 2 and 80 characters.";
  if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
    return "Password must contain at least 6 characters, including an uppercase and a lowercase letter.";
  }
  if (image !== undefined && image !== null && image !== "") {
    if (typeof image !== "string" || image.length > 2048) return "Photo URL must be a valid HTTP(S) URL.";
    try {
      const url = new URL(image);
      if (!["http:", "https:"].includes(url.protocol)) return "Photo URL must be a valid HTTP(S) URL.";
    } catch {
      return "Photo URL must be a valid HTTP(S) URL.";
    }
  }
  return null;
}

export function getAuthHandlers() {
  if (authHandlers) return authHandlers;

  const mongoUri = process.env.MONGODB_URI;
  const mongoDbName = process.env.MONGODB_DB || "community-connect";
  const appUrl = process.env.BETTER_AUTH_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000");
  const issuer = process.env.BETTER_AUTH_JWT_ISSUER || appUrl;
  const audience = process.env.BETTER_AUTH_JWT_AUDIENCE || appUrl;
  const secret = process.env.BETTER_AUTH_SECRET;
  const trustedOrigins = [...new Set([
    appUrl,
    ...(process.env.CLIENT_URL || "").split(",").map((origin) => origin.trim()).filter(Boolean),
  ])];

  if (!mongoUri) throw new Error("MONGODB_URI must be configured for Better Auth.");
  if (!appUrl) throw new Error("BETTER_AUTH_URL must be configured to the Next.js origin in production.");
  if (!secret || secret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters.");
  }

  const globalMongo = globalThis as typeof globalThis & { communityConnectMongoClient?: MongoClient };
  const mongoClient = globalMongo.communityConnectMongoClient ?? new MongoClient(mongoUri);
  if (process.env.NODE_ENV !== "production") globalMongo.communityConnectMongoClient = mongoClient;
  const database = mongoClient.db(mongoDbName);

  const auth = betterAuth({
    secret,
    baseURL: appUrl,
    basePath: "/api/auth",
    trustedOrigins,
    advanced: { useSecureCookies: new URL(appUrl).protocol === "https:" },
    database: mongodbAdapter(database, { client: mongoClient, transaction: false }),
    plugins: [
      jwt({
        jwt: {
          issuer,
          audience,
          expirationTime: "15m",
          definePayload: ({ user }) => ({ name: user.name, email: user.email }),
        },
      }),
    ],
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 6,
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/sign-up/email") return;
        const validationError = getRegistrationValidationError(ctx.body);
        if (validationError) throw new APIError("BAD_REQUEST", { message: validationError });
      }),
    },
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          socialProviders: {
            github: {
              clientId: process.env.GITHUB_CLIENT_ID,
              clientSecret: process.env.GITHUB_CLIENT_SECRET,
            },
          },
        }
      : {}),
  });

  authHandlers = toNextJsHandler(auth);
  return authHandlers;
}
