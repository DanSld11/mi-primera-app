// Plugin de Expo para agregar la API Key de Google Maps al AndroidManifest.xml
const { withAndroidManifest } = require('expo/config-plugins');

function withGoogleMapsApiKey(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application?.[0];
    
    if (application) {
      // Agregar meta-data para Google Maps API Key
      if (!application['meta-data']) {
        application['meta-data'] = [];
      }
      
      // Verificar si ya existe
      const existing = application['meta-data'].find(
        (meta) => meta.$['android:name'] === 'com.google.android.geo.API_KEY'
      );
      
      if (!existing) {
        application['meta-data'].push({
          $: {
            'android:name': 'com.google.android.geo.API_KEY',
            'android:value': 'AIzaSyBtZ5KKYkTS43HgvUWzwtCHgljgjvQwdhQ',
          },
        });
      }
    }
    
    return config;
  });
}

module.exports = withGoogleMapsApiKey;
