import React from 'react';
import { LayoutGrid } from 'lucide-react';
import Chip from '../../../components/ui/Chip';
import ScrollChipRail from '../../../components/ui/ScrollChipRail';

function formatCategoryLabel(tab) {
  if (!tab || tab === 'All') return 'All';
  return String(tab)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ExploreCategoryBar({ categories, activeTab, onTabPress, counts = {} }) {
  return (
    <ScrollChipRail muted scrollStep={200} style={{ marginBottom: 18 }}>
      {categories.map((tab) => {
        const isActive = activeTab === tab;
        const count = counts[tab] ?? 0;
        const label = formatCategoryLabel(tab);

        return (
          <Chip
            key={tab}
            active={isActive}
            label={label}
            count={count}
            onClick={() => onTabPress(tab)}
            icon={
              tab === 'All' ? (
                <LayoutGrid size={14} strokeWidth={2.25} style={{ opacity: isActive ? 1 : 0.65 }} />
              ) : null
            }
          />
        );
      })}
    </ScrollChipRail>
  );
}
