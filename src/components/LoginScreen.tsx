import { useState } from 'react'
import { Eye, EyeOff, Leaf } from 'lucide-react'

interface LoginScreenProps {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin()
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(160deg, #2ecc71 0%, #27ae60 60%, #1e8449 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      {/* Logo */}
      <div className="animate-slide-up flex flex-col items-center gap-4 mb-10">
        <div style={{ width: 90, height: 90, background: 'rgba(255,255,255,0.2)', borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.3)' }}>
          <div style={{ width: 66, height: 66, background: 'white', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={32} color="#2ecc71" />
          </div>
        </div>
        <div className="text-center">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <h1 className="font-display font-black text-white" style={{ fontSize: 32, letterSpacing: -0.5 }}>MealSwap</h1>
            <span style={{ fontSize: 12, fontWeight: 900, color: '#2ecc71', background: 'white', padding: '2px 8px', borderRadius: 8, transform: 'rotate(5deg)' }}>V5</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 }}>AI · Їжа · Здоров'я</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="animate-fade-in w-full" style={{ maxWidth: 340 }}>
        <div className="flex flex-col gap-5">
          <div>
            <input
              id="login-email"
              type="email"
              className="input-field"
              placeholder="Email / Ім'я користувача"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              className="input-field"
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ paddingRight: 36 }}
            />
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                style={{ accentColor: 'white', width: 14, height: 14 }}
              />
              Запам'ятати мене
            </label>
            <button type="button" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
              Забув пароль?
            </button>
          </div>

          <button
            id="login-btn"
            type="submit"
            style={{ background: 'white', color: '#27ae60', border: 'none', borderRadius: 14, fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '0.95rem', padding: '15px 24px', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', transition: 'all 0.2s ease', marginTop: 4 }}
          >
            Увійти
          </button>
        </div>
      </form>

      {/* Sign up link */}
      <p className="animate-fade-in" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 28, textAlign: 'center' }}>
        Немає акаунту?{' '}
        <button
          id="signup-link"
          onClick={onLogin}
          style={{ background: 'none', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
        >
          Зареєструватись
        </button>
      </p>

      {/* Decorative circles */}
      <div style={{ position: 'fixed', bottom: -60, left: -60, width: 200, height: 200, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', top: -40, right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.07)', borderRadius: '50%', pointerEvents: 'none' }} />
    </div>
  )
}
