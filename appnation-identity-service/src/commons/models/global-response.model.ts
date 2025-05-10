export interface IGlobalResponse<T = unknown | null> {
    success: boolean;
    timestamp?: string;
    path: string;
    data: T;
    error: {
      message: string;
      type: string;
      extraData?: Record<string, unknown>;
      clientMessage?: string;
    } | null;
    statusCode: number;
  }
  
  export class GlobalResponse<T = unknown | null> implements IGlobalResponse<T> {
    success: boolean;
    timestamp: string;
    path: string;
    data: T;
    error: {
      message: string;
      type: string;
      extraData?: Record<string, unknown>;
      clientMessage?: string;
    } | null;
    statusCode: number;
  
    constructor(responseData: IGlobalResponse<T>) {
      this.statusCode = responseData.statusCode;
      this.success = responseData.success;
      this.timestamp = new Date().toISOString();
      this.path = responseData.path;
      this.data = responseData.data;
      this.error = responseData.error;
    }
  }
  