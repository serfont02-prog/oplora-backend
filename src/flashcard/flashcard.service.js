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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlashcardService = void 0;
var common_1 = require("@nestjs/common");
var flashcard_entity_1 = require("./flashcard.entity");
var repaso_fc_entity_1 = require("./repaso-fc.entity");
var reto_fc_entity_1 = require("./reto-fc.entity");
var notificacion_entity_1 = require("../notificacion/notificacion.entity");
var FlashcardService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var FlashcardService = _classThis = /** @class */ (function () {
        function FlashcardService_1(fcRepo, repasoRepo, retoFcRepo, resultadoRepo, notificacionService, usuarioRepo, configuracionService) {
            this.fcRepo = fcRepo;
            this.repasoRepo = repasoRepo;
            this.retoFcRepo = retoFcRepo;
            this.resultadoRepo = resultadoRepo;
            this.notificacionService = notificacionService;
            this.usuarioRepo = usuarioRepo;
            this.configuracionService = configuracionService;
        }
        // ─── CRUD FLASHCARDS ─────────────────────────────────────
        FlashcardService_1.prototype.importar = function (flashcards) {
            return __awaiter(this, void 0, void 0, function () {
                var _i, flashcards_1, fc;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _i = 0, flashcards_1 = flashcards;
                            _b.label = 1;
                        case 1:
                            if (!(_i < flashcards_1.length)) return [3 /*break*/, 4];
                            fc = flashcards_1[_i];
                            return [4 /*yield*/, this.fcRepo.save(this.fcRepo.create({
                                    tipo: fc.tipo,
                                    nivel: fc.nivel,
                                    pregunta: fc.pregunta,
                                    respuesta: fc.respuesta,
                                    explicacion: fc.explicacion,
                                    esParaDuelo: (_a = fc.esParaDuelo) !== null && _a !== void 0 ? _a : (fc.tipo === flashcard_entity_1.TipoFlashcard.VF || fc.tipo === flashcard_entity_1.TipoFlashcard.ARTICULO),
                                    articulo: fc.articuloId ? { id: fc.articuloId } : undefined,
                                    tema: fc.temaId ? { id: fc.temaId } : undefined,
                                    oposicion: fc.oposicionId ? { id: fc.oposicionId } : undefined,
                                    creadaPor: 'admin',
                                }))];
                        case 2:
                            _b.sent();
                            _b.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/, { importadas: flashcards.length }];
                    }
                });
            });
        };
        FlashcardService_1.prototype.findByArticulo = function (articuloId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.fcRepo.find({
                            where: { articulo: { id: articuloId }, activa: true },
                            relations: ['articulo', 'tema'],
                        })];
                });
            });
        };
        FlashcardService_1.prototype.findByTema = function (temaId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.fcRepo
                            .createQueryBuilder('fc')
                            .leftJoin('fc.articulo', 'art')
                            .leftJoin('fc.tema', 'tema')
                            .where('fc.activa = true')
                            .andWhere("(tema.id = :temaId OR EXISTS (\n        SELECT 1 FROM temas_normativa tn \n        WHERE tn.\"articuloId\" = art.id \n        AND tn.\"temaId\" = :temaId\n      ))", { temaId: temaId })
                            .getMany()];
                });
            });
        };
        FlashcardService_1.prototype.findByOposicion = function (oposicionId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.fcRepo.find({
                            where: { oposicion: { id: oposicionId }, activa: true },
                            relations: ['articulo', 'tema'],
                        })];
                });
            });
        };
        FlashcardService_1.prototype.findParaDuelo = function (oposicionId_1) {
            return __awaiter(this, arguments, void 0, function (oposicionId, limite) {
                if (limite === void 0) { limite = 10; }
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.fcRepo.find({
                            where: { oposicion: { id: oposicionId }, activa: true, esParaDuelo: true },
                            take: limite,
                            order: { creadoEn: 'ASC' },
                        })];
                });
            });
        };
        // ─── REPASO ──────────────────────────────────────────────
        FlashcardService_1.prototype.getPendientesRepaso = function (usuarioId_1, oposicionId_1) {
            return __awaiter(this, arguments, void 0, function (usuarioId, oposicionId, limite) {
                var ahora, conRepaso, ids, nuevas;
                if (limite === void 0) { limite = 10; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            ahora = new Date();
                            return [4 /*yield*/, this.repasoRepo
                                    .createQueryBuilder('r')
                                    .leftJoinAndSelect('r.flashcard', 'fc')
                                    .leftJoin('fc.articulo', 'art')
                                    .leftJoin('art.capitulo', 'cap')
                                    .leftJoin('cap.tituloRef', 'tit')
                                    .leftJoin('tit.versionLey', 'vl')
                                    .leftJoin('fc.tema', 'tema')
                                    .leftJoin('fc.oposicion', 'opo')
                                    .where('r.usuario = :usuarioId', { usuarioId: usuarioId })
                                    .andWhere('r.proximoRepaso <= :ahora', { ahora: ahora })
                                    .andWhere('(opo.id = :oposicionId OR EXISTS (SELECT 1 FROM convocatorias conv JOIN oposiciones op ON op.id = conv."oposicionId" WHERE conv.id = tema."convocatoriaId" AND op.id = :oposicionId))', { oposicionId: oposicionId })
                                    .orderBy('r.intervalo', 'DESC')
                                    .limit(limite)
                                    .getMany()];
                        case 1:
                            conRepaso = _a.sent();
                            ids = conRepaso.map(function (r) { return r.flashcard.id; });
                            return [4 /*yield*/, this.fcRepo
                                    .createQueryBuilder('fc')
                                    .leftJoin('fc.repasos', 'r', 'r.usuario = :usuarioId', { usuarioId: usuarioId })
                                    .leftJoin('fc.articulo', 'art')
                                    .leftJoin('art.capitulo', 'cap')
                                    .leftJoin('cap.tituloRef', 'tit')
                                    .leftJoin('tit.versionLey', 'vl')
                                    .leftJoin('vl.oposicionLeyes', 'ol')
                                    .leftJoin('fc.tema', 'tema')
                                    .leftJoin('fc.oposicion', 'opo')
                                    .where('fc.activa = true')
                                    .andWhere('r.id IS NULL')
                                    .andWhere("(opo.id = :oposicionId \n        OR EXISTS (\n          SELECT 1 FROM convocatorias conv \n          JOIN oposiciones op ON op.id = conv.\"oposicionId\" \n          WHERE conv.id = tema.\"convocatoriaId\" \n          AND op.id = :oposicionId\n        ) \n        OR ol.oposicion = :oposicionId\n        OR EXISTS (\n          SELECT 1 FROM temas_normativa tn\n          JOIN temas t ON t.id = tn.\"temaId\"\n          JOIN convocatorias conv ON conv.id = t.\"convocatoriaId\"\n          JOIN oposiciones op ON op.id = conv.\"oposicionId\"\n          WHERE tn.\"articuloId\" = art.id\n          AND op.id = :oposicionId\n        ))", { oposicionId: oposicionId })
                                    .limit(Math.max(0, limite - ids.length))
                                    .getMany()];
                        case 2:
                            nuevas = _a.sent();
                            return [2 /*return*/, __spreadArray(__spreadArray([], conRepaso.map(function (r) { return r.flashcard; }), true), nuevas.filter(function (fc) { return !ids.includes(fc.id); }), true).slice(0, limite)];
                    }
                });
            });
        };
        FlashcardService_1.prototype.registrarRespuesta = function (usuarioId, flashcardId, calificacion, tiempoMs) {
            return __awaiter(this, void 0, void 0, function () {
                var repaso, ahora, estadoAnterior, correcta, _a, nuevoIntervalo, nuevasRepeticiones, nuevoEF, repasoGuardado;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.repasoRepo.findOne({
                                where: { usuario: { id: usuarioId }, flashcard: { id: flashcardId } },
                            })];
                        case 1:
                            repaso = _b.sent();
                            ahora = new Date();
                            estadoAnterior = repaso === null || repaso === void 0 ? void 0 : repaso.estado;
                            if (!repaso) {
                                repaso = this.repasoRepo.create({
                                    usuario: { id: usuarioId },
                                    flashcard: { id: flashcardId },
                                    aciertos: 0,
                                    fallos: 0,
                                    fallosConsecutivos: 0,
                                    tiempoMedioRespuesta: tiempoMs,
                                    factorFacilidad: 2.5,
                                    intervalo: 0,
                                    repeticiones: 0,
                                });
                            }
                            correcta = calificacion >= 3;
                            if (correcta) {
                                repaso.aciertos++;
                                repaso.fallosConsecutivos = 0;
                            }
                            else {
                                repaso.fallos++;
                                repaso.fallosConsecutivos++;
                            }
                            repaso.tiempoMedioRespuesta = Math.round((repaso.tiempoMedioRespuesta + tiempoMs) / 2);
                            _a = this.calcularSM2(calificacion, repaso.repeticiones, repaso.intervalo, repaso.factorFacilidad), nuevoIntervalo = _a.nuevoIntervalo, nuevasRepeticiones = _a.nuevasRepeticiones, nuevoEF = _a.nuevoEF;
                            repaso.intervalo = nuevoIntervalo;
                            repaso.repeticiones = nuevasRepeticiones;
                            repaso.factorFacilidad = nuevoEF;
                            if (nuevoEF >= 2.3 && nuevasRepeticiones >= 2) {
                                repaso.estado = repaso_fc_entity_1.EstadoFC.DOMINADA;
                            }
                            else if (nuevoEF >= 1.8 && nuevasRepeticiones >= 1) {
                                repaso.estado = repaso_fc_entity_1.EstadoFC.DUDOSA;
                            }
                            else {
                                repaso.estado = repaso_fc_entity_1.EstadoFC.NO_DOMINADA;
                            }
                            repaso.ultimaVista = ahora;
                            repaso.proximoRepaso = new Date(ahora.getTime() + nuevoIntervalo * 24 * 60 * 60 * 1000);
                            return [4 /*yield*/, this.repasoRepo.save(repaso)];
                        case 2:
                            repasoGuardado = _b.sent();
                            if (!(repasoGuardado.estado === repaso_fc_entity_1.EstadoFC.DOMINADA &&
                                estadoAnterior !== repaso_fc_entity_1.EstadoFC.DOMINADA)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.darPuntosPorDominar(usuarioId)];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4: return [2 /*return*/, repasoGuardado];
                    }
                });
            });
        };
        FlashcardService_1.prototype.darPuntosPorDominar = function (usuarioId) {
            return __awaiter(this, void 0, void 0, function () {
                var puntosAcciones, puntosPorDominar, usuario, nuevosPuntos, nuevoNivel;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.configuracionService.getPuntosAcciones()];
                        case 1:
                            puntosAcciones = _b.sent();
                            puntosPorDominar = (_a = puntosAcciones.flashcardDominada) !== null && _a !== void 0 ? _a : 5;
                            return [4 /*yield*/, this.usuarioRepo.findOne({ where: { id: usuarioId } })];
                        case 2:
                            usuario = _b.sent();
                            if (!usuario)
                                return [2 /*return*/];
                            nuevosPuntos = usuario.puntos + puntosPorDominar;
                            return [4 /*yield*/, this.configuracionService.calcularNivelPorPuntos(nuevosPuntos)];
                        case 3:
                            nuevoNivel = _b.sent();
                            return [4 /*yield*/, this.usuarioRepo.update(usuarioId, {
                                    puntos: nuevosPuntos,
                                    nivel: nuevoNivel,
                                })];
                        case 4:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        FlashcardService_1.prototype.calcularSM2 = function (calificacion, // 0-5
        repeticiones, intervalo, factorFacilidad) {
            var nuevoEF = factorFacilidad + (0.1 - (5 - calificacion) * (0.08 + (5 - calificacion) * 0.02));
            nuevoEF = Math.max(1.3, nuevoEF);
            if (calificacion < 3) {
                return {
                    nuevoIntervalo: 1,
                    nuevasRepeticiones: 0,
                    nuevoEF: nuevoEF,
                };
            }
            var nuevoIntervalo;
            if (repeticiones === 0) {
                nuevoIntervalo = 1;
            }
            else if (repeticiones === 1) {
                nuevoIntervalo = 6;
            }
            else {
                nuevoIntervalo = Math.round(intervalo * nuevoEF);
            }
            return {
                nuevoIntervalo: nuevoIntervalo,
                nuevasRepeticiones: repeticiones + 1,
                nuevoEF: nuevoEF,
            };
        };
        // ─── SUGERENCIA REPASO POR FALLOS EN TEST ────────────────
        FlashcardService_1.prototype.sugerirRepasoArticulo = function (usuarioId, articuloId, oposicionId) {
            return __awaiter(this, void 0, void 0, function () {
                var flashcards;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findByArticulo(articuloId)];
                        case 1:
                            flashcards = _a.sent();
                            return [2 /*return*/, {
                                    sugerir: flashcards.length > 0,
                                    totalFC: flashcards.length,
                                }];
                    }
                });
            });
        };
        FlashcardService_1.prototype.programarRepasoArticulo = function (usuarioId, articuloId, cuando) {
            return __awaiter(this, void 0, void 0, function () {
                var flashcards, fecha, ahora, diasHastaViernes, _i, flashcards_2, fc, repaso;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findByArticulo(articuloId)];
                        case 1:
                            flashcards = _a.sent();
                            if (flashcards.length === 0)
                                return [2 /*return*/];
                            ahora = new Date();
                            if (cuando === 'manana') {
                                fecha = new Date(ahora);
                                fecha.setDate(fecha.getDate() + 1);
                                fecha.setHours(9, 0, 0, 0);
                            }
                            else if (cuando === 'finde') {
                                fecha = new Date(ahora);
                                diasHastaViernes = (5 - fecha.getDay() + 7) % 7 || 7;
                                fecha.setDate(fecha.getDate() + diasHastaViernes);
                                fecha.setHours(10, 0, 0, 0);
                            }
                            else {
                                fecha = cuando;
                            }
                            _i = 0, flashcards_2 = flashcards;
                            _a.label = 2;
                        case 2:
                            if (!(_i < flashcards_2.length)) return [3 /*break*/, 6];
                            fc = flashcards_2[_i];
                            return [4 /*yield*/, this.repasoRepo.findOne({
                                    where: { usuario: { id: usuarioId }, flashcard: { id: fc.id } },
                                })];
                        case 3:
                            repaso = _a.sent();
                            if (!repaso) {
                                repaso = this.repasoRepo.create({
                                    usuario: { id: usuarioId },
                                    flashcard: { id: fc.id },
                                });
                            }
                            repaso.proximoRepaso = fecha;
                            return [4 /*yield*/, this.repasoRepo.save(repaso)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5:
                            _i++;
                            return [3 /*break*/, 2];
                        case 6: 
                        // Notificar
                        return [4 /*yield*/, this.notificacionService.crear({
                                usuarioId: usuarioId,
                                tipo: notificacion_entity_1.TipoNotificacion.RETO_DIARIO,
                                titulo: '📚 Repaso programado',
                                mensaje: "Tienes ".concat(flashcards.length, " flashcards programadas para repasar"),
                                prioridad: notificacion_entity_1.PrioridadNotificacion.BAJA,
                                urlAccion: '/app/flashcards',
                            })];
                        case 7:
                            // Notificar
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        // ─── RETOS FC ────────────────────────────────────────────
        FlashcardService_1.prototype.crearRetoDiarioFC = function (oposicionId) {
            return __awaiter(this, void 0, void 0, function () {
                var flashcards, fechaFin;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.fcRepo.find({
                                where: { oposicion: { id: oposicionId }, activa: true },
                                order: { creadoEn: 'ASC' },
                                take: 10,
                            })];
                        case 1:
                            flashcards = _a.sent();
                            fechaFin = new Date();
                            fechaFin.setHours(23, 59, 59, 999);
                            return [2 /*return*/, this.retoFcRepo.save(this.retoFcRepo.create({
                                    tipo: reto_fc_entity_1.TipoRetoFC.DIARIO,
                                    flashcards: flashcards,
                                    fechaFin: fechaFin,
                                    oposicion: { id: oposicionId },
                                }))];
                    }
                });
            });
        };
        FlashcardService_1.prototype.crearDueloFC = function (retadorId_1, retadoNickOEmail_1, oposicionId_1) {
            return __awaiter(this, arguments, void 0, function (retadorId, retadoNickOEmail, oposicionId, numFC) {
                var flashcards, fechaFin, reto;
                if (numFC === void 0) { numFC = 5; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findParaDuelo(oposicionId, numFC)];
                        case 1:
                            flashcards = _a.sent();
                            if (flashcards.length === 0)
                                throw new common_1.BadRequestException('No hay flashcards de duelo disponibles');
                            fechaFin = new Date();
                            fechaFin.setDate(fechaFin.getDate() + 2);
                            return [4 /*yield*/, this.retoFcRepo.save(this.retoFcRepo.create({
                                    tipo: reto_fc_entity_1.TipoRetoFC.DUELO,
                                    flashcards: flashcards,
                                    fechaFin: fechaFin,
                                    retador: { id: retadorId },
                                    oposicion: { id: oposicionId },
                                }))];
                        case 2:
                            reto = _a.sent();
                            return [2 /*return*/, reto];
                    }
                });
            });
        };
        FlashcardService_1.prototype.enviarFCPersonal = function (remiteteId, destinatarioId, flashcardId, mensaje) {
            return __awaiter(this, void 0, void 0, function () {
                var fc;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.fcRepo.findOne({ where: { id: flashcardId } })];
                        case 1:
                            fc = _a.sent();
                            if (!fc)
                                throw new common_1.NotFoundException('Flashcard no encontrada');
                            return [4 /*yield*/, this.notificacionService.crear({
                                    usuarioId: destinatarioId,
                                    tipo: notificacion_entity_1.TipoNotificacion.RETO_RECIBIDO,
                                    titulo: '📬 Te han enviado una flashcard',
                                    mensaje: mensaje !== null && mensaje !== void 0 ? mensaje : "Alguien te ha enviado una flashcard para repasar: \"".concat(fc.pregunta.slice(0, 60), "...\""),
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.BAJA,
                                    urlAccion: "/app/flashcards/".concat(flashcardId),
                                    metadata: { flashcardId: flashcardId, remiteteId: remiteteId },
                                })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        FlashcardService_1.prototype.getEstadisticasFCTema = function (usuarioId, oposicionId, temaId) {
            return __awaiter(this, void 0, void 0, function () {
                var existsSubquery, total, repasos, dominadas, dudosas, noDominadas;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            existsSubquery = "EXISTS (SELECT 1 FROM temas_normativa tn WHERE tn.\"articuloId\" = art.id AND tn.\"temaId\" = :temaId)";
                            return [4 /*yield*/, this.fcRepo
                                    .createQueryBuilder('fc')
                                    .leftJoin('fc.articulo', 'art')
                                    .leftJoin('fc.tema', 'tema')
                                    .where('fc.activa = true')
                                    .andWhere("(tema.id = :temaId OR ".concat(existsSubquery, ")"), { temaId: temaId })
                                    .getCount()];
                        case 1:
                            total = _a.sent();
                            return [4 /*yield*/, this.repasoRepo
                                    .createQueryBuilder('r')
                                    .leftJoin('r.flashcard', 'fc')
                                    .leftJoin('fc.tema', 'tema')
                                    .leftJoin('fc.articulo', 'art')
                                    .where('r.usuario = :usuarioId', { usuarioId: usuarioId })
                                    .andWhere("(tema.id = :temaId OR ".concat(existsSubquery, ")"), { temaId: temaId })
                                    .getMany()];
                        case 2:
                            repasos = _a.sent();
                            dominadas = repasos.filter(function (r) { return r.estado === repaso_fc_entity_1.EstadoFC.DOMINADA; }).length;
                            dudosas = repasos.filter(function (r) { return r.estado === repaso_fc_entity_1.EstadoFC.DUDOSA; }).length;
                            noDominadas = repasos.filter(function (r) { return r.estado === repaso_fc_entity_1.EstadoFC.NO_DOMINADA; }).length;
                            return [2 /*return*/, {
                                    total: total,
                                    dominadas: dominadas,
                                    dudosas: dudosas,
                                    noDominadas: noDominadas,
                                    sinVer: Math.max(0, total - dominadas - dudosas - noDominadas),
                                }];
                    }
                });
            });
        };
        FlashcardService_1.prototype.completarRetoFC = function (retoId, usuarioId, respuestas) {
            return __awaiter(this, void 0, void 0, function () {
                var reto, yaCompletado, aciertos, tiempoTotal, _i, respuestas_1, r, resultado, todosCompletos;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.retoFcRepo.findOne({
                                where: { id: retoId },
                                relations: ['resultados', 'resultados.usuario'],
                            })];
                        case 1:
                            reto = _b.sent();
                            if (!reto)
                                throw new common_1.NotFoundException('Reto FC no encontrado');
                            yaCompletado = (_a = reto.resultados) === null || _a === void 0 ? void 0 : _a.some(function (r) { return r.usuario.id === usuarioId && r.completado; });
                            if (yaCompletado)
                                throw new common_1.BadRequestException('Ya completaste este reto');
                            aciertos = respuestas.filter(function (r) { return r.correcta; }).length;
                            tiempoTotal = respuestas.reduce(function (acc, r) { return acc + r.tiempoRespuesta; }, 0);
                            _i = 0, respuestas_1 = respuestas;
                            _b.label = 2;
                        case 2:
                            if (!(_i < respuestas_1.length)) return [3 /*break*/, 5];
                            r = respuestas_1[_i];
                            return [4 /*yield*/, this.registrarRespuesta(usuarioId, r.flashcardId, r.correcta ? 4 : 1, r.tiempoRespuesta)];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5: return [4 /*yield*/, this.resultadoRepo.save(this.resultadoRepo.create({
                                retoFc: { id: retoId },
                                usuario: { id: usuarioId },
                                completado: true,
                                aciertos: aciertos,
                                fallos: respuestas.length - aciertos,
                                tiempoTotal: tiempoTotal,
                                respuestas: respuestas,
                            }))];
                        case 6:
                            resultado = _b.sent();
                            if (!(reto.tipo === reto_fc_entity_1.TipoRetoFC.DUELO)) return [3 /*break*/, 9];
                            return [4 /*yield*/, this.resultadoRepo.count({
                                    where: { retoFc: { id: retoId }, completado: true },
                                })];
                        case 7:
                            todosCompletos = _b.sent();
                            if (!(todosCompletos >= 2)) return [3 /*break*/, 9];
                            return [4 /*yield*/, this.cerrarDuelo(reto)];
                        case 8:
                            _b.sent();
                            _b.label = 9;
                        case 9: return [2 /*return*/, resultado];
                    }
                });
            });
        };
        FlashcardService_1.prototype.cerrarDuelo = function (reto) {
            return __awaiter(this, void 0, void 0, function () {
                var resultados, i, ganador, perdedor;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.resultadoRepo.find({
                                where: { retoFc: { id: reto.id }, completado: true },
                                relations: ['usuario'],
                                order: { aciertos: 'DESC', tiempoTotal: 'ASC' },
                            })];
                        case 1:
                            resultados = _c.sent();
                            i = 0;
                            _c.label = 2;
                        case 2:
                            if (!(i < resultados.length)) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.resultadoRepo.update(resultados[i].id, { posicion: i + 1 })];
                        case 3:
                            _c.sent();
                            _c.label = 4;
                        case 4:
                            i++;
                            return [3 /*break*/, 2];
                        case 5: return [4 /*yield*/, this.retoFcRepo.update(reto.id, { estado: reto_fc_entity_1.EstadoRetoFC.COMPLETADO })];
                        case 6:
                            _c.sent();
                            if (!(resultados.length >= 2)) return [3 /*break*/, 9];
                            ganador = resultados[0].usuario;
                            perdedor = resultados[1].usuario;
                            return [4 /*yield*/, this.notificacionService.crear({
                                    usuarioId: ganador.id,
                                    tipo: notificacion_entity_1.TipoNotificacion.RETO_RESULTADO,
                                    titulo: '¡Has ganado el duelo de FC! 🃏',
                                    mensaje: "Has ganado a ".concat((_a = perdedor.nick) !== null && _a !== void 0 ? _a : perdedor.nombre, " con ").concat(resultados[0].aciertos, " aciertos"),
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.MEDIA,
                                })];
                        case 7:
                            _c.sent();
                            return [4 /*yield*/, this.notificacionService.crear({
                                    usuarioId: perdedor.id,
                                    tipo: notificacion_entity_1.TipoNotificacion.RETO_RESULTADO,
                                    titulo: 'Duelo de FC finalizado',
                                    mensaje: "".concat((_b = ganador.nick) !== null && _b !== void 0 ? _b : ganador.nombre, " ha ganado el duelo con ").concat(resultados[0].aciertos, " aciertos"),
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.MEDIA,
                                })];
                        case 8:
                            _c.sent();
                            _c.label = 9;
                        case 9: return [2 /*return*/];
                    }
                });
            });
        };
        // ─── STATS ───────────────────────────────────────────────
        FlashcardService_1.prototype.getEstadisticasFC = function (usuarioId, oposicionId) {
            return __awaiter(this, void 0, void 0, function () {
                var total, dominadas, dudosas, noDominadas;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.fcRepo
                                .createQueryBuilder('fc')
                                .leftJoin('fc.articulo', 'art')
                                .leftJoin('art.capitulo', 'cap')
                                .leftJoin('cap.tituloRef', 'tit')
                                .leftJoin('tit.versionLey', 'vl')
                                .leftJoin('vl.oposicionLeyes', 'ol')
                                .leftJoin('fc.tema', 'tema')
                                .leftJoin('fc.oposicion', 'opo')
                                .where('fc.activa = true')
                                .andWhere('(opo.id = :oposicionId OR EXISTS (SELECT 1 FROM convocatorias conv JOIN oposiciones op ON op.id = conv."oposicionId" WHERE conv.id = tema."convocatoriaId" AND op.id = :oposicionId) OR ol.oposicion = :oposicionId)', { oposicionId: oposicionId })
                                .getCount()];
                        case 1:
                            total = _a.sent();
                            return [4 /*yield*/, this.repasoRepo.count({
                                    where: { usuario: { id: usuarioId }, estado: repaso_fc_entity_1.EstadoFC.DOMINADA },
                                })];
                        case 2:
                            dominadas = _a.sent();
                            return [4 /*yield*/, this.repasoRepo.count({
                                    where: { usuario: { id: usuarioId }, estado: repaso_fc_entity_1.EstadoFC.DUDOSA },
                                })];
                        case 3:
                            dudosas = _a.sent();
                            return [4 /*yield*/, this.repasoRepo.count({
                                    where: { usuario: { id: usuarioId }, estado: repaso_fc_entity_1.EstadoFC.NO_DOMINADA },
                                })];
                        case 4:
                            noDominadas = _a.sent();
                            return [2 /*return*/, {
                                    total: total,
                                    dominadas: dominadas,
                                    dudosas: dudosas,
                                    noDominadas: noDominadas,
                                    sinVer: Math.max(0, total - dominadas - dudosas - noDominadas),
                                }];
                    }
                });
            });
        };
        return FlashcardService_1;
    }());
    __setFunctionName(_classThis, "FlashcardService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FlashcardService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FlashcardService = _classThis;
}();
exports.FlashcardService = FlashcardService;
