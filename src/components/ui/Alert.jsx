import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const Alert = ({ 
  variant = 'info', 
  title, 
  children, 
  closable = false,
  onClose,
  className = '',
  ...props 
}) => {
  const baseClasses = "p-4 rounded-xl border-l-4 relative";
  
  const variants = {
    info: "bg-primary-50 border-primary-500 text-primary-900",
    success: "bg-success-50 border-success-500 text-success-900",
    warning: "bg-warning-50 border-warning-500 text-warning-900",
    error: "bg-error-50 border-error-500 text-error-900",
  };
  
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
  };
  
  const iconColors = {
    info: "text-primary-500",
    success: "text-success-500",
    warning: "text-warning-500",
    error: "text-error-500",
  };
  
  const Icon = icons[variant];
  const classes = `${baseClasses} ${variants[variant]} ${className}`;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={classes}
      {...props}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 mt-0.5 ${iconColors[variant]} flex-shrink-0`} />
        
        <div className="flex-1">
          {title && (
            <h3 className="font-semibold text-sm mb-1">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
        
        {closable && (
          <button
            onClick={onClose}
            className="text-current opacity-60 hover:opacity-100 transition-opacity"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Alert; 