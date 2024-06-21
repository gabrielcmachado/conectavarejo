/* eslint-disable no-undef */
module.exports = {
    apps: [
        {
            name: 'server',
            script: 'app.js',
            instances: 1,
            exec_mode: 'fork'
        }
    ]
};
