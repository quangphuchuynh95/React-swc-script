import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import Webpack from "webpack";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CopyPlugin from "copy-webpack-plugin";
import WebpackDevServer from "webpack-dev-server";
import { alias, loadEnvFiles, setupMiddlewares } from "./config-helper";
import cliProgress from "cli-progress";
import * as fs from "fs";

export interface ReactSwcConfig {
  projectRoot: string;
  packageManager: 'yarn' | 'npm' | 'pnpm';
}

export const webpackConfigure = (
  mode: Exclude<Webpack.Configuration["mode"], undefined>,
  action: "build" | "serve"
): Webpack.Configuration => {
  const isDevelopment = mode === "development";
  loadEnvFiles(mode);
  process.env.NODE_ENV = mode;
  let config: ReactSwcConfig = {
    projectRoot: '.',
    packageManager: 'npm',
  };
  if (fs.existsSync(path.resolve(process.cwd(), "react-swc.json"))) {
    const overrideConfig = require(path.resolve(
      process.cwd(),
      "react-swc.json"
    )) as Partial<ReactSwcConfig>;
    config = {
      ...config,
      ...Object.fromEntries(
        Object.entries(overrideConfig).filter(
          ([key]) => key !== null && key !== undefined
        )
      ),
    };
  }

  const resolveLoader = {
    modules: [
      path.resolve(__dirname, "../node_modules"),
      path.resolve(process.cwd(), "./node_modules"),
      path.resolve(process.cwd(), config.projectRoot, "./node_modules"),
    ],
  }

  const resolve = {
    extensions: ["", ".js", ".jsx", ".json", ".ts", ".tsx"],
    alias: alias(),
    modules: ['node_modules']
  }

  if (config.packageManager === 'pnpm' && process.env.NODE_PATH) {
    resolveLoader.modules.push(...process.env.NODE_PATH.split(':'));
    resolve.modules.push(...process.env.NODE_PATH.split(':'));
  }

  const plugins: Exclude<Webpack.Configuration["plugins"], undefined> = [
    new CopyPlugin({
      patterns: [path.resolve(process.cwd(), "public")],
    }),
    new Webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
    new HtmlWebpackPlugin({
      templateParameters: process.env,
      template: "!!handlebars-loader!src/index.hbs", // to import index.html file inside index.js
    }),
    new MiniCssExtractPlugin({
      filename: "index.[fullhash].css",
      chunkFilename: "[id].[fullhash].bundle.css",
    }),
  ];

  if (action === "serve" && isDevelopment) {
    plugins.push(new ReactRefreshWebpackPlugin());
  }

  const bar1 = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  let start = false;

  plugins.push(
    new Webpack.ProgressPlugin((percentage, message) => {
      if (!start) {
        bar1.start(100, percentage * 100);
        start = true;
      }
      bar1.update(percentage * 100);
      if (percentage === 1) {
        bar1.stop();
      }
    })
  );

  return {
    mode,
    infrastructureLogging: {
      appendOnly: true,
      level: "verbose",
      console: {
        ...console,
        // info(message?: any, ...optionalParams) {
        //   console.log(message);
        // },
        // log(message?: any, ...optionalParams) {
        //   console.log(optionalParams);
        // }
      },
    },
    resolve,
    // This can make build slower, faster, also affect to file size
    devtool: mode !== "production" ? "eval-source-map" : "source-map",
    entry: [
      path.resolve(process.cwd(), "./src/index.tsx"),
      path.resolve(process.cwd(), "./src/index.scss"),
    ],
    output: {
      publicPath: process.env.PUBLIC_URL || "/",
      path: path.resolve(process.cwd(), "build"),
      filename: "index.[fullhash].js",
      chunkFilename: "[id].[fullhash].bundle.js",
    },
    plugins,
    performance: (action !== 'serve' || mode !== 'production') ? undefined : {
      hints: false,
    },

    module: {
      rules: [
        ...(isDevelopment
          ? [
              {
                test: /\@dfnivo.+\.js$/,
                enforce: "pre" as const,
                use: ["source-map-loader"],
              },
            ]
          : []),
        {
          test: /\.(js|jsx|tsx|ts)$/, // .js and .jsx files
          exclude: /node_modules/, // excluding the node_modules folder
          use: {
            loader: "swc-loader",
            options: {
              jsc: {
                transform: {
                  react: {
                    development: isDevelopment,
                    refresh: isDevelopment && action === "serve",
                  },
                },
              },
            },
          },
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "resolve-url-loader",
            "sass-loader",
          ],
        },
        {
          test: /\.(jpe?g|png|gif|ico|eot|ttf|woff2?)(\?v=\d+\.\d+\.\d+)?$/i,
          type: "asset/resource",
        },
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          use: [
            {
              loader: "@svgr/webpack",
              options: {
                prettier: false,
                svgo: false,
                svgoConfig: {
                  plugins: [
                    {
                      removeViewBox: false,
                    },
                  ],
                },
                titleProp: true,
                ref: true,
              },
            },
            {
              loader: "file-loader",
            },
          ],
        },
      ],
    },
    resolveLoader,
  };
};

export const devServerConfig = (): WebpackDevServer.Configuration => {
  return {
    historyApiFallback: true,
    port: process.env.PORT,
    static: {
      directory: path.resolve(process.cwd(), "public"),
    },
    hot: true,
    liveReload: false,
    setupMiddlewares,
  };
};
