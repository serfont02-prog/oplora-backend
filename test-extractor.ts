// test-extractor.ts
import * as fs from 'fs';
import { extraerLineasPDF } from './src/apunte-oplora/pdf-extractor';
import { clasificarDocumento } from './src/apunte-oplora/pdf-classifier';

async function test() {
  const buffer = fs.readFileSync('./Tema_1.pdf');
  const paginas = await extraerLineasPDF(buffer);
  const documento = clasificarDocumento(paginas, 'Tema 1');

  console.log('=== ÍNDICE ===');
  for (const item of documento.indice) {
    console.log('  '.repeat(item.nivel - 1) + `[${item.nivel}] ${item.titulo} (bloque ${item.bloqueId})`);
  }

  console.log('\n=== ESTADÍSTICAS ===');
  console.log(documento.estadisticas);

  console.log('\n=== PRIMEROS 15 BLOQUES ===');
  for (const bloque of documento.bloques.slice(0, 15)) {
    if (bloque.tipo === 'parrafo') {
  console.log(`[PARRAFO] ${bloque.texto.slice(0, 100)}...`);
} else if (bloque.tipo === 'titulo') {
  console.log(`[TITULO nivel ${bloque.nivel}] ${bloque.texto}`);
} else if (bloque.tipo === 'lista') {
  console.log(`[LISTA] ${bloque.items.length} items`);
} else if (bloque.tipo === 'articulo_legal') {
  console.log(`[ARTÍCULO ${bloque.numero}] ${bloque.texto.slice(0, 100)}...`);
} else if (bloque.tipo === 'destacado') {
  console.log(`[DESTACADO: ${bloque.titulo}] ${bloque.contenido.length} bloques dentro`);
}
  }
}

test();