const path = require('path');

// Clock controller for handling clock/timer related requests
class ClockController {
    // Render the clock page
    getClockPage(req, res) {
        res.sendFile(path.join(__dirname, '../views/clock.html'));
    }

    // API endpoint to get current server time
    getCurrentTime(req, res) {
        try {
            const now = new Date();
            res.json({
                success: true,
                timestamp: now.getTime(),
                formatted: now.toISOString(),
                localTime: now.toLocaleString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error getting current time',
                error: error.message
            });
        }
    }

    // API endpoint to get time in different timezones
    getTimeInTimezone(req, res) {
        try {
            const { timezone } = req.params;
            const now = new Date();
            const timeInTimezone = new Date(now.toLocaleString("en-US", {timeZone: timezone}));
            res.json({
                success: true,
                timezone: timezone,
                timestamp: timeInTimezone.getTime(),
                formatted: timeInTimezone.toISOString(),
                localTime: timeInTimezone.toLocaleString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error getting time for timezone',
                error: error.message
            });
        }
    }
}

module.exports = new ClockController();
