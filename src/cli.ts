#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function printUsage() {
    console.log(`
🔧 Scrapedo MCP Server CLI

Usage: npx scrapedo-mcp-server [command]

Commands:
  start              Start the MCP server
  init               Initialize Claude Desktop configuration
  config             Show current configuration
  help               Show this help message

Environment Variables:
  SCRAPEDO_API_KEY   Your Scrapedo API key (required)
  LOG_LEVEL          Logging level (DEBUG, INFO, WARN, ERROR)

Examples:
  # Start the server
  SCRAPEDO_API_KEY=your_key npx scrapedo-mcp-server start
  
  # Initialize Claude Desktop config
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

function initClaudeConfig() {
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
        
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        readline.question('\nDo you want to update the configuration? (y/N): ', (answer: string) => {
            if (answer.toLowerCase() === 'y') {
                updateConfig(config, configPath);
            } else {
                console.log('\n✨ Configuration unchanged');
                process.exit(0);
            }
            readline.close();
        });
    } else {
        updateConfig(config, configPath);
    }
}

function updateConfig(config: any, configPath: string) {
    const serverPath = join(__dirname, 'index.js');
    
    // Add scrapedo server configuration
    config.mcpServers.scrapedo = {
        command: 'node',
        args: [serverPath],
        env: {
            SCRAPEDO_API_KEY: process.env.SCRAPEDO_API_KEY || 'your_api_key_here',
            LOG_LEVEL: process.env.LOG_LEVEL || 'INFO'
        }
    };
    
    // Write config file
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log('\n✅ Claude Desktop configuration updated successfully!');
    console.log(`\n📁 Configuration file: ${configPath}`);
    console.log('\n⚠️  Important: Please update the SCRAPEDO_API_KEY in the configuration file');
    console.log('    You can get your API key from: https://scrape.do');
    console.log('\n🔄 Restart Claude Desktop for the changes to take effect');
}

function showConfig() {
    const configPath = getClaudeConfigPath();
    
    if (!existsSync(configPath)) {
        console.log('❌ Claude Desktop configuration not found');
        console.log('   Run "npx scrapedo-mcp-server init" to create it');
        return;
    }
    
    try {
        const content = readFileSync(configPath, 'utf-8');
        const config = JSON.parse(content);
        
        if (config.mcpServers?.scrapedo) {
            console.log('📋 Scrapedo MCP Server Configuration:\n');
            console.log(JSON.stringify(config.mcpServers.scrapedo, null, 2));
            console.log(`\n📁 Config location: ${configPath}`);
        } else {
            console.log('❌ Scrapedo MCP server not configured');
            console.log('   Run "npx scrapedo-mcp-server init" to configure it');
        }
    } catch (error) {
        console.error('❌ Error reading configuration:', error);
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
const command = process.argv[2];

switch (command) {
    case 'start':
        startServer();
        break;
    case 'init':
        initClaudeConfig();
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