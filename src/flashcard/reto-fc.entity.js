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
exports.RetoFC = exports.EstadoRetoFC = exports.TipoRetoFC = void 0;
var typeorm_1 = require("typeorm");
var usuario_entity_1 = require("../usuario/usuario.entity");
var oposicion_entity_1 = require("../oposicion/oposicion.entity");
var tema_entity_1 = require("../tema/tema.entity");
var resultado_reto_fc_entity_1 = require("./resultado-reto-fc.entity");
var TipoRetoFC;
(function (TipoRetoFC) {
    TipoRetoFC["DIARIO"] = "diario";
    TipoRetoFC["SEMANAL"] = "semanal";
    TipoRetoFC["DUELO"] = "duelo";
    TipoRetoFC["PERSONAL"] = "personal";
})(TipoRetoFC || (exports.TipoRetoFC = TipoRetoFC = {}));
var EstadoRetoFC;
(function (EstadoRetoFC) {
    EstadoRetoFC["PENDIENTE"] = "pendiente";
    EstadoRetoFC["ACTIVO"] = "activo";
    EstadoRetoFC["COMPLETADO"] = "completado";
    EstadoRetoFC["EXPIRADO"] = "expirado";
})(EstadoRetoFC || (exports.EstadoRetoFC = EstadoRetoFC = {}));
var RetoFC = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('retos_fc')];
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
    var _flashcards_decorators;
    var _flashcards_initializers = [];
    var _flashcards_extraInitializers = [];
    var _tiempoLimite_decorators;
    var _tiempoLimite_initializers = [];
    var _tiempoLimite_extraInitializers = [];
    var _fechaFin_decorators;
    var _fechaFin_initializers = [];
    var _fechaFin_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var _retador_decorators;
    var _retador_initializers = [];
    var _retador_extraInitializers = [];
    var _retado_decorators;
    var _retado_initializers = [];
    var _retado_extraInitializers = [];
    var _oposicion_decorators;
    var _oposicion_initializers = [];
    var _oposicion_extraInitializers = [];
    var _tema_decorators;
    var _tema_initializers = [];
    var _tema_extraInitializers = [];
    var _resultados_decorators;
    var _resultados_initializers = [];
    var _resultados_extraInitializers = [];
    var RetoFC = _classThis = /** @class */ (function () {
        function RetoFC_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.tipo = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _tipo_initializers, void 0));
            this.estado = (__runInitializers(this, _tipo_extraInitializers), __runInitializers(this, _estado_initializers, void 0));
            this.flashcards = (__runInitializers(this, _estado_extraInitializers), __runInitializers(this, _flashcards_initializers, void 0));
            this.tiempoLimite = (__runInitializers(this, _flashcards_extraInitializers), __runInitializers(this, _tiempoLimite_initializers, void 0));
            this.fechaFin = (__runInitializers(this, _tiempoLimite_extraInitializers), __runInitializers(this, _fechaFin_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _fechaFin_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            this.retador = (__runInitializers(this, _creadoEn_extraInitializers), __runInitializers(this, _retador_initializers, void 0));
            this.retado = (__runInitializers(this, _retador_extraInitializers), __runInitializers(this, _retado_initializers, void 0));
            this.oposicion = (__runInitializers(this, _retado_extraInitializers), __runInitializers(this, _oposicion_initializers, void 0));
            this.tema = (__runInitializers(this, _oposicion_extraInitializers), __runInitializers(this, _tema_initializers, void 0));
            this.resultados = (__runInitializers(this, _tema_extraInitializers), __runInitializers(this, _resultados_initializers, void 0));
            __runInitializers(this, _resultados_extraInitializers);
        }
        return RetoFC_1;
    }());
    __setFunctionName(_classThis, "RetoFC");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _tipo_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: TipoRetoFC })];
        _estado_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: EstadoRetoFC, default: EstadoRetoFC.ACTIVO })];
        _flashcards_decorators = [(0, typeorm_1.Column)({ type: 'jsonb' })];
        _tiempoLimite_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _fechaFin_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _retador_decorators = [(0, typeorm_1.ManyToOne)(function () { return usuario_entity_1.Usuario; }, { nullable: true })];
        _retado_decorators = [(0, typeorm_1.ManyToOne)(function () { return usuario_entity_1.Usuario; }, { nullable: true })];
        _oposicion_decorators = [(0, typeorm_1.ManyToOne)(function () { return oposicion_entity_1.Oposicion; }, { nullable: true })];
        _tema_decorators = [(0, typeorm_1.ManyToOne)(function () { return tema_entity_1.Tema; }, { nullable: true })];
        _resultados_decorators = [(0, typeorm_1.OneToMany)(function () { return resultado_reto_fc_entity_1.ResultadoRetoFC; }, function (r) { return r.retoFc; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _tipo_decorators, { kind: "field", name: "tipo", static: false, private: false, access: { has: function (obj) { return "tipo" in obj; }, get: function (obj) { return obj.tipo; }, set: function (obj, value) { obj.tipo = value; } }, metadata: _metadata }, _tipo_initializers, _tipo_extraInitializers);
        __esDecorate(null, null, _estado_decorators, { kind: "field", name: "estado", static: false, private: false, access: { has: function (obj) { return "estado" in obj; }, get: function (obj) { return obj.estado; }, set: function (obj, value) { obj.estado = value; } }, metadata: _metadata }, _estado_initializers, _estado_extraInitializers);
        __esDecorate(null, null, _flashcards_decorators, { kind: "field", name: "flashcards", static: false, private: false, access: { has: function (obj) { return "flashcards" in obj; }, get: function (obj) { return obj.flashcards; }, set: function (obj, value) { obj.flashcards = value; } }, metadata: _metadata }, _flashcards_initializers, _flashcards_extraInitializers);
        __esDecorate(null, null, _tiempoLimite_decorators, { kind: "field", name: "tiempoLimite", static: false, private: false, access: { has: function (obj) { return "tiempoLimite" in obj; }, get: function (obj) { return obj.tiempoLimite; }, set: function (obj, value) { obj.tiempoLimite = value; } }, metadata: _metadata }, _tiempoLimite_initializers, _tiempoLimite_extraInitializers);
        __esDecorate(null, null, _fechaFin_decorators, { kind: "field", name: "fechaFin", static: false, private: false, access: { has: function (obj) { return "fechaFin" in obj; }, get: function (obj) { return obj.fechaFin; }, set: function (obj, value) { obj.fechaFin = value; } }, metadata: _metadata }, _fechaFin_initializers, _fechaFin_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, null, _retador_decorators, { kind: "field", name: "retador", static: false, private: false, access: { has: function (obj) { return "retador" in obj; }, get: function (obj) { return obj.retador; }, set: function (obj, value) { obj.retador = value; } }, metadata: _metadata }, _retador_initializers, _retador_extraInitializers);
        __esDecorate(null, null, _retado_decorators, { kind: "field", name: "retado", static: false, private: false, access: { has: function (obj) { return "retado" in obj; }, get: function (obj) { return obj.retado; }, set: function (obj, value) { obj.retado = value; } }, metadata: _metadata }, _retado_initializers, _retado_extraInitializers);
        __esDecorate(null, null, _oposicion_decorators, { kind: "field", name: "oposicion", static: false, private: false, access: { has: function (obj) { return "oposicion" in obj; }, get: function (obj) { return obj.oposicion; }, set: function (obj, value) { obj.oposicion = value; } }, metadata: _metadata }, _oposicion_initializers, _oposicion_extraInitializers);
        __esDecorate(null, null, _tema_decorators, { kind: "field", name: "tema", static: false, private: false, access: { has: function (obj) { return "tema" in obj; }, get: function (obj) { return obj.tema; }, set: function (obj, value) { obj.tema = value; } }, metadata: _metadata }, _tema_initializers, _tema_extraInitializers);
        __esDecorate(null, null, _resultados_decorators, { kind: "field", name: "resultados", static: false, private: false, access: { has: function (obj) { return "resultados" in obj; }, get: function (obj) { return obj.resultados; }, set: function (obj, value) { obj.resultados = value; } }, metadata: _metadata }, _resultados_initializers, _resultados_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RetoFC = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RetoFC = _classThis;
}();
exports.RetoFC = RetoFC;
