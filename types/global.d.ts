// 全局类型定义

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      DATABASE_URL: string;
      NANO_BANANA_API_KEY: string;
      UPLOAD_DIR: string;
      MAX_FILE_SIZE: string;
      REDIS_URL?: string;
      NEXTAUTH_SECRET?: string;
      NEXTAUTH_URL?: string;
    }
  }

  // 扩展 Window 对象（前端专用）
  interface Window {
    gtag?: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }

  // 文件类型扩展
  interface File {
    webkitRelativePath: string;
  }

  // 自定义JSX元素
  namespace JSX {
    interface IntrinsicElements {
      'buyer-show-component': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

// 模块声明
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.ico' {
  const content: string;
  export default content;
}

declare module '*.bmp' {
  const content: string;
  export default content;
}

// CSS模块类型
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

// 确保这个文件被当作模块处理
export {};