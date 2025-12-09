export interface MCPRequest {
    jsonrpc: string;
    id?: number | string;
    method: string;
    params?: any;
}