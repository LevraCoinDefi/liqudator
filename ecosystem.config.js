// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: "liquidator",
            script: "dist/index.js",
            instances: 1,
            exec_mode: "fork",
            env: {
                NODE_ENV: "production",
            },
            out_file: "./logs/out.log",
            error_file: "./logs/error.log",
            merge_logs: true,
            max_restarts: 10,
            restart_delay: 2000
        }
    ],
    // deploy: {
    //     production: {
    //         repo: "https://github.com/LevraCoinDefi/liqudator.git",
    //         ref: "origin/main",
    //         path: "~/var/www/liq-bot",
    //         "post-deploy":
    //             "npm ci && npm run build && pm2 reload ecosystem.config.js --only liqudator"
    //     }
    // }
};