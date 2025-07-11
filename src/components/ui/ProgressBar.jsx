import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ 
  progress = 0, 
  variant = 'primary', 
  size = 'md',
  showLabel = true,
  label,
  className = '',
  ...props 
}) => {
  const baseClasses = "relative overflow-hidden rounded-full";
  
  const variants = {
    primary: "bg-primary-100",
    success: "bg-success-100",
    warning: "bg-warning-100",
    error: "bg-error-100",
  };
  
  const barVariants = {
    primary: "bg-gradient-to-r from-primary-500 to-primary-600",
    success: "bg-gradient-to-r from-success-500 to-success-600",
    warning: "bg-gradient-to-r from-warning-500 to-warning-600",
    error: "bg-gradient-to-r from-error-500 to-error-600",
  };
  
  const sizes = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-secondary-700">
            {label || 'Progress'}
          </span>
          <span className="text-sm font-medium text-secondary-600">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      
      <div className={classes} {...props}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full ${barVariants[variant]} relative overflow-hidden`}
        >
          <motion.div
            animate={{ x: ["0%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressBar; 