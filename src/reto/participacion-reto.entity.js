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
exports.ParticipacionReto = void 0;
var typeorm_1 = require("typeorm");
var reto_entity_1 = require("./reto.entity");
var usuario_entity_1 = require("../usuario/usuario.entity");
var ParticipacionReto = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('participaciones_reto')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _completado_decorators;
    var _completado_initializers = [];
    var _completado_extraInitializers = [];
    var _porcentaje_decorators;
    var _porcentaje_initializers = [];
    var _porcentaje_extraInitializers = [];
    var _tiempoSegundos_decorators;
    var _tiempoSegundos_initializers = [];
    var _tiempoSegundos_extraInitializers = [];
    var _posicion_decorators;
    var _posicion_initializers = [];
    var _posicion_extraInitializers = [];
    var _respuestas_decorators;
    var _respuestas_initializers = [];
    var _respuestas_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var _reto_decorators;
    var _reto_initializers = [];
    var _reto_extraInitializers = [];
    var _usuario_decorators;
    var _usuario_initializers = [];
    var _usuario_extraInitializers = [];
    var ParticipacionReto = _classThis = /** @class */ (function () {
        function ParticipacionReto_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.completado = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _completado_initializers, void 0));
            this.porcentaje = (__runInitializers(this, _completado_extraInitializers), __runInitializers(this, _porcentaje_initializers, void 0));
            this.tiempoSegundos = (__runInitializers(this, _porcentaje_extraInitializers), __runInitializers(this, _tiempoSegundos_initializers, void 0));
            this.posicion = (__runInitializers(this, _tiempoSegundos_extraInitializers), __runInitializers(this, _posicion_initializers, void 0));
            this.respuestas = (__runInitializers(this, _posicion_extraInitializers), __runInitializers(this, _respuestas_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _respuestas_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            this.reto = (__runInitializers(this, _creadoEn_extraInitializers), __runInitializers(this, _reto_initializers, void 0));
            this.usuario = (__runInitializers(this, _reto_extraInitializers), __runInitializers(this, _usuario_initializers, void 0));
            __runInitializers(this, _usuario_extraInitializers);
        }
        return ParticipacionReto_1;
    }());
    __setFunctionName(_classThis, "ParticipacionReto");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _completado_decorators = [(0, typeorm_1.Column)({ default: false })];
        _porcentaje_decorators = [(0, typeorm_1.Column)({ nullable: true, type: 'float' })];
        _tiempoSegundos_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _posicion_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _respuestas_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _reto_decorators = [(0, typeorm_1.ManyToOne)(function () { return reto_entity_1.Reto; }, function (r) { return r.participaciones; }, {
                onDelete: 'CASCADE',
            })];
        _usuario_decorators = [(0, typeorm_1.ManyToOne)(function () { return usuario_entity_1.Usuario; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _completado_decorators, { kind: "field", name: "completado", static: false, private: false, access: { has: function (obj) { return "completado" in obj; }, get: function (obj) { return obj.completado; }, set: function (obj, value) { obj.completado = value; } }, metadata: _metadata }, _completado_initializers, _completado_extraInitializers);
        __esDecorate(null, null, _porcentaje_decorators, { kind: "field", name: "porcentaje", static: false, private: false, access: { has: function (obj) { return "porcentaje" in obj; }, get: function (obj) { return obj.porcentaje; }, set: function (obj, value) { obj.porcentaje = value; } }, metadata: _metadata }, _porcentaje_initializers, _porcentaje_extraInitializers);
        __esDecorate(null, null, _tiempoSegundos_decorators, { kind: "field", name: "tiempoSegundos", static: false, private: false, access: { has: function (obj) { return "tiempoSegundos" in obj; }, get: function (obj) { return obj.tiempoSegundos; }, set: function (obj, value) { obj.tiempoSegundos = value; } }, metadata: _metadata }, _tiempoSegundos_initializers, _tiempoSegundos_extraInitializers);
        __esDecorate(null, null, _posicion_decorators, { kind: "field", name: "posicion", static: false, private: false, access: { has: function (obj) { return "posicion" in obj; }, get: function (obj) { return obj.posicion; }, set: function (obj, value) { obj.posicion = value; } }, metadata: _metadata }, _posicion_initializers, _posicion_extraInitializers);
        __esDecorate(null, null, _respuestas_decorators, { kind: "field", name: "respuestas", static: false, private: false, access: { has: function (obj) { return "respuestas" in obj; }, get: function (obj) { return obj.respuestas; }, set: function (obj, value) { obj.respuestas = value; } }, metadata: _metadata }, _respuestas_initializers, _respuestas_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, null, _reto_decorators, { kind: "field", name: "reto", static: false, private: false, access: { has: function (obj) { return "reto" in obj; }, get: function (obj) { return obj.reto; }, set: function (obj, value) { obj.reto = value; } }, metadata: _metadata }, _reto_initializers, _reto_extraInitializers);
        __esDecorate(null, null, _usuario_decorators, { kind: "field", name: "usuario", static: false, private: false, access: { has: function (obj) { return "usuario" in obj; }, get: function (obj) { return obj.usuario; }, set: function (obj, value) { obj.usuario = value; } }, metadata: _metadata }, _usuario_initializers, _usuario_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ParticipacionReto = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ParticipacionReto = _classThis;
}();
exports.ParticipacionReto = ParticipacionReto;
