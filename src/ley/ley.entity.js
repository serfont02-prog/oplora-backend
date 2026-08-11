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
exports.Ley = void 0;
var typeorm_1 = require("typeorm");
var version_ley_entity_1 = require("./version-ley.entity");
var oposicion_ley_entity_1 = require("./oposicion-ley.entity");
var Ley = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('leyes')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _nombre_decorators;
    var _nombre_initializers = [];
    var _nombre_extraInitializers = [];
    var _descripcion_decorators;
    var _descripcion_initializers = [];
    var _descripcion_extraInitializers = [];
    var _versiones_decorators;
    var _versiones_initializers = [];
    var _versiones_extraInitializers = [];
    var _oposicionLeyes_decorators;
    var _oposicionLeyes_initializers = [];
    var _oposicionLeyes_extraInitializers = [];
    var _fechaPublicacion_decorators;
    var _fechaPublicacion_initializers = [];
    var _fechaPublicacion_extraInitializers = [];
    var Ley = _classThis = /** @class */ (function () {
        function Ley_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.nombre = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _nombre_initializers, void 0));
            this.descripcion = (__runInitializers(this, _nombre_extraInitializers), __runInitializers(this, _descripcion_initializers, void 0));
            this.versiones = (__runInitializers(this, _descripcion_extraInitializers), __runInitializers(this, _versiones_initializers, void 0));
            this.oposicionLeyes = (__runInitializers(this, _versiones_extraInitializers), __runInitializers(this, _oposicionLeyes_initializers, void 0));
            this.fechaPublicacion = (__runInitializers(this, _oposicionLeyes_extraInitializers), __runInitializers(this, _fechaPublicacion_initializers, void 0));
            __runInitializers(this, _fechaPublicacion_extraInitializers);
        }
        return Ley_1;
    }());
    __setFunctionName(_classThis, "Ley");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _nombre_decorators = [(0, typeorm_1.Column)()];
        _descripcion_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _versiones_decorators = [(0, typeorm_1.OneToMany)(function () { return version_ley_entity_1.VersionLey; }, function (v) { return v.ley; })];
        _oposicionLeyes_decorators = [(0, typeorm_1.OneToMany)(function () { return oposicion_ley_entity_1.OposicionLey; }, function (ol) { return ol.ley; })];
        _fechaPublicacion_decorators = [(0, typeorm_1.Column)({ type: 'date', nullable: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _nombre_decorators, { kind: "field", name: "nombre", static: false, private: false, access: { has: function (obj) { return "nombre" in obj; }, get: function (obj) { return obj.nombre; }, set: function (obj, value) { obj.nombre = value; } }, metadata: _metadata }, _nombre_initializers, _nombre_extraInitializers);
        __esDecorate(null, null, _descripcion_decorators, { kind: "field", name: "descripcion", static: false, private: false, access: { has: function (obj) { return "descripcion" in obj; }, get: function (obj) { return obj.descripcion; }, set: function (obj, value) { obj.descripcion = value; } }, metadata: _metadata }, _descripcion_initializers, _descripcion_extraInitializers);
        __esDecorate(null, null, _versiones_decorators, { kind: "field", name: "versiones", static: false, private: false, access: { has: function (obj) { return "versiones" in obj; }, get: function (obj) { return obj.versiones; }, set: function (obj, value) { obj.versiones = value; } }, metadata: _metadata }, _versiones_initializers, _versiones_extraInitializers);
        __esDecorate(null, null, _oposicionLeyes_decorators, { kind: "field", name: "oposicionLeyes", static: false, private: false, access: { has: function (obj) { return "oposicionLeyes" in obj; }, get: function (obj) { return obj.oposicionLeyes; }, set: function (obj, value) { obj.oposicionLeyes = value; } }, metadata: _metadata }, _oposicionLeyes_initializers, _oposicionLeyes_extraInitializers);
        __esDecorate(null, null, _fechaPublicacion_decorators, { kind: "field", name: "fechaPublicacion", static: false, private: false, access: { has: function (obj) { return "fechaPublicacion" in obj; }, get: function (obj) { return obj.fechaPublicacion; }, set: function (obj, value) { obj.fechaPublicacion = value; } }, metadata: _metadata }, _fechaPublicacion_initializers, _fechaPublicacion_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Ley = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Ley = _classThis;
}();
exports.Ley = Ley;
