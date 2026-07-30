import { motion } from 'framer-motion';

const SectionHeader = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  align = 'center',
  className = '' 
}) => {
  return (
    <div className={`text-center ${className}`}>
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/20 text-teal-500 mb-4"
        >
          <Icon className="w-8 h-8" />
        </motion.div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-2 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>
      )}
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: 80 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="h-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full mx-auto mt-4"
      />
    </div>
  );
};

export default SectionHeader;