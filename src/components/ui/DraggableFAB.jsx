import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function DraggableFAB() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: settings = [] } = useQuery({
    queryKey: ['appSettings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.AppSettings.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const defaultPosition = settings[0]?.fab_position || 'left';
  
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('fab-position');
    return saved || defaultPosition;
  });

  useEffect(() => {
    if (defaultPosition && !localStorage.getItem('fab-position')) {
      setPosition(defaultPosition);
    }
  }, [defaultPosition]);

  useEffect(() => {
    localStorage.setItem('fab-position', position);
  }, [position]);

  return (
    <div
      className={`fixed bottom-28 z-50 transition-all duration-300 ${
        position === 'right' ? 'right-5' : 'left-5'
      }`}
    >
      <Link
        to={createPageUrl('QuickAdd')}
        style={{
          backgroundColor: settings[0]?.primary_color || '#2d91a8',
          boxShadow: `0 10px 25px ${settings[0]?.primary_color || '#2d91a8'}30`
        }}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300 active:scale-95"
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2} />
      </Link>
    </div>
  );
}