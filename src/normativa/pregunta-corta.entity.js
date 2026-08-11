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
exports.PreguntaCorta = void 0;
var typeorm_1 = require("typeorm");
var articulo_entity_1 = require("./articulo.entity");
var tema_entity_1 = require("../tema/tema.entity");
var PreguntaCorta = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('preguntas_cortas')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _pregunta_decorators;
    var _pregunta_initializers = [];
    var _pregunta_extraInitializers = [];
    var _respuesta_decorators;
    var _respuesta_initializers = [];
    var _respuesta_extraInitializers = [];
    var _activa_decorators;
    var _activa_initializers = [];
    var _activa_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var _articulo_decorators;
    var _articulo_initializers = [];
    var _articulo_extraInitializers = [];
    var _tema_decorators;
    var _tema_initializers = [];
    var _tema_extraInitializers = [];
    var PreguntaCorta = _classThis = /** @class */ (function () {
        function PreguntaCorta_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.pregunta = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _pregunta_initializers, void 0));
            this.respuesta = (__runInitializers(this, _pregunta_extraInitializers), __runInitializers(this, _respuesta_initializers, void 0));
            this.activa = (__runInitializers(this, _respuesta_extraInitializers), __runInitializers(this, _activa_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _activa_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            this.articulo = (__runInitializers(this, _creadoEn_extraInitializers), __runInitializers(this, _articulo_initializers, void 0));
            this.tema = (__runInitializers(this, _articulo_extraInitializers), __runInitializers(this, _tema_initializers, void 0));
            __runInitializers(this, _tema_extraInitializers);
        }
        return PreguntaCorta_1;
    }());
    __setFunctionName(_classThis, "PreguntaCorta");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _pregunta_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _respuesta_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _activa_decorators = [(0, typeorm_1.Column)({ default: true })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _articulo_decorators = [(0, typeorm_1.ManyToOne)(function () { return articulo_entity_1.Articulo; }, { nullable: true })];
        _tema_decorators = [(0, typeorm_1.ManyToOne)(function () { return tema_entity_1.Tema; }, { nullable: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _pregunta_decorators, { kind: "field", name: "pregunta", static: false, private: false, access: { has: function (obj) { return "pregunta" in obj; }, get: function (obj) { return obj.pregunta; }, set: function (obj, value) { obj.pregunta = value; } }, metadata: _metadata }, _pregunta_initializers, _pregunta_extraInitializers);
        __esDecorate(null, null, _respuesta_decorators, { kind: "field", name: "respuesta", static: false, private: false, access: { has: function (obj) { return "respuesta" in obj; }, get: function (obj) { return obj.respuesta; }, set: function (obj, value) { obj.respuesta = value; } }, metadata: _metadata }, _respuesta_initializers, _respuesta_extraInitializers);
        __esDecorate(null, null, _activa_decorators, { kind: "field", name: "activa", static: false, private: false, access: { has: function (obj) { return "activa" in obj; }, get: function (obj) { return obj.activa; }, set: function (obj, value) { obj.activa = value; } }, metadata: _metadata }, _activa_initializers, _activa_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, null, _articulo_decorators, { kind: "field", name: "articulo", static: false, private: false, access: { has: function (obj) { return "articulo" in obj; }, get: function (obj) { return obj.articulo; }, set: function (obj, value) { obj.articulo = value; } }, metadata: _metadata }, _articulo_initializers, _articulo_extraInitializers);
        __esDecorate(null, null, _tema_decorators, { kind: "field", name: "tema", static: false, private: false, access: { has: function (obj) { return "tema" in obj; }, get: function (obj) { return obj.tema; }, set: function (obj, value) { obj.tema = value; } }, metadata: _metadata }, _tema_initializers, _tema_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PreguntaCorta = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PreguntaCorta = _classThis;
}();
exports.PreguntaCorta = PreguntaCorta;
