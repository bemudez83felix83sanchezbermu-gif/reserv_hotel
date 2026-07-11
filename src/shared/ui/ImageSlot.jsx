import { useEffect, useRef, useState } from 'react';

/**
 * Drag-and-drop image placeholder that persists to localStorage.
 * Mimics the <image-slot> component from the DC design.
 */
export default function ImageSlot({ id, shape = 'rect', radius = 12, placeholder = 'Arrastra una foto', style = {} }) {
  const [src, setSrc] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const storageKey = 'estancia-slot-' + id;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setSrc(raw);
    } catch { /* ignore */ }
  }, [storageKey]);

  const readFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setSrc(dataUrl);
      try { localStorage.setItem(storageKey, dataUrl); } catch { /* quota */ }
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    readFile(file);
  };

  const onClear = (e) => {
    e.stopPropagation();
    setSrc(null);
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
  };

  const shapeRadius = shape === 'circle' ? '50%' : shape === 'rounded' ? radius : shape === 'rect' ? 0 : radius;

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      style={{
        cursor: 'pointer',
        position: 'relative',
        background: src ? '#EAE0CC' : (dragOver ? '#F1E4C8' : '#EAE0CC'),
        color: '#8A7A63',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
        borderRadius: shapeRadius,
        overflow: 'hidden',
        border: dragOver ? '2px dashed #B8552F' : 'none',
        ...style,
      }}
    >
      {src ? (
        <>
          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <button
            onClick={onClear}
            style={{
              position: 'absolute', top: 6, right: 6,
              width: 22, height: 22, borderRadius: '50%',
              border: 'none', background: 'rgba(38,29,18,.75)',
              color: '#FBF6EA', fontSize: 12, cursor: 'pointer',
            }}
            title="Quitar foto"
          >✕</button>
        </>
      ) : (
        <span style={{ textAlign: 'center', padding: '0 8px' }}>{placeholder}</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => readFile(e.target.files?.[0])}
      />
    </div>
  );
}
