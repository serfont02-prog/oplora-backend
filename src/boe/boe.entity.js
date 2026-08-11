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
exports.BoeConvocatoria = exports.EstadoBOE = void 0;
var typeorm_1 = require("typeorm");
var EstadoBOE;
(function (EstadoBOE) {
    EstadoBOE["PENDIENTE"] = "pendiente";
    EstadoBOE["APROBADA"] = "aprobada";
    EstadoBOE["RECHAZADA"] = "rechazada";
    EstadoBOE["PROCESADA"] = "procesada";
})(EstadoBOE || (exports.EstadoBOE = EstadoBOE = {}));
var BoeConvocatoria = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('boe_convocatorias')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _fechaBOE_decorators;
    var _fechaBOE_initializers = [];
    var _fechaBOE_extraInitializers = [];
    var _referenciaBOE_decorators;
    var _referenciaBOE_initializers = [];
    var _referenciaBOE_extraInitializers = [];
    var _titulo_decorators;
    var _titulo_initializers = [];
    var _titulo_extraInitializers = [];
    var _urlPdf_decorators;
    var _urlPdf_initializers = [];
    var _urlPdf_extraInitializers = [];
    var _urlHtml_decorators;
    var _urlHtml_initializers = [];
    var _urlHtml_extraInitializers = [];
    var _departamento_decorators;
    var _departamento_initializers = [];
    var _departamento_extraInitializers = [];
    var _datosExtraidos_decorators;
    var _datosExtraidos_initializers = [];
    var _datosExtraidos_extraInitializers = [];
    var _estado_decorators;
    var _estado_initializers = [];
    var _estado_extraInitializers = [];
    var _notas_decorators;
    var _notas_initializers = [];
    var _notas_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var BoeConvocatoria = _classThis = /** @class */ (function () {
        function BoeConvocatoria_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.fechaBOE = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _fechaBOE_initializers, void 0));
            this.referenciaBOE = (__runInitializers(this, _fechaBOE_extraInitializers), __runInitializers(this, _referenciaBOE_initializers, void 0));
            this.titulo = (__runInitializers(this, _referenciaBOE_extraInitializers), __runInitializers(this, _titulo_initializers, void 0));
            this.urlPdf = (__runInitializers(this, _titulo_extraInitializers), __runInitializers(this, _urlPdf_initializers, void 0));
            this.urlHtml = (__runInitializers(this, _urlPdf_extraInitializers), __runInitializers(this, _urlHtml_initializers, void 0));
            this.departamento = (__runInitializers(this, _urlHtml_extraInitializers), __runInitializers(this, _departamento_initializers, void 0));
            this.datosExtraidos = (__runInitializers(this, _departamento_extraInitializers), __runInitializers(this, _datosExtraidos_initializers, void 0));
            this.estado = (__runInitializers(this, _datosExtraidos_extraInitializers), __runInitializers(this, _estado_initializers, void 0));
            this.notas = (__runInitializers(this, _estado_extraInitializers), __runInitializers(this, _notas_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _notas_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            __runInitializers(this, _creadoEn_extraInitializers);
        }
        return BoeConvocatoria_1;
    }());
    __setFunctionName(_classThis, "BoeConvocatoria");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _fechaBOE_decorators = [(0, typeorm_1.Column)()];
        _referenciaBOE_decorators = [(0, typeorm_1.Column)()];
        _titulo_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _urlPdf_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _urlHtml_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _departamento_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _datosExtraidos_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true })];
        _estado_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: EstadoBOE, default: EstadoBOE.PENDIENTE })];
        _notas_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _fechaBOE_decorators, { kind: "field", name: "fechaBOE", static: false, private: false, access: { has: function (obj) { return "fechaBOE" in obj; }, get: function (obj) { return obj.fechaBOE; }, set: function (obj, value) { obj.fechaBOE = value; } }, metadata: _metadata }, _fechaBOE_initializers, _fechaBOE_extraInitializers);
        __esDecorate(null, null, _referenciaBOE_decorators, { kind: "field", name: "referenciaBOE", static: false, private: false, access: { has: function (obj) { return "referenciaBOE" in obj; }, get: function (obj) { return obj.referenciaBOE; }, set: function (obj, value) { obj.referenciaBOE = value; } }, metadata: _metadata }, _referenciaBOE_initializers, _referenciaBOE_extraInitializers);
        __esDecorate(null, null, _titulo_decorators, { kind: "field", name: "titulo", static: false, private: false, access: { has: function (obj) { return "titulo" in obj; }, get: function (obj) { return obj.titulo; }, set: function (obj, value) { obj.titulo = value; } }, metadata: _metadata }, _titulo_initializers, _titulo_extraInitializers);
        __esDecorate(null, null, _urlPdf_decorators, { kind: "field", name: "urlPdf", static: false, private: false, access: { has: function (obj) { return "urlPdf" in obj; }, get: function (obj) { return obj.urlPdf; }, set: function (obj, value) { obj.urlPdf = value; } }, metadata: _metadata }, _urlPdf_initializers, _urlPdf_extraInitializers);
        __esDecorate(null, null, _urlHtml_decorators, { kind: "field", name: "urlHtml", static: false, private: false, access: { has: function (obj) { return "urlHtml" in obj; }, get: function (obj) { return obj.urlHtml; }, set: function (obj, value) { obj.urlHtml = value; } }, metadata: _metadata }, _urlHtml_initializers, _urlHtml_extraInitializers);
        __esDecorate(null, null, _departamento_decorators, { kind: "field", name: "departamento", static: false, private: false, access: { has: function (obj) { return "departamento" in obj; }, get: function (obj) { return obj.departamento; }, set: function (obj, value) { obj.departamento = value; } }, metadata: _metadata }, _departamento_initializers, _departamento_extraInitializers);
        __esDecorate(null, null, _datosExtraidos_decorators, { kind: "field", name: "datosExtraidos", static: false, private: false, access: { has: function (obj) { return "datosExtraidos" in obj; }, get: function (obj) { return obj.datosExtraidos; }, set: function (obj, value) { obj.datosExtraidos = value; } }, metadata: _metadata }, _datosExtraidos_initializers, _datosExtraidos_extraInitializers);
        __esDecorate(null, null, _estado_decorators, { kind: "field", name: "estado", static: false, private: false, access: { has: function (obj) { return "estado" in obj; }, get: function (obj) { return obj.estado; }, set: function (obj, value) { obj.estado = value; } }, metadata: _metadata }, _estado_initializers, _estado_extraInitializers);
        __esDecorate(null, null, _notas_decorators, { kind: "field", name: "notas", static: false, private: false, access: { has: function (obj) { return "notas" in obj; }, get: function (obj) { return obj.notas; }, set: function (obj, value) { obj.notas = value; } }, metadata: _metadata }, _notas_initializers, _notas_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BoeConvocatoria = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BoeConvocatoria = _classThis;
}();
exports.BoeConvocatoria = BoeConvocatoria;
