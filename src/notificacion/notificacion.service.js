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
exports.NotificacionService = void 0;
var common_1 = require("@nestjs/common");
var notificacion_entity_1 = require("./notificacion.entity");
var NotificacionService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var NotificacionService = _classThis = /** @class */ (function () {
        function NotificacionService_1(repo) {
            this.repo = repo;
        }
        NotificacionService_1.prototype.crear = function (datos) {
            return __awaiter(this, void 0, void 0, function () {
                var n;
                var _a;
                return __generator(this, function (_b) {
                    n = this.repo.create({
                        tipo: datos.tipo,
                        titulo: datos.titulo,
                        mensaje: datos.mensaje,
                        prioridad: (_a = datos.prioridad) !== null && _a !== void 0 ? _a : notificacion_entity_1.PrioridadNotificacion.MEDIA,
                        urlAccion: datos.urlAccion,
                        metadata: datos.metadata,
                        usuario: { id: datos.usuarioId },
                    });
                    return [2 /*return*/, this.repo.save(n)];
                });
            });
        };
        NotificacionService_1.prototype.findByUsuario = function (usuarioId_1) {
            return __awaiter(this, arguments, void 0, function (usuarioId, soloNoLeidas) {
                var qb;
                if (soloNoLeidas === void 0) { soloNoLeidas = false; }
                return __generator(this, function (_a) {
                    qb = this.repo.createQueryBuilder('n')
                        .where('n.usuario = :usuarioId', { usuarioId: usuarioId })
                        .orderBy('n.creadoEn', 'DESC')
                        .limit(50);
                    if (soloNoLeidas)
                        qb.andWhere('n.leida = false');
                    return [2 /*return*/, qb.getMany()];
                });
            });
        };
        NotificacionService_1.prototype.marcarLeida = function (id, usuarioId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.update({ id: id, usuario: { id: usuarioId } }, { leida: true })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        NotificacionService_1.prototype.marcarTodasLeidas = function (usuarioId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo
                                .createQueryBuilder()
                                .update()
                                .set({ leida: true })
                                .where('usuarioId = :usuarioId', { usuarioId: usuarioId })
                                .andWhere('leida = false')
                                .execute()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        NotificacionService_1.prototype.countNoLeidas = function (usuarioId) {
            return __awaiter(this, void 0, void 0, function () {
                var total;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.count({
                                where: { usuario: { id: usuarioId }, leida: false },
                            })];
                        case 1:
                            total = _a.sent();
                            return [2 /*return*/, { count: total }];
                    }
                });
            });
        };
        NotificacionService_1.prototype.notificarNuevoDocumento = function (usuarioIds, titulo, convocatoriaNombre, urlAccion) {
            return __awaiter(this, void 0, void 0, function () {
                var _i, usuarioIds_1, usuarioId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _i = 0, usuarioIds_1 = usuarioIds;
                            _a.label = 1;
                        case 1:
                            if (!(_i < usuarioIds_1.length)) return [3 /*break*/, 4];
                            usuarioId = usuarioIds_1[_i];
                            return [4 /*yield*/, this.crear({
                                    usuarioId: usuarioId,
                                    tipo: notificacion_entity_1.TipoNotificacion.NUEVO_DOCUMENTO,
                                    titulo: 'Nuevo documento publicado',
                                    mensaje: "Se ha publicado \"".concat(titulo, "\" en ").concat(convocatoriaNombre),
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.MEDIA,
                                    urlAccion: urlAccion,
                                })];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        NotificacionService_1.prototype.notificarAdmitido = function (usuarioId, convocatoriaNombre, estado, causa) {
            return __awaiter(this, void 0, void 0, function () {
                var admitido;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            admitido = estado === 'admitido';
                            return [4 /*yield*/, this.crear({
                                    usuarioId: usuarioId,
                                    tipo: admitido ? notificacion_entity_1.TipoNotificacion.ADMITIDO : notificacion_entity_1.TipoNotificacion.EXCLUIDO,
                                    titulo: admitido ? '¡Apareces en la lista de admitidos!' : 'Apareces en la lista de excluidos',
                                    mensaje: admitido
                                        ? "Est\u00E1s en la lista provisional de admitidos de ".concat(convocatoriaNombre)
                                        : "Apareces como excluido en ".concat(convocatoriaNombre).concat(causa ? ". Motivo: ".concat(causa) : ''),
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.ALTA,
                                })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        NotificacionService_1.prototype.notificarCambioNormativo = function (usuarioIds, leyNombre, resumen) {
            return __awaiter(this, void 0, void 0, function () {
                var _i, usuarioIds_2, usuarioId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _i = 0, usuarioIds_2 = usuarioIds;
                            _a.label = 1;
                        case 1:
                            if (!(_i < usuarioIds_2.length)) return [3 /*break*/, 4];
                            usuarioId = usuarioIds_2[_i];
                            return [4 /*yield*/, this.crear({
                                    usuarioId: usuarioId,
                                    tipo: notificacion_entity_1.TipoNotificacion.CAMBIO_NORMATIVO,
                                    titulo: 'Cambio en normativa de tu temario',
                                    mensaje: "".concat(leyNombre, ": ").concat(resumen),
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.ALTA,
                                })];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        NotificacionService_1.prototype.notificarRetoDiario = function (usuarioIds) {
            return __awaiter(this, void 0, void 0, function () {
                var _i, usuarioIds_3, usuarioId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _i = 0, usuarioIds_3 = usuarioIds;
                            _a.label = 1;
                        case 1:
                            if (!(_i < usuarioIds_3.length)) return [3 /*break*/, 4];
                            usuarioId = usuarioIds_3[_i];
                            return [4 /*yield*/, this.crear({
                                    usuarioId: usuarioId,
                                    tipo: notificacion_entity_1.TipoNotificacion.RETO_DIARIO,
                                    titulo: 'Nuevo reto diario disponible ⚡',
                                    mensaje: 'Tu reto de hoy te está esperando. ¡No rompas la racha!',
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.BAJA,
                                    urlAccion: '/app/dashboard',
                                })];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        NotificacionService_1.prototype.notificarRetoRecibido = function (usuarioId, retadorNombre, oposicionNombre) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.crear({
                                usuarioId: usuarioId,
                                tipo: notificacion_entity_1.TipoNotificacion.RETO_RECIBIDO,
                                titulo: "".concat(retadorNombre, " te reta \u26A1"),
                                mensaje: "Te han enviado un reto de ".concat(oposicionNombre, ". \u00BFAceptas el desaf\u00EDo?"),
                                prioridad: notificacion_entity_1.PrioridadNotificacion.MEDIA,
                                urlAccion: '/app/retos',
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        NotificacionService_1.prototype.notificarResultadoReto = function (usuarioId, retadorNombre, ganador) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.crear({
                                usuarioId: usuarioId,
                                tipo: notificacion_entity_1.TipoNotificacion.RETO_RESULTADO,
                                titulo: 'Resultado del reto',
                                mensaje: "El reto contra ".concat(retadorNombre, " ha terminado. Ganador: ").concat(ganador),
                                prioridad: notificacion_entity_1.PrioridadNotificacion.MEDIA,
                                urlAccion: '/app/retos',
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return NotificacionService_1;
    }());
    __setFunctionName(_classThis, "NotificacionService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NotificacionService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NotificacionService = _classThis;
}();
exports.NotificacionService = NotificacionService;
