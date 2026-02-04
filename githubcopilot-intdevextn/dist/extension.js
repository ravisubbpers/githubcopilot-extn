/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(__webpack_require__(1));
/**
 * Configuration helper class for RK IDP settings
 */
class RkIdpConfiguration {
    static EXTENSION_ID = 'rk-idp';
    static getCopilotUsername() {
        return vscode.workspace.getConfiguration(this.EXTENSION_ID).get('copilot.username', '');
    }
    static getGitHubBaseUrl() {
        return vscode.workspace.getConfiguration(this.EXTENSION_ID).get('github.baseUrl', 'https://github.enterprise.com');
    }
    static getGitHubUserPAT() {
        return vscode.workspace.getConfiguration(this.EXTENSION_ID).get('github.userPAT', '');
    }
    static getSonarQubeBaseUrl() {
        return vscode.workspace.getConfiguration(this.EXTENSION_ID).get('sonarqube.baseUrl', 'https://sonarqube.enterprise.com');
    }
    static getCheckmarxTenant() {
        return vscode.workspace.getConfiguration(this.EXTENSION_ID).get('checkmarx.tenant', '');
    }
    static getCheckmarxBaseUrl() {
        return vscode.workspace.getConfiguration(this.EXTENSION_ID).get('checkmarx.baseUrl', 'https://checkmarx.enterprise.com');
    }
    static getCheckmarxUserApiKey() {
        return vscode.workspace.getConfiguration(this.EXTENSION_ID).get('checkmarx.userApiKey', '');
    }
    static getAppsecJiraUsername() {
        return vscode.workspace.getConfiguration(this.EXTENSION_ID).get('appsecjira.username', '');
    }
    static getAppsecJiraBaseUrl() {
        return vscode.workspace.getConfiguration(this.EXTENSION_ID).get('appsecjira.baseUrl', 'https://appsec.jira.enterprise.com');
    }
    static getAppsecJiraUserPAT() {
        return vscode.workspace.getConfiguration(this.EXTENSION_ID).get('appsecjira.userPAT', '');
    }
    static getJiraUsername() {
        return vscode.workspace.getConfiguration(this.EXTENSION_ID).get('jira.username', '');
    }
    static getJiraUserPAT() {
        return vscode.workspace.getConfiguration(this.EXTENSION_ID).get('jira.userPAT', '');
    }
    static getJiraBaseUrl() {
        return vscode.workspace.getConfiguration(this.EXTENSION_ID).get('jira.baseUrl', 'https://jira.enterprise.com');
    }
    static getDoraGitHubBaseUrl() {
        return vscode.workspace.getConfiguration(this.EXTENSION_ID).get('dora.githubBaseUrl', 'https://github.enterprise.com');
    }
    static getDoraGitHubUserPAT() {
        return vscode.workspace.getConfiguration(this.EXTENSION_ID).get('dora.githubUserPAT', '');
    }
}
/**
 * Webview provider for the RK IDP sidebar
 */
class RkIdpViewProvider {
    _extensionUri;
    _context;
    static viewType = 'rk-idp-main';
    constructor(_extensionUri, _context) {
        this._extensionUri = _extensionUri;
        this._context = _context;
    }
    /**
     * Initialize storage (using VS Code's GlobalState instead of SQLite)
     */
    async _initStorage() {
        try {
            // Ensure storage directory exists for future file operations
            const fs = __webpack_require__(3);
            const path = __webpack_require__(4);
            const storageDir = path.join((__webpack_require__(6).homedir)(), '.vscode-chat-exports');
            if (!fs.existsSync(storageDir)) {
                fs.mkdirSync(storageDir, { recursive: true });
            }
            console.log('✅ Storage initialized successfully');
        }
        catch (error) {
            console.error('❌ Error initializing storage:', error);
            throw error;
        }
    }
    /**
     * Save chat data to VS Code's GlobalState storage
     */
    async _saveChatToStorage(fileName, jsonContent, parsedJson) {
        try {
            const fs = __webpack_require__(3);
            const timestamp = new Date().toISOString();
            // Initialize storage directory
            await this._initStorage();
            // Create chat export record
            const chatExport = {
                id: Date.now().toString(), // Simple ID based on timestamp
                fileName,
                timestamp,
                savedAt: timestamp,
                content: jsonContent,
                parsedContent: parsedJson ? JSON.stringify(parsedJson) : null,
                fileSize: jsonContent.length,
                contentType: 'application/json',
                source: 'vscode-chat-export'
            };
            // Get existing exports from GlobalState
            const existingExports = this._context.globalState.get('chatExports', []);
            // Add new export
            existingExports.push(chatExport);
            // Save back to GlobalState (keep only last 100 exports to prevent memory issues)
            const limitedExports = existingExports.slice(-100);
            await this._context.globalState.update('chatExports', limitedExports);
            // Also save to file system for backup
            const path = __webpack_require__(4);
            const backupDir = path.join((__webpack_require__(6).homedir)(), '.vscode-chat-exports');
            const backupFile = path.join(backupDir, `${fileName}_${Date.now()}.json`);
            try {
                fs.writeFileSync(backupFile, jsonContent);
                console.log('💾 Chat export saved to file:', backupFile);
            }
            catch (fileError) {
                console.warn('⚠️ Could not save backup file:', fileError);
            }
            // Extract and save metrics if available
            if (parsedJson) {
                await this._extractAndSaveMetrics(chatExport.id, parsedJson);
            }
            console.log('✅ Chat export saved to GlobalState storage successfully');
        }
        catch (error) {
            console.error('❌ Error saving chat to storage:', error);
            throw error;
        }
    }
    /**
     * Extract and save metrics from chat data to VS Code GlobalState storage
     */
    async _extractAndSaveMetrics(exportId, parsedJson) {
        try {
            const storage = this._context?.globalState;
            if (!storage) {
                throw new Error('Failed to initialize storage');
            }
            const metrics = [];
            let sessionStart = null;
            let sessionEnd = null;
            let sessionId = exportId; // fallback
            // Extract metrics from the chat data
            if (parsedJson && parsedJson.requests && Array.isArray(parsedJson.requests)) {
                let totalPrompts = 0;
                let filesChanged = new Set();
                let linesAdded = 0;
                let linesDeleted = 0;
                let helpful = 0;
                let unhelpful = 0;
                for (const request of parsedJson.requests) {
                    totalPrompts++;
                    const requestTime = new Date(request.timestamp || Date.now());
                    if (!sessionStart || requestTime < sessionStart) {
                        sessionStart = requestTime;
                    }
                    if (!sessionEnd || requestTime > sessionEnd) {
                        sessionEnd = requestTime;
                    }
                    // Check for thumbs up/down in user feedback
                    if (request.feedback) {
                        if (request.feedback.type === 'thumbsUp' || request.feedback.helpful === true) {
                            helpful++;
                        }
                        else if (request.feedback.type === 'thumbsDown' || request.feedback.helpful === false) {
                            unhelpful++;
                        }
                    }
                    // Process tool calls to find file changes and line counts
                    if (request.toolCallRounds && Array.isArray(request.toolCallRounds)) {
                        for (const round of request.toolCallRounds) {
                            if (round.toolCalls && Array.isArray(round.toolCalls)) {
                                for (const toolCall of round.toolCalls) {
                                    // Check for file editing operations
                                    if (toolCall.name === 'replace_string_in_file' && toolCall.input) {
                                        const filePath = toolCall.input.filePath;
                                        if (filePath && typeof filePath === 'string') {
                                            filesChanged.add(filePath);
                                            // Analyze the replacement to count line changes
                                            const oldString = toolCall.input.oldString || '';
                                            const newString = toolCall.input.newString || '';
                                            const oldLines = oldString.split('\n').length - 1;
                                            const newLines = newString.split('\n').length - 1;
                                            const lineDiff = newLines - oldLines;
                                            if (lineDiff > 0) {
                                                linesAdded += lineDiff;
                                            }
                                            else if (lineDiff < 0) {
                                                linesDeleted += Math.abs(lineDiff);
                                            }
                                        }
                                    }
                                    // Check for create_file operations
                                    if (toolCall.name === 'create_file' && toolCall.input) {
                                        const filePath = toolCall.input.filePath;
                                        if (filePath && typeof filePath === 'string') {
                                            filesChanged.add(filePath);
                                            // Count lines in new file
                                            const content = toolCall.input.content || '';
                                            const newLines = content.split('\n').length;
                                            linesAdded += newLines;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                // Add all metrics
                metrics.push({
                    name: 'total_prompts',
                    value: totalPrompts.toString(),
                    type: 'count'
                });
                metrics.push({
                    name: 'files_changed',
                    value: filesChanged.size.toString(),
                    type: 'count'
                });
                metrics.push({
                    name: 'lines_added',
                    value: linesAdded.toString(),
                    type: 'count'
                });
                metrics.push({
                    name: 'lines_deleted',
                    value: linesDeleted.toString(),
                    type: 'count'
                });
                metrics.push({
                    name: 'helpful_responses',
                    value: helpful.toString(),
                    type: 'count'
                });
                metrics.push({
                    name: 'unhelpful_responses',
                    value: unhelpful.toString(),
                    type: 'count'
                });
                // Add session duration if we have valid timestamps
                if (sessionStart && sessionEnd) {
                    const durationMs = sessionEnd.getTime() - sessionStart.getTime();
                    const durationMinutes = Math.round(durationMs / (1000 * 60));
                    metrics.push({
                        name: 'session_duration_minutes',
                        value: durationMinutes.toString(),
                        type: 'duration'
                    });
                }
            }
            else if (parsedJson && Array.isArray(parsedJson)) {
                // Fallback: Handle simple array format
                metrics.push({
                    name: 'total_messages',
                    value: parsedJson.length.toString(),
                    type: 'count'
                });
                const userMessages = parsedJson.filter(msg => msg.author === 'user').length;
                const assistantMessages = parsedJson.filter(msg => msg.author === 'assistant').length;
                metrics.push({
                    name: 'user_messages',
                    value: userMessages.toString(),
                    type: 'count'
                });
                metrics.push({
                    name: 'assistant_messages',
                    value: assistantMessages.toString(),
                    type: 'count'
                });
            }
            // Use session start time as unique identifier
            if (sessionStart) {
                sessionId = sessionStart.getTime().toString();
            }
            // Check if we already have metrics for this session to avoid duplicates
            const existingSessionKey = `chat-session-${sessionId}`;
            const existingSession = storage.get(existingSessionKey);
            if (existingSession) {
                console.log('⚠️ Session already processed, skipping duplicate:', sessionId);
                return;
            }
            // Store metrics in GlobalState with unique session ID
            const metricsData = {
                sessionId,
                exportId,
                timestamp: Date.now(),
                sessionTimestamp: sessionStart ? sessionStart.getTime() : Date.now(),
                metrics: metrics.map(metric => ({
                    name: metric.name,
                    value: metric.value,
                    type: metric.type
                }))
            };
            // Store using session ID to prevent duplicates
            await storage.update(existingSessionKey, metricsData);
            console.log('✅ Extracted and saved', metrics.length, 'metrics for session:', sessionId);
        }
        catch (error) {
            console.error('❌ Error extracting metrics:', error);
        }
    }
    async _clearChatExports() {
        try {
            // Clear stored chat exports from GlobalState
            const storage = this._context?.globalState;
            if (storage) {
                // Get all stored keys that start with chat-related prefixes
                const allKeys = storage.keys();
                const chatKeys = allKeys.filter(key => key.startsWith('chat-export-') ||
                    key.startsWith('chat-metrics-') ||
                    key.startsWith('chat-session-'));
                // Clear all chat-related data
                for (const key of chatKeys) {
                    await storage.update(key, undefined);
                }
                console.log('✅ Chat exports cleared from storage (cleared', chatKeys.length, 'entries)');
            }
        }
        catch (error) {
            console.error('❌ Error clearing chat exports:', error);
            throw error;
        }
    }
    resolveWebviewView(webviewView, context, _token) {
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            try {
                switch (message.command) {
                    case 'sendToChat':
                        // Send prompt to VS Code Copilot Chat
                        vscode.commands.executeCommand('workbench.action.chat.open', message.prompt);
                        break;
                    case 'exportChat':
                        console.log('🚀 Starting chat export...');
                        try {
                            // Get user home directory for file reading later
                            const os = __webpack_require__(6);
                            const path = __webpack_require__(4);
                            const homeDir = os.homedir();
                            const expectedChatFilePath = path.join(homeDir, 'chat.json');
                            // First, ensure chat panel is open and focused
                            await vscode.commands.executeCommand('workbench.action.chat.open');
                            await new Promise(resolve => setTimeout(resolve, 500));
                            // Execute the export command
                            await vscode.commands.executeCommand('workbench.action.chat.export');
                            // Wait a bit for user to save the file, then try to read it
                            setTimeout(async () => {
                                try {
                                    const chatFileUri = vscode.Uri.file(expectedChatFilePath);
                                    // Check if file exists and read it
                                    const fileContent = await vscode.workspace.fs.readFile(chatFileUri);
                                    const jsonContent = fileContent.toString();
                                    // Parse JSON content
                                    let parsedJson = null;
                                    try {
                                        parsedJson = JSON.parse(jsonContent);
                                    }
                                    catch (parseError) {
                                        console.log('⚠️ Could not parse JSON content:', parseError);
                                    }
                                    // Save to VS Code's built-in storage
                                    try {
                                        await this._saveChatToStorage('chat.json', jsonContent, parsedJson);
                                        //vscode.window.showInformationMessage('✅ Chat exported and saved to storage successfully!');
                                    }
                                    catch (storageError) {
                                        console.error('Error saving to storage:', storageError);
                                        //vscode.window.showErrorMessage('Error saving chat to storage: ' + (storageError instanceof Error ? storageError.message : String(storageError)));
                                    }
                                }
                                catch (error) {
                                    console.log('Could not read chat file from home directory. Please ensure you saved it as chat.json in:', homeDir);
                                    console.error('File read error:', error);
                                }
                            }, 3000); // Give user 3 seconds to save the file
                            // Send success message back to webview
                            webviewView.webview.postMessage({
                                command: 'exportComplete',
                                success: true,
                                message: 'Chat export command executed successfully.'
                            });
                        }
                        catch (error) {
                            console.error('Error executing chat export command:', error);
                            //vscode.window.showErrorMessage(`Failed to export chat: ${error}`);
                            // Send error message back to webview
                            webviewView.webview.postMessage({
                                command: 'exportComplete',
                                success: false,
                                message: `Error: ${error}`
                            });
                        }
                        break;
                    case 'clearChatExports':
                        // Clear all stored chat exports
                        try {
                            await this._clearChatExports();
                            //vscode.window.showInformationMessage('All chat exports cleared from storage');
                            webviewView.webview.postMessage({
                                command: 'clearExportsComplete',
                                success: true,
                                message: 'All exports cleared successfully'
                            });
                        }
                        catch (error) {
                            console.error('Error clearing chat exports:', error);
                            //vscode.window.showErrorMessage('Error clearing exports: ' + (error instanceof Error ? error.message : String(error)));
                            webviewView.webview.postMessage({
                                command: 'clearExportsComplete',
                                success: false,
                                message: `Error: ${error}`
                            });
                        }
                        break;
                    case 'getHomeDirectory':
                        // Send home directory path to webview
                        try {
                            const os = __webpack_require__(6);
                            const homeDir = os.homedir();
                            console.log('Home directory retrieved:', homeDir);
                            webviewView.webview.postMessage({
                                command: 'homeDirectory',
                                path: homeDir
                            });
                        }
                        catch (error) {
                            console.error('Error getting home directory:', error);
                            webviewView.webview.postMessage({
                                command: 'homeDirectory',
                                path: null
                            });
                        }
                        break;
                    case 'loadMetrics':
                        // Load and send metrics data to webview
                        try {
                            const storage = this._context?.globalState;
                            if (!storage) {
                                throw new Error('Storage not available');
                            }
                            // Get all stored session metrics (new format)
                            const allKeys = storage.keys();
                            const sessionKeys = allKeys.filter(key => key.startsWith('chat-session-'));
                            const allMetrics = [];
                            for (const key of sessionKeys) {
                                const sessionData = storage.get(key);
                                if (sessionData && typeof sessionData === 'object' && 'metrics' in sessionData) {
                                    // Add session ID and timestamp to each metric
                                    const sessionId = sessionData.sessionId;
                                    const sessionTimestamp = sessionData.sessionTimestamp || sessionData.timestamp;
                                    const formattedDate = new Date(sessionTimestamp).toLocaleDateString('en-GB'); // dd/mm/yyyy format
                                    for (const metric of sessionData.metrics) {
                                        allMetrics.push({
                                            sessionId,
                                            date: formattedDate,
                                            metricName: metric.name,
                                            metricValue: metric.value,
                                            metricType: metric.type
                                        });
                                    }
                                }
                            }
                            console.log('📊 Loaded', allMetrics.length, 'metrics from', sessionKeys.length, 'unique sessions');
                            webviewView.webview.postMessage({
                                command: 'metricsLoaded',
                                metrics: allMetrics
                            });
                        }
                        catch (error) {
                            console.error('Error loading metrics:', error);
                            webviewView.webview.postMessage({
                                command: 'metricsLoaded',
                                metrics: [],
                                error: error instanceof Error ? error.message : String(error)
                            });
                        }
                        break;
                }
            }
            catch (error) {
                console.error('Error in message handler:', error);
            }
        });
        // Listen for configuration changes to update the webview
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('rk-idp')) {
                webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
            }
        });
    }
    _getConnectionStatus(value) {
        if (!value || value.trim() === '') {
            return { status: 'Not configured', color: 'var(--vscode-charts-red)' };
        }
        return { status: 'Configured', color: 'var(--vscode-charts-green)' };
    }
    _getHtmlForWebview(webview) {
        // Get configuration status for each service
        const copilotStatus = this._getConnectionStatus(RkIdpConfiguration.getCopilotUsername());
        const githubStatus = this._getConnectionStatus(RkIdpConfiguration.getGitHubUserPAT());
        const sonarStatus = this._getConnectionStatus(RkIdpConfiguration.getSonarQubeBaseUrl());
        const checkmarxStatus = this._getConnectionStatus(RkIdpConfiguration.getCheckmarxUserApiKey());
        const appsecStatus = this._getConnectionStatus(RkIdpConfiguration.getAppsecJiraUserPAT());
        const jiraStatus = this._getConnectionStatus(RkIdpConfiguration.getJiraUserPAT());
        const doraStatus = this._getConnectionStatus(RkIdpConfiguration.getDoraGitHubUserPAT());
        // Get user home directory for chat file path
        const os = __webpack_require__(6);
        const path = __webpack_require__(4);
        const homeDir = os.homedir();
        const chatFilePath = path.join(homeDir, 'chat.json');
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>RK IDP</title>
				<style>
					* {
						box-sizing: border-box;
						margin: 0;
						padding: 0;
					}
					
					body {
						padding: 16px;
						color: var(--vscode-foreground);
						background-color: var(--vscode-sideBar-background);
						font-family: var(--vscode-font-family);
						font-size: var(--vscode-font-size);
						line-height: 1.4;
					}
					
					.header {
						text-align: center;
						margin-bottom: 24px;
						padding: 16px;
						background: var(--vscode-editor-background);
						border-radius: 8px;
						border: 1px solid var(--vscode-panel-border);
					}
					
					.logo {
						font-size: 28px;
						font-weight: 700;
						color: var(--vscode-textLink-foreground);
						margin-bottom: 8px;
						letter-spacing: 2px;
					}
					
					.subtitle {
						color: var(--vscode-descriptionForeground);
						font-size: 12px;
						font-weight: 500;
						text-transform: uppercase;
						letter-spacing: 1px;
					}
					
					.section {
						margin-bottom: 20px;
						background: var(--vscode-sideBar-background);
						border-radius: 6px;
						border: 1px solid #000000;
						overflow: hidden;
					}
					
					.section-header {
						background: #2d2d30;
						color: #ffffff;
						padding: 12px 16px;
						font-weight: 600;
						font-size: 13px;
						text-transform: uppercase;
						letter-spacing: 0.5px;
						border-bottom: 1px solid var(--vscode-panel-border);
						display: flex;
						align-items: center;
					}
					
					.section-header::before {
						content: '';
						display: inline-block;
						width: 4px;
						height: 16px;
						background: var(--vscode-textLink-foreground);
						margin-right: 12px;
						border-radius: 2px;
					}
					
					.section-content {
						padding: 16px;
						background: var(--vscode-editor-background);
					}
					
					.section-content p {
						color: var(--vscode-descriptionForeground);
						margin-bottom: 12px;
						font-size: 13px;
					}
					
					.section-content p:last-child {
						margin-bottom: 0;
					}
					
					.placeholder-text {
						font-style: italic;
						color: var(--vscode-input-placeholderForeground);
					}
					
					.separator {
						height: 1px;
						background: linear-gradient(
							90deg, 
							transparent, 
							var(--vscode-panel-border) 50%, 
							transparent
						);
						margin: 20px 0;
					}
					
					.status-indicator {
						display: inline-block;
						width: 8px;
						height: 8px;
						border-radius: 50%;
						background: var(--vscode-charts-green);
						margin-right: 8px;
					}
					
					.section-header.history::before {
						background: var(--vscode-charts-blue);
					}
					
					.section-header.quality::before {
						background: var(--vscode-charts-orange);
					}
					
					.section-header.agile::before {
						background: var(--vscode-charts-green);
					}
					
					.section-header.devsecops::before {
						background: var(--vscode-charts-purple);
					}
					
					.subsection {
						margin-bottom: 12px;
						border-left: 3px solid #000000;
						padding: 8px 12px;
						background: #e6f3ff;
						border-radius: 4px;
						border: 1px solid #000000;
					}
					
					.subsection:last-child {
						margin-bottom: 0;
					}
					
					.subsection-title {
						font-weight: 600;
						font-size: 12px;
						color: var(--vscode-foreground);
						margin-bottom: 4px;
						display: flex;
						align-items: center;
						justify-content: flex-start;
					}
					
					.subsection-title::before {
						content: '▸';
						color: var(--vscode-textLink-foreground);
						margin-right: 6px;
						font-size: 10px;
					}
					
					.subsection-title-text {
						display: flex;
						align-items: center;
						flex: 1;
					}
					
					.info-icon {
						font-size: 11px;
						color: #000080;
						cursor: pointer;
						margin-left: 8px;
						padding: 2px;
						border-radius: 50%;
						user-select: none;
					}
					
					.subsection-info {
						max-height: 0;
						overflow: hidden;
						transition: max-height 0.3s ease-out;
						margin-top: 0;
					}
					
					.subsection-info.expanded {
						max-height: 200px;
						margin-top: 8px;
					}
					
					.info-content {
						background: var(--vscode-textBlockQuote-background);
						border-left: 3px solid var(--vscode-textLink-foreground);
						padding: 8px 12px;
						font-size: 10px;
						color: var(--vscode-foreground);
						border-radius: 0 4px 4px 0;
						line-height: 1.3;
					}
					
					.info-content ul {
						margin: 4px 0;
						padding-left: 16px;
					}
					
					.info-content li {
						margin-bottom: 2px;
					}
					
					.copilot-form {
						background: var(--vscode-editor-background);
						border: 2px solid var(--vscode-textLink-foreground);
						border-radius: 8px;
						padding: 16px;
						margin-top: 12px;
					}
					
					.form-section {
						margin-bottom: 16px;
					}
					
					.form-title {
						font-weight: 600;
						font-size: 13px;
						color: var(--vscode-foreground);
						margin-bottom: 12px;
						padding-bottom: 6px;
						border-bottom: 1px solid var(--vscode-panel-border);
					}
					
					.form-row {
						display: flex;
						gap: 12px;
						margin-bottom: 12px;
						align-items: flex-start;
					}
					
					.form-group {
						flex: 1;
					}
					
					.form-group-aligned {
						flex: 1;
						display: flex;
						flex-direction: column;
					}
					
					.form-group-aligned .form-input,
					.form-group-aligned .form-select {
						margin-top: auto;
					}
					
					.form-label {
						display: block;
						font-size: 11px;
						font-weight: 500;
						color: var(--vscode-foreground);
						margin-bottom: 4px;
					}
					
					.form-input {
						width: 100%;
						padding: 6px 10px;
						border: 1px solid var(--vscode-input-border);
						border-radius: 4px;
						background: var(--vscode-input-background);
						color: var(--vscode-input-foreground);
						font-size: 12px;
						font-family: var(--vscode-font-family);
					}
					
					.form-input:focus {
						outline: none;
						border-color: var(--vscode-focusBorder);
						box-shadow: 0 0 0 1px var(--vscode-focusBorder);
					}
					
					.form-input.error {
						border-color: var(--vscode-errorForeground);
						background: var(--vscode-inputValidation-errorBackground);
						box-shadow: 0 0 0 1px var(--vscode-errorForeground);
					}
					
					.form-group.error .form-label {
						color: var(--vscode-errorForeground);
					}
					
					.error-message {
						color: var(--vscode-errorForeground);
						font-size: 11px;
						margin-top: 4px;
						padding: 4px 6px;
						background: var(--vscode-inputValidation-errorBackground);
						border-radius: 3px;
						border-left: 3px solid var(--vscode-errorForeground);
					}
					
					.results-table {
						width: 100%;
						border-collapse: collapse;
						margin: 12px 0;
						background: var(--vscode-editor-background);
						border: 1px solid var(--vscode-panel-border);
						border-radius: 4px;
						overflow: hidden;
					}
					
					.results-table th,
					.results-table td {
						padding: 8px 6px;
						text-align: left;
						border-bottom: 1px solid var(--vscode-panel-border);
						font-size: 10px;
					}
					
					.results-table th {
						background: #2d2d30;
						color: #ffffff;
						font-weight: 600;
						font-size: 9px;
						text-transform: uppercase;
						letter-spacing: 0.5px;
					}
					
					.results-table td {
						color: var(--vscode-foreground);
						background: var(--vscode-editor-background);
					}
					
					.results-table tr:hover td {
						background: var(--vscode-list-hoverBackground);
					}
					
					.form-buttons {
						display: flex;
						gap: 8px;
						margin-top: 12px;
						flex-wrap: wrap;
						justify-content: flex-end;
					}
					
					.form-button {
						padding: 6px 12px;
						border: 1px solid var(--vscode-button-border);
						border-radius: 4px;
						background: var(--vscode-button-background);
						color: var(--vscode-button-foreground);
						font-size: 11px;
						font-weight: 500;
						cursor: pointer;
						transition: all 0.2s ease;
						position: relative;
						min-width: 100px;
					}
					
					.form-button:hover:not(:disabled) {
						background: var(--vscode-button-hoverBackground);
					}
					
					.form-button:disabled {
						opacity: 0.6;
						cursor: not-allowed;
						background: var(--vscode-button-background);
					}
					
					.form-button.primary {
						background: var(--vscode-button-background);
						color: var(--vscode-button-foreground);
						font-weight: 600;
						order: 1;
					}
					
					.form-button.secondary {
						background: var(--vscode-button-secondaryBackground);
						color: var(--vscode-button-secondaryForeground);
						border-color: var(--vscode-button-border);
					}
					
					.form-button.secondary:hover:not(:disabled) {
						background: var(--vscode-button-secondaryHoverBackground);
					}

					.form-button.info {
						background: var(--vscode-charts-blue);
						color: var(--vscode-button-foreground);
						border-color: var(--vscode-charts-blue);
					}
					
					.form-button.info:hover:not(:disabled) {
						background: var(--vscode-button-hoverBackground);
						opacity: 0.9;
					}

					.form-button.warning {
						background: var(--vscode-charts-orange);
						color: var(--vscode-button-foreground);
						border-color: var(--vscode-charts-orange);
					}
					
					.form-button.warning:hover:not(:disabled) {
						background: var(--vscode-button-hoverBackground);
						opacity: 0.9;
					}

					.form-button.danger {
						background: var(--vscode-charts-red);
						color: var(--vscode-button-foreground);
						border-color: var(--vscode-charts-red);
					}
					
					.form-button.danger:hover:not(:disabled) {
						background: #cc0000;
						color: white;
					}
					
					/* Help Note */
					.help-note {
						margin-top: 8px;
						padding: 6px 0;
						border-top: 1px solid var(--vscode-widget-border);
					}
					
					.help-note span {
						display: block;
						text-align: right;
						font-size: 11px;
						color: var(--vscode-descriptionForeground);
						font-style: italic;
						line-height: 1.3;
					}
					
					.help-note-required {
						color: var(--vscode-errorForeground) !important;
						font-weight: 500 !important;
						font-style: normal !important;
					}
					
					/* Loading Spinner */
					.spinner {
						position: fixed;
						top: 0;
						left: 0;
						width: 100%;
						height: 100%;
						background: rgba(0, 0, 0, 0.5);
						display: none;
						justify-content: center;
						align-items: center;
						z-index: 10000;
						backdrop-filter: blur(2px);
					}
					
					.spinner.active {
						display: flex;
					}
					
					.spinner-content {
						background: var(--vscode-editor-background);
						border: 2px solid var(--vscode-focusBorder);
						border-radius: 8px;
						padding: 24px;
						text-align: center;
						box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
					}
					
					.spinner-wheel {
						width: 32px;
						height: 32px;
						border: 3px solid var(--vscode-panel-border);
						border-top: 3px solid var(--vscode-focusBorder);
						border-radius: 50%;
						animation: spin 1s linear infinite;
						margin: 0 auto 12px;
					}
					
					.spinner-text {
						color: var(--vscode-editor-foreground);
						font-size: 14px;
						font-weight: 500;
					}
					
					@keyframes spin {
						0% { transform: rotate(0deg); }
						100% { transform: rotate(360deg); }
					}
						background: var(--vscode-button-secondaryBackground);
						color: var(--vscode-button-secondaryForeground);
					}
					
					.form-button.secondary:hover {
						background: var(--vscode-button-secondaryHoverBackground);
					}
					
					.github-form {
						background: var(--vscode-editor-background);
						border: 2px solid var(--vscode-textLink-foreground);
						border-radius: 8px;
						padding: 16px;
						margin-top: 12px;
					}
					
					.form-help-text {
						font-size: 10px;
						color: var(--vscode-descriptionForeground);
						font-style: italic;
						margin-top: 2px;
						min-height: 14px;
					}
					
					.form-select {
						width: 100%;
						padding: 6px 10px;
						border: 1px solid var(--vscode-input-border);
						border-radius: 4px;
						background: var(--vscode-input-background);
						color: var(--vscode-input-foreground);
						font-size: 12px;
						font-family: var(--vscode-font-family);
					}
					
					.form-select:focus {
						outline: none;
						border-color: var(--vscode-focusBorder);
						box-shadow: 0 0 0 1px var(--vscode-focusBorder);
					}
					
					.form-row-triple {
						display: flex;
						gap: 12px;
						margin-bottom: 12px;
						align-items: flex-end;
					}
					
					.form-group-small {
						flex: 1;
					}
					
					.subsection-description {
						font-size: 11px;
						color: var(--vscode-descriptionForeground);
						margin-bottom: 6px;
					}
					
					.subsection-status {
						font-size: 10px;
						color: var(--vscode-input-placeholderForeground);
						font-style: italic;
					}
					
					.subsection.history-copilot {
						border-left-color: var(--vscode-charts-blue);
					}
					
					.subsection.history-github {
						border-left-color: var(--vscode-charts-blue);
					}
					
					.subsection.quality-sonar {
						border-left-color: var(--vscode-charts-orange);
					}
					
					.subsection.quality-checkmarx {
						border-left-color: var(--vscode-charts-orange);
					}
					
					.subsection.quality-appsec {
						border-left-color: var(--vscode-charts-orange);
					}
					
					.subsection.agile-jira {
						border-left-color: var(--vscode-charts-green);
					}
					
					.subsection.devsecops-dora {
						border-left-color: var(--vscode-charts-purple);
					}
					
					.quality-common-form {
						background: var(--vscode-editor-background);
						border: 2px solid var(--vscode-charts-orange);
						border-radius: 8px;
						padding: 16px;
						margin-bottom: 16px;
					}
					
					.sonar-form {
						background: var(--vscode-editor-background);
						border: 2px solid var(--vscode-charts-orange);
						border-radius: 8px;
						padding: 16px;
						margin-top: 12px;
					}
					
					.checkmarx-form {
						background: var(--vscode-editor-background);
						border: 2px solid var(--vscode-charts-orange);
						border-radius: 8px;
						padding: 16px;
						margin-top: 12px;
					}
					
					.appsec-form {
						background: var(--vscode-editor-background);
						border: 2px solid var(--vscode-charts-orange);
						border-radius: 8px;
						padding: 16px;
						margin-top: 12px;
					}
					
					.jira-form {
						background: var(--vscode-editor-background);
						border: 2px solid var(--vscode-charts-green);
						border-radius: 8px;
						padding: 16px;
						margin-top: 12px;
					}
					
					.form-input[readonly] {
						background: var(--vscode-input-background);
						color: var(--vscode-descriptionForeground);
						opacity: 0.7;
						cursor: not-allowed;
					}
					
					/* DORA Metrics Specific Styles */
					.dora-metrics-grid {
						display: grid;
						grid-template-columns: 1fr 1fr;
						gap: 16px;
						margin: 20px 0;
					}
					
					.metric-card {
						background: linear-gradient(135deg, var(--vscode-editor-background) 0%, var(--vscode-sideBar-background) 100%);
						border: 2px solid var(--vscode-panel-border);
						border-radius: 12px;
						padding: 20px;
						text-align: center;
						transition: all 0.3s ease;
						position: relative;
						overflow: hidden;
					}
					
					.metric-card:hover {
						transform: translateY(-4px);
						box-shadow: 0 8px 16px rgba(0, 123, 255, 0.2);
						border-color: var(--vscode-focusBorder);
					}
					
					.metric-card::before {
						content: '';
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						height: 4px;
						background: linear-gradient(90deg, #00D4FF, #007ACC, #0078D4);
					}
					
					.metric-card.deployment-frequency::before {
						background: linear-gradient(90deg, #28a745, #20c997, #17a2b8);
					}
					
					.metric-card.lead-time::before {
						background: linear-gradient(90deg, #007bff, #6f42c1, #6610f2);
					}
					
					.metric-card.change-failure::before {
						background: linear-gradient(90deg, #fd7e14, #dc3545, #e83e8c);
					}
					
					.metric-card.recovery-time::before {
						background: linear-gradient(90deg, #ffc107, #fd7e14, #dc3545);
					}
					
					.metric-icon {
						font-size: 28px;
						margin-bottom: 12px;
					}
					
					.metric-value {
						font-size: 28px;
						font-weight: bold;
						color: var(--vscode-editor-foreground);
						margin: 8px 0;
					}
					
					.metric-label {
						font-size: 14px;
						color: var(--vscode-descriptionForeground);
						font-weight: 500;
						margin-bottom: 8px;
					}
					
					.metric-trend {
						font-size: 12px;
						padding: 4px 8px;
						border-radius: 12px;
						font-weight: 500;
					}
					
					.metric-trend.positive {
						background-color: rgba(40, 167, 69, 0.1);
						color: #28a745;
					}
					
					.metric-trend.negative {
						background-color: rgba(220, 53, 69, 0.1);
						color: #dc3545;
					}
					
					.metric-trend.neutral {
						background-color: var(--vscode-badge-background);
						color: var(--vscode-badge-foreground);
					}
					
					.charts-container {
						display: grid;
						grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
						gap: 20px;
						margin: 20px 0;
					}
					
					.chart-section {
						background: var(--vscode-editor-background);
						border: 1px solid var(--vscode-panel-border);
						border-radius: 8px;
						padding: 16px;
					}
					
					.chart-title {
						font-size: 14px;
						font-weight: 600;
						color: var(--vscode-editor-foreground);
						margin-bottom: 12px;
						text-align: center;
					}
					
					canvas {
						width: 100% !important;
						height: 150px !important;
						border-radius: 4px;
					}
					
					/* DORA Results Table Enhancements */
					.results-table th {
						background-color: #2d2d30;
						color: #ffffff;
						font-weight: 600;
						font-size: 12px;
						text-transform: uppercase;
						letter-spacing: 0.5px;
						padding: 12px 8px;
					}
					
					.status-success {
						color: #28a745;
						font-weight: 600;
					}
					
					.status-failed {
						color: #dc3545;
						font-weight: 600;
					}
					
					.status-pending {
						color: #ffc107;
						font-weight: 600;
					}
					
					.commit-hash {
						font-family: 'Consolas', 'Monaco', monospace;
						font-size: 11px;
						background: var(--vscode-textCodeBlock-background);
						padding: 2px 6px;
						border-radius: 4px;
						color: var(--vscode-textPreformat-foreground);
					}
					
					/* JIRA Action Buttons */
					.jira-actions {
						display: flex;
						flex-direction: column;
						gap: 4px;
						min-width: 140px;
					}
					
					.action-btn {
						padding: 4px 8px;
						font-size: 10px;
						font-weight: 500;
						border: 1px solid var(--vscode-button-border);
						border-radius: 3px;
						cursor: pointer;
						transition: all 0.2s ease;
						text-align: center;
						white-space: nowrap;
					}
					
					.action-btn.groom {
						background: linear-gradient(135deg, #28a745, #20c997);
						color: white;
						border-color: #28a745;
					}
					
					.action-btn.tasks {
						background: linear-gradient(135deg, #007bff, #0056b3);
						color: white;
						border-color: #007bff;
					}
					
					.action-btn.test {
						background: linear-gradient(135deg, #fd7e14, #e55100);
						color: white;
						border-color: #fd7e14;
					}
					
					.action-btn.estimate {
						background: linear-gradient(135deg, #6f42c1, #5a32a3);
						color: white;
						border-color: #6f42c1;
					}
					
					.action-btn.trace {
						background: linear-gradient(135deg, #dc3545, #bd2130);
						color: white;
						border-color: #dc3545;
					}
					
					.action-btn:hover {
						transform: translateY(-1px);
						box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
						opacity: 0.9;
					}
					
					.action-btn:active {
						transform: translateY(0);
						box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
					}
					
					/* AppSec Action Buttons */
					.appsec-actions {
						display: flex;
						flex-direction: column;
						gap: 4px;
						min-width: 140px;
					}
					
					.action-btn.analyze {
						background: linear-gradient(135deg, #17a2b8, #138496);
						color: white;
						border-color: #17a2b8;
					}
					
					.action-btn.fix {
						background: linear-gradient(135deg, #28a745, #1e7e34);
						color: white;
						border-color: #28a745;
					}
					
					.action-btn.testplan {
						background: linear-gradient(135deg, #ffc107, #e0a800);
						color: white;
						border-color: #ffc107;
					}
					
					.action-btn.mitigate {
						background: linear-gradient(135deg, #6f42c1, #5a32a3);
						color: white;
						border-color: #6f42c1;
					}
				</style>
			</head>
			<body>
				<!-- Loading Spinner Overlay -->
				<div id="loading-spinner" class="spinner">
					<div class="spinner-content">
						<div class="spinner-wheel"></div>
						<div class="spinner-text" id="spinner-text">Processing...</div>
					</div>
				</div>
				
				<div class="header">
					<div class="logo">RK</div>
					<div class="subtitle">Intelligent Development Platform</div>
				</div>
				
				<div class="section">
					<div class="section-header history">
						<span class="status-indicator"></span>
						History
					</div>
					<div class="section-content">
						<p>Track your development activities and code changes.</p>
						
						<div class="subsection history-copilot">
							<div class="subsection-title">
								<div class="subsection-title-text">
									<span>Copilot</span>
									<span class="info-icon" onclick="toggleInfo('copilot-info')">ⓘ</span>
								</div>
							</div>
							<div class="subsection-description">AI-powered code suggestions and chat history</div>
							<div class="subsection-status" style="color: ${copilotStatus.color}">${copilotStatus.status}</div>
							<div id="copilot-info" class="subsection-info">
								<div class="info-content">
									<strong>GitHub Copilot Integration:</strong>
									<ul>
										<li>Track AI suggestions acceptance rate</li>
										<li>Monitor chat conversation history</li>
										<li>View code generation patterns</li>
										<li>Analyze productivity improvements</li>
									</ul>
								</div>
							</div>
							
							<div class="copilot-form">
								<div class="form-title">📊 Copilot Metrics Analysis</div>
								
								<div class="form-section">
									<div class="form-row">
										<div class="form-group">
											<label class="form-label" for="copilot-start-date">Start Date</label>
											<input type="date" id="copilot-start-date" class="form-input" max="" />
										</div>
										<div class="form-group">
											<label class="form-label" for="copilot-end-date">End Date</label>
											<input type="date" id="copilot-end-date" class="form-input" max="" />
										</div>
									</div>
								</div>
								
								<div class="form-section">
									<div class="form-title">📈 Results</div>
									<table class="results-table" id="copilot-results-table">
										<thead>
											<tr>
												<th>Date</th>
												<th>Prompts</th>
												<th>Files Changed</th>
												<th>Lines Added</th>
												<th>Lines Deleted</th>
												<th>Helpful</th>
												<th>Unhelpful</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
											</tr>
										</tbody>
									</table>
								</div>
								
								<div class="form-buttons">
									<button class="form-button primary" onclick="calculateCopilotMetrics()">Export Chat & Calculate Metrics</button>
									<button class="form-button danger" onclick="clearStoredExports()">Clear Storage</button>
									<button class="form-button secondary" onclick="resetCopilotForm()">Reset Form</button>
									<button class="form-button secondary" onclick="resetCopilotResults()">Reset Results</button>
								</div>
								
								<div class="help-note">
									<span class="help-note-required" id="home-directory-note">
										ℹ️ Click "Export Chat & Calculate Metrics" to automatically export and analyze your latest GitHub Copilot chat. Save the file as "chat.json" in <strong>loading...</strong> when prompted.
									</span>
								</div>
							</div>
						</div>
						
						<div class="subsection history-github">
							<div class="subsection-title">
								<div class="subsection-title-text">
									<span>Enterprise GitHub</span>
									<span class="info-icon" onclick="toggleInfo('github-info')">ⓘ</span>
								</div>
							</div>
							<div class="subsection-description">Repository commits, pull requests, and code reviews</div>
							<div class="subsection-status" style="color: ${githubStatus.color}">${githubStatus.status}</div>
							<div id="github-info" class="subsection-info">
								<div class="info-content">
									<strong>GitHub Enterprise Features:</strong>
									<ul>
										<li>Repository activity tracking</li>
										<li>Pull request analytics</li>
										<li>Code review metrics</li>
										<li>Branch protection compliance</li>
									</ul>
								</div>
							</div>
							
							<div class="github-form">
								<div class="form-title">📊 GitHub Repository Analysis</div>
								
								<div class="form-section">
									<div class="form-row">
										<div class="form-group">
											<label class="form-label" for="github-start-date">Start Date (Optional)</label>
											<input type="date" id="github-start-date" class="form-input" max="" />
										</div>
										<div class="form-group">
											<label class="form-label" for="github-end-date">End Date (Optional)</label>
											<input type="date" id="github-end-date" class="form-input" max="" />
										</div>
									</div>
									
									<div class="form-row">
										<div class="form-group-aligned">
											<label class="form-label" for="github-repo-name">Repository Name *</label>
											<input type="text" id="github-repo-name" class="form-input" placeholder="org/repo" required />
											<div class="form-help-text">Format: organization/repository-name</div>
										</div>
										<div class="form-group-aligned">
											<label class="form-label" for="github-branch">Branch</label>
											<select id="github-branch" class="form-select">
												<option value="main">main</option>
												<option value="master">master</option>
												<option value="develop">develop</option>
												<option value="dev">dev</option>
												<option value="staging">staging</option>
												<option value="release">release</option>
											</select>
											<div class="form-help-text">&nbsp;</div>
										</div>
									</div>
									
									<div class="form-row">
										<div class="form-group">
											<label class="form-label" for="github-user">User (Optional)</label>
											<input type="text" id="github-user" class="form-input" placeholder="username" />
										</div>
										<div class="form-group">
											<label class="form-label" for="github-commit-title">Commit/Title Text</label>
											<input type="text" id="github-commit-title" class="form-input" placeholder="Search in commit messages or titles" />
										</div>
									</div>
								</div>
								
								<div class="form-section">
									<div class="form-title">📈 Results</div>
									<table class="results-table" id="github-results-table">
										<thead>
											<tr>
												<th>Date</th>
												<th>Commit</th>
												<th>Author</th>
												<th>Message</th>
												<th>Files</th>
												<th>Additions</th>
												<th>Deletions</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
											</tr>
										</tbody>
									</table>
								</div>
								
								<div class="form-buttons">
									<button class="form-button primary" onclick="fetchGitHubCommits()">Fetch Commits</button>
									<button class="form-button secondary" onclick="resetGitHubForm()">Reset Form</button>
									<button class="form-button secondary" onclick="resetGitHubResults()">Reset Results</button>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<div class="separator"></div>
				
				<div class="section">
					<div class="section-header quality">
						<span class="status-indicator"></span>
						Quality
					</div>
					<div class="section-content">
						<p>Monitor code quality metrics and suggestions.</p>
						
						<div class="quality-common-form">
							<div class="form-title">📂 Repository Configuration</div>
							<div class="form-section">
								<div class="form-row">
									<div class="form-group">
										<label class="form-label" for="quality-repo-name">Repository Name *</label>
										<input type="text" id="quality-repo-name" class="form-input" placeholder="org/repo" required onchange="updateQualityRepoFields()" />
										<div class="form-help-text">Format: organization/repository-name</div>
									</div>
								</div>
							</div>
						</div>
						
						<div class="separator"></div>
						
						<div class="subsection quality-sonar">
							<div class="subsection-title">
								<div class="subsection-title-text">
									<span>SonarQube</span>
									<span class="info-icon" onclick="toggleInfo('sonar-info')">ⓘ</span>
								</div>
							</div>
							<div class="subsection-description">Static code analysis and quality gates</div>
							<div class="subsection-status" style="color: ${sonarStatus.color}">${sonarStatus.status}</div>
							<div id="sonar-info" class="subsection-info">
								<div class="info-content">
									<strong>SonarQube Analysis:</strong>
									<ul>
										<li>Code smell detection</li>
										<li>Security vulnerability scanning</li>
										<li>Test coverage metrics</li>
										<li>Quality gate compliance</li>
									</ul>
								</div>
							</div>
							
							<div class="sonar-form">
								<div class="form-title">📊 SonarQube Project Analysis</div>
								
								<div class="form-section">
									<div class="form-row">
										<div class="form-group">
											<label class="form-label" for="sonar-git-org">Project Git Org</label>
											<input type="text" id="sonar-git-org" class="form-input" readonly />
										</div>
										<div class="form-group">
											<label class="form-label" for="sonar-git-repo">Project Git Repo</label>
											<input type="text" id="sonar-git-repo" class="form-input" readonly />
										</div>
									</div>
									
									<div class="form-row">
										<div class="form-group">
											<label class="form-label" for="sonar-branch">Branch</label>
											<select id="sonar-branch" class="form-select">
												<option value="main">main</option>
												<option value="master">master</option>
												<option value="develop">develop</option>
												<option value="dev">dev</option>
												<option value="staging">staging</option>
												<option value="release">release</option>
											</select>
										</div>
									</div>
								</div>
								
								<div class="form-section">
									<div class="form-title">📈 Results</div>
									<table class="results-table" id="sonar-results-table">
										<thead>
											<tr>
												<th>Action</th>
												<th>Issue Type</th>
												<th>Severity</th>
												<th>Count</th>
												<th>File</th>
												<th>Line</th>
												<th>Message</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
											</tr>
										</tbody>
									</table>
								</div>
								
								<div class="form-buttons">
									<button class="form-button primary" onclick="fetchSonarIssues()">Fetch Issues</button>
									<button class="form-button secondary" onclick="resetSonarResults()">Reset Results</button>
								</div>
							</div>
						</div>
						
						<div class="subsection quality-checkmarx">
							<div class="subsection-title">
								<div class="subsection-title-text">
									<span>Checkmarx</span>
									<span class="info-icon" onclick="toggleInfo('checkmarx-info')">ⓘ</span>
								</div>
							</div>
							<div class="subsection-description">Security vulnerability scanning</div>
							<div class="subsection-status" style="color: ${checkmarxStatus.color}">${checkmarxStatus.status}</div>
							<div id="checkmarx-info" class="subsection-info">
								<div class="info-content">
									<strong>Checkmarx SAST:</strong>
									<ul>
										<li>Static application security testing</li>
										<li>Vulnerability risk assessment</li>
										<li>Compliance reporting</li>
										<li>Remediation guidance</li>
									</ul>
								</div>
							</div>
							
							<div class="checkmarx-form">
								<div class="form-title">🔒 Checkmarx Security Scan</div>
								
								<div class="form-section">
									<div class="form-row">
										<div class="form-group">
											<label class="form-label" for="checkmarx-project-name">Project Name</label>
											<input type="text" id="checkmarx-project-name" class="form-input" readonly />
										</div>
									</div>
								</div>
								
								<div class="form-section">
									<div class="form-title">📈 Results</div>
									<table class="results-table" id="checkmarx-results-table">
										<thead>
											<tr>
												<th>Action</th>
												<th>Scan Date</th>
												<th>Vulnerability</th>
												<th>Severity</th>
												<th>Status</th>
												<th>File</th>
												<th>Line</th>
												<th>Risk Score</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
											</tr>
										</tbody>
									</table>
								</div>
								
								<div class="form-buttons">
									<button class="form-button primary" onclick="fetchCheckmarxResults()">Fetch Latest Scan Results</button>
									<button class="form-button secondary" onclick="resetCheckmarxResults()">Reset Results</button>
								</div>
							</div>
						</div>
						
						<div class="subsection quality-appsec">
							<div class="subsection-title">
								<div class="subsection-title-text">
									<span>AppsecJira</span>
									<span class="info-icon" onclick="toggleInfo('appsec-info')">ⓘ</span>
								</div>
							</div>
							<div class="subsection-description">Application security issue tracking</div>
							<div class="subsection-status" style="color: ${appsecStatus.color}">${appsecStatus.status}</div>
							<div id="appsec-info" class="subsection-info">
								<div class="info-content">
									<strong>Application Security Tracking:</strong>
									<ul>
										<li>Security issue lifecycle management</li>
										<li>Vulnerability prioritization</li>
										<li>Security debt tracking</li>
										<li>Compliance audit trails</li>
									</ul>
								</div>
							</div>
							
							<div class="appsec-form">
								<div class="form-title">🔒 AppsecJira Issue Tracking</div>
								
								<div class="form-section">
									<div class="form-row">
										<div class="form-group">
											<label class="form-label" for="appsec-type">Select Type *</label>
											<select id="appsec-type" class="form-select" required>
												<option value="">-- Select Type --</option>
												<option value="Project">Project</option>
												<option value="ID">ID</option>
											</select>
										</div>
										<div class="form-group">
											<label class="form-label" for="appsec-value">Type Value *</label>
											<input type="text" id="appsec-value" class="form-input" placeholder="Enter project name or ID" required />
										</div>
									</div>
								</div>
								
								<div class="form-section">
									<div class="form-title">📈 Results</div>
									<table class="results-table" id="appsec-results-table">
										<thead>
											<tr>
												<th>Actions</th>
												<th>Issue Key</th>
												<th>Priority</th>
												<th>Status</th>
												<th>Assignee</th>
												<th>Created</th>
												<th>Summary</th>
												<th>Type</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
											</tr>
										</tbody>
									</table>
								</div>
								
								<div class="form-buttons">
									<button class="form-button primary" onclick="fetchAppsecIssues()">Fetch Issues</button>
									<button class="form-button secondary" onclick="resetAppsecForm()">Reset Form</button>
									<button class="form-button secondary" onclick="resetAppsecResults()">Reset Results</button>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<div class="separator"></div>
				
				<div class="section">
					<div class="section-header agile">
						<span class="status-indicator"></span>
						Agile
					</div>
					<div class="section-content">
						<p>Manage sprints, user stories, and agile workflows.</p>
						
						<div class="subsection agile-jira">
							<div class="subsection-title">
								<div class="subsection-title-text">
									<span>Enterprise JIRA</span>
									<span class="info-icon" onclick="toggleInfo('jira-info')">ⓘ</span>
								</div>
							</div>
							<div class="subsection-description">Sprint management, user stories, and task tracking</div>
							<div class="subsection-status" style="color: ${jiraStatus.color}">${jiraStatus.status}</div>
							<div id="jira-info" class="subsection-info">
								<div class="info-content">
									<strong>JIRA Integration:</strong>
									<ul>
										<li>Sprint velocity tracking</li>
										<li>Burndown chart analytics</li>
										<li>Story point estimation</li>
										<li>Team performance metrics</li>
									</ul>
								</div>
							</div>
							
							<div class="jira-form">
								<div class="form-title">📊 Enterprise JIRA Analysis</div>
								
								<div class="form-section">
									<div class="form-row">
										<div class="form-group">
											<label class="form-label" for="jira-type">Select Type *</label>
											<select id="jira-type" class="form-select" required>
												<option value="">-- Select Type --</option>
												<option value="Username">Username</option>
												<option value="Ticket ID">Ticket ID</option>
												<option value="Board ID">Board ID</option>
												<option value="Team">Team</option>
											</select>
										</div>
										<div class="form-group">
											<label class="form-label" for="jira-fetch-selection">Fetch Selection *</label>
											<input type="text" id="jira-fetch-selection" class="form-input" placeholder="Enter value based on selected type" required />
										</div>
									</div>
								</div>
								
								<div class="form-section">
									<div class="form-title">📈 Results</div>
									<table class="results-table" id="jira-results-table">
										<thead>
											<tr>
												<th>Actions</th>
												<th>Key</th>
												<th>Summary</th>
												<th>Status</th>
												<th>Priority</th>
												<th>Assignee</th>
												<th>Story Points</th>
												<th>Sprint</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
											</tr>
										</tbody>
									</table>
								</div>
								
								<div class="form-buttons">
									<button class="form-button primary" onclick="fetchJiraDetails()">Fetch Details</button>
									<button class="form-button secondary" onclick="resetJiraForm()">Reset Form</button>
									<button class="form-button secondary" onclick="resetJiraResults()">Reset Results</button>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<div class="separator"></div>
				
				<div class="section">
					<div class="section-header devsecops">
						<span class="status-indicator"></span>
						DevSecOps
					</div>
					<div class="section-content">
						<p>Security scanning, compliance, and deployment pipelines.</p>
						
						<div class="subsection devsecops-dora">
							<div class="subsection-title">
								<div class="subsection-title-text">
									<span>DORA Metrics</span>
									<span class="info-icon" onclick="toggleInfo('dora-info')">ⓘ</span>
								</div>
							</div>
							<div class="subsection-description">Deployment frequency, lead time, and reliability metrics</div>
							<div class="subsection-status" style="color: ${doraStatus.color}">${doraStatus.status}</div>
							<div id="dora-info" class="subsection-info">
								<div class="info-content">
									<strong>DORA Performance Metrics:</strong>
									<ul>
										<li>Deployment frequency tracking</li>
										<li>Lead time for changes</li>
										<li>Change failure rate</li>
										<li>Mean time to recovery</li>
									</ul>
								</div>
							</div>
							
							<div class="dora-form">
								<div class="form-section">
									<div class="form-row">
										<div class="form-group-aligned">
											<label class="form-label" for="dora-repo-name">Repository Name *</label>
											<input type="text" id="dora-repo-name" class="form-input" placeholder="org/repo" required />
											<div class="form-help-text">Format: organization/repository-name</div>
										</div>
										<div class="form-group-aligned">
											<label class="form-label" for="dora-time-period">Time Period</label>
											<select id="dora-time-period" class="form-select">
												<option value="7">Last 7 days</option>
												<option value="30" selected>Last 30 days</option>
												<option value="90">Last 90 days</option>
												<option value="180">Last 6 months</option>
												<option value="365">Last 12 months</option>
											</select>
											<div class="form-help-text">&nbsp;</div>
										</div>
									</div>
									
									<div class="form-row">
										<div class="form-group">
											<label class="form-label" for="dora-environment">Environment</label>
											<select id="dora-environment" class="form-select">
												<option value="all" selected>All Environments</option>
												<option value="production">Production</option>
												<option value="staging">Staging</option>
												<option value="development">Development</option>
											</select>
										</div>
										<div class="form-group">
											<label class="form-label" for="dora-workflow">GitHub Workflow</label>
											<input type="text" id="dora-workflow" class="form-input" placeholder="deployment.yml (optional)" />
										</div>
									</div>
								</div>
								
								<div class="form-section">
									<div class="form-title">📊 DORA Metrics Overview</div>
									<div class="dora-metrics-grid">
										<div class="metric-card deployment-frequency">
											<div class="metric-icon">🚀</div>
											<div class="metric-value" id="deployment-freq-value">-</div>
											<div class="metric-label">Deployment Frequency</div>
											<div class="metric-trend" id="deployment-freq-trend">-</div>
										</div>
										
										<div class="metric-card lead-time">
											<div class="metric-icon">⏱️</div>
											<div class="metric-value" id="lead-time-value">-</div>
											<div class="metric-label">Lead Time for Changes</div>
											<div class="metric-trend" id="lead-time-trend">-</div>
										</div>
										
										<div class="metric-card change-failure">
											<div class="metric-icon">⚠️</div>
											<div class="metric-value" id="change-failure-value">-</div>
											<div class="metric-label">Change Failure Rate</div>
											<div class="metric-trend" id="change-failure-trend">-</div>
										</div>
										
										<div class="metric-card recovery-time">
											<div class="metric-icon">🔧</div>
											<div class="metric-value" id="recovery-time-value">-</div>
											<div class="metric-label">Mean Time to Recovery</div>
											<div class="metric-trend" id="recovery-time-trend">-</div>
										</div>
									</div>
								</div>
								
								<div class="form-section">
									<div class="form-title">📈 Performance Charts</div>
									<div class="charts-container">
										<div class="chart-section">
											<div class="chart-title">Deployment Frequency Trend</div>
											<canvas id="deployment-chart" width="300" height="150"></canvas>
										</div>
										<div class="chart-section">
											<div class="chart-title">Lead Time Distribution</div>
											<canvas id="leadtime-chart" width="300" height="150"></canvas>
										</div>
									</div>
								</div>
								
								<div class="form-section">
									<div class="form-title">📋 Recent Deployments</div>
									<table class="results-table" id="dora-results-table">
										<thead>
											<tr>
												<th>Date</th>
												<th>Environment</th>
												<th>Workflow</th>
												<th>Duration</th>
												<th>Status</th>
												<th>Lead Time</th>
												<th>Commit</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
												<td>-</td>
											</tr>
										</tbody>
									</table>
								</div>
								
								<div class="form-buttons">
									<button class="form-button primary" onclick="fetchDoraMetrics()">Calculate DORA Metrics</button>
									<button class="form-button secondary" onclick="resetDoraForm()">Reset Form</button>
									<button class="form-button secondary" onclick="resetDoraResults()">Reset Results</button>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<script>
					// Acquire VS Code API once globally
					const vscode = acquireVsCodeApi();
					
					// Request home directory from extension
					vscode.postMessage({ command: 'getHomeDirectory' });
					
					// Listen for messages from the extension
					window.addEventListener('message', event => {
						const message = event.data;
						switch (message.command) {
							case 'homeDirectory':
								// Update the help note with the actual home directory
								const homeNote = document.getElementById('home-directory-note');
								if (homeNote) {
									if (message.path) {
										// Format the path for better display (escape backslashes for Windows)
										const displayPath = message.path;
										homeNote.innerHTML = \`ℹ️ Click "Export Chat & Calculate Metrics" to automatically export and analyze your latest GitHub Copilot chat. Save the file as "chat.json" in <strong>\${displayPath}</strong> when prompted.\`;
									} else {
										homeNote.innerHTML = 'ℹ️ Click "Export Chat & Calculate Metrics" to automatically export and analyze your latest GitHub Copilot chat. Save the file as "chat.json" in your home directory when prompted.';
									}
								}
								break;
							case 'exportComplete':
								if (message.success) {
									console.log('Chat export completed successfully:', message.message);
									// Show progress message and automatically load metrics after a short delay
									showSpinner('Processing exported chat data...');
									
									// Give user a moment to save the file, then auto-load metrics
									setTimeout(() => {
										vscode.postMessage({
											command: 'loadMetrics'
										});
									}, 4000); // 4 second delay to allow file saving
								} else {
									hideSpinner();
									console.error('Chat export failed:', message.message);
									alert('Chat export failed: ' + message.message);
								}
								break;
							case 'clearExportsComplete':
								hideSpinner();
								if (message.success) {
									console.log('Exports cleared successfully:', message.message);
									alert('All chat exports have been cleared from storage.');
									// Reset the results table
									resetCopilotResults();
								} else {
									console.error('Clear exports failed:', message.message);
									alert('Clear exports failed: ' + message.message);
								}
								break;
							case 'metricsLoaded':
								hideSpinner();
								if (message.metrics && Array.isArray(message.metrics)) {
									populateMetricsTable(message.metrics);
									if (message.metrics.length > 0) {
										// Show success message for successful metrics calculation
										setTimeout(() => {
											alert('✅ Chat exported and metrics calculated successfully! Check the results table below.');
										}, 500);
									} else {
										alert('ℹ️ No metrics found in the exported chat data. Make sure your chat contains tool usage and interactions.');
									}
								} else if (message.error) {
									console.error('Failed to load metrics:', message.error);
									alert('Failed to load metrics: ' + message.error);
								} else {
									console.log('No metrics found');
									alert('No metrics found. The exported chat may not contain trackable interactions.');
								}
								break;
						}
					});
					
					// Set max date to today for date inputs
					function initializeDateInputs() {
						const today = new Date().toISOString().split('T')[0];
						
						// Copilot form dates
						const startDate = document.getElementById('copilot-start-date');
						const endDate = document.getElementById('copilot-end-date');
						
						if (startDate) {
							startDate.max = today;
							startDate.value = today;
						}
						if (endDate) {
							endDate.max = today;
							endDate.value = today;
						}
						
						// GitHub form dates
						const githubStartDate = document.getElementById('github-start-date');
						const githubEndDate = document.getElementById('github-end-date');
						
						if (githubStartDate) {
							githubStartDate.max = today;
							githubStartDate.value = today;
						}
						if (githubEndDate) {
							githubEndDate.max = today;
							githubEndDate.value = today;
						}
					}
					
					// Initialize date inputs when page loads
					document.addEventListener('DOMContentLoaded', function() {
						initializeDateInputs();
						// Load existing metrics on page load
						vscode.postMessage({
							command: 'loadMetrics'
						});
						// Request home directory for help note
						vscode.postMessage({
							command: 'getHomeDirectory'
						});
					});
					
					function toggleInfo(infoId) {
						const infoElement = document.getElementById(infoId);
						if (infoElement) {
							infoElement.classList.toggle('expanded');
						}
					}
					
					function calculateCopilotMetrics() {
						const startDate = document.getElementById('copilot-start-date').value;
						const endDate = document.getElementById('copilot-end-date').value;
						
						if (!startDate || !endDate) {
							alert('Please select both start and end dates.');
							return;
						}
						
						if (new Date(startDate) > new Date(endDate)) {
							alert('Start date cannot be after end date.');
							return;
						}
						
						// Show spinner for the entire process
						showSpinner('Exporting chat and calculating metrics...');
						
						// First export the chat, then metrics will be calculated automatically
						vscode.postMessage({
							command: 'exportChat',
							startDate: startDate,
							endDate: endDate
						});
					}
					
					function generateSampleCopilotData(startDate, endDate) {
						const data = [];
						const start = new Date(startDate);
						const end = new Date(endDate);
						
						for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
							data.push({
								date: d.toISOString().split('T')[0],
								prompts: Math.floor(Math.random() * 50) + 10,
								filesChanged: Math.floor(Math.random() * 20) + 5,
								linesAdded: Math.floor(Math.random() * 500) + 100,
								linesDeleted: Math.floor(Math.random() * 200) + 20,
								helpful: Math.floor(Math.random() * 40) + 8,
								unhelpful: Math.floor(Math.random() * 10) + 1
							});
						}
						
						return data;
					}
					
					function resetCopilotForm() {
						document.getElementById('copilot-start-date').value = '';
						document.getElementById('copilot-end-date').value = '';
					}
					
					function resetCopilotResults() {
						const tbody = document.querySelector('#copilot-results-table tbody');
						tbody.innerHTML = \`
							<tr>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
							</tr>
						\`;
					}

					function populateMetricsTable(metrics) {
						console.log('📊 Populating metrics table with', metrics.length, 'metrics');
						
						// Group metrics by date (ensuring unique sessions per date)
						const groupedMetrics = {};
						const processedSessions = new Set(); // Track processed sessions to avoid duplicates
						
						metrics.forEach(metric => {
							const date = metric.date;
							const sessionId = metric.sessionId;
							
							// Skip if we've already processed this session
							if (processedSessions.has(sessionId)) {
								return;
							}
							
							if (!groupedMetrics[date]) {
								groupedMetrics[date] = {
									date: date,
									metrics: {
										total_prompts: 0,
										files_changed: 0,
										lines_added: 0,
										lines_deleted: 0,
										helpful_responses: 0,
										unhelpful_responses: 0
									}
								};
							}
							
							// Add this session's metrics to the date total
							const metricName = metric.metricName;
							const metricValue = parseInt(metric.metricValue) || 0;
							
							if (groupedMetrics[date].metrics.hasOwnProperty(metricName)) {
								groupedMetrics[date].metrics[metricName] += metricValue;
							}
						});
						
						// Mark all sessions from this date as processed
						metrics.forEach(metric => {
							if (groupedMetrics[metric.date]) {
								processedSessions.add(metric.sessionId);
							}
						});
						
						const tbody = document.querySelector('#copilot-results-table tbody');
						tbody.innerHTML = '';
						
						// Sort dates in descending order (newest first)
						const sortedDates = Object.keys(groupedMetrics).sort((a, b) => new Date(b) - new Date(a));
						
						// Create a row for each unique date
						sortedDates.forEach(date => {
							const session = groupedMetrics[date];
							const row = tbody.insertRow();
							
							// Date
							row.insertCell(0).textContent = session.date || '-';
							
							// Prompts
							row.insertCell(1).textContent = session.metrics.total_prompts.toString();
							
							// Files Changed
							row.insertCell(2).textContent = session.metrics.files_changed.toString();
							
							// Lines Added
							row.insertCell(3).textContent = session.metrics.lines_added.toString();
							
							// Lines Deleted
							row.insertCell(4).textContent = session.metrics.lines_deleted.toString();
							
							// Helpful
							row.insertCell(5).textContent = session.metrics.helpful_responses.toString();
							
							// Unhelpful
							row.insertCell(6).textContent = session.metrics.unhelpful_responses.toString();
						});
						
						if (sortedDates.length === 0) {
							// Show "no data" row if no metrics found
							const row = tbody.insertRow();
							row.insertCell(0).textContent = 'No data';
							row.insertCell(1).textContent = '-';
							row.insertCell(2).textContent = '-';
							row.insertCell(3).textContent = '-';
							row.insertCell(4).textContent = '-';
							row.insertCell(5).textContent = '-';
							row.insertCell(6).textContent = '-';
						}
					}

					function clearStoredExports() {
						// Show custom confirmation dialog
						const confirmDiv = document.createElement('div');
						confirmDiv.innerHTML = \`
							<div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
								<div style="background: var(--vscode-editor-background); border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 20px; max-width: 400px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
									<h3 style="color: var(--vscode-errorForeground); margin: 0 0 15px 0;">⚠️ Warning</h3>
									<p style="margin: 0 0 20px 0; color: var(--vscode-foreground);">This will permanently delete all stored chat exports from storage.</p>
									<p style="margin: 0 0 20px 0; color: var(--vscode-foreground); font-weight: bold;">This action cannot be undone. Are you sure?</p>
									<div style="display: flex; gap: 10px; justify-content: flex-end;">
										<button onclick="cancelClear()" style="padding: 8px 16px; background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: none; border-radius: 2px; cursor: pointer;">Cancel</button>
										<button onclick="confirmClear()" style="padding: 8px 16px; background: var(--vscode-errorForeground); color: var(--vscode-errorBackground); border: none; border-radius: 2px; cursor: pointer; font-weight: bold;">Delete All</button>
									</div>
								</div>
							</div>
						\`;
						document.body.appendChild(confirmDiv);
						
						window.cancelClear = function() {
							document.body.removeChild(confirmDiv);
						};
						
						window.confirmClear = function() {
							document.body.removeChild(confirmDiv);
							showSpinner('Clearing stored exports...');
							
							// Send message to extension to clear exports
							vscode.postMessage({
								command: 'clearChatExports'
							});
						};
					}
					
					// Spinner control functions
					function showSpinner(message = 'Processing...') {
						const spinner = document.getElementById('loading-spinner');
						const spinnerText = document.getElementById('spinner-text');
						spinnerText.textContent = message;
						spinner.classList.add('active');
						
						// Disable all buttons
						const buttons = document.querySelectorAll('button');
						buttons.forEach(button => {
							button.disabled = true;
						});
					}
					
					function hideSpinner() {
						const spinner = document.getElementById('loading-spinner');
						spinner.classList.remove('active');
						
						// Re-enable all buttons
						const buttons = document.querySelectorAll('button');
						buttons.forEach(button => {
							button.disabled = false;
						});
					}
					
					// GitHub form functions
					function fetchGitHubCommits() {
						if (!validateGitHubForm()) {
							return;
						}
						
						const repoName = document.getElementById('github-repo-name').value;
						const branch = document.getElementById('github-branch').value;
						const user = document.getElementById('github-user').value;
						const startDate = document.getElementById('github-start-date').value;
						const endDate = document.getElementById('github-end-date').value;
						const commitTitle = document.getElementById('github-commit-title').value;
						
						if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
							alert('Start date cannot be after end date.');
							return;
						}
						
						// Show spinner
						showSpinner('Fetching GitHub commits...');
						
						// Simulate GitHub API call with sample data
						setTimeout(() => {
							const tbody = document.querySelector('#github-results-table tbody');
							const sampleData = generateSampleGitHubData(repoName, branch, user, startDate, endDate, commitTitle);
							
							tbody.innerHTML = '';
							sampleData.forEach(row => {
								const tr = document.createElement('tr');
								tr.innerHTML = \`
									<td>\${row.date}</td>
									<td>\${row.commit.substring(0, 8)}</td>
									<td>\${row.author}</td>
									<td>\${row.message}</td>
									<td>\${row.files}</td>
									<td style="color: var(--vscode-charts-green)">+\${row.additions}</td>
									<td style="color: var(--vscode-charts-red)">-\${row.deletions}</td>
								\`;
								tbody.appendChild(tr);
							});
							
							hideSpinner();
						}, 1500);
					}
					
					function generateSampleGitHubData(repoName, branch, user, startDate, endDate, commitTitle) {
						const data = [];
						const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
						const end = endDate ? new Date(endDate) : new Date();
						
						const sampleCommits = [
							'feat: add new authentication module',
							'fix: resolve memory leak in data processor',
							'docs: update API documentation',
							'refactor: optimize database queries',
							'test: add unit tests for user service',
							'chore: update dependencies',
							'feat: implement user dashboard',
							'fix: correct validation logic',
							'style: improve UI components',
							'perf: enhance loading performance'
						];
						
						const sampleAuthors = ['john.doe', 'jane.smith', 'alice.johnson', 'bob.wilson', 'carol.brown'];
						
						for (let i = 0; i < Math.min(10, Math.floor((end - start) / (24 * 60 * 60 * 1000)) + 1); i++) {
							const commitDate = new Date(start.getTime() + Math.random() * (end - start));
							const author = user || sampleAuthors[Math.floor(Math.random() * sampleAuthors.length)];
							let message = sampleCommits[Math.floor(Math.random() * sampleCommits.length)];
							
							if (commitTitle && commitTitle.trim()) {
								message = message.toLowerCase().includes(commitTitle.toLowerCase()) ? message : \`\${commitTitle}: \${message}\`;
							}
							
							data.push({
								date: commitDate.toISOString().split('T')[0],
								commit: Math.random().toString(36).substring(2, 15),
								author: author,
								message: message,
								files: Math.floor(Math.random() * 15) + 1,
								additions: Math.floor(Math.random() * 200) + 10,
								deletions: Math.floor(Math.random() * 50) + 1
							});
						}
						
						return data.sort((a, b) => new Date(b.date) - new Date(a.date));
					}
					
					function resetGitHubForm() {
						document.getElementById('github-repo-name').value = '';
						document.getElementById('github-branch').value = 'main';
						document.getElementById('github-user').value = '';
						document.getElementById('github-start-date').value = '';
						document.getElementById('github-end-date').value = '';
						document.getElementById('github-commit-title').value = '';
					}
					
					function resetGitHubResults() {
						const tbody = document.querySelector('#github-results-table tbody');
						tbody.innerHTML = \`
							<tr>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
							</tr>
						\`;
					}
					
					// Initialize date inputs when script loads
					setTimeout(initializeDateInputs, 100);
					
					// Quality forms functions
					function updateQualityRepoFields() {
						const repoName = document.getElementById('quality-repo-name').value;
						
						if (repoName && repoName.includes('/')) {
							const [org, repo] = repoName.split('/');
							
							// Update SonarQube fields
							const sonarOrg = document.getElementById('sonar-git-org');
							const sonarRepo = document.getElementById('sonar-git-repo');
							if (sonarOrg) sonarOrg.value = org;
							if (sonarRepo) sonarRepo.value = repo;
							
							// Update Checkmarx field (org-repo format)
							const checkmarxProject = document.getElementById('checkmarx-project-name');
							if (checkmarxProject) checkmarxProject.value = \`\${org}-\${repo}\`;
						} else {
							// Clear fields if invalid format
							const sonarOrg = document.getElementById('sonar-git-org');
							const sonarRepo = document.getElementById('sonar-git-repo');
							const checkmarxProject = document.getElementById('checkmarx-project-name');
							
							if (sonarOrg) sonarOrg.value = '';
							if (sonarRepo) sonarRepo.value = '';
							if (checkmarxProject) checkmarxProject.value = '';
						}
					}
					
					// SonarQube functions
					function fetchSonarIssues() {
						if (!validateSonarForm()) {
							return;
						}
						
						const repoName = document.getElementById('quality-repo-name').value;
						const branch = document.getElementById('sonar-branch').value;
						
						// Show spinner
						showSpinner('Fetching SonarQube issues...');
						
						// Simulate SonarQube API call with sample data
						setTimeout(() => {
							const tbody = document.querySelector('#sonar-results-table tbody');
							const sampleData = generateSampleSonarData(repoName, branch);
							
							tbody.innerHTML = '';
							sampleData.forEach(row => {
							const tr = document.createElement('tr');
							tr.innerHTML = \`
								<td><button class="action-btn fix" onclick="sendSonarPromptToChat('fix', '\${row.file}', '\${row.line}', '\${row.type}', '\${row.message}')">🔧 Fix</button></td>
								<td>\${row.type}</td>
								<td><span style="color: \${getSeverityColor(row.severity)}">\${row.severity}</span></td>
								<td>\${row.count}</td>
								<td>\${row.file}</td>
								<td>\${row.line}</td>
								<td>\${row.message}</td>
							\`;
							tbody.appendChild(tr);
						});
						
						hideSpinner();
					}, 1200);
					}
					
					function generateSampleSonarData(repoName, branch) {
						const issueTypes = ['Code Smell', 'Bug', 'Vulnerability', 'Security Hotspot', 'Duplication'];
						const severities = ['Blocker', 'Critical', 'Major', 'Minor', 'Info'];
						const files = ['src/main.js', 'src/utils.js', 'src/api.js', 'src/components/App.js', 'src/models/User.js'];
						const messages = [
							'Remove this unused import',
							'Add a default case to this switch statement',
							'Use const instead of let for this variable',
							'This function has too many parameters',
							'Reduce the number of returns in this function'
						];
						
						const data = [];
						for (let i = 0; i < 8; i++) {
							data.push({
								type: issueTypes[Math.floor(Math.random() * issueTypes.length)],
								severity: severities[Math.floor(Math.random() * severities.length)],
								count: Math.floor(Math.random() * 5) + 1,
								file: files[Math.floor(Math.random() * files.length)],
								line: Math.floor(Math.random() * 200) + 1,
								message: messages[Math.floor(Math.random() * messages.length)]
							});
						}
						
						return data;
					}
					
					function getSeverityColor(severity) {
						switch (severity) {
							case 'Blocker': return 'var(--vscode-charts-red)';
							case 'Critical': return 'var(--vscode-charts-red)';
							case 'Major': return 'var(--vscode-charts-orange)';
							case 'Minor': return 'var(--vscode-charts-yellow)';
							case 'Info': return 'var(--vscode-charts-blue)';
							default: return 'var(--vscode-foreground)';
						}
					}
					
					function resetSonarResults() {
						const tbody = document.querySelector('#sonar-results-table tbody');
						tbody.innerHTML = \`
							<tr>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
							</tr>
						\`;
					}
					
					// SonarQube Smart Prompts and Chat Integration
					function sendSonarPromptToChat(action, file, line, issueType, message) {
						console.log('sendSonarPromptToChat called with:', { action, file, line, issueType, message });
						
						let prompt = '';
						if (file && file !== '-' && line && line !== '-') {
							// Agentic mode: Direct fix with file and line reference
							prompt = \`Fix this SonarQube issue in \${file} at line \${line}:

**Issue:** \${issueType} - \${message}

Please directly fix this code quality issue by:
1. Analyzing the specific code at line \${line} in \${file}
2. Providing the exact corrected code
3. Explaining why the fix resolves the issue
4. Including any necessary imports or dependencies

Apply the fix directly to the file.\`;
						} else {
							// Guidance mode: General recommendations
							prompt = \`Guide me to fix this SonarQube code quality issue:

**Issue Type:** \${issueType}
**Problem:** \${message}

Provide:
1. **Root Cause:** Why this issue occurs
2. **Solution Pattern:** Code example showing the fix
3. **Best Practice:** How to prevent similar issues
4. **Implementation:** Step-by-step fix approach

Keep it concise and actionable.\`;
						}
						
						// Send prompt to VS Code Copilot Chat
						console.log('Sending SonarQube prompt to chat:', prompt.substring(0, 100) + '...');
						vscode.postMessage({
							command: 'sendToChat',
							prompt: prompt
						});
						console.log('SonarQube message sent to vscode');
					}
					
					// Checkmarx functions
					function fetchCheckmarxResults() {
						if (!validateCheckmarxForm()) {
							return;
						}
						
						const repoName = document.getElementById('quality-repo-name').value;
						
						// Show spinner
						showSpinner('Fetching Checkmarx scan results...');
						
						// Simulate Checkmarx API call with sample data
						setTimeout(() => {
							const tbody = document.querySelector('#checkmarx-results-table tbody');
							const sampleData = generateSampleCheckmarxData(repoName);
							
							tbody.innerHTML = '';
							sampleData.forEach(row => {
							const tr = document.createElement('tr');
							tr.innerHTML = \`
								<td><button class="action-btn fix" onclick="sendCheckmarxPromptToChat('fix', '\${row.file}', '\${row.line}', '\${row.vulnerability}', '\${row.severity}', '\${row.riskScore}')">🔧 Fix</button></td>
								<td>\${row.scanDate}</td>
								<td>\${row.vulnerability}</td>
								<td><span style="color: \${getSeverityColor(row.severity)}">\${row.severity}</span></td>
								<td>\${row.status}</td>
								<td>\${row.file}</td>
								<td>\${row.line}</td>
								<td>\${row.riskScore}</td>
							\`;
							tbody.appendChild(tr);
						});
						
						hideSpinner();
					}, 1300);
					}
					
					function generateSampleCheckmarxData(repoName) {
						const vulnerabilities = ['SQL Injection', 'Cross-Site Scripting', 'Command Injection', 'Path Traversal', 'Hardcoded Password'];
						const severities = ['Critical', 'High', 'Medium', 'Low', 'Info'];
						const statuses = ['New', 'Confirmed', 'Urgent', 'Proposed Not Exploitable', 'Not Exploitable'];
						const files = ['src/auth.js', 'src/database.js', 'src/api/routes.js', 'src/middleware/validation.js', 'src/config/settings.js'];
						
						const data = [];
						for (let i = 0; i < 6; i++) {
							const scanDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
							data.push({
								scanDate: scanDate.toISOString().split('T')[0],
								vulnerability: vulnerabilities[Math.floor(Math.random() * vulnerabilities.length)],
								severity: severities[Math.floor(Math.random() * severities.length)],
								status: statuses[Math.floor(Math.random() * statuses.length)],
								file: files[Math.floor(Math.random() * files.length)],
								line: Math.floor(Math.random() * 300) + 1,
								riskScore: (Math.random() * 10).toFixed(1)
							});
						}
						
						return data.sort((a, b) => new Date(b.scanDate) - new Date(a.scanDate));
					}
					
					function resetCheckmarxResults() {
						const tbody = document.querySelector('#checkmarx-results-table tbody');
						tbody.innerHTML = \`
							<tr>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
							</tr>
						\`;
					}
					
					// Checkmarx Smart Prompts and Chat Integration
					function sendCheckmarxPromptToChat(action, file, line, vulnerability, severity, riskScore) {
						console.log('sendCheckmarxPromptToChat called with:', { action, file, line, vulnerability, severity, riskScore });
						
						let prompt = '';
						if (file && file !== '-' && line && line !== '-') {
							// Agentic mode: Direct security fix with file and line reference
							prompt = \`Fix this Checkmarx security vulnerability in \${file} at line \${line}:

**Vulnerability:** \${vulnerability} (\${severity}, Risk: \${riskScore})

Please directly fix this security issue by:
1. Analyzing the vulnerable code at line \${line} in \${file}
2. Providing the secure code replacement
3. Explaining the security improvement
4. Adding necessary security validations

Apply the security fix directly to the file.\`;
						} else {
							// Guidance mode: Security recommendations
							prompt = \`Guide me to fix this Checkmarx security vulnerability:

**Vulnerability:** \${vulnerability}
**Severity:** \${severity} (Risk Score: \${riskScore})

Provide:
1. **Attack Vector:** How this vulnerability is exploited
2. **Secure Code:** Example of secure implementation
3. **Validation:** Input/output sanitization needed
4. **Prevention:** Best practices to avoid this issue

Keep it focused on actionable security fixes.\`;
						}
						
						// Send prompt to VS Code Copilot Chat
						console.log('Sending Checkmarx prompt to chat:', prompt.substring(0, 100) + '...');
						vscode.postMessage({
							command: 'sendToChat',
							prompt: prompt
						});
						console.log('Checkmarx message sent to vscode');
					}
					
					// AppsecJira functions
					function fetchAppsecIssues() {
						if (!validateAppsecForm()) {
							return;
						}
						
						const type = document.getElementById('appsec-type').value;
						const value = document.getElementById('appsec-value').value;
						
						// Show spinner
						showSpinner('Fetching AppsecJira issues...');
						
						// Simulate AppsecJira API call with sample data
						setTimeout(() => {
						const tbody = document.querySelector('#appsec-results-table tbody');
						const sampleData = generateSampleAppsecData(type, value);
						
						tbody.innerHTML = '';
						sampleData.forEach(row => {
							const tr = document.createElement('tr');
							tr.innerHTML = \`
								<td>
									<div class="appsec-actions">
										<button class="action-btn analyze" data-action="analyze" data-key="\${row.issueKey}" data-summary="\${row.summary}" data-description="\${row.description}">🔍 Analyze</button>
										<button class="action-btn fix" data-action="fix" data-key="\${row.issueKey}" data-summary="\${row.summary}" data-description="\${row.description}">🔧 Fix</button>
										<button class="action-btn testplan" data-action="testplan" data-key="\${row.issueKey}" data-summary="\${row.summary}" data-description="\${row.description}">📋 Test Plan</button>
										<button class="action-btn mitigate" data-action="mitigate" data-key="\${row.issueKey}" data-summary="\${row.summary}" data-description="\${row.description}">🛡️ Mitigate</button>
									</div>
								</td>
								<td>\${row.issueKey}</td>
								<td><span style="color: \${getPriorityColor(row.priority)}">\${row.priority}</span></td>
								<td>\${row.status}</td>
								<td>\${row.assignee}</td>
								<td>\${row.created}</td>
								<td>\${row.summary}</td>
								<td>\${row.type}</td>
							\`;
							tbody.appendChild(tr);
						});
						
						// Add event listeners to action buttons
						document.querySelectorAll('.appsec-actions .action-btn').forEach(button => {
							button.addEventListener('click', function() {
								console.log('AppSec button clicked:', this);
								const action = this.getAttribute('data-action');
								const key = this.getAttribute('data-key');
								const summary = this.getAttribute('data-summary');
								const description = this.getAttribute('data-description');
								console.log('AppSec action data:', { action, key, summary });
								sendAppsecPromptToChat(action, key, summary, description);
							});
						});
						
						hideSpinner();
					}, 1100);
					}
					
					function generateSampleAppsecData(type, value) {
						// Return only 1 row of mock data for demonstration
						const sampleIssue = {
							issueKey: 'SEC-2456',
							priority: 'Critical',
							status: 'Open',
							assignee: 'security.team',
							created: '2025-07-25',
							summary: 'SQL injection vulnerability in user authentication module',
							type: 'Vulnerability',
							description: \`**Security Issue Details:**

**Vulnerability Type:** SQL Injection
**Affected Component:** User Authentication Module
**OWASP Category:** A03:2021 - Injection
**CWE ID:** CWE-89

**Description:**
A critical SQL injection vulnerability has been identified in the user authentication module (login.php) where user input is directly concatenated into SQL queries without proper sanitization or parameterized queries.

**Technical Details:**
- Location: /src/auth/login.php, line 45-52
- Parameter: username field in login form
- Query: SELECT * FROM users WHERE username='\$username' AND password='\$password'
- Attack Vector: POST request to /auth/login endpoint

**Proof of Concept:**
Username: admin' OR '1'='1' --
Password: anything

**Impact Assessment:**
- **Confidentiality:** HIGH - Full database access possible
- **Integrity:** HIGH - Data modification capabilities
- **Availability:** MEDIUM - Potential for database corruption
- **CVSS Score:** 9.8 (Critical)

**Affected Systems:**
- Production authentication service
- User database (contains PII and credentials)
- Approximately 50,000 user accounts at risk

**Business Impact:**
- Potential data breach affecting customer PII
- Regulatory compliance violations (GDPR, CCPA)
- Reputational damage and customer trust loss
- Estimated financial impact: \$500K - \$2M

**Security Requirements:**
- Implement parameterized queries/prepared statements
- Input validation and sanitization
- Principle of least privilege for database access
- Web Application Firewall (WAF) rules
- Security code review and testing\`
						};
						
						return [sampleIssue];
					}
					
					function getPriorityColor(priority) {
						switch (priority) {
							case 'Critical': return 'var(--vscode-charts-red)';
							case 'High': return 'var(--vscode-charts-orange)';
							case 'Medium': return 'var(--vscode-charts-yellow)';
							case 'Low': return 'var(--vscode-charts-blue)';
							default: return 'var(--vscode-foreground)';
						}
					}
					
					function resetAppsecForm() {
						document.getElementById('appsec-type').value = '';
						document.getElementById('appsec-value').value = '';
					}
					
					function resetAppsecResults() {
						const tbody = document.querySelector('#appsec-results-table tbody');
						tbody.innerHTML = \`
							<tr>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
							</tr>
						\`;
					}
					
					// Enterprise JIRA functions
					function fetchJiraDetails() {
						if (!validateJiraForm()) {
							return;
						}
						
						const type = document.getElementById('jira-type').value;
						const fetchSelection = document.getElementById('jira-fetch-selection').value;
						
						// Show spinner
						showSpinner('Fetching JIRA details...');
						
						// Simulate JIRA API call with sample data
						setTimeout(() => {
							const tbody = document.querySelector('#jira-results-table tbody');
							const sampleData = generateSampleJiraData(type, fetchSelection);
						
						tbody.innerHTML = '';
						sampleData.forEach(row => {
							const tr = document.createElement('tr');
							tr.innerHTML = \`
								<td>
									<div class="jira-actions">
										<button class="action-btn groom" data-action="groom" data-key="\${row.key}" data-summary="\${row.summary}">🔄 Groom</button>
										<button class="action-btn tasks" data-action="tasks" data-key="\${row.key}" data-summary="\${row.summary}">📝 Tasks</button>
										<button class="action-btn test" data-action="test" data-key="\${row.key}" data-summary="\${row.summary}">🧪 Test</button>
										<button class="action-btn estimate" data-action="estimate" data-key="\${row.key}" data-summary="\${row.summary}">📊 Estimate</button>
										<button class="action-btn trace" data-action="trace" data-key="\${row.key}" data-summary="\${row.summary}">🔗 Traceability</button>
									</div>
								</td>
								<td>\${row.key}</td>
								<td>\${row.summary}</td>
								<td><span style="color: \${getStatusColor(row.status)}">\${row.status}</span></td>
								<td><span style="color: \${getPriorityColor(row.priority)}">\${row.priority}</span></td>
								<td>\${row.assignee}</td>
								<td>\${row.storyPoints}</td>
								<td>\${row.sprint}</td>
							\`;
							tbody.appendChild(tr);
						});
						
						// Add event listeners to action buttons
						document.querySelectorAll('.jira-actions .action-btn').forEach(button => {
							button.addEventListener('click', function() {
								const action = this.getAttribute('data-action');
								const key = this.getAttribute('data-key');
								const summary = this.getAttribute('data-summary');
								sendJiraPromptToChat(action, key, summary, sampleData[0].description);
							});
						});
						
						hideSpinner();
					}, 1400);
					}
					
					function generateSampleJiraData(type, fetchSelection) {
						// Return only 1 row of mock data for demonstration
						const sampleTicket = {
							key: 'PROJ-1234',
							summary: 'Implement advanced user authentication with OAuth2 and multi-factor authentication support',
							status: 'In Progress',
							priority: 'High',
							assignee: 'john.doe',
							storyPoints: 8,
							sprint: 'Sprint 24',
							description: \`As a system administrator, I want to implement a comprehensive authentication system that supports OAuth2 integration with popular providers (Google, Microsoft, GitHub) and includes multi-factor authentication capabilities.

Acceptance Criteria:
- OAuth2 integration with at least 3 providers
- Multi-factor authentication using TOTP/SMS
- Session management with JWT tokens
- Role-based access control
- Security audit logging
- Password complexity requirements
- Account lockout mechanisms

Technical Requirements:
- Use industry-standard OAuth2 libraries
- Implement secure token storage
- Follow OWASP security guidelines
- Ensure GDPR compliance for user data
- Performance: Authentication should complete within 2 seconds
- Support for SSO (Single Sign-On)

Dependencies:
- Backend API authentication endpoints
- Frontend login/registration UI
- Database schema updates for user roles
- Integration testing with external providers\`
						};
						
						return [sampleTicket];
					}
					
					function getStatusColor(status) {
						switch (status) {
							case 'To Do': return 'var(--vscode-charts-gray)';
							case 'In Progress': return 'var(--vscode-charts-blue)';
							case 'Code Review': return 'var(--vscode-charts-orange)';
							case 'Testing': return 'var(--vscode-charts-yellow)';
							case 'Done': return 'var(--vscode-charts-green)';
							case 'Backlog': return 'var(--vscode-charts-purple)';
							default: return 'var(--vscode-foreground)';
						}
					}
					
					function getPriorityColor(priority) {
						switch (priority) {
							case 'Critical': return '#dc3545';
							case 'High': return '#fd7e14';
							case 'Medium': return '#ffc107';
							case 'Low': return '#28a745';
							default: return 'var(--vscode-foreground)';
						}
					}
					
					function resetJiraForm() {
						document.getElementById('jira-type').value = '';
						document.getElementById('jira-fetch-selection').value = '';
					}
					
					function resetJiraResults() {
						const tbody = document.querySelector('#jira-results-table tbody');
						tbody.innerHTML = \`
							<tr>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
								<td>-</td>
							</tr>
						\`;
					}
					
					// Form Validation Functions
					function clearValidationErrors() {
						// Remove error classes from all inputs and groups
						document.querySelectorAll('.form-input.error').forEach(input => {
							input.classList.remove('error');
						});
						document.querySelectorAll('.form-group.error').forEach(group => {
							group.classList.remove('error');
						});
						// Remove all error messages
						document.querySelectorAll('.error-message').forEach(msg => {
							msg.remove();
						});
					}
					
					function showFieldError(fieldId, message) {
						const field = document.getElementById(fieldId);
						const formGroup = field.closest('.form-group') || field.closest('.form-group-aligned');
						
						// Add error classes
						field.classList.add('error');
						if (formGroup) {
							formGroup.classList.add('error');
						}
						
						// Add error message
						const errorDiv = document.createElement('div');
						errorDiv.className = 'error-message';
						errorDiv.textContent = message;
						
						// Insert error message after the field
						field.parentNode.insertBefore(errorDiv, field.nextSibling);
						
						// Scroll to the first error field
						if (!document.querySelector('.form-input.error:not(#' + fieldId + ')')) {
							field.scrollIntoView({ behavior: 'smooth', block: 'center' });
						}
					}
					
					function validateDoraForm() {
						clearValidationErrors();
						let isValid = true;
						
						const repoName = document.getElementById('dora-repo-name').value.trim();
						
						if (!repoName) {
							showFieldError('dora-repo-name', 'Repository name is required');
							isValid = false;
						} else if (!repoName.includes('/')) {
							showFieldError('dora-repo-name', 'Repository name must be in format: organization/repository');
							isValid = false;
						}
						
						return isValid;
					}
					
					function validateJiraForm() {
						clearValidationErrors();
						let isValid = true;
						
						const type = document.getElementById('jira-type').value;
						const fetchSelection = document.getElementById('jira-fetch-selection').value.trim();
						
						if (!type) {
							showFieldError('jira-type', 'Please select a type (Username, Ticket ID, Board ID, or Team)');
							isValid = false;
						}
						
						if (!fetchSelection) {
							showFieldError('jira-fetch-selection', 'Please enter a fetch selection value');
							isValid = false;
						}
						
						return isValid;
					}
					
					function validateGitHubForm() {
						clearValidationErrors();
						let isValid = true;
						
						const repoName = document.getElementById('github-repo-name').value.trim();
						
						if (!repoName) {
							showFieldError('github-repo-name', 'Repository name is required');
							isValid = false;
						} else if (!repoName.includes('/')) {
							showFieldError('github-repo-name', 'Repository name must be in format: organization/repository');
							isValid = false;
						}
						
						return isValid;
					}
					
					function validateAppsecForm() {
						clearValidationErrors();
						let isValid = true;
						
						const value = document.getElementById('appsec-value').value.trim();
						
						if (!value) {
							showFieldError('appsec-value', 'Please enter a project name or ID');
							isValid = false;
						}
						
						return isValid;
					}
					
					function validateSonarForm() {
						clearValidationErrors();
						let isValid = true;
						
						const repoName = document.getElementById('quality-repo-name').value.trim();
						
						if (!repoName) {
							showFieldError('quality-repo-name', 'Repository name is required');
							isValid = false;
						} else if (!repoName.includes('/')) {
							showFieldError('quality-repo-name', 'Repository name must be in format: organization/repository');
							isValid = false;
						}
						
						return isValid;
					}
					
					function validateCheckmarxForm() {
						clearValidationErrors();
						let isValid = true;
						
						const repoName = document.getElementById('quality-repo-name').value.trim();
						
						if (!repoName) {
							showFieldError('quality-repo-name', 'Repository name is required');
							isValid = false;
						} else if (!repoName.includes('/')) {
							showFieldError('quality-repo-name', 'Repository name must be in format: organization/repository');
							isValid = false;
						}
						
						return isValid;
					}
					
					// Add input event listeners to clear validation errors on user input
					function setupValidationListeners() {
						const inputIds = [
							'dora-repo-name', 'jira-type', 'jira-fetch-selection',
							'github-repo-name', 'appsec-value', 'quality-repo-name'
						];
						
						inputIds.forEach(id => {
							const element = document.getElementById(id);
							if (element) {
								element.addEventListener('input', function() {
									if (this.classList.contains('error')) {
										this.classList.remove('error');
										const formGroup = this.closest('.form-group') || this.closest('.form-group-aligned');
										if (formGroup) {
											formGroup.classList.remove('error');
										}
										const errorMsg = this.parentNode.querySelector('.error-message');
										if (errorMsg) {
											errorMsg.remove();
										}
									}
								});
								
								element.addEventListener('change', function() {
									if (this.classList.contains('error')) {
										this.classList.remove('error');
										const formGroup = this.closest('.form-group') || this.closest('.form-group-aligned');
										if (formGroup) {
											formGroup.classList.remove('error');
										}
										const errorMsg = this.parentNode.querySelector('.error-message');
										if (errorMsg) {
											errorMsg.remove();
										}
									}
								});
							}
						});
					}
					
					// DORA Metrics Functions
					function fetchDoraMetrics() {
						if (!validateDoraForm()) {
							return;
						}
						
						const repoName = document.getElementById('dora-repo-name').value;
						
						// Show spinner and update loading state
						showSpinner('Calculating DORA metrics...');
						updateMetricCards('loading');
						updateDoraResults([]);
						
						// Simulate API call with realistic delay
						setTimeout(() => {
							const mockData = generateMockDoraData();
							updateMetricCards('loaded', mockData.metrics);
							updateDoraResults(mockData.deployments);
							drawDoraCharts(mockData);
							hideSpinner();
						}, 1500);
					}
					
					function generateMockDoraData() {
						const timePeriod = parseInt(document.getElementById('dora-time-period').value);
						const environment = document.getElementById('dora-environment').value;
						
						// Generate realistic mock data
						const baseMetrics = {
							deploymentFreq: Math.floor(Math.random() * 20) + 5, // 5-25 per month
							leadTime: Math.floor(Math.random() * 48) + 2, // 2-50 hours
							changeFailure: Math.floor(Math.random() * 15) + 1, // 1-15%
							recoveryTime: Math.floor(Math.random() * 240) + 30 // 30-270 minutes
						};
						
						return {
							metrics: {
								deploymentFreq: {
									value: baseMetrics.deploymentFreq + '/month',
									trend: Math.random() > 0.5 ? 'positive' : 'negative',
									trendText: Math.random() > 0.5 ? '↗ +12% vs last period' : '↘ -5% vs last period'
								},
								leadTime: {
									value: baseMetrics.leadTime + 'h',
									trend: Math.random() > 0.6 ? 'positive' : 'negative',
									trendText: Math.random() > 0.6 ? '↗ -18% faster' : '↘ +8% slower'
								},
								changeFailure: {
									value: baseMetrics.changeFailure + '%',
									trend: Math.random() > 0.7 ? 'positive' : 'negative',
									trendText: Math.random() > 0.7 ? '↗ -3% improvement' : '↘ +2% increase'
								},
								recoveryTime: {
									value: Math.floor(baseMetrics.recoveryTime / 60) + 'h ' + (baseMetrics.recoveryTime % 60) + 'm',
									trend: Math.random() > 0.5 ? 'positive' : 'negative',
									trendText: Math.random() > 0.5 ? '↗ -25% faster' : '↘ +15% slower'
								}
							},
							deployments: generateMockDeployments(timePeriod),
							chartData: {
								deploymentTrend: Array.from({length: 30}, () => Math.floor(Math.random() * 8) + 1),
								leadTimeDistribution: Array.from({length: 7}, () => Math.floor(Math.random() * 100) + 10)
							}
						};
					}
					
					function generateMockDeployments(days) {
						const deployments = [];
						const environments = ['production', 'staging', 'development'];
						const workflows = ['deploy-prod.yml', 'deploy-staging.yml', 'ci-cd.yml', 'release.yml'];
						const statuses = ['success', 'failed', 'pending'];
						
						for (let i = 0; i < Math.min(days * 0.8, 25); i++) {
							const date = new Date();
							date.setDate(date.getDate() - Math.floor(Math.random() * days));
							
							const status = statuses[Math.floor(Math.random() * statuses.length)];
							const leadTime = Math.floor(Math.random() * 72) + 1; // 1-72 hours
							const duration = Math.floor(Math.random() * 25) + 2; // 2-27 minutes
							
							deployments.push({
								date: date.toLocaleDateString(),
								environment: environments[Math.floor(Math.random() * environments.length)],
								workflow: workflows[Math.floor(Math.random() * workflows.length)],
								duration: duration + 'm ' + Math.floor(Math.random() * 60) + 's',
								status: status,
								leadTime: leadTime + 'h',
								commit: Math.random().toString(36).substring(2, 9)
							});
						}
						
						return deployments.sort((a, b) => new Date(b.date) - new Date(a.date));
					}
					
					function updateMetricCards(state, metrics = null) {
						const cards = ['deployment-freq', 'lead-time', 'change-failure', 'recovery-time'];
						
						if (state === 'loading') {
							cards.forEach(card => {
								document.getElementById(card + '-value').textContent = '...';
								document.getElementById(card + '-trend').textContent = 'Loading...';
								document.getElementById(card + '-trend').className = 'metric-trend neutral';
							});
						} else if (state === 'loaded' && metrics) {
							document.getElementById('deployment-freq-value').textContent = metrics.deploymentFreq.value;
							document.getElementById('deployment-freq-trend').textContent = metrics.deploymentFreq.trendText;
							document.getElementById('deployment-freq-trend').className = 'metric-trend ' + metrics.deploymentFreq.trend;
							
							document.getElementById('lead-time-value').textContent = metrics.leadTime.value;
							document.getElementById('lead-time-trend').textContent = metrics.leadTime.trendText;
							document.getElementById('lead-time-trend').className = 'metric-trend ' + metrics.leadTime.trend;
							
							document.getElementById('change-failure-value').textContent = metrics.changeFailure.value;
							document.getElementById('change-failure-trend').textContent = metrics.changeFailure.trendText;
							document.getElementById('change-failure-trend').className = 'metric-trend ' + metrics.changeFailure.trend;
							
							document.getElementById('recovery-time-value').textContent = metrics.recoveryTime.value;
							document.getElementById('recovery-time-trend').textContent = metrics.recoveryTime.trendText;
							document.getElementById('recovery-time-trend').className = 'metric-trend ' + metrics.recoveryTime.trend;
						}
					}
					
					function updateDoraResults(deployments) {
						const tbody = document.querySelector('#dora-results-table tbody');
						
						if (deployments.length === 0) {
							tbody.innerHTML = \`
								<tr>
									<td>-</td>
									<td>-</td>
									<td>-</td>
									<td>-</td>
									<td>-</td>
									<td>-</td>
									<td>-</td>
								</tr>
							\`;
							return;
						}
						
						tbody.innerHTML = deployments.map(dep => \`
							<tr>
								<td>\${dep.date}</td>
								<td>\${dep.environment}</td>
								<td>\${dep.workflow}</td>
								<td>\${dep.duration}</td>
								<td><span class="status-\${dep.status}">\${dep.status.toUpperCase()}</span></td>
								<td>\${dep.leadTime}</td>
								<td><span class="commit-hash">\${dep.commit}</span></td>
							</tr>
						\`).join('');
					}
					
					function drawDoraCharts(data) {
						drawDeploymentChart(data.chartData.deploymentTrend);
						drawLeadTimeChart(data.chartData.leadTimeDistribution);
					}
					
					function drawDeploymentChart(data) {
						const canvas = document.getElementById('deployment-chart');
						const ctx = canvas.getContext('2d');
						
						// Clear canvas
						ctx.clearRect(0, 0, canvas.width, canvas.height);
						
						const width = canvas.width;
						const height = canvas.height;
						const padding = 20;
						const chartWidth = width - 2 * padding;
						const chartHeight = height - 2 * padding;
						
						// Find max value for scaling
						const maxValue = Math.max(...data);
						
						// Draw grid lines
						ctx.strokeStyle = '#3c3c3c';
						ctx.lineWidth = 1;
						for (let i = 0; i <= 5; i++) {
							const y = padding + (chartHeight / 5) * i;
							ctx.beginPath();
							ctx.moveTo(padding, y);
							ctx.lineTo(width - padding, y);
							ctx.stroke();
						}
						
						// Draw data line
						ctx.strokeStyle = '#007ACC';
						ctx.lineWidth = 2;
						ctx.beginPath();
						
						data.forEach((value, index) => {
							const x = padding + (chartWidth / (data.length - 1)) * index;
							const y = height - padding - (value / maxValue) * chartHeight;
							
							if (index === 0) {
								ctx.moveTo(x, y);
							} else {
								ctx.lineTo(x, y);
							}
						});
						
						ctx.stroke();
						
						// Draw data points
						ctx.fillStyle = '#007ACC';
						data.forEach((value, index) => {
							const x = padding + (chartWidth / (data.length - 1)) * index;
							const y = height - padding - (value / maxValue) * chartHeight;
							
							ctx.beginPath();
							ctx.arc(x, y, 3, 0, 2 * Math.PI);
							ctx.fill();
						});
					}
					
					function drawLeadTimeChart(data) {
						const canvas = document.getElementById('leadtime-chart');
						const ctx = canvas.getContext('2d');
						
						// Clear canvas
						ctx.clearRect(0, 0, canvas.width, canvas.height);
						
						const width = canvas.width;
						const height = canvas.height;
						const padding = 20;
						const chartWidth = width - 2 * padding;
						const chartHeight = height - 2 * padding;
						
						const maxValue = Math.max(...data);
						const barWidth = chartWidth / data.length;
						
						// Draw bars
						data.forEach((value, index) => {
							const barHeight = (value / maxValue) * chartHeight;
							const x = padding + index * barWidth;
							const y = height - padding - barHeight;
							
							// Gradient for bars
							const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
							gradient.addColorStop(0, '#007ACC');
							gradient.addColorStop(1, '#005a9e');
							
							ctx.fillStyle = gradient;
							ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
						});
					}
					
					function resetDoraForm() {
						document.getElementById('dora-repo-name').value = '';
						document.getElementById('dora-time-period').value = '30';
						document.getElementById('dora-environment').value = 'all';
						document.getElementById('dora-workflow').value = '';
					}
					
					function resetDoraResults() {
						updateMetricCards('reset');
						updateDoraResults([]);
						
						// Clear charts
						const charts = ['deployment-chart', 'leadtime-chart'];
						charts.forEach(chartId => {
							const canvas = document.getElementById(chartId);
							const ctx = canvas.getContext('2d');
							ctx.clearRect(0, 0, canvas.width, canvas.height);
						});
						
						// Reset metric cards
						const cards = ['deployment-freq', 'lead-time', 'change-failure', 'recovery-time'];
						cards.forEach(card => {
							document.getElementById(card + '-value').textContent = '-';
							document.getElementById(card + '-trend').textContent = '-';
							document.getElementById(card + '-trend').className = 'metric-trend neutral';
						});
					}
					
					// JIRA Smart Prompts and Chat Integration
					function sendJiraPromptToChat(action, ticketKey, summary, description) {
						let prompt = '';
						
						switch (action) {
							case 'groom':
								prompt = \`🔄 **JIRA Ticket Grooming Analysis**

**Ticket:** \${ticketKey}
**Summary:** \${summary}

**Current Description:**
\${description}

**Please help me groom this JIRA ticket by:**

1. **Requirement Analysis:**
   - Identify any unclear or ambiguous requirements
   - Suggest missing acceptance criteria
   - Highlight potential edge cases

2. **Technical Considerations:**
   - Identify technical dependencies
   - Suggest architecture considerations
   - Point out potential risks or challenges

3. **User Story Enhancement:**
   - Improve the user story format if needed
   - Suggest better acceptance criteria
   - Recommend testable scenarios

4. **Estimation Factors:**
   - Identify complexity factors for estimation
   - Suggest story point considerations
   - Highlight dependencies that affect timeline

5. **Definition of Done:**
   - Suggest comprehensive DoD criteria
   - Include testing requirements
   - Add deployment considerations

Please provide a detailed grooming analysis with actionable recommendations.\`;
								break;
								
							case 'tasks':
								prompt = \`📝 **JIRA Ticket Task Breakdown**

**Ticket:** \${ticketKey}
**Summary:** \${summary}

**Description:**
\${description}

**Please help me break down this JIRA ticket into detailed tasks:**

1. **Development Tasks:**
   - Create a comprehensive list of development subtasks
   - Include frontend, backend, and database tasks
   - Specify technical implementation steps

2. **Testing Tasks:**
   - Unit testing requirements
   - Integration testing scenarios
   - User acceptance testing criteria

3. **Documentation Tasks:**
   - Code documentation requirements
   - User documentation updates
   - API documentation changes

4. **Deployment Tasks:**
   - Environment setup requirements
   - Configuration changes needed
   - Migration scripts if applicable

5. **Task Dependencies:**
   - Identify task dependencies and sequence
   - Highlight critical path items
   - Suggest parallel execution opportunities

Please provide a detailed task breakdown with estimated effort for each task.\`;
								break;
								
							case 'test':
								prompt = \`🧪 **JIRA Ticket Test Scenarios**

**Ticket:** \${ticketKey}
**Summary:** \${summary}

**Description:**
\${description}

**Please help me create comprehensive test scenarios for this JIRA ticket:**

1. **Unit Test Scenarios:**
   - Identify key functions/methods to test
   - Create positive and negative test cases
   - Include edge case testing

2. **Integration Test Scenarios:**
   - API integration testing
   - Database integration scenarios
   - Third-party service integration tests

3. **User Acceptance Test Scenarios:**
   - Happy path user journeys
   - Error handling scenarios
   - Accessibility testing considerations

4. **Performance Test Scenarios:**
   - Load testing requirements
   - Performance benchmarks
   - Scalability considerations

5. **Security Test Scenarios:**
   - Authentication/authorization tests
   - Input validation testing
   - Data security verification

6. **Browser/Device Compatibility:**
   - Cross-browser testing scenarios
   - Mobile responsiveness tests
   - Different screen resolution tests

Please provide detailed test scenarios with expected outcomes and test data requirements.\`;
								break;
								
							case 'estimate':
								prompt = \`📊 **JIRA Ticket Estimation Analysis**

**Ticket:** \${ticketKey}
**Summary:** \${summary}

**Description:**
\${description}

**Please help me estimate this JIRA ticket using multiple approaches:**

1. **Story Point Estimation:**
   - Analyze complexity factors
   - Compare with similar past tickets
   - Provide story point recommendation (1, 2, 3, 5, 8, 13, 21)
   - Justify the estimation reasoning

2. **Time-based Estimation:**
   - Break down into hours for different activities
   - Include development, testing, and review time
   - Account for potential blockers and unknowns

3. **Risk Assessment:**
   - Identify high-risk areas that could affect estimation
   - Suggest mitigation strategies
   - Include buffer time recommendations

4. **Effort Distribution:**
   - Frontend vs Backend effort split
   - Testing effort percentage
   - Documentation and deployment time

5. **Dependency Impact:**
   - External dependencies that could affect timeline
   - Team coordination requirements
   - Infrastructure or tool dependencies

6. **Historical Comparison:**
   - Compare with similar tickets completed before
   - Identify patterns and lessons learned
   - Adjust estimation based on team velocity

Please provide a comprehensive estimation with confidence level and risk factors.\`;
								break;
								
							case 'trace':
								prompt = \`🔗 **JIRA Ticket Traceability Analysis**

**Ticket:** \${ticketKey}
**Summary:** \${summary}

**Description:**
\${description}

**Please help me establish comprehensive traceability for this JIRA ticket:**

1. **Requirements Traceability:**
   - Link to parent epics or features
   - Identify related user stories
   - Map to business requirements documents

2. **Technical Traceability:**
   - Identify affected code modules/components
   - Map to architectural decisions
   - Link to technical documentation

3. **Test Traceability:**
   - Map requirements to test cases
   - Link to automated test suites
   - Connect to manual testing procedures

4. **Deployment Traceability:**
   - Identify deployment dependencies
   - Map to configuration changes
   - Link to environment-specific requirements

5. **Impact Analysis:**
   - Identify downstream systems affected
   - Map to dependent tickets/features
   - Analyze backward compatibility requirements

6. **Documentation Traceability:**
   - Link to user guides requiring updates
   - Map to API documentation changes
   - Identify training material updates needed

7. **Compliance Traceability:**
   - Map to security requirements
   - Link to audit trail requirements
   - Connect to regulatory compliance needs

Please provide a comprehensive traceability matrix with all relevant links and dependencies.\`;
								break;
								
							default:
								prompt = \`Please analyze JIRA ticket \${ticketKey}: \${summary}\`;
						}
						
						// Send prompt to VS Code Copilot Chat
						vscode.postMessage({
							command: 'sendToChat',
							prompt: prompt
						});
					}
					
					// AppSec Smart Prompts and Chat Integration
					function sendAppsecPromptToChat(action, issueKey, summary, description) {
						console.log('sendAppsecPromptToChat called with:', { action, issueKey, summary });
						let prompt = '';
						
						switch (action) {
							case 'analyze':
								prompt = \`🔍 **AppSec Issue Analysis**

**Issue:** \${issueKey}
**Summary:** \${summary}

**Issue Description:**
\${description}

**Please help me perform a comprehensive security analysis of this issue:**

1. **Vulnerability Assessment:**
   - Analyze the severity and impact of this security vulnerability
   - Identify attack vectors and exploitation scenarios
   - Assess the likelihood of successful exploitation

2. **Root Cause Analysis:**
   - Identify the underlying causes that led to this vulnerability
   - Analyze code patterns or architectural decisions that contributed
   - Review security controls that failed to prevent this issue

3. **Risk Analysis:**
   - Evaluate business impact and financial implications
   - Assess compliance and regulatory risks
   - Determine reputational and operational risks

4. **Attack Surface Analysis:**
   - Identify all potential entry points for this vulnerability
   - Map related systems and components that could be affected
   - Analyze network and application attack surfaces

5. **Threat Modeling:**
   - Identify potential threat actors and their capabilities
   - Analyze possible attack scenarios and kill chains
   - Evaluate existing security controls and their effectiveness

6. **Security Dependencies:**
   - Identify security-related dependencies and libraries
   - Analyze third-party components for similar vulnerabilities
   - Review security update requirements

Please provide a detailed security analysis with risk ratings and priority recommendations.\`;
								break;
								
							case 'fix':
								prompt = \`🔧 **AppSec Issue Remediation Plan**

**Issue:** \${issueKey}
**Summary:** \${summary}

**Issue Description:**
\${description}

**Please help me create a comprehensive remediation plan for this security vulnerability:**

1. **Immediate Remediation Steps:**
   - Provide specific code fixes and secure implementation patterns
   - Include input validation and sanitization requirements
   - Specify security controls to implement immediately

2. **Code Implementation:**
   - Provide secure code examples and best practices
   - Include proper error handling and logging
   - Specify security libraries and frameworks to use

3. **Configuration Changes:**
   - Identify security configuration updates needed
   - Include firewall rules and access control changes
   - Specify environment-specific security settings

4. **Security Testing:**
   - Define security test cases to validate the fix
   - Include penetration testing scenarios
   - Specify automated security testing requirements

5. **Deployment Strategy:**
   - Create a secure deployment plan with rollback procedures
   - Include security validation checkpoints
   - Specify monitoring and alerting requirements

6. **Long-term Security Improvements:**
   - Recommend architectural changes for better security
   - Suggest security design patterns and principles
   - Include security training and awareness recommendations

7. **Verification and Validation:**
   - Define acceptance criteria for the security fix
   - Include regression testing requirements
   - Specify security review and approval processes

Please provide detailed remediation steps with secure code examples and implementation guidance.\`;
								break;
								
							case 'testplan':
								prompt = \`📋 **AppSec Testing Strategy**

**Issue:** \${issueKey}
**Summary:** \${summary}

**Issue Description:**
\${description}

**Please help me create a comprehensive security testing plan for this vulnerability:**

1. **Security Test Cases:**
   - Create positive and negative security test scenarios
   - Include boundary value testing for security controls
   - Define input validation and injection testing cases

2. **Penetration Testing Scenarios:**
   - Design manual penetration testing procedures
   - Include automated security scanning requirements
   - Specify vulnerability assessment methodologies

3. **Code Security Review:**
   - Define static application security testing (SAST) requirements
   - Include dynamic application security testing (DAST) scenarios
   - Specify interactive application security testing (IAST) needs

4. **Authentication and Authorization Testing:**
   - Create access control testing scenarios
   - Include privilege escalation testing
   - Define session management testing requirements

5. **Data Security Testing:**
   - Include encryption and data protection testing
   - Define data leakage and exposure testing scenarios
   - Specify compliance and privacy testing requirements

6. **Infrastructure Security Testing:**
   - Define network security testing requirements
   - Include configuration and hardening validation
   - Specify security monitoring and logging testing

7. **Regression Testing:**
   - Create security regression test suite
   - Include automated security testing integration
   - Define continuous security testing requirements

8. **Performance and Security Testing:**
   - Include security performance impact testing
   - Define load testing with security scenarios
   - Specify denial of service (DoS) testing requirements

Please provide a detailed security testing strategy with test cases, tools, and methodologies.\`;
								break;
								
							case 'mitigate':
								prompt = \`🛡️ **AppSec Risk Mitigation Strategy**

**Issue:** \${issueKey}
**Summary:** \${summary}

**Issue Description:**
\${description}

**Please help me develop a comprehensive risk mitigation strategy for this security vulnerability:**

1. **Immediate Risk Mitigation:**
   - Identify temporary security controls to reduce risk
   - Include emergency response procedures
   - Specify incident response and containment measures

2. **Compensating Controls:**
   - Define alternative security controls while permanent fix is developed
   - Include monitoring and detection capabilities
   - Specify manual security procedures if needed

3. **Defense in Depth Strategy:**
   - Implement multiple layers of security controls
   - Include network, application, and data security measures
   - Specify security monitoring and alerting systems

4. **Access Control Mitigation:**
   - Implement principle of least privilege
   - Include role-based access control (RBAC) measures
   - Specify authentication and authorization enhancements

5. **Network Security Mitigation:**
   - Include firewall rules and network segmentation
   - Specify intrusion detection and prevention measures
   - Define network monitoring and traffic analysis

6. **Application Security Mitigation:**
   - Implement web application firewall (WAF) rules
   - Include input validation and output encoding
   - Specify security headers and configuration hardening

7. **Monitoring and Detection:**
   - Define security monitoring and alerting requirements
   - Include log analysis and correlation rules
   - Specify threat intelligence integration

8. **Business Continuity:**
   - Create business continuity and disaster recovery plans
   - Include data backup and recovery procedures
   - Specify service availability and redundancy measures

9. **Compliance and Governance:**
   - Address regulatory compliance requirements
   - Include security policy and procedure updates
   - Specify audit and reporting requirements

Please provide a comprehensive risk mitigation strategy with implementation priorities and timelines.\`;
								break;
								
							default:
								prompt = \`Please analyze AppSec issue \${issueKey}: \${summary}\`;
						}
						
						// Send prompt to VS Code Copilot Chat
						console.log('Sending AppSec prompt to chat:', prompt.substring(0, 100) + '...');
						vscode.postMessage({
							command: 'sendToChat',
							prompt: prompt
						});
						console.log('AppSec message sent to vscode');
					}
				</script>
			</body>
			</html>`;
    }
}
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "githubcopilot-intdevextn" is now active!');
    // Register the webview provider for the RK IDP sidebar
    const provider = new RkIdpViewProvider(context.extensionUri, context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(RkIdpViewProvider.viewType, provider));
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('githubcopilot-intdevextn.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        //vscode.window.showInformationMessage('Hello World from Professional Extension!');
    });
    // Register command to open RK IDP settings
    const openSettingsDisposable = vscode.commands.registerCommand('githubcopilot-intdevextn.openSettings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'rk-idp');
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(openSettingsDisposable);
}
// This method is called when your extension is deactivated
function deactivate() { }


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */,
/* 3 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 5 */,
/* 6 */
/***/ ((module) => {

module.exports = require("os");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map