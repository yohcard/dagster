module.exports = {
  apps: [
    {
      name: "cicd_demo",
      script: "./index.js",
      instances: 2,
      max_memory_restart: "300M",

      // Logging
      out_file: "./out.log",
      error_file: "./error.log",
      merge_logs: true,
      log_date_format: "DD-MM HH:mm:ss Z",
      log_type: "json",

      // Env Specific Config
      env_production: {
        NODE_ENV: "production",
        PORT: 80, // warning ! allow pm2 to run with w/o root
        exec_mode: "cluster_mode",
      },
    },
  ],
};
