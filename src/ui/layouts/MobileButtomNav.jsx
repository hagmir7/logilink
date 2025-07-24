import { ArrowDown, ArrowDownFromLine, ArrowRightLeft, ArrowUpFromLine, ShoppingBag } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export default function MobileBottomNav() {
  return (
    <nav className='fixed lg:hidden bottom-0 z-50 left-0 right-0 w-full bg-white border-t border-gray-300 shadow-md rounded-t-xl'>
      <div className='flex justify-around items-center py-2'>
        {/* Shop */}
        <Link
          to='/'
          className='flex flex-col items-center justify-center text-gray-600 hover:text-black'
        >
          <ShoppingBag className='h-6 w-6 mb-1' />
          <span className='text-sm'>Preparation</span>
        </Link>

        {/* Wishlist */}
        <a
          href='https://laca.ma/cart'
          className='relative flex flex-col items-center justify-center text-gray-600 hover:text-black'
        >
          <ArrowUpFromLine className='h-6 w-6 mb-1' />
          <span className='text-sm'>Sortie</span>
        </a>

        {/* Cart */}
        <a
          href='https://laca.ma/cart'
          className='relative flex flex-col items-center justify-center text-gray-600 hover:text-black'
        >
          <ArrowDownFromLine className='h-6 w-6 mb-1' />
          <span className='text-sm'>Entrée</span>
        </a>

        {/* Menu */}
        <Link
          to='/transfer-order'
          className='flex flex-col items-center justify-center text-gray-600 hover:text-black'
        >
          <ArrowRightLeft className='h-6 w-6 mb-1' />
          <span className='text-sm'>Transfert</span>
        </Link>
      </div>
    </nav>
  )
}
