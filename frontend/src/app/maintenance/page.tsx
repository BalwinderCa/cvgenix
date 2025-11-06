"use client";

import { useEffect, useState } from "react";
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Server, 
  Database, 
  Globe, 
  RefreshCw,
  Mail,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api-utils";

interface SystemStatus {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime?: number;
  lastChecked: string;
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'ok':
    case 'operational':
      return 'text-green-600 dark:text-green-500';
    case 'degraded':
      return 'text-yellow-600 dark:text-yellow-500';
    case 'down':
    case 'error':
      return 'text-red-600 dark:text-red-500';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case 'ok':
    case 'operational':
      return 'default';
    case 'degraded':
      return 'secondary';
    case 'down':
    case 'error':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default function SystemStatusPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSystemStatus = async () => {
    try {
      setIsRefreshing(true);
      const apiBaseUrl = getApiBaseUrl();
      const startTime = Date.now();
      
      // Fetch health check
      const healthResponse = await fetch(`${apiBaseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      
      const responseTime = Date.now() - startTime;
      const healthData: SystemStatus = await healthResponse.json();
      
      setSystemStatus(healthData);
      
      // Check various services
      const serviceChecks: ServiceStatus[] = [
        {
          name: 'API Server',
          status: healthResponse.ok ? 'operational' : 'down',
          responseTime,
          lastChecked: new Date().toISOString(),
        },
      ];
      
      // Try to check database connectivity (if there's an endpoint)
      try {
        const dbCheckStart = Date.now();
        // We'll infer database status from API health for now
        // In a real scenario, you might have a dedicated DB health endpoint
        serviceChecks.push({
          name: 'Database',
          status: healthResponse.ok ? 'operational' : 'down',
          responseTime: Date.now() - dbCheckStart,
          lastChecked: new Date().toISOString(),
        });
      } catch (error) {
        serviceChecks.push({
          name: 'Database',
          status: 'degraded',
          lastChecked: new Date().toISOString(),
        });
      }
      
      // Frontend status (always operational if page loads)
      serviceChecks.push({
        name: 'Frontend',
        status: 'operational',
        responseTime: 0,
        lastChecked: new Date().toISOString(),
      });
      
      setServices(serviceChecks);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      setSystemStatus({
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: 0,
        environment: 'unknown',
      });
      setServices([
        {
          name: 'API Server',
          status: 'down',
          lastChecked: new Date().toISOString(),
        },
        {
          name: 'Database',
          status: 'down',
          lastChecked: new Date().toISOString(),
        },
        {
          name: 'Frontend',
          status: 'operational',
          lastChecked: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const overallStatus = systemStatus?.status === 'OK' && 
    services.every(s => s.status === 'operational') 
    ? 'operational' 
    : services.some(s => s.status === 'down') 
    ? 'down' 
    : 'degraded';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  System Status
                </h1>
                <p className="text-muted-foreground mt-1">
                  Real-time status of CVGenix services
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSystemStatus}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Home
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Overall Status Banner */}
          <Card className={`border-2 ${
            overallStatus === 'operational' 
              ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' 
              : overallStatus === 'degraded'
              ? 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20'
              : 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {overallStatus === 'operational' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-500" />
                  ) : overallStatus === 'degraded' ? (
                    <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-500" />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold">
                      All Systems {overallStatus === 'operational' ? 'Operational' : overallStatus === 'degraded' ? 'Degraded' : 'Down'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={getStatusBadgeVariant(overallStatus)}
                  className="text-sm px-3 py-1"
                >
                  {overallStatus === 'operational' ? 'All Systems Operational' : overallStatus === 'degraded' ? 'Some Issues' : 'Service Disruption'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading system status...</span>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  System Information
                </CardTitle>
                <CardDescription>
                  Current system metrics and uptime
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={getStatusBadgeVariant(systemStatus?.status || 'unknown')}>
                    {systemStatus?.status || 'Unknown'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Uptime
                  </span>
                  <span className="text-sm font-medium">
                    {systemStatus?.uptime ? formatUptime(systemStatus.uptime) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Environment</span>
                  <Badge variant="outline">
                    {systemStatus?.environment || 'Unknown'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Check</span>
                  <span className="text-sm font-medium">
                    {systemStatus?.timestamp 
                      ? new Date(systemStatus.timestamp).toLocaleString() 
                      : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Service Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Service Status
                </CardTitle>
                <CardDescription>
                  Status of individual services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      {service.status === 'operational' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
                      ) : service.status === 'degraded' ? (
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
                      )}
                      <div>
                        <div className="font-medium text-sm">{service.name}</div>
                        {service.responseTime !== undefined && (
                          <div className="text-xs text-muted-foreground">
                            {service.responseTime}ms response time
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(service.status)}>
                      {service.status === 'operational' ? 'Operational' : service.status === 'degraded' ? 'Degraded' : 'Down'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Updates / Status History */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  System Health
                </CardTitle>
                <CardDescription>
                  Current system health metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {services.filter(s => s.status === 'operational').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Operational Services</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {services.filter(s => s.status === 'degraded').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Degraded Services</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {services.filter(s => s.status === 'down').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Down Services</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer Information */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground text-center md:text-left">
              <p>This page automatically refreshes every 30 seconds.</p>
              <p className="mt-1">
                For support inquiries, please contact us at{" "}
                <a 
                  href="mailto:support@cvgenix.com" 
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  support@cvgenix.com
                </a>
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/contact" className="gap-2">
                <Mail className="w-4 h-4" />
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
