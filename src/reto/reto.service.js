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
exports.RetoService = void 0;
var common_1 = require("@nestjs/common");
var reto_entity_1 = require("./reto.entity");
var notificacion_entity_1 = require("../notificacion/notificacion.entity");
var RetoService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var RetoService = _classThis = /** @class */ (function () {
        function RetoService_1(retoRepo, participacionRepo, usuarioRepo, temaRepo, convocatoriaRepo, testService, notificacionService, contactoRepo) {
            this.retoRepo = retoRepo;
            this.participacionRepo = participacionRepo;
            this.usuarioRepo = usuarioRepo;
            this.temaRepo = temaRepo;
            this.convocatoriaRepo = convocatoriaRepo;
            this.testService = testService;
            this.notificacionService = notificacionService;
            this.contactoRepo = contactoRepo;
        }
        // ─── RETO DIARIO ─────────────────────────────────────────
        RetoService_1.prototype.getRetoDiario = function (usuarioId, oposicionId) {
            return __awaiter(this, void 0, void 0, function () {
                var usuario, hoy, manana, reto;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.usuarioRepo.findOne({ where: { id: usuarioId } })];
                        case 1:
                            usuario = _a.sent();
                            if (!usuario)
                                throw new common_1.NotFoundException('Usuario no encontrado');
                            hoy = new Date();
                            hoy.setHours(0, 0, 0, 0);
                            manana = new Date(hoy);
                            manana.setDate(manana.getDate() + 1);
                            return [4 /*yield*/, this.retoRepo.findOne({
                                    where: {
                                        tipo: reto_entity_1.TipoReto.DIARIO,
                                        estado: reto_entity_1.EstadoReto.ACTIVO,
                                        oposicion: { id: oposicionId },
                                        nivelRequerido: usuario.nivel,
                                    },
                                    relations: ['participaciones', 'participaciones.usuario'],
                                })];
                        case 2:
                            reto = _a.sent();
                            if (!(!reto || new Date(reto.creadoEn) < hoy)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.crearRetoDiario(oposicionId, usuario.nivel)];
                        case 3:
                            reto = _a.sent();
                            _a.label = 4;
                        case 4: return [2 /*return*/, reto];
                    }
                });
            });
        };
        RetoService_1.prototype.crearRetoDiario = function (oposicionId, nivel) {
            return __awaiter(this, void 0, void 0, function () {
                var numPreguntas, preguntas, fechaFin, reto;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            numPreguntas = this.preguntasPorNivel(nivel);
                            return [4 /*yield*/, this.testService.generarTest(oposicionId, numPreguntas)];
                        case 1:
                            preguntas = _a.sent();
                            fechaFin = new Date();
                            fechaFin.setHours(23, 59, 59, 999);
                            reto = this.retoRepo.create({
                                tipo: reto_entity_1.TipoReto.DIARIO,
                                estado: reto_entity_1.EstadoReto.ACTIVO,
                                nivelRequerido: nivel,
                                preguntas: preguntas,
                                fechaFin: fechaFin,
                                oposicion: { id: oposicionId },
                            });
                            return [2 /*return*/, this.retoRepo.save(reto)];
                    }
                });
            });
        };
        // ─── RETO SEMANAL ────────────────────────────────────────
        RetoService_1.prototype.getRetoSemanal = function (usuarioId, oposicionId) {
            return __awaiter(this, void 0, void 0, function () {
                var usuario, inicioSemana, reto;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.usuarioRepo.findOne({ where: { id: usuarioId } })];
                        case 1:
                            usuario = _a.sent();
                            if (!usuario)
                                throw new common_1.NotFoundException('Usuario no encontrado');
                            inicioSemana = new Date();
                            inicioSemana.setHours(0, 0, 0, 0);
                            inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay() + 1);
                            return [4 /*yield*/, this.retoRepo.findOne({
                                    where: {
                                        tipo: reto_entity_1.TipoReto.SEMANAL,
                                        estado: reto_entity_1.EstadoReto.ACTIVO,
                                        oposicion: { id: oposicionId },
                                        nivelRequerido: usuario.nivel,
                                    },
                                    relations: ['participaciones', 'participaciones.usuario', 'tema'],
                                })];
                        case 2:
                            reto = _a.sent();
                            if (!(!reto || new Date(reto.creadoEn) < inicioSemana)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.crearRetoSemanal(oposicionId, usuario.nivel)];
                        case 3:
                            reto = _a.sent();
                            _a.label = 4;
                        case 4: return [2 /*return*/, reto];
                    }
                });
            });
        };
        RetoService_1.prototype.crearRetoSemanal = function (oposicionId, nivel) {
            return __awaiter(this, void 0, void 0, function () {
                var convocatoria, temas, _a, indiceMax, tema, numPreguntas, preguntas, fechaFin, reto;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.convocatoriaRepo.findOne({
                                where: { oposicion: { id: oposicionId }, estado: 'activa' },
                                order: { anyo: 'DESC' },
                            })];
                        case 1:
                            convocatoria = _b.sent();
                            if (!convocatoria) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.temaRepo.find({
                                    where: { convocatoria: { id: convocatoria.id }, activo: true },
                                    order: { numero: 'ASC' },
                                })];
                        case 2:
                            _a = _b.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            _a = [];
                            _b.label = 4;
                        case 4:
                            temas = _a;
                            indiceMax = Math.min(nivel * 5, temas.length - 1);
                            tema = temas.length > 0 ? temas[Math.floor(Math.random() * (indiceMax + 1))] : null;
                            numPreguntas = this.preguntasPorNivel(nivel) * 2;
                            return [4 /*yield*/, this.testService.generarTest(oposicionId, numPreguntas, tema === null || tema === void 0 ? void 0 : tema.id)];
                        case 5:
                            preguntas = _b.sent();
                            fechaFin = new Date();
                            fechaFin.setDate(fechaFin.getDate() + (7 - fechaFin.getDay()));
                            fechaFin.setHours(23, 59, 59, 999);
                            reto = this.retoRepo.create({
                                tipo: reto_entity_1.TipoReto.SEMANAL,
                                estado: reto_entity_1.EstadoReto.ACTIVO,
                                nivelRequerido: nivel,
                                preguntas: preguntas,
                                fechaFin: fechaFin,
                                oposicion: { id: oposicionId },
                                tema: tema ? { id: tema.id } : undefined,
                            });
                            return [2 /*return*/, this.retoRepo.save(reto)];
                    }
                });
            });
        };
        // ─── RETO ENTRE USUARIOS ─────────────────────────────────
        RetoService_1.prototype.crearRetoUsuario = function (retadorId, retadoNickOEmail, oposicionId, numPreguntas, temaId, versionLeyId) {
            return __awaiter(this, void 0, void 0, function () {
                var retador, retado, preguntas, fechaFin, reto, retoGuardado;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.usuarioRepo.findOne({ where: { id: retadorId } })];
                        case 1:
                            retador = _b.sent();
                            if (!retador)
                                throw new common_1.NotFoundException('Retador no encontrado');
                            return [4 /*yield*/, this.usuarioRepo.findOne({ where: { nick: retadoNickOEmail } })];
                        case 2:
                            retado = _b.sent();
                            if (!!retado) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.usuarioRepo.findOne({ where: { email: retadoNickOEmail } })];
                        case 3:
                            retado = _b.sent();
                            _b.label = 4;
                        case 4:
                            if (!retado)
                                throw new common_1.NotFoundException('Usuario no encontrado con ese nick o email');
                            if (retado.id === retadorId)
                                throw new common_1.BadRequestException('No puedes retarte a ti mismo');
                            return [4 /*yield*/, this.testService.generarTest(oposicionId, numPreguntas, temaId, versionLeyId)];
                        case 5:
                            preguntas = _b.sent();
                            fechaFin = new Date();
                            fechaFin.setDate(fechaFin.getDate() + 2);
                            reto = this.retoRepo.create({
                                tipo: reto_entity_1.TipoReto.USUARIO,
                                estado: reto_entity_1.EstadoReto.ACTIVO,
                                nivelRequerido: 1,
                                preguntas: preguntas,
                                fechaFin: fechaFin,
                                creador: { id: retadorId },
                                oposicion: { id: oposicionId },
                            });
                            return [4 /*yield*/, this.retoRepo.save(reto)];
                        case 6:
                            retoGuardado = _b.sent();
                            return [4 /*yield*/, this.guardarContactoReciente(retadorId, retado.id)];
                        case 7:
                            _b.sent();
                            // Crear participación del retador
                            return [4 /*yield*/, this.participacionRepo.save(this.participacionRepo.create({
                                    reto: { id: retoGuardado.id },
                                    usuario: { id: retadorId },
                                }))];
                        case 8:
                            // Crear participación del retador
                            _b.sent();
                            // Crear participación del retado
                            return [4 /*yield*/, this.participacionRepo.save(this.participacionRepo.create({
                                    reto: { id: retoGuardado.id },
                                    usuario: { id: retado.id },
                                }))];
                        case 9:
                            // Crear participación del retado
                            _b.sent();
                            // Notificar al retado
                            return [4 /*yield*/, this.notificacionService.crear({
                                    usuarioId: retado.id,
                                    tipo: notificacion_entity_1.TipoNotificacion.RETO_RECIBIDO,
                                    titulo: "".concat((_a = retador.nick) !== null && _a !== void 0 ? _a : retador.nombre, " te reta \u26A1"),
                                    mensaje: "Te han enviado un reto. Tienes 48h para completarlo. \u00BFAceptas el desaf\u00EDo?",
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.MEDIA,
                                    urlAccion: "/app/retos/".concat(retoGuardado.id),
                                })];
                        case 10:
                            // Notificar al retado
                            _b.sent();
                            return [2 /*return*/, retoGuardado];
                    }
                });
            });
        };
        // ─── COMPLETAR RETO ──────────────────────────────────────
        RetoService_1.prototype.completarReto = function (retoId, usuarioId, respuestas, tiempoSegundos) {
            return __awaiter(this, void 0, void 0, function () {
                var participacion, reto, correctas, porcentaje, todasCompletadas;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.participacionRepo.findOne({
                                where: {
                                    reto: { id: retoId },
                                    usuario: { id: usuarioId },
                                },
                                relations: ['usuario', 'reto'],
                            })];
                        case 1:
                            participacion = _a.sent();
                            if (!participacion)
                                throw new common_1.BadRequestException('No estás participando en este reto');
                            if (participacion.completado)
                                throw new common_1.BadRequestException('Ya completaste este reto');
                            return [4 /*yield*/, this.retoRepo.findOne({
                                    where: { id: retoId },
                                    relations: ['participaciones', 'participaciones.usuario'],
                                })];
                        case 2:
                            reto = _a.sent();
                            if (!reto)
                                throw new common_1.NotFoundException('Reto no encontrado');
                            correctas = respuestas.filter(function (r) { return r.correcta; }).length;
                            porcentaje = Math.round((correctas / reto.preguntas.length) * 100);
                            return [4 /*yield*/, this.participacionRepo.update(participacion.id, {
                                    completado: true,
                                    porcentaje: porcentaje,
                                    tiempoSegundos: tiempoSegundos,
                                    respuestas: respuestas,
                                })];
                        case 3:
                            _a.sent();
                            todasCompletadas = reto.participaciones.every(function (p) { return p.id === participacion.id || p.completado; });
                            if (!todasCompletadas) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.cerrarRetoUsuario(reto)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [2 /*return*/, this.participacionRepo.findOne({
                                where: { id: participacion.id },
                            })];
                    }
                });
            });
        };
        RetoService_1.prototype.cerrarRetoUsuario = function (reto) {
            return __awaiter(this, void 0, void 0, function () {
                var participaciones, primera, segunda, empate, primerUsuario, segundoUsuario, _i, _a, u, i, ganador, perdedor;
                var _b, _c, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0: return [4 /*yield*/, this.participacionRepo.find({
                                where: { reto: { id: reto.id } },
                                relations: ['usuario'],
                                order: { porcentaje: 'DESC', tiempoSegundos: 'ASC' },
                            })];
                        case 1:
                            participaciones = _f.sent();
                            return [4 /*yield*/, this.retoRepo.update(reto.id, { estado: reto_entity_1.EstadoReto.COMPLETADO })];
                        case 2:
                            _f.sent();
                            primera = participaciones[0];
                            segunda = participaciones[1];
                            if (!primera || !segunda)
                                return [2 /*return*/];
                            empate = primera.porcentaje === segunda.porcentaje &&
                                primera.tiempoSegundos === segunda.tiempoSegundos;
                            if (!empate) return [3 /*break*/, 9];
                            return [4 /*yield*/, this.participacionRepo.update(primera.id, { posicion: 1 })];
                        case 3:
                            _f.sent();
                            return [4 /*yield*/, this.participacionRepo.update(segunda.id, { posicion: 1 })];
                        case 4:
                            _f.sent();
                            primerUsuario = primera.usuario;
                            segundoUsuario = segunda.usuario;
                            _i = 0, _a = [primerUsuario, segundoUsuario];
                            _f.label = 5;
                        case 5:
                            if (!(_i < _a.length)) return [3 /*break*/, 8];
                            u = _a[_i];
                            return [4 /*yield*/, this.notificacionService.crear({
                                    usuarioId: u.id,
                                    tipo: notificacion_entity_1.TipoNotificacion.RETO_RESULTADO,
                                    titulo: '¡Empate en el reto! 🤝',
                                    mensaje: "Empate perfecto con ".concat(u.id === primerUsuario.id ? (_b = segundoUsuario.nick) !== null && _b !== void 0 ? _b : segundoUsuario.nombre : (_c = primerUsuario.nick) !== null && _c !== void 0 ? _c : primerUsuario.nombre),
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.MEDIA,
                                })];
                        case 6:
                            _f.sent();
                            _f.label = 7;
                        case 7:
                            _i++;
                            return [3 /*break*/, 5];
                        case 8: return [3 /*break*/, 16];
                        case 9:
                            i = 0;
                            _f.label = 10;
                        case 10:
                            if (!(i < participaciones.length)) return [3 /*break*/, 13];
                            return [4 /*yield*/, this.participacionRepo.update(participaciones[i].id, { posicion: i + 1 })];
                        case 11:
                            _f.sent();
                            _f.label = 12;
                        case 12:
                            i++;
                            return [3 /*break*/, 10];
                        case 13:
                            ganador = participaciones[0].usuario;
                            perdedor = participaciones[1].usuario;
                            return [4 /*yield*/, this.notificacionService.crear({
                                    usuarioId: ganador.id,
                                    tipo: notificacion_entity_1.TipoNotificacion.RETO_RESULTADO,
                                    titulo: '¡Has ganado el reto! 🏆',
                                    mensaje: "Has ganado a ".concat((_d = perdedor.nick) !== null && _d !== void 0 ? _d : perdedor.nombre, " con ").concat(primera.porcentaje, "% de acierto"),
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.MEDIA,
                                })];
                        case 14:
                            _f.sent();
                            return [4 /*yield*/, this.notificacionService.crear({
                                    usuarioId: perdedor.id,
                                    tipo: notificacion_entity_1.TipoNotificacion.RETO_RESULTADO,
                                    titulo: 'Reto finalizado',
                                    mensaje: "".concat((_e = ganador.nick) !== null && _e !== void 0 ? _e : ganador.nombre, " ha ganado con ").concat(primera.porcentaje, "%. \u00A1Sigue practicando!"),
                                    prioridad: notificacion_entity_1.PrioridadNotificacion.MEDIA,
                                })];
                        case 15:
                            _f.sent();
                            _f.label = 16;
                        case 16: return [2 /*return*/];
                    }
                });
            });
        };
        // ─── CONSULTAS ───────────────────────────────────────────
        RetoService_1.prototype.getMisRetos = function (usuarioId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.participacionRepo.find({
                            where: { usuario: { id: usuarioId } },
                            relations: ['reto', 'reto.creador', 'reto.tema', 'reto.oposicion'],
                            order: { creadoEn: 'DESC' },
                        })];
                });
            });
        };
        RetoService_1.prototype.getReto = function (retoId) {
            return __awaiter(this, void 0, void 0, function () {
                var reto;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.retoRepo.findOne({
                                where: { id: retoId },
                                relations: ['participaciones', 'participaciones.usuario', 'creador', 'tema', 'oposicion'],
                            })];
                        case 1:
                            reto = _a.sent();
                            if (!reto)
                                throw new common_1.NotFoundException('Reto no encontrado');
                            return [2 /*return*/, reto];
                    }
                });
            });
        };
        RetoService_1.prototype.getRanking = function (retoId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.participacionRepo.find({
                            where: { reto: { id: retoId }, completado: true },
                            relations: ['usuario'],
                            order: { porcentaje: 'DESC', tiempoSegundos: 'ASC' },
                        })];
                });
            });
        };
        // ─── HELPERS ─────────────────────────────────────────────
        RetoService_1.prototype.preguntasPorNivel = function (nivel) {
            var _a;
            var mapa = { 1: 5, 2: 8, 3: 10, 4: 15, 5: 20 };
            return (_a = mapa[nivel]) !== null && _a !== void 0 ? _a : 10;
        };
        RetoService_1.prototype.getContactosRecientes = function (usuarioId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.contactoRepo.find({
                            where: { usuario: { id: usuarioId } },
                            relations: ['contacto'],
                            order: { ultimoUso: 'DESC' },
                            take: 5,
                        })];
                });
            });
        };
        RetoService_1.prototype.getRankingOposicion = function (oposicionId, nivel) {
            return __awaiter(this, void 0, void 0, function () {
                var qb;
                return __generator(this, function (_a) {
                    qb = this.usuarioRepo
                        .createQueryBuilder('u')
                        .leftJoin('u.resultados', 'r', 'r.oposicionId = :oposicionId', { oposicionId: oposicionId })
                        .select([
                        'u.id', 'u.nick', 'u.nombre', 'u.nivel', 'u.puntos', 'u.testsSuperados',
                    ])
                        .where('u.puntos > 0')
                        .orderBy('u.puntos', 'DESC')
                        .limit(50);
                    if (nivel)
                        qb.andWhere('u.nivel = :nivel', { nivel: nivel });
                    return [2 /*return*/, qb.getMany()];
                });
            });
        };
        RetoService_1.prototype.getRankingRetos = function (oposicionId) {
            return __awaiter(this, void 0, void 0, function () {
                var participaciones, porUsuario, _i, participaciones_1, p, uid;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.participacionRepo
                                .createQueryBuilder('p')
                                .leftJoinAndSelect('p.usuario', 'u')
                                .leftJoin('p.reto', 'r')
                                .where('r.oposicionId = :oposicionId', { oposicionId: oposicionId })
                                .andWhere('p.completado = true')
                                .andWhere('p.posicion IS NOT NULL')
                                .getMany()];
                        case 1:
                            participaciones = _a.sent();
                            porUsuario = {};
                            for (_i = 0, participaciones_1 = participaciones; _i < participaciones_1.length; _i++) {
                                p = participaciones_1[_i];
                                uid = p.usuario.id;
                                if (!porUsuario[uid]) {
                                    porUsuario[uid] = {
                                        usuario: p.usuario,
                                        victorias: 0,
                                        derrotas: 0,
                                        total: 0,
                                    };
                                }
                                porUsuario[uid].total++;
                                if (p.posicion === 1)
                                    porUsuario[uid].victorias++;
                                else
                                    porUsuario[uid].derrotas++;
                            }
                            return [2 /*return*/, Object.values(porUsuario)
                                    .sort(function (a, b) { return b.victorias - a.victorias || a.derrotas - b.derrotas; })
                                    .slice(0, 50)];
                    }
                });
            });
        };
        RetoService_1.prototype.guardarContactoReciente = function (usuarioId, contactoId) {
            return __awaiter(this, void 0, void 0, function () {
                var existente;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.contactoRepo.findOne({
                                where: {
                                    usuario: { id: usuarioId },
                                    contacto: { id: contactoId },
                                },
                            })];
                        case 1:
                            existente = _a.sent();
                            if (!existente) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.contactoRepo.update(existente.id, { ultimoUso: new Date() })];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, this.contactoRepo.save(this.contactoRepo.create({
                                usuario: { id: usuarioId },
                                contacto: { id: contactoId },
                            }))];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        return RetoService_1;
    }());
    __setFunctionName(_classThis, "RetoService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RetoService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RetoService = _classThis;
}();
exports.RetoService = RetoService;
