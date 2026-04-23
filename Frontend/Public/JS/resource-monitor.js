// ===================================
// CLOUD RESOURCE MONITOR
// ===================================

class ResourceMonitor {
    constructor() {
        this.updateInterval = 2000; // Update every 2 seconds
        this.resourceHistory = {
            cpu: [],
            memory: [],
            disk: []
        };
        this.maxHistoryLength = 60;
        this.isMonitoring = false;
        this.init();
    }

    init() {
        // Start monitoring
        this.startMonitoring();
        
        // Add event listeners for cloud status
        document.addEventListener('online', () => this.updateCloudStatus(true));
        document.addEventListener('offline', () => this.updateCloudStatus(false));
        
        // Initial cloud status
        this.updateCloudStatus(navigator.onLine);
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        
        // Update every interval
        this.monitoringIntervalId = setInterval(() => {
            this.updateResourceMetrics();
        }, this.updateInterval);

        // Initial update
        this.updateResourceMetrics();
    }

    stopMonitoring() {
        if (this.monitoringIntervalId) {
            clearInterval(this.monitoringIntervalId);
            this.isMonitoring = false;
        }
    }

    updateResourceMetrics() {
        // CPU Usage (simulated with performance API)
        const cpuUsage = this.estimateCPUUsage();
        
        // Memory Usage
        const memoryUsage = this.getMemoryUsage();
        
        // Disk Usage (simulated)
        const diskUsage = this.estimateDiskUsage();

        // Update UI
        this.updateUI(cpuUsage, memoryUsage, diskUsage);
        
        // Store in history
        this.recordHistory(cpuUsage, memoryUsage, diskUsage);
    }

    estimateCPUUsage() {
        // Estimate CPU usage based on performance metrics
        if (performance.measure) {
            try {
                // Use performance API to estimate CPU usage
                const measures = performance.getEntriesByType('measure');
                let totalTime = 0;
                
                measures.forEach(measure => {
                    totalTime += measure.duration;
                });

                // Normalize to percentage (0-100)
                const cpuUsage = Math.min(100, Math.round((totalTime / 1000) * 10));
                return cpuUsage || Math.floor(Math.random() * 45) + 10; // Random 10-55% if no data
            } catch (e) {
                return Math.floor(Math.random() * 45) + 10;
            }
        }
        return Math.floor(Math.random() * 45) + 10;
    }

    getMemoryUsage() {
        if (performance.memory) {
            const used = Math.round(performance.memory.usedJSHeapSize / (1024 * 1024));
            const limit = Math.round(performance.memory.jsHeapSizeLimit / (1024 * 1024));
            const percentage = Math.round((used / limit) * 100);
            
            return {
                used: used,
                limit: limit,
                percentage: percentage
            };
        }

        // Fallback: simulate memory usage
        const used = Math.floor(Math.random() * 200) + 100;
        return {
            used: used,
            limit: 512,
            percentage: Math.round((used / 512) * 100)
        };
    }

    estimateDiskUsage() {
        // Use Storage API if available
        if (navigator.storage && navigator.storage.estimate) {
            navigator.storage.estimate().then(estimate => {
                const used = Math.round(estimate.usage / (1024 * 1024));
                const quota = Math.round(estimate.quota / (1024 * 1024));
                const percentage = Math.round((estimate.usage / estimate.quota) * 100);
                
                this.lastDiskUsage = {
                    used: used,
                    quota: quota,
                    percentage: percentage
                };
            }).catch(err => {
                console.warn('Storage estimate failed:', err);
            });
        }

        // Return last known value or default
        return this.lastDiskUsage || {
            used: Math.floor(Math.random() * 50) + 20,
            quota: 100,
            percentage: Math.floor(Math.random() * 40) + 20
        };
    }

    updateUI(cpuUsage, memoryUsage, diskUsage) {
        // Update CPU
        const cpuElement = document.getElementById('cpuUsage');
        if (cpuElement) {
            cpuElement.textContent = cpuUsage + '%';
            this.updateElementColor(cpuElement, cpuUsage);
        }

        // Update Memory
        const memoryElement = document.getElementById('memoryUsage');
        if (memoryElement) {
            memoryElement.textContent = memoryUsage.used + ' MB';
            this.updateElementColor(memoryElement, memoryUsage.percentage);
        }

        // Update Disk
        const diskElement = document.getElementById('diskUsage');
        if (diskElement) {
            diskElement.textContent = diskUsage.used + ' MB';
            this.updateElementColor(diskElement, diskUsage.percentage);
        }
    }

    updateElementColor(element, percentage) {
        // Change color based on usage percentage
        let color;
        
        if (percentage < 30) {
            color = '#4ade80'; // Green - Good
        } else if (percentage < 60) {
            color = '#fbbf24'; // Yellow - Medium
        } else if (percentage < 80) {
            color = '#f97316'; // Orange - High
        } else {
            color = '#ff6b6b'; // Red - Critical
        }

        element.style.color = color;
        element.parentElement.style.setProperty('--indicator-color', color);
    }

    recordHistory(cpu, memory, disk) {
        this.resourceHistory.cpu.push(cpu);
        this.resourceHistory.memory.push(memory.percentage);
        this.resourceHistory.disk.push(disk.percentage);

        // Keep history at max length
        Object.keys(this.resourceHistory).forEach(key => {
            if (this.resourceHistory[key].length > this.maxHistoryLength) {
                this.resourceHistory[key].shift();
            }
        });
    }

    updateCloudStatus(isOnline) {
        const cloudStatus = document.getElementById('cloudStatus');
        if (cloudStatus) {
            if (isOnline) {
                cloudStatus.textContent = 'Connected';
                cloudStatus.style.color = '#4ade80';
                cloudStatus.parentElement.classList.add('online');
                cloudStatus.parentElement.classList.remove('offline');
            } else {
                cloudStatus.textContent = 'Offline';
                cloudStatus.style.color = '#ff6b6b';
                cloudStatus.parentElement.classList.add('offline');
                cloudStatus.parentElement.classList.remove('online');
            }
        }
    }

    // Get resource statistics
    getStatistics() {
        return {
            cpu: {
                current: this.resourceHistory.cpu[this.resourceHistory.cpu.length - 1],
                average: this.calculateAverage(this.resourceHistory.cpu),
                max: Math.max(...this.resourceHistory.cpu),
                min: Math.min(...this.resourceHistory.cpu)
            },
            memory: {
                current: this.resourceHistory.memory[this.resourceHistory.memory.length - 1],
                average: this.calculateAverage(this.resourceHistory.memory),
                max: Math.max(...this.resourceHistory.memory),
                min: Math.min(...this.resourceHistory.memory)
            },
            disk: {
                current: this.resourceHistory.disk[this.resourceHistory.disk.length - 1],
                average: this.calculateAverage(this.resourceHistory.disk),
                max: Math.max(...this.resourceHistory.disk),
                min: Math.min(...this.resourceHistory.disk)
            }
        };
    }

    calculateAverage(arr) {
        if (arr.length === 0) return 0;
        return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    }

    // Create visual chart (optional enhancement)
    createResourceChart() {
        const chartData = {
            cpu: this.resourceHistory.cpu,
            memory: this.resourceHistory.memory,
            disk: this.resourceHistory.disk
        };

        return chartData;
    }

    // Get resource health status
    getHealthStatus() {
        const stats = this.getStatistics();
        
        let status = 'Healthy';
        let color = '#4ade80';

        if (stats.cpu.current > 80 || stats.memory.current > 80 || stats.disk.current > 80) {
            status = 'Critical';
            color = '#ff6b6b';
        } else if (stats.cpu.current > 60 || stats.memory.current > 60 || stats.disk.current > 60) {
            status = 'Warning';
            color = '#fbbf24';
        }

        return { status, color };
    }

    // Export metrics
    exportMetrics() {
        return {
            timestamp: new Date().toISOString(),
            resources: this.getStatistics(),
            health: this.getHealthStatus()
        };
    }
}

// Initialize resource monitor
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.resourceMonitor = new ResourceMonitor();
    });
} else {
    window.resourceMonitor = new ResourceMonitor();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResourceMonitor;
}
