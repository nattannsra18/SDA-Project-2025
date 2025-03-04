export default {
    register(app) {
      app.addFields({
        type: 'media',
        Component: ({ value }) => {
          const originalImageUrl = value?.url; // ดึง URL ของภาพต้นฉบับ
          return (
            <img
              src={originalImageUrl}
              alt="Original Image"
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
            />
          );
        },
      });
    },
  };
  