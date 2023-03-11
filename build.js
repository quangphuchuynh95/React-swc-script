const esbuild = require('esbuild')

esbuild.build({
    entryPoints: ['./src/bin.ts'],
    bundle: true,
    outfile: './dist/bin.js',
    platform: "node",
    external: [
        'commander',
        'webpack',
    ]
}).then(() => {
    console.log("success");
})
