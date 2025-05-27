/// <reference types="vite/client" />

// Global type definitions
declare module "*.svg" {
  const content: any;
  export default content;
}

declare module "*.png" {
  const content: any;
  export default content;
}

declare module "*.jpg" {
  const content: any;
  export default content;
}

declare module "*.jpeg" {
  const content: any;
  export default content;
}

declare module "*.gif" {
  const content: any;
  export default content;
}

declare module "*.json" {
  const content: any;
  export default content;
}

declare global {
  interface Window {
    solana?: any;
    phantom?: any;
  }
}

export {};
