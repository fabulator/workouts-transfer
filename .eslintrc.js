module.exports = {
    extends: [
        '@socifi',
    ],
    plugins: [
        'typescript', // fix for Webstorm, otherwise it does not parse ts files
    ],
    rules: {
        'camelcase': 0,
        'typescript/no-parameter-properties': 0,
        'no-useless-constructor': 0,
        'no-shadow': 0,
        'no-param-reassign': 0,
        'func-names': 0,
    },
};
