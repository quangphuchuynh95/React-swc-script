import {devServerConfig, webpackConfigure} from "./config";
import {green} from "colorette";
import Webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'


export async function dev() {
    const compiler = Webpack(webpackConfigure("development"));
    const server = new WebpackDevServer(devServerConfig(), compiler);

    console.log(green('Starting server...'));
    await server.start();
}
