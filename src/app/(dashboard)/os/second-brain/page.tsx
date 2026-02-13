export default function SecondBrainPage() {
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 64px)', position: 'relative' }}>
      <iframe
        src="https://second-brain-nine-pi.vercel.app"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '8px',
        }}
        title="Second Brain"
        allow="clipboard-write"
      />
    </div>
  );
}
