const { addWebpackModuleRule, adjustStyleLoaders, override } = require('customize-cra');
// Use the `tap` function to output the config files for debugging.
// const { addWebpackModuleRule, adjustStyleLoaders, override, tap} = require('customize-cra');
const { styles } = require('@ckeditor/ckeditor5-dev-utils');

// These are copies of the regexes defined in CRA's Webpack config:
// eslint-disable-next-line max-len
// https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/webpack.config.js#L63
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;

const forceToArray = (value) => {
    let arr = value;

    // If this is not an array, but is a defined value, put it in an array.
    // Otherwise, return empty array.
    if (!Array.isArray(arr)) {
        arr = arr ? [arr] : [];
    }

    return arr;
};

const adjustFileLoader = () => (config) => {
    // Function that we'll call on each rule, which will modify the rule
    // if it is a rule for file-loader.
    const updateIfFileLoaderRule = (rule) => {
        // The `loader` property contains the filepath to the loader.
        if (/file-loader/.test(rule.loader)) {
            console.log('customize-cra: Update exclude rules for file-loader');
            rule.exclude = [
                // Ensure we keep any existing exclude rules.
                ...forceToArray(rule.exclude),
                /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
                /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/
            ];
        }
    };

    config.module.rules.forEach(rule => {
        if (Array.isArray(rule.oneOf)) {
            // This rule contains an array of rules, so look through each of those.
            rule.oneOf.forEach(updateIfFileLoaderRule);
        } else {
            // This is a standalone rule.
            updateIfFileLoaderRule(rule);
        }
    });

    return config;
};

module.exports = override(
    // Outputs current config to "customize-cra--before.log", with a prepended message
    // tap({ dest: 'customize-cra--before.log', message: 'Before changes for CKEditor' }),

    // -------------------------------------------------------------------------
    // BEGIN: Webpack modifications for loading CKEditor
    // -------------------------------------------------------------------------
    /* eslint-disable max-len */
    // These are described in detail here:
    // https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/react.html#modifying-webpack-configuration
    // Helpful Medium post:
    // https://medium.com/@adamerose/using-ckeditor-5-in-create-react-app-without-ejecting-cc24ffb3fd9c
    /* eslint-enable max-len */

    // (1) Add new rules
    addWebpackModuleRule({
        test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
        use: ['raw-loader'],
    }),
    addWebpackModuleRule({
        test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
        use: [
            {
                loader: 'style-loader',
                // The options are slightly different from what CKE has on their
                // integration guide, b/c we have an older version of style-loader
                // installed for some reason (v0.23.1, instead of v1+).
                options: {
                    singleton: true,
                    attrs: {
                        'data-cke': true
                    }
                }
            },
            {
                loader: 'postcss-loader',
                options: styles.getPostCssConfig({
                    themeImporter: {
                        themePath: require.resolve('@ckeditor/ckeditor5-theme-lark')
                    },
                    minify: true,
                })
            }
        ]
    }),

    // (2) Modify config for css loaders
    adjustStyleLoaders((loader) => {
        // Exclude CKE theme files from loaders that have `test: cssRegex` or
        // `test: cssModuleRegex`.
        if (loader.test instanceof RegExp &&
            (loader.test.toString() === cssRegex.toString() ||
                loader.test.toString() === cssModuleRegex.toString())
        ) {
            console.log(`customize-cra: Update exclude rules for ${loader.test.toString()}`);
            loader.exclude = [
                // Ensure we keep any existing exclude rules.
                ...forceToArray(loader.exclude),
                /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
            ];
        }
    }),

    // (3) Modify config for file loaders
    adjustFileLoader()

    // Outputs final config to "customize-cra--after.log", with a prepended message
    // tap({ dest: 'customize-cra--after.log', message: 'After changes for CKEditor' }),
);
