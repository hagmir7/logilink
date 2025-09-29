import React from 'react';

export default function SkeletonTable() {
  return (
    <>
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <tr key={index}>
            <td colSpan={7} className="px-6 py-2">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        ))}
    </>
  );
}
