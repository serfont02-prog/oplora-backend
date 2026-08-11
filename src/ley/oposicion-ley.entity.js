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
exports.OposicionLey = void 0;
var typeorm_1 = require("typeorm");
var oposicion_entity_1 = require("../oposicion/oposicion.entity");
var ley_entity_1 = require("./ley.entity");
var version_ley_entity_1 = require("./version-ley.entity");
var OposicionLey = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('oposiciones_leyes')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _obligatoria_decorators;
    var _obligatoria_initializers = [];
    var _obligatoria_extraInitializers = [];
    var _oposicion_decorators;
    var _oposicion_initializers = [];
    var _oposicion_extraInitializers = [];
    var _ley_decorators;
    var _ley_initializers = [];
    var _ley_extraInitializers = [];
    var _versionLey_decorators;
    var _versionLey_initializers = [];
    var _versionLey_extraInitializers = [];
    var OposicionLey = _classThis = /** @class */ (function () {
        function OposicionLey_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.obligatoria = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _obligatoria_initializers, void 0));
            this.oposicion = (__runInitializers(this, _obligatoria_extraInitializers), __runInitializers(this, _oposicion_initializers, void 0));
            this.ley = (__runInitializers(this, _oposicion_extraInitializers), __runInitializers(this, _ley_initializers, void 0));
            this.versionLey = (__runInitializers(this, _ley_extraInitializers), __runInitializers(this, _versionLey_initializers, void 0));
            __runInitializers(this, _versionLey_extraInitializers);
        }
        return OposicionLey_1;
    }());
    __setFunctionName(_classThis, "OposicionLey");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _obligatoria_decorators = [(0, typeorm_1.Column)({ default: true })];
        _oposicion_decorators = [(0, typeorm_1.ManyToOne)(function () { return oposicion_entity_1.Oposicion; }, function (o) { return o.oposicionLeyes; }, {
                onDelete: 'CASCADE',
            })];
        _ley_decorators = [(0, typeorm_1.ManyToOne)(function () { return ley_entity_1.Ley; }, function (l) { return l.oposicionLeyes; }, {
                onDelete: 'CASCADE',
            })];
        _versionLey_decorators = [(0, typeorm_1.ManyToOne)(function () { return version_ley_entity_1.VersionLey; }, { nullable: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _obligatoria_decorators, { kind: "field", name: "obligatoria", static: false, private: false, access: { has: function (obj) { return "obligatoria" in obj; }, get: function (obj) { return obj.obligatoria; }, set: function (obj, value) { obj.obligatoria = value; } }, metadata: _metadata }, _obligatoria_initializers, _obligatoria_extraInitializers);
        __esDecorate(null, null, _oposicion_decorators, { kind: "field", name: "oposicion", static: false, private: false, access: { has: function (obj) { return "oposicion" in obj; }, get: function (obj) { return obj.oposicion; }, set: function (obj, value) { obj.oposicion = value; } }, metadata: _metadata }, _oposicion_initializers, _oposicion_extraInitializers);
        __esDecorate(null, null, _ley_decorators, { kind: "field", name: "ley", static: false, private: false, access: { has: function (obj) { return "ley" in obj; }, get: function (obj) { return obj.ley; }, set: function (obj, value) { obj.ley = value; } }, metadata: _metadata }, _ley_initializers, _ley_extraInitializers);
        __esDecorate(null, null, _versionLey_decorators, { kind: "field", name: "versionLey", static: false, private: false, access: { has: function (obj) { return "versionLey" in obj; }, get: function (obj) { return obj.versionLey; }, set: function (obj, value) { obj.versionLey = value; } }, metadata: _metadata }, _versionLey_initializers, _versionLey_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OposicionLey = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OposicionLey = _classThis;
}();
exports.OposicionLey = OposicionLey;
