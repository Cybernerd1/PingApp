/**
 * Ping Custom Axios Request/Response Logger
 * Logs full details of outgoing requests and incoming responses.
 */

export interface LogRequestParams {
  id: string;
  method?: string;
  url?: string;
  headers?: Record<string, any>;
  data?: any;
  params?: any;
  startTime: number;
}

export interface LogResponseParams {
  id: string;
  status?: number;
  statusText?: string;
  data?: any;
  headers?: Record<string, any>;
  durationMs: number;
}

export class ApiLogger {
  private static formatTime(): string {
    const now = new Date();
    return now.toISOString().split('T')[1].slice(0, 12);
  }

  static logRequest(req: LogRequestParams): void {
    const time = this.formatTime();
    console.log(
      `\n🌐 [API REQ] [${time}] #${req.id} ${req.method?.toUpperCase()} ${req.url}`
    );
    if (req.params && Object.keys(req.params).length > 0) {
      console.log(`   PARAMS:`, JSON.stringify(req.params, null, 2));
    }
    if (req.data) {
      console.log(`   BODY:  `, JSON.stringify(req.data, null, 2));
    }
    if (req.headers) {
      console.log(`   HEADERS:`, JSON.stringify(req.headers, null, 2));
    }
  }

  static logResponse(res: LogResponseParams): void {
    const time = this.formatTime();
    const isSuccess = (res.status ?? 200) >= 200 && (res.status ?? 200) < 300;
    const statusIcon = isSuccess ? '✅' : '⚠️';

    console.log(
      `\n${statusIcon} [API RES] [${time}] #${res.id} Status: ${res.status} (${res.durationMs}ms)`
    );
    if (res.data) {
      console.log(`   RESPONSE DATA:`, JSON.stringify(res.data, null, 2));
    }
  }

  static logError(id: string, error: any, durationMs: number): void {
    const time = this.formatTime();
    const status = error.response?.status || 'NETWORK_ERROR';
    const message = error.response?.data?.error?.message || error.message || 'Unknown Error';

    console.error(
      `\n❌ [API ERR] [${time}] #${id} Status: ${status} (${durationMs}ms)`
    );
    console.error(`   ERROR MSG:`, message);
    if (error.response?.data) {
      console.error(`   ERROR PAYLOAD:`, JSON.stringify(error.response.data, null, 2));
    }
  }
}
