// Fabric.js loader for Next.js compatibility - CDN only approach
let fabricInstance: any = null;

export const loadFabric = async (): Promise<any> => {
  if (typeof window === 'undefined') {
    // Server-side rendering, return null
    return null;
  }

  if (fabricInstance) {
    return fabricInstance;
  }

  // Check if fabric is already loaded
  if ((window as any).fabric) {
    fabricInstance = (window as any).fabric;
    return fabricInstance;
  }

  // Load Fabric.js from CDN
  return new Promise((resolve, reject) => {
    if (document.getElementById('fabric-script')) {
      // Script already exists, wait for it to load
      const checkFabric = () => {
        if ((window as any).fabric) {
          fabricInstance = (window as any).fabric;
          resolve(fabricInstance);
        } else {
          setTimeout(checkFabric, 100);
        }
      };
      checkFabric();
      return;
    }

    const script = document.createElement('script');
    script.id = 'fabric-script';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js';
    script.onload = () => {
      fabricInstance = (window as any).fabric;
      resolve(fabricInstance);
    };
    script.onerror = () => {
      console.error('Failed to load Fabric.js from CDN');
      reject(new Error('Failed to load Fabric.js'));
    };
    document.head.appendChild(script);
  });
};

export const useFabric = () => {
  return fabricInstance;
};
