"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.NotificacionController = void 0;
var common_1 = require("@nestjs/common");
var jwt_guard_1 = require("../auth/jwt.guard");
var notificacion_entity_1 = require("./notificacion.entity");
var NotificacionController = function () {
    var _classDecorators = [(0, common_1.Controller)('notificaciones')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findAll_decorators;
    var _count_decorators;
    var _marcarLeida_decorators;
    var _marcarTodasLeidas_decorators;
    var _seed_decorators;
    var NotificacionController = _classThis = /** @class */ (function () {
        function NotificacionController_1(service) {
            this.service = (__runInitializers(this, _instanceExtraInitializers), service);
        }
        NotificacionController_1.prototype.findAll = function (req, noLeidas) {
            return this.service.findByUsuario(req.user.id, noLeidas === 'true');
        };
        NotificacionController_1.prototype.count = function (req) {
            return this.service.countNoLeidas(req.user.id);
        };
        NotificacionController_1.prototype.marcarLeida = function (id, req) {
            return this.service.marcarLeida(id, req.user.id);
        };
        NotificacionController_1.prototype.marcarTodasLeidas = function (req) {
            return this.service.marcarTodasLeidas(req.user.id);
        };
        NotificacionController_1.prototype.seed = function (usuarioId) {
            return __awaiter(this, void 0, void 0, function () {
                var tipos, _i, tipos_1, t;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tipos = [
                                {
                                    tipo: notificacion_entity_1.TipoNotificacion.ADMITIDO,
                                    titulo: '¡Apareces en la lista de admitidos!',
                                    mensaje: 'Estás en la lista provisional de admitidos de Auxiliar Administrativo 2025. Acceso general.',
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.ALTA,
                                },
                                {
                                    tipo: notificacion_entity_1.TipoNotificacion.CAMBIO_NORMATIVO,
                                    titulo: 'Cambio en normativa de tu temario',
                                    mensaje: 'Ley 39/2015 · Art. 14 modificado. Afecta a derechos digitales del ciudadano.',
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.ALTA,
                                },
                                {
                                    tipo: notificacion_entity_1.TipoNotificacion.NUEVO_DOCUMENTO,
                                    titulo: 'Nuevo documento publicado',
                                    mensaje: 'Lista provisional de excluidos publicada en Auxiliar Administrativo 2025.',
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.MEDIA,
                                },
                                {
                                    tipo: notificacion_entity_1.TipoNotificacion.RETO_RECIBIDO,
                                    titulo: 'María García te reta ⚡',
                                    mensaje: 'Te han enviado un reto de Auxiliar Administrativo. ¿Aceptas el desafío?',
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.MEDIA,
                                },
                                {
                                    tipo: notificacion_entity_1.TipoNotificacion.RETO_DIARIO,
                                    titulo: 'Nuevo reto diario disponible ⚡',
                                    mensaje: 'Tu reto de hoy te está esperando. ¡No rompas la racha!',
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.BAJA,
                                },
                                {
                                    tipo: notificacion_entity_1.TipoNotificacion.NUEVA_CONVOCATORIA,
                                    titulo: 'Nueva convocatoria publicada',
                                    mensaje: 'Administrativo · Estado 2025 publicada en el BOE. 5.440 plazas.',
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.ALTA,
                                },
                                {
                                    tipo: notificacion_entity_1.TipoNotificacion.PLAZO_IMPORTANTE,
                                    titulo: 'Plazo de inscripción cerrando',
                                    mensaje: 'La inscripción para Auxiliar Administrativo 2025 cierra en 3 días.',
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.ALTA,
                                },
                                {
                                    tipo: notificacion_entity_1.TipoNotificacion.LOGRO,
                                    titulo: 'Logro desbloqueado 🏆',
                                    mensaje: 'Has conseguido el logro "Constitucionalista" — superaste el 80% en la Constitución.',
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.BAJA,
                                },
                            ];
                            _i = 0, tipos_1 = tipos;
                            _a.label = 1;
                        case 1:
                            if (!(_i < tipos_1.length)) return [3 /*break*/, 4];
                            t = tipos_1[_i];
                            return [4 /*yield*/, this.service.crear(__assign({ usuarioId: usuarioId }, t))];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/, { mensaje: "".concat(tipos.length, " notificaciones creadas") }];
                    }
                });
            });
        };
        return NotificacionController_1;
    }());
    __setFunctionName(_classThis, "NotificacionController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findAll_decorators = [(0, common_1.Get)(), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
        _count_decorators = [(0, common_1.Get)('count'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
        _marcarLeida_decorators = [(0, common_1.Patch)(':id/leer'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
        _marcarTodasLeidas_decorators = [(0, common_1.Patch)('leer-todas'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
        _seed_decorators = [(0, common_1.Post)('seed/:usuarioId')];
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _count_decorators, { kind: "method", name: "count", static: false, private: false, access: { has: function (obj) { return "count" in obj; }, get: function (obj) { return obj.count; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _marcarLeida_decorators, { kind: "method", name: "marcarLeida", static: false, private: false, access: { has: function (obj) { return "marcarLeida" in obj; }, get: function (obj) { return obj.marcarLeida; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _marcarTodasLeidas_decorators, { kind: "method", name: "marcarTodasLeidas", static: false, private: false, access: { has: function (obj) { return "marcarTodasLeidas" in obj; }, get: function (obj) { return obj.marcarTodasLeidas; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _seed_decorators, { kind: "method", name: "seed", static: false, private: false, access: { has: function (obj) { return "seed" in obj; }, get: function (obj) { return obj.seed; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NotificacionController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NotificacionController = _classThis;
}();
exports.NotificacionController = NotificacionController;
