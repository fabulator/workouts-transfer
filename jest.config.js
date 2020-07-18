module.exports = {
    // eslint-disable-next-line global-require
    ...require('jest-config-fabulator')(),
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};
