const path = require('path');
const sample = require('./sample_debug.json');

// Stub BOE client before loading the service
const boeClientPath = path.resolve(__dirname, '..', 'src', 'clients', 'boeClient');
const boeClient = require(boeClientPath);

// Return the estructura object (similar to what the real BOE client returns parsed)
boeClient.get = async (endpoint) => {
  console.log('[Test] boeClient.get called with', endpoint);
  return sample.estructura;
};

const ayudasService = require(path.resolve(__dirname, '..', 'src', 'services', 'ayudasService'));

(async () => {
  try {
    // Llamamos a obtenerSumario con una fecha cualquiera
    const disposiciones = await ayudasService.obtenerSumario('2026-04-09');
    console.log('[Test] Disposiciones extraídas:', disposiciones.length);
    console.log('[Test] Primer resultado (parcial):', JSON.stringify(disposiciones[0], null, 2));

    // Probamos la búsqueda de ayudas (filtrado por palabras clave)
    const ayudas = await ayudasService.buscarAyudas({ q: '' }, 1);
    console.log('[Test] Resultados de buscarAyudas (filtradas por keywords):', ayudas.length);
    console.log('[Test] Ejemplos encontrados:', JSON.stringify(ayudas, null, 2));
  } catch (err) {
    console.error('[Test] Error:', err);
  }
})();
