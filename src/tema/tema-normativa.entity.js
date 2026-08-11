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
exports.TemaNormativa = exports.NivelNormativa = void 0;
var typeorm_1 = require("typeorm");
var tema_entity_1 = require("./tema.entity");
var articulo_entity_1 = require("../normativa/articulo.entity");
var capitulo_entity_1 = require("../normativa/capitulo.entity");
var titulo_entity_1 = require("../normativa/titulo.entity");
var version_ley_entity_1 = require("../ley/version-ley.entity");
var NivelNormativa;
(function (NivelNormativa) {
    NivelNormativa["ARTICULO"] = "articulo";
    NivelNormativa["CAPITULO"] = "capitulo";
    NivelNormativa["TITULO"] = "titulo";
    NivelNormativa["VERSION_LEY"] = "version_ley";
})(NivelNormativa || (exports.NivelNormativa = NivelNormativa = {}));
var TemaNormativa = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('temas_normativa')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _nivel_decorators;
    var _nivel_initializers = [];
    var _nivel_extraInitializers = [];
    var _tema_decorators;
    var _tema_initializers = [];
    var _tema_extraInitializers = [];
    var _articulo_decorators;
    var _articulo_initializers = [];
    var _articulo_extraInitializers = [];
    var _capitulo_decorators;
    var _capitulo_initializers = [];
    var _capitulo_extraInitializers = [];
    var _titulo_decorators;
    var _titulo_initializers = [];
    var _titulo_extraInitializers = [];
    var _versionLey_decorators;
    var _versionLey_initializers = [];
    var _versionLey_extraInitializers = [];
    var TemaNormativa = _classThis = /** @class */ (function () {
        function TemaNormativa_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.nivel = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _nivel_initializers, void 0));
            this.tema = (__runInitializers(this, _nivel_extraInitializers), __runInitializers(this, _tema_initializers, void 0));
            this.articulo = (__runInitializers(this, _tema_extraInitializers), __runInitializers(this, _articulo_initializers, void 0));
            this.capitulo = (__runInitializers(this, _articulo_extraInitializers), __runInitializers(this, _capitulo_initializers, void 0));
            this.titulo = (__runInitializers(this, _capitulo_extraInitializers), __runInitializers(this, _titulo_initializers, void 0));
            this.versionLey = (__runInitializers(this, _titulo_extraInitializers), __runInitializers(this, _versionLey_initializers, void 0));
            __runInitializers(this, _versionLey_extraInitializers);
        }
        return TemaNormativa_1;
    }());
    __setFunctionName(_classThis, "TemaNormativa");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _nivel_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: NivelNormativa })];
        _tema_decorators = [(0, typeorm_1.ManyToOne)(function () { return tema_entity_1.Tema; }, function (t) { return t.normativas; })];
        _articulo_decorators = [(0, typeorm_1.ManyToOne)(function () { return articulo_entity_1.Articulo; }, { nullable: true })];
        _capitulo_decorators = [(0, typeorm_1.ManyToOne)(function () { return capitulo_entity_1.Capitulo; }, { nullable: true })];
        _titulo_decorators = [(0, typeorm_1.ManyToOne)(function () { return titulo_entity_1.Titulo; }, { nullable: true })];
        _versionLey_decorators = [(0, typeorm_1.ManyToOne)(function () { return version_ley_entity_1.VersionLey; }, { nullable: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _nivel_decorators, { kind: "field", name: "nivel", static: false, private: false, access: { has: function (obj) { return "nivel" in obj; }, get: function (obj) { return obj.nivel; }, set: function (obj, value) { obj.nivel = value; } }, metadata: _metadata }, _nivel_initializers, _nivel_extraInitializers);
        __esDecorate(null, null, _tema_decorators, { kind: "field", name: "tema", static: false, private: false, access: { has: function (obj) { return "tema" in obj; }, get: function (obj) { return obj.tema; }, set: function (obj, value) { obj.tema = value; } }, metadata: _metadata }, _tema_initializers, _tema_extraInitializers);
        __esDecorate(null, null, _articulo_decorators, { kind: "field", name: "articulo", static: false, private: false, access: { has: function (obj) { return "articulo" in obj; }, get: function (obj) { return obj.articulo; }, set: function (obj, value) { obj.articulo = value; } }, metadata: _metadata }, _articulo_initializers, _articulo_extraInitializers);
        __esDecorate(null, null, _capitulo_decorators, { kind: "field", name: "capitulo", static: false, private: false, access: { has: function (obj) { return "capitulo" in obj; }, get: function (obj) { return obj.capitulo; }, set: function (obj, value) { obj.capitulo = value; } }, metadata: _metadata }, _capitulo_initializers, _capitulo_extraInitializers);
        __esDecorate(null, null, _titulo_decorators, { kind: "field", name: "titulo", static: false, private: false, access: { has: function (obj) { return "titulo" in obj; }, get: function (obj) { return obj.titulo; }, set: function (obj, value) { obj.titulo = value; } }, metadata: _metadata }, _titulo_initializers, _titulo_extraInitializers);
        __esDecorate(null, null, _versionLey_decorators, { kind: "field", name: "versionLey", static: false, private: false, access: { has: function (obj) { return "versionLey" in obj; }, get: function (obj) { return obj.versionLey; }, set: function (obj, value) { obj.versionLey = value; } }, metadata: _metadata }, _versionLey_initializers, _versionLey_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TemaNormativa = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TemaNormativa = _classThis;
}();
exports.TemaNormativa = TemaNormativa;
