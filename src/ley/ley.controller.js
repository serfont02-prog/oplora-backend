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
exports.LeyController = void 0;
var common_1 = require("@nestjs/common");
var platform_express_1 = require("@nestjs/platform-express");
var path_1 = require("path");
var version_ley_entity_1 = require("./version-ley.entity");
var LeyController = function () {
    var _classDecorators = [(0, common_1.Controller)('leyes')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findAll_decorators;
    var _findByOposicion_decorators;
    var _findOne_decorators;
    var _create_decorators;
    var _update_decorators;
    var _findOposiciones_decorators;
    var _findVersiones_decorators;
    var _subirVersion_decorators;
    var _activarVersion_decorators;
    var _subirLeyNueva_decorators;
    var _vincular_decorators;
    var _desvincular_decorators;
    var _findDiffs_decorators;
    var _parsearVersion_decorators;
    var _eliminar_decorators;
    var LeyController = _classThis = /** @class */ (function () {
        function LeyController_1(service, parseoService) {
            this.service = (__runInitializers(this, _instanceExtraInitializers), service);
            this.parseoService = parseoService;
        }
        // ─── LEYES ───────────────────────────────────────────────
        LeyController_1.prototype.findAll = function (search) {
            return this.service.findAll(search);
        };
        LeyController_1.prototype.findByOposicion = function (oposicionId) {
            return this.service.findByOposicion(oposicionId);
        };
        LeyController_1.prototype.findOne = function (id) {
            return this.service.findOne(id);
        };
        LeyController_1.prototype.create = function (nombre, descripcion) {
            return this.service.create(nombre, descripcion);
        };
        LeyController_1.prototype.update = function (id, datos) {
            return this.service.update(id, datos);
        };
        LeyController_1.prototype.findOposiciones = function (id) {
            return this.service.findOposicionesByLey(id);
        };
        // ─── VERSIONES ───────────────────────────────────────────
        LeyController_1.prototype.findVersiones = function (id) {
            return this.service.findVersiones(id);
        };
        LeyController_1.prototype.subirVersion = function (leyId, file, version, referenciaBoe, tipoNorma, fechaPublicacion, fechaVigencia, tipoCambio, notas, versionAnteriorId) {
            return __awaiter(this, void 0, void 0, function () {
                var ext, texto, nuevaVersion;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            ext = (0, path_1.extname)(file.originalname).toLowerCase();
                            return [4 /*yield*/, this.service.procesarArchivo(file.path, ext)];
                        case 1:
                            texto = _a.sent();
                            return [4 /*yield*/, this.service.crearVersion(leyId, { version: version, referenciaBoe: referenciaBoe, tipoNorma: tipoNorma, fechaPublicacion: fechaPublicacion, fechaVigencia: fechaVigencia, tipoCambio: tipoCambio, notas: notas }, texto)];
                        case 2:
                            nuevaVersion = _a.sent();
                            if (!versionAnteriorId) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.service.crearDiff(nuevaVersion.id, versionAnteriorId)];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4: return [2 /*return*/, {
                                version: nuevaVersion,
                                textoExtraido: texto.substring(0, 500),
                                totalCaracteres: texto.length,
                            }];
                    }
                });
            });
        };
        LeyController_1.prototype.activarVersion = function (_leyId, versionId) {
            return this.service.activarVersion(versionId);
        };
        // ─── SUBIR LEY NUEVA (crea ley + primera versión) ────────
        LeyController_1.prototype.subirLeyNueva = function (file, nombre, descripcion, referenciaBoe, tipoNorma, fechaPublicacion, oposicionIdsRaw) {
            return __awaiter(this, void 0, void 0, function () {
                var ext, texto, ley, version, oposicionIds, _i, oposicionIds_1, oposicionId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            ext = (0, path_1.extname)(file.originalname).toLowerCase();
                            return [4 /*yield*/, this.service.procesarArchivo(file.path, ext)];
                        case 1:
                            texto = _a.sent();
                            return [4 /*yield*/, this.service.create(nombre, descripcion || undefined)];
                        case 2:
                            ley = _a.sent();
                            return [4 /*yield*/, this.service.crearVersion(ley.id, {
                                    version: '1.0',
                                    referenciaBoe: referenciaBoe || undefined,
                                    tipoNorma: tipoNorma || undefined,
                                    fechaPublicacion: fechaPublicacion || undefined,
                                    tipoCambio: version_ley_entity_1.TipoCambio.INICIAL,
                                }, texto)];
                        case 3:
                            version = _a.sent();
                            oposicionIds = oposicionIdsRaw
                                ? JSON.parse(oposicionIdsRaw)
                                : [];
                            _i = 0, oposicionIds_1 = oposicionIds;
                            _a.label = 4;
                        case 4:
                            if (!(_i < oposicionIds_1.length)) return [3 /*break*/, 7];
                            oposicionId = oposicionIds_1[_i];
                            return [4 /*yield*/, this.service.vincular(ley.id, oposicionId, version.id)];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6:
                            _i++;
                            return [3 /*break*/, 4];
                        case 7: return [2 /*return*/, {
                                ley: ley,
                                version: version,
                                textoExtraido: texto.substring(0, 500),
                                totalCaracteres: texto.length,
                            }];
                    }
                });
            });
        };
        // ─── VINCULACIÓN ─────────────────────────────────────────
        LeyController_1.prototype.vincular = function (leyId, oposicionId, versionLeyId) {
            return this.service.vincular(leyId, oposicionId, versionLeyId);
        };
        LeyController_1.prototype.desvincular = function (leyId, oposicionId) {
            return this.service.desvincular(leyId, oposicionId);
        };
        // ─── DIFFS ───────────────────────────────────────────────
        LeyController_1.prototype.findDiffs = function (id) {
            return this.service.findDiffs(id);
        };
        LeyController_1.prototype.parsearVersion = function (_leyId, versionId) {
            return this.parseoService.parsearVersion(versionId);
        };
        LeyController_1.prototype.eliminar = function (id) {
            return this.service.eliminar(id);
        };
        return LeyController_1;
    }());
    __setFunctionName(_classThis, "LeyController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findAll_decorators = [(0, common_1.Get)()];
        _findByOposicion_decorators = [(0, common_1.Get)('oposicion/:oposicionId')];
        _findOne_decorators = [(0, common_1.Get)(':id')];
        _create_decorators = [(0, common_1.Post)()];
        _update_decorators = [(0, common_1.Patch)(':id')];
        _findOposiciones_decorators = [(0, common_1.Get)(':id/oposiciones')];
        _findVersiones_decorators = [(0, common_1.Get)(':id/versiones')];
        _subirVersion_decorators = [(0, common_1.Post)(':id/versiones/subir'), (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('archivo'))];
        _activarVersion_decorators = [(0, common_1.Patch)(':id/versiones/:versionId/activar')];
        _subirLeyNueva_decorators = [(0, common_1.Post)('subir'), (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('archivo'))];
        _vincular_decorators = [(0, common_1.Post)('vincular')];
        _desvincular_decorators = [(0, common_1.Delete)(':leyId/oposicion/:oposicionId')];
        _findDiffs_decorators = [(0, common_1.Get)(':id/diffs')];
        _parsearVersion_decorators = [(0, common_1.Post)(':id/versiones/:versionId/parsear')];
        _eliminar_decorators = [(0, common_1.Delete)(':id')];
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByOposicion_decorators, { kind: "method", name: "findByOposicion", static: false, private: false, access: { has: function (obj) { return "findByOposicion" in obj; }, get: function (obj) { return obj.findByOposicion; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: function (obj) { return "update" in obj; }, get: function (obj) { return obj.update; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOposiciones_decorators, { kind: "method", name: "findOposiciones", static: false, private: false, access: { has: function (obj) { return "findOposiciones" in obj; }, get: function (obj) { return obj.findOposiciones; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findVersiones_decorators, { kind: "method", name: "findVersiones", static: false, private: false, access: { has: function (obj) { return "findVersiones" in obj; }, get: function (obj) { return obj.findVersiones; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _subirVersion_decorators, { kind: "method", name: "subirVersion", static: false, private: false, access: { has: function (obj) { return "subirVersion" in obj; }, get: function (obj) { return obj.subirVersion; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _activarVersion_decorators, { kind: "method", name: "activarVersion", static: false, private: false, access: { has: function (obj) { return "activarVersion" in obj; }, get: function (obj) { return obj.activarVersion; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _subirLeyNueva_decorators, { kind: "method", name: "subirLeyNueva", static: false, private: false, access: { has: function (obj) { return "subirLeyNueva" in obj; }, get: function (obj) { return obj.subirLeyNueva; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _vincular_decorators, { kind: "method", name: "vincular", static: false, private: false, access: { has: function (obj) { return "vincular" in obj; }, get: function (obj) { return obj.vincular; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _desvincular_decorators, { kind: "method", name: "desvincular", static: false, private: false, access: { has: function (obj) { return "desvincular" in obj; }, get: function (obj) { return obj.desvincular; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findDiffs_decorators, { kind: "method", name: "findDiffs", static: false, private: false, access: { has: function (obj) { return "findDiffs" in obj; }, get: function (obj) { return obj.findDiffs; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _parsearVersion_decorators, { kind: "method", name: "parsearVersion", static: false, private: false, access: { has: function (obj) { return "parsearVersion" in obj; }, get: function (obj) { return obj.parsearVersion; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _eliminar_decorators, { kind: "method", name: "eliminar", static: false, private: false, access: { has: function (obj) { return "eliminar" in obj; }, get: function (obj) { return obj.eliminar; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        LeyController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return LeyController = _classThis;
}();
exports.LeyController = LeyController;
