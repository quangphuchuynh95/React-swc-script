import { webpackConfigure } from "./config";

export const productionConfig = webpackConfigure("production", "build", "web");

export * from "./build";
export * from "./config";
export * from "./config-helper";
export * from "./helper";
export * from "./start";
