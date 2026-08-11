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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOposicionDto = exports.CreateOposicionDto = void 0;
var oposicion_entity_1 = require("./oposicion.entity");
var class_validator_1 = require("class-validator");
var CreateOposicionDto = function () {
    var _a;
    var _nombre_decorators;
    var _nombre_initializers = [];
    var _nombre_extraInitializers = [];
    var _cuerpo_decorators;
    var _cuerpo_initializers = [];
    var _cuerpo_extraInitializers = [];
    var _administracion_decorators;
    var _administracion_initializers = [];
    var _administracion_extraInitializers = [];
    var _ministerio_decorators;
    var _ministerio_initializers = [];
    var _ministerio_extraInitializers = [];
    var _subgrupo_decorators;
    var _subgrupo_initializers = [];
    var _subgrupo_extraInitializers = [];
    var _activa_decorators;
    var _activa_initializers = [];
    var _activa_extraInitializers = [];
    var _turno_decorators;
    var _turno_initializers = [];
    var _turno_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateOposicionDto() {
                this.nombre = __runInitializers(this, _nombre_initializers, void 0);
                this.cuerpo = (__runInitializers(this, _nombre_extraInitializers), __runInitializers(this, _cuerpo_initializers, void 0));
                this.administracion = (__runInitializers(this, _cuerpo_extraInitializers), __runInitializers(this, _administracion_initializers, void 0));
                this.ministerio = (__runInitializers(this, _administracion_extraInitializers), __runInitializers(this, _ministerio_initializers, void 0));
                this.subgrupo = (__runInitializers(this, _ministerio_extraInitializers), __runInitializers(this, _subgrupo_initializers, void 0)); // 🔥 OBLIGATORIO y tipado
                this.activa = (__runInitializers(this, _subgrupo_extraInitializers), __runInitializers(this, _activa_initializers, void 0));
                this.turno = (__runInitializers(this, _activa_extraInitializers), __runInitializers(this, _turno_initializers, void 0)); // 🔥 OBLIGATORIO y tipado
                __runInitializers(this, _turno_extraInitializers);
            }
            return CreateOposicionDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nombre_decorators = [(0, class_validator_1.IsString)()];
            _cuerpo_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _administracion_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _ministerio_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _subgrupo_decorators = [(0, class_validator_1.IsEnum)(oposicion_entity_1.SubgrupoEnum)];
            _activa_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _turno_decorators = [(0, class_validator_1.IsEnum)(oposicion_entity_1.TurnoEnum)];
            __esDecorate(null, null, _nombre_decorators, { kind: "field", name: "nombre", static: false, private: false, access: { has: function (obj) { return "nombre" in obj; }, get: function (obj) { return obj.nombre; }, set: function (obj, value) { obj.nombre = value; } }, metadata: _metadata }, _nombre_initializers, _nombre_extraInitializers);
            __esDecorate(null, null, _cuerpo_decorators, { kind: "field", name: "cuerpo", static: false, private: false, access: { has: function (obj) { return "cuerpo" in obj; }, get: function (obj) { return obj.cuerpo; }, set: function (obj, value) { obj.cuerpo = value; } }, metadata: _metadata }, _cuerpo_initializers, _cuerpo_extraInitializers);
            __esDecorate(null, null, _administracion_decorators, { kind: "field", name: "administracion", static: false, private: false, access: { has: function (obj) { return "administracion" in obj; }, get: function (obj) { return obj.administracion; }, set: function (obj, value) { obj.administracion = value; } }, metadata: _metadata }, _administracion_initializers, _administracion_extraInitializers);
            __esDecorate(null, null, _ministerio_decorators, { kind: "field", name: "ministerio", static: false, private: false, access: { has: function (obj) { return "ministerio" in obj; }, get: function (obj) { return obj.ministerio; }, set: function (obj, value) { obj.ministerio = value; } }, metadata: _metadata }, _ministerio_initializers, _ministerio_extraInitializers);
            __esDecorate(null, null, _subgrupo_decorators, { kind: "field", name: "subgrupo", static: false, private: false, access: { has: function (obj) { return "subgrupo" in obj; }, get: function (obj) { return obj.subgrupo; }, set: function (obj, value) { obj.subgrupo = value; } }, metadata: _metadata }, _subgrupo_initializers, _subgrupo_extraInitializers);
            __esDecorate(null, null, _activa_decorators, { kind: "field", name: "activa", static: false, private: false, access: { has: function (obj) { return "activa" in obj; }, get: function (obj) { return obj.activa; }, set: function (obj, value) { obj.activa = value; } }, metadata: _metadata }, _activa_initializers, _activa_extraInitializers);
            __esDecorate(null, null, _turno_decorators, { kind: "field", name: "turno", static: false, private: false, access: { has: function (obj) { return "turno" in obj; }, get: function (obj) { return obj.turno; }, set: function (obj, value) { obj.turno = value; } }, metadata: _metadata }, _turno_initializers, _turno_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateOposicionDto = CreateOposicionDto;
var UpdateOposicionDto = function () {
    var _a;
    var _nombre_decorators;
    var _nombre_initializers = [];
    var _nombre_extraInitializers = [];
    var _cuerpo_decorators;
    var _cuerpo_initializers = [];
    var _cuerpo_extraInitializers = [];
    var _administracion_decorators;
    var _administracion_initializers = [];
    var _administracion_extraInitializers = [];
    var _ministerio_decorators;
    var _ministerio_initializers = [];
    var _ministerio_extraInitializers = [];
    var _subgrupo_decorators;
    var _subgrupo_initializers = [];
    var _subgrupo_extraInitializers = [];
    var _activa_decorators;
    var _activa_initializers = [];
    var _activa_extraInitializers = [];
    var _turno_decorators;
    var _turno_initializers = [];
    var _turno_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateOposicionDto() {
                this.nombre = __runInitializers(this, _nombre_initializers, void 0);
                this.cuerpo = (__runInitializers(this, _nombre_extraInitializers), __runInitializers(this, _cuerpo_initializers, void 0));
                this.administracion = (__runInitializers(this, _cuerpo_extraInitializers), __runInitializers(this, _administracion_initializers, void 0));
                this.ministerio = (__runInitializers(this, _administracion_extraInitializers), __runInitializers(this, _ministerio_initializers, void 0));
                this.subgrupo = (__runInitializers(this, _ministerio_extraInitializers), __runInitializers(this, _subgrupo_initializers, void 0));
                this.activa = (__runInitializers(this, _subgrupo_extraInitializers), __runInitializers(this, _activa_initializers, void 0));
                this.turno = (__runInitializers(this, _activa_extraInitializers), __runInitializers(this, _turno_initializers, void 0));
                __runInitializers(this, _turno_extraInitializers);
            }
            return UpdateOposicionDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _nombre_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _cuerpo_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _administracion_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _ministerio_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _subgrupo_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(oposicion_entity_1.SubgrupoEnum)];
            _activa_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _turno_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(oposicion_entity_1.TurnoEnum)];
            __esDecorate(null, null, _nombre_decorators, { kind: "field", name: "nombre", static: false, private: false, access: { has: function (obj) { return "nombre" in obj; }, get: function (obj) { return obj.nombre; }, set: function (obj, value) { obj.nombre = value; } }, metadata: _metadata }, _nombre_initializers, _nombre_extraInitializers);
            __esDecorate(null, null, _cuerpo_decorators, { kind: "field", name: "cuerpo", static: false, private: false, access: { has: function (obj) { return "cuerpo" in obj; }, get: function (obj) { return obj.cuerpo; }, set: function (obj, value) { obj.cuerpo = value; } }, metadata: _metadata }, _cuerpo_initializers, _cuerpo_extraInitializers);
            __esDecorate(null, null, _administracion_decorators, { kind: "field", name: "administracion", static: false, private: false, access: { has: function (obj) { return "administracion" in obj; }, get: function (obj) { return obj.administracion; }, set: function (obj, value) { obj.administracion = value; } }, metadata: _metadata }, _administracion_initializers, _administracion_extraInitializers);
            __esDecorate(null, null, _ministerio_decorators, { kind: "field", name: "ministerio", static: false, private: false, access: { has: function (obj) { return "ministerio" in obj; }, get: function (obj) { return obj.ministerio; }, set: function (obj, value) { obj.ministerio = value; } }, metadata: _metadata }, _ministerio_initializers, _ministerio_extraInitializers);
            __esDecorate(null, null, _subgrupo_decorators, { kind: "field", name: "subgrupo", static: false, private: false, access: { has: function (obj) { return "subgrupo" in obj; }, get: function (obj) { return obj.subgrupo; }, set: function (obj, value) { obj.subgrupo = value; } }, metadata: _metadata }, _subgrupo_initializers, _subgrupo_extraInitializers);
            __esDecorate(null, null, _activa_decorators, { kind: "field", name: "activa", static: false, private: false, access: { has: function (obj) { return "activa" in obj; }, get: function (obj) { return obj.activa; }, set: function (obj, value) { obj.activa = value; } }, metadata: _metadata }, _activa_initializers, _activa_extraInitializers);
            __esDecorate(null, null, _turno_decorators, { kind: "field", name: "turno", static: false, private: false, access: { has: function (obj) { return "turno" in obj; }, get: function (obj) { return obj.turno; }, set: function (obj, value) { obj.turno = value; } }, metadata: _metadata }, _turno_initializers, _turno_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateOposicionDto = UpdateOposicionDto;
