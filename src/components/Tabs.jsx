export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-1 bg-amber-100 p-1 rounded-full w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            activeTab === tab.value
              ? 'bg-white text-amber-700 shadow-sm'
              : 'text-amber-700/70 hover:text-amber-700'
          }`}
        >
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
