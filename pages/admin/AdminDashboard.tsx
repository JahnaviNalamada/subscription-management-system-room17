
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import type { AnalyticsData } from '../../types';
import { getAnalytics } from '../../services/api';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-lumen-blue/10 text-lumen-blue rounded-full p-3">{icon}</div>
        <div>
            <p className="text-sm text-lumen-gray-500">{title}</p>
            <p className="text-2xl font-bold text-lumen-gray-800">{value}</p>
        </div>
    </div>
);


const AdminDashboard: React.FC = () => {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await getAnalytics();
            setAnalytics(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading || !analytics) {
        return <div className="text-center p-10">Loading analytics...</div>;
    }

    return (
        <div className="p-8 space-y-8">
            <h2 className="text-3xl font-bold text-lumen-gray-800">Administrator Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Users" value={analytics.totalUsers.toLocaleString()} icon={<UserIcon/>}/>
                <StatCard title="Active Subscriptions" value={analytics.activeSubscriptions.toLocaleString()} icon={<CheckBadgeIcon/>}/>
                <StatCard title="Monthly Revenue (Est.)" value={`$${analytics.totalRevenue.toLocaleString()}`} icon={<CurrencyDollarIcon/>}/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-lumen-gray-700 mb-4">Subscription Trends (Monthly)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.monthlyTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="active" stroke="#0077c8" strokeWidth={2} name="Active Subscriptions" />
                            <Line type="monotone" dataKey="cancelled" stroke="#f44336" strokeWidth={2} name="Cancellations" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-lumen-gray-700 mb-4">Plan Popularity</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.planPopularity} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={120} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="subscriptions" fill="#00a651" name="Total Subscriptions" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// Icons
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm6-11a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CurrencyDollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;

export default AdminDashboard;
