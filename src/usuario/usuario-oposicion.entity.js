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
exports.UsuarioOposicion = void 0;
var typeorm_1 = require("typeorm");
var usuario_entity_1 = require("./usuario.entity");
var oposicion_entity_1 = require("../oposicion/oposicion.entity");
var UsuarioOposicion = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('usuario_oposiciones')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _usuario_decorators;
    var _usuario_initializers = [];
    var _usuario_extraInitializers = [];
    var _oposicion_decorators;
    var _oposicion_initializers = [];
    var _oposicion_extraInitializers = [];
    var _activa_decorators;
    var _activa_initializers = [];
    var _activa_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var UsuarioOposicion = _classThis = /** @class */ (function () {
        function UsuarioOposicion_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.usuario = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _usuario_initializers, void 0));
            this.oposicion = (__runInitializers(this, _usuario_extraInitializers), __runInitializers(this, _oposicion_initializers, void 0));
            this.activa = (__runInitializers(this, _oposicion_extraInitializers), __runInitializers(this, _activa_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _activa_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            __runInitializers(this, _creadoEn_extraInitializers);
        }
        return UsuarioOposicion_1;
    }());
    __setFunctionName(_classThis, "UsuarioOposicion");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _usuario_decorators = [(0, typeorm_1.ManyToOne)(function () { return usuario_entity_1.Usuario; }, function (usuario) { return usuario.usuarioOposiciones; }, { onDelete: 'CASCADE' }), (0, typeorm_1.JoinColumn)({ name: 'usuario_id' })];
        _oposicion_decorators = [(0, typeorm_1.ManyToOne)(function () { return oposicion_entity_1.Oposicion; }, function (oposicion) { return oposicion.usuarioOposiciones; }, { onDelete: 'CASCADE' }), (0, typeorm_1.JoinColumn)({ name: 'oposicion_id' })];
        _activa_decorators = [(0, typeorm_1.Column)({ default: false })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _usuario_decorators, { kind: "field", name: "usuario", static: false, private: false, access: { has: function (obj) { return "usuario" in obj; }, get: function (obj) { return obj.usuario; }, set: function (obj, value) { obj.usuario = value; } }, metadata: _metadata }, _usuario_initializers, _usuario_extraInitializers);
        __esDecorate(null, null, _oposicion_decorators, { kind: "field", name: "oposicion", static: false, private: false, access: { has: function (obj) { return "oposicion" in obj; }, get: function (obj) { return obj.oposicion; }, set: function (obj, value) { obj.oposicion = value; } }, metadata: _metadata }, _oposicion_initializers, _oposicion_extraInitializers);
        __esDecorate(null, null, _activa_decorators, { kind: "field", name: "activa", static: false, private: false, access: { has: function (obj) { return "activa" in obj; }, get: function (obj) { return obj.activa; }, set: function (obj, value) { obj.activa = value; } }, metadata: _metadata }, _activa_initializers, _activa_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UsuarioOposicion = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UsuarioOposicion = _classThis;
}();
exports.UsuarioOposicion = UsuarioOposicion;
