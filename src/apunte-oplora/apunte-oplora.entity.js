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
exports.ApunteOplora = void 0;
var typeorm_1 = require("typeorm");
var tema_entity_1 = require("../tema/tema.entity");
var ApunteOplora = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('apuntes_oplora')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _titulo_decorators;
    var _titulo_initializers = [];
    var _titulo_extraInitializers = [];
    var _descripcion_decorators;
    var _descripcion_initializers = [];
    var _descripcion_extraInitializers = [];
    var _urlArchivo_decorators;
    var _urlArchivo_initializers = [];
    var _urlArchivo_extraInitializers = [];
    var _tipo_decorators;
    var _tipo_initializers = [];
    var _tipo_extraInitializers = [];
    var _orden_decorators;
    var _orden_initializers = [];
    var _orden_extraInitializers = [];
    var _activo_decorators;
    var _activo_initializers = [];
    var _activo_extraInitializers = [];
    var _paginas_decorators;
    var _paginas_initializers = [];
    var _paginas_extraInitializers = [];
    var _tamanoBytes_decorators;
    var _tamanoBytes_initializers = [];
    var _tamanoBytes_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var _tema_decorators;
    var _tema_initializers = [];
    var _tema_extraInitializers = [];
    var ApunteOplora = _classThis = /** @class */ (function () {
        function ApunteOplora_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.titulo = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _titulo_initializers, void 0));
            this.descripcion = (__runInitializers(this, _titulo_extraInitializers), __runInitializers(this, _descripcion_initializers, void 0));
            this.urlArchivo = (__runInitializers(this, _descripcion_extraInitializers), __runInitializers(this, _urlArchivo_initializers, void 0));
            this.tipo = (__runInitializers(this, _urlArchivo_extraInitializers), __runInitializers(this, _tipo_initializers, void 0));
            this.orden = (__runInitializers(this, _tipo_extraInitializers), __runInitializers(this, _orden_initializers, void 0));
            this.activo = (__runInitializers(this, _orden_extraInitializers), __runInitializers(this, _activo_initializers, void 0));
            this.paginas = (__runInitializers(this, _activo_extraInitializers), __runInitializers(this, _paginas_initializers, void 0));
            this.tamanoBytes = (__runInitializers(this, _paginas_extraInitializers), __runInitializers(this, _tamanoBytes_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _tamanoBytes_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            this.tema = (__runInitializers(this, _creadoEn_extraInitializers), __runInitializers(this, _tema_initializers, void 0));
            __runInitializers(this, _tema_extraInitializers);
        }
        return ApunteOplora_1;
    }());
    __setFunctionName(_classThis, "ApunteOplora");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _titulo_decorators = [(0, typeorm_1.Column)()];
        _descripcion_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _urlArchivo_decorators = [(0, typeorm_1.Column)()];
        _tipo_decorators = [(0, typeorm_1.Column)({ default: 'pdf' })];
        _orden_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _activo_decorators = [(0, typeorm_1.Column)({ default: true })];
        _paginas_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _tamanoBytes_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _tema_decorators = [(0, typeorm_1.ManyToOne)(function () { return tema_entity_1.Tema; }, { nullable: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _titulo_decorators, { kind: "field", name: "titulo", static: false, private: false, access: { has: function (obj) { return "titulo" in obj; }, get: function (obj) { return obj.titulo; }, set: function (obj, value) { obj.titulo = value; } }, metadata: _metadata }, _titulo_initializers, _titulo_extraInitializers);
        __esDecorate(null, null, _descripcion_decorators, { kind: "field", name: "descripcion", static: false, private: false, access: { has: function (obj) { return "descripcion" in obj; }, get: function (obj) { return obj.descripcion; }, set: function (obj, value) { obj.descripcion = value; } }, metadata: _metadata }, _descripcion_initializers, _descripcion_extraInitializers);
        __esDecorate(null, null, _urlArchivo_decorators, { kind: "field", name: "urlArchivo", static: false, private: false, access: { has: function (obj) { return "urlArchivo" in obj; }, get: function (obj) { return obj.urlArchivo; }, set: function (obj, value) { obj.urlArchivo = value; } }, metadata: _metadata }, _urlArchivo_initializers, _urlArchivo_extraInitializers);
        __esDecorate(null, null, _tipo_decorators, { kind: "field", name: "tipo", static: false, private: false, access: { has: function (obj) { return "tipo" in obj; }, get: function (obj) { return obj.tipo; }, set: function (obj, value) { obj.tipo = value; } }, metadata: _metadata }, _tipo_initializers, _tipo_extraInitializers);
        __esDecorate(null, null, _orden_decorators, { kind: "field", name: "orden", static: false, private: false, access: { has: function (obj) { return "orden" in obj; }, get: function (obj) { return obj.orden; }, set: function (obj, value) { obj.orden = value; } }, metadata: _metadata }, _orden_initializers, _orden_extraInitializers);
        __esDecorate(null, null, _activo_decorators, { kind: "field", name: "activo", static: false, private: false, access: { has: function (obj) { return "activo" in obj; }, get: function (obj) { return obj.activo; }, set: function (obj, value) { obj.activo = value; } }, metadata: _metadata }, _activo_initializers, _activo_extraInitializers);
        __esDecorate(null, null, _paginas_decorators, { kind: "field", name: "paginas", static: false, private: false, access: { has: function (obj) { return "paginas" in obj; }, get: function (obj) { return obj.paginas; }, set: function (obj, value) { obj.paginas = value; } }, metadata: _metadata }, _paginas_initializers, _paginas_extraInitializers);
        __esDecorate(null, null, _tamanoBytes_decorators, { kind: "field", name: "tamanoBytes", static: false, private: false, access: { has: function (obj) { return "tamanoBytes" in obj; }, get: function (obj) { return obj.tamanoBytes; }, set: function (obj, value) { obj.tamanoBytes = value; } }, metadata: _metadata }, _tamanoBytes_initializers, _tamanoBytes_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, null, _tema_decorators, { kind: "field", name: "tema", static: false, private: false, access: { has: function (obj) { return "tema" in obj; }, get: function (obj) { return obj.tema; }, set: function (obj, value) { obj.tema = value; } }, metadata: _metadata }, _tema_initializers, _tema_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ApunteOplora = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ApunteOplora = _classThis;
}();
exports.ApunteOplora = ApunteOplora;
