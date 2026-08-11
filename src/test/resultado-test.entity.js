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
exports.ResultadoTest = void 0;
var typeorm_1 = require("typeorm");
var usuario_entity_1 = require("../usuario/usuario.entity");
var oposicion_entity_1 = require("../oposicion/oposicion.entity");
var tema_entity_1 = require("../tema/tema.entity");
var ResultadoTest = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('resultados_test')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _totalPreguntas_decorators;
    var _totalPreguntas_initializers = [];
    var _totalPreguntas_extraInitializers = [];
    var _correctas_decorators;
    var _correctas_initializers = [];
    var _correctas_extraInitializers = [];
    var _porcentaje_decorators;
    var _porcentaje_initializers = [];
    var _porcentaje_extraInitializers = [];
    var _tipoTest_decorators;
    var _tipoTest_initializers = [];
    var _tipoTest_extraInitializers = [];
    var _tiempoSegundos_decorators;
    var _tiempoSegundos_initializers = [];
    var _tiempoSegundos_extraInitializers = [];
    var _detallePreguntas_decorators;
    var _detallePreguntas_initializers = [];
    var _detallePreguntas_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var _usuario_decorators;
    var _usuario_initializers = [];
    var _usuario_extraInitializers = [];
    var _oposicion_decorators;
    var _oposicion_initializers = [];
    var _oposicion_extraInitializers = [];
    var _tema_decorators;
    var _tema_initializers = [];
    var _tema_extraInitializers = [];
    var ResultadoTest = _classThis = /** @class */ (function () {
        function ResultadoTest_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.totalPreguntas = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _totalPreguntas_initializers, void 0));
            this.correctas = (__runInitializers(this, _totalPreguntas_extraInitializers), __runInitializers(this, _correctas_initializers, void 0));
            this.porcentaje = (__runInitializers(this, _correctas_extraInitializers), __runInitializers(this, _porcentaje_initializers, void 0));
            this.tipoTest = (__runInitializers(this, _porcentaje_extraInitializers), __runInitializers(this, _tipoTest_initializers, void 0));
            this.tiempoSegundos = (__runInitializers(this, _tipoTest_extraInitializers), __runInitializers(this, _tiempoSegundos_initializers, void 0));
            this.detallePreguntas = (__runInitializers(this, _tiempoSegundos_extraInitializers), __runInitializers(this, _detallePreguntas_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _detallePreguntas_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            this.usuario = (__runInitializers(this, _creadoEn_extraInitializers), __runInitializers(this, _usuario_initializers, void 0));
            this.oposicion = (__runInitializers(this, _usuario_extraInitializers), __runInitializers(this, _oposicion_initializers, void 0));
            this.tema = (__runInitializers(this, _oposicion_extraInitializers), __runInitializers(this, _tema_initializers, void 0));
            __runInitializers(this, _tema_extraInitializers);
        }
        return ResultadoTest_1;
    }());
    __setFunctionName(_classThis, "ResultadoTest");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _totalPreguntas_decorators = [(0, typeorm_1.Column)()];
        _correctas_decorators = [(0, typeorm_1.Column)()];
        _porcentaje_decorators = [(0, typeorm_1.Column)({ type: 'float' })];
        _tipoTest_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _tiempoSegundos_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _detallePreguntas_decorators = [(0, typeorm_1.Column)({
                type: 'jsonb',
                nullable: true,
            })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _usuario_decorators = [(0, typeorm_1.ManyToOne)(function () { return usuario_entity_1.Usuario; })];
        _oposicion_decorators = [(0, typeorm_1.ManyToOne)(function () { return oposicion_entity_1.Oposicion; }, { nullable: true })];
        _tema_decorators = [(0, typeorm_1.ManyToOne)(function () { return tema_entity_1.Tema; }, { nullable: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _totalPreguntas_decorators, { kind: "field", name: "totalPreguntas", static: false, private: false, access: { has: function (obj) { return "totalPreguntas" in obj; }, get: function (obj) { return obj.totalPreguntas; }, set: function (obj, value) { obj.totalPreguntas = value; } }, metadata: _metadata }, _totalPreguntas_initializers, _totalPreguntas_extraInitializers);
        __esDecorate(null, null, _correctas_decorators, { kind: "field", name: "correctas", static: false, private: false, access: { has: function (obj) { return "correctas" in obj; }, get: function (obj) { return obj.correctas; }, set: function (obj, value) { obj.correctas = value; } }, metadata: _metadata }, _correctas_initializers, _correctas_extraInitializers);
        __esDecorate(null, null, _porcentaje_decorators, { kind: "field", name: "porcentaje", static: false, private: false, access: { has: function (obj) { return "porcentaje" in obj; }, get: function (obj) { return obj.porcentaje; }, set: function (obj, value) { obj.porcentaje = value; } }, metadata: _metadata }, _porcentaje_initializers, _porcentaje_extraInitializers);
        __esDecorate(null, null, _tipoTest_decorators, { kind: "field", name: "tipoTest", static: false, private: false, access: { has: function (obj) { return "tipoTest" in obj; }, get: function (obj) { return obj.tipoTest; }, set: function (obj, value) { obj.tipoTest = value; } }, metadata: _metadata }, _tipoTest_initializers, _tipoTest_extraInitializers);
        __esDecorate(null, null, _tiempoSegundos_decorators, { kind: "field", name: "tiempoSegundos", static: false, private: false, access: { has: function (obj) { return "tiempoSegundos" in obj; }, get: function (obj) { return obj.tiempoSegundos; }, set: function (obj, value) { obj.tiempoSegundos = value; } }, metadata: _metadata }, _tiempoSegundos_initializers, _tiempoSegundos_extraInitializers);
        __esDecorate(null, null, _detallePreguntas_decorators, { kind: "field", name: "detallePreguntas", static: false, private: false, access: { has: function (obj) { return "detallePreguntas" in obj; }, get: function (obj) { return obj.detallePreguntas; }, set: function (obj, value) { obj.detallePreguntas = value; } }, metadata: _metadata }, _detallePreguntas_initializers, _detallePreguntas_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, null, _usuario_decorators, { kind: "field", name: "usuario", static: false, private: false, access: { has: function (obj) { return "usuario" in obj; }, get: function (obj) { return obj.usuario; }, set: function (obj, value) { obj.usuario = value; } }, metadata: _metadata }, _usuario_initializers, _usuario_extraInitializers);
        __esDecorate(null, null, _oposicion_decorators, { kind: "field", name: "oposicion", static: false, private: false, access: { has: function (obj) { return "oposicion" in obj; }, get: function (obj) { return obj.oposicion; }, set: function (obj, value) { obj.oposicion = value; } }, metadata: _metadata }, _oposicion_initializers, _oposicion_extraInitializers);
        __esDecorate(null, null, _tema_decorators, { kind: "field", name: "tema", static: false, private: false, access: { has: function (obj) { return "tema" in obj; }, get: function (obj) { return obj.tema; }, set: function (obj, value) { obj.tema = value; } }, metadata: _metadata }, _tema_initializers, _tema_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ResultadoTest = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ResultadoTest = _classThis;
}();
exports.ResultadoTest = ResultadoTest;
