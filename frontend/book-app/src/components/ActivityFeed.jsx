
import React from "react";

export default function ActivityFeed({ items = [] }) {
  if (!Array.isArray(items)) items = [];

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900 mb-2">Recent activity</h2>

      {items.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm font-medium text-slate-700">No activity yet</p>
          <p className="text-[11px] text-slate-500">
            New users, books, and orders will appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li
              key={a.id || `${a.type}-${a.when}-${a.title}`}
              className="flex items-start gap-3"
            >
              <span className="mt-0.5 h-2 w-2 rounded-full bg-slate-300" />
              <div className="flex-1">
                <p className="text-sm text-slate-800">
               
                  <span className="mr-2 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {a.type}
                  </span>
                  {a.title}
                </p>
                {a.subtitle && (
                  <p className="text-[11px] text-slate-500">{a.subtitle}</p>
                )}
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {a.whenLabel || new Date(a.when).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
