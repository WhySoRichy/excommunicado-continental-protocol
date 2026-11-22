import { DEFAULT_LOBBY_URL } from './lobbyUrl';
import { PROTOCOL, TABLES_HASH } from './protocol';

/**
 * Dirección del servicio de salas (`server/salas`, en el plan gratuito de Cloudflare). Se puede cambiar en el build con
 * la variable `VITE_LOBBY_URL`; tiene que estar también en la política de seguridad de contenido (`vite.config.ts`).
 */
export const LOBBY_URL: string = (import.meta.env.VITE_LOBBY_URL as string | undefined) ?? DEFAULT_LOBBY_URL;

/** Versión del juego para el servicio: solo se juntan jugadores con el mismo protocolo y las mismas tablas. */
export const LOBBY_VERSION = `${PROTOCOL}.${TABLES_HASH}`;
