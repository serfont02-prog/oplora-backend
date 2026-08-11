"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestService = void 0;
var common_1 = require("@nestjs/common");
var pregunta_test_entity_1 = require("./pregunta-test.entity");
var usuario_entity_1 = require("../usuario/usuario.entity");
var tema_normativa_entity_1 = require("../tema/tema-normativa.entity");
var oposicion_ley_entity_1 = require("../ley/oposicion-ley.entity");
var consumo_helper_1 = require("../common/helpers/consumo.helper");
var TestService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var TestService = _classThis = /** @class */ (function () {
        function TestService_1(configuracionService, resultadoRepo, usuarioRepo, preguntaRepo, temaNormativaRepo, temaRepo, articuloRepo) {
            this.configuracionService = configuracionService;
            this.resultadoRepo = resultadoRepo;
            this.usuarioRepo = usuarioRepo;
            this.preguntaRepo = preguntaRepo;
            this.temaNormativaRepo = temaNormativaRepo;
            this.temaRepo = temaRepo;
            this.articuloRepo = articuloRepo;
        }
        /* =========================================================
           GENERAR TEST
        ========================================================= */
        TestService_1.prototype.generarTest = function (oposicionId_1) {
            return __awaiter(this, arguments, void 0, function (oposicionId, numPreguntas, temaId, versionLeyId, capituloId, tituloId, modo, nivel, dificultad, usuarioId, temasIds) {
                var tipoTest, verificacion, query, preguntasSinDeduplicar, vistas, preguntas;
                if (numPreguntas === void 0) { numPreguntas = 10; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(usuarioId && modo !== 'primer_reto')) return [3 /*break*/, 2];
                            tipoTest = temaId ? 'tema' : modo !== null && modo !== void 0 ? modo : 'rapido';
                            return [4 /*yield*/, this.verificarLimiteTest(usuarioId, numPreguntas, tipoTest)];
                        case 1:
                            verificacion = _a.sent();
                            if (!verificacion.permitido) {
                                throw new common_1.ForbiddenException(JSON.stringify({
                                    motivo: verificacion.motivo,
                                    limite: verificacion.limite,
                                }));
                            }
                            _a.label = 2;
                        case 2:
                            // =========================================================
                            // PRIMER RETO (nivel 1, 5 preguntas, dificultad fácil)
                            // =========================================================
                            if (modo === 'primer_reto') {
                                nivel = 1;
                                numPreguntas = 5;
                                dificultad = 'facil';
                            }
                            query = this.preguntaRepo
                                .createQueryBuilder('pregunta')
                                .leftJoinAndSelect('pregunta.temas', 'tema')
                                .leftJoinAndSelect('pregunta.articulos', 'articulo');
                            /* =========================================================
                               FILTRO POR TEMA
                            ========================================================= */
                            if (temaId) {
                                query = query.andWhere('tema.id = :temaId', { temaId: temaId });
                            }
                            /* =========================================================
                               FILTRO POR MULTIPLES TEMAS
                            ========================================================= */
                            if (temasIds && temasIds.length > 0) {
                                query = query.andWhere('tema.id IN (:...temasIds)', { temasIds: temasIds });
                            }
                            /* =========================================================
                               FILTRO POR CAPITULO
                            ========================================================= */
                            if (capituloId) {
                                query = query
                                    .leftJoin('articulo.capitulo', 'capitulo')
                                    .andWhere('capitulo.id = :capituloId', { capituloId: capituloId });
                            }
                            /* =========================================================
                               FILTRO POR TITULO
                            ========================================================= */
                            if (tituloId) {
                                query = query
                                    .leftJoin('articulo.capitulo', 'capituloTitulo')
                                    .leftJoin('capituloTitulo.tituloRef', 'titulo')
                                    .andWhere('titulo.id = :tituloId', { tituloId: tituloId });
                            }
                            /* =========================================================
                               FILTRO POR VERSION LEY
                            ========================================================= */
                            if (versionLeyId) {
                                query = query
                                    .leftJoin('articulo.capitulo', 'capituloLey')
                                    .leftJoin('capituloLey.tituloRef', 'tituloLey')
                                    .leftJoin('tituloLey.versionLey', 'versionLey')
                                    .andWhere('versionLey.id = :versionLeyId', { versionLeyId: versionLeyId });
                            }
                            /* =========================================================
                                 TEST GENERAL OPOSICION
                              ========================================================= */
                            if (!temaId && !versionLeyId && !tituloId && !capituloId) {
                                query = query
                                    // Camino 1: pregunta → tema → convocatoria → oposicion
                                    .leftJoin('tema.convocatoria', 'convocatoria')
                                    .leftJoin('convocatoria.oposicion', 'oposicion')
                                    // Camino 2: pregunta → articulo → TemaNormativa → tema → convocatoria → oposicion
                                    .leftJoin(tema_normativa_entity_1.TemaNormativa, 'tn', 'tn."articuloId" = articulo.id')
                                    .leftJoin('tn.tema', 'temaNorm')
                                    .leftJoin('temaNorm.convocatoria', 'convocatoriaNorm')
                                    .leftJoin('convocatoriaNorm.oposicion', 'oposicionNorm')
                                    // Camino 3: pregunta → articulo → capitulo → tituloRef → versionLey → oposicionLey → oposicion
                                    .leftJoin('articulo.capitulo', 'capituloArt')
                                    .leftJoin('capituloArt.tituloRef', 'tituloRefArt')
                                    .leftJoin('tituloRefArt.versionLey', 'versionLeyArt')
                                    .leftJoin(oposicion_ley_entity_1.OposicionLey, 'ol', 'ol."versionLeyId" = versionLeyArt.id')
                                    .leftJoin('ol.oposicion', 'oposicionLey')
                                    .andWhere('(oposicion.id = :oposicionId OR oposicionNorm.id = :oposicionId OR oposicionLey.id = :oposicionId)', { oposicionId: oposicionId });
                            }
                            /* =========================================================
                               SOLO ACTIVAS
                            ========================================================= */
                            query = query.andWhere('pregunta.activa = true');
                            return [4 /*yield*/, query
                                    .orderBy('RANDOM()')
                                    .limit(numPreguntas * 3)
                                    .getMany()];
                        case 3:
                            preguntasSinDeduplicar = _a.sent();
                            vistas = new Set();
                            preguntas = preguntasSinDeduplicar.filter(function (p) {
                                if (vistas.has(p.id))
                                    return false;
                                vistas.add(p.id);
                                return true;
                            }).slice(0, numPreguntas);
                            return [2 /*return*/, preguntas.map(function (p) {
                                    var _a, _b, _c, _d, _e, _f, _g, _h;
                                    return ({
                                        id: p.id,
                                        enunciado: p.enunciado,
                                        opciones: p.opciones,
                                        correcta: p.correcta,
                                        explicacion: (_a = p.explicacion) !== null && _a !== void 0 ? _a : '',
                                        articulo: ((_b = p.articulos) === null || _b === void 0 ? void 0 : _b[0]) ? "Art. ".concat(p.articulos[0].numero) : undefined,
                                        articuloId: (_e = (_d = (_c = p.articulos) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.id) !== null && _e !== void 0 ? _e : null,
                                        temaId: (_h = (_g = (_f = p.temas) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.id) !== null && _h !== void 0 ? _h : null,
                                        fuente: 'banco',
                                    });
                                })];
                    }
                });
            });
        };
        /* =========================================================
           GUARDAR RESULTADO
        ========================================================= */
        TestService_1.prototype.guardarResultado = function (datos) {
            return __awaiter(this, void 0, void 0, function () {
                var porcentaje, resultado, usuario, _i, _a, detalle, pregunta;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            porcentaje = Math.round((datos.correctas / datos.totalPreguntas) * 100);
                            resultado = this.resultadoRepo.create({
                                totalPreguntas: datos.totalPreguntas,
                                correctas: datos.correctas,
                                porcentaje: porcentaje,
                                tipoTest: datos.tipoTest,
                                tiempoSegundos: datos.tiempoSegundos,
                                detallePreguntas: datos.detallePreguntas,
                                usuario: { id: datos.usuarioId },
                                oposicion: { id: datos.oposicionId },
                                tema: datos.temaId ? { id: datos.temaId } : undefined,
                            });
                            return [4 /*yield*/, this.resultadoRepo.save(resultado)];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, this.usuarioRepo.findOne({ where: { id: datos.usuarioId } })];
                        case 2:
                            usuario = _b.sent();
                            if (!usuario) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.usuarioRepo.update(datos.usuarioId, {
                                    preguntasTestHoy: usuario.preguntasTestHoy + datos.totalPreguntas, // hoy
                                    preguntasRespondidasTotales: usuario.preguntasRespondidasTotales + datos.totalPreguntas, // histórico
                                    ultimaActividad: new Date(),
                                })];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4:
                            if (!(datos.tipoTest === 'primer_reto')) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.usuarioRepo.update(datos.usuarioId, {
                                    estado: usuario_entity_1.EstadoUsuario.ACTIVO,
                                    // ⭐ si quieres registrar que ya lo hizo:
                                    // primerRetoCompletado: true,
                                })];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6:
                            _i = 0, _a = datos.detallePreguntas;
                            _b.label = 7;
                        case 7:
                            if (!(_i < _a.length)) return [3 /*break*/, 11];
                            detalle = _a[_i];
                            if (!detalle.preguntaId)
                                return [3 /*break*/, 10];
                            return [4 /*yield*/, this.preguntaRepo.findOne({
                                    where: { id: detalle.preguntaId },
                                })];
                        case 8:
                            pregunta = _b.sent();
                            if (!pregunta)
                                return [3 /*break*/, 10];
                            return [4 /*yield*/, this.preguntaRepo.update(pregunta.id, {
                                    vecesUsada: pregunta.vecesUsada + 1,
                                    aciertos: detalle.correcta
                                        ? pregunta.aciertos + 1
                                        : pregunta.aciertos,
                                    fallos: detalle.correcta
                                        ? pregunta.fallos
                                        : pregunta.fallos + 1,
                                })];
                        case 9:
                            _b.sent();
                            _b.label = 10;
                        case 10:
                            _i++;
                            return [3 /*break*/, 7];
                        case 11:
                            if (!(datos.tipoTest !== 'primer_reto')) return [3 /*break*/, 13];
                            return [4 /*yield*/, this.actualizarPuntos(datos.usuarioId, datos.totalPreguntas, datos.correctas, porcentaje)];
                        case 12:
                            _b.sent();
                            _b.label = 13;
                        case 13: return [2 /*return*/, resultado];
                    }
                });
            });
        };
        /* =========================================================
           PUNTOS Y NIVELES
        ========================================================= */
        TestService_1.prototype.actualizarPuntos = function (usuarioId, numPreguntas, correctas, porcentaje) {
            return __awaiter(this, void 0, void 0, function () {
                var puntosAcciones, usuario, puntosGanados, nuevosPuntos, nuevoNivel;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.configuracionService.getPuntosAcciones()];
                        case 1:
                            puntosAcciones = _a.sent();
                            return [4 /*yield*/, this.usuarioRepo.findOne({ where: { id: usuarioId } })];
                        case 2:
                            usuario = _a.sent();
                            if (!usuario)
                                return [2 /*return*/];
                            puntosGanados = correctas * puntosAcciones.preguntaCorrecta;
                            // Bonus por porcentaje
                            if (porcentaje >= 80) {
                                puntosGanados += puntosAcciones.testCompletadoMas80;
                            }
                            else if (porcentaje >= 60) {
                                puntosGanados += puntosAcciones.testCompletadoMas60;
                            }
                            if (puntosGanados === 0)
                                return [2 /*return*/];
                            nuevosPuntos = usuario.puntos + puntosGanados;
                            return [4 /*yield*/, this.configuracionService.calcularNivelPorPuntos(nuevosPuntos)];
                        case 3:
                            nuevoNivel = _a.sent();
                            return [4 /*yield*/, this.usuarioRepo.update(usuarioId, {
                                    puntos: nuevosPuntos,
                                    nivel: nuevoNivel,
                                })];
                        case 4:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        TestService_1.prototype.calcularNivel = function (puntos) {
            if (puntos >= 351)
                return 5;
            if (puntos >= 151)
                return 4;
            if (puntos >= 61)
                return 3;
            if (puntos >= 21)
                return 2;
            return 1;
        };
        /* =========================================================
           PROGRESO
        ========================================================= */
        TestService_1.prototype.getUltimoResultado = function (usuarioId) {
            return __awaiter(this, void 0, void 0, function () {
                var resultado, resultados, mediaAcierto, mejorResultado, detallePreguntas, blancos, correctas, falladas;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0: return [4 /*yield*/, this.resultadoRepo.findOne({
                                where: {
                                    usuario: { id: usuarioId },
                                },
                                relations: ['oposicion'],
                                order: { creadoEn: 'DESC' },
                            })];
                        case 1:
                            resultado = _e.sent();
                            if (!resultado)
                                return [2 /*return*/, null];
                            return [4 /*yield*/, this.resultadoRepo.find({
                                    where: {
                                        usuario: { id: usuarioId },
                                        oposicion: { id: (_a = resultado.oposicion) === null || _a === void 0 ? void 0 : _a.id },
                                    },
                                    order: { creadoEn: 'DESC' },
                                    take: 20,
                                })];
                        case 2:
                            resultados = _e.sent();
                            mediaAcierto = resultados.length > 0
                                ? Math.round(resultados.reduce(function (acc, r) { return acc + r.porcentaje; }, 0) / resultados.length)
                                : 0;
                            mejorResultado = resultados.length > 0
                                ? Math.max.apply(Math, resultados.map(function (r) { return r.porcentaje; })) : 0;
                            detallePreguntas = (_b = resultado.detallePreguntas) !== null && _b !== void 0 ? _b : [];
                            blancos = detallePreguntas.filter(function (d) { return d.enBlanco; }).length;
                            correctas = detallePreguntas.filter(function (d) { return d.correcta && !d.enBlanco; }).length;
                            falladas = detallePreguntas.filter(function (d) { return !d.correcta && !d.enBlanco; }).length;
                            return [2 /*return*/, {
                                    id: resultado.id,
                                    oposicionId: (_d = (_c = resultado.oposicion) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : null,
                                    porcentaje: resultado.porcentaje,
                                    correctas: correctas,
                                    falladas: falladas,
                                    blancos: blancos,
                                    totalPreguntas: resultado.totalPreguntas,
                                    tipoTest: resultado.tipoTest,
                                    tiempoSegundos: resultado.tiempoSegundos,
                                    detallePreguntas: resultado.detallePreguntas,
                                    creadoEn: resultado.creadoEn,
                                    mediaAcierto: mediaAcierto,
                                    mejorResultado: mejorResultado,
                                    totalTestsRealizados: resultados.length,
                                }];
                    }
                });
            });
        };
        TestService_1.prototype.getProgresoTema = function (usuarioId, oposicionId, temaId) {
            return __awaiter(this, void 0, void 0, function () {
                var temaNormativas, articuloIds, resultados, preguntasDelTema, total, correctas, falladas, porcentajeAcierto;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.temaNormativaRepo.find({
                                where: {
                                    tema: { id: temaId },
                                    nivel: tema_normativa_entity_1.NivelNormativa.ARTICULO,
                                },
                                relations: ['articulo'],
                            })];
                        case 1:
                            temaNormativas = _a.sent();
                            articuloIds = temaNormativas
                                .map(function (tn) { var _a; return (_a = tn.articulo) === null || _a === void 0 ? void 0 : _a.id; })
                                .filter(function (id) { return !!id; });
                            return [4 /*yield*/, this.resultadoRepo.find({
                                    where: {
                                        usuario: { id: usuarioId },
                                        oposicion: { id: oposicionId },
                                    },
                                })];
                        case 2:
                            resultados = _a.sent();
                            preguntasDelTema = resultados.flatMap(function (r) {
                                var _a;
                                return ((_a = r.detallePreguntas) !== null && _a !== void 0 ? _a : []).filter(function (d) {
                                    return d.temaId === temaId ||
                                        (d.articuloId != null && articuloIds.includes(d.articuloId));
                                });
                            });
                            total = preguntasDelTema.length;
                            correctas = preguntasDelTema.filter(function (d) { return d.correcta; }).length;
                            falladas = total - correctas;
                            porcentajeAcierto = total > 0
                                ? Math.round((correctas / total) * 100)
                                : 0;
                            return [2 /*return*/, { total: total, correctas: correctas, falladas: falladas, porcentajeAcierto: porcentajeAcierto }];
                    }
                });
            });
        };
        TestService_1.prototype.getProgreso = function (usuarioId, oposicionId) {
            return __awaiter(this, void 0, void 0, function () {
                var resultados, totalTests, promedioAcierto;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.resultadoRepo.find({
                                where: {
                                    usuario: {
                                        id: usuarioId,
                                    },
                                    oposicion: {
                                        id: oposicionId,
                                    },
                                },
                                order: {
                                    creadoEn: 'DESC',
                                },
                                take: 100,
                            })];
                        case 1:
                            resultados = _a.sent();
                            if (resultados.length === 0) {
                                return [2 /*return*/, {
                                        totalTests: 0,
                                        promedioAcierto: 0,
                                        nivelEstimado: 0,
                                        tendencia: 'sin_datos',
                                        porDia: [],
                                        porTema: [],
                                    }];
                            }
                            totalTests = resultados.length;
                            promedioAcierto = Math.round(resultados.reduce(function (acc, r) { return acc + r.porcentaje; }, 0) / totalTests);
                            return [2 /*return*/, {
                                    totalTests: totalTests,
                                    promedioAcierto: promedioAcierto,
                                    nivelEstimado: promedioAcierto,
                                    tendencia: 'estable',
                                    porDia: [],
                                    porTema: [],
                                }];
                    }
                });
            });
        };
        TestService_1.prototype.importarPorConvocatoria = function (convocatoriaId, preguntas) {
            return __awaiter(this, void 0, void 0, function () {
                var temas, importadas, errores, _loop_1, this_1, _i, preguntas_1, p;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.temaRepo.find({
                                where: { convocatoria: { id: convocatoriaId } },
                            })];
                        case 1:
                            temas = _c.sent();
                            importadas = 0;
                            errores = [];
                            _loop_1 = function (p) {
                                var tema, pregunta, saved;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            tema = temas.find(function (t) { return t.numero === p.temaNumero; });
                                            if (!tema) {
                                                errores.push("Tema ".concat(p.temaNumero, " no encontrado en esta convocatoria"));
                                                return [2 /*return*/, "continue"];
                                            }
                                            pregunta = this_1.preguntaRepo.create({
                                                enunciado: p.enunciado,
                                                opciones: p.opciones,
                                                correcta: p.correcta,
                                                explicacion: p.explicacion,
                                                dificultad: (_a = p.dificultad) !== null && _a !== void 0 ? _a : 1,
                                                origen: (_b = p.origen) !== null && _b !== void 0 ? _b : 'convocatoria',
                                                anyo: p.anyo,
                                                activa: true,
                                            });
                                            return [4 /*yield*/, this_1.preguntaRepo.save(pregunta)];
                                        case 1:
                                            saved = _d.sent();
                                            // Vincular al tema
                                            return [4 /*yield*/, this_1.preguntaRepo
                                                    .createQueryBuilder()
                                                    .relation(pregunta_test_entity_1.PreguntaTest, 'temas')
                                                    .of(saved.id)
                                                    .add(tema.id)];
                                        case 2:
                                            // Vincular al tema
                                            _d.sent();
                                            importadas++;
                                            return [2 /*return*/];
                                    }
                                });
                            };
                            this_1 = this;
                            _i = 0, preguntas_1 = preguntas;
                            _c.label = 2;
                        case 2:
                            if (!(_i < preguntas_1.length)) return [3 /*break*/, 5];
                            p = preguntas_1[_i];
                            return [5 /*yield**/, _loop_1(p)];
                        case 3:
                            _c.sent();
                            _c.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5: return [2 /*return*/, { importadas: importadas, errores: errores }];
                    }
                });
            });
        };
        TestService_1.prototype.importarPorVersionLey = function (versionLeyId, preguntas) {
            return __awaiter(this, void 0, void 0, function () {
                var articulos, importadas, errores, _loop_2, this_2, _i, preguntas_2, p;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.articuloRepo.find({
                                where: {
                                    capitulo: {
                                        tituloRef: {
                                            versionLey: { id: versionLeyId }
                                        }
                                    }
                                },
                                relations: ['capitulo', 'capitulo.tituloRef', 'capitulo.tituloRef.versionLey'],
                            })];
                        case 1:
                            articulos = _c.sent();
                            importadas = 0;
                            errores = [];
                            _loop_2 = function (p) {
                                var articulo, pregunta, saved;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            articulo = articulos.find(function (a) { return a.numero === p.articuloNumero; });
                                            if (!articulo) {
                                                errores.push("Art\u00EDculo ".concat(p.articuloNumero, " no encontrado en esta versi\u00F3n de ley"));
                                                return [2 /*return*/, "continue"];
                                            }
                                            pregunta = this_2.preguntaRepo.create({
                                                enunciado: p.enunciado,
                                                opciones: p.opciones,
                                                correcta: p.correcta,
                                                explicacion: p.explicacion,
                                                dificultad: (_a = p.dificultad) !== null && _a !== void 0 ? _a : 1,
                                                origen: (_b = p.origen) !== null && _b !== void 0 ? _b : 'convocatoria',
                                                anyo: p.anyo,
                                                activa: true,
                                            });
                                            return [4 /*yield*/, this_2.preguntaRepo.save(pregunta)];
                                        case 1:
                                            saved = _d.sent();
                                            // Vincular al artículo
                                            return [4 /*yield*/, this_2.preguntaRepo
                                                    .createQueryBuilder()
                                                    .relation(pregunta_test_entity_1.PreguntaTest, 'articulos')
                                                    .of(saved.id)
                                                    .add(articulo.id)];
                                        case 2:
                                            // Vincular al artículo
                                            _d.sent();
                                            importadas++;
                                            return [2 /*return*/];
                                    }
                                });
                            };
                            this_2 = this;
                            _i = 0, preguntas_2 = preguntas;
                            _c.label = 2;
                        case 2:
                            if (!(_i < preguntas_2.length)) return [3 /*break*/, 5];
                            p = preguntas_2[_i];
                            return [5 /*yield**/, _loop_2(p)];
                        case 3:
                            _c.sent();
                            _c.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5: return [2 /*return*/, { importadas: importadas, errores: errores }];
                    }
                });
            });
        };
        TestService_1.prototype.verificarLimiteTest = function (usuarioId, numPreguntas, tipoTest) {
            return __awaiter(this, void 0, void 0, function () {
                var usuario, usuarioActualizado, limitesPlanes, limits, limitePorTest, limiteDiario, restantes;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.usuarioRepo.findOne({ where: { id: usuarioId } })];
                        case 1:
                            usuario = _b.sent();
                            if (!usuario)
                                throw new common_1.NotFoundException('Usuario no encontrado');
                            usuarioActualizado = (0, consumo_helper_1.resetearConsumosSiEsNuevoDia)(usuario);
                            if (!(usuarioActualizado.fechaResetConsumo !== usuario.fechaResetConsumo)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.usuarioRepo.save(usuarioActualizado)];
                        case 2:
                            _b.sent();
                            _b.label = 3;
                        case 3: return [4 /*yield*/, this.configuracionService.getLimitesPlanes()];
                        case 4:
                            limitesPlanes = _b.sent();
                            limits = limitesPlanes[(_a = usuario.suscripcion) !== null && _a !== void 0 ? _a : 'gratuito'];
                            if (tipoTest === 'simulacro' && !limits.simulacros) {
                                return [2 /*return*/, { permitido: false, motivo: 'simulacro_bloqueado', limite: 0 }];
                            }
                            limitePorTest = tipoTest === 'tema'
                                ? limits.preguntasPorTema
                                : limits.preguntasPorTest;
                            if (numPreguntas > limitePorTest) {
                                return [2 /*return*/, { permitido: false, motivo: 'limite_por_test', limite: limitePorTest }];
                            }
                            limiteDiario = limits.preguntasTestDia;
                            if (limiteDiario !== null && usuario.preguntasTestHoy + numPreguntas > limiteDiario) {
                                restantes = limiteDiario - usuario.preguntasTestHoy;
                                return [2 /*return*/, { permitido: false, motivo: 'limite_diario', limite: Math.max(0, restantes) }];
                            }
                            return [2 /*return*/, { permitido: true }];
                    }
                });
            });
        };
        return TestService_1;
    }());
    __setFunctionName(_classThis, "TestService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TestService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TestService = _classThis;
}();
exports.TestService = TestService;
