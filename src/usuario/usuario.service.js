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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioService = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("typeorm");
var bcrypt = require("bcrypt");
var usuario_entity_1 = require("./usuario.entity");
var consumo_helper_1 = require("../common/helpers/consumo.helper");
var plan_helper_1 = require("../common/helpers/plan.helper");
var UsuarioService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var UsuarioService = _classThis = /** @class */ (function () {
        function UsuarioService_1(repo, usuarioOposicionRepo, oposicionRepo) {
            this.repo = repo;
            this.usuarioOposicionRepo = usuarioOposicionRepo;
            this.oposicionRepo = oposicionRepo;
        }
        // ---------------------------------------------------------
        // OPOSICIONES DEL USUARIO
        // ---------------------------------------------------------
        UsuarioService_1.prototype.getMisOposiciones = function (usuarioId) {
            return __awaiter(this, void 0, void 0, function () {
                var relaciones;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.usuarioOposicionRepo.find({
                                where: { usuario: { id: usuarioId } },
                                relations: ['oposicion'],
                                order: { creadoEn: 'DESC' },
                            })];
                        case 1:
                            relaciones = _a.sent();
                            return [2 /*return*/, relaciones.map(function (r) { return (__assign(__assign({}, r.oposicion), { activa: r.activa })); })];
                    }
                });
            });
        };
        UsuarioService_1.prototype.activarOposicion = function (usuarioId, oposicionId) {
            return __awaiter(this, void 0, void 0, function () {
                var relacion;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: 
                        // 1. Desactivar todas las oposiciones anteriores del usuario
                        return [4 /*yield*/, this.usuarioOposicionRepo.update({ usuario: { id: usuarioId } }, { activa: false })];
                        case 1:
                            // 1. Desactivar todas las oposiciones anteriores del usuario
                            _a.sent();
                            return [4 /*yield*/, this.usuarioOposicionRepo.findOne({
                                    where: {
                                        usuario: { id: usuarioId },
                                        oposicion: { id: oposicionId },
                                    },
                                    relations: ['usuario', 'oposicion'],
                                })];
                        case 2:
                            relacion = _a.sent();
                            // 3. Si no existe, crearla
                            if (!relacion) {
                                relacion = this.usuarioOposicionRepo.create({
                                    usuario: { id: usuarioId },
                                    oposicion: { id: oposicionId },
                                    activa: true,
                                });
                            }
                            else {
                                relacion.activa = true;
                            }
                            // 4. Guardar la relación
                            return [4 /*yield*/, this.usuarioOposicionRepo.save(relacion)];
                        case 3:
                            // 4. Guardar la relación
                            _a.sent();
                            return [2 /*return*/, relacion];
                    }
                });
            });
        };
        UsuarioService_1.prototype.desactivarOposicion = function (usuarioId, oposicionId) {
            return __awaiter(this, void 0, void 0, function () {
                var relacion;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.usuarioOposicionRepo.findOne({
                                where: {
                                    usuario: { id: usuarioId },
                                    oposicion: { id: oposicionId },
                                },
                            })];
                        case 1:
                            relacion = _a.sent();
                            if (!relacion)
                                return [2 /*return*/];
                            relacion.activa = false;
                            return [4 /*yield*/, this.usuarioOposicionRepo.save(relacion)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, relacion];
                    }
                });
            });
        };
        UsuarioService_1.prototype.marcarOnboardingGeneral = function (usuarioId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.update(usuarioId, {
                                onboardingGeneralCompletado: true,
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { ok: true }];
                    }
                });
            });
        };
        UsuarioService_1.prototype.marcarOnboardingEntrenamiento = function (usuarioId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.update(usuarioId, {
                                estado: usuario_entity_1.EstadoUsuario.ACTIVO,
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this.findMe(usuarioId)];
                    }
                });
            });
        };
        // ---------------------------------------------------------
        // MÉTODOS DE BÚSQUEDA (CORREGIDOS PARA LOGIN)
        // ---------------------------------------------------------
        UsuarioService_1.prototype.findByEmail = function (email) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.repo.findOne({
                            where: { email: email },
                            select: [
                                'id',
                                'email',
                                'nombre',
                                'apellidos',
                                'nick',
                                'rol',
                                'puntos',
                                'nivel',
                                'estado',
                                'onboardingGeneralCompletado',
                                'password', // ← NECESARIO PARA LOGIN
                            ],
                        })];
                });
            });
        };
        UsuarioService_1.prototype.findByNick = function (nick) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.repo.findOne({
                            where: { nick: nick },
                            select: [
                                'id',
                                'email',
                                'nombre',
                                'apellidos',
                                'nick',
                                'rol',
                                'puntos',
                                'nivel',
                                'estado',
                                'onboardingGeneralCompletado',
                                'password', // ← NECESARIO PARA LOGIN
                            ],
                        })];
                });
            });
        };
        UsuarioService_1.prototype.findById = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.repo.findOne({ where: { id: id } })];
                });
            });
        };
        // ---------------------------------------------------------
        // CREAR USUARIO
        // ---------------------------------------------------------
        UsuarioService_1.prototype.crear = function (datos) {
            return __awaiter(this, void 0, void 0, function () {
                var existente, nickExistente, hash, usuario;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findByEmail(datos.email)];
                        case 1:
                            existente = _a.sent();
                            if (existente)
                                throw new common_1.ConflictException('Ya existe una cuenta con ese email');
                            if (!datos.nick) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.findByNick(datos.nick)];
                        case 2:
                            nickExistente = _a.sent();
                            if (nickExistente)
                                throw new common_1.ConflictException('Ese nick ya está en uso');
                            _a.label = 3;
                        case 3: return [4 /*yield*/, bcrypt.hash(datos.password, 10)];
                        case 4:
                            hash = _a.sent();
                            usuario = this.repo.create(__assign(__assign({}, datos), { password: hash }));
                            return [2 /*return*/, this.repo.save(usuario)];
                    }
                });
            });
        };
        // ---------------------------------------------------------
        // VALIDAR PASSWORD (opcional)
        // ---------------------------------------------------------
        UsuarioService_1.prototype.validarPassword = function (email, password) {
            return __awaiter(this, void 0, void 0, function () {
                var usuario, ok;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findByEmail(email)];
                        case 1:
                            usuario = _a.sent();
                            if (!usuario)
                                return [2 /*return*/, null];
                            return [4 /*yield*/, bcrypt.compare(password, usuario.password)];
                        case 2:
                            ok = _a.sent();
                            return [2 /*return*/, ok ? usuario : null];
                    }
                });
            });
        };
        // ---------------------------------------------------------
        // ADMIN
        // ---------------------------------------------------------
        UsuarioService_1.prototype.findAll = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.repo.find({ order: { creadoEn: 'DESC' } })];
                });
            });
        };
        UsuarioService_1.prototype.count = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.repo.count()];
                });
            });
        };
        UsuarioService_1.prototype.cambiarSuscripcion = function (id, suscripcion) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.update(id, {
                                suscripcion: suscripcion,
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ;
        UsuarioService_1.prototype.desactivar = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.update(id, { activo: false })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        UsuarioService_1.prototype.actualizarNivel = function (id, nivel) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.update(id, { nivel: nivel })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this.findById(id)];
                    }
                });
            });
        };
        UsuarioService_1.prototype.guardarConsumo = function (usuario) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.update(usuario.id, {
                                preguntasTestHoy: usuario.preguntasTestHoy,
                                flashcardsHoy: usuario.flashcardsHoy,
                                temasRevisadosHoy: usuario.temasRevisadosHoy,
                                fechaResetConsumo: usuario.fechaResetConsumo,
                                ultimaActividad: usuario.ultimaActividad,
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        UsuarioService_1.prototype.actualizarObjetivo = function (id, objetivo, nivel) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.update(id, __assign({ objetivo: objetivo }, (nivel && { nivel: nivel })))];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this.findById(id)];
                    }
                });
            });
        };
        UsuarioService_1.prototype.actualizarCompromiso = function (id, compromiso) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.update(id, { compromiso: compromiso })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this.findById(id)];
                    }
                });
            });
        };
        UsuarioService_1.prototype.findMe = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var usuario, activa, password, usuarioOposiciones, usuarioSeguro;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.repo.findOne({
                                where: { id: id },
                                relations: [
                                    'usuarioOposiciones',
                                    'usuarioOposiciones.oposicion',
                                ],
                            })];
                        case 1:
                            usuario = _b.sent();
                            if (!usuario)
                                throw new common_1.NotFoundException('Usuario no encontrado');
                            activa = ((_a = usuario.usuarioOposiciones) === null || _a === void 0 ? void 0 : _a.find(function (o) { return o.activa; })) || null;
                            password = usuario.password, usuarioOposiciones = usuario.usuarioOposiciones, usuarioSeguro = __rest(usuario, ["password", "usuarioOposiciones"]);
                            return [2 /*return*/, __assign(__assign({}, usuarioSeguro), { oposicionActiva: activa ? activa.oposicion : null })];
                    }
                });
            });
        };
        UsuarioService_1.prototype.verificarLimiteTest = function (usuarioId, numPreguntas, tipoTest) {
            return __awaiter(this, void 0, void 0, function () {
                var usuario, usuarioActualizado, limits, limitePorTest, restantes;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findById(usuarioId)];
                        case 1:
                            usuario = _a.sent();
                            if (!usuario)
                                throw new common_1.NotFoundException('Usuario no encontrado');
                            usuarioActualizado = (0, consumo_helper_1.resetearConsumosSiEsNuevoDia)(usuario);
                            if (!(usuarioActualizado.fechaResetConsumo !== usuario.fechaResetConsumo)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.repo.save(usuarioActualizado)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            limits = (0, plan_helper_1.getSuscripcionLimits)(usuario.suscripcion);
                            // Simulacros bloqueados
                            if (tipoTest === 'simulacro' && !limits.simulacros) {
                                return [2 /*return*/, { permitido: false, motivo: 'simulacro_bloqueado', limite: 0 }];
                            }
                            limitePorTest = tipoTest === 'tema'
                                ? limits.preguntasPorTema
                                : limits.preguntasPorTest;
                            if (numPreguntas > limitePorTest) {
                                return [2 /*return*/, { permitido: false, motivo: 'limite_por_test', limite: limitePorTest }];
                            }
                            // Límite diario
                            if (limits.preguntasTestDia !== Infinity &&
                                (0, plan_helper_1.haSuperadoLimite)(usuario.suscripcion, 'preguntasTestDia', usuario.preguntasTestHoy + numPreguntas)) {
                                restantes = limits.preguntasTestDia - usuario.preguntasTestHoy;
                                return [2 /*return*/, { permitido: false, motivo: 'limite_diario', limite: Math.max(0, restantes) }];
                            }
                            return [2 /*return*/, { permitido: true }];
                    }
                });
            });
        };
        UsuarioService_1.prototype.verificarLimiteFlashcards = function (usuarioId, cantidad) {
            return __awaiter(this, void 0, void 0, function () {
                var usuario, usuarioActualizado, limits, restantes;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findById(usuarioId)];
                        case 1:
                            usuario = _a.sent();
                            if (!usuario)
                                throw new common_1.NotFoundException('Usuario no encontrado');
                            usuarioActualizado = (0, consumo_helper_1.resetearConsumosSiEsNuevoDia)(usuario);
                            if (!(usuarioActualizado.fechaResetConsumo !== usuario.fechaResetConsumo)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.repo.save(usuarioActualizado)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            limits = (0, plan_helper_1.getSuscripcionLimits)(usuario.suscripcion);
                            if (limits.flashcardsDia !== Infinity &&
                                (0, plan_helper_1.haSuperadoLimite)(usuario.suscripcion, 'flashcardsDia', usuario.flashcardsHoy + cantidad)) {
                                restantes = limits.flashcardsDia - usuario.flashcardsHoy;
                                return [2 /*return*/, { permitido: false, motivo: 'limite_diario_flashcards', limite: Math.max(0, restantes) }];
                            }
                            return [2 /*return*/, { permitido: true }];
                    }
                });
            });
        };
        UsuarioService_1.prototype.getEstadisticas = function () {
            return __awaiter(this, void 0, void 0, function () {
                var total, conSuscripcion, porSuscripcion, porNivel, hoy, hace7dias, hace30dias, nuevosHoy, nuevos7dias, nuevos30dias;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.count()];
                        case 1:
                            total = _a.sent();
                            return [4 /*yield*/, this.repo.count({ where: { suscripcion: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()) } })];
                        case 2:
                            conSuscripcion = _a.sent();
                            return [4 /*yield*/, this.repo
                                    .createQueryBuilder('u')
                                    .select('u.suscripcion', 'suscripcion')
                                    .addSelect('COUNT(*)', 'total')
                                    .where('u.suscripcion IS NOT NULL')
                                    .groupBy('u.suscripcion')
                                    .getRawMany()];
                        case 3:
                            porSuscripcion = _a.sent();
                            return [4 /*yield*/, this.repo
                                    .createQueryBuilder('u')
                                    .select('u.nivel', 'nivel')
                                    .addSelect('COUNT(*)', 'total')
                                    .groupBy('u.nivel')
                                    .orderBy('u.nivel', 'ASC')
                                    .getRawMany()];
                        case 4:
                            porNivel = _a.sent();
                            hoy = new Date();
                            hoy.setHours(0, 0, 0, 0);
                            hace7dias = new Date(hoy);
                            hace7dias.setDate(hace7dias.getDate() - 7);
                            hace30dias = new Date(hoy);
                            hace30dias.setDate(hace30dias.getDate() - 30);
                            return [4 /*yield*/, this.repo
                                    .createQueryBuilder('u')
                                    .where('u.creadoEn >= :hoy', { hoy: hoy })
                                    .getCount()];
                        case 5:
                            nuevosHoy = _a.sent();
                            return [4 /*yield*/, this.repo
                                    .createQueryBuilder('u')
                                    .where('u.creadoEn >= :fecha', { fecha: hace7dias })
                                    .getCount()];
                        case 6:
                            nuevos7dias = _a.sent();
                            return [4 /*yield*/, this.repo
                                    .createQueryBuilder('u')
                                    .where('u.creadoEn >= :fecha', { fecha: hace30dias })
                                    .getCount()];
                        case 7:
                            nuevos30dias = _a.sent();
                            return [2 /*return*/, {
                                    total: total,
                                    conSuscripcion: conSuscripcion,
                                    sinSuscripcion: total - conSuscripcion,
                                    porSuscripcion: porSuscripcion,
                                    porNivel: porNivel,
                                    nuevosHoy: nuevosHoy,
                                    nuevos7dias: nuevos7dias,
                                    nuevos30dias: nuevos30dias,
                                }];
                    }
                });
            });
        };
        return UsuarioService_1;
    }());
    __setFunctionName(_classThis, "UsuarioService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UsuarioService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UsuarioService = _classThis;
}();
exports.UsuarioService = UsuarioService;
