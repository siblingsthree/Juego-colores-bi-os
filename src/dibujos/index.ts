import type { Dibujo } from '../tipos';
import { ballenaVidriera } from './generados/ballena-vidriera';
import { casa } from './casa';
import { cohete } from './cohete';
import { tortugaFoto } from './generados/tortuga-foto';
import { zorroFoto } from './generados/zorro-foto';
import { zorroVidriera } from './generados/zorro-vidriera';
import { mandala } from './mandala';
import { mariposa } from './mariposa';
import { pez } from './pez';
import { tortuga } from './tortuga';

export const dibujos: Dibujo[] = [pez, casa, cohete, tortuga, mariposa, mandala, zorroVidriera, ballenaVidriera, tortugaFoto, zorroFoto];
