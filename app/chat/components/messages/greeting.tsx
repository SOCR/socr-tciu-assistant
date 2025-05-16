import { motion } from 'framer-motion';

export const Greeting = () => {
  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-4xl font-semibold"
      >
        <span className="text-4xl font-bold font-display bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
          Hello there!
        </span>
        {/* Hello there! */}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-3xl text-zinc-500"
      >
        Welcome to TCIU assistant!
      </motion.div>
    </div>
  );
};
