/**
 * Chat Analytics Service for processing GitHub Copilot Chat history
 * Extracts metrics from exported chat.json files
 */

export interface ChatMetric {
    date: string;           // dd-mm-yyyy format
    prompts: number;        // Number of requests
    filesChanged: number;   // Files altered based on filepath
    linesAdded: number;     // Based on added lines in tool calls
    linesDeleted: number;   // Based on deleted lines in tool calls
    helpful: number;        // Based on user thumbs up feedback
    unhelpful: number;      // Based on user thumbs down feedback
}

export interface ChatExport {
    requesterUsername: string;
    responderUsername: string;
    requests: ChatRequest[];
}

export interface ChatRequest {
    requestId: string;
    message?: {
        text: string;
        parts?: any[];
    };
    response?: any[];
    responseId?: string;
    result?: {
        timings?: {
            firstProgress: number;
            totalElapsed: number;
        };
        metadata?: {
            toolCallRounds?: ToolCallRound[];
            codeBlocks?: any[];
        };
    };
    timestamp: number;
    isCanceled?: boolean;
    followups?: any[];
}

export interface ToolCallRound {
    response?: string;
    toolCalls?: ToolCall[];
    toolInputRetry?: number;
    id?: string;
}

export interface ToolCall {
    name: string;
    arguments?: string;
    id?: string;
}

export class ChatAnalyticsService {
    
    /**
     * Process chat export data and generate daily metrics
     */
    public async processChatHistory(chatData: ChatExport): Promise<ChatMetric[]> {
        try {
            // Group requests by date
            const dailyRequests = this.groupRequestsByDate(chatData.requests);
            
            // Calculate metrics for each day
            const metrics: ChatMetric[] = [];
            
            for (const [dateKey, requests] of dailyRequests.entries()) {
                const dailyMetric = await this.calculateDailyMetrics(dateKey, requests);
                metrics.push(dailyMetric);
            }
            
            // Sort by date (newest first)
            return metrics.sort((a, b) => {
                const dateA = this.parseDate(a.date);
                const dateB = this.parseDate(b.date);
                return dateB.getTime() - dateA.getTime();
            });
            
        } catch (error) {
            console.error('Error processing chat history:', error);
            throw new Error(`Failed to process chat history: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    
    /**
     * Group requests by date (dd-mm-yyyy format)
     */
    private groupRequestsByDate(requests: ChatRequest[]): Map<string, ChatRequest[]> {
        const grouped = new Map<string, ChatRequest[]>();
        
        for (const request of requests) {
            if (!request.timestamp) {
                continue;
            }
            
            const date = new Date(request.timestamp);
            const dateKey = this.formatDate(date);
            
            if (!grouped.has(dateKey)) {
                grouped.set(dateKey, []);
            }
            grouped.get(dateKey)!.push(request);
        }
        
        return grouped;
    }
    
    /**
     * Calculate metrics for a single day
     */
    private async calculateDailyMetrics(dateKey: string, requests: ChatRequest[]): Promise<ChatMetric> {
        let prompts = 0;
        let filesChanged = 0;
        let linesAdded = 0;
        let linesDeleted = 0;
        let helpful = 0;
        let unhelpful = 0;
        
        const changedFiles = new Set<string>();
        
        for (const request of requests) {
            // Count prompts (valid requests with messages)
            if (request.message?.text && request.message.text.trim().length > 0) {
                prompts++;
            }
            
            // Analyze tool calls for file changes and line counts
            if (request.result?.metadata?.toolCallRounds) {
                for (const round of request.result.metadata.toolCallRounds) {
                    if (round.toolCalls) {
                        for (const toolCall of round.toolCalls) {
                            const metrics = this.analyzeToolCall(toolCall);
                            
                            // Track unique files changed
                            if (metrics.filePath) {
                                changedFiles.add(metrics.filePath);
                            }
                            
                            linesAdded += metrics.linesAdded;
                            linesDeleted += metrics.linesDeleted;
                        }
                    }
                }
            }
            
            // Analyze feedback (thumbs up/down)
            // Note: In the current chat.json structure, explicit feedback isn't visible
            // This would need to be implemented when feedback data becomes available
            const feedbackMetrics = this.analyzeFeedback(request);
            helpful += feedbackMetrics.helpful;
            unhelpful += feedbackMetrics.unhelpful;
        }
        
        filesChanged = changedFiles.size;
        
        return {
            date: dateKey,
            prompts,
            filesChanged,
            linesAdded,
            linesDeleted,
            helpful,
            unhelpful
        };
    }
    
    /**
     * Analyze a tool call for file changes and line counts
     */
    private analyzeToolCall(toolCall: ToolCall): { filePath?: string; linesAdded: number; linesDeleted: number } {
        let filePath: string | undefined;
        let linesAdded = 0;
        let linesDeleted = 0;
        
        try {
            if (!toolCall.arguments) {
                return { filePath, linesAdded, linesDeleted };
            }
            
            // Parse tool call arguments
            const args = JSON.parse(toolCall.arguments);
            
            // Extract file path
            if (args.filePath) {
                filePath = args.filePath;
            }
            
            // Analyze different tool types
            switch (toolCall.name) {
                case 'replace_string_in_file':
                    const metrics = this.analyzeReplaceStringMetrics(args);
                    linesAdded = metrics.linesAdded;
                    linesDeleted = metrics.linesDeleted;
                    break;
                    
                case 'create_file':
                    if (args.content) {
                        linesAdded = args.content.split('\n').length;
                    }
                    break;
                    
                case 'edit_notebook_file':
                    if (args.newCode) {
                        const newCodeLines = Array.isArray(args.newCode) 
                            ? args.newCode.join('\n').split('\n').length
                            : args.newCode.split('\n').length;
                        linesAdded = newCodeLines;
                    }
                    break;
                    
                default:
                    // For other tool calls, try to estimate based on content
                    if (args.content) {
                        linesAdded = args.content.split('\n').length;
                    }
                    break;
            }
            
        } catch (error) {
            console.warn('Error parsing tool call arguments:', error);
        }
        
        return { filePath, linesAdded, linesDeleted };
    }
    
    /**
     * Analyze replace_string_in_file metrics by comparing old and new strings
     */
    private analyzeReplaceStringMetrics(args: any): { linesAdded: number; linesDeleted: number } {
        let linesAdded = 0;
        let linesDeleted = 0;
        
        try {
            if (args.oldString && args.newString) {
                const oldLines = args.oldString.split('\n');
                const newLines = args.newString.split('\n');
                
                linesDeleted = oldLines.length;
                linesAdded = newLines.length;
                
                // More sophisticated diff analysis could be implemented here
                // For now, we use simple line count difference
            }
        } catch (error) {
            console.warn('Error analyzing replace string metrics:', error);
        }
        
        return { linesAdded, linesDeleted };
    }
    
    /**
     * Analyze feedback from request (placeholder for future implementation)
     */
    private analyzeFeedback(request: ChatRequest): { helpful: number; unhelpful: number } {
        // TODO: Implement when feedback data structure becomes available
        // Current chat.json doesn't contain explicit thumbs up/down data
        
        // For now, we can use some heuristics:
        // - If there are follow-up requests quickly after, assume helpful
        // - If the response was very short or error-like, assume less helpful
        
        let helpful = 0;
        let unhelpful = 0;
        
        // Heuristic: If the response was successful and there are follow-ups, consider helpful
        if (request.result && !request.isCanceled && request.followups && request.followups.length > 0) {
            helpful = 1;
        }
        
        // Heuristic: If the request was canceled, consider unhelpful
        if (request.isCanceled) {
            unhelpful = 1;
        }
        
        return { helpful, unhelpful };
    }
    
    /**
     * Format date as dd-mm-yyyy
     */
    private formatDate(date: Date): string {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        return `${day}-${month}-${year}`;
    }
    
    /**
     * Parse dd-mm-yyyy date string back to Date object
     */
    private parseDate(dateStr: string): Date {
        const [day, month, year] = dateStr.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    /**
     * Load and parse chat export file
     */
    public async loadChatExport(filePath: string): Promise<ChatExport> {
        try {
            // This would be implemented in the VS Code extension context
            // For now, return a placeholder that indicates file loading is needed
            throw new Error('File loading must be implemented in VS Code extension context');
        } catch (error) {
            throw new Error(`Failed to load chat export: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    
    /**
     * Export metrics to CSV format
     */
    public exportToCSV(metrics: ChatMetric[]): string {
        const headers = ['Date', 'Prompts', 'Files Changed', 'Lines Added', 'Lines Deleted', 'Helpful', 'Unhelpful'];
        const rows = metrics.map(metric => [
            metric.date,
            metric.prompts.toString(),
            metric.filesChanged.toString(),
            metric.linesAdded.toString(),
            metric.linesDeleted.toString(),
            metric.helpful.toString(),
            metric.unhelpful.toString()
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    /**
     * Get summary statistics for the metrics
     */
    public getSummaryStats(metrics: ChatMetric[]): {
        totalPrompts: number;
        totalFilesChanged: number;
        totalLinesAdded: number;
        totalLinesDeleted: number;
        totalHelpful: number;
        totalUnhelpful: number;
        averagePromptsPerDay: number;
        helpfulRate: number;
    } {
        const totals = metrics.reduce((acc, metric) => ({
            prompts: acc.prompts + metric.prompts,
            filesChanged: acc.filesChanged + metric.filesChanged,
            linesAdded: acc.linesAdded + metric.linesAdded,
            linesDeleted: acc.linesDeleted + metric.linesDeleted,
            helpful: acc.helpful + metric.helpful,
            unhelpful: acc.unhelpful + metric.unhelpful
        }), {
            prompts: 0,
            filesChanged: 0,
            linesAdded: 0,
            linesDeleted: 0,
            helpful: 0,
            unhelpful: 0
        });
        
        const daysCount = metrics.length;
        const totalFeedback = totals.helpful + totals.unhelpful;
        
        return {
            totalPrompts: totals.prompts,
            totalFilesChanged: totals.filesChanged,
            totalLinesAdded: totals.linesAdded,
            totalLinesDeleted: totals.linesDeleted,
            totalHelpful: totals.helpful,
            totalUnhelpful: totals.unhelpful,
            averagePromptsPerDay: daysCount > 0 ? Math.round(totals.prompts / daysCount) : 0,
            helpfulRate: totalFeedback > 0 ? Math.round((totals.helpful / totalFeedback) * 100) : 0
        };
    }
}
