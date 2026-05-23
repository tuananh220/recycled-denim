// Fabric.js v5 ships a browser-only build at `fabric/dist/fabric.min.js`
// that we import dynamically to avoid pulling jsdom/canvas (Node-only deps).
// The package doesn't ship types for this entry point, so declare it as `any`.

declare module 'fabric/dist/fabric.min.js' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricModule: any;
  export = fabricModule;
}

declare module 'fabric' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const fabric: any;
}