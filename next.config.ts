// Import the necessary package
const withTM = require("next-transpile-modules")(["three"]);

// Use the transpile module to include 'three' for Three.js support
module.exports = withTM({
    webpack: (config) => {
        config.module.rules.push({
            test: /\.(glb|gltf)$/,
            use: {
                loader: "file-loader",
                options: {
                    outputPath: "static/models/",
                    publicPath: "/_next/static/models/",
                    name: "[name].[ext]",
                },
            },  // <-- Missing closing parenthesis here
        });  // <-- Also make sure this parenthesis is placed correctly
        return config;
    },
});
