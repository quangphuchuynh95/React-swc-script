import Webpack, { webpack } from "webpack";
import { green, red } from "colorette";
import { webpackConfigure } from "./config";
import bytes from "bytes";
import Table from "cli-table";
import * as fs from "fs";
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasurePlugin();

export function build(mode: Exclude<Webpack.Configuration["mode"], undefined>) {
  return new Promise<void>((resolve, reject) => {
    console.log(green("Building...."));
    webpack(webpackConfigure(mode, "build"), (err, stats) => {
      if (err) {
        console.log(err.message.slice(0, 100));
        resolve();
        return;
      }
      if (stats) {
        if (stats.hasErrors()) {
          console.error(stats.toJson().errors);
        }
        const data = stats.toJson();
        const table = new Table({
          head: ["Chunk", "Size"],
          rows: [
            ...(data.chunks || [])
              .sort((a, b) => b.size - a.size)
              .map((chunk, i) => {
                return [
                  chunk.hash,
                  chunk.size > 1_000_000
                    ? red(bytes(chunk.size))
                    : green(bytes(chunk.size)),
                ];
              })
              .slice(0, 10),
            ["...", "..."],
          ],
        });

        console.log(table.toString());
        resolve();
      }
    });
  });
}
