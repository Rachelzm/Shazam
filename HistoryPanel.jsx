import styles from './HistoryPanel.module.css'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'zonet'
  if (mins < 60) return `${mins}m geleden`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}u geleden`
  return `${Math.floor(hrs / 24)}d geleden`
}

export function HistoryPanel({ history, onSelect, onClear, onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Geschiedenis</h2>
          <div className={styles.headerActions}>
            {history.length > 0 && (
              <button className={styles.clearBtn} onClick={onClear}>Wissen</button>
            )}
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        <div className={styles.list}>
          {history.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>♪</span>
              <p>Nog geen nummers herkend</p>
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                className={styles.item}
                onClick={() => { onSelect(item); onClose() }}
              >
                {item.artwork ? (
                  <img src={item.artwork} alt={item.title} className={styles.thumb} />
                ) : (
                  <div className={styles.thumbPlaceholder}>♪</div>
                )}
                <div className={styles.itemInfo}>
                  <span className={styles.itemTitle}>{item.title}</span>
                  <span className={styles.itemArtist}>{item.artist}</span>
                </div>
                <span className={styles.itemTime}>{timeAgo(item.recognizedAt)}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
