import {devServerConfig, webpackConfigure} from "./config";
import {green} from "colorette";
import Webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'


export async function dev(mode: Exclude<Webpack.Configuration["mode"], undefined> = 'development') {
    const compiler = Webpack(webpackConfigure(mode));
    const server = new WebpackDevServer(devServerConfig(), compiler);

    console.log(green('Starting server...'));
    await server.start();
}
