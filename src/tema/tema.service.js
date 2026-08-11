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
exports.TemaService = void 0;
var common_1 = require("@nestjs/common");
var tema_normativa_entity_1 = require("./tema-normativa.entity");
var pregunta_banco_entity_1 = require("./pregunta-banco.entity");
var fs = require("fs");
var pdfParse = require('pdf-parse');
var TemaService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var TemaService = _classThis = /** @class */ (function () {
        function TemaService_1(temaRepo, temaNormativaRepo, preguntaBancoRepo, examenRepo, apunteRepo, articuloRepo, iaService, convocatoriaRepo, sesionRepo) {
            this.temaRepo = temaRepo;
            this.temaNormativaRepo = temaNormativaRepo;
            this.preguntaBancoRepo = preguntaBancoRepo;
            this.examenRepo = examenRepo;
            this.apunteRepo = apunteRepo;
            this.articuloRepo = articuloRepo;
            this.iaService = iaService;
            this.convocatoriaRepo = convocatoriaRepo;
            this.sesionRepo = sesionRepo;
        }
        // ─── TEMAS ───────────────────────────────────────────────
        TemaService_1.prototype.findByConvocatoria = function (convocatoriaId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.temaRepo.find({
                            where: { convocatoria: { id: convocatoriaId }, activo: true },
                            order: { numero: 'ASC' },
                            relations: [
                                'normativas',
                                'normativas.articulo',
                                'normativas.articulo.capitulo',
                                'normativas.articulo.capitulo.tituloRef',
                                'normativas.articulo.capitulo.tituloRef.versionLey',
                                'normativas.articulo.capitulo.tituloRef.versionLey.ley',
                                'normativas.capitulo',
                                'normativas.titulo',
                                'normativas.versionLey',
                            ],
                        })];
                });
            });
        };
        TemaService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var tema;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.temaRepo.findOne({
                                where: { id: id },
                                relations: ['normativas', 'normativas.articulo', 'normativas.capitulo', 'normativas.titulo', 'normativas.versionLey'],
                            })];
                        case 1:
                            tema = _a.sent();
                            if (!tema)
                                throw new common_1.NotFoundException("Tema ".concat(id, " no encontrado"));
                            return [2 /*return*/, tema];
                    }
                });
            });
        };
        TemaService_1.prototype.crear = function (datos) {
            return __awaiter(this, void 0, void 0, function () {
                var tema;
                return __generator(this, function (_a) {
                    tema = this.temaRepo.create({
                        numero: datos.numero,
                        titulo: datos.titulo,
                        tipo: datos.tipo,
                        contexto: datos.contexto,
                        convocatoria: { id: datos.convocatoriaId },
                    });
                    return [2 /*return*/, this.temaRepo.save(tema)];
                });
            });
        };
        TemaService_1.prototype.actualizar = function (id, datos) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.temaRepo.update(id, datos)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, this.findOne(id)];
                    }
                });
            });
        };
        TemaService_1.prototype.eliminar = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.temaRepo.update(id, { activo: false })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        TemaService_1.prototype.findByOposicion = function (oposicionId) {
            return __awaiter(this, void 0, void 0, function () {
                var convocatoria, ultima;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.convocatoriaRepo.findOne({
                                where: { oposicion: { id: oposicionId }, estado: 'activa' },
                                order: { anyo: 'DESC' },
                            })];
                        case 1:
                            convocatoria = _a.sent();
                            if (!!convocatoria) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.convocatoriaRepo.findOne({
                                    where: { oposicion: { id: oposicionId } },
                                    order: { anyo: 'DESC' },
                                })];
                        case 2:
                            ultima = _a.sent();
                            if (!ultima)
                                return [2 /*return*/, []];
                            return [2 /*return*/, this.findByConvocatoria(ultima.id)];
                        case 3: return [2 /*return*/, this.findByConvocatoria(convocatoria.id)];
                    }
                });
            });
        };
        // ─── TEMA NORMATIVA ──────────────────────────────────────
        TemaService_1.prototype.vincularNormativa = function (temaId, datos) {
            return __awaiter(this, void 0, void 0, function () {
                var tn;
                return __generator(this, function (_a) {
                    tn = this.temaNormativaRepo.create({
                        tema: { id: temaId },
                        nivel: datos.nivel,
                        articulo: datos.articuloId ? { id: datos.articuloId } : undefined,
                        capitulo: datos.capituloId ? { id: datos.capituloId } : undefined,
                        titulo: datos.tituloId ? { id: datos.tituloId } : undefined,
                        versionLey: datos.versionLeyId ? { id: datos.versionLeyId } : undefined,
                    });
                    return [2 /*return*/, this.temaNormativaRepo.save(tn)];
                });
            });
        };
        TemaService_1.prototype.desvincularNormativa = function (temaNormativaId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.temaNormativaRepo.delete(temaNormativaId)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        // ─── ARTÍCULOS DE UN TEMA ────────────────────────────────
        TemaService_1.prototype.getArticulosDeTema = function (temaId) {
            return __awaiter(this, void 0, void 0, function () {
                var tema, articulos, _i, _a, tn, arts, arts, arts;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.findOne(temaId)];
                        case 1:
                            tema = _b.sent();
                            articulos = [];
                            _i = 0, _a = tema.normativas;
                            _b.label = 2;
                        case 2:
                            if (!(_i < _a.length)) return [3 /*break*/, 10];
                            tn = _a[_i];
                            if (!(tn.nivel === tema_normativa_entity_1.NivelNormativa.ARTICULO && tn.articulo)) return [3 /*break*/, 3];
                            articulos.push(tn.articulo);
                            return [3 /*break*/, 9];
                        case 3:
                            if (!(tn.nivel === tema_normativa_entity_1.NivelNormativa.CAPITULO && tn.capitulo)) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.articuloRepo.find({
                                    where: { capitulo: { id: tn.capitulo.id }, vigente: true },
                                })];
                        case 4:
                            arts = _b.sent();
                            articulos.push.apply(articulos, arts);
                            return [3 /*break*/, 9];
                        case 5:
                            if (!(tn.nivel === tema_normativa_entity_1.NivelNormativa.TITULO && tn.titulo)) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.articuloRepo
                                    .createQueryBuilder('a')
                                    .leftJoin('a.capitulo', 'c')
                                    .where('c.tituloRef = :tituloId', { tituloId: tn.titulo.id })
                                    .andWhere('a.vigente = true')
                                    .getMany()];
                        case 6:
                            arts = _b.sent();
                            articulos.push.apply(articulos, arts);
                            return [3 /*break*/, 9];
                        case 7:
                            if (!(tn.nivel === tema_normativa_entity_1.NivelNormativa.VERSION_LEY && tn.versionLey)) return [3 /*break*/, 9];
                            return [4 /*yield*/, this.articuloRepo
                                    .createQueryBuilder('a')
                                    .leftJoin('a.capitulo', 'c')
                                    .leftJoin('c.tituloRef', 't')
                                    .where('t.versionLey = :versionId', { versionId: tn.versionLey.id })
                                    .andWhere('a.vigente = true')
                                    .getMany()];
                        case 8:
                            arts = _b.sent();
                            articulos.push.apply(articulos, arts);
                            _b.label = 9;
                        case 9:
                            _i++;
                            return [3 /*break*/, 2];
                        case 10: return [2 /*return*/, articulos];
                    }
                });
            });
        };
        // ─── BANCO DE PREGUNTAS ──────────────────────────────────
        TemaService_1.prototype.getPreguntasBanco = function (temaId_1) {
            return __awaiter(this, arguments, void 0, function (temaId, limite) {
                if (limite === void 0) { limite = 10; }
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.preguntaBancoRepo.find({
                            where: { tema: { id: temaId }, validada: true },
                            order: { vecesUsada: 'ASC' },
                            take: limite,
                        })];
                });
            });
        };
        TemaService_1.prototype.guardarPreguntaBanco = function (datos) {
            return __awaiter(this, void 0, void 0, function () {
                var p;
                var _a;
                return __generator(this, function (_b) {
                    p = this.preguntaBancoRepo.create({
                        enunciado: datos.enunciado,
                        opciones: datos.opciones,
                        correcta: datos.correcta,
                        explicacion: datos.explicacion,
                        fuente: datos.fuente,
                        validada: (_a = datos.validada) !== null && _a !== void 0 ? _a : false,
                        tema: datos.temaId ? { id: datos.temaId } : undefined,
                        articulo: datos.articuloId ? { id: datos.articuloId } : undefined,
                    });
                    return [2 /*return*/, this.preguntaBancoRepo.save(p)];
                });
            });
        };
        // ─── EXAMENES ANTERIORES ─────────────────────────────────
        TemaService_1.prototype.subirExamen = function (oposicionId, anyo, filePath) {
            return __awaiter(this, void 0, void 0, function () {
                var buffer, data, examen;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            buffer = fs.readFileSync(filePath);
                            return [4 /*yield*/, pdfParse(buffer)];
                        case 1:
                            data = _a.sent();
                            fs.unlinkSync(filePath);
                            examen = this.examenRepo.create({
                                anyo: anyo,
                                textoExtraido: data.text,
                                procesado: false,
                                oposicion: { id: oposicionId },
                            });
                            return [2 /*return*/, this.examenRepo.save(examen)];
                    }
                });
            });
        };
        TemaService_1.prototype.procesarExamen = function (examenId) {
            return __awaiter(this, void 0, void 0, function () {
                var examen, system, prompt, preguntas, _i, preguntas_1, p, e_1;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0: return [4 /*yield*/, this.examenRepo.findOne({
                                where: { id: examenId },
                                relations: ['oposicion'],
                            })];
                        case 1:
                            examen = _e.sent();
                            if (!examen)
                                throw new common_1.NotFoundException('Examen no encontrado');
                            system = "Eres experto en oposiciones espa\u00F1olas. Extrae preguntas tipo test de ex\u00E1menes reales. Responde SOLO con JSON v\u00E1lido.";
                            prompt = "Extrae las preguntas tipo test de este examen de oposici\u00F3n espa\u00F1ola.\nDevuelve SOLO este JSON:\n[\n  {\n    \"enunciado\": \"texto de la pregunta\",\n    \"opciones\": [\"A) opci\u00F3n\", \"B) opci\u00F3n\", \"C) opci\u00F3n\", \"D) opci\u00F3n\"],\n    \"correcta\": 0,\n    \"explicacion\": \"por qu\u00E9 es correcta si se puede deducir\"\n  }\n]\n\nTEXTO DEL EXAMEN:\n".concat((_a = examen.textoExtraido) === null || _a === void 0 ? void 0 : _a.slice(0, 4000));
                            _e.label = 2;
                        case 2:
                            _e.trys.push([2, 9, , 10]);
                            return [4 /*yield*/, this.iaService.chatJson(prompt, system)];
                        case 3:
                            preguntas = _e.sent();
                            _i = 0, preguntas_1 = preguntas;
                            _e.label = 4;
                        case 4:
                            if (!(_i < preguntas_1.length)) return [3 /*break*/, 7];
                            p = preguntas_1[_i];
                            return [4 /*yield*/, this.guardarPreguntaBanco({
                                    enunciado: String((_b = p.enunciado) !== null && _b !== void 0 ? _b : ''),
                                    opciones: Array.isArray(p.opciones) ? p.opciones.map(String) : [],
                                    correcta: Number((_c = p.correcta) !== null && _c !== void 0 ? _c : 0),
                                    explicacion: String((_d = p.explicacion) !== null && _d !== void 0 ? _d : ''),
                                    fuente: pregunta_banco_entity_1.FuentePregunta.EXAMEN_ANTERIOR,
                                    validada: false,
                                })];
                        case 5:
                            _e.sent();
                            _e.label = 6;
                        case 6:
                            _i++;
                            return [3 /*break*/, 4];
                        case 7: return [4 /*yield*/, this.examenRepo.update(examenId, {
                                procesado: true,
                                totalPreguntas: preguntas.length,
                            })];
                        case 8:
                            _e.sent();
                            return [2 /*return*/, { totalPreguntas: preguntas.length }];
                        case 9:
                            e_1 = _e.sent();
                            throw new Error("Error procesando examen: ".concat(e_1.message));
                        case 10: return [2 /*return*/];
                    }
                });
            });
        };
        // ─── APUNTES USUARIO ─────────────────────────────────────
        TemaService_1.prototype.subirApunte = function (usuarioId, oposicionId, nombre, filePath) {
            return __awaiter(this, void 0, void 0, function () {
                var buffer, data, apunte;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            buffer = fs.readFileSync(filePath);
                            return [4 /*yield*/, pdfParse(buffer)];
                        case 1:
                            data = _a.sent();
                            fs.unlinkSync(filePath);
                            apunte = this.apunteRepo.create({
                                nombre: nombre,
                                textoExtraido: data.text,
                                procesado: true,
                                usuario: { id: usuarioId },
                                oposicion: { id: oposicionId },
                            });
                            return [2 /*return*/, this.apunteRepo.save(apunte)];
                    }
                });
            });
        };
        TemaService_1.prototype.getApuntesUsuario = function (usuarioId, oposicionId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.apunteRepo.find({
                            where: {
                                usuario: { id: usuarioId },
                                oposicion: { id: oposicionId },
                            },
                        })];
                });
            });
        };
        TemaService_1.prototype.getExamenesByConvocatoria = function (convocatoriaId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.examenRepo.find({
                            where: { convocatoria: { id: convocatoriaId } },
                            order: { anyo: 'DESC', creadoEn: 'DESC' },
                        })];
                });
            });
        };
        TemaService_1.prototype.subirExamenConvocatoria = function (convocatoriaId, nombre, anyo, tipo, mes, filePath) {
            return __awaiter(this, void 0, void 0, function () {
                var buffer, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            buffer = fs.readFileSync(filePath);
                            return [4 /*yield*/, pdfParse(buffer)];
                        case 1:
                            data = _a.sent();
                            fs.unlinkSync(filePath);
                            return [2 /*return*/, this.examenRepo.save(this.examenRepo.create({
                                    nombre: nombre,
                                    anyo: anyo,
                                    tipo: tipo,
                                    mes: mes,
                                    textoExtraido: data.text,
                                    procesado: false,
                                    convocatoria: { id: convocatoriaId },
                                }))];
                    }
                });
            });
        };
        TemaService_1.prototype.eliminarExamen = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.examenRepo.delete(id)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        // ─── SESIONES ────────────────────────────────────────────
        TemaService_1.prototype.registrarSesion = function (usuarioId, temaId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.sesionRepo.save(this.sesionRepo.create({
                                usuario: { id: usuarioId },
                                tema: { id: temaId },
                            }))];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        TemaService_1.prototype.getEstadisticasSesion = function (usuarioId, temaId) {
            return __awaiter(this, void 0, void 0, function () {
                var sesiones, diasUnicos;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.sesionRepo.find({
                                where: { usuario: { id: usuarioId }, tema: { id: temaId } },
                                order: { creadoEn: 'DESC' },
                            })];
                        case 1:
                            sesiones = _a.sent();
                            if (sesiones.length === 0) {
                                return [2 /*return*/, { diasEstudiando: 0, ultimaSesion: null }];
                            }
                            diasUnicos = new Set(sesiones.map(function (s) { return s.creadoEn.toISOString().slice(0, 10); }));
                            return [2 /*return*/, {
                                    diasEstudiando: diasUnicos.size,
                                    ultimaSesion: sesiones[0].creadoEn,
                                }];
                    }
                });
            });
        };
        return TemaService_1;
    }());
    __setFunctionName(_classThis, "TemaService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TemaService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TemaService = _classThis;
}();
exports.TemaService = TemaService;
