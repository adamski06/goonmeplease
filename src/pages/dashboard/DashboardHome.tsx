import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Eye, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const stats = [
  {
    title: 'Total Earnings',
    value: '$0.00',
    description: 'Lifetime earnings',
    icon: DollarSign,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    title: 'Total Views',
    value: '0',
    description: 'Across all submissions',
    icon: Eye,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Pending Review',
    value: '0',
    description: 'Awaiting approval',
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    title: 'Active Campaigns',
    value: '0',
    description: 'You\'re participating in',
    icon: TrendingUp,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
];

const DashboardHome: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your creator account
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Browse Campaigns</CardTitle>
            <CardDescription>
              Find campaigns that match your content style and start earning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link to="/dashboard/campaigns">
                View Campaigns
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Connect TikTok</CardTitle>
            <CardDescription>
              Link your TikTok account to submit content and track views
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="rounded-full">
              <Link to="/dashboard/settings">
                Go to Settings
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="bg-white border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Getting Started</CardTitle>
          <CardDescription>
            Complete these steps to start earning money on Jarla
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-sm font-bold">
                1
              </span>
              <div>
                <h4 className="font-medium text-foreground">Connect your TikTok account</h4>
                <p className="text-sm text-muted-foreground">
                  Link your TikTok to verify your content and track views
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-bold">
                2
              </span>
              <div>
                <h4 className="font-medium text-muted-foreground">Browse available campaigns</h4>
                <p className="text-sm text-muted-foreground/70">
                  Find brands and products that align with your content
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-bold">
                3
              </span>
              <div>
                <h4 className="font-medium text-muted-foreground">Create and submit content</h4>
                <p className="text-sm text-muted-foreground/70">
                  Follow campaign guidelines and submit your TikTok video
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-bold">
                4
              </span>
              <div>
                <h4 className="font-medium text-muted-foreground">Get paid for views</h4>
                <p className="text-sm text-muted-foreground/70">
                  Earn money based on the views your content generates
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
