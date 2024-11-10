// styles/bridgeStyles.js

const bridgeStyles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        color: '#fff',
        width: '100%',
        maxWidth: '800px',
        margin: 'auto',
        gap: '1em',
    },
    typography: {
        fontWeight: 'bold',
        fontSize: '1.5em',
        textAlign: 'left',
        position: 'relative',
        top: '2em',
        left: '0.9em',
    },
    button: {
        top: '-1em',
        backgroundColor: '#1A1B2D',
        color: '#9fa4c4',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': { backgroundColor: '#24263B' },
    },
};

export default bridgeStyles;