import React from "react";
import { Film, MapPin, Users, Ticket } from "lucide-react";

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
        <p className="mt-2 text-slate-400">Use Form Applications panel to review hall registration forms.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Movies" value="24" icon={Film} color="bg-blue-500/20" />
        <StatCard title="Active Halls" value="12" icon={MapPin} color="bg-green-500/20" />
        <StatCard title="Total Users" value="1,234" icon={Users} color="bg-purple-500/20" />
        <StatCard title="Tickets Sold" value="856" icon={Ticket} color="bg-[#D72626]/20" />
      </div>
    </div>
  );
};

export default Dashboard;
