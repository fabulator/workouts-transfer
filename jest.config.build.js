module.exports = {
    // eslint-disable-next-line global-require
    ...require('jest-config-fabulator')('build'),
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};
