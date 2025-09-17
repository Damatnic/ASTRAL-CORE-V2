declare module 'chrome-launcher' {
  export interface Options {
    port?: number;
    chromeFlags?: string[];
  }
  
  export function launch(options?: Options): Promise<any>;
}