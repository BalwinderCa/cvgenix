// Fabric.js loader for Next.js compatibility - CDN only approach
let fabricInstance: any = null;

export const loadFabric = async (): Promise<any> => {
  console.log('loadFabric called');
  
  if (typeof window === 'undefined') {
    console.log('Server-side rendering, returning null');
    // Server-side rendering, return null
    return null;
  }

  if (fabricInstance) {
    console.log('Fabric instance already exists');
    return fabricInstance;
  }

  // Check if fabric is already loaded
  if ((window as any).fabric) {
    console.log('Fabric already loaded on window');
    fabricInstance = (window as any).fabric;
    return fabricInstance;
  }

  console.log('Loading Fabric.js from CDN...');
  // Load Fabric.js from CDN with fallback
  return new Promise((resolve, reject) => {
    if (document.getElementById('fabric-script')) {
      console.log('Fabric script already exists, waiting for load...');
      // Script already exists, wait for it to load
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max
      const checkFabric = () => {
        if ((window as any).fabric) {
          console.log('Fabric loaded from existing script');
          fabricInstance = (window as any).fabric;
          resolve(fabricInstance);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkFabric, 100);
        } else {
          reject(new Error('Fabric.js failed to load from existing script'));
        }
      };
      checkFabric();
      return;
    }

    console.log('Creating new Fabric.js script tag');
    const script = document.createElement('script');
    script.id = 'fabric-script';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js';
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('Fabric.js script loaded successfully');
      // Wait a bit for fabric to be fully available
      setTimeout(() => {
        if ((window as any).fabric) {
          fabricInstance = (window as any).fabric;
          console.log('Fabric instance created:', fabricInstance);
          resolve(fabricInstance);
        } else {
          reject(new Error('Fabric.js loaded but fabric object not available'));
        }
      }, 100);
    };
    
    script.onerror = () => {
      console.error('Failed to load Fabric.js from primary CDN, trying fallback...');
      // Try fallback CDN
      const fallbackScript = document.createElement('script');
      fallbackScript.id = 'fabric-script-fallback';
      fallbackScript.src = 'https://unpkg.com/fabric@5.3.0/dist/fabric.min.js';
      fallbackScript.crossOrigin = 'anonymous';
      
      fallbackScript.onload = () => {
        console.log('Fabric.js loaded from fallback CDN');
        setTimeout(() => {
          if ((window as any).fabric) {
            fabricInstance = (window as any).fabric;
            console.log('Fabric instance created from fallback:', fabricInstance);
            resolve(fabricInstance);
          } else {
            reject(new Error('Fabric.js loaded from fallback but fabric object not available'));
          }
        }, 100);
      };
      
      fallbackScript.onerror = () => {
        console.error('Failed to load Fabric.js from fallback CDN');
        reject(new Error('Failed to load Fabric.js from both primary and fallback CDNs'));
      };
      
      document.head.appendChild(fallbackScript);
    };
    
    document.head.appendChild(script);
  });
};

export const useFabric = () => {
  return fabricInstance;
};
