export default ({ env }) => ({
  settings: {
    cors: {
      enabled: true,
      origin: [
        'http://localhost:3000',
        'https://sda-client-${PROJECT_ID}.run.app',
        env('CLIENT_URL', '*')
      ],
      credentials: true,
      methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS',
        'HEAD'
      ],
      headers: [
        'Content-Type',
        'Authorization',
        'Origin',
        'Accept'
      ]
    },
  },
});