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
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    iconColor: 'text-emerald-400',
  },
  {
    title: 'Total Views',
    value: '0',
    description: 'Across all submissions',
    icon: Eye,
    gradient: 'from-blue-500/20 to-blue-500/5',
    iconColor: 'text-blue-400',
  },
  {
    title: 'Pending Review',
    value: '0',
    description: 'Awaiting approval',
    icon: Clock,
    gradient: 'from-amber-500/20 to-amber-500/5',
    iconColor: 'text-amber-400',
  },
  {
    title: 'Active Campaigns',
    value: '0',
    description: 'You\'re participating in',
    icon: TrendingUp,
    gradient: 'from-violet-500/20 to-violet-500/5',
    iconColor: 'text-violet-400',
  },
];

const DashboardHome: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!
        </h1>
        <p className="text-white/60 mt-1">
          Here's an overview of your creator account
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} pointer-events-none`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
              <CardTitle className="text-sm font-medium text-white/70">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-white/50 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Browse Campaigns</CardTitle>
            <CardDescription className="text-white/60">
              Find campaigns that match your content style and start earning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-white text-black hover:bg-white/90 rounded-full">
              <Link to="/dashboard/campaigns">
                View Campaigns
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Connect TikTok</CardTitle>
            <CardDescription className="text-white/60">
              Link your TikTok account to submit content and track views
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10 rounded-full">
              <Link to="/dashboard/settings">
                Go to Settings
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Getting Started</CardTitle>
          <CardDescription className="text-white/60">
            Complete these steps to start earning money on Jarla
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-black text-sm font-bold">
                1
              </span>
              <div>
                <h4 className="font-medium text-white">Connect your TikTok account</h4>
                <p className="text-sm text-white/60">
                  Link your TikTok to verify your content and track views
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-white/70 text-sm font-bold">
                2
              </span>
              <div>
                <h4 className="font-medium text-white/70">Browse available campaigns</h4>
                <p className="text-sm text-white/50">
                  Find brands and products that align with your content
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-white/70 text-sm font-bold">
                3
              </span>
              <div>
                <h4 className="font-medium text-white/70">Create and submit content</h4>
                <p className="text-sm text-white/50">
                  Follow campaign guidelines and submit your TikTok video
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-white/70 text-sm font-bold">
                4
              </span>
              <div>
                <h4 className="font-medium text-white/70">Get paid for views</h4>
                <p className="text-sm text-white/50">
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
