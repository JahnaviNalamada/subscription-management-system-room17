
import React from 'react';
import type { Plan } from '../types';

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan?: boolean;
  onSelect: (planId: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, isCurrentPlan = false, onSelect }) => {
  const cardClasses = `border-2 rounded-lg p-6 flex flex-col h-full shadow-lg transition-transform transform hover:scale-105 ${
    isCurrentPlan ? 'bg-lumen-blue text-white border-lumen-blue' : 'bg-white border-lumen-gray-200'
  }`;
  
  const buttonClasses = `w-full mt-auto py-2 px-4 rounded-md font-semibold transition-colors ${
      isCurrentPlan 
      ? 'bg-white text-lumen-blue hover:bg-lumen-gray-100'
      : 'bg-lumen-blue text-white hover:bg-blue-700'
  }`;

  return (
    <div className={cardClasses}>
      <h3 className={`text-2xl font-bold ${isCurrentPlan ? 'text-white' : 'text-lumen-gray-900'}`}>{plan.name}</h3>
      <p className={`text-sm mb-4 ${isCurrentPlan ? 'text-blue-200' : 'text-lumen-gray-500'}`}>{plan.productType}</p>
      <div className="mb-6">
        <span className={`text-4xl font-extrabold ${isCurrentPlan ? 'text-white' : 'text-lumen-gray-900'}`}>₹{plan.price}</span>
        <span className={`${isCurrentPlan ? 'text-blue-200' : 'text-lumen-gray-500'}`}>/month</span>
      </div>
      <ul className={`space-y-3 mb-8 text-sm ${isCurrentPlan ? 'text-blue-100' : 'text-lumen-gray-600'}`}>
        <li className="flex items-center">
            <Checkmark/> {plan.dataQuota} GB Data Quota
        </li>
        <li className="flex items-center">
            <Checkmark/> {plan.speed} Speeds
        </li>
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Checkmark/> {feature}
          </li>
        ))}
      </ul>
      <button onClick={() => onSelect(plan.id)} className={buttonClasses} disabled={isCurrentPlan}>
        {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
      </button>
    </div>
  );
};

const Checkmark: React.FC = () => (
    <svg className="w-5 h-5 mr-2 text-lumen-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);


export default PlanCard;
