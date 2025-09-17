// Global type definitions for ASTRAL_CORE 2.0
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.scss" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.svg" {
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

// Crisis intervention specific types
declare global {
  interface Window {
    __ASTRAL_CRISIS_CONFIG__?: {
      encryptionKey: string;
      apiEndpoint: string;
      emergencyNumbers: string[];
      maxResponseTime: number;
    };
  }
  
  // Environment variables
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test" | "staging";
      DATABASE_URL: string;
      REDIS_URL?: string;
      CRISIS_ENCRYPTION_KEY: string;
      TWILIO_ACCOUNT_SID?: string;
      TWILIO_AUTH_TOKEN?: string;
      SENTRY_DSN?: string;
      LIFELINE_API_KEY?: string;
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;
    }
  }
}

export {};
