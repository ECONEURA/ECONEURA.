export default function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: 'blue' }}>🚀 TEST - React está funcionando</h1>
      <p>Si ves este mensaje, React se está renderizando correctamente.</p>
      <button onClick={() => alert('¡Funciona!')}>Haz clic aquí</button>
    </div>
  );
}
