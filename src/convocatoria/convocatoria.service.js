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
exports.ConvocatoriaService = void 0;
var common_1 = require("@nestjs/common");
var convocatoria_entity_1 = require("./convocatoria.entity");
var ConvocatoriaService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ConvocatoriaService = _classThis = /** @class */ (function () {
        function ConvocatoriaService_1(convocatoriaRepo, documentoRepo, oposicionRepo, temaRepo, notaRepo) {
            this.convocatoriaRepo = convocatoriaRepo;
            this.documentoRepo = documentoRepo;
            this.oposicionRepo = oposicionRepo;
            this.temaRepo = temaRepo;
            this.notaRepo = notaRepo;
        }
        ConvocatoriaService_1.prototype.findByOposicion = function (oposicionId) {
            return this.convocatoriaRepo.find({
                where: { oposicion: { id: oposicionId } },
                relations: ['documentos'],
                order: { anyo: 'DESC' },
            });
        };
        ConvocatoriaService_1.prototype.actualizarPlazo = function (id, inicio, fin) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.convocatoriaRepo.update(id, {
                                plazoInscripcionInicio: inicio,
                                plazoInscripcionFin: fin,
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ConvocatoriaService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var c;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.convocatoriaRepo.findOne({
                                where: { id: id },
                                relations: ['oposicion', 'documentos'],
                            })];
                        case 1:
                            c = _a.sent();
                            if (!c)
                                throw new common_1.NotFoundException("Convocatoria ".concat(id, " no encontrada"));
                            return [2 /*return*/, c];
                    }
                });
            });
        };
        ConvocatoriaService_1.prototype.findActivas = function () {
            return this.convocatoriaRepo.find({
                where: { estado: 'activa' },
                relations: ['oposicion'],
            });
        };
        ConvocatoriaService_1.prototype.findActivasConUrl = function () {
            return this.convocatoriaRepo
                .createQueryBuilder('c')
                .where('c.estado = :estado', { estado: 'activa' })
                .andWhere('c.urlInap IS NOT NULL')
                .getMany();
        };
        ConvocatoriaService_1.prototype.create = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                var convocatoria, resultado;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            convocatoria = this.convocatoriaRepo.create({
                                anyo: dto.anyo,
                                plazas: dto.plazas,
                                estado: dto.estado,
                                fechaExamen: dto.fechaExamen,
                                urlInap: dto.urlInap,
                                referenciaBoe: dto.referenciaBoe,
                                oposicion: { id: dto.oposicionId },
                            });
                            return [4 /*yield*/, this.convocatoriaRepo.save(convocatoria)];
                        case 1:
                            resultado = _a.sent();
                            // Actualizar estado de la oposición según si hay convocatoria activa
                            return [4 /*yield*/, this.actualizarEstadoOposicion(dto.oposicionId)];
                        case 2:
                            // Actualizar estado de la oposición según si hay convocatoria activa
                            _a.sent();
                            return [2 /*return*/, resultado];
                    }
                });
            });
        };
        ConvocatoriaService_1.prototype.actualizarEstadoOposicion = function (oposicionId) {
            return __awaiter(this, void 0, void 0, function () {
                var convocatoriaActiva;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.convocatoriaRepo.findOne({
                                where: { oposicion: { id: oposicionId }, estado: convocatoria_entity_1.EstadoConvocatoria.ACTIVA },
                            })];
                        case 1:
                            convocatoriaActiva = _a.sent();
                            return [4 /*yield*/, this.oposicionRepo.update(oposicionId, {
                                    activa: !!convocatoriaActiva,
                                })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ConvocatoriaService_1.prototype.update = function (id, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var convocatoria;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.convocatoriaRepo.update(id, dto)];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.findOne(id)];
                        case 3:
                            convocatoria = _a.sent();
                            return [4 /*yield*/, this.actualizarEstadoOposicion(convocatoria.oposicion.id)];
                        case 4:
                            _a.sent();
                            return [2 /*return*/, convocatoria];
                    }
                });
            });
        };
        ConvocatoriaService_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.convocatoriaRepo.delete(id)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ConvocatoriaService_1.prototype.saveDocumento = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var doc;
                return __generator(this, function (_a) {
                    doc = this.documentoRepo.create(data);
                    return [2 /*return*/, this.documentoRepo.save(doc)];
                });
            });
        };
        ConvocatoriaService_1.prototype.findDocumentosByUrl = function (url) {
            return this.documentoRepo.find({
                where: { urlPdf: url },
            });
        };
        ConvocatoriaService_1.prototype.findDocumentosByConvocatoria = function (convocatoriaId) {
            return this.documentoRepo.find({
                where: { convocatoria: { id: convocatoriaId } },
                order: { detectadoEn: 'DESC' },
            });
        };
        ConvocatoriaService_1.prototype.copiarConvocatoria = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var original, nueva, temas, mapaTemasViejoNuevo, _i, temas_1, tema, nuevoTema, _a, _b, _c, temaViejoId, temaNuevoId, notas, _d, notas_1, nota;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0: return [4 /*yield*/, this.convocatoriaRepo.findOne({
                                where: { id: id },
                                relations: ['oposicion', 'temas'],
                            })];
                        case 1:
                            original = _e.sent();
                            if (!original)
                                throw new common_1.NotFoundException('Convocatoria no encontrada');
                            return [4 /*yield*/, this.convocatoriaRepo.save(this.convocatoriaRepo.create({
                                    anyo: original.anyo + 1,
                                    plazas: original.plazas,
                                    estado: 'borrador',
                                    urlInap: original.urlInap,
                                    numEjercicios: original.numEjercicios,
                                    tipoEjercicio: original.tipoEjercicio,
                                    numPreguntas: original.numPreguntas,
                                    tiempoMinutos: original.tiempoMinutos,
                                    penalizacion: original.penalizacion,
                                    fraccionPenalizacion: original.fraccionPenalizacion,
                                    notaMinimaAprobado: original.notaMinimaAprobado,
                                    oposicion: { id: original.oposicion.id },
                                }))];
                        case 2:
                            nueva = _e.sent();
                            return [4 /*yield*/, this.temaRepo.find({
                                    where: { convocatoria: { id: id } },
                                    order: { numero: 'ASC' },
                                })];
                        case 3:
                            temas = _e.sent();
                            mapaTemasViejoNuevo = {};
                            _i = 0, temas_1 = temas;
                            _e.label = 4;
                        case 4:
                            if (!(_i < temas_1.length)) return [3 /*break*/, 7];
                            tema = temas_1[_i];
                            return [4 /*yield*/, this.temaRepo.save(this.temaRepo.create({
                                    numero: tema.numero,
                                    titulo: tema.titulo,
                                    tipo: tema.tipo,
                                    contexto: tema.contexto,
                                    convocatoria: { id: nueva.id },
                                }))];
                        case 5:
                            nuevoTema = _e.sent();
                            mapaTemasViejoNuevo[tema.id] = nuevoTema.id;
                            _e.label = 6;
                        case 6:
                            _i++;
                            return [3 /*break*/, 4];
                        case 7:
                            _a = 0, _b = Object.entries(mapaTemasViejoNuevo);
                            _e.label = 8;
                        case 8:
                            if (!(_a < _b.length)) return [3 /*break*/, 14];
                            _c = _b[_a], temaViejoId = _c[0], temaNuevoId = _c[1];
                            return [4 /*yield*/, this.notaRepo.find({
                                    where: { tema: { id: temaViejoId } },
                                    relations: ['usuario'],
                                })];
                        case 9:
                            notas = _e.sent();
                            _d = 0, notas_1 = notas;
                            _e.label = 10;
                        case 10:
                            if (!(_d < notas_1.length)) return [3 /*break*/, 13];
                            nota = notas_1[_d];
                            return [4 /*yield*/, this.notaRepo.save(this.notaRepo.create({
                                    contenido: nota.contenido,
                                    fechaRepaso: nota.fechaRepaso,
                                    usuario: { id: nota.usuario.id },
                                    tema: { id: temaNuevoId },
                                }))];
                        case 11:
                            _e.sent();
                            _e.label = 12;
                        case 12:
                            _d++;
                            return [3 /*break*/, 10];
                        case 13:
                            _a++;
                            return [3 /*break*/, 8];
                        case 14: return [2 /*return*/, nueva];
                    }
                });
            });
        };
        return ConvocatoriaService_1;
    }());
    __setFunctionName(_classThis, "ConvocatoriaService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ConvocatoriaService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ConvocatoriaService = _classThis;
}();
exports.ConvocatoriaService = ConvocatoriaService;
