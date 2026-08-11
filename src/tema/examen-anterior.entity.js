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
exports.ExamenAnterior = exports.TipoExamen = void 0;
var typeorm_1 = require("typeorm");
var oposicion_entity_1 = require("../oposicion/oposicion.entity");
var convocatoria_entity_1 = require("../convocatoria/convocatoria.entity");
var TipoExamen;
(function (TipoExamen) {
    TipoExamen["TEST"] = "test";
    TipoExamen["PRACTICO"] = "practico";
    TipoExamen["DESARROLLO"] = "desarrollo";
    TipoExamen["ORAL"] = "oral";
    TipoExamen["SUPUESTO"] = "supuesto";
})(TipoExamen || (exports.TipoExamen = TipoExamen = {}));
var ExamenAnterior = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('examenes_anteriores')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _anyo_decorators;
    var _anyo_initializers = [];
    var _anyo_extraInitializers = [];
    var _parte_decorators;
    var _parte_initializers = [];
    var _parte_extraInitializers = [];
    var _nombre_decorators;
    var _nombre_initializers = [];
    var _nombre_extraInitializers = [];
    var _tipo_decorators;
    var _tipo_initializers = [];
    var _tipo_extraInitializers = [];
    var _numPreguntas_decorators;
    var _numPreguntas_initializers = [];
    var _numPreguntas_extraInitializers = [];
    var _urlPdf_decorators;
    var _urlPdf_initializers = [];
    var _urlPdf_extraInitializers = [];
    var _textoExtraido_decorators;
    var _textoExtraido_initializers = [];
    var _textoExtraido_extraInitializers = [];
    var _procesado_decorators;
    var _procesado_initializers = [];
    var _procesado_extraInitializers = [];
    var _totalPreguntas_decorators;
    var _totalPreguntas_initializers = [];
    var _totalPreguntas_extraInitializers = [];
    var _mes_decorators;
    var _mes_initializers = [];
    var _mes_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var _oposicion_decorators;
    var _oposicion_initializers = [];
    var _oposicion_extraInitializers = [];
    var _convocatoria_decorators;
    var _convocatoria_initializers = [];
    var _convocatoria_extraInitializers = [];
    var ExamenAnterior = _classThis = /** @class */ (function () {
        function ExamenAnterior_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.anyo = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _anyo_initializers, void 0));
            this.parte = (__runInitializers(this, _anyo_extraInitializers), __runInitializers(this, _parte_initializers, void 0)); // 1, 2, 3...
            this.nombre = (__runInitializers(this, _parte_extraInitializers), __runInitializers(this, _nombre_initializers, void 0));
            this.tipo = (__runInitializers(this, _nombre_extraInitializers), __runInitializers(this, _tipo_initializers, void 0));
            this.numPreguntas = (__runInitializers(this, _tipo_extraInitializers), __runInitializers(this, _numPreguntas_initializers, void 0));
            this.urlPdf = (__runInitializers(this, _numPreguntas_extraInitializers), __runInitializers(this, _urlPdf_initializers, void 0));
            this.textoExtraido = (__runInitializers(this, _urlPdf_extraInitializers), __runInitializers(this, _textoExtraido_initializers, void 0));
            this.procesado = (__runInitializers(this, _textoExtraido_extraInitializers), __runInitializers(this, _procesado_initializers, void 0));
            this.totalPreguntas = (__runInitializers(this, _procesado_extraInitializers), __runInitializers(this, _totalPreguntas_initializers, void 0));
            this.mes = (__runInitializers(this, _totalPreguntas_extraInitializers), __runInitializers(this, _mes_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _mes_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            this.oposicion = (__runInitializers(this, _creadoEn_extraInitializers), __runInitializers(this, _oposicion_initializers, void 0));
            this.convocatoria = (__runInitializers(this, _oposicion_extraInitializers), __runInitializers(this, _convocatoria_initializers, void 0));
            __runInitializers(this, _convocatoria_extraInitializers);
        }
        return ExamenAnterior_1;
    }());
    __setFunctionName(_classThis, "ExamenAnterior");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _anyo_decorators = [(0, typeorm_1.Column)()];
        _parte_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _nombre_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _tipo_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: TipoExamen, default: TipoExamen.TEST })];
        _numPreguntas_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _urlPdf_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _textoExtraido_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _procesado_decorators = [(0, typeorm_1.Column)({ default: false })];
        _totalPreguntas_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _mes_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _oposicion_decorators = [(0, typeorm_1.ManyToOne)(function () { return oposicion_entity_1.Oposicion; }, { nullable: true })];
        _convocatoria_decorators = [(0, typeorm_1.ManyToOne)(function () { return convocatoria_entity_1.Convocatoria; }, { nullable: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _anyo_decorators, { kind: "field", name: "anyo", static: false, private: false, access: { has: function (obj) { return "anyo" in obj; }, get: function (obj) { return obj.anyo; }, set: function (obj, value) { obj.anyo = value; } }, metadata: _metadata }, _anyo_initializers, _anyo_extraInitializers);
        __esDecorate(null, null, _parte_decorators, { kind: "field", name: "parte", static: false, private: false, access: { has: function (obj) { return "parte" in obj; }, get: function (obj) { return obj.parte; }, set: function (obj, value) { obj.parte = value; } }, metadata: _metadata }, _parte_initializers, _parte_extraInitializers);
        __esDecorate(null, null, _nombre_decorators, { kind: "field", name: "nombre", static: false, private: false, access: { has: function (obj) { return "nombre" in obj; }, get: function (obj) { return obj.nombre; }, set: function (obj, value) { obj.nombre = value; } }, metadata: _metadata }, _nombre_initializers, _nombre_extraInitializers);
        __esDecorate(null, null, _tipo_decorators, { kind: "field", name: "tipo", static: false, private: false, access: { has: function (obj) { return "tipo" in obj; }, get: function (obj) { return obj.tipo; }, set: function (obj, value) { obj.tipo = value; } }, metadata: _metadata }, _tipo_initializers, _tipo_extraInitializers);
        __esDecorate(null, null, _numPreguntas_decorators, { kind: "field", name: "numPreguntas", static: false, private: false, access: { has: function (obj) { return "numPreguntas" in obj; }, get: function (obj) { return obj.numPreguntas; }, set: function (obj, value) { obj.numPreguntas = value; } }, metadata: _metadata }, _numPreguntas_initializers, _numPreguntas_extraInitializers);
        __esDecorate(null, null, _urlPdf_decorators, { kind: "field", name: "urlPdf", static: false, private: false, access: { has: function (obj) { return "urlPdf" in obj; }, get: function (obj) { return obj.urlPdf; }, set: function (obj, value) { obj.urlPdf = value; } }, metadata: _metadata }, _urlPdf_initializers, _urlPdf_extraInitializers);
        __esDecorate(null, null, _textoExtraido_decorators, { kind: "field", name: "textoExtraido", static: false, private: false, access: { has: function (obj) { return "textoExtraido" in obj; }, get: function (obj) { return obj.textoExtraido; }, set: function (obj, value) { obj.textoExtraido = value; } }, metadata: _metadata }, _textoExtraido_initializers, _textoExtraido_extraInitializers);
        __esDecorate(null, null, _procesado_decorators, { kind: "field", name: "procesado", static: false, private: false, access: { has: function (obj) { return "procesado" in obj; }, get: function (obj) { return obj.procesado; }, set: function (obj, value) { obj.procesado = value; } }, metadata: _metadata }, _procesado_initializers, _procesado_extraInitializers);
        __esDecorate(null, null, _totalPreguntas_decorators, { kind: "field", name: "totalPreguntas", static: false, private: false, access: { has: function (obj) { return "totalPreguntas" in obj; }, get: function (obj) { return obj.totalPreguntas; }, set: function (obj, value) { obj.totalPreguntas = value; } }, metadata: _metadata }, _totalPreguntas_initializers, _totalPreguntas_extraInitializers);
        __esDecorate(null, null, _mes_decorators, { kind: "field", name: "mes", static: false, private: false, access: { has: function (obj) { return "mes" in obj; }, get: function (obj) { return obj.mes; }, set: function (obj, value) { obj.mes = value; } }, metadata: _metadata }, _mes_initializers, _mes_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, null, _oposicion_decorators, { kind: "field", name: "oposicion", static: false, private: false, access: { has: function (obj) { return "oposicion" in obj; }, get: function (obj) { return obj.oposicion; }, set: function (obj, value) { obj.oposicion = value; } }, metadata: _metadata }, _oposicion_initializers, _oposicion_extraInitializers);
        __esDecorate(null, null, _convocatoria_decorators, { kind: "field", name: "convocatoria", static: false, private: false, access: { has: function (obj) { return "convocatoria" in obj; }, get: function (obj) { return obj.convocatoria; }, set: function (obj, value) { obj.convocatoria = value; } }, metadata: _metadata }, _convocatoria_initializers, _convocatoria_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ExamenAnterior = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ExamenAnterior = _classThis;
}();
exports.ExamenAnterior = ExamenAnterior;
