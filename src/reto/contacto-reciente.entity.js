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
exports.ContactoReciente = void 0;
var typeorm_1 = require("typeorm");
var usuario_entity_1 = require("../usuario/usuario.entity");
var ContactoReciente = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('contactos_recientes')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _usuario_decorators;
    var _usuario_initializers = [];
    var _usuario_extraInitializers = [];
    var _contacto_decorators;
    var _contacto_initializers = [];
    var _contacto_extraInitializers = [];
    var _ultimoUso_decorators;
    var _ultimoUso_initializers = [];
    var _ultimoUso_extraInitializers = [];
    var ContactoReciente = _classThis = /** @class */ (function () {
        function ContactoReciente_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.usuario = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _usuario_initializers, void 0));
            this.contacto = (__runInitializers(this, _usuario_extraInitializers), __runInitializers(this, _contacto_initializers, void 0));
            this.ultimoUso = (__runInitializers(this, _contacto_extraInitializers), __runInitializers(this, _ultimoUso_initializers, void 0));
            __runInitializers(this, _ultimoUso_extraInitializers);
        }
        return ContactoReciente_1;
    }());
    __setFunctionName(_classThis, "ContactoReciente");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _usuario_decorators = [(0, typeorm_1.ManyToOne)(function () { return usuario_entity_1.Usuario; })];
        _contacto_decorators = [(0, typeorm_1.ManyToOne)(function () { return usuario_entity_1.Usuario; })];
        _ultimoUso_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _usuario_decorators, { kind: "field", name: "usuario", static: false, private: false, access: { has: function (obj) { return "usuario" in obj; }, get: function (obj) { return obj.usuario; }, set: function (obj, value) { obj.usuario = value; } }, metadata: _metadata }, _usuario_initializers, _usuario_extraInitializers);
        __esDecorate(null, null, _contacto_decorators, { kind: "field", name: "contacto", static: false, private: false, access: { has: function (obj) { return "contacto" in obj; }, get: function (obj) { return obj.contacto; }, set: function (obj, value) { obj.contacto = value; } }, metadata: _metadata }, _contacto_initializers, _contacto_extraInitializers);
        __esDecorate(null, null, _ultimoUso_decorators, { kind: "field", name: "ultimoUso", static: false, private: false, access: { has: function (obj) { return "ultimoUso" in obj; }, get: function (obj) { return obj.ultimoUso; }, set: function (obj, value) { obj.ultimoUso = value; } }, metadata: _metadata }, _ultimoUso_initializers, _ultimoUso_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ContactoReciente = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ContactoReciente = _classThis;
}();
exports.ContactoReciente = ContactoReciente;
