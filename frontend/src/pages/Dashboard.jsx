import React from 'react';
import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';

const Dashboard = () => {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-gray-400 text-sm font-medium">Total Movies</h3>
          <p className="text-3xl font-bold mt-2 text-neon-red">12</p>
        </Card>
        <Card>
          <h3 className="text-gray-400 text-sm font-medium">Total Halls</h3>
          <p className="text-3xl font-bold mt-2 text-neon-blue">4</p>
        </Card>
        <Card>
          <h3 className="text-gray-400 text-sm font-medium">Active Showtimes</h3>
          <p className="text-3xl font-bold mt-2 text-white">8</p>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
