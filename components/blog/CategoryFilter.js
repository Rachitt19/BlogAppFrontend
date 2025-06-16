'use client';

import React from 'react';
import Button from '../ui/Button';
import { CATEGORIES } from '../../utils/constants';

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {CATEGORIES.map(category => (
        <Button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          variant={activeCategory === category.id ? 'active' : 'secondary'}
          className={activeCategory === category.id ? `bg-gradient-to-r ${category.color}` : ''}
          aria-pressed={activeCategory === category.id}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;