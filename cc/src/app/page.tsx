import Calculator from '@/components/Calculator';

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'var(--bg-primary)',
      }}
    >
      <Calculator />
    </main>
  );
}
