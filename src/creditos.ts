import licenciaFluent from '../recursos/fuentes/LICENSE-fluentui-emoji.txt?raw';
import { dibujos } from './dibujos';

/** Texto de licencia que hay que incluir con los dibujos de cada fuente. */
const LICENCIAS: Record<string, string> = {
  'Fluent Emoji © Microsoft Corporation (MIT)': licenciaFluent,
};

/** Créditos agrupados: cada fuente con los dibujos que salen de ella y su licencia. */
export function creditos() {
  const grupos = new Map<string, string[]>();
  for (const d of dibujos) {
    if (!d.credito) continue;
    (grupos.get(d.credito) ?? grupos.set(d.credito, []).get(d.credito)!).push(d.id);
  }
  return [...grupos].map(([credito, ids]) => ({ credito, ids, licencia: LICENCIAS[credito] ?? '' }));
}
