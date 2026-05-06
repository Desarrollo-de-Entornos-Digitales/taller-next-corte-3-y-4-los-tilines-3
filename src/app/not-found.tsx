import Link from 'next/link';

export default function NotFound() {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
            }}
        >
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>404 - No Encontrado</h2>
            <p>La página que estás buscando no existe en este servidor.</p>
            <Link
                href="/"
                style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--color-primary, #1CB0F6)',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                }}
            >
                Volver al inicio
            </Link>
        </div>
    );
}
