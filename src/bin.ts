#!/usr/bin/env node
import { program } from "commander";
import { build } from "./build";
import { start } from "./start";

program
  .name("react-swc-script")
  .description("React utils script using swc for save your time");

program
  .command("build")
  .description("Build")
  .argument("[mode]", "build mode (prod|dev) default is prod")
  .argument("[target]", "target (web|lib) default is web")
  .action(async (mode = "prod", target = "web") => {
    try {
      if (mode === "dev") {
        await build("development", target);
      } else {
        await build("production", target);
      }
      process.exit(0);
    } catch (e) {
      console.log(e);
      process.exit(1);
    }
  });

program
  .command("start")
  .description("Start dev server")
  .argument("[mode]", "start mode (prod|dev) default is dev")
  .action(async (mode = "dev") => {
    if (mode === "prod") {
      await start("production");
    } else {
      await start("development");
    }
  });

program.parse();

export {};
