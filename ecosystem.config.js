module.exports = {
    apps: [
      {
        name: 'cors-anywhere',
        script: 'node proxy.js',
        cwd: './cors-anywhere',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
          PORT: 8080,
        },
      },
      {
        name: 'nextjs-app',
        script: 'npm',
        args: 'run dev',
        cwd: './',
        instances: 1,
        autorestart: true,
        watch: true,
        max_memory_restart: '1G',
      },
    ],
  };