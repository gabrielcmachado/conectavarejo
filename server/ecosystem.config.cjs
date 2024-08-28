/* eslint-disable no-undef */
module.exports = {
    apps: [
        {
            name: 'server',
            script: 'cross-env NODE_ENV=production node app.js',
            instances: 1,
            exec_mode: 'fork'
        }
    ]
};
