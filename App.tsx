import React from 'react';
import { View, Text } from 'react-native';
import AppEntry from './src/app/AppEntry';

console.log('🔴 App.tsx - Rendering AppEntry');

export default function App() {
  console.log('🔴 App.tsx - Component executing');
  return (
    <>
      {console.log('🔴 App.tsx - About to return AppEntry')}
      <AppEntry />
    </>
  );
}
