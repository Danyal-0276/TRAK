import React from 'react';
import { Compass } from 'lucide-react-native';
import AccentTabHeader from '../../../components/ui/AccentTabHeader';

export default function DiscoverScreenHeader() {
  return (
    <AccentTabHeader
      title="Discover"
      subtitle="Explore topics & sources"
      icon={Compass}
    />
  );
}
