import React from 'react';

const Table = ({ headers, children }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-800 bg-card-bg">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5 text-gray-400 uppercase text-xs font-medium">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-4">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
