const cron = require('node-cron');
const delayedCreditService = require('./delayedCreditService');

class CronService {
  constructor() {
    this.jobs = {};
  }

  /**
   * Initialize all cron jobs
   */
  init() {
    this.scheduleMonthlyCreditProcessing();
    console.log('Cron service initialized');
  }

  /**
   * Schedule the monthly delayed credit processing
   * Runs every month on the 7th at 12:00 AM (midnight)
   * Cron expression: "0 0 7 * *" (second minute hour day-of-month month)
   */
  scheduleMonthlyCreditProcessing() {
    const jobName = 'monthly-delayed-credits';

    // Stop existing job if it exists
    if (this.jobs[jobName]) {
      this.jobs[jobName].stop();
    }

    // Schedule new job: runs at 12:00 AM on the 7th of every month
    this.jobs[jobName] = cron.schedule('0 0 7 * *', async () => {
      console.log('🕛 Starting monthly delayed credit processing...');

      try {
        const result = await delayedCreditService.processDelayedCredits();
        console.log(`✅ Monthly delayed credit processing completed. Processed ${result.processed} transactions.`);
      } catch (error) {
        console.error('❌ Error in monthly delayed credit processing:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata" // Adjust timezone as needed
    });

    console.log('📅 Monthly delayed credit processing scheduled for 7th of every month at 12:00 AM');
  }

  /**
   * Manually trigger delayed credit processing (for testing)
   */
  async triggerDelayedCreditProcessing() {
    console.log('🔧 Manually triggering delayed credit processing...');

    try {
      const result = await delayedCreditService.processDelayedCredits();
      console.log(`✅ Manual delayed credit processing completed. Processed ${result.processed} transactions.`);
      return result;
    } catch (error) {
      console.error('❌ Error in manual delayed credit processing:', error);
      throw error;
    }
  }

  /**
   * Get status of all cron jobs
   */
  getJobStatus() {
    const status = {};

    for (const [jobName, job] of Object.entries(this.jobs)) {
      status[jobName] = {
        running: job.running,
        scheduled: job.scheduled,
        nextRun: job.nextRun ? job.nextRun.toISOString() : null
      };
    }

    return status;
  }

  /**
   * Stop all cron jobs
   */
  stopAllJobs() {
    for (const [jobName, job] of Object.entries(this.jobs)) {
      job.stop();
      console.log(`🛑 Stopped cron job: ${jobName}`);
    }
  }

  /**
   * Start all cron jobs
   */
  startAllJobs() {
    for (const [jobName, job] of Object.entries(this.jobs)) {
      job.start();
      console.log(`▶️ Started cron job: ${jobName}`);
    }
  }
}

// Create singleton instance
const cronService = new CronService();

module.exports = cronService;
