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
exports.Capitulo = void 0;
var typeorm_1 = require("typeorm");
var titulo_entity_1 = require("./titulo.entity");
var articulo_entity_1 = require("./articulo.entity");
var seccion_entity_1 = require("./seccion.entity");
var Capitulo = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('capitulos')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _orden_decorators;
    var _orden_initializers = [];
    var _orden_extraInitializers = [];
    var _numero_decorators;
    var _numero_initializers = [];
    var _numero_extraInitializers = [];
    var _nombre_decorators;
    var _nombre_initializers = [];
    var _nombre_extraInitializers = [];
    var _tituloRef_decorators;
    var _tituloRef_initializers = [];
    var _tituloRef_extraInitializers = [];
    var _articulos_decorators;
    var _articulos_initializers = [];
    var _articulos_extraInitializers = [];
    var _secciones_decorators;
    var _secciones_initializers = [];
    var _secciones_extraInitializers = [];
    var Capitulo = _classThis = /** @class */ (function () {
        function Capitulo_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.orden = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _orden_initializers, void 0));
            this.numero = (__runInitializers(this, _orden_extraInitializers), __runInitializers(this, _numero_initializers, void 0));
            this.nombre = (__runInitializers(this, _numero_extraInitializers), __runInitializers(this, _nombre_initializers, void 0));
            this.tituloRef = (__runInitializers(this, _nombre_extraInitializers), __runInitializers(this, _tituloRef_initializers, void 0));
            this.articulos = (__runInitializers(this, _tituloRef_extraInitializers), __runInitializers(this, _articulos_initializers, void 0));
            this.secciones = (__runInitializers(this, _articulos_extraInitializers), __runInitializers(this, _secciones_initializers, void 0));
            __runInitializers(this, _secciones_extraInitializers);
        }
        return Capitulo_1;
    }());
    __setFunctionName(_classThis, "Capitulo");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _orden_decorators = [(0, typeorm_1.Column)()];
        _numero_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _nombre_decorators = [(0, typeorm_1.Column)()];
        _tituloRef_decorators = [(0, typeorm_1.ManyToOne)(function () { return titulo_entity_1.Titulo; }, function (t) { return t.capitulos; })];
        _articulos_decorators = [(0, typeorm_1.OneToMany)(function () { return articulo_entity_1.Articulo; }, function (a) { return a.capitulo; })];
        _secciones_decorators = [(0, typeorm_1.OneToMany)(function () { return seccion_entity_1.Seccion; }, function (s) { return s.capitulo; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _orden_decorators, { kind: "field", name: "orden", static: false, private: false, access: { has: function (obj) { return "orden" in obj; }, get: function (obj) { return obj.orden; }, set: function (obj, value) { obj.orden = value; } }, metadata: _metadata }, _orden_initializers, _orden_extraInitializers);
        __esDecorate(null, null, _numero_decorators, { kind: "field", name: "numero", static: false, private: false, access: { has: function (obj) { return "numero" in obj; }, get: function (obj) { return obj.numero; }, set: function (obj, value) { obj.numero = value; } }, metadata: _metadata }, _numero_initializers, _numero_extraInitializers);
        __esDecorate(null, null, _nombre_decorators, { kind: "field", name: "nombre", static: false, private: false, access: { has: function (obj) { return "nombre" in obj; }, get: function (obj) { return obj.nombre; }, set: function (obj, value) { obj.nombre = value; } }, metadata: _metadata }, _nombre_initializers, _nombre_extraInitializers);
        __esDecorate(null, null, _tituloRef_decorators, { kind: "field", name: "tituloRef", static: false, private: false, access: { has: function (obj) { return "tituloRef" in obj; }, get: function (obj) { return obj.tituloRef; }, set: function (obj, value) { obj.tituloRef = value; } }, metadata: _metadata }, _tituloRef_initializers, _tituloRef_extraInitializers);
        __esDecorate(null, null, _articulos_decorators, { kind: "field", name: "articulos", static: false, private: false, access: { has: function (obj) { return "articulos" in obj; }, get: function (obj) { return obj.articulos; }, set: function (obj, value) { obj.articulos = value; } }, metadata: _metadata }, _articulos_initializers, _articulos_extraInitializers);
        __esDecorate(null, null, _secciones_decorators, { kind: "field", name: "secciones", static: false, private: false, access: { has: function (obj) { return "secciones" in obj; }, get: function (obj) { return obj.secciones; }, set: function (obj, value) { obj.secciones = value; } }, metadata: _metadata }, _secciones_initializers, _secciones_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Capitulo = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Capitulo = _classThis;
}();
exports.Capitulo = Capitulo;
