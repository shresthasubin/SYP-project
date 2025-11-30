import React from 'react';
import { Film, MapPin, Users, Ticket } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="rounded-xl bg-black border border-white/10 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      </div>
      <div className={`rounded-lg p-3 ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="mt-2 text-slate-400">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Movies" 
          value="24" 
          icon={Film} 
          color="bg-blue-500/20" 
        />
        <StatCard 
          title="Active Halls" 
          value="12" 
          icon={MapPin} 
          color="bg-green-500/20" 
        />
        <StatCard 
          title="Total Users" 
          value="1,234" 
          icon={Users} 
          color="bg-purple-500/20" 
        />
        <StatCard 
          title="Tickets Sold" 
          value="856" 
          icon={Ticket} 
          color="bg-[#D72626]/20" 
        />
      </div>

      {/* Recent Activity or Charts could go here */}
      <div className="rounded-xl bg-black border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Film size={18} className="text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-white">New movie added: "Inception"</p>
                  <p className="text-sm text-slate-400">2 hours ago</p>
                </div>
              </div>
              <span className="text-sm text-slate-500">Admin</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
