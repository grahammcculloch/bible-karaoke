export interface API {
  sendMessage: (message: string) => void;
  on: (channel: string, callback: Function) => void;
  send: (channel: string, ...args: any[]) => void;
}

declare global {
  interface Window {
    api: API;
  }
}
