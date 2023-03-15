import path, { resolve as pathResolve } from "path";
import { Configuration } from "webpack-dev-server";
import dotenv from "dotenv";
import { CompilerOptions } from "typescript";
import { createProxyMiddleware } from "http-proxy-middleware";
import * as fs from "fs";
import { parse } from "comment-json";

export function alias() {
  let tsconfigFile = pathResolve(process.cwd(), "tsconfig.json");
  if (!fs.existsSync(tsconfigFile)) {
    tsconfigFile = pathResolve(process.cwd(), "jssconfig.json");
  }
  if (!fs.existsSync(tsconfigFile)) {
    return {};
  }
  const jsonContent = fs.readFileSync(tsconfigFile, "utf-8");
  const paths = (parse(jsonContent) as any)?.compilerOptions
    ?.paths as CompilerOptions["paths"];

  if (!paths) {
    return {};
  }
  return {
    ...Object.fromEntries(
      Object.entries(paths).map(([_key, values]) => {
        let key = _key;
        while (!!key.match(/[*\/]$/g)) {
          key = key.slice(0, -1);
        }
        let value = values[0];
        while (!!value.match(/[*\/]$/g)) {
          value = value.slice(0, -1);
        }

        return [key, path.resolve(process.cwd(), value)];
      })
    ),
  };
}

/**
 * Load .env files into process.env corresponding to mode
 * @param mode
 */
export function loadEnvFiles(mode = "production") {
  for (const envFile of [
    ".env",
    `.env.${mode}`,
    `.env.local`,
    `.env.${mode}.local`,
  ]) {
    dotenv.config({
      override: true,
      path: pathResolve(process.cwd(), envFile),
    });
  }
}

export type Middlewares = ReturnType<
  Exclude<Configuration["setupMiddlewares"], undefined>
>;

export function setupMiddlewares(middlewares: Middlewares): Middlewares {
  const additionalMiddlewares = [
    {
      name: "proxy core api v1, v2",
      // `path` is optional
      path: "/api/v1",
      middleware: createProxyMiddleware({
        target: process.env.REACT_APP_PROXY_CORE_API,
        changeOrigin: true,
      }),
    },
    {
      name: "proxy core api v1, v2",
      // `path` is optional
      path: "/api/v2",
      middleware: createProxyMiddleware({
        target: process.env.REACT_APP_PROXY_CORE_API,
        changeOrigin: true,
      }),
    },
    {
      name: "proxy alert api",
      // `path` is optional
      path: "/api/config/dispatchers",
      middleware: createProxyMiddleware({
        target: process.env.REACT_APP_PROXY_ALERT_API,
        changeOrigin: true,
      }),
    },
    {
      name: "proxy alert api",
      // `path` is optional
      path: "/api/config/channels",
      middleware: createProxyMiddleware({
        target: process.env.REACT_APP_PROXY_ALERT_API,
        changeOrigin: true,
      }),
    },
    {
      name: "proxy alert api",
      // `path` is optional
      path: "/api/config/incidents",
      middleware: createProxyMiddleware({
        target: process.env.REACT_APP_PROXY_ALERT_API,
        changeOrigin: true,
      }),
    },
    {
      name: "proxy share api",
      // `path` is optional
      path: "/api",
      middleware: createProxyMiddleware({
        target: process.env.REACT_APP_PROXY_SHARED_API,
        changeOrigin: true,
      }),
    },
  ];
  additionalMiddlewares.reverse().forEach((item) => {
    middlewares.unshift(item);
  });
  return middlewares;
}
