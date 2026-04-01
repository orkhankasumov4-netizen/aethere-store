import React from 'react';


export const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-gray-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-purple-500" />
            <div className="font-semibold text-xl">AETHER</div>
          </div>
          <div className="text-gray-500 text-sm">Premium goods for the discerning.</div>
        </div>

        <div>
          <div className="font-medium text-sm mb-4 text-white">SHOP</div>
          <div className="space-y-2 text-sm text-gray-500">
            <div>New Arrivals</div>
            <div>Best Sellers</div>
            <div>Sale</div>
            <div>Gift Cards</div>
          </div>
        </div>

        <div>
          <div className="font-medium text-sm mb-4 text-white">SUPPORT</div>
          <div className="space-y-2 text-sm text-gray-500">
            <div>Shipping</div>
            <div>Returns</div>
            <div>FAQ</div>
            <div>Contact Us</div>
          </div>
        </div>

        <div>
          <div className="font-medium text-sm mb-4 text-white">COMPANY</div>
          <div className="space-y-2 text-sm text-gray-500">
            <div>About Us</div>
            <div>Careers</div>
            <div>Press</div>
            <div>Sustainability</div>
          </div>
        </div>

        <div>
          <div className="font-medium text-sm mb-4 text-white">CONNECT</div>
          <div className="space-y-2 text-sm text-gray-500">
            <a href="#" className="hover:text-white">Instagram</a>
            <a href="#" className="hover:text-white">Twitter</a>
            <a href="#" className="hover:text-white">Pinterest</a>
            <a href="#" className="hover:text-white">TikTok</a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <div>© {new Date().getFullYear()} AETHER. All Rights Reserved.</div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <div>Privacy</div>
          <div>Terms</div>
          <div>Legal</div>
          <div>Accessibility</div>
        </div>
      </div>
    </footer>
  );
};
