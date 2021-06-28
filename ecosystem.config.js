module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [
        {
            name: 'shopcloud-schedule',
            script: './src/helpers/schedule.js',
            watch: ['./src'],
            watch_delay: 5000,
            ignore_watch: ['node_modules', 'public'],
            env: {},
            env_production: {
                NODE_ENV: 'production',
                DB_HOST: '3.1.13.10',
                DB_NAME: 'utruck',
                DB_USER: 'root',
                DB_PASSWORD: '123456a@',
                DB_PORT: 6887,
                PORT: 3006,
                DEBUG: 'express-base:error,app:error',
                STRINGEE_PROJECT_ID: 5761,
                STRINGEE_API_KEYSID: 'SKzyC0KtlTlosqfDhIWgvJ0eNzu5QknBK',
                STRINGEE_API_KEYSEC: 'NmZBWWQ4OEFDbGkxMWxvVnd4VEUzUUpLUTdiMnJjTFM=',
                SENTRY_ENVIRONMENT: 'production',
                HOST: 'http://localhost/',
            }
        },
    ],
};
