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
exports.Titulo = void 0;
var typeorm_1 = require("typeorm");
var version_ley_entity_1 = require("../ley/version-ley.entity");
var capitulo_entity_1 = require("./capitulo.entity");
var libro_entity_1 = require("./libro.entity");
var Titulo = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('titulos')];
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
    var _versionLey_decorators;
    var _versionLey_initializers = [];
    var _versionLey_extraInitializers = [];
    var _libro_decorators;
    var _libro_initializers = [];
    var _libro_extraInitializers = [];
    var _capitulos_decorators;
    var _capitulos_initializers = [];
    var _capitulos_extraInitializers = [];
    var Titulo = _classThis = /** @class */ (function () {
        function Titulo_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.orden = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _orden_initializers, void 0));
            this.numero = (__runInitializers(this, _orden_extraInitializers), __runInitializers(this, _numero_initializers, void 0));
            this.nombre = (__runInitializers(this, _numero_extraInitializers), __runInitializers(this, _nombre_initializers, void 0));
            this.versionLey = (__runInitializers(this, _nombre_extraInitializers), __runInitializers(this, _versionLey_initializers, void 0));
            this.libro = (__runInitializers(this, _versionLey_extraInitializers), __runInitializers(this, _libro_initializers, void 0));
            this.capitulos = (__runInitializers(this, _libro_extraInitializers), __runInitializers(this, _capitulos_initializers, void 0));
            __runInitializers(this, _capitulos_extraInitializers);
        }
        return Titulo_1;
    }());
    __setFunctionName(_classThis, "Titulo");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _orden_decorators = [(0, typeorm_1.Column)()];
        _numero_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _nombre_decorators = [(0, typeorm_1.Column)()];
        _versionLey_decorators = [(0, typeorm_1.ManyToOne)(function () { return version_ley_entity_1.VersionLey; }, function (v) { return v.titulos; }, { nullable: true })];
        _libro_decorators = [(0, typeorm_1.ManyToOne)(function () { return libro_entity_1.Libro; }, function (l) { return l.titulos; }, { nullable: true })];
        _capitulos_decorators = [(0, typeorm_1.OneToMany)(function () { return capitulo_entity_1.Capitulo; }, function (c) { return c.tituloRef; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _orden_decorators, { kind: "field", name: "orden", static: false, private: false, access: { has: function (obj) { return "orden" in obj; }, get: function (obj) { return obj.orden; }, set: function (obj, value) { obj.orden = value; } }, metadata: _metadata }, _orden_initializers, _orden_extraInitializers);
        __esDecorate(null, null, _numero_decorators, { kind: "field", name: "numero", static: false, private: false, access: { has: function (obj) { return "numero" in obj; }, get: function (obj) { return obj.numero; }, set: function (obj, value) { obj.numero = value; } }, metadata: _metadata }, _numero_initializers, _numero_extraInitializers);
        __esDecorate(null, null, _nombre_decorators, { kind: "field", name: "nombre", static: false, private: false, access: { has: function (obj) { return "nombre" in obj; }, get: function (obj) { return obj.nombre; }, set: function (obj, value) { obj.nombre = value; } }, metadata: _metadata }, _nombre_initializers, _nombre_extraInitializers);
        __esDecorate(null, null, _versionLey_decorators, { kind: "field", name: "versionLey", static: false, private: false, access: { has: function (obj) { return "versionLey" in obj; }, get: function (obj) { return obj.versionLey; }, set: function (obj, value) { obj.versionLey = value; } }, metadata: _metadata }, _versionLey_initializers, _versionLey_extraInitializers);
        __esDecorate(null, null, _libro_decorators, { kind: "field", name: "libro", static: false, private: false, access: { has: function (obj) { return "libro" in obj; }, get: function (obj) { return obj.libro; }, set: function (obj, value) { obj.libro = value; } }, metadata: _metadata }, _libro_initializers, _libro_extraInitializers);
        __esDecorate(null, null, _capitulos_decorators, { kind: "field", name: "capitulos", static: false, private: false, access: { has: function (obj) { return "capitulos" in obj; }, get: function (obj) { return obj.capitulos; }, set: function (obj, value) { obj.capitulos = value; } }, metadata: _metadata }, _capitulos_initializers, _capitulos_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Titulo = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Titulo = _classThis;
}();
exports.Titulo = Titulo;
