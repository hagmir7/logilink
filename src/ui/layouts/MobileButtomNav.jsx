import { ArrowDown, ArrowDownFromLine, ArrowRightLeft, ArrowUpFromLine } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export default function MobileBottomNav() {
  return (
    <nav className="fixed lg:hidden bottom-0 z-50 left-0 right-0 w-full bg-white border-t border-gray-300 shadow-md rounded-t-xl">
      <div className="flex justify-around items-center py-2">
        {/* Shop */}
        <a
          href="https://laca.ma/shop"
          className="flex flex-col items-center justify-center text-gray-600 hover:text-black"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mb-1"
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M8.935 7H7.773c-1.072 0-1.962.81-2.038 1.858l-.73 10C4.921 20.015 5.858 21 7.043 21h9.914c1.185 0 2.122-.985 2.038-2.142l-.73-10C18.189 7.81 17.299 7 16.227 7h-1.162m-6.13 0V5c0-1.105.915-2 2.043-2h2.044c1.128 0 2.043.895 2.043 2v2m-6.13 0h6.13"
            />
          </svg>
          <span className="text-sm">Boutique</span>
        </a>

        {/* Wishlist */}
          <a
          href="https://laca.ma/cart"
          className="relative flex flex-col items-center justify-center text-gray-600 hover:text-black"
        >
          <ArrowUpFromLine className='h-6 w-6 mb-1' />
          <span className="text-sm">Sortie</span>
        </a>

        {/* Cart */}
        <a
          href="https://laca.ma/cart"
          className="relative flex flex-col items-center justify-center text-gray-600 hover:text-black"
        >
          <ArrowDownFromLine className='h-6 w-6 mb-1' />
          <span className="text-sm">Entrée</span>
        </a>

        {/* Menu */}
        <Link
          to="/"
          className="flex flex-col items-center justify-center text-gray-600 hover:text-black"
        >
          <ArrowRightLeft className='h-6 w-6 mb-1' />
          <span className="text-sm">Transfert</span>
        </Link>
      </div>
    </nav>
  );
}
