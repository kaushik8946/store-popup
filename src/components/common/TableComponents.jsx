import React from 'react';

// Reusable table components
export const TableHeader = ({ children, className = '' }) => (
  <th scope="col" className={`p-2 text-start small fw-semibold text-secondary text-uppercase border-bottom border-secondary bg-light ${className}`}>
    {children}
  </th>
);

export const TableData = ({ children, className = '' }) => (
  <td className={`p-2 text-nowrap small text-dark border-bottom border-light-subtle ${className}`}>
    {children}
  </td>
);
