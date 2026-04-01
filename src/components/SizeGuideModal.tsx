import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: 'clothing' | 'shoes' | 'accessories';
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, category = 'clothing' }) => {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  // Size data for clothing
  const clothingSizes = [
    { size: 'XS', chest: { inches: '32-34', cm: '81-86' }, waist: { inches: '24-26', cm: '61-66' }, hips: { inches: '34-36', cm: '86-91' } },
    { size: 'S', chest: { inches: '34-36', cm: '86-91' }, waist: { inches: '26-28', cm: '66-71' }, hips: { inches: '36-38', cm: '91-97' } },
    { size: 'M', chest: { inches: '38-40', cm: '97-102' }, waist: { inches: '30-32', cm: '76-81' }, hips: { inches: '40-42', cm: '102-107' } },
    { size: 'L', chest: { inches: '42-44', cm: '107-112' }, waist: { inches: '34-36', cm: '86-91' }, hips: { inches: '44-46', cm: '112-117' } },
    { size: 'XL', chest: { inches: '46-48', cm: '117-122' }, waist: { inches: '38-40', cm: '97-102' }, hips: { inches: '48-50', cm: '122-127' } },
    { size: 'XXL', chest: { inches: '50-52', cm: '127-132' }, waist: { inches: '42-44', cm: '107-112' }, hips: { inches: '52-54', cm: '132-137' } },
  ];

  const shoeSizes = [
    { size: 'US 6', uk: 'UK 5', eu: 'EU 38', cm: '23.5' },
    { size: 'US 7', uk: 'UK 6', eu: 'EU 39', cm: '24.5' },
    { size: 'US 8', uk: 'UK 7', eu: 'EU 40', cm: '25.5' },
    { size: 'US 9', uk: 'UK 8', eu: 'EU 41', cm: '26.5' },
    { size: 'US 10', uk: 'UK 9', eu: 'EU 42', cm: '27.5' },
    { size: 'US 11', uk: 'UK 10', eu: 'EU 43', cm: '28.5' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] overflow-y-auto z-[101]"
          >
            <div className="bg-[#141414] rounded-3xl border border-gray-800 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <Ruler size={22} className="text-[#7C3AED]" />
                  <div className="text-xl font-medium">Size Guide</div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center hover:bg-rose-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Unit Toggle */}
              {category === 'clothing' && (
                <div className="p-6 pb-0">
                  <div className="flex items-center justify-center gap-2 bg-black rounded-xl p-1 inline-flex mx-auto mb-6">
                    <button
                      onClick={() => setUnit('inches')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        unit === 'inches' ? 'bg-[#7C3AED] text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Inches
                    </button>
                    <button
                      onClick={() => setUnit('cm')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        unit === 'cm' ? 'bg-[#7C3AED] text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Centimeters
                    </button>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6 pt-2">
                {category === 'clothing' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3 px-4 text-gray-500 font-medium">Size</th>
                          <th className="text-center py-3 px-4 text-gray-500 font-medium">Chest</th>
                          <th className="text-center py-3 px-4 text-gray-500 font-medium">Waist</th>
                          <th className="text-center py-3 px-4 text-gray-500 font-medium">Hips</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clothingSizes.map((row, idx) => (
                          <tr key={row.size} className={idx !== clothingSizes.length - 1 ? 'border-b border-gray-800/50' : ''}>
                            <td className="py-3 px-4 font-medium text-white">{row.size}</td>
                            <td className="py-3 px-4 text-center text-gray-300">{unit === 'inches' ? row.chest.inches : row.chest.cm}</td>
                            <td className="py-3 px-4 text-center text-gray-300">{unit === 'inches' ? row.waist.inches : row.waist.cm}</td>
                            <td className="py-3 px-4 text-center text-gray-300">{unit === 'inches' ? row.hips.inches : row.hips.cm}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : category === 'shoes' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3 px-4 text-gray-500 font-medium">US</th>
                          <th className="text-center py-3 px-4 text-gray-500 font-medium">UK</th>
                          <th className="text-center py-3 px-4 text-gray-500 font-medium">EU</th>
                          <th className="text-center py-3 px-4 text-gray-500 font-medium">CM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shoeSizes.map((row, idx) => (
                          <tr key={row.size} className={idx !== shoeSizes.length - 1 ? 'border-b border-gray-800/50' : ''}>
                            <td className="py-3 px-4 font-medium text-white">{row.size}</td>
                            <td className="py-3 px-4 text-center text-gray-300">{row.uk}</td>
                            <td className="py-3 px-4 text-center text-gray-300">{row.eu}</td>
                            <td className="py-3 px-4 text-center text-gray-300">{row.cm}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Ruler size={48} className="mx-auto mb-4 opacity-50" />
                    <div>Size guide not available for this category</div>
                  </div>
                )}

                {/* How to measure */}
                <div className="mt-8 p-4 bg-black rounded-2xl">
                  <div className="text-sm font-medium text-white mb-3">How to Measure</div>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div><strong className="text-white">Chest:</strong> Measure around the fullest part of your chest</div>
                    <div><strong className="text-white">Waist:</strong> Measure around your natural waistline</div>
                    <div><strong className="text-white">Hips:</strong> Measure around the fullest part of your hips</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
