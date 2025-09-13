import React, { useState, useEffect, useCallback } from 'react';
import type { Plan, Subscription, User, Discount } from '../../types';
import { getPlans, getUser, getDiscounts, updateUserSubscription, getSubscriptionsForUser } from '../../services/api';
import { getPlanRecommendation } from '../../services/geminiService';
import PlanCard from '../../components/PlanCard';
import { SparklesIcon, TagIcon, ClockIcon } from '../../components/icons';

const UserDashboard: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [allPlans, setAllPlans] = useState<Plan[]>([]);
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'dashboard' | 'browse'>('dashboard');
    const [suggestedPlans, setSuggestedPlans] = useState<Plan[]>([]);

    const activeSubscription = subscriptions.find(s => s.status === 'active');
    const pastSubscriptions = subscriptions.filter(s => s.status === 'cancelled').sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    const currentPlan = allPlans.find(p => p.id === activeSubscription?.planId);

    const loadUserData = useCallback(async () => {
        setLoading(true);
        const [fetchedUser, plans, discounts] = await Promise.all([
            getUser('user1'),
            getPlans(),
            getDiscounts()
        ]);
        
        setAllPlans(plans);
        setDiscounts(discounts);
        
        if (fetchedUser) {
            setUser(fetchedUser);
            const userSubscriptions = await getSubscriptionsForUser(fetchedUser.id);
            setSubscriptions(userSubscriptions);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    useEffect(() => {
        if (user && user.usage.length > 0 && allPlans.length > 0) {
            const averageUsage = user.usage.reduce((sum, u) => sum + u.dataUsed, 0) / user.usage.length;
    
            const potentialPlans = allPlans
                .filter(p => p.id !== currentPlan?.id)
                .sort((a, b) => a.price - b.price);
    
            const bestFit = potentialPlans.find(p => p.dataQuota > averageUsage);
            
            const suggestions: Plan[] = [];
            if (bestFit) {
                suggestions.push(bestFit);
                const bestFitIndex = potentialPlans.findIndex(p => p.id === bestFit.id);
                if (bestFitIndex + 1 < potentialPlans.length) {
                    suggestions.push(potentialPlans[bestFitIndex + 1]);
                }
            } else if (potentialPlans.length > 0) {
                suggestions.push(potentialPlans[potentialPlans.length - 1]);
            }
            
            setSuggestedPlans(suggestions.slice(0, 2));
        }
    }, [user, allPlans, currentPlan]);

    const handlePlanChange = async (newPlanId: string) => {
        if(user && window.confirm(`Are you sure you want to switch to this plan?`)) {
            await updateUserSubscription(user.id, newPlanId, 'active');
            alert("Subscription updated successfully!");
            loadUserData();
            setView('dashboard');
        }
    };

    const handleCancelSubscription = async () => {
        if(user && window.confirm("Are you sure you want to cancel your subscription? This cannot be undone.")) {
            await updateUserSubscription(user.id, null, 'cancelled');
            alert("Subscription cancelled successfully.");
            loadUserData();
            setView('dashboard');
        }
    }
    
    if (loading) {
        return <div className="text-center p-10">Loading your dashboard...</div>;
    }

    if (!user) {
        return <div className="text-center p-10">Could not find user data.</div>;
    }

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-lumen-gray-800 mb-6">Welcome back, {user.name}!</h2>
            
            {view === 'dashboard' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <CurrentSubscriptionPanel 
                            plan={currentPlan} 
                            subscription={activeSubscription} 
                            onBrowse={() => setView('browse')}
                            onCancel={handleCancelSubscription}
                        />
                        <SubscriptionHistoryPanel
                            pastSubscriptions={pastSubscriptions}
                            allPlans={allPlans}
                        />
                         <SuggestedPlansPanel
                            suggestedPlans={suggestedPlans}
                            currentPlanId={currentPlan?.id}
                            onSelectPlan={handlePlanChange}
                        />
                    </div>
                    <div className="space-y-6">
                        <AIRecommendationPanel user={user} allPlans={allPlans}/>
                        <DiscountsPanel discounts={discounts} />
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-semibold text-lumen-gray-700">Browse & Manage Plans</h3>
                        <button onClick={() => setView('dashboard')} className="text-lumen-blue font-semibold">&larr; Back to Dashboard</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allPlans.map(plan => (
                            <PlanCard 
                                key={plan.id} 
                                plan={plan} 
                                isCurrentPlan={plan.id === currentPlan?.id}
                                onSelect={handlePlanChange}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const CurrentSubscriptionPanel: React.FC<{ plan?: Plan, subscription?: Subscription, onBrowse: () => void, onCancel: () => void }> = ({ plan, subscription, onBrowse, onCancel }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-lumen-gray-700 mb-4">Your Current Subscription</h3>
            {plan && subscription ? (
                <>
                    <div>
                        <h4 className="text-2xl font-bold text-lumen-blue">{plan.name}</h4>
                        <p className="text-lumen-gray-500 mb-4">{plan.productType}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                            <div><p className="text-lumen-gray-500">Price</p><p className="font-semibold text-lumen-gray-800">₹{plan.price}/month</p></div>
                            <div><p className="text-lumen-gray-500">Data Quota</p><p className="font-semibold text-lumen-gray-800">{plan.dataQuota} GB</p></div>
                            <div><p className="text-lumen-gray-500">Status</p><p className="font-semibold text-green-600 capitalize">{subscription.status}</p></div>
                            <div><p className="text-lumen-gray-500">Subscribed On</p><p className="font-semibold text-lumen-gray-800">{subscription.startDate}</p></div>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button onClick={onBrowse} className="bg-lumen-blue text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition flex-1">Upgrade / Downgrade</button>
                        <button onClick={onCancel} className="bg-lumen-gray-200 text-lumen-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-lumen-gray-300 transition">Cancel Subscription</button>
                    </div>
                </>
            ) : (
                <div className="text-center py-10">
                    <p className="text-lumen-gray-600 mb-4">You don't have an active subscription.</p>
                    <button onClick={onBrowse} className="bg-lumen-green text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition">Subscribe to a Plan</button>
                </div>
            )}
        </div>
    );
};

const SubscriptionHistoryPanel: React.FC<{pastSubscriptions: Subscription[], allPlans: Plan[]}> = ({pastSubscriptions, allPlans}) => {
    if (pastSubscriptions.length === 0) {
        return null;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-lumen-gray-700 mb-4 flex items-center">
                <ClockIcon className="w-6 h-6 mr-2 text-lumen-gray-500" />
                Subscription History
            </h3>
            <div className="space-y-4">
                {pastSubscriptions.map(sub => {
                    const plan = allPlans.find(p => p.id === sub.planId);
                    return (
                        <div key={sub.id} className="border-t border-lumen-gray-200 pt-4 first:pt-0 first:border-t-0">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-lumen-gray-800">{plan?.name || 'Unknown Plan'}</p>
                                    <p className="text-sm text-lumen-gray-500">
                                        Subscribed: {sub.startDate} to {sub.endDate}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-lumen-gray-600">₹{plan?.price}/mo</p>
                                    <span className="text-xs font-medium bg-lumen-gray-200 text-lumen-gray-600 px-2 py-1 rounded-full">
                                        Cancelled
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AIRecommendationPanel: React.FC<{ user: User, allPlans: Plan[] }> = ({ user, allPlans }) => {
    const [recommendation, setRecommendation] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendation = async () => {
            setLoading(true);
            const result = await getPlanRecommendation(user, allPlans);
            setRecommendation(result);
            setLoading(false);
        };
        fetchRecommendation();
    }, [user, allPlans]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-lumen-gray-700 mb-4 flex items-center">
               
                Recommendations
            </h3>
            {loading ? (
                <div className="flex items-center space-x-2 text-lumen-gray-500">
                    <div className="w-4 h-4 border-2 border-lumen-blue border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating your personalized recommendation...</span>
                </div>
            ) : (
                <p className="text-lumen-gray-600 text-sm" dangerouslySetInnerHTML={{ __html: recommendation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
            )}
        </div>
    );
};

const DiscountsPanel: React.FC<{ discounts: Discount[] }> = ({ discounts }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-lumen-gray-700 mb-4 flex items-center">
                <TagIcon className="w-6 h-6 mr-2 text-lumen-green"/>
                Available Offers
            </h3>
            <ul className="space-y-3">
                {discounts.map(discount => (
                    <li key={discount.id} className="p-3 bg-lumen-gray-50 rounded-md border border-lumen-gray-200">
                        <p className="font-bold text-lumen-green">{discount.code}</p>
                        <p className="text-sm text-lumen-gray-600">{discount.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const SuggestedPlansPanel: React.FC<{
  suggestedPlans: Plan[];
  currentPlanId?: string;
  onSelectPlan: (planId: string) => void;
}> = ({ suggestedPlans, currentPlanId, onSelectPlan }) => {
  if (suggestedPlans.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-lumen-gray-700 mb-4">
        Suggested Plans For You
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suggestedPlans.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={plan.id === currentPlanId}
            onSelect={onSelectPlan}
          />
        ))}
      </div>
    </div>
  );
};


export default UserDashboard;