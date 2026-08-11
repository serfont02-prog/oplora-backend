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
exports.PreguntaBanco = exports.FuentePregunta = void 0;
var typeorm_1 = require("typeorm");
var tema_entity_1 = require("./tema.entity");
var articulo_entity_1 = require("../normativa/articulo.entity");
var FuentePregunta;
(function (FuentePregunta) {
    FuentePregunta["EXAMEN_ANTERIOR"] = "examen_anterior";
    FuentePregunta["IA_GENERADA"] = "ia_generada";
    FuentePregunta["ADMIN_MANUAL"] = "admin_manual";
    FuentePregunta["USUARIO_APUNTE"] = "usuario_apunte";
})(FuentePregunta || (exports.FuentePregunta = FuentePregunta = {}));
var PreguntaBanco = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('preguntas_banco')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _enunciado_decorators;
    var _enunciado_initializers = [];
    var _enunciado_extraInitializers = [];
    var _opciones_decorators;
    var _opciones_initializers = [];
    var _opciones_extraInitializers = [];
    var _correcta_decorators;
    var _correcta_initializers = [];
    var _correcta_extraInitializers = [];
    var _explicacion_decorators;
    var _explicacion_initializers = [];
    var _explicacion_extraInitializers = [];
    var _fuente_decorators;
    var _fuente_initializers = [];
    var _fuente_extraInitializers = [];
    var _validada_decorators;
    var _validada_initializers = [];
    var _validada_extraInitializers = [];
    var _vecesUsada_decorators;
    var _vecesUsada_initializers = [];
    var _vecesUsada_extraInitializers = [];
    var _tasaAcierto_decorators;
    var _tasaAcierto_initializers = [];
    var _tasaAcierto_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var _tema_decorators;
    var _tema_initializers = [];
    var _tema_extraInitializers = [];
    var _articulo_decorators;
    var _articulo_initializers = [];
    var _articulo_extraInitializers = [];
    var PreguntaBanco = _classThis = /** @class */ (function () {
        function PreguntaBanco_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.enunciado = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _enunciado_initializers, void 0));
            this.opciones = (__runInitializers(this, _enunciado_extraInitializers), __runInitializers(this, _opciones_initializers, void 0));
            this.correcta = (__runInitializers(this, _opciones_extraInitializers), __runInitializers(this, _correcta_initializers, void 0));
            this.explicacion = (__runInitializers(this, _correcta_extraInitializers), __runInitializers(this, _explicacion_initializers, void 0));
            this.fuente = (__runInitializers(this, _explicacion_extraInitializers), __runInitializers(this, _fuente_initializers, void 0));
            this.validada = (__runInitializers(this, _fuente_extraInitializers), __runInitializers(this, _validada_initializers, void 0));
            this.vecesUsada = (__runInitializers(this, _validada_extraInitializers), __runInitializers(this, _vecesUsada_initializers, void 0));
            this.tasaAcierto = (__runInitializers(this, _vecesUsada_extraInitializers), __runInitializers(this, _tasaAcierto_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _tasaAcierto_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            this.tema = (__runInitializers(this, _creadoEn_extraInitializers), __runInitializers(this, _tema_initializers, void 0));
            this.articulo = (__runInitializers(this, _tema_extraInitializers), __runInitializers(this, _articulo_initializers, void 0));
            __runInitializers(this, _articulo_extraInitializers);
        }
        return PreguntaBanco_1;
    }());
    __setFunctionName(_classThis, "PreguntaBanco");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _enunciado_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _opciones_decorators = [(0, typeorm_1.Column)({ type: 'jsonb' })];
        _correcta_decorators = [(0, typeorm_1.Column)()];
        _explicacion_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _fuente_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: FuentePregunta, default: FuentePregunta.IA_GENERADA })];
        _validada_decorators = [(0, typeorm_1.Column)({ default: false })];
        _vecesUsada_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _tasaAcierto_decorators = [(0, typeorm_1.Column)({ type: 'float', default: 0 })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _tema_decorators = [(0, typeorm_1.ManyToOne)(function () { return tema_entity_1.Tema; }, function (t) { return t.preguntas; }, { nullable: true })];
        _articulo_decorators = [(0, typeorm_1.ManyToOne)(function () { return articulo_entity_1.Articulo; }, { nullable: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _enunciado_decorators, { kind: "field", name: "enunciado", static: false, private: false, access: { has: function (obj) { return "enunciado" in obj; }, get: function (obj) { return obj.enunciado; }, set: function (obj, value) { obj.enunciado = value; } }, metadata: _metadata }, _enunciado_initializers, _enunciado_extraInitializers);
        __esDecorate(null, null, _opciones_decorators, { kind: "field", name: "opciones", static: false, private: false, access: { has: function (obj) { return "opciones" in obj; }, get: function (obj) { return obj.opciones; }, set: function (obj, value) { obj.opciones = value; } }, metadata: _metadata }, _opciones_initializers, _opciones_extraInitializers);
        __esDecorate(null, null, _correcta_decorators, { kind: "field", name: "correcta", static: false, private: false, access: { has: function (obj) { return "correcta" in obj; }, get: function (obj) { return obj.correcta; }, set: function (obj, value) { obj.correcta = value; } }, metadata: _metadata }, _correcta_initializers, _correcta_extraInitializers);
        __esDecorate(null, null, _explicacion_decorators, { kind: "field", name: "explicacion", static: false, private: false, access: { has: function (obj) { return "explicacion" in obj; }, get: function (obj) { return obj.explicacion; }, set: function (obj, value) { obj.explicacion = value; } }, metadata: _metadata }, _explicacion_initializers, _explicacion_extraInitializers);
        __esDecorate(null, null, _fuente_decorators, { kind: "field", name: "fuente", static: false, private: false, access: { has: function (obj) { return "fuente" in obj; }, get: function (obj) { return obj.fuente; }, set: function (obj, value) { obj.fuente = value; } }, metadata: _metadata }, _fuente_initializers, _fuente_extraInitializers);
        __esDecorate(null, null, _validada_decorators, { kind: "field", name: "validada", static: false, private: false, access: { has: function (obj) { return "validada" in obj; }, get: function (obj) { return obj.validada; }, set: function (obj, value) { obj.validada = value; } }, metadata: _metadata }, _validada_initializers, _validada_extraInitializers);
        __esDecorate(null, null, _vecesUsada_decorators, { kind: "field", name: "vecesUsada", static: false, private: false, access: { has: function (obj) { return "vecesUsada" in obj; }, get: function (obj) { return obj.vecesUsada; }, set: function (obj, value) { obj.vecesUsada = value; } }, metadata: _metadata }, _vecesUsada_initializers, _vecesUsada_extraInitializers);
        __esDecorate(null, null, _tasaAcierto_decorators, { kind: "field", name: "tasaAcierto", static: false, private: false, access: { has: function (obj) { return "tasaAcierto" in obj; }, get: function (obj) { return obj.tasaAcierto; }, set: function (obj, value) { obj.tasaAcierto = value; } }, metadata: _metadata }, _tasaAcierto_initializers, _tasaAcierto_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, null, _tema_decorators, { kind: "field", name: "tema", static: false, private: false, access: { has: function (obj) { return "tema" in obj; }, get: function (obj) { return obj.tema; }, set: function (obj, value) { obj.tema = value; } }, metadata: _metadata }, _tema_initializers, _tema_extraInitializers);
        __esDecorate(null, null, _articulo_decorators, { kind: "field", name: "articulo", static: false, private: false, access: { has: function (obj) { return "articulo" in obj; }, get: function (obj) { return obj.articulo; }, set: function (obj, value) { obj.articulo = value; } }, metadata: _metadata }, _articulo_initializers, _articulo_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PreguntaBanco = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PreguntaBanco = _classThis;
}();
exports.PreguntaBanco = PreguntaBanco;
