export default function SoulPage() {
  return (
    <>
      <meta httpEquiv="refresh" content="0; url=https://soulsolace.vercel.app/soulsolace" />
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0A0A0B', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'monospace'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1>Redirecting to Soul Solace...</h1>
          <p><a href="https://soulsolace.vercel.app/soulsolace" style={{ color: '#f59e0b' }}>Click here if not redirected</a></p>
        </div>
      </div>
    </>
  );
}