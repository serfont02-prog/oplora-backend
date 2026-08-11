"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
exports.NormativaController = void 0;
var common_1 = require("@nestjs/common");
var jwt_guard_1 = require("../auth/jwt.guard");
var NormativaController = function () {
    var _classDecorators = [(0, common_1.Controller)('normativa'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getNota_decorators;
    var _buscarArticulos_decorators;
    var _getNotaTema_decorators;
    var _guardarNotaTema_decorators;
    var _programarRepaso_decorators;
    var _guardarNota_decorators;
    var _getSubrayados_decorators;
    var _crearSubrayado_decorators;
    var _borrarSubrayado_decorators;
    var _getTitulos_decorators;
    var _getCapitulos_decorators;
    var _getArticulo_decorators;
    var _anteriorSiguiente_decorators;
    var _getArticulosTitulo_decorators;
    var _getArticulos_decorators;
    var _importarContenidoIA_decorators;
    var _importarEstructura_decorators;
    var _importarArticulos_decorators;
    var _importarArticulosTitulo_decorators;
    var NormativaController = _classThis = /** @class */ (function () {
        function NormativaController_1(tituloRepo, capituloRepo, articuloRepo, normativaService) {
            this.tituloRepo = (__runInitializers(this, _instanceExtraInitializers), tituloRepo);
            this.capituloRepo = capituloRepo;
            this.articuloRepo = articuloRepo;
            this.normativaService = normativaService;
        }
        NormativaController_1.prototype.getNota = function (articuloId, req) {
            return this.normativaService.getNota(req.user.id, articuloId);
        };
        NormativaController_1.prototype.buscarArticulos = function (versionLeyId, q) {
            return this.normativaService.buscarArticulos(versionLeyId, q);
        };
        NormativaController_1.prototype.getNotaTema = function (temaId, req) {
            return this.normativaService.getNotaTema(req.user.id, temaId);
        };
        NormativaController_1.prototype.guardarNotaTema = function (temaId, contenido, req) {
            return this.normativaService.guardarNotaTema(req.user.id, temaId, contenido);
        };
        NormativaController_1.prototype.programarRepaso = function (temaId, fecha, req) {
            return this.normativaService.programarRepasoTema(req.user.id, temaId, new Date(fecha));
        };
        NormativaController_1.prototype.guardarNota = function (articuloId, contenido, req) {
            return this.normativaService.guardarNota(req.user.id, articuloId, contenido);
        };
        NormativaController_1.prototype.getSubrayados = function (articuloId, req) {
            return this.normativaService.getSubrayados(req.user.id, articuloId);
        };
        NormativaController_1.prototype.crearSubrayado = function (articuloId, inicio, fin, textoSeleccionado, color, req) {
            return this.normativaService.crearSubrayado(req.user.id, articuloId, inicio, fin, textoSeleccionado, color);
        };
        NormativaController_1.prototype.borrarSubrayado = function (id, req) {
            return this.normativaService.borrarSubrayado(id, req.user.id);
        };
        NormativaController_1.prototype.getTitulos = function (versionLeyId) {
            return this.tituloRepo.find({
                where: { versionLey: { id: versionLeyId } },
                order: { orden: 'ASC' },
            });
        };
        NormativaController_1.prototype.getCapitulos = function (tituloId) {
            return this.capituloRepo.find({
                where: { tituloRef: { id: tituloId } },
                order: { orden: 'ASC' },
            });
        };
        NormativaController_1.prototype.getArticulo = function (id) {
            return this.articuloRepo.findOne({
                where: { id: id },
                relations: [
                    'capitulo',
                    'capitulo.tituloRef',
                    'capitulo.tituloRef.versionLey',
                    'capitulo.tituloRef.versionLey.ley',
                    'tituloRef',
                    'tituloRef.versionLey',
                    'tituloRef.versionLey.ley',
                ],
            });
        };
        NormativaController_1.prototype.anteriorSiguiente = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var articulo, orden, capituloId, tituloId, versionLeyId, tituloOrden, anterior, siguiente, capituloOrden, capituloAnterior, tituloAnterior, ultimoCap, siguienteCapitulo, siguienteTitulo, primerCap, tituloAnterior, ultimoCap, primerCapitulo, siguienteTitulo, primerCap;
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
                return __generator(this, function (_t) {
                    switch (_t.label) {
                        case 0: return [4 /*yield*/, this.articuloRepo.findOne({
                                where: { id: id },
                                relations: [
                                    'capitulo',
                                    'capitulo.tituloRef',
                                    'capitulo.tituloRef.versionLey',
                                    'tituloRef',
                                    'tituloRef.versionLey',
                                ],
                            })];
                        case 1:
                            articulo = _t.sent();
                            if (!articulo)
                                return [2 /*return*/, { anterior: null, siguiente: null }];
                            orden = articulo.orden;
                            capituloId = (_a = articulo.capitulo) === null || _a === void 0 ? void 0 : _a.id;
                            tituloId = (_c = (_b = articulo.tituloRef) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : (_e = (_d = articulo.capitulo) === null || _d === void 0 ? void 0 : _d.tituloRef) === null || _e === void 0 ? void 0 : _e.id;
                            versionLeyId = (_j = (_h = (_g = (_f = articulo.capitulo) === null || _f === void 0 ? void 0 : _f.tituloRef) === null || _g === void 0 ? void 0 : _g.versionLey) === null || _h === void 0 ? void 0 : _h.id) !== null && _j !== void 0 ? _j : (_l = (_k = articulo.tituloRef) === null || _k === void 0 ? void 0 : _k.versionLey) === null || _l === void 0 ? void 0 : _l.id;
                            tituloOrden = (_p = (_o = (_m = articulo.capitulo) === null || _m === void 0 ? void 0 : _m.tituloRef) === null || _o === void 0 ? void 0 : _o.orden) !== null && _p !== void 0 ? _p : (_q = articulo.tituloRef) === null || _q === void 0 ? void 0 : _q.orden;
                            anterior = null;
                            siguiente = null;
                            if (!capituloId) return [3 /*break*/, 23];
                            capituloOrden = (_s = (_r = articulo.capitulo) === null || _r === void 0 ? void 0 : _r.orden) !== null && _s !== void 0 ? _s : 1;
                            return [4 /*yield*/, this.articuloRepo.findOne({
                                    where: { capitulo: { id: capituloId }, orden: orden - 1, vigente: true },
                                })];
                        case 2:
                            // Buscar en el mismo capítulo
                            anterior = _t.sent();
                            return [4 /*yield*/, this.articuloRepo.findOne({
                                    where: { capitulo: { id: capituloId }, orden: orden + 1, vigente: true },
                                })];
                        case 3:
                            siguiente = _t.sent();
                            if (!(!anterior && tituloId)) return [3 /*break*/, 14];
                            return [4 /*yield*/, this.capituloRepo.findOne({
                                    where: { tituloRef: { id: tituloId }, orden: capituloOrden - 1 },
                                })];
                        case 4:
                            capituloAnterior = _t.sent();
                            if (!capituloAnterior) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.articuloRepo.findOne({
                                    where: { capitulo: { id: capituloAnterior.id }, vigente: true },
                                    order: { orden: 'DESC' },
                                })];
                        case 5:
                            anterior = _t.sent();
                            _t.label = 6;
                        case 6:
                            if (!!anterior) return [3 /*break*/, 8];
                            return [4 /*yield*/, this.articuloRepo.findOne({
                                    where: { tituloRef: { id: tituloId }, vigente: true },
                                    order: { orden: 'DESC' },
                                })];
                        case 7:
                            anterior = _t.sent();
                            _t.label = 8;
                        case 8:
                            if (!(!anterior && versionLeyId && tituloOrden)) return [3 /*break*/, 14];
                            return [4 /*yield*/, this.tituloRepo.findOne({
                                    where: { versionLey: { id: versionLeyId }, orden: tituloOrden - 1 },
                                })];
                        case 9:
                            tituloAnterior = _t.sent();
                            if (!tituloAnterior) return [3 /*break*/, 14];
                            return [4 /*yield*/, this.capituloRepo.findOne({
                                    where: { tituloRef: { id: tituloAnterior.id } },
                                    order: { orden: 'DESC' },
                                })];
                        case 10:
                            ultimoCap = _t.sent();
                            if (!ultimoCap) return [3 /*break*/, 12];
                            return [4 /*yield*/, this.articuloRepo.findOne({
                                    where: { capitulo: { id: ultimoCap.id }, vigente: true },
                                    order: { orden: 'DESC' },
                                })];
                        case 11:
                            anterior = _t.sent();
                            _t.label = 12;
                        case 12:
                            if (!!anterior) return [3 /*break*/, 14];
                            return [4 /*yield*/, this.articuloRepo.findOne({
                                    where: { tituloRef: { id: tituloAnterior.id }, vigente: true },
                                    order: { orden: 'DESC' },
                                })];
                        case 13:
                            anterior = _t.sent();
                            _t.label = 14;
                        case 14:
                            if (!(!siguiente && tituloId)) return [3 /*break*/, 17];
                            return [4 /*yield*/, this.capituloRepo.findOne({
                                    where: { tituloRef: { id: tituloId }, orden: capituloOrden + 1 },
                                })];
                        case 15:
                            siguienteCapitulo = _t.sent();
                            if (!siguienteCapitulo) return [3 /*break*/, 17];
                            return [4 /*yield*/, this.articuloRepo.findOne({
                                    where: { capitulo: { id: siguienteCapitulo.id }, vigente: true },
                                    order: { orden: 'ASC' },
                                })];
                        case 16:
                            siguiente = _t.sent();
                            _t.label = 17;
                        case 17:
                            if (!(!siguiente && versionLeyId && tituloOrden !== undefined)) return [3 /*break*/, 22];
                            return [4 /*yield*/, this.tituloRepo.findOne({
                                    where: { versionLey: { id: versionLeyId }, orden: tituloOrden + 1 },
                                })];
                        case 18:
                            siguienteTitulo = _t.sent();
                            if (!siguienteTitulo) return [3 /*break*/, 22];
                            return [4 /*yield*/, this.articuloRepo.findOne({
                                    where: { tituloRef: { id: siguienteTitulo.id }, vigente: true },
                                    order: { orden: 'ASC' },
                                })];
                        case 19:
                            siguiente = _t.sent();
                            if (!!siguiente) return [3 /*break*/, 22];
                            return [4 /*yield*/, this.capituloRepo.findOne({
                                    where: { tituloRef: { id: siguienteTitulo.id } },
                                    order: { orden: 'ASC' },
                                })];
                        case 20:
                            primerCap = _t.sent();
                            if (!primerCap) return [3 /*break*/, 22];
                            return [4 /*yield*/, this.articuloRepo.findOne({
                                    where: { capitulo: { id: primerCap.id }, vigente: true },
                                    order: { orden: 'ASC' },
                                })];
                        case 21:
                            siguiente = _t.sent();
                            _t.label = 22;
                        case 22: return [3 /*break*/, 39];
                        case 23:
                            if (!tituloId) return [3 /*break*/, 39];
                            return [4 /*yield*/, this.articuloRepo.findOne({
                                    where: { tituloRef: { id: tituloId }, orden: orden - 1, vigente: true },
                                })];
                        case 24:
                            // Artículo directo del título
                            anterior = _t.sent();
                            return [4 /*yield*/, this.articuloRepo.findOne({
                                    where: { tituloRef: { id: tituloId }, orden: orden + 1, vigente: true },
                                })];
                        case 25:
                            siguiente = _t.sent();
                            if (!(!anterior && versionLeyId && tituloOrden)) return [3 /*break*/, 31];
                            return [4 /*yield*/, this.tituloRepo.findOne({
                                    where: { versionLey: { id: versionLeyId }, orden: tituloOrden - 1 },
                                })];
                        case 26:
                            tituloAnterior = _t.sent();
                            if (!tituloAnterior) return [3 /*break*/, 31];
                            return [4 /*yield*/, this.capituloRepo.findOne({
                                    where: { tituloRef: { id: tituloAnterior.id } },
                                    order: { orden: 'DESC' },
                                })];
                        case 27:
                            ultimoCap = _t.sent();
                            if (!ultimoCap) return [3 /*break*/, 29];
                            return [4 /*yield*/, this.articuloRepo.findOne({
                                    where: { capitulo: { id: ultimoCap.id }, vigente: true },
                                    order: { orden: 'DESC' },
                                })];
                        case 28:
                            anterior = _t.sent();
                            _t.label = 29;
                        case 29:
                            if (!!anterior) return [3 /*break*/, 31];
                            return [4 /*yield*/, this.articuloRepo.findOne({
                                    where: { tituloRef: { id: tituloAnterior.id }, vigente: true },
                                    order: { orden: 'DESC' },
                                })];
                        case 30:
                            anterior = _t.sent();
                            _t.label = 31;
                        case 31:
                            if (!!siguiente) return [3 /*break*/, 34];
                            return [4 /*yield*/, this.capituloRepo.findOne({
                                    where: { tituloRef: { id: tituloId } },
                                    order: { orden: 'ASC' },
                                })];
                        case 32:
                            primerCapitulo = _t.sent();
                            if (!primerCapitulo) return [3 /*break*/, 34];
                            return [4 /*yield*/, this.articuloRepo.findOne({
                                    where: { capitulo: { id: primerCapitulo.id }, vigente: true },
                                    order: { orden: 'ASC' },
                                })];
                        case 33:
                            siguiente = _t.sent();
                            _t.label = 34;
                        case 34:
                            if (!(!siguiente && versionLeyId && tituloOrden !== undefined)) return [3 /*break*/, 39];
                            return [4 /*yield*/, this.tituloRepo.findOne({
                                    where: { versionLey: { id: versionLeyId }, orden: tituloOrden + 1 },
                                })];
                        case 35:
                            siguienteTitulo = _t.sent();
                            if (!siguienteTitulo) return [3 /*break*/, 39];
                            return [4 /*yield*/, this.articuloRepo.findOne({
                                    where: { tituloRef: { id: siguienteTitulo.id }, vigente: true },
                                    order: { orden: 'ASC' },
                                })];
                        case 36:
                            siguiente = _t.sent();
                            if (!!siguiente) return [3 /*break*/, 39];
                            return [4 /*yield*/, this.capituloRepo.findOne({
                                    where: { tituloRef: { id: siguienteTitulo.id } },
                                    order: { orden: 'ASC' },
                                })];
                        case 37:
                            primerCap = _t.sent();
                            if (!primerCap) return [3 /*break*/, 39];
                            return [4 /*yield*/, this.articuloRepo.findOne({
                                    where: { capitulo: { id: primerCap.id }, vigente: true },
                                    order: { orden: 'ASC' },
                                })];
                        case 38:
                            siguiente = _t.sent();
                            _t.label = 39;
                        case 39: return [2 /*return*/, { anterior: anterior, siguiente: siguiente }];
                    }
                });
            });
        };
        NormativaController_1.prototype.getArticulosTitulo = function (tituloId) {
            return this.articuloRepo.find({
                where: { tituloRef: { id: tituloId }, vigente: true },
                order: { orden: 'ASC' },
            });
        };
        NormativaController_1.prototype.getArticulos = function (capituloId) {
            return this.articuloRepo.find({
                where: { capitulo: { id: capituloId }, vigente: true },
                order: { orden: 'ASC' },
            });
        };
        NormativaController_1.prototype.importarContenidoIA = function (body) {
            return this.normativaService.importarContenidoIA(body.contenido);
        };
        NormativaController_1.prototype.importarEstructura = function (datos) {
            return this.normativaService.importarEstructura(datos);
        };
        NormativaController_1.prototype.importarArticulos = function (articulos, capituloId) {
            return this.normativaService.importarArticulos(articulos, capituloId);
        };
        NormativaController_1.prototype.importarArticulosTitulo = function (articulos, tituloId) {
            return this.normativaService.importarArticulosEnTitulo(articulos, tituloId);
        };
        return NormativaController_1;
    }());
    __setFunctionName(_classThis, "NormativaController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getNota_decorators = [(0, common_1.Get)('nota/:articuloId')];
        _buscarArticulos_decorators = [(0, common_1.Get)('buscar/:versionLeyId')];
        _getNotaTema_decorators = [(0, common_1.Get)('nota-tema/:temaId')];
        _guardarNotaTema_decorators = [(0, common_1.Post)('nota-tema/:temaId')];
        _programarRepaso_decorators = [(0, common_1.Post)('nota-tema/:temaId/programar')];
        _guardarNota_decorators = [(0, common_1.Post)('nota/:articuloId')];
        _getSubrayados_decorators = [(0, common_1.Get)('subrayados/:articuloId')];
        _crearSubrayado_decorators = [(0, common_1.Post)('subrayados/:articuloId')];
        _borrarSubrayado_decorators = [(0, common_1.Delete)('subrayados/:id')];
        _getTitulos_decorators = [(0, common_1.Get)('titulos/:versionLeyId')];
        _getCapitulos_decorators = [(0, common_1.Get)('capitulos/:tituloId')];
        _getArticulo_decorators = [(0, common_1.Get)('articulo/:id')];
        _anteriorSiguiente_decorators = [(0, common_1.Get)('articulo/:id/anterior-siguiente')];
        _getArticulosTitulo_decorators = [(0, common_1.Get)('articulos-titulo/:tituloId')];
        _getArticulos_decorators = [(0, common_1.Get)('articulos/:capituloId')];
        _importarContenidoIA_decorators = [(0, common_1.Post)('importar-contenido-ia')];
        _importarEstructura_decorators = [(0, common_1.Post)('importar-estructura')];
        _importarArticulos_decorators = [(0, common_1.Post)('importar-articulos')];
        _importarArticulosTitulo_decorators = [(0, common_1.Post)('importar-articulos-titulo')];
        __esDecorate(_classThis, null, _getNota_decorators, { kind: "method", name: "getNota", static: false, private: false, access: { has: function (obj) { return "getNota" in obj; }, get: function (obj) { return obj.getNota; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _buscarArticulos_decorators, { kind: "method", name: "buscarArticulos", static: false, private: false, access: { has: function (obj) { return "buscarArticulos" in obj; }, get: function (obj) { return obj.buscarArticulos; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getNotaTema_decorators, { kind: "method", name: "getNotaTema", static: false, private: false, access: { has: function (obj) { return "getNotaTema" in obj; }, get: function (obj) { return obj.getNotaTema; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _guardarNotaTema_decorators, { kind: "method", name: "guardarNotaTema", static: false, private: false, access: { has: function (obj) { return "guardarNotaTema" in obj; }, get: function (obj) { return obj.guardarNotaTema; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _programarRepaso_decorators, { kind: "method", name: "programarRepaso", static: false, private: false, access: { has: function (obj) { return "programarRepaso" in obj; }, get: function (obj) { return obj.programarRepaso; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _guardarNota_decorators, { kind: "method", name: "guardarNota", static: false, private: false, access: { has: function (obj) { return "guardarNota" in obj; }, get: function (obj) { return obj.guardarNota; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSubrayados_decorators, { kind: "method", name: "getSubrayados", static: false, private: false, access: { has: function (obj) { return "getSubrayados" in obj; }, get: function (obj) { return obj.getSubrayados; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _crearSubrayado_decorators, { kind: "method", name: "crearSubrayado", static: false, private: false, access: { has: function (obj) { return "crearSubrayado" in obj; }, get: function (obj) { return obj.crearSubrayado; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _borrarSubrayado_decorators, { kind: "method", name: "borrarSubrayado", static: false, private: false, access: { has: function (obj) { return "borrarSubrayado" in obj; }, get: function (obj) { return obj.borrarSubrayado; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getTitulos_decorators, { kind: "method", name: "getTitulos", static: false, private: false, access: { has: function (obj) { return "getTitulos" in obj; }, get: function (obj) { return obj.getTitulos; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCapitulos_decorators, { kind: "method", name: "getCapitulos", static: false, private: false, access: { has: function (obj) { return "getCapitulos" in obj; }, get: function (obj) { return obj.getCapitulos; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getArticulo_decorators, { kind: "method", name: "getArticulo", static: false, private: false, access: { has: function (obj) { return "getArticulo" in obj; }, get: function (obj) { return obj.getArticulo; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _anteriorSiguiente_decorators, { kind: "method", name: "anteriorSiguiente", static: false, private: false, access: { has: function (obj) { return "anteriorSiguiente" in obj; }, get: function (obj) { return obj.anteriorSiguiente; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getArticulosTitulo_decorators, { kind: "method", name: "getArticulosTitulo", static: false, private: false, access: { has: function (obj) { return "getArticulosTitulo" in obj; }, get: function (obj) { return obj.getArticulosTitulo; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getArticulos_decorators, { kind: "method", name: "getArticulos", static: false, private: false, access: { has: function (obj) { return "getArticulos" in obj; }, get: function (obj) { return obj.getArticulos; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _importarContenidoIA_decorators, { kind: "method", name: "importarContenidoIA", static: false, private: false, access: { has: function (obj) { return "importarContenidoIA" in obj; }, get: function (obj) { return obj.importarContenidoIA; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _importarEstructura_decorators, { kind: "method", name: "importarEstructura", static: false, private: false, access: { has: function (obj) { return "importarEstructura" in obj; }, get: function (obj) { return obj.importarEstructura; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _importarArticulos_decorators, { kind: "method", name: "importarArticulos", static: false, private: false, access: { has: function (obj) { return "importarArticulos" in obj; }, get: function (obj) { return obj.importarArticulos; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _importarArticulosTitulo_decorators, { kind: "method", name: "importarArticulosTitulo", static: false, private: false, access: { has: function (obj) { return "importarArticulosTitulo" in obj; }, get: function (obj) { return obj.importarArticulosTitulo; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NormativaController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NormativaController = _classThis;
}();
exports.NormativaController = NormativaController;
