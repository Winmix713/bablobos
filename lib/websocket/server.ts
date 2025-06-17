import { WebSocketMessage, PreviewOptions } from '@/types';

/**
 * WebSocket Server for Live Preview and Hot-Reload
 * Manages real-time communication between Figma changes and preview
 */
export class WebSocketServer {
  private clients = new Set<any>();
  private figmaFileWatchers = new Map<string, any>();
  private isPolling = false;
  private pollInterval = 5000; // 5 seconds

  /**
   * Initialize WebSocket server
   */
  async initialize(port: number = 8080): Promise<void> {
    if (typeof window !== 'undefined') {
      console.log('WebSocket server not available in browser environment');
      return;
    }

    try {
      const { WebSocketServer } = await import('ws');
      
      const wss = new WebSocketServer({ port });
      
      wss.on('connection', (ws) => {
        console.log('🔌 Client connected to live preview');
        this.clients.add(ws);

        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleClientMessage(ws, message);
          } catch (error) {
            console.error('Invalid WebSocket message:', error);
          }
        });

        ws.on('close', () => {
          console.log('🔌 Client disconnected from live preview');
          this.clients.delete(ws);
        });

        // Send welcome message
        this.sendToClient(ws, {
          type: 'connection',
          data: { status: 'connected', timestamp: Date.now() },
          timestamp: Date.now()
        });
      });

      console.log(`📡 WebSocket server started on port ${port}`);
      
      // Start Figma polling for changes
      this.startFigmaPolling();
      
    } catch (error) {
      console.error('Failed to initialize WebSocket server:', error);
    }
  }

  /**
   * Watch a Figma file for changes
   */
  watchFigmaFile(fileId: string, options: { token: string; pollInterval?: number }): void {
    console.log(`👀 Watching Figma file: ${fileId}`);
    
    this.figmaFileWatchers.set(fileId, {
      token: options.token,
      lastModified: null,
      pollInterval: options.pollInterval || this.pollInterval
    });

    this.broadcastToClients({
      type: 'file-watch-started',
      data: { fileId },
      timestamp: Date.now()
    });
  }

  /**
   * Stop watching a Figma file
   */
  unwatchFigmaFile(fileId: string): void {
    console.log(`⏹️ Stopped watching Figma file: ${fileId}`);
    this.figmaFileWatchers.delete(fileId);
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcastToClients(message: WebSocketMessage): void {
    const messageStr = JSON.stringify(message);
    
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(messageStr);
      }
    });
  }

  /**
   * Send message to specific client
   */
  sendToClient(client: any, message: WebSocketMessage): void {
    if (client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  }

  /**
   * Simulate live preview update
   */
  triggerPreviewUpdate(componentData: any): void {
    this.broadcastToClients({
      type: 'component-update',
      data: {
        component: componentData,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }

  /**
   * Handle client messages
   */
  private handleClientMessage(client: any, message: any): void {
    switch (message.type) {
      case 'watch-file':
        this.watchFigmaFile(message.fileId, {
          token: message.token,
          pollInterval: message.pollInterval
        });
        break;
        
      case 'unwatch-file':
        this.unwatchFigmaFile(message.fileId);
        break;
        
      case 'request-update':
        this.handleUpdateRequest(client, message.data);
        break;
        
      case 'preview-options':
        this.handlePreviewOptionsUpdate(message.data);
        break;
        
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  /**
   * Start polling Figma API for file changes
   */
  private startFigmaPolling(): void {
    if (this.isPolling) return;
    
    this.isPolling = true;
    console.log('🔄 Started Figma polling for changes');

    const pollFiles = async () => {
      for (const [fileId, watcher] of this.figmaFileWatchers) {
        try {
          await this.checkFileForChanges(fileId, watcher);
        } catch (error) {
          console.error(`Error checking file ${fileId}:`, error);
        }
      }
    };

    // Initial poll
    pollFiles();
    
    // Set up interval
    setInterval(pollFiles, this.pollInterval);
  }

  /**
   * Check specific Figma file for changes
   */
  private async checkFileForChanges(fileId: string, watcher: any): Promise<void> {
    try {
      // Simulate Figma API call
      const fileData = await this.fetchFigmaFileData(fileId, watcher.token);
      
      if (fileData.lastModified !== watcher.lastModified) {
        console.log(`🔄 Changes detected in Figma file: ${fileId}`);
        
        watcher.lastModified = fileData.lastModified;
        
        this.broadcastToClients({
          type: 'file-update',
          data: {
            fileId,
            lastModified: fileData.lastModified,
            changes: fileData.changes || [],
            document: fileData.document
          },
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error(`Failed to check file ${fileId}:`, error);
    }
  }

  /**
   * Simulate Figma API file fetch
   */
  private async fetchFigmaFileData(fileId: string, token: string): Promise<any> {
    // In a real implementation, this would make actual Figma API calls
    // For now, simulate with mock data that occasionally changes
    
    const shouldHaveChanges = Math.random() > 0.8; // 20% chance of changes
    
    return {
      lastModified: shouldHaveChanges ? new Date().toISOString() : '2024-01-01T00:00:00Z',
      document: {
        id: fileId,
        name: 'Sample Component',
        type: 'DOCUMENT',
        children: [
          {
            id: 'node1',
            name: 'Updated Component',
            type: 'FRAME',
            lastModified: shouldHaveChanges ? Date.now() : 0
          }
        ]
      },
      changes: shouldHaveChanges ? [
        { type: 'update', nodeId: 'node1', property: 'fills' },
        { type: 'update', nodeId: 'node1', property: 'absoluteBoundingBox' }
      ] : []
    };
  }

  /**
   * Handle update request from client
   */
  private async handleUpdateRequest(client: any, data: any): Promise<void> {
    try {
      // Process the update request
      const result = await this.processUpdateRequest(data);
      
      this.sendToClient(client, {
        type: 'update-result',
        data: result,
        timestamp: Date.now()
      });
      
    } catch (error) {
      this.sendToClient(client, {
        type: 'update-error',
        data: { error: error.message },
        timestamp: Date.now()
      });
    }
  }

  /**
   * Process update request
   */
  private async processUpdateRequest(data: any): Promise<any> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      updatedComponent: {
        id: data.componentId,
        code: `// Updated component code\nconst ${data.componentName} = () => {\n  return <div>Updated!</div>;\n};`,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Handle preview options update
   */
  private handlePreviewOptionsUpdate(options: PreviewOptions): void {
    console.log('📱 Preview options updated:', options);
    
    this.broadcastToClients({
      type: 'preview-options-updated',
      data: options,
      timestamp: Date.now()
    });
  }

  /**
   * Get server status
   */
  getStatus(): {
    clients: number;
    watchedFiles: number;
    isPolling: boolean;
    uptime: number;
  } {
    return {
      clients: this.clients.size,
      watchedFiles: this.figmaFileWatchers.size,
      isPolling: this.isPolling,
      uptime: process.uptime ? process.uptime() : 0
    };
  }

  /**
   * Shutdown server gracefully
   */
  async shutdown(): Promise<void> {
    console.log('⏹️ Shutting down WebSocket server...');
    
    this.isPolling = false;
    
    // Notify all clients of shutdown
    this.broadcastToClients({
      type: 'server-shutdown',
      data: { message: 'Server is shutting down' },
      timestamp: Date.now()
    });

    // Close all client connections
    this.clients.forEach(client => {
      client.close(1000, 'Server shutdown');
    });

    this.clients.clear();
    this.figmaFileWatchers.clear();
    
    console.log('✅ WebSocket server shutdown complete');
  }
}

/**
 * WebSocket Client for Browser-side Live Preview
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers = new Map<string, Function[]>();
  private isConnected = false;

  /**
   * Connect to WebSocket server
   */
  connect(url: string = 'ws://localhost:8080'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('🔌 Connected to live preview server');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('🔌 Disconnected from live preview server');
          this.isConnected = false;
          this.attemptReconnect(url);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send message to server
   */
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  /**
   * Add message handler
   */
  on(type: string, handler: Function): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  /**
   * Remove message handler
   */
  off(type: string, handler: Function): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Watch Figma file
   */
  watchFile(fileId: string, token: string): void {
    this.send({
      type: 'watch-file',
      fileId,
      token,
      timestamp: Date.now()
    });
  }

  /**
   * Update preview options
   */
  updatePreviewOptions(options: PreviewOptions): void {
    this.send({
      type: 'preview-options',
      data: options,
      timestamp: Date.now()
    });
  }

  /**
   * Request component update
   */
  requestUpdate(componentId: string, componentName: string): void {
    this.send({
      type: 'request-update',
      data: { componentId, componentName },
      timestamp: Date.now()
    });
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.data);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    console.log(`🔄 Attempting to reconnect in ${delay}ms... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect(url).catch(() => {
        // Reconnection will be attempted again
      });
    }, delay);
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  /**
   * Check if connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Export singleton instances
export const webSocketServer = new WebSocketServer();
export const webSocketClient = new WebSocketClient();