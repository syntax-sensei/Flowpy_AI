import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  variant = 'default', 
  className = '', 
  hover = true,
  ...props 
}) => {
  const baseClasses = "rounded-2xl border transition-all duration-300";
  
  const variants = {
    default: "bg-white border-secondary-200 shadow-soft hover:shadow-medium",
    gradient: "bg-gradient-to-br from-white to-secondary-50 border-secondary-200 shadow-soft hover:shadow-medium",
    glass: "bg-white/80 backdrop-blur-sm border-secondary-200/50 shadow-soft hover:shadow-medium",
    primary: "bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 shadow-soft hover:shadow-medium",
    success: "bg-gradient-to-br from-success-50 to-success-100 border-success-200 shadow-soft hover:shadow-medium",
    warning: "bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200 shadow-soft hover:shadow-medium",
    error: "bg-gradient-to-br from-error-50 to-error-100 border-error-200 shadow-soft hover:shadow-medium",
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${className}`;
  
  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className={classes}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card; 