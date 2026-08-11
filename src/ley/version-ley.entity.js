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
exports.VersionLey = exports.TipoCambio = void 0;
var typeorm_1 = require("typeorm");
var ley_entity_1 = require("./ley.entity");
var titulo_entity_1 = require("../normativa/titulo.entity");
var libro_entity_1 = require("../normativa/libro.entity");
var diff_version_entity_1 = require("./diff-version.entity");
var oposicion_ley_entity_1 = require("../ley/oposicion-ley.entity");
var TipoCambio;
(function (TipoCambio) {
    TipoCambio["INICIAL"] = "inicial";
    TipoCambio["MODIFICACION_PARCIAL"] = "modificacion_parcial";
    TipoCambio["MODIFICACION_TOTAL"] = "modificacion_total";
    TipoCambio["DEROGACION"] = "derogacion";
})(TipoCambio || (exports.TipoCambio = TipoCambio = {}));
var VersionLey = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('versiones_ley')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _version_decorators;
    var _version_initializers = [];
    var _version_extraInitializers = [];
    var _referenciaBoe_decorators;
    var _referenciaBoe_initializers = [];
    var _referenciaBoe_extraInitializers = [];
    var _tipoNorma_decorators;
    var _tipoNorma_initializers = [];
    var _tipoNorma_extraInitializers = [];
    var _fechaPublicacion_decorators;
    var _fechaPublicacion_initializers = [];
    var _fechaPublicacion_extraInitializers = [];
    var _fechaVigencia_decorators;
    var _fechaVigencia_initializers = [];
    var _fechaVigencia_extraInitializers = [];
    var _tipoCambio_decorators;
    var _tipoCambio_initializers = [];
    var _tipoCambio_extraInitializers = [];
    var _activa_decorators;
    var _activa_initializers = [];
    var _activa_extraInitializers = [];
    var _textoCompleto_decorators;
    var _textoCompleto_initializers = [];
    var _textoCompleto_extraInitializers = [];
    var _notas_decorators;
    var _notas_initializers = [];
    var _notas_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var _ley_decorators;
    var _ley_initializers = [];
    var _ley_extraInitializers = [];
    var _titulos_decorators;
    var _titulos_initializers = [];
    var _titulos_extraInitializers = [];
    var _libros_decorators;
    var _libros_initializers = [];
    var _libros_extraInitializers = [];
    var _diffs_decorators;
    var _diffs_initializers = [];
    var _diffs_extraInitializers = [];
    var _oposicionLeyes_decorators;
    var _oposicionLeyes_initializers = [];
    var _oposicionLeyes_extraInitializers = [];
    var VersionLey = _classThis = /** @class */ (function () {
        function VersionLey_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.version = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _version_initializers, void 0));
            this.referenciaBoe = (__runInitializers(this, _version_extraInitializers), __runInitializers(this, _referenciaBoe_initializers, void 0));
            this.tipoNorma = (__runInitializers(this, _referenciaBoe_extraInitializers), __runInitializers(this, _tipoNorma_initializers, void 0));
            this.fechaPublicacion = (__runInitializers(this, _tipoNorma_extraInitializers), __runInitializers(this, _fechaPublicacion_initializers, void 0));
            this.fechaVigencia = (__runInitializers(this, _fechaPublicacion_extraInitializers), __runInitializers(this, _fechaVigencia_initializers, void 0));
            this.tipoCambio = (__runInitializers(this, _fechaVigencia_extraInitializers), __runInitializers(this, _tipoCambio_initializers, void 0));
            this.activa = (__runInitializers(this, _tipoCambio_extraInitializers), __runInitializers(this, _activa_initializers, void 0));
            this.textoCompleto = (__runInitializers(this, _activa_extraInitializers), __runInitializers(this, _textoCompleto_initializers, void 0));
            this.notas = (__runInitializers(this, _textoCompleto_extraInitializers), __runInitializers(this, _notas_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _notas_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            this.ley = (__runInitializers(this, _creadoEn_extraInitializers), __runInitializers(this, _ley_initializers, void 0));
            this.titulos = (__runInitializers(this, _ley_extraInitializers), __runInitializers(this, _titulos_initializers, void 0));
            this.libros = (__runInitializers(this, _titulos_extraInitializers), __runInitializers(this, _libros_initializers, void 0));
            this.diffs = (__runInitializers(this, _libros_extraInitializers), __runInitializers(this, _diffs_initializers, void 0));
            this.oposicionLeyes = (__runInitializers(this, _diffs_extraInitializers), __runInitializers(this, _oposicionLeyes_initializers, void 0));
            __runInitializers(this, _oposicionLeyes_extraInitializers);
        }
        return VersionLey_1;
    }());
    __setFunctionName(_classThis, "VersionLey");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _version_decorators = [(0, typeorm_1.Column)()];
        _referenciaBoe_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _tipoNorma_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _fechaPublicacion_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _fechaVigencia_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _tipoCambio_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: TipoCambio, default: TipoCambio.INICIAL })];
        _activa_decorators = [(0, typeorm_1.Column)({ default: false })];
        _textoCompleto_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _notas_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _ley_decorators = [(0, typeorm_1.ManyToOne)(function () { return ley_entity_1.Ley; }, function (l) { return l.versiones; })];
        _titulos_decorators = [(0, typeorm_1.OneToMany)(function () { return titulo_entity_1.Titulo; }, function (t) { return t.versionLey; })];
        _libros_decorators = [(0, typeorm_1.OneToMany)(function () { return libro_entity_1.Libro; }, function (l) { return l.versionLey; })];
        _diffs_decorators = [(0, typeorm_1.OneToMany)(function () { return diff_version_entity_1.DiffVersion; }, function (d) { return d.versionNueva; })];
        _oposicionLeyes_decorators = [(0, typeorm_1.OneToMany)(function () { return oposicion_ley_entity_1.OposicionLey; }, function (ol) { return ol.versionLey; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _version_decorators, { kind: "field", name: "version", static: false, private: false, access: { has: function (obj) { return "version" in obj; }, get: function (obj) { return obj.version; }, set: function (obj, value) { obj.version = value; } }, metadata: _metadata }, _version_initializers, _version_extraInitializers);
        __esDecorate(null, null, _referenciaBoe_decorators, { kind: "field", name: "referenciaBoe", static: false, private: false, access: { has: function (obj) { return "referenciaBoe" in obj; }, get: function (obj) { return obj.referenciaBoe; }, set: function (obj, value) { obj.referenciaBoe = value; } }, metadata: _metadata }, _referenciaBoe_initializers, _referenciaBoe_extraInitializers);
        __esDecorate(null, null, _tipoNorma_decorators, { kind: "field", name: "tipoNorma", static: false, private: false, access: { has: function (obj) { return "tipoNorma" in obj; }, get: function (obj) { return obj.tipoNorma; }, set: function (obj, value) { obj.tipoNorma = value; } }, metadata: _metadata }, _tipoNorma_initializers, _tipoNorma_extraInitializers);
        __esDecorate(null, null, _fechaPublicacion_decorators, { kind: "field", name: "fechaPublicacion", static: false, private: false, access: { has: function (obj) { return "fechaPublicacion" in obj; }, get: function (obj) { return obj.fechaPublicacion; }, set: function (obj, value) { obj.fechaPublicacion = value; } }, metadata: _metadata }, _fechaPublicacion_initializers, _fechaPublicacion_extraInitializers);
        __esDecorate(null, null, _fechaVigencia_decorators, { kind: "field", name: "fechaVigencia", static: false, private: false, access: { has: function (obj) { return "fechaVigencia" in obj; }, get: function (obj) { return obj.fechaVigencia; }, set: function (obj, value) { obj.fechaVigencia = value; } }, metadata: _metadata }, _fechaVigencia_initializers, _fechaVigencia_extraInitializers);
        __esDecorate(null, null, _tipoCambio_decorators, { kind: "field", name: "tipoCambio", static: false, private: false, access: { has: function (obj) { return "tipoCambio" in obj; }, get: function (obj) { return obj.tipoCambio; }, set: function (obj, value) { obj.tipoCambio = value; } }, metadata: _metadata }, _tipoCambio_initializers, _tipoCambio_extraInitializers);
        __esDecorate(null, null, _activa_decorators, { kind: "field", name: "activa", static: false, private: false, access: { has: function (obj) { return "activa" in obj; }, get: function (obj) { return obj.activa; }, set: function (obj, value) { obj.activa = value; } }, metadata: _metadata }, _activa_initializers, _activa_extraInitializers);
        __esDecorate(null, null, _textoCompleto_decorators, { kind: "field", name: "textoCompleto", static: false, private: false, access: { has: function (obj) { return "textoCompleto" in obj; }, get: function (obj) { return obj.textoCompleto; }, set: function (obj, value) { obj.textoCompleto = value; } }, metadata: _metadata }, _textoCompleto_initializers, _textoCompleto_extraInitializers);
        __esDecorate(null, null, _notas_decorators, { kind: "field", name: "notas", static: false, private: false, access: { has: function (obj) { return "notas" in obj; }, get: function (obj) { return obj.notas; }, set: function (obj, value) { obj.notas = value; } }, metadata: _metadata }, _notas_initializers, _notas_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, null, _ley_decorators, { kind: "field", name: "ley", static: false, private: false, access: { has: function (obj) { return "ley" in obj; }, get: function (obj) { return obj.ley; }, set: function (obj, value) { obj.ley = value; } }, metadata: _metadata }, _ley_initializers, _ley_extraInitializers);
        __esDecorate(null, null, _titulos_decorators, { kind: "field", name: "titulos", static: false, private: false, access: { has: function (obj) { return "titulos" in obj; }, get: function (obj) { return obj.titulos; }, set: function (obj, value) { obj.titulos = value; } }, metadata: _metadata }, _titulos_initializers, _titulos_extraInitializers);
        __esDecorate(null, null, _libros_decorators, { kind: "field", name: "libros", static: false, private: false, access: { has: function (obj) { return "libros" in obj; }, get: function (obj) { return obj.libros; }, set: function (obj, value) { obj.libros = value; } }, metadata: _metadata }, _libros_initializers, _libros_extraInitializers);
        __esDecorate(null, null, _diffs_decorators, { kind: "field", name: "diffs", static: false, private: false, access: { has: function (obj) { return "diffs" in obj; }, get: function (obj) { return obj.diffs; }, set: function (obj, value) { obj.diffs = value; } }, metadata: _metadata }, _diffs_initializers, _diffs_extraInitializers);
        __esDecorate(null, null, _oposicionLeyes_decorators, { kind: "field", name: "oposicionLeyes", static: false, private: false, access: { has: function (obj) { return "oposicionLeyes" in obj; }, get: function (obj) { return obj.oposicionLeyes; }, set: function (obj, value) { obj.oposicionLeyes = value; } }, metadata: _metadata }, _oposicionLeyes_initializers, _oposicionLeyes_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        VersionLey = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return VersionLey = _classThis;
}();
exports.VersionLey = VersionLey;
