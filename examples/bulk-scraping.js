import { ScrapedoClient } from '../dist/scrapedo-client.js';

const API_KEY = process.env.SCRAPEDO_API_KEY || 'b1bc959fc23b4681a7328f78a081024e38c1e8cbddc';
const client = new ScrapedoClient(API_KEY);

async function bulkScrapingExample() {
  try {
    console.log('Starting bulk scraping of multiple URLs...\n');

    const urls = [
      'https://example.com',
      'https://httpbin.org/status/200',
      'https://httpbin.org/delay/2',
      'https://httpbin.org/json',
      'https://httpbin.org/html',
    ];

    const bulkResult = await client.scrapeBulk({
      urls,
      render_js: false,
      concurrent: 3,
      timeout: 10000,
      proxy_type: 'datacenter',
    });

    console.log(`Bulk task created: ${bulkResult.task_id}`);
    console.log(`Total tasks: ${bulkResult.tasks.length}\n`);

    for (const task of bulkResult.tasks) {
      console.log(`Task ${task.id}:`);
      console.log(`  URL: ${task.url}`);
      console.log(`  Status: ${task.status}`);
      console.log(`  Created: ${task.created_at}`);
    }

    console.log('\nWaiting for tasks to complete...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\nChecking task statuses:');
    const tasksStatus = await client.listTasks({
      status: 'completed',
      limit: 10,
    });

    for (const task of tasksStatus.tasks) {
      console.log(`Task ${task.id}: ${task.status} - ${task.url}`);
      if (task.result) {
        console.log(`  Status Code: ${task.result.status_code}`);
        console.log(`  Execution Time: ${task.result.execution_time}ms`);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

bulkScrapingExample();