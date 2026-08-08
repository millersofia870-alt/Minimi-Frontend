import React from 'react';
import Badge from './Badge.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { statusStyle } from '../../data/mockData.js';

export default function StatusBadge({ status }) {
  const { c } = useTheme();
  const s = statusStyle(status, c);
  return <Badge bg={s.bg} text={s.text}>{s.label}</Badge>;
}
