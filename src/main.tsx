import { createRoot } from 'react-dom/client';
import App from './app/App';
// Board defaults must precede Pion's geometry and coordinate overrides, even on lazy routes.
import '@lichess-org/chessground/assets/chessground.base.css';
import './styles.css';

createRoot(document.getElementById('root')!).render(<App/>);
