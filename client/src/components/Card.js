export default function Card({ title, children, actions }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {(title || actions) && (
        <div className="flex justify-between items-center mb-4">
          {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
