import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Input = ({ 
  label, 
  type = 'text', 
  placeholder,
  value,
  onChange,
  onKeyPress,
  disabled = false,
  error = false,
  helperText,
  className = '',
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const baseClasses = "w-full px-4 py-3 text-base bg-white border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const stateClasses = error
    ? "border-error-300 focus:border-error-500 focus:ring-error-500"
    : "border-secondary-200 focus:border-primary-500 focus:ring-primary-500 hover:border-secondary-300";
  
  const classes = `${baseClasses} ${stateClasses} ${className}`;
  
  return (
    <div className="relative">
      {label && (
        <motion.label
          initial={false}
          animate={{
            y: isFocused || value ? -8 : 12,
            scale: isFocused || value ? 0.85 : 1,
            color: error ? '#ef4444' : isFocused ? '#3b82f6' : '#64748b'
          }}
          transition={{ duration: 0.2 }}
          className="absolute left-4 pointer-events-none font-medium origin-left z-10 bg-white px-1"
        >
          {label}
        </motion.label>
      )}
      
      <motion.input
        whileFocus={{ scale: 1.01 }}
        type={type}
        placeholder={!label ? placeholder : ''}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        className={classes}
        {...props}
      />
      
      {helperText && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-2 text-sm ${error ? 'text-error-600' : 'text-secondary-600'}`}
        >
          {helperText}
        </motion.p>
      )}
    </div>
  );
};

export default Input; 