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
exports.DiffVersion = void 0;
var typeorm_1 = require("typeorm");
var version_ley_entity_1 = require("./version-ley.entity");
var DiffVersion = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('diffs_version')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _versionAnterior_decorators;
    var _versionAnterior_initializers = [];
    var _versionAnterior_extraInitializers = [];
    var _versionNueva_decorators;
    var _versionNueva_initializers = [];
    var _versionNueva_extraInitializers = [];
    var _cambios_decorators;
    var _cambios_initializers = [];
    var _cambios_extraInitializers = [];
    var _textoCompleto_decorators;
    var _textoCompleto_initializers = [];
    var _textoCompleto_extraInitializers = [];
    var _generadoPorIa_decorators;
    var _generadoPorIa_initializers = [];
    var _generadoPorIa_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var DiffVersion = _classThis = /** @class */ (function () {
        function DiffVersion_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.versionAnterior = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _versionAnterior_initializers, void 0));
            this.versionNueva = (__runInitializers(this, _versionAnterior_extraInitializers), __runInitializers(this, _versionNueva_initializers, void 0));
            this.cambios = (__runInitializers(this, _versionNueva_extraInitializers), __runInitializers(this, _cambios_initializers, void 0));
            this.textoCompleto = (__runInitializers(this, _cambios_extraInitializers), __runInitializers(this, _textoCompleto_initializers, void 0));
            this.generadoPorIa = (__runInitializers(this, _textoCompleto_extraInitializers), __runInitializers(this, _generadoPorIa_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _generadoPorIa_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            __runInitializers(this, _creadoEn_extraInitializers);
        }
        return DiffVersion_1;
    }());
    __setFunctionName(_classThis, "DiffVersion");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _versionAnterior_decorators = [(0, typeorm_1.ManyToOne)(function () { return version_ley_entity_1.VersionLey; }, { nullable: true })];
        _versionNueva_decorators = [(0, typeorm_1.ManyToOne)(function () { return version_ley_entity_1.VersionLey; }, function (v) { return v.diffs; })];
        _cambios_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true })];
        _textoCompleto_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _generadoPorIa_decorators = [(0, typeorm_1.Column)({ default: false })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _versionAnterior_decorators, { kind: "field", name: "versionAnterior", static: false, private: false, access: { has: function (obj) { return "versionAnterior" in obj; }, get: function (obj) { return obj.versionAnterior; }, set: function (obj, value) { obj.versionAnterior = value; } }, metadata: _metadata }, _versionAnterior_initializers, _versionAnterior_extraInitializers);
        __esDecorate(null, null, _versionNueva_decorators, { kind: "field", name: "versionNueva", static: false, private: false, access: { has: function (obj) { return "versionNueva" in obj; }, get: function (obj) { return obj.versionNueva; }, set: function (obj, value) { obj.versionNueva = value; } }, metadata: _metadata }, _versionNueva_initializers, _versionNueva_extraInitializers);
        __esDecorate(null, null, _cambios_decorators, { kind: "field", name: "cambios", static: false, private: false, access: { has: function (obj) { return "cambios" in obj; }, get: function (obj) { return obj.cambios; }, set: function (obj, value) { obj.cambios = value; } }, metadata: _metadata }, _cambios_initializers, _cambios_extraInitializers);
        __esDecorate(null, null, _textoCompleto_decorators, { kind: "field", name: "textoCompleto", static: false, private: false, access: { has: function (obj) { return "textoCompleto" in obj; }, get: function (obj) { return obj.textoCompleto; }, set: function (obj, value) { obj.textoCompleto = value; } }, metadata: _metadata }, _textoCompleto_initializers, _textoCompleto_extraInitializers);
        __esDecorate(null, null, _generadoPorIa_decorators, { kind: "field", name: "generadoPorIa", static: false, private: false, access: { has: function (obj) { return "generadoPorIa" in obj; }, get: function (obj) { return obj.generadoPorIa; }, set: function (obj, value) { obj.generadoPorIa = value; } }, metadata: _metadata }, _generadoPorIa_initializers, _generadoPorIa_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DiffVersion = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DiffVersion = _classThis;
}();
exports.DiffVersion = DiffVersion;
