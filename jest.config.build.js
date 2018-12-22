module.exports = {
    ...require('@socifi/jest-config')('build'),
    setupTestFrameworkScriptFile: null,
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};
