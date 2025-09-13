import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

// ===================================================================================
// MOCK API & DATA
// In a real application, this would be in `src/services/api.js` and would
// make actual fetch/axios calls to a backend.
// ===================================================================================

const mockData = {
  plans: [
    { id: 1, name: 'Fibernet Basic', type: 'Fibernet', quota: '100 GB', price: 499, status: 'Active' },
    { id: 2, name: 'Fibernet Pro', type: 'Fibernet', quota: '500 GB', price: 999, status: 'Active' },
    { id: 3, name: 'Copper Lite', type: 'Copper', quota: '50 GB', price: 299, status: 'Active' },
    { id: 4, name: 'Copper Max', type: 'Copper', quota: '200 GB', price: 699, status: 'Inactive' },
    { id: 5, name: 'Business Fibernet', type: 'Fibernet', quota: '1 TB', price: 1999, status: 'Active' },
  ],
  discounts: [
    { id: 1, code: 'SUMMER25', percentage: 25, status: 'Active', startDate: '2024-06-01', endDate: '2024-08-31' },
    { id: 2, code: 'NEWYEAR50', percentage: 50, status: 'Expired', startDate: '2023-12-20', endDate: '2024-01-05' },
    { id: 3, code: 'FIBERUPGRADE', percentage: 15, status: 'Active', startDate: '2024-01-01', endDate: '2024-12-31' },
  ],
  analytics: {
    subscriptions: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      active: [120, 135, 140, 160, 185, 210],
      cancelled: [5, 8, 3, 6, 10, 7],
    },
    planPopularity: [
      { name: 'Fibernet Pro', value: 45 },
      { name: 'Fibernet Basic', value: 25 },
      { name: 'Copper Max', value: 15 },
      { name: 'Business Fibernet', value: 10 },
      { name: 'Copper Lite', value: 5 },
    ],
  },
  auditLogs: [
    { id: 1, adminId: 'admin@example.com', action: 'Updated Plan: Fibernet Pro', timestamp: '2024-07-21 10:30 AM' },
    { id: 2, adminId: 'admin@example.com', action: 'Created Discount: SUMMER25', timestamp: '2024-07-20 03:15 PM' },
    { id: 3, adminId: 'supervisor@example.com', action: 'Deactivated Plan: Copper Max', timestamp: '2024-07-19 09:00 AM' },
    { id: 4, adminId: 'admin@example.com', action: 'User password changed for user_id: 123', timestamp: '2024-07-18 11:45 AM' },
  ],
  kpis: {
    totalPlans: 5,
    activeSubscriptions: 210,
    revenue: 150580,
    activeDiscounts: 2,
  },
  recentActivity: [
      {id: 1, user: 'John Doe', plan: 'Fibernet Pro', action: 'Subscribed'},
      {id: 2, user: 'Jane Smith', plan: 'Copper Lite', action: 'Cancelled'},
      {id: 3, user: 'Mike Ross', plan: 'Business Fibernet', action: 'Upgraded'}
  ]
};

const api = {
  get: (endpoint) => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: () => Promise.resolve(mockData[endpoint]) }), 500)),
  post: (endpoint, data) => new Promise(resolve => setTimeout(() => {
    console.log(`POST /${endpoint}`, data);
    if (endpoint === 'plans') {
        mockData.plans.push({ ...data, id: mockData.plans.length + 1 });
    }
    if (endpoint === 'discounts') {
        mockData.discounts.push({ ...data, id: mockData.discounts.length + 1 });
    }
    resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
  }, 500)),
  put: (endpoint, id, data) => new Promise(resolve => setTimeout(() => {
    console.log(`PUT /${endpoint}/${id}`, data);
    if (endpoint === 'plans') {
        const index = mockData.plans.findIndex(p => p.id === id);
        if (index !== -1) mockData.plans[index] = { ...mockData.plans[index], ...data };
    }
    resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
  }, 500)),
  delete: (endpoint, id) => new Promise(resolve => setTimeout(() => {
    console.log(`DELETE /${endpoint}/${id}`);
    if (endpoint === 'plans') {
        mockData.plans = mockData.plans.filter(p => p.id !== id);
    }
    resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
  }, 500)),
};

// ===================================================================================
// CONTEXT PROVIDERS
// In a real application, these would be in `src/context/`
// ===================================================================================

const ThemeContext = createContext();
const AppContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const AppProvider = ({ children }) => {
    const [currentPage, setCurrentPage] = useState('Dashboard');
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    }, []);

    return (
        <AppContext.Provider value={{ currentPage, setCurrentPage, notifications, addNotification }}>
            {children}
        </AppContext.Provider>
    );
};

// ===================================================================================
// REUSABLE UI COMPONENTS
// In a real application, these would be in `src/components/`
// ===================================================================================

const Card = ({ title, value, icon, trend }) => (
  <div className="card">
    <div className="card-header">
      <h3 className="card-title">{title}</h3>
      <div className="card-icon">{icon}</div>
    </div>
    <p className="card-value">{value}</p>
    {trend && <p className="card-trend">{trend}</p>}
  </div>
);

const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

const DataTable = ({ columns, data }) => (
    <div className="data-table-wrapper">
        <table className="data-table">
            <thead>
                <tr>
                    {columns.map((col) => <th key={col.key}>{col.header}</th>)}
                </tr>
            </thead>
            <tbody>
                {data.map((row) => (
                    <tr key={row.id}>
                        {columns.map((col) => (
                            <td key={col.key} data-label={col.header}>
                                {col.render ? col.render(row) : row[col.key]}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// Custom Chart Components (no external libraries)
const BarChart = ({ data, title }) => {
    const maxValue = Math.max(...data.active, ...data.cancelled);
    return (
        <div className="chart-container card">
            <h3>{title}</h3>
            <div className="bar-chart">
                {data.labels.map((label, index) => (
                    <div key={label} className="bar-group">
                        <div className="bar-wrapper">
                            <div className="bar active" style={{ height: `${(data.active[index] / maxValue) * 100}%` }} title={`Active: ${data.active[index]}`}></div>
                            <div className="bar cancelled" style={{ height: `${(data.cancelled[index] / maxValue) * 100}%` }} title={`Cancelled: ${data.cancelled[index]}`}></div>
                        </div>
                        <span className="bar-label">{label}</span>
                    </div>
                ))}
            </div>
            <div className="chart-legend">
                <span className="legend-item active">Active</span>
                <span className="legend-item cancelled">Cancelled</span>
            </div>
        </div>
    );
};

const PieChart = ({ data, title }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    let cumulativePercent = 0;
    const gradients = data.map(item => {
        const percent = (item.value / total) * 100;
        const start = cumulativePercent;
        const end = cumulativePercent + percent;
        cumulativePercent = end;
        return `var(--pie-color-${data.indexOf(item) + 1}) ${start}% ${end}%`;
    });

    return (
        <div className="chart-container card">
            <h3>{title}</h3>
            <div className="pie-chart-wrapper">
                <div className="pie-chart" style={{ background: `conic-gradient(${gradients.join(', ')})` }}></div>
                <div className="pie-chart-legend">
                    {data.map((item, index) => (
                        <div key={item.name} className="legend-item">
                            <span className="legend-color-box" style={{ backgroundColor: `var(--pie-color-${index + 1})` }}></span>
                            {item.name} ({(item.value / total * 100).toFixed(1)}%)
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ===================================================================================
// PAGE COMPONENTS
// In a real application, these would be in `src/pages/`
// ===================================================================================

const DashboardPage = () => {
    const [kpis, setKpis] = useState(null);
    const [activity, setActivity] = useState([]);

    useEffect(() => {
        api.get('kpis').then(res => res.json()).then(setKpis);
        api.get('recentActivity').then(res => res.json()).then(setActivity);
    }, []);

    if (!kpis) return <div>Loading...</div>;

    const kpiCards = [
        { title: 'Total Plans', value: kpis.totalPlans, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg> },
        { title: 'Active Subscriptions', value: kpis.activeSubscriptions, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
        { title: 'Monthly Revenue', value: `₹${kpis.revenue.toLocaleString('en-IN')}`, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>, trend: "+5.2% this month" },
        { title: 'Active Discounts', value: kpis.activeDiscounts, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg> },
    ];
    
    const activityColumns = [
        { header: 'User', key: 'user' },
        { header: 'Plan', key: 'plan' },
        { header: 'Action', key: 'action', render: (row) => <span className={`status ${row.action.toLowerCase()}`}>{row.action}</span>},
    ];

    return (
        <div className="page-content">
            <h1>Dashboard Overview</h1>
            <div className="grid-container">
                {kpiCards.map(kpi => <Card key={kpi.title} {...kpi} />)}
            </div>
            <div className="grid-container">
                 <div className="card full-width">
                    <h3>Recent Subscription Activity</h3>
                    <DataTable columns={activityColumns} data={activity} />
                 </div>
            </div>
        </div>
    );
};

const PlanForm = ({ plan, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: plan?.name || '',
        type: plan?.type || 'Fibernet',
        quota: plan?.quota || '',
        price: plan?.price || '',
        status: plan?.status || 'Active',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Plan name is required.';
        if (!formData.quota) newErrors.quota = 'Quota is required.';
        if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
            newErrors.price = 'Price must be a positive number.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSave(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
                <label htmlFor="name">Plan Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
                {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-group">
                <label htmlFor="type">Plan Type</label>
                <select id="type" name="type" value={formData.type} onChange={handleChange}>
                    <option value="Fibernet">Fibernet</option>
                    <option value="Copper">Copper</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="quota">Quota</label>
                <input type="text" id="quota" name="quota" value={formData.quota} onChange={handleChange} />
                {errors.quota && <span className="form-error">{errors.quota}</span>}
            </div>
            <div className="form-group">
                <label htmlFor="price">Price (₹)</label>
                <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} />
                {errors.price && <span className="form-error">{errors.price}</span>}
            </div>
            <div className="form-group">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>
            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Plan</button>
            </div>
        </form>
    );
};

const PlansPage = () => {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const { addNotification } = useContext(AppContext);

    const fetchPlans = useCallback(() => {
        setIsLoading(true);
        api.get('plans').then(res => res.json()).then(data => {
            setPlans(data);
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const handleAddPlan = () => {
        setEditingPlan(null);
        setIsModalOpen(true);
    };

    const handleEditPlan = (plan) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };
    
    const handleDeletePlan = (id) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            api.delete('plans', id).then(() => {
                addNotification('Plan deleted successfully!');
                fetchPlans();
            });
        }
    };

    const handleSavePlan = (planData) => {
        const apiCall = editingPlan
            ? api.put('plans', editingPlan.id, planData)
            : api.post('plans', planData);

        apiCall.then(() => {
            addNotification(`Plan ${editingPlan ? 'updated' : 'created'} successfully!`);
            fetchPlans();
            setIsModalOpen(false);
            setEditingPlan(null);
        }).catch(err => addNotification('An error occurred.', 'error'));
    };

    const columns = [
        { header: 'Plan Name', key: 'name' },
        { header: 'Type', key: 'type' },
        { header: 'Quota', key: 'quota' },
        { header: 'Price', key: 'price', render: (row) => `₹${row.price}` },
        { header: 'Status', key: 'status', render: (row) => <span className={`status ${row.status.toLowerCase()}`}>{row.status}</span> },
        {
            header: 'Actions', key: 'actions', render: (row) => (
                <div className="actions">
                    <button className="btn btn-sm btn-icon" onClick={() => handleEditPlan(row)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                     <button className="btn btn-sm btn-icon btn-danger" onClick={() => handleDeletePlan(row.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            )
        },
    ];

    if (isLoading) return <div>Loading plans...</div>;

    return (
        <div className="page-content">
            <div className="page-header">
                <h1>Plans Management</h1>
                <button className="btn btn-primary" onClick={handleAddPlan}>Add New Plan</button>
            </div>
            <DataTable columns={columns} data={plans} />
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPlan ? 'Edit Plan' : 'Add New Plan'}>
                <PlanForm plan={editingPlan} onSave={handleSavePlan} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

const DiscountsPage = () => {
    const [discounts, setDiscounts] = useState([]);
    useEffect(() => {
        api.get('discounts').then(res => res.json()).then(setDiscounts);
    }, []);

    const columns = [
        { header: 'Code', key: 'code' },
        { header: 'Percentage', key: 'percentage', render: (row) => `${row.percentage}%` },
        { header: 'Start Date', key: 'startDate' },
        { header: 'End Date', key: 'endDate' },
        { header: 'Status', key: 'status', render: (row) => <span className={`status ${row.status.toLowerCase()}`}>{row.status}</span> },
    ];
    return (
        <div className="page-content">
            <div className="page-header">
                <h1>Discounts Management</h1>
                <button className="btn btn-primary">Add New Discount</button>
            </div>
            <DataTable columns={columns} data={discounts} />
        </div>
    );
};

const AnalyticsPage = () => {
    const [analytics, setAnalytics] = useState(null);
    useEffect(() => {
        api.get('analytics').then(res => res.json()).then(setAnalytics);
    }, []);

    if (!analytics) return <div>Loading analytics...</div>;

    return (
        <div className="page-content">
            <h1>Analytics & Insights</h1>
            <div className="grid-container">
                <BarChart data={analytics.subscriptions} title="Monthly Active vs. Cancelled Subscriptions" />
                <PieChart data={analytics.planPopularity} title="Top 5 Popular Plans" />
            </div>
        </div>
    );
};

const AuditLogsPage = () => {
    const [logs, setLogs] = useState([]);
    useEffect(() => {
        api.get('auditLogs').then(res => res.json()).then(setLogs);
    }, []);

    const columns = [
        { header: 'Timestamp', key: 'timestamp' },
        { header: 'Admin ID', key: 'adminId' },
        { header: 'Action', key: 'action' },
    ];
    return (
        <div className="page-content">
            <h1>Audit Logs</h1>
            <DataTable columns={columns} data={logs} />
        </div>
    );
};

const SettingsPage = () => {
    return (
        <div className="page-content">
            <h1>Settings</h1>
             <div className="card">
                <h3>Admin Profile</h3>
                <form className="form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" value="admin@example.com" disabled />
                    </div>
                     <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input type="text" id="name" name="name" defaultValue="Admin User" />
                    </div>
                    <div className="form-actions">
                         <button type="submit" className="btn btn-primary">Update Profile</button>
                    </div>
                </form>
             </div>
             <div className="card">
                <h3>Change Password</h3>
                <form className="form">
                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <input type="password" id="currentPassword" name="currentPassword" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input type="password" id="newPassword" name="newPassword" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" />
                    </div>
                     <div className="form-actions">
                         <button type="submit" className="btn btn-primary">Change Password</button>
                    </div>
                </form>
             </div>
        </div>
    );
};

// ===================================================================================
// LAYOUT COMPONENTS
// In a real application, these would be in `src/components/`
// ===================================================================================

const Navbar = ({ isNavOpen, toggleNav }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { currentPage, setCurrentPage } = useContext(AppContext);
    const navItems = ['Dashboard', 'Plans', 'Discounts', 'Analytics', 'Audit Logs', 'Settings'];

    const handleNavClick = (page, e) => {
        e.preventDefault();
        setCurrentPage(page);
    };

    return (
        <header className="navbar">
             <div className="navbar-left">
                <h1 className="logo-text">AMS</h1>
                <nav className="navbar-nav">
                    {navItems.map(item => (
                         <a
                            key={item}
                            href="#"
                            className={`nav-link ${currentPage === item ? 'active' : ''}`}
                            onClick={(e) => handleNavClick(item, e)}
                        >
                            {item}
                        </a>
                    ))}
                </nav>
            </div>

            <div className="navbar-right">
                <div className="search-bar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" placeholder="Search..." />
                </div>
                <div className="navbar-actions">
                    <button className="action-btn theme-toggle" onClick={toggleTheme}>
                        {theme === 'light' ? 
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg> :
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                        }
                    </button>
                    <button className="action-btn">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    </button>
                    <div className="user-profile">
                        <img src="https://i.pravatar.cc/40" alt="Admin Avatar" />
                        <span className="user-profile-name">Admin User</span>
                    </div>
                </div>
                 <button className="mobile-menu-toggle" onClick={toggleNav}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
            </div>
        </header>
    );
};

const NotificationContainer = () => {
    const { notifications } = useContext(AppContext);

    return (
        <div className="notification-container">
            {notifications.map(n => (
                <div key={n.id} className={`notification ${n.type}`}>
                    {n.message}
                </div>
            ))}
        </div>
    );
};

// ===================================================================================
// MAIN APP COMPONENT
// In a real application, this would be `src/App.jsx`
// ===================================================================================

export default function App() {
    const [isMobileNavOpen, setMobileNavOpen] = useState(false);

    const MainContent = () => {
        const { currentPage } = useContext(AppContext);
        switch (currentPage) {
            case 'Plans': return <PlansPage />;
            case 'Discounts': return <DiscountsPage />;
            case 'Analytics': return <AnalyticsPage />;
            case 'Audit Logs': return <AuditLogsPage />;
            case 'Settings': return <SettingsPage />;
            default: return <DashboardPage />;
        }
    };

    return (
        <ThemeProvider>
            <AppProvider>
                <div className={`app-layout ${isMobileNavOpen ? 'nav-open' : ''}`}>
                    {/* This <style> block contains all CSS. In a real application, this would 
                      be split into multiple SCSS/CSS files in `src/styles/`
                    */}
                    <style>{`
                        /* Global Styles & Variables */
                        :root {
                            --font-family: 'Inter', sans-serif;
                            --transition-speed: 0.3s;
                            --border-radius: 8px;

                            /* Light Theme */
                            --bg-primary-light: #f8fafc; /* neutral-50 */
                            --bg-secondary-light: #ffffff;
                            --text-primary-light: #0f172a; /* slate-900 */
                            --text-secondary-light: #64748b; /* slate-500 */
                            --border-color-light: #e2e8f0; /* slate-200 */
                            --accent-color: #3b82f6; /* blue-500 */
                            --accent-color-hover: #2563eb; /* blue-600 */
                            --danger-color: #ef4444; /* red-500 */
                            --success-color: #22c55e; /* green-500 */

                            /* Dark Theme */
                            --bg-primary-dark: #0f172a; /* slate-900 */
                            --bg-secondary-dark: #1e293b; /* slate-800 */
                            --text-primary-dark: #f8fafc; /* neutral-50 */
                            --text-secondary-dark: #94a3b8; /* slate-400 */
                            --border-color-dark: #334155; /* slate-700 */
                        }

                        body {
                            font-family: var(--font-family);
                            margin: 0;
                            transition: background-color var(--transition-speed), color var(--transition-speed);
                        }
                        
                        body.light {
                            background-color: var(--bg-primary-light);
                            color: var(--text-primary-light);
                        }

                        body.dark {
                            background-color: var(--bg-primary-dark);
                            color: var(--text-primary-dark);
                        }

                        /* App Layout */
                        .app-layout {
                            display: flex;
                            flex-direction: column;
                            min-height: 100vh;
                        }

                        main {
                           padding: 1.5rem;
                           flex-grow: 1;
                           width: 100%;
                           max-width: 1280px;
                           margin: 0 auto;
                           box-sizing: border-box;
                        }

                        /* Navbar */
                        .navbar {
                            height: 64px;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            padding: 0 1.5rem;
                            border-bottom: 1px solid var(--border-color);
                            background-color: var(--bg-secondary);
                            position: sticky;
                            top: 0;
                            z-index: 99;
                        }
                        .navbar-left { display: flex; align-items: center; gap: 1.5rem; }
                        .logo-text { font-size: 1.75rem; font-weight: 700; margin: 0; color: var(--text-primary); }
                        
                        .navbar-nav { display: flex; align-items: center; gap: 1rem; }
                        .nav-link {
                            padding: 0.5rem 0.75rem;
                            border-radius: var(--border-radius);
                            text-decoration: none;
                            font-weight: 500;
                            transition: background-color 0.2s, color 0.2s;
                            white-space: nowrap;
                            color: var(--text-secondary);
                        }
                        .nav-link:hover {
                            background-color: var(--bg-primary);
                            color: var(--text-primary);
                        }
                        .nav-link.active {
                            background-color: var(--accent-color);
                            color: white;
                        }
                        
                        .navbar-right { display: flex; align-items: center; gap: 1rem; }
                        .search-bar { display: flex; align-items: center; gap: 0.5rem; }
                        .search-bar input { border: none; background: transparent; padding: 0.5rem; width: 200px; color: var(--text-primary); }
                        .search-bar input:focus { outline: none; }
                        .navbar-actions { display: flex; align-items: center; gap: 1rem; }
                        .action-btn { background: none; border: none; cursor: pointer; color: var(--text-secondary); }
                        .user-profile { display: flex; align-items: center; gap: 0.5rem; }
                        .user-profile img { width: 40px; height: 40px; border-radius: 50%; }

                        .mobile-menu-toggle { display: none; background: none; border: none; cursor: pointer; color: var(--text-secondary); }

                        /* Page Content */
                        .page-content h1 { margin-top: 0; }
                        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
                        
                        /* Grid & Cards */
                        .grid-container {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                            gap: 1.5rem;
                            margin-bottom: 1.5rem;
                        }
                        .card {
                            background-color: var(--bg-secondary);
                            padding: 1.5rem;
                            border-radius: var(--border-radius);
                            border: 1px solid var(--border-color);
                            box-shadow: 0 1px 3px 0 rgba(0,0,0,0.05);
                            transition: box-shadow var(--transition-speed);
                        }
                        .card:hover {
                            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
                        }
                        .card.full-width { grid-column: 1 / -1; }
                        .card-header { display: flex; justify-content: space-between; align-items: flex-start; }
                        .card-title { margin: 0 0 1rem; }
                        .card-value { font-size: 2rem; font-weight: 600; margin: 0; }
                        .card-trend { margin-top: 0.5rem; font-size: 0.875rem; color: var(--success-color); }
                        
                        /* DataTable */
                        .data-table-wrapper { overflow-x: auto; }
                        .data-table { width: 100%; border-collapse: collapse; background-color: var(--bg-secondary); }
                        .data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--border-color); }
                        .data-table th { font-weight: 600; }
                        
                        /* Buttons & Forms */
                        .btn {
                            padding: 0.6rem 1.2rem;
                            border: none;
                            border-radius: var(--border-radius);
                            cursor: pointer;
                            font-weight: 600;
                            transition: background-color var(--transition-speed);
                        }
                        .btn-primary { background-color: var(--accent-color); color: white; }
                        .btn-primary:hover { background-color: var(--accent-color-hover); }
                        .btn-secondary { background-color: transparent; border: 1px solid var(--border-color); color: var(--text-primary); }
                        .btn-secondary:hover { background-color: var(--bg-primary); }
                        .btn-sm { padding: 0.4rem 0.8rem; }
                        .btn-icon { background: transparent; padding: 0.25rem; }
                        .btn-danger { color: var(--danger-color); }
                        .actions { display: flex; gap: 0.5rem; }
                        
                        .form .form-group { margin-bottom: 1rem; }
                        .form label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
                        .form input, .form select {
                            width: 100%;
                            padding: 0.75rem;
                            border-radius: var(--border-radius);
                            border: 1px solid var(--border-color);
                            box-sizing: border-box;
                            background-color: var(--bg-secondary);
                            color: var(--text-primary);
                        }
                        .form .form-error { color: var(--danger-color); font-size: 0.875rem; margin-top: 0.25rem; }
                        .form .form-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem; }

                        /* Modal */
                        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
                        .modal-content { background-color: var(--bg-secondary); padding: 2rem; border-radius: var(--border-radius); max-width: 500px; width: 90%; }
                        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                        .modal-header h2 { margin: 0; }
                        .modal-close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-primary); }
                        
                        /* Notifications */
                        .notification-container { position: fixed; top: 84px; right: 20px; z-index: 1001; }
                        .notification { padding: 1rem; border-radius: var(--border-radius); margin-bottom: 0.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .notification.success { background-color: var(--success-color); color: white; }
                        .notification.error { background-color: var(--danger-color); color: white; }

                        /* Status Badges */
                        .status { padding: 0.25em 0.6em; border-radius: 999px; font-size: 0.8rem; font-weight: 500; }
                        .status.active, .status.subscribed { background-color: #dcfce7; color: #166534; } /* green */
                        .status.inactive, .status.expired { background-color: #fee2e2; color: #991b1b; } /* red */
                        .status.cancelled { background-color: #fee2e2; color: #991b1b; } /* red */
                        .status.upgraded { background-color: #dbeafe; color: #1e40af; } /* blue */

                        /* Charts */
                        .chart-container { display: flex; flex-direction: column; gap: 1rem; }
                        .bar-chart { display: flex; justify-content: space-around; align-items: flex-end; height: 250px; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; }
                        .bar-group { display: flex; flex-direction: column; align-items: center; }
                        .bar-wrapper { display: flex; align-items: flex-end; gap: 4px; height: 100%; }
                        .bar { width: 15px; border-radius: 4px 4px 0 0; transition: height 0.5s; }
                        .bar.active { background-color: var(--accent-color); }
                        .bar.cancelled { background-color: var(--danger-color); }
                        .bar-label { font-size: 0.75rem; margin-top: 0.5rem; }
                        .chart-legend { display: flex; justify-content: center; gap: 1rem; }
                        .legend-item { display: flex; align-items: center; gap: 0.5rem; }
                        .legend-item::before { content: ''; display: inline-block; width: 12px; height: 12px; border-radius: 50%; }
                        .legend-item.active::before { background-color: var(--accent-color); }
                        .legend-item.cancelled::before { background-color: var(--danger-color); }

                        .pie-chart-wrapper { display: flex; align-items: center; gap: 2rem; justify-content: center; flex-wrap: wrap; }
                        .pie-chart { width: 150px; height: 150px; border-radius: 50%; }
                        .pie-chart-legend .legend-color-box { width: 12px; height: 12px; border-radius: 2px; margin-right: 8px; }

                        /* Theme-specific styles */
                        body.light {
                           --bg-primary: var(--bg-primary-light);
                           --bg-secondary: var(--bg-secondary-light);
                           --text-primary: var(--text-primary-light);
                           --text-secondary: var(--text-secondary-light);
                           --border-color: var(--border-color-light);
                           --pie-color-1: #60a5fa; --pie-color-2: #3b82f6; --pie-color-3: #2563eb; --pie-color-4: #1d4ed8; --pie-color-5: #1e3a8a;
                        }

                        body.dark {
                           --bg-primary: var(--bg-primary-dark);
                           --bg-secondary: var(--bg-secondary-dark);
                           --text-primary: var(--text-primary-dark);
                           --text-secondary: var(--text-secondary-dark);
                           --border-color: var(--border-color-dark);
                           --pie-color-1: #3b82f6; --pie-color-2: #60a5fa; --pie-color-3: #93c5fd; --pie-color-4: #bfdbfe; --pie-color-5: #dbeafe;
                        }
                        
                        /* Responsive Design */
                        @media (max-width: 1024px) {
                           .navbar-nav {
                                display: none;
                                position: absolute;
                                top: 64px;
                                left: 0;
                                right: 0;
                                background-color: var(--bg-secondary);
                                border-bottom: 1px solid var(--border-color);
                                flex-direction: column;
                                padding: 1rem;
                                align-items: stretch;
                                gap: 0.5rem;
                            }
                            .app-layout.nav-open .navbar-nav {
                                display: flex;
                            }
                            .search-bar { display: none; }
                            .mobile-menu-toggle { display: block; }
                        }
                        
                        @media (max-width: 768px) {
                            .user-profile-name { display: none; }
                            
                            /* Responsive Table */
                            .data-table thead { display: none; }
                            .data-table tr { display: block; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 1rem; }
                            .data-table td { display: block; text-align: right; border-bottom: 1px solid var(--border-color-light); padding: 0.75rem 0; }
                            .data-table td:last-child { border-bottom: none; }
                            .data-table td::before {
                                content: attr(data-label);
                                float: left;
                                font-weight: bold;
                            }
                        }
                    `}</style>
                    <Navbar isNavOpen={isMobileNavOpen} toggleNav={() => setMobileNavOpen(!isMobileNavOpen)} />
                    <main>
                        <MainContent />
                    </main>
                    <NotificationContainer />
                </div>
            </AppProvider>
        </ThemeProvider>
    );
}

