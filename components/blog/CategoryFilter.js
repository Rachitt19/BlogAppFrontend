'use client';

import React from 'react';
import Button from '../ui/Button';
import { CATEGORIES } from '../../utils/constants';

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex flex-row gap-3 px-2 py-1 snap-x snap-mandatory">
        {CATEGORIES.map(category => (
          <Button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            variant={activeCategory === category.id ? 'active' : 'secondary'}
            className={`
              snap-start whitespace-nowrap
              ${activeCategory === category.id ? `bg-gradient-to-r ${category.color}` : ''}
            `}
            aria-pressed={activeCategory === category.id}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
