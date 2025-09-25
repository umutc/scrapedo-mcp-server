#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function printUsage() {
    console.log(`
🔧 Scrapedo MCP Server CLI

Usage: npx scrapedo-mcp-server [command]

Commands:
  start              Start the MCP server
  init               Initialize Claude Desktop, Codex, and Gemini configuration
  config             Show current configuration
  help               Show this help message

Environment Variables:
  SCRAPEDO_API_KEY   Your Scrapedo API key (required)
  LOG_LEVEL          Logging level (DEBUG, INFO, WARN, ERROR)

Examples:
  # Start the server
  SCRAPEDO_API_KEY=your_key npx scrapedo-mcp-server start
  
  # Initialize all platform configs (Claude Desktop, Codex, Gemini)
  npx scrapedo-mcp-server init
  
  # Show configuration
  npx scrapedo-mcp-server config
`);
}

function getClaudeConfigPath() {
    const platform = process.platform;

    if (platform === 'darwin') {
        // macOS
        return join(homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    } else if (platform === 'win32') {
        // Windows
        return join(process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json');
    } else {
        // Linux
        return join(homedir(), '.config', 'Claude', 'claude_desktop_config.json');
    }
}

function getCodexConfigPath() {
    return join(homedir(), '.codex', 'config.toml');
}

function getGeminiConfigPath() {
    return join(homedir(), '.gemini', 'settings.json');
}

async function initGeminiConfig() {
    const configPath = getGeminiConfigPath();
    const configDir = dirname(configPath);

    // Ensure config directory exists
    if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
    }

    let config: any = {};

    // Read existing config if it exists
    if (existsSync(configPath)) {
        try {
            const content = readFileSync(configPath, 'utf-8');
            config = JSON.parse(content);
            console.log('📖 Found existing Gemini configuration');
        } catch (error) {
            console.error('⚠️  Error reading existing Gemini config, creating new one');
            config = {};
        }
    }

    // Initialize mcpServers if not present
    if (!config.mcpServers) {
        config.mcpServers = {};
    }

    // Check if already configured
    if (config.mcpServers.scrapedo) {
        console.log('✅ Scrapedo MCP server is already configured in Gemini!');
        console.log('\nCurrent configuration:');
        console.log(JSON.stringify(config.mcpServers.scrapedo, null, 2));

        const readline = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise<void>((resolve) => {
            readline.question('\nDo you want to update the Gemini configuration? (y/N): ', async (answer: string) => {
                if (answer.toLowerCase() === 'y') {
                    await updateGeminiConfig(config, configPath);
                } else {
                    console.log('\n✨ Gemini configuration unchanged');
                }
                readline.close();
                resolve();
            });
        });
    } else {
        await updateGeminiConfig(config, configPath);
    }
}

async function updateGeminiConfig(config: any, configPath: string) {
    const serverPath = join(__dirname, 'index.js');

    let apiKey = process.env.SCRAPEDO_API_KEY;

    if (!apiKey) {
        const readline = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise<void>((resolve) => {
            readline.question('\n🔑 Enter your Scrapedo API key (get it from https://scrape.do): ', (key: string) => {
                apiKey = key.trim();
                readline.close();

                if (!apiKey) {
                    console.log('❌ API key is required for configuration');
                    resolve();
                    return;
                }

                writeGeminiConfig(config, configPath, serverPath, apiKey);
                resolve();
            });
        });
    } else {
        writeGeminiConfig(config, configPath, serverPath, apiKey);
    }
}

function writeGeminiConfig(config: any, configPath: string, serverPath: string, apiKey: string) {
    // Add scrapedo server configuration (similar to Claude Desktop format)
    config.mcpServers.scrapedo = {
        command: 'node',
        args: [serverPath],
        env: {
            SCRAPEDO_API_KEY: apiKey,
            LOG_LEVEL: process.env.LOG_LEVEL || 'INFO'
        }
    };

    // Write config file
    writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log('\n✅ Gemini configuration updated successfully!');
    console.log(`\n📁 Configuration file: ${configPath}`);
    console.log('\n🔄 Restart Gemini to load the new configuration');
}

async function initClaudeConfig() {
    const configPath = getClaudeConfigPath();
    const configDir = dirname(configPath);
    
    // Ensure config directory exists
    if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
    }
    
    let config: any = {};
    
    // Read existing config if it exists
    if (existsSync(configPath)) {
        try {
            const content = readFileSync(configPath, 'utf-8');
            config = JSON.parse(content);
            console.log('📖 Found existing Claude Desktop configuration');
        } catch (error) {
            console.error('⚠️  Error reading existing config, creating new one');
            config = {};
        }
    }
    
    // Initialize mcpServers if not present
    if (!config.mcpServers) {
        config.mcpServers = {};
    }
    
    // Check if already configured
    if (config.mcpServers.scrapedo) {
        console.log('✅ Scrapedo MCP server is already configured!');
        console.log('\nCurrent configuration:');
        console.log(JSON.stringify(config.mcpServers.scrapedo, null, 2));
        
        const readline = createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        readline.question('\nDo you want to update the configuration? (y/N): ', async (answer: string) => {
            if (answer.toLowerCase() === 'y') {
                await updateConfig(config, configPath);
            } else {
                console.log('\n✨ Configuration unchanged');
                process.exit(0);
            }
            readline.close();
        });
    } else {
        await updateConfig(config, configPath);
    }
}

function updateConfig(config: any, configPath: string) {
    const serverPath = join(__dirname, 'index.js');

    let apiKey = process.env.SCRAPEDO_API_KEY;

    if (!apiKey) {
        const readline = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise<void>((resolve) => {
            readline.question('\n🔑 Enter your Scrapedo API key (get it from https://scrape.do): ', (key: string) => {
                apiKey = key.trim();
                readline.close();

                if (!apiKey) {
                    console.log('❌ API key is required for configuration');
                    resolve();
                    return;
                }

                writeClaudeConfig(config, configPath, serverPath, apiKey);
                resolve();
            });
        });
    } else {
        writeClaudeConfig(config, configPath, serverPath, apiKey);
    }
}

function writeClaudeConfig(config: any, configPath: string, serverPath: string, apiKey: string) {
    // Add scrapedo server configuration
    config.mcpServers.scrapedo = {
        command: 'node',
        args: [serverPath],
        env: {
            SCRAPEDO_API_KEY: apiKey,
            LOG_LEVEL: process.env.LOG_LEVEL || 'INFO'
        }
    };

    // Write config file
    writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log('\n✅ Claude Desktop configuration updated successfully!');
    console.log(`\n📁 Configuration file: ${configPath}`);
    console.log('\n🔄 Restart Claude Desktop for the changes to take effect');
}

function initCodexConfig() {
    const configPath = getCodexConfigPath();
    const configDir = dirname(configPath);

    // Ensure config directory exists
    if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
    }

    let content = '';
    let hasScrapedoConfig = false;

    // Read existing config if it exists
    if (existsSync(configPath)) {
        try {
            content = readFileSync(configPath, 'utf-8');
            hasScrapedoConfig = content.includes('[mcp_servers.scrapedo]');
            console.log('📖 Found existing Codex configuration');
        } catch (error) {
            console.error('⚠️  Error reading existing Codex config, creating new one');
            content = '';
        }
    }

    if (hasScrapedoConfig) {
        console.log('✅ Scrapedo MCP server is already configured in Codex!');
        return;
    }

    // Get API key from user
    let apiKey = process.env.SCRAPEDO_API_KEY;

    if (!apiKey) {
        const readline = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise<void>((resolve) => {
            readline.question('\n🔑 Enter your Scrapedo API key (get it from https://scrape.do): ', (key: string) => {
                apiKey = key.trim();
                readline.close();

                if (!apiKey) {
                    console.log('❌ API key is required for configuration');
                    resolve();
                    return;
                }

                writeCodexConfig(content, configPath, apiKey);
                resolve();
            });
        });
    } else {
        writeCodexConfig(content, configPath, apiKey);
    }
}

function writeCodexConfig(content: string, configPath: string, apiKey: string) {
    // Add Scrapedo configuration to the TOML file
    const scrapedoConfig = `

[mcp_servers.scrapedo]
command = "npx"
args = ["scrapedo-mcp-server", "start"]
env = { "SCRAPEDO_API_KEY" = "${apiKey}" }
startup_timeout_sec = 10
tool_timeout_sec = 60
`;

    content += scrapedoConfig;

    try {
        writeFileSync(configPath, content);
        console.log('✅ Successfully configured Scrapedo MCP server for Codex!');
        console.log(`📁 Config location: ${configPath}`);
        console.log('\n🔄 Restart Codex to load the new configuration');
    } catch (error) {
        console.error('❌ Error writing Codex configuration:', error);
    }
}

function showConfig() {
    const claudeConfigPath = getClaudeConfigPath();
    const codexConfigPath = getCodexConfigPath();
    const geminiConfigPath = getGeminiConfigPath();

    console.log('📋 Scrapedo MCP Server Configuration Status:\n');

    // Check Claude Desktop
    let claudeConfigured = false;
    console.log('🖥️  Claude Desktop:');
    if (existsSync(claudeConfigPath)) {
        try {
            const content = readFileSync(claudeConfigPath, 'utf-8');
            const config = JSON.parse(content);

            if (config.mcpServers?.scrapedo) {
                console.log('   ✅ Configured');
                console.log(`   📁 ${claudeConfigPath}`);
                claudeConfigured = true;
            } else {
                console.log('   ❌ MCP server not configured in existing config');
            }
        } catch (error) {
            console.log('   ❌ Error reading configuration file');
        }
    } else {
        console.log('   ❌ Configuration file not found');
    }

    console.log('');

    // Check Codex
    let codexConfigured = false;
    console.log('⚡ Codex:');
    if (existsSync(codexConfigPath)) {
        try {
            const content = readFileSync(codexConfigPath, 'utf-8');
            if (content.includes('[mcp_servers.scrapedo]')) {
                console.log('   ✅ Configured');
                console.log(`   📁 ${codexConfigPath}`);
                codexConfigured = true;
            } else {
                console.log('   ❌ MCP server not configured in existing config');
            }
        } catch (error) {
            console.log('   ❌ Error reading configuration file');
        }
    } else {
        console.log('   ❌ Configuration file not found');
    }

    console.log('');

    // Check Gemini
    let geminiConfigured = false;
    console.log('🧠 Gemini:');
    if (existsSync(geminiConfigPath)) {
        try {
            const content = readFileSync(geminiConfigPath, 'utf-8');
            const config = JSON.parse(content);

            if (config.mcpServers?.scrapedo) {
                console.log('   ✅ Configured');
                console.log(`   📁 ${geminiConfigPath}`);
                geminiConfigured = true;
            } else {
                console.log('   ❌ MCP server not configured in existing config');
            }
        } catch (error) {
            console.log('   ❌ Error reading configuration file');
        }
    } else {
        console.log('   ❌ Configuration file not found');
    }

    console.log('');

    const configuredCount = [claudeConfigured, codexConfigured, geminiConfigured].filter(Boolean).length;

    if (configuredCount === 0) {
        console.log('💡 Run "npx scrapedo-mcp-server init" to configure all platforms');
    } else if (configuredCount === 3) {
        console.log('🎉 All platforms are configured!');
        console.log('💡 Remember to restart the applications to load changes');
    } else {
        const missing = [];
        if (!claudeConfigured) missing.push('Claude Desktop');
        if (!codexConfigured) missing.push('Codex');
        if (!geminiConfigured) missing.push('Gemini');
        console.log(`💡 Run "npx scrapedo-mcp-server init" to configure: ${missing.join(', ')}`);
    }
}

function startServer() {
    if (!process.env.SCRAPEDO_API_KEY) {
        console.error('❌ Error: SCRAPEDO_API_KEY environment variable is required');
        console.log('\n💡 Set your API key:');
        console.log('   export SCRAPEDO_API_KEY="your_api_key_here"');
        console.log('\n📝 Get your API key from: https://scrape.do');
        process.exit(1);
    }
    
    const serverPath = join(__dirname, 'index.js');
    
    console.log('🚀 Starting Scrapedo MCP Server...');
    console.log(`📍 Server path: ${serverPath}`);
    console.log(`🔑 API Key: ${process.env.SCRAPEDO_API_KEY.substring(0, 10)}...`);
    console.log(`📝 Log Level: ${process.env.LOG_LEVEL || 'INFO'}\n`);
    
    const child = spawn('node', [serverPath], {
        stdio: 'inherit',
        env: process.env
    });
    
    child.on('error', (error) => {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    });
    
    child.on('exit', (code) => {
        if (code !== 0) {
            console.error(`❌ Server exited with code ${code}`);
            process.exit(code || 1);
        }
    });
}

// Main CLI logic
async function runCli() {
    const command = process.argv[2];

    switch (command) {
        case 'start':
            startServer();
            break;
        case 'init':
            console.log('🚀 Initializing Scrapedo MCP Server for Claude Desktop, Codex, and Gemini...\n');

            console.log('⚙️  Configuring Claude Desktop...');
            await initClaudeConfig();

            console.log('\n⚙️  Configuring Codex...');
            await initCodexConfig();

            console.log('\n⚙️  Configuring Gemini...');
            await initGeminiConfig();

            console.log('\n🎉 Configuration complete! All platforms are now configured.');
            break;
        case 'config':
            showConfig();
            break;
        case 'help':
        case '--help':
        case '-h':
            printUsage();
            break;
        default:
            if (command) {
                console.error(`❌ Unknown command: ${command}\n`);
            }
            printUsage();
            process.exit(command ? 1 : 0);
    }
}

runCli().catch(console.error);