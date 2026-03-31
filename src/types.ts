import React from 'react';

export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  component: React.ReactNode;
  color: string;
  accent: string;
}
