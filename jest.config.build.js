module.exports = {
    ...require('@socifi/jest-config')('build'),
    setupFilesAfterEnv: [],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};
