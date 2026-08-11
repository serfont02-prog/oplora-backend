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
exports.NotaArticulo = void 0;
var typeorm_1 = require("typeorm");
var articulo_entity_1 = require("./articulo.entity");
var usuario_entity_1 = require("../usuario/usuario.entity");
var tema_entity_1 = require("../tema/tema.entity");
var NotaArticulo = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('notas_articulo')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _contenido_decorators;
    var _contenido_initializers = [];
    var _contenido_extraInitializers = [];
    var _fechaRepaso_decorators;
    var _fechaRepaso_initializers = [];
    var _fechaRepaso_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var _actualizadoEn_decorators;
    var _actualizadoEn_initializers = [];
    var _actualizadoEn_extraInitializers = [];
    var _articulo_decorators;
    var _articulo_initializers = [];
    var _articulo_extraInitializers = [];
    var _usuario_decorators;
    var _usuario_initializers = [];
    var _usuario_extraInitializers = [];
    var _tema_decorators;
    var _tema_initializers = [];
    var _tema_extraInitializers = [];
    var NotaArticulo = _classThis = /** @class */ (function () {
        function NotaArticulo_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.contenido = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _contenido_initializers, void 0));
            this.fechaRepaso = (__runInitializers(this, _contenido_extraInitializers), __runInitializers(this, _fechaRepaso_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _fechaRepaso_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            this.actualizadoEn = (__runInitializers(this, _creadoEn_extraInitializers), __runInitializers(this, _actualizadoEn_initializers, void 0));
            this.articulo = (__runInitializers(this, _actualizadoEn_extraInitializers), __runInitializers(this, _articulo_initializers, void 0));
            this.usuario = (__runInitializers(this, _articulo_extraInitializers), __runInitializers(this, _usuario_initializers, void 0));
            this.tema = (__runInitializers(this, _usuario_extraInitializers), __runInitializers(this, _tema_initializers, void 0));
            __runInitializers(this, _tema_extraInitializers);
        }
        return NotaArticulo_1;
    }());
    __setFunctionName(_classThis, "NotaArticulo");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _contenido_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _fechaRepaso_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _actualizadoEn_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        _articulo_decorators = [(0, typeorm_1.ManyToOne)(function () { return articulo_entity_1.Articulo; })];
        _usuario_decorators = [(0, typeorm_1.ManyToOne)(function () { return usuario_entity_1.Usuario; })];
        _tema_decorators = [(0, typeorm_1.ManyToOne)(function () { return tema_entity_1.Tema; }, { nullable: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _contenido_decorators, { kind: "field", name: "contenido", static: false, private: false, access: { has: function (obj) { return "contenido" in obj; }, get: function (obj) { return obj.contenido; }, set: function (obj, value) { obj.contenido = value; } }, metadata: _metadata }, _contenido_initializers, _contenido_extraInitializers);
        __esDecorate(null, null, _fechaRepaso_decorators, { kind: "field", name: "fechaRepaso", static: false, private: false, access: { has: function (obj) { return "fechaRepaso" in obj; }, get: function (obj) { return obj.fechaRepaso; }, set: function (obj, value) { obj.fechaRepaso = value; } }, metadata: _metadata }, _fechaRepaso_initializers, _fechaRepaso_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, null, _actualizadoEn_decorators, { kind: "field", name: "actualizadoEn", static: false, private: false, access: { has: function (obj) { return "actualizadoEn" in obj; }, get: function (obj) { return obj.actualizadoEn; }, set: function (obj, value) { obj.actualizadoEn = value; } }, metadata: _metadata }, _actualizadoEn_initializers, _actualizadoEn_extraInitializers);
        __esDecorate(null, null, _articulo_decorators, { kind: "field", name: "articulo", static: false, private: false, access: { has: function (obj) { return "articulo" in obj; }, get: function (obj) { return obj.articulo; }, set: function (obj, value) { obj.articulo = value; } }, metadata: _metadata }, _articulo_initializers, _articulo_extraInitializers);
        __esDecorate(null, null, _usuario_decorators, { kind: "field", name: "usuario", static: false, private: false, access: { has: function (obj) { return "usuario" in obj; }, get: function (obj) { return obj.usuario; }, set: function (obj, value) { obj.usuario = value; } }, metadata: _metadata }, _usuario_initializers, _usuario_extraInitializers);
        __esDecorate(null, null, _tema_decorators, { kind: "field", name: "tema", static: false, private: false, access: { has: function (obj) { return "tema" in obj; }, get: function (obj) { return obj.tema; }, set: function (obj, value) { obj.tema = value; } }, metadata: _metadata }, _tema_initializers, _tema_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NotaArticulo = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NotaArticulo = _classThis;
}();
exports.NotaArticulo = NotaArticulo;
