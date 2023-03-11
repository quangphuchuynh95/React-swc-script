#!/usr/bin/env node
import { program } from "commander";
import { build } from "./build";
import {dev} from "./dev";

program
  .name("react-swc-script")
  .description("React utils script using swc for save your time");

program
  .command("build")
  .description("Build")
  .argument("[mode]", "build mode (prod|dev) default is prod")
  .action(async (str, { mode = "prod" }: { mode: string }) => {
    try {
      if (mode === "dev") {
        await build("development");
      } else {
        await build("production");
      }
      process.exit(0);
    } catch (e) {
      console.log(e);
      process.exit(1);
    }
  });

program
  .command("dev")
  .description("Start dev server")
  .action(async () => {
      await dev()
  });

program.parse();

export {};
