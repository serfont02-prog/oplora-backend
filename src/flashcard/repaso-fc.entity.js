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
exports.RepasoFC = exports.EstadoFC = void 0;
var typeorm_1 = require("typeorm");
var flashcard_entity_1 = require("./flashcard.entity");
var usuario_entity_1 = require("../usuario/usuario.entity");
var EstadoFC;
(function (EstadoFC) {
    EstadoFC["DOMINADA"] = "dominada";
    EstadoFC["DUDOSA"] = "dudosa";
    EstadoFC["NO_DOMINADA"] = "no_dominada";
})(EstadoFC || (exports.EstadoFC = EstadoFC = {}));
var RepasoFC = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('repasos_fc')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _estado_decorators;
    var _estado_initializers = [];
    var _estado_extraInitializers = [];
    var _aciertos_decorators;
    var _aciertos_initializers = [];
    var _aciertos_extraInitializers = [];
    var _fallos_decorators;
    var _fallos_initializers = [];
    var _fallos_extraInitializers = [];
    var _fallosConsecutivos_decorators;
    var _fallosConsecutivos_initializers = [];
    var _fallosConsecutivos_extraInitializers = [];
    var _tiempoMedioRespuesta_decorators;
    var _tiempoMedioRespuesta_initializers = [];
    var _tiempoMedioRespuesta_extraInitializers = [];
    var _ultimaVista_decorators;
    var _ultimaVista_initializers = [];
    var _ultimaVista_extraInitializers = [];
    var _proximoRepaso_decorators;
    var _proximoRepaso_initializers = [];
    var _proximoRepaso_extraInitializers = [];
    var _factorFacilidad_decorators;
    var _factorFacilidad_initializers = [];
    var _factorFacilidad_extraInitializers = [];
    var _intervalo_decorators;
    var _intervalo_initializers = [];
    var _intervalo_extraInitializers = [];
    var _repeticiones_decorators;
    var _repeticiones_initializers = [];
    var _repeticiones_extraInitializers = [];
    var _actualizadoEn_decorators;
    var _actualizadoEn_initializers = [];
    var _actualizadoEn_extraInitializers = [];
    var _flashcard_decorators;
    var _flashcard_initializers = [];
    var _flashcard_extraInitializers = [];
    var _usuario_decorators;
    var _usuario_initializers = [];
    var _usuario_extraInitializers = [];
    var RepasoFC = _classThis = /** @class */ (function () {
        function RepasoFC_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.estado = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _estado_initializers, void 0));
            this.aciertos = (__runInitializers(this, _estado_extraInitializers), __runInitializers(this, _aciertos_initializers, void 0));
            this.fallos = (__runInitializers(this, _aciertos_extraInitializers), __runInitializers(this, _fallos_initializers, void 0));
            this.fallosConsecutivos = (__runInitializers(this, _fallos_extraInitializers), __runInitializers(this, _fallosConsecutivos_initializers, void 0));
            this.tiempoMedioRespuesta = (__runInitializers(this, _fallosConsecutivos_extraInitializers), __runInitializers(this, _tiempoMedioRespuesta_initializers, void 0));
            this.ultimaVista = (__runInitializers(this, _tiempoMedioRespuesta_extraInitializers), __runInitializers(this, _ultimaVista_initializers, void 0));
            this.proximoRepaso = (__runInitializers(this, _ultimaVista_extraInitializers), __runInitializers(this, _proximoRepaso_initializers, void 0));
            this.factorFacilidad = (__runInitializers(this, _proximoRepaso_extraInitializers), __runInitializers(this, _factorFacilidad_initializers, void 0));
            this.intervalo = (__runInitializers(this, _factorFacilidad_extraInitializers), __runInitializers(this, _intervalo_initializers, void 0));
            this.repeticiones = (__runInitializers(this, _intervalo_extraInitializers), __runInitializers(this, _repeticiones_initializers, void 0));
            this.actualizadoEn = (__runInitializers(this, _repeticiones_extraInitializers), __runInitializers(this, _actualizadoEn_initializers, void 0));
            this.flashcard = (__runInitializers(this, _actualizadoEn_extraInitializers), __runInitializers(this, _flashcard_initializers, void 0));
            this.usuario = (__runInitializers(this, _flashcard_extraInitializers), __runInitializers(this, _usuario_initializers, void 0));
            __runInitializers(this, _usuario_extraInitializers);
        }
        return RepasoFC_1;
    }());
    __setFunctionName(_classThis, "RepasoFC");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _estado_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: EstadoFC, default: EstadoFC.NO_DOMINADA })];
        _aciertos_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _fallos_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _fallosConsecutivos_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _tiempoMedioRespuesta_decorators = [(0, typeorm_1.Column)({ type: 'float', default: 0 })];
        _ultimaVista_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _proximoRepaso_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _factorFacilidad_decorators = [(0, typeorm_1.Column)({ type: 'float', default: 2.5 })];
        _intervalo_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _repeticiones_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _actualizadoEn_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        _flashcard_decorators = [(0, typeorm_1.ManyToOne)(function () { return flashcard_entity_1.Flashcard; })];
        _usuario_decorators = [(0, typeorm_1.ManyToOne)(function () { return usuario_entity_1.Usuario; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _estado_decorators, { kind: "field", name: "estado", static: false, private: false, access: { has: function (obj) { return "estado" in obj; }, get: function (obj) { return obj.estado; }, set: function (obj, value) { obj.estado = value; } }, metadata: _metadata }, _estado_initializers, _estado_extraInitializers);
        __esDecorate(null, null, _aciertos_decorators, { kind: "field", name: "aciertos", static: false, private: false, access: { has: function (obj) { return "aciertos" in obj; }, get: function (obj) { return obj.aciertos; }, set: function (obj, value) { obj.aciertos = value; } }, metadata: _metadata }, _aciertos_initializers, _aciertos_extraInitializers);
        __esDecorate(null, null, _fallos_decorators, { kind: "field", name: "fallos", static: false, private: false, access: { has: function (obj) { return "fallos" in obj; }, get: function (obj) { return obj.fallos; }, set: function (obj, value) { obj.fallos = value; } }, metadata: _metadata }, _fallos_initializers, _fallos_extraInitializers);
        __esDecorate(null, null, _fallosConsecutivos_decorators, { kind: "field", name: "fallosConsecutivos", static: false, private: false, access: { has: function (obj) { return "fallosConsecutivos" in obj; }, get: function (obj) { return obj.fallosConsecutivos; }, set: function (obj, value) { obj.fallosConsecutivos = value; } }, metadata: _metadata }, _fallosConsecutivos_initializers, _fallosConsecutivos_extraInitializers);
        __esDecorate(null, null, _tiempoMedioRespuesta_decorators, { kind: "field", name: "tiempoMedioRespuesta", static: false, private: false, access: { has: function (obj) { return "tiempoMedioRespuesta" in obj; }, get: function (obj) { return obj.tiempoMedioRespuesta; }, set: function (obj, value) { obj.tiempoMedioRespuesta = value; } }, metadata: _metadata }, _tiempoMedioRespuesta_initializers, _tiempoMedioRespuesta_extraInitializers);
        __esDecorate(null, null, _ultimaVista_decorators, { kind: "field", name: "ultimaVista", static: false, private: false, access: { has: function (obj) { return "ultimaVista" in obj; }, get: function (obj) { return obj.ultimaVista; }, set: function (obj, value) { obj.ultimaVista = value; } }, metadata: _metadata }, _ultimaVista_initializers, _ultimaVista_extraInitializers);
        __esDecorate(null, null, _proximoRepaso_decorators, { kind: "field", name: "proximoRepaso", static: false, private: false, access: { has: function (obj) { return "proximoRepaso" in obj; }, get: function (obj) { return obj.proximoRepaso; }, set: function (obj, value) { obj.proximoRepaso = value; } }, metadata: _metadata }, _proximoRepaso_initializers, _proximoRepaso_extraInitializers);
        __esDecorate(null, null, _factorFacilidad_decorators, { kind: "field", name: "factorFacilidad", static: false, private: false, access: { has: function (obj) { return "factorFacilidad" in obj; }, get: function (obj) { return obj.factorFacilidad; }, set: function (obj, value) { obj.factorFacilidad = value; } }, metadata: _metadata }, _factorFacilidad_initializers, _factorFacilidad_extraInitializers);
        __esDecorate(null, null, _intervalo_decorators, { kind: "field", name: "intervalo", static: false, private: false, access: { has: function (obj) { return "intervalo" in obj; }, get: function (obj) { return obj.intervalo; }, set: function (obj, value) { obj.intervalo = value; } }, metadata: _metadata }, _intervalo_initializers, _intervalo_extraInitializers);
        __esDecorate(null, null, _repeticiones_decorators, { kind: "field", name: "repeticiones", static: false, private: false, access: { has: function (obj) { return "repeticiones" in obj; }, get: function (obj) { return obj.repeticiones; }, set: function (obj, value) { obj.repeticiones = value; } }, metadata: _metadata }, _repeticiones_initializers, _repeticiones_extraInitializers);
        __esDecorate(null, null, _actualizadoEn_decorators, { kind: "field", name: "actualizadoEn", static: false, private: false, access: { has: function (obj) { return "actualizadoEn" in obj; }, get: function (obj) { return obj.actualizadoEn; }, set: function (obj, value) { obj.actualizadoEn = value; } }, metadata: _metadata }, _actualizadoEn_initializers, _actualizadoEn_extraInitializers);
        __esDecorate(null, null, _flashcard_decorators, { kind: "field", name: "flashcard", static: false, private: false, access: { has: function (obj) { return "flashcard" in obj; }, get: function (obj) { return obj.flashcard; }, set: function (obj, value) { obj.flashcard = value; } }, metadata: _metadata }, _flashcard_initializers, _flashcard_extraInitializers);
        __esDecorate(null, null, _usuario_decorators, { kind: "field", name: "usuario", static: false, private: false, access: { has: function (obj) { return "usuario" in obj; }, get: function (obj) { return obj.usuario; }, set: function (obj, value) { obj.usuario = value; } }, metadata: _metadata }, _usuario_initializers, _usuario_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RepasoFC = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RepasoFC = _classThis;
}();
exports.RepasoFC = RepasoFC;
