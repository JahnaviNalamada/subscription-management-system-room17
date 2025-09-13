
import { plans, discounts, users, subscriptions, analyticsData } from '../data/mockData';
import type { Plan, Discount, Subscription, User, AnalyticsData } from '../types';

const SIMULATED_DELAY = 500;

const simulateApi = <T,>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), SIMULATED_DELAY));
};

export const getPlans = (): Promise<Plan[]> => simulateApi(plans);
export const getDiscounts = (): Promise<Discount[]> => simulateApi(discounts);
export const getUser = (id: string): Promise<User | undefined> => simulateApi(users.find(u => u.id === id));
export const getSubscription = (id: string): Promise<Subscription | undefined> => simulateApi(subscriptions.find(s => s.id === id));
export const getSubscriptionsForUser = (userId: string): Promise<Subscription[]> => simulateApi(subscriptions.filter(s => s.userId === userId));
export const getAnalytics = (): Promise<AnalyticsData> => simulateApi(analyticsData);

export const updatePlan = async (updatedPlan: Plan): Promise<Plan> => {
    const index = plans.findIndex(p => p.id === updatedPlan.id);
    if (index !== -1) {
        plans[index] = updatedPlan;
    }
    return simulateApi(updatedPlan);
};

export const createPlan = async (newPlan: Omit<Plan, 'id'>): Promise<Plan> => {
    const planWithId = { ...newPlan, id: `plan${Date.now()}` };
    plans.push(planWithId);
    return simulateApi(planWithId);
};

export const deletePlan = async (planId: string): Promise<{ success: boolean }> => {
    const index = plans.findIndex(p => p.id === planId);
    if (index !== -1) {
        plans.splice(index, 1);
        return simulateApi({ success: true });
    }
    return simulateApi({ success: false });
};

export const updateUserSubscription = async (userId: string, newPlanId: string | null, status: 'active' | 'cancelled'): Promise<Subscription | null> => {
    const user = users.find(u => u.id === userId);
    if (!user) return simulateApi(null);

    const activeSub = subscriptions.find(s => s.userId === userId && s.status === 'active');
    
    if (activeSub) {
        const oldSubIndex = subscriptions.findIndex(s => s.id === activeSub.id);
        if (oldSubIndex !== -1) {
            subscriptions[oldSubIndex].status = 'cancelled';
            subscriptions[oldSubIndex].endDate = new Date().toISOString().split('T')[0];
        }
    }
    
    if (newPlanId && status === 'active') {
        const newSub: Subscription = {
            id: `sub${Date.now()}`,
            userId,
            planId: newPlanId,
            status: 'active',
            startDate: new Date().toISOString().split('T')[0],
            endDate: null,
            autoRenew: true,
        };
        subscriptions.push(newSub);
        user.subscriptionIds.push(newSub.id);
        return simulateApi(newSub);
    } else {
        return simulateApi(null);
    }
};
