import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Coffee, DollarSign, Github } from 'lucide-react';

const Support = () => {
  const supportOptions = [
    {
      id: 1,
      name: 'GitHub Sponsors',
      description: 'Support development through GitHub',
      icon: Github,
      url: 'https://github.com/sponsors/nishal21',
      color: 'from-gray-700 to-gray-900',
      buttonColor: 'bg-gray-800 hover:bg-gray-700'
    },
    {
      id: 2,
      name: 'Buy Me a Coffee',
      description: 'Treat the developer to a coffee',
      icon: Coffee,
      url: 'https://buymeacoffee.com/kingtanjiro',
      color: 'from-yellow-500 to-orange-600',
      buttonColor: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      id: 3,
      name: 'Ko-fi',
      description: 'One-time or monthly support',
      icon: Heart,
      url: 'https://ko-fi.com/demon_king',
      color: 'from-red-500 to-pink-600',
      buttonColor: 'bg-red-500 hover:bg-red-600'
    }
  ];

  return (
    <div className="min-h-screen text-white pt-20 pb-12 px-4" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-full">
              <Heart className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Support the Developer
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Help keep this project alive and thriving! Your support enables continuous improvements, 
            new features, and ensures Otazumi remains free for everyone.
          </p>
        </motion.div>

        {/* Support Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {supportOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
              >
                <div className={`bg-gradient-to-r ${option.color} w-16 h-16 rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{option.name}</h3>
                <p className="text-gray-400 mb-4">{option.description}</p>
                <a
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center ${option.buttonColor} text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105`}
                >
                  Support Now
                </a>
              </motion.div>
            );
          })}
        </div>

        {/* Why Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-8 border border-purple-500/30 mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-400" />
            Why Support?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2 text-purple-400">🚀 Development</h3>
              <p className="text-gray-300">
                Your support helps dedicate more time to developing new features, improving performance, 
                and fixing bugs faster.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-blue-400">💾 Server Costs</h3>
              <p className="text-gray-300">
                Covers hosting, API costs, and infrastructure needed to keep the platform running smoothly 24/7.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-pink-400">✨ New Features</h3>
              <p className="text-gray-300">
                Enables development of exciting new features, improved UI/UX, and integration with more anime sources.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-green-400">🌟 Community</h3>
              <p className="text-gray-300">
                Shows appreciation and motivates continued development to serve the anime community better.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Thank You Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-gray-800/30 rounded-xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Thank You! 🙏</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Every contribution, no matter the size, makes a huge difference. Your support keeps this 
              project free and accessible to all anime fans. Thank you for being part of the Otazumi community!
            </p>
          </div>
        </motion.div>

        {/* Alternative Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <h3 className="text-xl font-semibold mb-4">Can't donate? No problem!</h3>
          <p className="text-gray-400 mb-4">
            You can still support by:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-gray-800/50 rounded-lg px-6 py-3 border border-gray-700">
              ⭐ Star on GitHub
            </div>
            <div className="bg-gray-800/50 rounded-lg px-6 py-3 border border-gray-700">
              📢 Share with friends
            </div>
            <div className="bg-gray-800/50 rounded-lg px-6 py-3 border border-gray-700">
              🐛 Report bugs
            </div>
            <div className="bg-gray-800/50 rounded-lg px-6 py-3 border border-gray-700">
              💡 Suggest features
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Support;
