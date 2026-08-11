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
exports.Reto = exports.EstadoReto = exports.TipoReto = void 0;
var typeorm_1 = require("typeorm");
var usuario_entity_1 = require("../usuario/usuario.entity");
var oposicion_entity_1 = require("../oposicion/oposicion.entity");
var tema_entity_1 = require("../tema/tema.entity");
var participacion_reto_entity_1 = require("./participacion-reto.entity");
var TipoReto;
(function (TipoReto) {
    TipoReto["DIARIO"] = "diario";
    TipoReto["SEMANAL"] = "semanal";
    TipoReto["USUARIO"] = "usuario";
})(TipoReto || (exports.TipoReto = TipoReto = {}));
var EstadoReto;
(function (EstadoReto) {
    EstadoReto["PENDIENTE"] = "pendiente";
    EstadoReto["ACTIVO"] = "activo";
    EstadoReto["COMPLETADO"] = "completado";
    EstadoReto["EXPIRADO"] = "expirado";
})(EstadoReto || (exports.EstadoReto = EstadoReto = {}));
var Reto = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('retos')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _tipo_decorators;
    var _tipo_initializers = [];
    var _tipo_extraInitializers = [];
    var _estado_decorators;
    var _estado_initializers = [];
    var _estado_extraInitializers = [];
    var _nivelRequerido_decorators;
    var _nivelRequerido_initializers = [];
    var _nivelRequerido_extraInitializers = [];
    var _preguntas_decorators;
    var _preguntas_initializers = [];
    var _preguntas_extraInitializers = [];
    var _fechaFin_decorators;
    var _fechaFin_initializers = [];
    var _fechaFin_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var _creador_decorators;
    var _creador_initializers = [];
    var _creador_extraInitializers = [];
    var _oposicion_decorators;
    var _oposicion_initializers = [];
    var _oposicion_extraInitializers = [];
    var _tema_decorators;
    var _tema_initializers = [];
    var _tema_extraInitializers = [];
    var _participaciones_decorators;
    var _participaciones_initializers = [];
    var _participaciones_extraInitializers = [];
    var Reto = _classThis = /** @class */ (function () {
        function Reto_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.tipo = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _tipo_initializers, void 0));
            this.estado = (__runInitializers(this, _tipo_extraInitializers), __runInitializers(this, _estado_initializers, void 0));
            this.nivelRequerido = (__runInitializers(this, _estado_extraInitializers), __runInitializers(this, _nivelRequerido_initializers, void 0));
            this.preguntas = (__runInitializers(this, _nivelRequerido_extraInitializers), __runInitializers(this, _preguntas_initializers, void 0));
            this.fechaFin = (__runInitializers(this, _preguntas_extraInitializers), __runInitializers(this, _fechaFin_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _fechaFin_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            this.creador = (__runInitializers(this, _creadoEn_extraInitializers), __runInitializers(this, _creador_initializers, void 0));
            this.oposicion = (__runInitializers(this, _creador_extraInitializers), __runInitializers(this, _oposicion_initializers, void 0));
            this.tema = (__runInitializers(this, _oposicion_extraInitializers), __runInitializers(this, _tema_initializers, void 0));
            this.participaciones = (__runInitializers(this, _tema_extraInitializers), __runInitializers(this, _participaciones_initializers, void 0));
            __runInitializers(this, _participaciones_extraInitializers);
        }
        return Reto_1;
    }());
    __setFunctionName(_classThis, "Reto");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _tipo_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: TipoReto })];
        _estado_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: EstadoReto, default: EstadoReto.ACTIVO })];
        _nivelRequerido_decorators = [(0, typeorm_1.Column)({ default: 1 })];
        _preguntas_decorators = [(0, typeorm_1.Column)({ type: 'jsonb' })];
        _fechaFin_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _creador_decorators = [(0, typeorm_1.ManyToOne)(function () { return usuario_entity_1.Usuario; }, { nullable: true })];
        _oposicion_decorators = [(0, typeorm_1.ManyToOne)(function () { return oposicion_entity_1.Oposicion; }, function (o) { return o.retos; }, {
                nullable: true,
                onDelete: 'CASCADE',
            })];
        _tema_decorators = [(0, typeorm_1.ManyToOne)(function () { return tema_entity_1.Tema; }, { nullable: true })];
        _participaciones_decorators = [(0, typeorm_1.OneToMany)(function () { return participacion_reto_entity_1.ParticipacionReto; }, function (p) { return p.reto; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _tipo_decorators, { kind: "field", name: "tipo", static: false, private: false, access: { has: function (obj) { return "tipo" in obj; }, get: function (obj) { return obj.tipo; }, set: function (obj, value) { obj.tipo = value; } }, metadata: _metadata }, _tipo_initializers, _tipo_extraInitializers);
        __esDecorate(null, null, _estado_decorators, { kind: "field", name: "estado", static: false, private: false, access: { has: function (obj) { return "estado" in obj; }, get: function (obj) { return obj.estado; }, set: function (obj, value) { obj.estado = value; } }, metadata: _metadata }, _estado_initializers, _estado_extraInitializers);
        __esDecorate(null, null, _nivelRequerido_decorators, { kind: "field", name: "nivelRequerido", static: false, private: false, access: { has: function (obj) { return "nivelRequerido" in obj; }, get: function (obj) { return obj.nivelRequerido; }, set: function (obj, value) { obj.nivelRequerido = value; } }, metadata: _metadata }, _nivelRequerido_initializers, _nivelRequerido_extraInitializers);
        __esDecorate(null, null, _preguntas_decorators, { kind: "field", name: "preguntas", static: false, private: false, access: { has: function (obj) { return "preguntas" in obj; }, get: function (obj) { return obj.preguntas; }, set: function (obj, value) { obj.preguntas = value; } }, metadata: _metadata }, _preguntas_initializers, _preguntas_extraInitializers);
        __esDecorate(null, null, _fechaFin_decorators, { kind: "field", name: "fechaFin", static: false, private: false, access: { has: function (obj) { return "fechaFin" in obj; }, get: function (obj) { return obj.fechaFin; }, set: function (obj, value) { obj.fechaFin = value; } }, metadata: _metadata }, _fechaFin_initializers, _fechaFin_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, null, _creador_decorators, { kind: "field", name: "creador", static: false, private: false, access: { has: function (obj) { return "creador" in obj; }, get: function (obj) { return obj.creador; }, set: function (obj, value) { obj.creador = value; } }, metadata: _metadata }, _creador_initializers, _creador_extraInitializers);
        __esDecorate(null, null, _oposicion_decorators, { kind: "field", name: "oposicion", static: false, private: false, access: { has: function (obj) { return "oposicion" in obj; }, get: function (obj) { return obj.oposicion; }, set: function (obj, value) { obj.oposicion = value; } }, metadata: _metadata }, _oposicion_initializers, _oposicion_extraInitializers);
        __esDecorate(null, null, _tema_decorators, { kind: "field", name: "tema", static: false, private: false, access: { has: function (obj) { return "tema" in obj; }, get: function (obj) { return obj.tema; }, set: function (obj, value) { obj.tema = value; } }, metadata: _metadata }, _tema_initializers, _tema_extraInitializers);
        __esDecorate(null, null, _participaciones_decorators, { kind: "field", name: "participaciones", static: false, private: false, access: { has: function (obj) { return "participaciones" in obj; }, get: function (obj) { return obj.participaciones; }, set: function (obj, value) { obj.participaciones = value; } }, metadata: _metadata }, _participaciones_initializers, _participaciones_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Reto = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Reto = _classThis;
}();
exports.Reto = Reto;
