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
exports.ResultadoRetoFC = void 0;
var typeorm_1 = require("typeorm");
var reto_fc_entity_1 = require("./reto-fc.entity");
var usuario_entity_1 = require("../usuario/usuario.entity");
var flashcard_entity_1 = require("./flashcard.entity");
var ResultadoRetoFC = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('resultados_reto_fc')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _completado_decorators;
    var _completado_initializers = [];
    var _completado_extraInitializers = [];
    var _aciertos_decorators;
    var _aciertos_initializers = [];
    var _aciertos_extraInitializers = [];
    var _fallos_decorators;
    var _fallos_initializers = [];
    var _fallos_extraInitializers = [];
    var _tiempoTotal_decorators;
    var _tiempoTotal_initializers = [];
    var _tiempoTotal_extraInitializers = [];
    var _posicion_decorators;
    var _posicion_initializers = [];
    var _posicion_extraInitializers = [];
    var _respuestas_decorators;
    var _respuestas_initializers = [];
    var _respuestas_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var _retoFc_decorators;
    var _retoFc_initializers = [];
    var _retoFc_extraInitializers = [];
    var _usuario_decorators;
    var _usuario_initializers = [];
    var _usuario_extraInitializers = [];
    var _flashcard_decorators;
    var _flashcard_initializers = [];
    var _flashcard_extraInitializers = [];
    var ResultadoRetoFC = _classThis = /** @class */ (function () {
        function ResultadoRetoFC_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.completado = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _completado_initializers, void 0));
            this.aciertos = (__runInitializers(this, _completado_extraInitializers), __runInitializers(this, _aciertos_initializers, void 0));
            this.fallos = (__runInitializers(this, _aciertos_extraInitializers), __runInitializers(this, _fallos_initializers, void 0));
            this.tiempoTotal = (__runInitializers(this, _fallos_extraInitializers), __runInitializers(this, _tiempoTotal_initializers, void 0));
            this.posicion = (__runInitializers(this, _tiempoTotal_extraInitializers), __runInitializers(this, _posicion_initializers, void 0));
            this.respuestas = (__runInitializers(this, _posicion_extraInitializers), __runInitializers(this, _respuestas_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _respuestas_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            this.retoFc = (__runInitializers(this, _creadoEn_extraInitializers), __runInitializers(this, _retoFc_initializers, void 0));
            this.usuario = (__runInitializers(this, _retoFc_extraInitializers), __runInitializers(this, _usuario_initializers, void 0));
            this.flashcard = (__runInitializers(this, _usuario_extraInitializers), __runInitializers(this, _flashcard_initializers, void 0));
            __runInitializers(this, _flashcard_extraInitializers);
        }
        return ResultadoRetoFC_1;
    }());
    __setFunctionName(_classThis, "ResultadoRetoFC");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _completado_decorators = [(0, typeorm_1.Column)({ default: false })];
        _aciertos_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _fallos_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _tiempoTotal_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _posicion_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _respuestas_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _retoFc_decorators = [(0, typeorm_1.ManyToOne)(function () { return reto_fc_entity_1.RetoFC; }, function (r) { return r.resultados; })];
        _usuario_decorators = [(0, typeorm_1.ManyToOne)(function () { return usuario_entity_1.Usuario; })];
        _flashcard_decorators = [(0, typeorm_1.ManyToOne)(function () { return flashcard_entity_1.Flashcard; }, function (f) { return f.repasos; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _completado_decorators, { kind: "field", name: "completado", static: false, private: false, access: { has: function (obj) { return "completado" in obj; }, get: function (obj) { return obj.completado; }, set: function (obj, value) { obj.completado = value; } }, metadata: _metadata }, _completado_initializers, _completado_extraInitializers);
        __esDecorate(null, null, _aciertos_decorators, { kind: "field", name: "aciertos", static: false, private: false, access: { has: function (obj) { return "aciertos" in obj; }, get: function (obj) { return obj.aciertos; }, set: function (obj, value) { obj.aciertos = value; } }, metadata: _metadata }, _aciertos_initializers, _aciertos_extraInitializers);
        __esDecorate(null, null, _fallos_decorators, { kind: "field", name: "fallos", static: false, private: false, access: { has: function (obj) { return "fallos" in obj; }, get: function (obj) { return obj.fallos; }, set: function (obj, value) { obj.fallos = value; } }, metadata: _metadata }, _fallos_initializers, _fallos_extraInitializers);
        __esDecorate(null, null, _tiempoTotal_decorators, { kind: "field", name: "tiempoTotal", static: false, private: false, access: { has: function (obj) { return "tiempoTotal" in obj; }, get: function (obj) { return obj.tiempoTotal; }, set: function (obj, value) { obj.tiempoTotal = value; } }, metadata: _metadata }, _tiempoTotal_initializers, _tiempoTotal_extraInitializers);
        __esDecorate(null, null, _posicion_decorators, { kind: "field", name: "posicion", static: false, private: false, access: { has: function (obj) { return "posicion" in obj; }, get: function (obj) { return obj.posicion; }, set: function (obj, value) { obj.posicion = value; } }, metadata: _metadata }, _posicion_initializers, _posicion_extraInitializers);
        __esDecorate(null, null, _respuestas_decorators, { kind: "field", name: "respuestas", static: false, private: false, access: { has: function (obj) { return "respuestas" in obj; }, get: function (obj) { return obj.respuestas; }, set: function (obj, value) { obj.respuestas = value; } }, metadata: _metadata }, _respuestas_initializers, _respuestas_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, null, _retoFc_decorators, { kind: "field", name: "retoFc", static: false, private: false, access: { has: function (obj) { return "retoFc" in obj; }, get: function (obj) { return obj.retoFc; }, set: function (obj, value) { obj.retoFc = value; } }, metadata: _metadata }, _retoFc_initializers, _retoFc_extraInitializers);
        __esDecorate(null, null, _usuario_decorators, { kind: "field", name: "usuario", static: false, private: false, access: { has: function (obj) { return "usuario" in obj; }, get: function (obj) { return obj.usuario; }, set: function (obj, value) { obj.usuario = value; } }, metadata: _metadata }, _usuario_initializers, _usuario_extraInitializers);
        __esDecorate(null, null, _flashcard_decorators, { kind: "field", name: "flashcard", static: false, private: false, access: { has: function (obj) { return "flashcard" in obj; }, get: function (obj) { return obj.flashcard; }, set: function (obj, value) { obj.flashcard = value; } }, metadata: _metadata }, _flashcard_initializers, _flashcard_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ResultadoRetoFC = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ResultadoRetoFC = _classThis;
}();
exports.ResultadoRetoFC = ResultadoRetoFC;
