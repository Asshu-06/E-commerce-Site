import { useState } from 'react'
import { useLocation } from 'react-router-dom'

const WHATSAPP_NUMBER = '917997060668'
const MSG = 'For customised / international orders please contact us on WhatsApp'

const WaIcon = ({ size = 16, color = 'white' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={size} height={size} fill={color} style={{ flexShrink: 0 }}>
    <path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.478.65 4.897 1.885 7.02L2 30l7.18-1.858A13.94 13.94 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.455a11.41 11.41 0 0 1-5.82-1.594l-.418-.248-4.26 1.102 1.13-4.14-.272-.432A11.41 11.41 0 0 1 4.545 16c0-6.32 5.138-11.455 11.458-11.455S27.455 9.68 27.455 16c0 6.318-5.135 11.455-11.452 11.455zm6.29-8.573c-.345-.172-2.04-1.006-2.356-1.12-.316-.115-.546-.172-.776.172-.23.345-.89 1.12-1.09 1.35-.2.23-.4.258-.745.086-.345-.172-1.456-.537-2.773-1.71-1.025-.913-1.717-2.04-1.918-2.385-.2-.345-.022-.532.15-.703.155-.155.345-.403.517-.604.172-.2.23-.345.345-.575.115-.23.057-.432-.029-.604-.086-.172-.776-1.87-1.063-2.56-.28-.672-.564-.58-.776-.59l-.66-.012c-.23 0-.604.086-.92.432-.316.345-1.205 1.178-1.205 2.872s1.234 3.33 1.406 3.56c.172.23 2.428 3.71 5.882 5.203.822.355 1.463.567 1.963.726.824.263 1.574.226 2.167.137.66-.099 2.04-.834 2.328-1.638.287-.804.287-1.493.2-1.638-.086-.144-.316-.23-.66-.402z" />
  </svg>
)

export default function WhatsAppAnnouncement() {
  const [paused, setPaused] = useState(false)
  const { pathname } = useLocation()

  const openWhatsApp = (e) => {
    e.stopPropagation()
    window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>

      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(p => !p)}
        style={{
          width: '100%',
          backgroundColor: '#25D366',
          height: '38px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          cursor: 'default',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            animation: 'marquee-scroll 30s linear infinite',
            animationPlayState: paused ? 'paused' : 'running',
            willChange: 'transform',
          }}
        >
          {[0, 1].map((n) => (
            <span
              key={n}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                color: 'white',
                fontSize: '13px',
                fontWeight: 500,
                paddingRight: '80px',
              }}
            >
              <WaIcon size={15} color="white" />
              <span>{MSG}</span>
              <span style={{ opacity: 0.4 }}>✦</span>
              <button
                onClick={openWhatsApp}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: 'white',
                  color: '#25D366',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '3px 12px',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <WaIcon size={12} color="#25D366" />
                7997060668
              </button>
              <span style={{ opacity: 0.4, paddingLeft: '40px' }}>✦</span>
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
