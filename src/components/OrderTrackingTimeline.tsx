import React from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';

interface TimelineStep {
  status: string;
  label: string;
  icon: React.ReactNode;
  timestamp?: string;
  completed: boolean;
  current?: boolean;
}

interface OrderTrackingTimelineProps {
  status: string;
  orderDate?: string;
}

export const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({
  status,
  orderDate
}) => {
  // Define the tracking steps
  const steps: TimelineStep[] = [
    {
      status: 'pending',
      label: 'Order Placed',
      icon: <Clock size={20} />,
      timestamp: orderDate,
      completed: true
    },
    {
      status: 'processing',
      label: 'Processing',
      icon: <Package size={20} />,
      completed: ['processing', 'shipped', 'out_for_delivery', 'delivered'].includes(status)
    },
    {
      status: 'shipped',
      label: 'Shipped',
      icon: <Truck size={20} />,
      completed: ['shipped', 'out_for_delivery', 'delivered'].includes(status)
    },
    {
      status: 'out_for_delivery',
      label: 'Out for Delivery',
      icon: <MapPin size={20} />,
      completed: ['out_for_delivery', 'delivered'].includes(status)
    },
    {
      status: 'delivered',
      label: 'Delivered',
      icon: <CheckCircle size={20} />,
      completed: status === 'delivered'
    }
  ];

  // Find current step index
  const getCurrentStepIndex = () => {
    const statusMap: Record<string, number> = {
      'pending': 0,
      'processing': 1,
      'shipped': 2,
      'out_for_delivery': 3,
      'delivered': 4
    };
    return statusMap[status] || 0;
  };

  const activeIndex = getCurrentStepIndex();

  return (
    <div className="py-6">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-800">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(activeIndex / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#7C3AED]"
          />
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => {
            const isCompleted = index <= activeIndex;
            const isCurrent = index === activeIndex;

            return (
              <motion.div
                key={step.status}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-4"
              >
                {/* Icon */}
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCurrent
                      ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/30'
                      : isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-[#141414] border-gray-800 text-gray-600'
                  }`}
                >
                  {step.icon}
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-2 border-[#7C3AED]"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div
                    className={`font-medium ${
                      isCurrent ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-gray-600'
                    }`}
                  >
                    {step.label}
                  </div>
                  {step.timestamp && (
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(step.timestamp).toLocaleString()}
                    </div>
                  )}
                  {isCurrent && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-[#7C3AED] mt-2"
                    >
                      Current Status
                    </motion.div>
                  )}
                </div>

                {/* Checkmark for completed */}
                {isCompleted && !isCurrent && (
                  <CheckCircle size={20} className="text-emerald-500 mt-1" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
