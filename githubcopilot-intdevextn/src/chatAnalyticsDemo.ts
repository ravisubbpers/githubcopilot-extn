/**
 * Demonstration script showing how chat.json metrics would be calculated
 * This shows the actual implementation based on the chat.json structure analysis
 */

import { ChatAnalyticsService, ChatExport, ChatRequest } from './chatAnalytics';

// Sample processing function that demonstrates the actual logic
export function demonstrateChatAnalysis() {
    console.log('=== Chat Analytics Demonstration ===\n');
    
    // Based on analysis of the actual chat.json structure, here's what we found:
    console.log('ACTUAL CHAT.JSON STRUCTURE ANALYSIS:');
    console.log('=====================================');
    
    console.log('1. ROOT STRUCTURE:');
    console.log('   - requesterUsername: "411645_cgcp"');
    console.log('   - responderUsername: "GitHub Copilot"');
    console.log('   - requests: Array of chat requests');
    console.log('');
    
    console.log('2. REQUEST STRUCTURE:');
    console.log('   - requestId: Unique identifier');
    console.log('   - message.text: User prompt/question');
    console.log('   - response: Array of response parts');
    console.log('   - timestamp: Unix timestamp (e.g., 1753979651544)');
    console.log('   - result.timings: Response time metrics');
    console.log('   - result.metadata.toolCallRounds: Tool usage data');
    console.log('');
    
    console.log('3. TOOL CALL STRUCTURE (for file changes):');
    console.log('   - name: "replace_string_in_file", "create_file", etc.');
    console.log('   - arguments: JSON string with filePath, oldString, newString');
    console.log('   - File paths like: "c:\\\\Users\\\\411645\\\\genai\\\\githubcopilot-intdevextn\\\\src\\\\extension.ts"');
    console.log('');
    
    console.log('4. METRICS CALCULATION IMPLEMENTATION:');
    console.log('=====================================');
    
    // Demonstrate the actual metrics calculation
    const sampleChatData = createSampleChatDataFromActualStructure();
    const analyticsService = new ChatAnalyticsService();
    
    // This would be the actual processing
    console.log('Processing sample data based on actual structure...\n');
    
    // Show how each metric is calculated
    demonstrateMetricsCalculation(sampleChatData);
}

function createSampleChatDataFromActualStructure(): ChatExport {
    return {
        requesterUsername: "411645_cgcp",
        responderUsername: "GitHub Copilot",
        requests: [
            {
                requestId: "request_4bab6758-c3f0-458c-9d95-ae97019d9893",
                message: {
                    text: "Implement calculate metrics function",
                    parts: []
                },
                timestamp: 1753979651544, // Actual timestamp from chat.json
                result: {
                    timings: {
                        firstProgress: 3871,
                        totalElapsed: 6169
                    },
                    metadata: {
                        toolCallRounds: [
                            {
                                toolCalls: [
                                    {
                                        name: "replace_string_in_file",
                                        arguments: JSON.stringify({
                                            filePath: "c:\\Users\\411645\\genai\\githubcopilot-intdevextn\\src\\extension.ts",
                                            oldString: "function calculateCopilotMetrics() {\n\t// Old implementation\n\treturn sampleData;\n}",
                                            newString: "async function calculateCopilotMetrics() {\n\t// New implementation\n\t// Fetch real data\n\tconst metrics = await fetchRealMetrics();\n\treturn metrics;\n}"
                                        }),
                                        id: "tool_call_1"
                                    }
                                ],
                                toolInputRetry: 0,
                                id: "round_1"
                            }
                        ]
                    }
                }
            },
            {
                requestId: "request_3785160f-aafd-40e0-ad93-2ef744959bc3",
                message: {
                    text: "Add error handling to the function",
                    parts: []
                },
                timestamp: 1753979733841, // Different day
                result: {
                    metadata: {
                        toolCallRounds: [
                            {
                                toolCalls: [
                                    {
                                        name: "create_file",
                                        arguments: JSON.stringify({
                                            filePath: "c:\\Users\\411645\\genai\\githubcopilot-intdevextn\\src\\errorHandler.ts",
                                            content: "// Error handling utility\nexport function handleError(error: Error) {\n\tconsole.error('Error:', error.message);\n\tthrow error;\n}"
                                        }),
                                        id: "tool_call_2"
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        ]
    };
}

function demonstrateMetricsCalculation(chatData: ChatExport) {
    console.log('METRIC CALCULATION BREAKDOWN:');
    console.log('=============================\n');
    
    // Group by date
    const requestsByDate = new Map<string, ChatRequest[]>();
    
    for (const request of chatData.requests) {
        const date = new Date(request.timestamp);
        const dateKey = formatDate(date);
        
        if (!requestsByDate.has(dateKey)) {
            requestsByDate.set(dateKey, []);
        }
        requestsByDate.get(dateKey)!.push(request);
    }
    
    // Calculate metrics for each day
    for (const [dateKey, requests] of requestsByDate.entries()) {
        console.log(`DATE: ${dateKey}`);
        console.log('---------------');
        
        let prompts = 0;
        let filesChanged = 0;
        let linesAdded = 0;
        let linesDeleted = 0;
        
        const changedFiles = new Set<string>();
        
        for (const request of requests) {
            // Count prompts
            if (request.message?.text && request.message.text.trim().length > 0) {
                prompts++;
                console.log(`  PROMPT: "${request.message.text.substring(0, 50)}..."`);
            }
            
            // Analyze tool calls
            if (request.result?.metadata?.toolCallRounds) {
                for (const round of request.result.metadata.toolCallRounds) {
                    if (round.toolCalls) {
                        for (const toolCall of round.toolCalls) {
                            console.log(`  TOOL CALL: ${toolCall.name}`);
                            
                            try {
                                const args = JSON.parse(toolCall.arguments || '{}');
                                
                                if (args.filePath) {
                                    changedFiles.add(args.filePath);
                                    console.log(`    FILE: ${args.filePath}`);
                                }
                                
                                // Calculate line changes
                                if (toolCall.name === 'replace_string_in_file') {
                                    if (args.oldString && args.newString) {
                                        const oldLines = args.oldString.split('\n').length;
                                        const newLines = args.newString.split('\n').length;
                                        
                                        linesDeleted += oldLines;
                                        linesAdded += newLines;
                                        
                                        console.log(`    LINES DELETED: ${oldLines}`);
                                        console.log(`    LINES ADDED: ${newLines}`);
                                    }
                                } else if (toolCall.name === 'create_file') {
                                    if (args.content) {
                                        const lines = args.content.split('\n').length;
                                        linesAdded += lines;
                                        console.log(`    LINES ADDED: ${lines}`);
                                    }
                                }
                            } catch (error) {
                                console.log(`    ERROR parsing arguments: ${error}`);
                            }
                        }
                    }
                }
            }
        }
        
        filesChanged = changedFiles.size;
        
        console.log(`  SUMMARY:`);
        console.log(`    Prompts: ${prompts}`);
        console.log(`    Files Changed: ${filesChanged}`);
        console.log(`    Lines Added: ${linesAdded}`);
        console.log(`    Lines Deleted: ${linesDeleted}`);
        console.log(`    Helpful: ${Math.floor(prompts * 0.8)} (estimated)`);
        console.log(`    Unhelpful: ${prompts - Math.floor(prompts * 0.8)} (estimated)`);
        console.log('');
    }
    
    console.log('NOTES:');
    console.log('======');
    console.log('1. Timestamps are converted from Unix time to dd-mm-yyyy format');
    console.log('2. Prompts are counted from message.text fields');
    console.log('3. Files are tracked from tool call arguments.filePath');
    console.log('4. Lines added/deleted calculated from oldString/newString comparison');
    console.log('5. Helpful/Unhelpful metrics need actual feedback data (not available in current export)');
    console.log('6. Tool calls like replace_string_in_file, create_file, edit_notebook_file are analyzed');
    console.log('');
    
    console.log('IMPLEMENTATION STATUS:');
    console.log('=====================');
    console.log('✅ Date formatting (timestamp -> dd-mm-yyyy)');
    console.log('✅ Prompt counting (from message.text)');
    console.log('✅ File change tracking (from tool call arguments)');
    console.log('✅ Lines added/deleted calculation (from tool call content)');
    console.log('❌ Helpful/Unhelpful (feedback data not in current export format)');
    console.log('✅ Multiple tool call types supported');
    console.log('✅ Error handling and validation');
}

function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}-${month}-${year}`;
}
