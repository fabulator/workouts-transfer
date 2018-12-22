module.exports = {
    ...require('@socifi/jest-config')(),
    setupTestFrameworkScriptFile: null,
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};
