module.exports = {
  apps: [
    {
      name: "flatform-api",
      script: "dist/main.js",
      cwd: "/www/wwwroot/flatform-demo/flatform-backend",
      instances: 1,          // đổi 'max' nếu muốn cluster
      exec_mode: "fork",     // hoặc "cluster"
      env: {
        NODE_ENV: "production"
        // Không cần khai env DB ở đây vì bạn đã có .env
      },
      watch: false,
      time: true,
    },
  ],
};
