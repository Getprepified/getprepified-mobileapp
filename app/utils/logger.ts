// Comprehensive logging utility for API requests and responses
export class Logger {
  private static formatTimestamp(): string {
    return new Date().toISOString();
  }

  private static log(level: string, message: string, data?: any) {
    const timestamp = this.formatTimestamp();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }

  static info(message: string, data?: any) {
    this.log("INFO", message, data);
  }

  static warn(message: string, data?: any) {
    this.log("WARN", message, data);
  }

  static error(message: string, data?: any) {
    this.log("ERROR", message, data);
  }

  static debug(message: string, data?: any) {
    this.log("DEBUG", message, data);
  }

  // API-specific logging methods
  static logRequest(method: string, url: string, headers?: any, body?: any) {
    this.info(`🚀 API REQUEST: ${method} ${url}`, {
      headers: headers,
      body: body,
      timestamp: this.formatTimestamp(),
    });
  }

  static logResponse(
    method: string,
    url: string,
    status: number,
    data?: any,
    duration?: number
  ) {
    const statusEmoji = status >= 200 && status < 300 ? "✅" : "❌";
    this.info(`${statusEmoji} API RESPONSE: ${method} ${url} - ${status}`, {
      status: status,
      data: data,
      duration: duration ? `${duration}ms` : undefined,
      timestamp: this.formatTimestamp(),
    });
  }

  static logError(method: string, url: string, error: any) {
    this.error(`💥 API ERROR: ${method} ${url}`, {
      error: error.message || error,
      stack: error.stack,
      timestamp: this.formatTimestamp(),
    });
  }
}
