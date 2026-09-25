export function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      <td className="px-4 py-3"><div className="skeleton h-3.5 w-8" /></td>
      <td className="px-4 py-3">
        <div className="skeleton h-3.5 w-52 mb-1.5" />
        <div className="skeleton h-3 w-32" />
      </td>
      <td className="px-4 py-3"><div className="skeleton h-3.5 w-14" /></td>
      <td className="px-4 py-3"><div className="skeleton h-3.5 w-20" /></td>
      <td className="px-4 py-3 hidden sm:table-cell"><div className="skeleton h-3.5 w-24" /></td>
      <td className="px-4 py-3"><div className="skeleton h-3.5 w-12" /></td>
    </tr>
  );
}

export function SkeletonDetail() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-4 w-32" />
      <div className="skeleton h-6 w-2/3" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-5/6" />
      <div className="skeleton h-4 w-4/6" />
    </div>
  );
}
