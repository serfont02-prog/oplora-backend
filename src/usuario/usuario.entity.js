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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = exports.SuscripcionUsuario = exports.EstadoUsuario = void 0;
var typeorm_1 = require("typeorm");
var resultado_test_entity_1 = require("../test/resultado-test.entity");
var usuario_oposicion_entity_1 = require("../usuario/usuario-oposicion.entity");
var EstadoUsuario;
(function (EstadoUsuario) {
    EstadoUsuario["NUEVO"] = "nuevo";
    EstadoUsuario["ACTIVO"] = "activo";
    EstadoUsuario["INACTIVO"] = "inactivo";
})(EstadoUsuario || (exports.EstadoUsuario = EstadoUsuario = {}));
var SuscripcionUsuario;
(function (SuscripcionUsuario) {
    SuscripcionUsuario["GRATUITO"] = "gratuito";
    SuscripcionUsuario["ESENCIAL"] = "esencial";
    SuscripcionUsuario["PROFESIONAL"] = "profesional";
})(SuscripcionUsuario || (exports.SuscripcionUsuario = SuscripcionUsuario = {}));
var Usuario = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('usuarios')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _email_decorators;
    var _email_initializers = [];
    var _email_extraInitializers = [];
    var _nombre_decorators;
    var _nombre_initializers = [];
    var _nombre_extraInitializers = [];
    var _apellidos_decorators;
    var _apellidos_initializers = [];
    var _apellidos_extraInitializers = [];
    var _password_decorators;
    var _password_initializers = [];
    var _password_extraInitializers = [];
    var _dni_decorators;
    var _dni_initializers = [];
    var _dni_extraInitializers = [];
    var _notificacionesListas_decorators;
    var _notificacionesListas_initializers = [];
    var _notificacionesListas_extraInitializers = [];
    var _rachaActual_decorators;
    var _rachaActual_initializers = [];
    var _rachaActual_extraInitializers = [];
    var _rachaMaxima_decorators;
    var _rachaMaxima_initializers = [];
    var _rachaMaxima_extraInitializers = [];
    var _emailVerificado_decorators;
    var _emailVerificado_initializers = [];
    var _emailVerificado_extraInitializers = [];
    var _rol_decorators;
    var _rol_initializers = [];
    var _rol_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var _nick_decorators;
    var _nick_initializers = [];
    var _nick_extraInitializers = [];
    var _puntos_decorators;
    var _puntos_initializers = [];
    var _puntos_extraInitializers = [];
    var _nivel_decorators;
    var _nivel_initializers = [];
    var _nivel_extraInitializers = [];
    var _preguntasCorrectasTotales_decorators;
    var _preguntasCorrectasTotales_initializers = [];
    var _preguntasCorrectasTotales_extraInitializers = [];
    var _resultados_decorators;
    var _resultados_initializers = [];
    var _resultados_extraInitializers = [];
    var _activo_decorators;
    var _activo_initializers = [];
    var _activo_extraInitializers = [];
    var _onboardingGeneralCompletado_decorators;
    var _onboardingGeneralCompletado_initializers = [];
    var _onboardingGeneralCompletado_extraInitializers = [];
    var _simulacrosHoy_decorators;
    var _simulacrosHoy_initializers = [];
    var _simulacrosHoy_extraInitializers = [];
    var _preguntasRespondidasTotales_decorators;
    var _preguntasRespondidasTotales_initializers = [];
    var _preguntasRespondidasTotales_extraInitializers = [];
    var _preguntasTestHoy_decorators;
    var _preguntasTestHoy_initializers = [];
    var _preguntasTestHoy_extraInitializers = [];
    var _flashcardsHoy_decorators;
    var _flashcardsHoy_initializers = [];
    var _flashcardsHoy_extraInitializers = [];
    var _temasRevisadosHoy_decorators;
    var _temasRevisadosHoy_initializers = [];
    var _temasRevisadosHoy_extraInitializers = [];
    var _ultimaActividad_decorators;
    var _ultimaActividad_initializers = [];
    var _ultimaActividad_extraInitializers = [];
    var _fechaResetConsumo_decorators;
    var _fechaResetConsumo_initializers = [];
    var _fechaResetConsumo_extraInitializers = [];
    var _suscripcion_decorators;
    var _suscripcion_initializers = [];
    var _suscripcion_extraInitializers = [];
    var _objetivo_decorators;
    var _objetivo_initializers = [];
    var _objetivo_extraInitializers = [];
    var _compromiso_decorators;
    var _compromiso_initializers = [];
    var _compromiso_extraInitializers = [];
    var _estado_decorators;
    var _estado_initializers = [];
    var _estado_extraInitializers = [];
    var _usuarioOposiciones_decorators;
    var _usuarioOposiciones_initializers = [];
    var _usuarioOposiciones_extraInitializers = [];
    var Usuario = _classThis = /** @class */ (function () {
        function Usuario_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.email = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _email_initializers, void 0));
            this.nombre = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _nombre_initializers, void 0));
            this.apellidos = (__runInitializers(this, _nombre_extraInitializers), __runInitializers(this, _apellidos_initializers, void 0));
            this.password = (__runInitializers(this, _apellidos_extraInitializers), __runInitializers(this, _password_initializers, void 0));
            this.dni = (__runInitializers(this, _password_extraInitializers), __runInitializers(this, _dni_initializers, void 0));
            this.notificacionesListas = (__runInitializers(this, _dni_extraInitializers), __runInitializers(this, _notificacionesListas_initializers, void 0));
            this.rachaActual = (__runInitializers(this, _notificacionesListas_extraInitializers), __runInitializers(this, _rachaActual_initializers, void 0));
            this.rachaMaxima = (__runInitializers(this, _rachaActual_extraInitializers), __runInitializers(this, _rachaMaxima_initializers, void 0));
            this.emailVerificado = (__runInitializers(this, _rachaMaxima_extraInitializers), __runInitializers(this, _emailVerificado_initializers, void 0));
            this.rol = (__runInitializers(this, _emailVerificado_extraInitializers), __runInitializers(this, _rol_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _rol_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            this.nick = (__runInitializers(this, _creadoEn_extraInitializers), __runInitializers(this, _nick_initializers, void 0));
            this.puntos = (__runInitializers(this, _nick_extraInitializers), __runInitializers(this, _puntos_initializers, void 0));
            this.nivel = (__runInitializers(this, _puntos_extraInitializers), __runInitializers(this, _nivel_initializers, void 0));
            this.preguntasCorrectasTotales = (__runInitializers(this, _nivel_extraInitializers), __runInitializers(this, _preguntasCorrectasTotales_initializers, void 0));
            this.resultados = (__runInitializers(this, _preguntasCorrectasTotales_extraInitializers), __runInitializers(this, _resultados_initializers, void 0));
            this.activo = (__runInitializers(this, _resultados_extraInitializers), __runInitializers(this, _activo_initializers, void 0));
            this.onboardingGeneralCompletado = (__runInitializers(this, _activo_extraInitializers), __runInitializers(this, _onboardingGeneralCompletado_initializers, void 0));
            this.simulacrosHoy = (__runInitializers(this, _onboardingGeneralCompletado_extraInitializers), __runInitializers(this, _simulacrosHoy_initializers, void 0));
            this.preguntasRespondidasTotales = (__runInitializers(this, _simulacrosHoy_extraInitializers), __runInitializers(this, _preguntasRespondidasTotales_initializers, void 0));
            this.preguntasTestHoy = (__runInitializers(this, _preguntasRespondidasTotales_extraInitializers), __runInitializers(this, _preguntasTestHoy_initializers, void 0));
            this.flashcardsHoy = (__runInitializers(this, _preguntasTestHoy_extraInitializers), __runInitializers(this, _flashcardsHoy_initializers, void 0));
            this.temasRevisadosHoy = (__runInitializers(this, _flashcardsHoy_extraInitializers), __runInitializers(this, _temasRevisadosHoy_initializers, void 0));
            this.ultimaActividad = (__runInitializers(this, _temasRevisadosHoy_extraInitializers), __runInitializers(this, _ultimaActividad_initializers, void 0));
            this.fechaResetConsumo = (__runInitializers(this, _ultimaActividad_extraInitializers), __runInitializers(this, _fechaResetConsumo_initializers, void 0));
            this.suscripcion = (__runInitializers(this, _fechaResetConsumo_extraInitializers), __runInitializers(this, _suscripcion_initializers, void 0));
            this.objetivo = (__runInitializers(this, _suscripcion_extraInitializers), __runInitializers(this, _objetivo_initializers, void 0));
            this.compromiso = (__runInitializers(this, _objetivo_extraInitializers), __runInitializers(this, _compromiso_initializers, void 0));
            this.estado = (__runInitializers(this, _compromiso_extraInitializers), __runInitializers(this, _estado_initializers, void 0));
            this.usuarioOposiciones = (__runInitializers(this, _estado_extraInitializers), __runInitializers(this, _usuarioOposiciones_initializers, void 0));
            __runInitializers(this, _usuarioOposiciones_extraInitializers);
        }
        return Usuario_1;
    }());
    __setFunctionName(_classThis, "Usuario");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _email_decorators = [(0, typeorm_1.Column)({ unique: true })];
        _nombre_decorators = [(0, typeorm_1.Column)()];
        _apellidos_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _password_decorators = [(0, typeorm_1.Column)({ select: false })];
        _dni_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _notificacionesListas_decorators = [(0, typeorm_1.Column)({ default: false })];
        _rachaActual_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _rachaMaxima_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _emailVerificado_decorators = [(0, typeorm_1.Column)({ default: false })];
        _rol_decorators = [(0, typeorm_1.Column)({ default: 'usuario' })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _nick_decorators = [(0, typeorm_1.Column)({ unique: true, nullable: true })];
        _puntos_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _nivel_decorators = [(0, typeorm_1.Column)({ default: 1 })];
        _preguntasCorrectasTotales_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _resultados_decorators = [(0, typeorm_1.OneToMany)(function () { return resultado_test_entity_1.ResultadoTest; }, function (r) { return r.usuario; })];
        _activo_decorators = [(0, typeorm_1.Column)({ default: true })];
        _onboardingGeneralCompletado_decorators = [(0, typeorm_1.Column)({ default: false })];
        _simulacrosHoy_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _preguntasRespondidasTotales_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _preguntasTestHoy_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _flashcardsHoy_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _temasRevisadosHoy_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _ultimaActividad_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
        _fechaResetConsumo_decorators = [(0, typeorm_1.Column)({ type: 'date', nullable: true })];
        _suscripcion_decorators = [(0, typeorm_1.Column)({
                type: 'enum',
                enum: SuscripcionUsuario,
                default: SuscripcionUsuario.GRATUITO,
            })];
        _objetivo_decorators = [(0, typeorm_1.Column)({ type: 'varchar', nullable: true })];
        _compromiso_decorators = [(0, typeorm_1.Column)({ type: 'boolean', default: false })];
        _estado_decorators = [(0, typeorm_1.Column)({
                type: 'enum',
                enum: EstadoUsuario,
                default: EstadoUsuario.NUEVO,
            })];
        _usuarioOposiciones_decorators = [(0, typeorm_1.OneToMany)(function () { return usuario_oposicion_entity_1.UsuarioOposicion; }, function (uo) { return uo.usuario; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: function (obj) { return "email" in obj; }, get: function (obj) { return obj.email; }, set: function (obj, value) { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
        __esDecorate(null, null, _nombre_decorators, { kind: "field", name: "nombre", static: false, private: false, access: { has: function (obj) { return "nombre" in obj; }, get: function (obj) { return obj.nombre; }, set: function (obj, value) { obj.nombre = value; } }, metadata: _metadata }, _nombre_initializers, _nombre_extraInitializers);
        __esDecorate(null, null, _apellidos_decorators, { kind: "field", name: "apellidos", static: false, private: false, access: { has: function (obj) { return "apellidos" in obj; }, get: function (obj) { return obj.apellidos; }, set: function (obj, value) { obj.apellidos = value; } }, metadata: _metadata }, _apellidos_initializers, _apellidos_extraInitializers);
        __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: function (obj) { return "password" in obj; }, get: function (obj) { return obj.password; }, set: function (obj, value) { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
        __esDecorate(null, null, _dni_decorators, { kind: "field", name: "dni", static: false, private: false, access: { has: function (obj) { return "dni" in obj; }, get: function (obj) { return obj.dni; }, set: function (obj, value) { obj.dni = value; } }, metadata: _metadata }, _dni_initializers, _dni_extraInitializers);
        __esDecorate(null, null, _notificacionesListas_decorators, { kind: "field", name: "notificacionesListas", static: false, private: false, access: { has: function (obj) { return "notificacionesListas" in obj; }, get: function (obj) { return obj.notificacionesListas; }, set: function (obj, value) { obj.notificacionesListas = value; } }, metadata: _metadata }, _notificacionesListas_initializers, _notificacionesListas_extraInitializers);
        __esDecorate(null, null, _rachaActual_decorators, { kind: "field", name: "rachaActual", static: false, private: false, access: { has: function (obj) { return "rachaActual" in obj; }, get: function (obj) { return obj.rachaActual; }, set: function (obj, value) { obj.rachaActual = value; } }, metadata: _metadata }, _rachaActual_initializers, _rachaActual_extraInitializers);
        __esDecorate(null, null, _rachaMaxima_decorators, { kind: "field", name: "rachaMaxima", static: false, private: false, access: { has: function (obj) { return "rachaMaxima" in obj; }, get: function (obj) { return obj.rachaMaxima; }, set: function (obj, value) { obj.rachaMaxima = value; } }, metadata: _metadata }, _rachaMaxima_initializers, _rachaMaxima_extraInitializers);
        __esDecorate(null, null, _emailVerificado_decorators, { kind: "field", name: "emailVerificado", static: false, private: false, access: { has: function (obj) { return "emailVerificado" in obj; }, get: function (obj) { return obj.emailVerificado; }, set: function (obj, value) { obj.emailVerificado = value; } }, metadata: _metadata }, _emailVerificado_initializers, _emailVerificado_extraInitializers);
        __esDecorate(null, null, _rol_decorators, { kind: "field", name: "rol", static: false, private: false, access: { has: function (obj) { return "rol" in obj; }, get: function (obj) { return obj.rol; }, set: function (obj, value) { obj.rol = value; } }, metadata: _metadata }, _rol_initializers, _rol_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, null, _nick_decorators, { kind: "field", name: "nick", static: false, private: false, access: { has: function (obj) { return "nick" in obj; }, get: function (obj) { return obj.nick; }, set: function (obj, value) { obj.nick = value; } }, metadata: _metadata }, _nick_initializers, _nick_extraInitializers);
        __esDecorate(null, null, _puntos_decorators, { kind: "field", name: "puntos", static: false, private: false, access: { has: function (obj) { return "puntos" in obj; }, get: function (obj) { return obj.puntos; }, set: function (obj, value) { obj.puntos = value; } }, metadata: _metadata }, _puntos_initializers, _puntos_extraInitializers);
        __esDecorate(null, null, _nivel_decorators, { kind: "field", name: "nivel", static: false, private: false, access: { has: function (obj) { return "nivel" in obj; }, get: function (obj) { return obj.nivel; }, set: function (obj, value) { obj.nivel = value; } }, metadata: _metadata }, _nivel_initializers, _nivel_extraInitializers);
        __esDecorate(null, null, _preguntasCorrectasTotales_decorators, { kind: "field", name: "preguntasCorrectasTotales", static: false, private: false, access: { has: function (obj) { return "preguntasCorrectasTotales" in obj; }, get: function (obj) { return obj.preguntasCorrectasTotales; }, set: function (obj, value) { obj.preguntasCorrectasTotales = value; } }, metadata: _metadata }, _preguntasCorrectasTotales_initializers, _preguntasCorrectasTotales_extraInitializers);
        __esDecorate(null, null, _resultados_decorators, { kind: "field", name: "resultados", static: false, private: false, access: { has: function (obj) { return "resultados" in obj; }, get: function (obj) { return obj.resultados; }, set: function (obj, value) { obj.resultados = value; } }, metadata: _metadata }, _resultados_initializers, _resultados_extraInitializers);
        __esDecorate(null, null, _activo_decorators, { kind: "field", name: "activo", static: false, private: false, access: { has: function (obj) { return "activo" in obj; }, get: function (obj) { return obj.activo; }, set: function (obj, value) { obj.activo = value; } }, metadata: _metadata }, _activo_initializers, _activo_extraInitializers);
        __esDecorate(null, null, _onboardingGeneralCompletado_decorators, { kind: "field", name: "onboardingGeneralCompletado", static: false, private: false, access: { has: function (obj) { return "onboardingGeneralCompletado" in obj; }, get: function (obj) { return obj.onboardingGeneralCompletado; }, set: function (obj, value) { obj.onboardingGeneralCompletado = value; } }, metadata: _metadata }, _onboardingGeneralCompletado_initializers, _onboardingGeneralCompletado_extraInitializers);
        __esDecorate(null, null, _simulacrosHoy_decorators, { kind: "field", name: "simulacrosHoy", static: false, private: false, access: { has: function (obj) { return "simulacrosHoy" in obj; }, get: function (obj) { return obj.simulacrosHoy; }, set: function (obj, value) { obj.simulacrosHoy = value; } }, metadata: _metadata }, _simulacrosHoy_initializers, _simulacrosHoy_extraInitializers);
        __esDecorate(null, null, _preguntasRespondidasTotales_decorators, { kind: "field", name: "preguntasRespondidasTotales", static: false, private: false, access: { has: function (obj) { return "preguntasRespondidasTotales" in obj; }, get: function (obj) { return obj.preguntasRespondidasTotales; }, set: function (obj, value) { obj.preguntasRespondidasTotales = value; } }, metadata: _metadata }, _preguntasRespondidasTotales_initializers, _preguntasRespondidasTotales_extraInitializers);
        __esDecorate(null, null, _preguntasTestHoy_decorators, { kind: "field", name: "preguntasTestHoy", static: false, private: false, access: { has: function (obj) { return "preguntasTestHoy" in obj; }, get: function (obj) { return obj.preguntasTestHoy; }, set: function (obj, value) { obj.preguntasTestHoy = value; } }, metadata: _metadata }, _preguntasTestHoy_initializers, _preguntasTestHoy_extraInitializers);
        __esDecorate(null, null, _flashcardsHoy_decorators, { kind: "field", name: "flashcardsHoy", static: false, private: false, access: { has: function (obj) { return "flashcardsHoy" in obj; }, get: function (obj) { return obj.flashcardsHoy; }, set: function (obj, value) { obj.flashcardsHoy = value; } }, metadata: _metadata }, _flashcardsHoy_initializers, _flashcardsHoy_extraInitializers);
        __esDecorate(null, null, _temasRevisadosHoy_decorators, { kind: "field", name: "temasRevisadosHoy", static: false, private: false, access: { has: function (obj) { return "temasRevisadosHoy" in obj; }, get: function (obj) { return obj.temasRevisadosHoy; }, set: function (obj, value) { obj.temasRevisadosHoy = value; } }, metadata: _metadata }, _temasRevisadosHoy_initializers, _temasRevisadosHoy_extraInitializers);
        __esDecorate(null, null, _ultimaActividad_decorators, { kind: "field", name: "ultimaActividad", static: false, private: false, access: { has: function (obj) { return "ultimaActividad" in obj; }, get: function (obj) { return obj.ultimaActividad; }, set: function (obj, value) { obj.ultimaActividad = value; } }, metadata: _metadata }, _ultimaActividad_initializers, _ultimaActividad_extraInitializers);
        __esDecorate(null, null, _fechaResetConsumo_decorators, { kind: "field", name: "fechaResetConsumo", static: false, private: false, access: { has: function (obj) { return "fechaResetConsumo" in obj; }, get: function (obj) { return obj.fechaResetConsumo; }, set: function (obj, value) { obj.fechaResetConsumo = value; } }, metadata: _metadata }, _fechaResetConsumo_initializers, _fechaResetConsumo_extraInitializers);
        __esDecorate(null, null, _suscripcion_decorators, { kind: "field", name: "suscripcion", static: false, private: false, access: { has: function (obj) { return "suscripcion" in obj; }, get: function (obj) { return obj.suscripcion; }, set: function (obj, value) { obj.suscripcion = value; } }, metadata: _metadata }, _suscripcion_initializers, _suscripcion_extraInitializers);
        __esDecorate(null, null, _objetivo_decorators, { kind: "field", name: "objetivo", static: false, private: false, access: { has: function (obj) { return "objetivo" in obj; }, get: function (obj) { return obj.objetivo; }, set: function (obj, value) { obj.objetivo = value; } }, metadata: _metadata }, _objetivo_initializers, _objetivo_extraInitializers);
        __esDecorate(null, null, _compromiso_decorators, { kind: "field", name: "compromiso", static: false, private: false, access: { has: function (obj) { return "compromiso" in obj; }, get: function (obj) { return obj.compromiso; }, set: function (obj, value) { obj.compromiso = value; } }, metadata: _metadata }, _compromiso_initializers, _compromiso_extraInitializers);
        __esDecorate(null, null, _estado_decorators, { kind: "field", name: "estado", static: false, private: false, access: { has: function (obj) { return "estado" in obj; }, get: function (obj) { return obj.estado; }, set: function (obj, value) { obj.estado = value; } }, metadata: _metadata }, _estado_initializers, _estado_extraInitializers);
        __esDecorate(null, null, _usuarioOposiciones_decorators, { kind: "field", name: "usuarioOposiciones", static: false, private: false, access: { has: function (obj) { return "usuarioOposiciones" in obj; }, get: function (obj) { return obj.usuarioOposiciones; }, set: function (obj, value) { obj.usuarioOposiciones = value; } }, metadata: _metadata }, _usuarioOposiciones_initializers, _usuarioOposiciones_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Usuario = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Usuario = _classThis;
}();
exports.Usuario = Usuario;
