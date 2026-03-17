import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { Activity, Bell, Calendar, Home, Pill, Search, Settings, User, Bot } from 'lucide-react';
import AiChatScanner from './pages/AiChatScanner';

const SidebarLink = ({ to, icon: Icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    
    return (
        <Link 
            to={to} 
            className={`flex items-center px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}
        >
            <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
            <span className={`font-medium ${isActive ? 'text-blue-700' : ''}`}>{label}</span>
        </Link>
    );
};

const DashboardLayout = ({ children }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                        Healthy Home
                    </span>
                </div>
                
                <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                    <SidebarLink to="/" icon={Home} label="Dashboard" />
                    <SidebarLink to="/chat" icon={Bot} label="AI Scanner" />
                    <SidebarLink to="#" icon={Activity} label="Vitals" />
                    <SidebarLink to="#" icon={Pill} label="Medicines" />
                    <SidebarLink to="#" icon={Calendar} label="Appointments" />
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            U
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-800">Demo User</p>
                            <p className="text-xs text-gray-500">Master Account</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen relative overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 w-full relative shrink-0">
                    
                    {/* Left: Search (Optional visible context) */}
                    <div className="flex-1 max-w-lg hidden md:block">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                <Search className="w-5 h-5 text-gray-400" />
                            </span>
                            <input 
                                type="text" 
                                className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" 
                                placeholder="Search medical records or ask AI..."
                            />
                        </div>
                    </div>

                    {/* Right: Actions AND Date/Time */}
                    <div className="flex items-center space-x-4 md:space-x-6 ml-auto">
                        <div className="flex flex-col items-end text-right border-r border-gray-200 pr-5">
                            <span className="text-lg font-bold text-gray-800 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 drop-shadow-sm">
                                {format(currentTime, 'hh:mm:ss a')}
                            </span>
                            <span className="text-xs uppercase font-semibold text-gray-500 tracking-wider mt-1">
                                {format(currentTime, 'EEEE, MMM do, yyyy')}
                            </span>
                        </div>

                        <button className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors bg-gray-50 rounded-full hover:bg-blue-50">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Dashboard Scroll Area */}
                <div className="flex-1 overflow-auto p-6 md:p-8 bg-gradient-to-br from-indigo-50/50 via-white to-cyan-50/50">
                    {children}
                </div>
            </main>
        </div>
    );
};

const DashboardHome = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Good evening, Family!</h1>
                    <p className="text-gray-500 mt-2 font-medium">Your family's health overview is looking solid.</p>
                </div>
                <button className="hidden sm:flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-md hover:shadow-lg transition-all font-medium">
                    <User className="w-4 h-4 mr-2" /> Select Profile
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {/* Card 1 */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full scale-100 group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Upcoming</p>
                            <h3 className="text-2xl font-bold text-gray-900">Dr. Smith</h3>
                            <p className="text-blue-600 font-medium text-sm mt-1">Tomorrow, 10:00 AM</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-inner">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-50 rounded-full scale-100 group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                             <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Medication</p>
                            <h3 className="text-2xl font-bold text-gray-900">Amoxicillin</h3>
                            <p className="text-emerald-600 font-medium text-sm mt-1">Take 1 Pill • In 2 hrs</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-inner">
                            <Pill className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-50 rounded-full scale-100 group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Latest BP</p>
                            <h3 className="text-2xl font-bold text-gray-900">120<span className="text-gray-400 text-xl">/80</span></h3>
                            <p className="text-rose-600 font-medium text-sm mt-1">Normal (Dad)</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-inner">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Card 4 - AI Insight */}
                <Link to="/chat" className="block w-full">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-indigo-200 shadow-lg text-white relative overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer h-full">
                         <div className="absolute right-0 top-0 opacity-10">
                            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="80" cy="20" r="60" fill="currentColor" />
                            </svg>
                         </div>
                         <div className="relative z-10">
                            <div className="flex items-center space-x-2 text-indigo-100 mb-2">
                                 <span className="text-xs uppercase font-bold tracking-wider">AI Scanner Assistant</span>
                                 <span className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse"></span>
                            </div>
                            <h3 className="text-lg font-semibold leading-tight mb-2">Scan & Chat with your Doc Assistant</h3>
                            <p className="text-indigo-200 text-sm opacity-90">Tap here to analyze medical reports</p>
                         </div>
                    </div>
                </Link>
            </div>

            {/* AI Insights & Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                     <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                         Family Vitals Overview
                         <span className="ml-3 px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-xs font-semibold">Healthy</span>
                     </h3>
                     <div className="h-64 w-full bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col justify-center items-center text-gray-400">
                         {/* Here we would place Recharts LineChart */}
                         <Activity className="w-8 h-8 opacity-50 mb-3 text-indigo-400" />
                         <p className="font-medium text-sm">Vitals Chart Visualization Space</p>
                         <p className="text-xs mt-1">(Recharts integration coming soon)</p>
                     </div>
                </div>

                 <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                     <h3 className="text-lg font-bold text-gray-800 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                         AI Health Insights
                     </h3>
                     <div className="space-y-4">
                         <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 leading-relaxed">
                            <p className="text-purple-900 text-sm mb-2 font-medium">✨ Insight on Dad's Heart Rate</p>
                            <p className="text-purple-700 text-sm">Dad's resting heart rate looks completely stable over the last 5 readings. Keep up the morning walks!</p>
                         </div>
                         <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 leading-relaxed">
                            <p className="text-orange-900 text-sm mb-2 font-medium">⚠️ Medication Refill Needed</p>
                            <p className="text-orange-700 text-sm">Mom's Lisinopril prescription will run out in 3 days. Shall I draft a refill request to Dr. Smith?</p>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <DashboardLayout>
                <Routes>
                    <Route path="/" element={<DashboardHome />} />
                    <Route path="/chat" element={<AiChatScanner />} />
                </Routes>
            </DashboardLayout>
        </Router>
    );
};

export default App;
