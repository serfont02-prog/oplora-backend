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
exports.UsuarioController = void 0;
var common_1 = require("@nestjs/common");
var jwt_guard_1 = require("../auth/jwt.guard");
var consumo_helper_1 = require("../common/helpers/consumo.helper");
var common_2 = require("@nestjs/common");
var UsuarioController = function () {
    var _classDecorators = [(0, common_1.Controller)('usuarios'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findAll_decorators;
    var _getMisOposiciones_decorators;
    var _getMe_decorators;
    var _getLimites_decorators;
    var _marcarOnboardingGeneral_decorators;
    var _marcarOnboardingEntrenamiento_decorators;
    var _activarOposicion_decorators;
    var _desactivarOposicion_decorators;
    var _estadisticas_decorators;
    var _cambiarSuscripcion_decorators;
    var _desactivar_decorators;
    var _actualizarCompromiso_decorators;
    var _actualizarObjetivo_decorators;
    var _actualizarNivel_decorators;
    var UsuarioController = _classThis = /** @class */ (function () {
        function UsuarioController_1(service, configuracionService) {
            this.service = (__runInitializers(this, _instanceExtraInitializers), service);
            this.configuracionService = configuracionService;
        }
        UsuarioController_1.prototype.findAll = function () {
            return this.service.findAll();
        };
        UsuarioController_1.prototype.getMisOposiciones = function (req) {
            return this.service.getMisOposiciones(req.user.id);
        };
        UsuarioController_1.prototype.getMe = function (req) {
            return this.service.findMe(req.user.id);
        };
        UsuarioController_1.prototype.getLimites = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                var usuario, usuarioActualizado, limitesPlanes, limits;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.service.findById(req.user.id)];
                        case 1:
                            usuario = _b.sent();
                            if (!usuario)
                                throw new common_2.NotFoundException('Usuario no encontrado');
                            usuarioActualizado = (0, consumo_helper_1.resetearConsumosSiEsNuevoDia)(usuario);
                            if (!(usuarioActualizado.fechaResetConsumo !== usuario.fechaResetConsumo)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.service.guardarConsumo(usuarioActualizado)];
                        case 2:
                            _b.sent();
                            _b.label = 3;
                        case 3: return [4 /*yield*/, this.configuracionService.getLimitesPlanes()];
                        case 4:
                            limitesPlanes = _b.sent();
                            limits = limitesPlanes[(_a = usuarioActualizado.suscripcion) !== null && _a !== void 0 ? _a : 'gratuito'];
                            return [2 /*return*/, {
                                    suscripcion: usuarioActualizado.suscripcion,
                                    consumo: {
                                        preguntasTestHoy: usuarioActualizado.preguntasTestHoy,
                                        flashcardsHoy: usuarioActualizado.flashcardsHoy,
                                    },
                                    limites: {
                                        preguntasPorTest: limits.preguntasPorTest,
                                        preguntasPorTema: limits.preguntasPorTema,
                                        preguntasTestDia: limits.preguntasTestDia,
                                        flashcardsDia: limits.flashcardsDia,
                                        simulacros: limits.simulacros,
                                    },
                                }];
                    }
                });
            });
        };
        UsuarioController_1.prototype.marcarOnboardingGeneral = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.service.marcarOnboardingGeneral(req.user.id)];
                });
            });
        };
        UsuarioController_1.prototype.marcarOnboardingEntrenamiento = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.service.marcarOnboardingEntrenamiento(req.user.id)];
                });
            });
        };
        UsuarioController_1.prototype.activarOposicion = function (oposicionId, req) {
            return this.service.activarOposicion(req.user.id, oposicionId);
        };
        UsuarioController_1.prototype.desactivarOposicion = function (oposicionId, req) {
            return this.service.desactivarOposicion(req.user.id, oposicionId);
        };
        UsuarioController_1.prototype.estadisticas = function () {
            return this.service.getEstadisticas();
        };
        UsuarioController_1.prototype.cambiarSuscripcion = function (id, suscripcion) {
            console.log('PATCH SUSCRIPCION', id, suscripcion);
            return this.service.cambiarSuscripcion(id, suscripcion);
        };
        UsuarioController_1.prototype.desactivar = function (id) {
            return this.service.desactivar(id);
        };
        UsuarioController_1.prototype.actualizarCompromiso = function (req, compromiso) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.service.actualizarCompromiso(req.user.id, compromiso)];
                });
            });
        };
        UsuarioController_1.prototype.actualizarObjetivo = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.service.actualizarObjetivo(req.user.id, body.objetivo, body.nivel)];
                });
            });
        };
        UsuarioController_1.prototype.actualizarNivel = function (req, nivel) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.service.actualizarNivel(req.user.id, nivel)];
                });
            });
        };
        return UsuarioController_1;
    }());
    __setFunctionName(_classThis, "UsuarioController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findAll_decorators = [(0, common_1.Get)()];
        _getMisOposiciones_decorators = [(0, common_1.Get)('mis-oposiciones'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
        _getMe_decorators = [(0, common_1.Get)('me')];
        _getLimites_decorators = [(0, common_1.Get)('limites'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
        _marcarOnboardingGeneral_decorators = [(0, common_1.Post)('onboarding-general/completado')];
        _marcarOnboardingEntrenamiento_decorators = [(0, common_1.Post)('onboarding-entrenamiento/completado')];
        _activarOposicion_decorators = [(0, common_1.Post)('activar-oposicion/:oposicionId'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
        _desactivarOposicion_decorators = [(0, common_1.Delete)('desactivar-oposicion/:oposicionId'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
        _estadisticas_decorators = [(0, common_1.Get)('estadisticas')];
        _cambiarSuscripcion_decorators = [(0, common_1.Patch)(':id/suscripcion')];
        _desactivar_decorators = [(0, common_1.Patch)(':id/desactivar')];
        _actualizarCompromiso_decorators = [(0, common_1.Patch)('compromiso')];
        _actualizarObjetivo_decorators = [(0, common_1.Patch)('objetivo')];
        _actualizarNivel_decorators = [(0, common_1.Patch)('nivel')];
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMisOposiciones_decorators, { kind: "method", name: "getMisOposiciones", static: false, private: false, access: { has: function (obj) { return "getMisOposiciones" in obj; }, get: function (obj) { return obj.getMisOposiciones; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMe_decorators, { kind: "method", name: "getMe", static: false, private: false, access: { has: function (obj) { return "getMe" in obj; }, get: function (obj) { return obj.getMe; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getLimites_decorators, { kind: "method", name: "getLimites", static: false, private: false, access: { has: function (obj) { return "getLimites" in obj; }, get: function (obj) { return obj.getLimites; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _marcarOnboardingGeneral_decorators, { kind: "method", name: "marcarOnboardingGeneral", static: false, private: false, access: { has: function (obj) { return "marcarOnboardingGeneral" in obj; }, get: function (obj) { return obj.marcarOnboardingGeneral; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _marcarOnboardingEntrenamiento_decorators, { kind: "method", name: "marcarOnboardingEntrenamiento", static: false, private: false, access: { has: function (obj) { return "marcarOnboardingEntrenamiento" in obj; }, get: function (obj) { return obj.marcarOnboardingEntrenamiento; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _activarOposicion_decorators, { kind: "method", name: "activarOposicion", static: false, private: false, access: { has: function (obj) { return "activarOposicion" in obj; }, get: function (obj) { return obj.activarOposicion; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _desactivarOposicion_decorators, { kind: "method", name: "desactivarOposicion", static: false, private: false, access: { has: function (obj) { return "desactivarOposicion" in obj; }, get: function (obj) { return obj.desactivarOposicion; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _estadisticas_decorators, { kind: "method", name: "estadisticas", static: false, private: false, access: { has: function (obj) { return "estadisticas" in obj; }, get: function (obj) { return obj.estadisticas; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _cambiarSuscripcion_decorators, { kind: "method", name: "cambiarSuscripcion", static: false, private: false, access: { has: function (obj) { return "cambiarSuscripcion" in obj; }, get: function (obj) { return obj.cambiarSuscripcion; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _desactivar_decorators, { kind: "method", name: "desactivar", static: false, private: false, access: { has: function (obj) { return "desactivar" in obj; }, get: function (obj) { return obj.desactivar; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _actualizarCompromiso_decorators, { kind: "method", name: "actualizarCompromiso", static: false, private: false, access: { has: function (obj) { return "actualizarCompromiso" in obj; }, get: function (obj) { return obj.actualizarCompromiso; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _actualizarObjetivo_decorators, { kind: "method", name: "actualizarObjetivo", static: false, private: false, access: { has: function (obj) { return "actualizarObjetivo" in obj; }, get: function (obj) { return obj.actualizarObjetivo; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _actualizarNivel_decorators, { kind: "method", name: "actualizarNivel", static: false, private: false, access: { has: function (obj) { return "actualizarNivel" in obj; }, get: function (obj) { return obj.actualizarNivel; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UsuarioController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UsuarioController = _classThis;
}();
exports.UsuarioController = UsuarioController;
