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
exports.Configuracion = void 0;
var typeorm_1 = require("typeorm");
var Configuracion = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('configuracion')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _clave_decorators;
    var _clave_initializers = [];
    var _clave_extraInitializers = [];
    var _valor_decorators;
    var _valor_initializers = [];
    var _valor_extraInitializers = [];
    var _descripcion_decorators;
    var _descripcion_initializers = [];
    var _descripcion_extraInitializers = [];
    var _actualizadoEn_decorators;
    var _actualizadoEn_initializers = [];
    var _actualizadoEn_extraInitializers = [];
    var Configuracion = _classThis = /** @class */ (function () {
        function Configuracion_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.clave = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _clave_initializers, void 0));
            this.valor = (__runInitializers(this, _clave_extraInitializers), __runInitializers(this, _valor_initializers, void 0));
            this.descripcion = (__runInitializers(this, _valor_extraInitializers), __runInitializers(this, _descripcion_initializers, void 0));
            this.actualizadoEn = (__runInitializers(this, _descripcion_extraInitializers), __runInitializers(this, _actualizadoEn_initializers, void 0));
            __runInitializers(this, _actualizadoEn_extraInitializers);
        }
        return Configuracion_1;
    }());
    __setFunctionName(_classThis, "Configuracion");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _clave_decorators = [(0, typeorm_1.Column)({ unique: true })];
        _valor_decorators = [(0, typeorm_1.Column)({ type: 'jsonb' })];
        _descripcion_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _actualizadoEn_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _clave_decorators, { kind: "field", name: "clave", static: false, private: false, access: { has: function (obj) { return "clave" in obj; }, get: function (obj) { return obj.clave; }, set: function (obj, value) { obj.clave = value; } }, metadata: _metadata }, _clave_initializers, _clave_extraInitializers);
        __esDecorate(null, null, _valor_decorators, { kind: "field", name: "valor", static: false, private: false, access: { has: function (obj) { return "valor" in obj; }, get: function (obj) { return obj.valor; }, set: function (obj, value) { obj.valor = value; } }, metadata: _metadata }, _valor_initializers, _valor_extraInitializers);
        __esDecorate(null, null, _descripcion_decorators, { kind: "field", name: "descripcion", static: false, private: false, access: { has: function (obj) { return "descripcion" in obj; }, get: function (obj) { return obj.descripcion; }, set: function (obj, value) { obj.descripcion = value; } }, metadata: _metadata }, _descripcion_initializers, _descripcion_extraInitializers);
        __esDecorate(null, null, _actualizadoEn_decorators, { kind: "field", name: "actualizadoEn", static: false, private: false, access: { has: function (obj) { return "actualizadoEn" in obj; }, get: function (obj) { return obj.actualizadoEn; }, set: function (obj, value) { obj.actualizadoEn = value; } }, metadata: _metadata }, _actualizadoEn_initializers, _actualizadoEn_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Configuracion = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Configuracion = _classThis;
}();
exports.Configuracion = Configuracion;
