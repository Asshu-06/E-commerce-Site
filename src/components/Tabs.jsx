export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
      {tabs.map((tab) => (
        <button key={tab.value} onClick={() => onChange(tab.value)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeTab === tab.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}>
          {tab.icon && <span className="opacity-70">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
