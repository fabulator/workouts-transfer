module.exports = {
    ...require('@socifi/jest-config')(),
    setupFilesAfterEnv: [],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};
