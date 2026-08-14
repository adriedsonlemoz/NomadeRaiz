declare module "qrcode" {
  export interface ToDataURLOptions {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  const QRCode: {
    toDataURL(text: string, options?: ToDataURLOptions): Promise<string>;
  };

  export default QRCode;
}
