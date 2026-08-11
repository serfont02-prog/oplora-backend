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
exports.NormativaService = void 0;
var common_1 = require("@nestjs/common");
var notificacion_entity_1 = require("../notificacion/notificacion.entity");
var NormativaService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var NormativaService = _classThis = /** @class */ (function () {
        function NormativaService_1(articuloRepo, capituloRepo, tituloRepo, versionLeyRepo, preguntaCortaRepo, flashcardRepo, preguntaBancoRepo, notaRepo, subrayadoRepo, notificacionService) {
            this.articuloRepo = articuloRepo;
            this.capituloRepo = capituloRepo;
            this.tituloRepo = tituloRepo;
            this.versionLeyRepo = versionLeyRepo;
            this.preguntaCortaRepo = preguntaCortaRepo;
            this.flashcardRepo = flashcardRepo;
            this.preguntaBancoRepo = preguntaBancoRepo;
            this.notaRepo = notaRepo;
            this.subrayadoRepo = subrayadoRepo;
            this.notificacionService = notificacionService;
        }
        NormativaService_1.prototype.importarEstructura = function (datos) {
            return __awaiter(this, void 0, void 0, function () {
                var totalTitulos, totalCapitulos, totalArticulos, _i, _a, tituloData, titulo, _b, _c, capData, capitulo, _d, _e, artData;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            totalTitulos = 0;
                            totalCapitulos = 0;
                            totalArticulos = 0;
                            _i = 0, _a = datos.titulos;
                            _f.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 10];
                            tituloData = _a[_i];
                            return [4 /*yield*/, this.tituloRepo.save(this.tituloRepo.create({
                                    numero: tituloData.numero,
                                    nombre: tituloData.nombre,
                                    orden: tituloData.orden,
                                    versionLey: { id: datos.versionLeyId },
                                }))];
                        case 2:
                            titulo = _f.sent();
                            totalTitulos++;
                            _b = 0, _c = tituloData.capitulos;
                            _f.label = 3;
                        case 3:
                            if (!(_b < _c.length)) return [3 /*break*/, 9];
                            capData = _c[_b];
                            return [4 /*yield*/, this.capituloRepo.save(this.capituloRepo.create({
                                    numero: capData.numero,
                                    nombre: capData.nombre,
                                    orden: capData.orden,
                                    tituloRef: { id: titulo.id },
                                }))];
                        case 4:
                            capitulo = _f.sent();
                            totalCapitulos++;
                            _d = 0, _e = capData.articulos;
                            _f.label = 5;
                        case 5:
                            if (!(_d < _e.length)) return [3 /*break*/, 8];
                            artData = _e[_d];
                            return [4 /*yield*/, this.articuloRepo.save(this.articuloRepo.create({
                                    numero: artData.numero,
                                    titulo: artData.titulo,
                                    contenido: artData.contenido,
                                    orden: artData.orden,
                                    vigente: true,
                                    capitulo: { id: capitulo.id },
                                }))];
                        case 6:
                            _f.sent();
                            totalArticulos++;
                            _f.label = 7;
                        case 7:
                            _d++;
                            return [3 /*break*/, 5];
                        case 8:
                            _b++;
                            return [3 /*break*/, 3];
                        case 9:
                            _i++;
                            return [3 /*break*/, 1];
                        case 10: return [2 /*return*/, { titulos: totalTitulos, capitulos: totalCapitulos, articulos: totalArticulos }];
                    }
                });
            });
        };
        NormativaService_1.prototype.importarArticulos = function (articulos, capituloId) {
            return __awaiter(this, void 0, void 0, function () {
                var i, art;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            i = 0;
                            _a.label = 1;
                        case 1:
                            if (!(i < articulos.length)) return [3 /*break*/, 4];
                            art = articulos[i];
                            return [4 /*yield*/, this.articuloRepo.save(this.articuloRepo.create({
                                    numero: art.numero,
                                    titulo: art.titulo,
                                    contenido: art.contenido,
                                    orden: i + 1,
                                    vigente: true,
                                    capitulo: { id: capituloId },
                                }))];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/, { importados: articulos.length }];
                    }
                });
            });
        };
        NormativaService_1.prototype.importarContenidoIA = function (contenido) {
            return __awaiter(this, void 0, void 0, function () {
                var actualizados, totalPreguntas, totalFlashcards, totalPreguntasCortas, _i, contenido_1, item, articulo, _a, _b, p, _c, _d, fc, _e, _f, pc;
                var _g, _h, _j;
                return __generator(this, function (_k) {
                    switch (_k.label) {
                        case 0:
                            actualizados = 0;
                            totalPreguntas = 0;
                            totalFlashcards = 0;
                            totalPreguntasCortas = 0;
                            _i = 0, contenido_1 = contenido;
                            _k.label = 1;
                        case 1:
                            if (!(_i < contenido_1.length)) return [3 /*break*/, 16];
                            item = contenido_1[_i];
                            return [4 /*yield*/, this.articuloRepo
                                    .createQueryBuilder('a')
                                    .leftJoin('a.capitulo', 'c')
                                    .leftJoin('c.tituloRef', 't')
                                    .leftJoin('a.tituloRef', 'tr')
                                    .where('a.numero = :numero', { numero: item.numeroArticulo })
                                    .andWhere('(t.versionLey = :vId OR tr.versionLey = :vId)', { vId: item.versionLeyId })
                                    .getOne()];
                        case 2:
                            articulo = _k.sent();
                            if (!articulo)
                                return [3 /*break*/, 15];
                            // Actualizar campos del artículo
                            return [4 /*yield*/, this.articuloRepo.update(articulo.id, {
                                    resumen: item.explicacion,
                                    esquema: item.esquema,
                                    ejemplo: item.ejemplo,
                                })];
                        case 3:
                            // Actualizar campos del artículo
                            _k.sent();
                            actualizados++;
                            if (!((_g = item.preguntas) === null || _g === void 0 ? void 0 : _g.length)) return [3 /*break*/, 7];
                            _a = 0, _b = item.preguntas;
                            _k.label = 4;
                        case 4:
                            if (!(_a < _b.length)) return [3 /*break*/, 7];
                            p = _b[_a];
                            return [4 /*yield*/, this.preguntaBancoRepo.save(this.preguntaBancoRepo.create({
                                    enunciado: p.enunciado,
                                    opciones: p.opciones,
                                    correcta: p.correcta,
                                    explicacion: p.explicacion,
                                    articulo: { id: articulo.id },
                                }))];
                        case 5:
                            _k.sent();
                            totalPreguntas++;
                            _k.label = 6;
                        case 6:
                            _a++;
                            return [3 /*break*/, 4];
                        case 7:
                            if (!((_h = item.flashcards) === null || _h === void 0 ? void 0 : _h.length)) return [3 /*break*/, 11];
                            _c = 0, _d = item.flashcards;
                            _k.label = 8;
                        case 8:
                            if (!(_c < _d.length)) return [3 /*break*/, 11];
                            fc = _d[_c];
                            return [4 /*yield*/, this.flashcardRepo.save(this.flashcardRepo.create({
                                    tipo: fc.tipo,
                                    nivel: fc.nivel,
                                    pregunta: fc.pregunta,
                                    respuesta: fc.respuesta,
                                    explicacion: fc.explicacion,
                                    esParaDuelo: fc.tipo === 'vf' || fc.tipo === 'articulo',
                                    articulo: { id: articulo.id },
                                    creadaPor: 'admin',
                                }))];
                        case 9:
                            _k.sent();
                            totalFlashcards++;
                            _k.label = 10;
                        case 10:
                            _c++;
                            return [3 /*break*/, 8];
                        case 11:
                            if (!((_j = item.preguntasCortas) === null || _j === void 0 ? void 0 : _j.length)) return [3 /*break*/, 15];
                            _e = 0, _f = item.preguntasCortas;
                            _k.label = 12;
                        case 12:
                            if (!(_e < _f.length)) return [3 /*break*/, 15];
                            pc = _f[_e];
                            return [4 /*yield*/, this.preguntaCortaRepo.save(this.preguntaCortaRepo.create({
                                    pregunta: pc.pregunta,
                                    respuesta: pc.respuesta,
                                    articulo: { id: articulo.id },
                                }))];
                        case 13:
                            _k.sent();
                            totalPreguntasCortas++;
                            _k.label = 14;
                        case 14:
                            _e++;
                            return [3 /*break*/, 12];
                        case 15:
                            _i++;
                            return [3 /*break*/, 1];
                        case 16: return [2 /*return*/, { actualizados: actualizados, preguntas: totalPreguntas, flashcards: totalFlashcards, preguntasCortas: totalPreguntasCortas }];
                    }
                });
            });
        };
        NormativaService_1.prototype.importarArticulosEnTitulo = function (articulos, tituloId) {
            return __awaiter(this, void 0, void 0, function () {
                var i, art;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            i = 0;
                            _a.label = 1;
                        case 1:
                            if (!(i < articulos.length)) return [3 /*break*/, 4];
                            art = articulos[i];
                            return [4 /*yield*/, this.articuloRepo.save(this.articuloRepo.create({
                                    numero: art.numero,
                                    titulo: art.titulo,
                                    contenido: art.contenido,
                                    orden: i + 1,
                                    vigente: true,
                                    tituloRef: { id: tituloId },
                                }))];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/, { importados: articulos.length }];
                    }
                });
            });
        };
        NormativaService_1.prototype.getNota = function (usuarioId, articuloId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.notaRepo.findOne({
                            where: { usuario: { id: usuarioId }, articulo: { id: articuloId } },
                        })];
                });
            });
        };
        NormativaService_1.prototype.guardarNota = function (usuarioId, articuloId, contenido) {
            return __awaiter(this, void 0, void 0, function () {
                var nota;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.notaRepo.findOne({
                                where: { usuario: { id: usuarioId }, articulo: { id: articuloId } },
                            })];
                        case 1:
                            nota = _a.sent();
                            if (!nota) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.notaRepo.update(nota.id, { contenido: contenido })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, this.notaRepo.findOne({ where: { id: nota.id } })];
                        case 3: return [2 /*return*/, this.notaRepo.save(this.notaRepo.create({
                                contenido: contenido,
                                usuario: { id: usuarioId },
                                articulo: { id: articuloId },
                            }))];
                    }
                });
            });
        };
        NormativaService_1.prototype.getSubrayados = function (usuarioId, articuloId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.subrayadoRepo.find({
                            where: { usuario: { id: usuarioId }, articulo: { id: articuloId } },
                            order: { inicio: 'ASC' },
                        })];
                });
            });
        };
        NormativaService_1.prototype.crearSubrayado = function (usuarioId_1, articuloId_1, inicio_1, fin_1, textoSeleccionado_1) {
            return __awaiter(this, arguments, void 0, function (usuarioId, articuloId, inicio, fin, textoSeleccionado, color) {
                if (color === void 0) { color = 'amarillo'; }
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.subrayadoRepo.save(this.subrayadoRepo.create({
                            inicio: inicio,
                            fin: fin,
                            textoSeleccionado: textoSeleccionado,
                            color: color,
                            usuario: { id: usuarioId },
                            articulo: { id: articuloId },
                        }))];
                });
            });
        };
        NormativaService_1.prototype.borrarSubrayado = function (id, usuarioId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.subrayadoRepo.delete({ id: id, usuario: { id: usuarioId } })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        NormativaService_1.prototype.buscarArticulos = function (versionLeyId, q) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!q || q.trim().length < 1)
                        return [2 /*return*/, []];
                    return [2 /*return*/, this.articuloRepo
                            .createQueryBuilder('a')
                            .leftJoin('a.capitulo', 'c')
                            .leftJoin('c.tituloRef', 't')
                            .leftJoin('a.tituloRef', 'tr')
                            .where('(t.versionLey = :vId OR tr.versionLey = :vId)', { vId: versionLeyId })
                            .andWhere('a.vigente = true')
                            .andWhere('(a.numero ILIKE :q OR a.contenido ILIKE :q OR a.titulo ILIKE :q)', { q: "%".concat(q.trim(), "%") })
                            .orderBy('a.orden', 'ASC')
                            .limit(20)
                            .getMany()];
                });
            });
        };
        NormativaService_1.prototype.getNotaTema = function (usuarioId, temaId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.notaRepo.findOne({
                            where: { usuario: { id: usuarioId }, tema: { id: temaId } },
                        })];
                });
            });
        };
        NormativaService_1.prototype.guardarNotaTema = function (usuarioId, temaId, contenido) {
            return __awaiter(this, void 0, void 0, function () {
                var nota;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.notaRepo.findOne({
                                where: { usuario: { id: usuarioId }, tema: { id: temaId } },
                            })];
                        case 1:
                            nota = _a.sent();
                            if (!nota) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.notaRepo.update(nota.id, { contenido: contenido })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, this.notaRepo.findOne({ where: { id: nota.id } })];
                        case 3: return [2 /*return*/, this.notaRepo.save(this.notaRepo.create({
                                contenido: contenido,
                                usuario: { id: usuarioId },
                                tema: { id: temaId },
                            }))];
                    }
                });
            });
        };
        NormativaService_1.prototype.programarRepasoTema = function (usuarioId, temaId, fecha) {
            return __awaiter(this, void 0, void 0, function () {
                var nota;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.notaRepo.findOne({
                                where: { usuario: { id: usuarioId }, tema: { id: temaId } },
                            })];
                        case 1:
                            nota = _a.sent();
                            if (!!nota) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.notaRepo.save(this.notaRepo.create({
                                    usuario: { id: usuarioId },
                                    tema: { id: temaId },
                                    contenido: '',
                                }))];
                        case 2:
                            nota = _a.sent();
                            _a.label = 3;
                        case 3: return [4 /*yield*/, this.notaRepo.update(nota.id, { fechaRepaso: fecha })];
                        case 4:
                            _a.sent();
                            // Crear notificación programada
                            return [4 /*yield*/, this.notificacionService.crear({
                                    usuarioId: usuarioId,
                                    tipo: notificacion_entity_1.TipoNotificacion.RETO_DIARIO,
                                    titulo: '📅 Repaso programado',
                                    mensaje: "Tienes programado repasar un tema hoy",
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.MEDIA,
                                    urlAccion: "/app/tema",
                                })];
                        case 5:
                            // Crear notificación programada
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        NormativaService_1.prototype.getRepasosProgramados = function (usuarioId) {
            return __awaiter(this, void 0, void 0, function () {
                var hoy, manana;
                return __generator(this, function (_a) {
                    hoy = new Date();
                    hoy.setHours(0, 0, 0, 0);
                    manana = new Date(hoy);
                    manana.setDate(manana.getDate() + 1);
                    return [2 /*return*/, this.notaRepo
                            .createQueryBuilder('n')
                            .leftJoinAndSelect('n.tema', 't')
                            .where('n.usuario = :usuarioId', { usuarioId: usuarioId })
                            .andWhere('n.fechaRepaso >= :hoy', { hoy: hoy })
                            .andWhere('n.fechaRepaso < :manana', { manana: manana })
                            .getMany()];
                });
            });
        };
        return NormativaService_1;
    }());
    __setFunctionName(_classThis, "NormativaService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NormativaService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NormativaService = _classThis;
}();
exports.NormativaService = NormativaService;
