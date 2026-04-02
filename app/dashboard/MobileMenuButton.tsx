// app/dashboard/MobileMenuButton.tsx
'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="md:hidden p-2 text-zinc-600 dark:text-zinc-400"
      aria-label="Toggle menu"
    >
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );
}