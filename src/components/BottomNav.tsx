import { Home, MessageCircle, Heart, User } from 'lucide-react'

type Tab = 'home' | 'chat' | 'favorites' | 'profile'

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const TABS = [
  { id: 'home' as Tab, label: 'Головна', Icon: Home },
  { id: 'chat' as Tab, label: 'AI Chat', Icon: MessageCircle },
  { id: 'favorites' as Tab, label: 'Збережені', Icon: Heart },
  { id: 'profile' as Tab, label: 'Профіль', Icon: User },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          id={`nav-${id}`}
          onClick={() => onTabChange(id)}
          className={`nav-item ${activeTab === id ? 'active' : ''}`}
        >
          <div className="nav-icon-wrap">
            <Icon size={20} />
          </div>
          {label}
        </button>
      ))}
    </nav>
  )
}
