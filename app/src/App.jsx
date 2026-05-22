import React, { useState, useEffect, useCallback } from 'react'

const API = import.meta.env.VITE_API_URL || ''

const SIGNAL_COLORS = {
  WAR:      { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   text: '#ef4444' },
  ECONOMIC: { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  text: '#f59e0b' },
  HEALTH:   { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  text: '#10b981' },
  POLITICAL:{ bg: 'rgba(124,58,237,0.12)',  border: 'rgba(124,58,237,0.3)',  text: '#a78bfa' },
  SOCIAL:   { bg: 'rgba(236,72,153,0.12)',  border: 'rgba(236,72,153,0.3)',  text: '#ec4899' },
  TECH:     { bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.3)',   text: '#06b6d4' },
  DISASTER: { bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.3)',  text: '#f97316' },
}

function ScoreBar({ score }) {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#6b6485'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
      <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: '2px',
          transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: '11px', color, fontWeight: '700', minWidth: '32px', textAlign: 'right' }}>
        {score}%
      </span>
    </div>
  )
}

function PlanetRow({ p }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0',
      borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: '105px', fontSize: '13px', color: 'var(--text-2)', flexShrink: 0 }}>
        {p.label}
      </div>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent-l)' }}>
          г.{p.gate}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-2)', marginLeft: '6px' }}>
          {p.archetype}
        </span>
      </div>
      {p.countdown && p.countdown !== '—' && (
        <div style={{ fontSize: '11px', color: 'var(--text-3)', flexShrink: 0 }}>
          ⏱ {p.countdown}
        </div>
      )}
    </div>
  )
}

function NewsItem({ item }) {
  const hasScore = item.score > 0
  const cats = (item.categories || []).map(c => SIGNAL_COLORS[c]).filter(Boolean)
  const catColor = cats[0]?.text || 'var(--text-3)'

  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer"
      style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          {hasScore && (
            <div style={{ width: '6px', height: '6px', borderRadius: '50%',
              background: catColor, marginTop: '6px', flexShrink: 0 }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.4, fontWeight: '500' }}>
              {item.title}
            </div>
            {hasScore && item.explanation && (
              <>
                <ScoreBar score={item.score} />
                <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '3px' }}>
                  {item.explanation}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </a>
  )
}

function ForecastBanner({ text }) {
  if (!text) return null
  return (
    <div style={{
      background: 'rgba(124,58,237,0.08)',
      border: '1px solid rgba(124,58,237,0.2)',
      borderRadius: '12px',
      padding: '12px 14px',
      marginBottom: '14px',
      fontSize: '13px',
      color: 'var(--text-2)',
      lineHeight: 1.5,
    }}>
      <span style={{ color: 'var(--accent-l)', fontWeight: '700', marginRight: '6px' }}>
        🔭 Сейчас:
      </span>
      {text}
    </div>
  )
}

function ConfirmationBlock({ data }) {
  if (!data || !data.confirmed_news?.length) return null

  const signalLabels = [...new Set(data.predicted_signals?.map(s => s.label) || [])].slice(0, 2)
  const catColors = {
    WAR: '#ef4444', ECONOMIC: '#f59e0b', HEALTH: '#10b981',
    POLITICAL: '#a78bfa', SOCIAL: '#ec4899', TECH: '#06b6d4', DISASTER: '#f97316',
  }

  return (
    <div style={{
      background: 'rgba(16,185,129,0.06)',
      border: '1px solid rgba(16,185,129,0.2)',
      borderRadius: '14px',
      padding: '14px',
      marginBottom: '16px',
    }}>
      {/* Заголовок */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '16px' }}>✅</span>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#10b981' }}>
            Предсказали → Сбылось
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '1px' }}>
            {data.summary}
          </div>
        </div>
      </div>

      {/* Сигналы-пилюли */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
        {signalLabels.map((label, i) => (
          <span key={i} style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '20px', padding: '2px 9px',
            fontSize: '11px', fontWeight: '600', color: '#10b981',
          }}>{label}</span>
        ))}
        <span style={{ fontSize: '11px', color: 'var(--text-3)', padding: '2px 4px' }}>→</span>
        <span style={{
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: '20px', padding: '2px 9px',
          fontSize: '11px', color: '#10b981',
        }}>{data.confirmed_news.length} совпадений в новостях</span>
      </div>

      {/* Новости-подтверждения */}
      {data.confirmed_news.map((item, i) => {
        const cat = item.categories?.[0]
        const dotColor = catColors[cat] || '#10b981'
        return (
          <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
            style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
              display: 'flex', gap: '8px', alignItems: 'flex-start',
              padding: '6px 0',
              borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <div style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: dotColor, marginTop: '5px', flexShrink: 0,
              }} />
              <span style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.4 }}>
                {item.title}
              </span>
            </div>
          </a>
        )
      })}
    </div>
  )
}

export default function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('news') // news по умолчанию — самое понятное

  const load = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch(`${API}/radar/api/radar`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const d = await res.json()
      setData(d)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [load])

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100dvh', gap: '16px' }}>
      <div style={{ width: '32px', height: '32px', border: '2px solid var(--accent)',
        borderTopColor: 'transparent', borderRadius: '50%' }} className="spin" />
      <div style={{ color: 'var(--text-3)', fontSize: '13px' }}>Загружаем транзиты...</div>
    </div>
  )

  if (error) return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
      <div style={{ color: 'var(--text-2)', marginBottom: '16px' }}>Ошибка загрузки</div>
      <button onClick={load} style={{ background: 'var(--accent)', color: '#fff',
        border: 'none', borderRadius: '12px', padding: '10px 24px', cursor: 'pointer' }}>
        Повторить
      </button>
    </div>
  )

  const highScoreNews = (data?.news || []).filter(n => n.score >= 40)
  const otherNews = (data?.news || []).filter(n => n.score < 40)

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 0 80px' }}>

      {/* Хедер */}
      <div style={{ padding: '20px 16px 12px', background: 'var(--bg)',
        position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)' }}>
              🌍 Transit Radar
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>
              {data?.timestamp_msk}
            </div>
          </div>
          <button onClick={load} style={{ background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px',
            padding: '6px 12px', color: 'var(--accent-l)', fontSize: '12px', cursor: 'pointer' }}>
            ↻ Обновить
          </button>
        </div>

        {/* Табы */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          {[['news', '📰 Новости'], ['radar', '🪐 Транзиты']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: '8px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', border: 'none',
              background: tab === id ? 'var(--accent)' : 'var(--bg-card)',
              color: tab === id ? '#fff' : 'var(--text-2)',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ТАБ: НОВОСТИ */}
      {tab === 'news' && (
        <div style={{ padding: '16px' }}>

          {/* Прогноз дня */}
          <ForecastBanner text={data?.forecast} />

          {/* Блок подтверждения: вчера предсказали → сегодня сбылось */}
          <ConfirmationBlock data={data?.confirmation} />

          {/* Активные сигналы — краткие пилюли */}
          {data?.signals?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
              {data.signals.map(s => {
                const col = SIGNAL_COLORS[s.category] || SIGNAL_COLORS.POLITICAL
                return (
                  <div key={s.category} style={{
                    background: col.bg, border: `1px solid ${col.border}`,
                    borderRadius: '20px', padding: '4px 10px',
                    fontSize: '12px', fontWeight: '600', color: col.text,
                  }}>
                    {s.label}
                  </div>
                )
              })}
            </div>
          )}

          {/* Новости совпадающие с транзитами */}
          {highScoreNews.length > 0 && (
            <>
              <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
                color: 'var(--accent-l)', marginBottom: '10px' }}>
                ✦ Совпадают с транзитами
              </div>
              <div className="card" style={{ marginBottom: '16px' }}>
                {highScoreNews.map((item, i) => <NewsItem key={i} item={item} />)}
              </div>
            </>
          )}

          {otherNews.length > 0 && (
            <>
              <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
                color: 'var(--text-3)', marginBottom: '10px' }}>Остальные новости</div>
              <div className="card" style={{ marginBottom: '16px' }}>
                {otherNews.map((item, i) => <NewsItem key={i} item={item} />)}
              </div>
            </>
          )}

          {/* CTA */}
          <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(167,139,250,0.08))',
            border: '1px solid rgba(124,58,237,0.25)', borderRadius: '16px', padding: '16px',
            textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '10px', lineHeight: 1.5 }}>
              Хочешь узнать как эти транзиты влияют лично на тебя?
            </div>
            <a href="https://t.me/StorySelf_bot" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', background: 'var(--accent)', color: '#fff',
                textDecoration: 'none', borderRadius: '12px', padding: '10px 24px',
                fontSize: '13px', fontWeight: '700' }}>
              Открыть StorySelf →
            </a>
          </div>
        </div>
      )}

      {/* ТАБ: ТРАНЗИТЫ */}
      {tab === 'radar' && (
        <div style={{ padding: '16px' }}>

          {/* Прогноз дня */}
          <ForecastBanner text={data?.forecast} />

          {/* Сигналы с описанием */}
          {data?.signals?.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
                color: 'var(--text-3)', marginBottom: '10px' }}>Активные сигналы</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.signals.map(s => {
                  const col = SIGNAL_COLORS[s.category] || SIGNAL_COLORS.POLITICAL
                  return (
                    <div key={s.category} style={{ background: col.bg,
                      border: `1px solid ${col.border}`, borderRadius: '12px', padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: col.text }}>
                          {s.label}
                        </span>
                        <span style={{ fontSize: '10px', color: col.text, opacity: 0.7,
                          background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '2px 6px' }}>
                          ×{s.lift?.toFixed(1)}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '3px' }}>
                        {s.planets.join(' · ')}
                      </div>
                      {s.description && (
                        <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '4px',
                          fontStyle: 'italic' }}>
                          {s.description}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Медленные планеты */}
          <div className="card" style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
              color: 'var(--text-3)', marginBottom: '10px' }}>Медленные планеты</div>
            {data?.slow_planets?.map(p => <PlanetRow key={p.planet} p={p} />)}
          </div>

          {/* Быстрые планеты */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
              color: 'var(--text-3)', marginBottom: '10px' }}>Быстрые планеты</div>
            {data?.fast_planets?.map(p => <PlanetRow key={p.planet} p={p} />)}
          </div>

          {/* CTA */}
          <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(167,139,250,0.08))',
            border: '1px solid rgba(124,58,237,0.25)', borderRadius: '16px', padding: '16px',
            textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px' }}>
              Это глобальная картина
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '12px', lineHeight: 1.5 }}>
              Хочешь узнать как эти транзиты влияют лично на тебя — через призму твоего бодиграфа?
            </div>
            <a href="https://t.me/StorySelf_bot" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', background: 'var(--accent)', color: '#fff',
                textDecoration: 'none', borderRadius: '12px', padding: '10px 24px',
                fontSize: '13px', fontWeight: '700' }}>
              Открыть StorySelf →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
