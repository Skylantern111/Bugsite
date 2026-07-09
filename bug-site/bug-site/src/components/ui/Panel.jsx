// Generic content container reused across pages. Unlike the reference demo's
// Card component, this intentionally has no "bug badge" chrome — BugSite is
// meant to look and feel like a real store, not a labeled bug catalog.
export default function Panel({ title, icon: Icon, children, className = '' }) {
    return (
        <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm ${className}`}>
            {title && (
                <div className="flex items-center gap-2 mb-4">
                    {Icon && <Icon className="w-5 h-5 text-indigo-500" />}
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                </div>
            )}
            {children}
        </div>
    );
}
