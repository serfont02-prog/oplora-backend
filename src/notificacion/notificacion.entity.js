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
exports.Notificacion = exports.PrioridadNotificacion = exports.TipoNotificacion = void 0;
var typeorm_1 = require("typeorm");
var usuario_entity_1 = require("../usuario/usuario.entity");
var TipoNotificacion;
(function (TipoNotificacion) {
    TipoNotificacion["ADMITIDO"] = "admitido";
    TipoNotificacion["EXCLUIDO"] = "excluido";
    TipoNotificacion["CAMBIO_NORMATIVO"] = "cambio_normativo";
    TipoNotificacion["NUEVO_DOCUMENTO"] = "nuevo_documento";
    TipoNotificacion["NUEVA_CONVOCATORIA"] = "nueva_convocatoria";
    TipoNotificacion["PLAZO_IMPORTANTE"] = "plazo_importante";
    TipoNotificacion["RETO_DIARIO"] = "reto_diario";
    TipoNotificacion["RETO_RECIBIDO"] = "reto_recibido";
    TipoNotificacion["RETO_RESULTADO"] = "reto_resultado";
    TipoNotificacion["LOGRO"] = "logro";
    TipoNotificacion["RACHA_PELIGRO"] = "racha_peligro";
})(TipoNotificacion || (exports.TipoNotificacion = TipoNotificacion = {}));
var PrioridadNotificacion;
(function (PrioridadNotificacion) {
    PrioridadNotificacion["ALTA"] = "alta";
    PrioridadNotificacion["MEDIA"] = "media";
    PrioridadNotificacion["BAJA"] = "baja";
})(PrioridadNotificacion || (exports.PrioridadNotificacion = PrioridadNotificacion = {}));
var Notificacion = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('notificaciones')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _tipo_decorators;
    var _tipo_initializers = [];
    var _tipo_extraInitializers = [];
    var _prioridad_decorators;
    var _prioridad_initializers = [];
    var _prioridad_extraInitializers = [];
    var _titulo_decorators;
    var _titulo_initializers = [];
    var _titulo_extraInitializers = [];
    var _mensaje_decorators;
    var _mensaje_initializers = [];
    var _mensaje_extraInitializers = [];
    var _leida_decorators;
    var _leida_initializers = [];
    var _leida_extraInitializers = [];
    var _urlAccion_decorators;
    var _urlAccion_initializers = [];
    var _urlAccion_extraInitializers = [];
    var _metadata_decorators;
    var _metadata_initializers = [];
    var _metadata_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var _usuario_decorators;
    var _usuario_initializers = [];
    var _usuario_extraInitializers = [];
    var Notificacion = _classThis = /** @class */ (function () {
        function Notificacion_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.tipo = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _tipo_initializers, void 0));
            this.prioridad = (__runInitializers(this, _tipo_extraInitializers), __runInitializers(this, _prioridad_initializers, void 0));
            this.titulo = (__runInitializers(this, _prioridad_extraInitializers), __runInitializers(this, _titulo_initializers, void 0));
            this.mensaje = (__runInitializers(this, _titulo_extraInitializers), __runInitializers(this, _mensaje_initializers, void 0));
            this.leida = (__runInitializers(this, _mensaje_extraInitializers), __runInitializers(this, _leida_initializers, void 0));
            this.urlAccion = (__runInitializers(this, _leida_extraInitializers), __runInitializers(this, _urlAccion_initializers, void 0));
            this.metadata = (__runInitializers(this, _urlAccion_extraInitializers), __runInitializers(this, _metadata_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _metadata_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            this.usuario = (__runInitializers(this, _creadoEn_extraInitializers), __runInitializers(this, _usuario_initializers, void 0));
            __runInitializers(this, _usuario_extraInitializers);
        }
        return Notificacion_1;
    }());
    __setFunctionName(_classThis, "Notificacion");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _tipo_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: TipoNotificacion })];
        _prioridad_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: PrioridadNotificacion, default: PrioridadNotificacion.MEDIA })];
        _titulo_decorators = [(0, typeorm_1.Column)()];
        _mensaje_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _leida_decorators = [(0, typeorm_1.Column)({ default: false })];
        _urlAccion_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _metadata_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _usuario_decorators = [(0, typeorm_1.ManyToOne)(function () { return usuario_entity_1.Usuario; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _tipo_decorators, { kind: "field", name: "tipo", static: false, private: false, access: { has: function (obj) { return "tipo" in obj; }, get: function (obj) { return obj.tipo; }, set: function (obj, value) { obj.tipo = value; } }, metadata: _metadata }, _tipo_initializers, _tipo_extraInitializers);
        __esDecorate(null, null, _prioridad_decorators, { kind: "field", name: "prioridad", static: false, private: false, access: { has: function (obj) { return "prioridad" in obj; }, get: function (obj) { return obj.prioridad; }, set: function (obj, value) { obj.prioridad = value; } }, metadata: _metadata }, _prioridad_initializers, _prioridad_extraInitializers);
        __esDecorate(null, null, _titulo_decorators, { kind: "field", name: "titulo", static: false, private: false, access: { has: function (obj) { return "titulo" in obj; }, get: function (obj) { return obj.titulo; }, set: function (obj, value) { obj.titulo = value; } }, metadata: _metadata }, _titulo_initializers, _titulo_extraInitializers);
        __esDecorate(null, null, _mensaje_decorators, { kind: "field", name: "mensaje", static: false, private: false, access: { has: function (obj) { return "mensaje" in obj; }, get: function (obj) { return obj.mensaje; }, set: function (obj, value) { obj.mensaje = value; } }, metadata: _metadata }, _mensaje_initializers, _mensaje_extraInitializers);
        __esDecorate(null, null, _leida_decorators, { kind: "field", name: "leida", static: false, private: false, access: { has: function (obj) { return "leida" in obj; }, get: function (obj) { return obj.leida; }, set: function (obj, value) { obj.leida = value; } }, metadata: _metadata }, _leida_initializers, _leida_extraInitializers);
        __esDecorate(null, null, _urlAccion_decorators, { kind: "field", name: "urlAccion", static: false, private: false, access: { has: function (obj) { return "urlAccion" in obj; }, get: function (obj) { return obj.urlAccion; }, set: function (obj, value) { obj.urlAccion = value; } }, metadata: _metadata }, _urlAccion_initializers, _urlAccion_extraInitializers);
        __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: function (obj) { return "metadata" in obj; }, get: function (obj) { return obj.metadata; }, set: function (obj, value) { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, null, _usuario_decorators, { kind: "field", name: "usuario", static: false, private: false, access: { has: function (obj) { return "usuario" in obj; }, get: function (obj) { return obj.usuario; }, set: function (obj, value) { obj.usuario = value; } }, metadata: _metadata }, _usuario_initializers, _usuario_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Notificacion = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Notificacion = _classThis;
}();
exports.Notificacion = Notificacion;
