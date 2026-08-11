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
exports.DocumentoConvocatoria = exports.TipoDocumento = void 0;
var typeorm_1 = require("typeorm");
var convocatoria_entity_1 = require("./convocatoria.entity");
var TipoDocumento;
(function (TipoDocumento) {
    TipoDocumento["LISTA_ADMITIDOS_PROVISIONAL"] = "lista_admitidos_provisional";
    TipoDocumento["LISTA_ADMITIDOS_DEFINITIVA"] = "lista_admitidos_definitiva";
    TipoDocumento["LISTA_EXCLUIDOS_PROVISIONAL"] = "lista_excluidos_provisional";
    TipoDocumento["LISTA_EXCLUIDOS_DEFINITIVA"] = "lista_excluidos_definitiva";
    TipoDocumento["FECHA_EXAMEN"] = "fecha_examen";
    TipoDocumento["RESULTADO_EJERCICIO"] = "resultado_ejercicio";
    TipoDocumento["RESOLUCION_CONVOCATORIA"] = "resolucion_convocatoria";
    TipoDocumento["NOTA_INFORMATIVA"] = "nota_informativa";
    TipoDocumento["CRONOGRAMA"] = "cronograma";
    TipoDocumento["NORMAS_ESPECIFICAS"] = "normas_especificas";
    TipoDocumento["GUIA_INSCRIPCION"] = "guia_inscripcion";
    TipoDocumento["OTRO"] = "otro";
})(TipoDocumento || (exports.TipoDocumento = TipoDocumento = {}));
var DocumentoConvocatoria = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('documentos_convocatoria')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _titulo_decorators;
    var _titulo_initializers = [];
    var _titulo_extraInitializers = [];
    var _tipo_decorators;
    var _tipo_initializers = [];
    var _tipo_extraInitializers = [];
    var _subtipo_decorators;
    var _subtipo_initializers = [];
    var _subtipo_extraInitializers = [];
    var _urlPdf_decorators;
    var _urlPdf_initializers = [];
    var _urlPdf_extraInitializers = [];
    var _procesado_decorators;
    var _procesado_initializers = [];
    var _procesado_extraInitializers = [];
    var _detectadoEn_decorators;
    var _detectadoEn_initializers = [];
    var _detectadoEn_extraInitializers = [];
    var _convocatoria_decorators;
    var _convocatoria_initializers = [];
    var _convocatoria_extraInitializers = [];
    var DocumentoConvocatoria = _classThis = /** @class */ (function () {
        function DocumentoConvocatoria_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.titulo = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _titulo_initializers, void 0));
            this.tipo = (__runInitializers(this, _titulo_extraInitializers), __runInitializers(this, _tipo_initializers, void 0));
            this.subtipo = (__runInitializers(this, _tipo_extraInitializers), __runInitializers(this, _subtipo_initializers, void 0));
            this.urlPdf = (__runInitializers(this, _subtipo_extraInitializers), __runInitializers(this, _urlPdf_initializers, void 0));
            this.procesado = (__runInitializers(this, _urlPdf_extraInitializers), __runInitializers(this, _procesado_initializers, void 0));
            this.detectadoEn = (__runInitializers(this, _procesado_extraInitializers), __runInitializers(this, _detectadoEn_initializers, void 0));
            this.convocatoria = (__runInitializers(this, _detectadoEn_extraInitializers), __runInitializers(this, _convocatoria_initializers, void 0));
            __runInitializers(this, _convocatoria_extraInitializers);
        }
        return DocumentoConvocatoria_1;
    }());
    __setFunctionName(_classThis, "DocumentoConvocatoria");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _titulo_decorators = [(0, typeorm_1.Column)()];
        _tipo_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: TipoDocumento, default: TipoDocumento.OTRO })];
        _subtipo_decorators = [(0, typeorm_1.Column)({ type: 'varchar', nullable: true })];
        _urlPdf_decorators = [(0, typeorm_1.Column)()];
        _procesado_decorators = [(0, typeorm_1.Column)({ default: false })];
        _detectadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _convocatoria_decorators = [(0, typeorm_1.ManyToOne)(function () { return convocatoria_entity_1.Convocatoria; }, function (c) { return c.documentos; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _titulo_decorators, { kind: "field", name: "titulo", static: false, private: false, access: { has: function (obj) { return "titulo" in obj; }, get: function (obj) { return obj.titulo; }, set: function (obj, value) { obj.titulo = value; } }, metadata: _metadata }, _titulo_initializers, _titulo_extraInitializers);
        __esDecorate(null, null, _tipo_decorators, { kind: "field", name: "tipo", static: false, private: false, access: { has: function (obj) { return "tipo" in obj; }, get: function (obj) { return obj.tipo; }, set: function (obj, value) { obj.tipo = value; } }, metadata: _metadata }, _tipo_initializers, _tipo_extraInitializers);
        __esDecorate(null, null, _subtipo_decorators, { kind: "field", name: "subtipo", static: false, private: false, access: { has: function (obj) { return "subtipo" in obj; }, get: function (obj) { return obj.subtipo; }, set: function (obj, value) { obj.subtipo = value; } }, metadata: _metadata }, _subtipo_initializers, _subtipo_extraInitializers);
        __esDecorate(null, null, _urlPdf_decorators, { kind: "field", name: "urlPdf", static: false, private: false, access: { has: function (obj) { return "urlPdf" in obj; }, get: function (obj) { return obj.urlPdf; }, set: function (obj, value) { obj.urlPdf = value; } }, metadata: _metadata }, _urlPdf_initializers, _urlPdf_extraInitializers);
        __esDecorate(null, null, _procesado_decorators, { kind: "field", name: "procesado", static: false, private: false, access: { has: function (obj) { return "procesado" in obj; }, get: function (obj) { return obj.procesado; }, set: function (obj, value) { obj.procesado = value; } }, metadata: _metadata }, _procesado_initializers, _procesado_extraInitializers);
        __esDecorate(null, null, _detectadoEn_decorators, { kind: "field", name: "detectadoEn", static: false, private: false, access: { has: function (obj) { return "detectadoEn" in obj; }, get: function (obj) { return obj.detectadoEn; }, set: function (obj, value) { obj.detectadoEn = value; } }, metadata: _metadata }, _detectadoEn_initializers, _detectadoEn_extraInitializers);
        __esDecorate(null, null, _convocatoria_decorators, { kind: "field", name: "convocatoria", static: false, private: false, access: { has: function (obj) { return "convocatoria" in obj; }, get: function (obj) { return obj.convocatoria; }, set: function (obj, value) { obj.convocatoria = value; } }, metadata: _metadata }, _convocatoria_initializers, _convocatoria_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DocumentoConvocatoria = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DocumentoConvocatoria = _classThis;
}();
exports.DocumentoConvocatoria = DocumentoConvocatoria;
