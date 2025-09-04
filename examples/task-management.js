import { ScrapedoClient } from '../dist/scrapedo-client.js';

const API_KEY = process.env.SCRAPEDO_API_KEY || 'b1bc959fc23b4681a7328f78a081024e38c1e8cbddc';
const client = new ScrapedoClient(API_KEY);

async function taskManagementExample() {
  try {
    console.log('Task Management Example\n');
    console.log('======================\n');

    console.log('1. Creating a scraping task...');
    const scrapeResult = await client.scrape({
      url: 'https://httpbin.org/delay/3',
      render_js: false,
    });
    
    const taskId = scrapeResult.task_id;
    console.log(`Task created with ID: ${taskId}\n`);

    console.log('2. Getting task details...');
    const taskDetails = await client.getTask(taskId);
    console.log(`Task Status: ${taskDetails.status}`);
    console.log(`URL: ${taskDetails.url}`);
    console.log(`Created: ${taskDetails.created_at}`);
    console.log(`Updated: ${taskDetails.updated_at}\n`);

    console.log('3. Listing all tasks...');
    const allTasks = await client.listTasks({
      limit: 5,
    });
    console.log(`Total tasks: ${allTasks.total}`);
    console.log('Recent tasks:');
    for (const task of allTasks.tasks) {
      console.log(`  - ${task.id}: ${task.status} (${task.url})`);
    }
    console.log();

    console.log('4. Filtering tasks by status...');
    const completedTasks = await client.listTasks({
      status: 'completed',
      limit: 3,
    });
    console.log(`Completed tasks: ${completedTasks.total}`);
    for (const task of completedTasks.tasks) {
      console.log(`  - ${task.id}: ${task.result?.status_code || 'N/A'} (${task.url})`);
    }
    console.log();

    console.log('5. Checking failed tasks...');
    const failedTasks = await client.listTasks({
      status: 'failed',
      limit: 3,
    });
    console.log(`Failed tasks: ${failedTasks.total}`);
    for (const task of failedTasks.tasks) {
      console.log(`  - ${task.id}: ${task.error || 'Unknown error'}`);
    }
    console.log();

    if (taskId) {
      console.log('6. Cleaning up - deleting test task...');
      const deleteResult = await client.deleteTask(taskId);
      console.log(`Delete result: ${deleteResult.message}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

taskManagementExample();