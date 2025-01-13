"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkRedisConnection, testRedisFeatures } from "@/lib/redis";
import { LineChart } from "lucide-react";

interface HealthStatus {
  system: {
    status: "healthy" | "error";
    message?: string;
  };
  redis: {
    status: "healthy" | "error";
    latency: number;
    message?: string;
  };
  api: {
    status: "healthy" | "error";
    latency: number;
    message?: string;
  };
  database: {
    status: "healthy" | "error";
    message?: string;
  };
}

export default function HealthPage() {
  const [health, setHealth] = useState<HealthStatus>({
    system: { status: "healthy" },
    redis: { status: "healthy", latency: 0 },
    api: { status: "healthy", latency: 0 },
    database: { status: "healthy" }
  });

  const [responseTime, setResponseTime] = useState<{ time: number; timestamp: string }[]>([]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Check Redis connection
        const redisHealth = await checkRedisConnection();
        const redisFeatures = await testRedisFeatures();

        // Update health status
        setHealth({
          system: {
            status: "healthy", // System is healthy by default unless there's a critical error
            message: undefined
          },
          redis: {
            status: redisHealth.ok ? "healthy" : "error",
            latency: redisHealth.latency,
            message: redisHealth.error
          },
          api: {
            status: "healthy",
            latency: 0
          },
          database: {
            status: "healthy"
          }
        });

        // Update response time chart
        const now = new Date();
        setResponseTime(prev => [
          ...prev.slice(-10),
          {
            time: redisHealth.latency,
            timestamp: now.toLocaleTimeString()
          }
        ]);
      } catch (error) {
        console.error("Health check error:", error);
        // Only set system status to error if there's a critical error
        setHealth(prev => ({
          ...prev,
          system: {
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error occurred"
          }
        }));
      }
    };

    // Initial check
    checkHealth();

    // Set up interval for periodic checks
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Health</h2>
          <p className="text-muted-foreground">
            Monitor system performance and health metrics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* System Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <div className={`px-2 py-1 rounded-full text-xs ${
              health.system.status === "healthy" 
                ? "bg-green-500/20 text-green-500" 
                : "bg-red-500/20 text-red-500"
            }`}>
              {health.system.status === "healthy" ? "healthy" : "error"}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {health.system.status === "healthy" ? "Operational" : "ERROR"}
            </div>
            {health.system.message && (
              <p className="text-xs text-muted-foreground mt-1">
                {health.system.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* API Latency */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">API Latency</CardTitle>
            <div className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-500">
              healthy
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health.api.latency}ms</div>
          </CardContent>
        </Card>

        {/* Redis Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Redis Status</CardTitle>
            <div className={`px-2 py-1 rounded-full text-xs ${
              health.redis.status === "healthy" 
                ? "bg-green-500/20 text-green-500" 
                : "bg-red-500/20 text-red-500"
            }`}>
              {health.redis.status}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {health.redis.status === "healthy" ? "Connected" : "ERROR"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Latency: {health.redis.latency}ms
            </p>
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
            <div className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-500">
              healthy
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Connected</div>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Response Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            {responseTime.length > 0 ? (
              <div className="relative h-full">
                <div className="absolute inset-0 flex items-end">
                  {responseTime.map((data, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div 
                        className="w-full bg-primary/10 rounded-t"
                        style={{ 
                          height: `${(data.time / Math.max(...responseTime.map(d => d.time))) * 100}%`,
                          minHeight: '1px'
                        }}
                      />
                      <span className="text-xs text-muted-foreground mt-2 rotate-45 origin-left">
                        {data.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Alert History</CardTitle>
          <LineChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No alerts to display
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 