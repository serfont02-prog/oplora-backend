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
exports.PreguntaTest = void 0;
var typeorm_1 = require("typeorm");
var tema_entity_1 = require("../tema/tema.entity");
var articulo_entity_1 = require("../normativa/articulo.entity");
var PreguntaTest = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('preguntas_test')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _tipo_decorators;
    var _tipo_initializers = [];
    var _tipo_extraInitializers = [];
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
    var _dificultad_decorators;
    var _dificultad_initializers = [];
    var _dificultad_extraInitializers = [];
    var _fuente_decorators;
    var _fuente_initializers = [];
    var _fuente_extraInitializers = [];
    var _activa_decorators;
    var _activa_initializers = [];
    var _activa_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var _anyo_decorators;
    var _anyo_initializers = [];
    var _anyo_extraInitializers = [];
    var _origen_decorators;
    var _origen_initializers = [];
    var _origen_extraInitializers = [];
    var _aciertos_decorators;
    var _aciertos_initializers = [];
    var _aciertos_extraInitializers = [];
    var _fallos_decorators;
    var _fallos_initializers = [];
    var _fallos_extraInitializers = [];
    var _vecesUsada_decorators;
    var _vecesUsada_initializers = [];
    var _vecesUsada_extraInitializers = [];
    var _temas_decorators;
    var _temas_initializers = [];
    var _temas_extraInitializers = [];
    var _articulos_decorators;
    var _articulos_initializers = [];
    var _articulos_extraInitializers = [];
    var PreguntaTest = _classThis = /** @class */ (function () {
        function PreguntaTest_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.tipo = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _tipo_initializers, void 0));
            this.enunciado = (__runInitializers(this, _tipo_extraInitializers), __runInitializers(this, _enunciado_initializers, void 0));
            this.opciones = (__runInitializers(this, _enunciado_extraInitializers), __runInitializers(this, _opciones_initializers, void 0));
            this.correcta = (__runInitializers(this, _opciones_extraInitializers), __runInitializers(this, _correcta_initializers, void 0));
            this.explicacion = (__runInitializers(this, _correcta_extraInitializers), __runInitializers(this, _explicacion_initializers, void 0));
            this.dificultad = (__runInitializers(this, _explicacion_extraInitializers), __runInitializers(this, _dificultad_initializers, void 0));
            this.fuente = (__runInitializers(this, _dificultad_extraInitializers), __runInitializers(this, _fuente_initializers, void 0));
            this.activa = (__runInitializers(this, _fuente_extraInitializers), __runInitializers(this, _activa_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _activa_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            this.anyo = (__runInitializers(this, _creadoEn_extraInitializers), __runInitializers(this, _anyo_initializers, void 0));
            this.origen = (__runInitializers(this, _anyo_extraInitializers), __runInitializers(this, _origen_initializers, void 0)); // 'generada' | 'convocatoria' | 'ia'
            /* =========================================================
               Para estadísticas
            ========================================================= */
            this.aciertos = (__runInitializers(this, _origen_extraInitializers), __runInitializers(this, _aciertos_initializers, void 0));
            this.fallos = (__runInitializers(this, _aciertos_extraInitializers), __runInitializers(this, _fallos_initializers, void 0));
            this.vecesUsada = (__runInitializers(this, _fallos_extraInitializers), __runInitializers(this, _vecesUsada_initializers, void 0));
            /* =========================================================
               RELACIONES
            ========================================================= */
            this.temas = (__runInitializers(this, _vecesUsada_extraInitializers), __runInitializers(this, _temas_initializers, void 0));
            this.articulos = (__runInitializers(this, _temas_extraInitializers), __runInitializers(this, _articulos_initializers, void 0));
            __runInitializers(this, _articulos_extraInitializers);
        }
        return PreguntaTest_1;
    }());
    __setFunctionName(_classThis, "PreguntaTest");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _tipo_decorators = [(0, typeorm_1.Column)({ default: 'test' })];
        _enunciado_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _opciones_decorators = [(0, typeorm_1.Column)({ type: 'jsonb' })];
        _correcta_decorators = [(0, typeorm_1.Column)()];
        _explicacion_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _dificultad_decorators = [(0, typeorm_1.Column)({ default: 1 })];
        _fuente_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _activa_decorators = [(0, typeorm_1.Column)({ default: true })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _anyo_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _origen_decorators = [(0, typeorm_1.Column)({ default: 'generada' })];
        _aciertos_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _fallos_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _vecesUsada_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _temas_decorators = [(0, typeorm_1.ManyToMany)(function () { return tema_entity_1.Tema; }), (0, typeorm_1.JoinTable)()];
        _articulos_decorators = [(0, typeorm_1.ManyToMany)(function () { return articulo_entity_1.Articulo; }), (0, typeorm_1.JoinTable)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _tipo_decorators, { kind: "field", name: "tipo", static: false, private: false, access: { has: function (obj) { return "tipo" in obj; }, get: function (obj) { return obj.tipo; }, set: function (obj, value) { obj.tipo = value; } }, metadata: _metadata }, _tipo_initializers, _tipo_extraInitializers);
        __esDecorate(null, null, _enunciado_decorators, { kind: "field", name: "enunciado", static: false, private: false, access: { has: function (obj) { return "enunciado" in obj; }, get: function (obj) { return obj.enunciado; }, set: function (obj, value) { obj.enunciado = value; } }, metadata: _metadata }, _enunciado_initializers, _enunciado_extraInitializers);
        __esDecorate(null, null, _opciones_decorators, { kind: "field", name: "opciones", static: false, private: false, access: { has: function (obj) { return "opciones" in obj; }, get: function (obj) { return obj.opciones; }, set: function (obj, value) { obj.opciones = value; } }, metadata: _metadata }, _opciones_initializers, _opciones_extraInitializers);
        __esDecorate(null, null, _correcta_decorators, { kind: "field", name: "correcta", static: false, private: false, access: { has: function (obj) { return "correcta" in obj; }, get: function (obj) { return obj.correcta; }, set: function (obj, value) { obj.correcta = value; } }, metadata: _metadata }, _correcta_initializers, _correcta_extraInitializers);
        __esDecorate(null, null, _explicacion_decorators, { kind: "field", name: "explicacion", static: false, private: false, access: { has: function (obj) { return "explicacion" in obj; }, get: function (obj) { return obj.explicacion; }, set: function (obj, value) { obj.explicacion = value; } }, metadata: _metadata }, _explicacion_initializers, _explicacion_extraInitializers);
        __esDecorate(null, null, _dificultad_decorators, { kind: "field", name: "dificultad", static: false, private: false, access: { has: function (obj) { return "dificultad" in obj; }, get: function (obj) { return obj.dificultad; }, set: function (obj, value) { obj.dificultad = value; } }, metadata: _metadata }, _dificultad_initializers, _dificultad_extraInitializers);
        __esDecorate(null, null, _fuente_decorators, { kind: "field", name: "fuente", static: false, private: false, access: { has: function (obj) { return "fuente" in obj; }, get: function (obj) { return obj.fuente; }, set: function (obj, value) { obj.fuente = value; } }, metadata: _metadata }, _fuente_initializers, _fuente_extraInitializers);
        __esDecorate(null, null, _activa_decorators, { kind: "field", name: "activa", static: false, private: false, access: { has: function (obj) { return "activa" in obj; }, get: function (obj) { return obj.activa; }, set: function (obj, value) { obj.activa = value; } }, metadata: _metadata }, _activa_initializers, _activa_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, null, _anyo_decorators, { kind: "field", name: "anyo", static: false, private: false, access: { has: function (obj) { return "anyo" in obj; }, get: function (obj) { return obj.anyo; }, set: function (obj, value) { obj.anyo = value; } }, metadata: _metadata }, _anyo_initializers, _anyo_extraInitializers);
        __esDecorate(null, null, _origen_decorators, { kind: "field", name: "origen", static: false, private: false, access: { has: function (obj) { return "origen" in obj; }, get: function (obj) { return obj.origen; }, set: function (obj, value) { obj.origen = value; } }, metadata: _metadata }, _origen_initializers, _origen_extraInitializers);
        __esDecorate(null, null, _aciertos_decorators, { kind: "field", name: "aciertos", static: false, private: false, access: { has: function (obj) { return "aciertos" in obj; }, get: function (obj) { return obj.aciertos; }, set: function (obj, value) { obj.aciertos = value; } }, metadata: _metadata }, _aciertos_initializers, _aciertos_extraInitializers);
        __esDecorate(null, null, _fallos_decorators, { kind: "field", name: "fallos", static: false, private: false, access: { has: function (obj) { return "fallos" in obj; }, get: function (obj) { return obj.fallos; }, set: function (obj, value) { obj.fallos = value; } }, metadata: _metadata }, _fallos_initializers, _fallos_extraInitializers);
        __esDecorate(null, null, _vecesUsada_decorators, { kind: "field", name: "vecesUsada", static: false, private: false, access: { has: function (obj) { return "vecesUsada" in obj; }, get: function (obj) { return obj.vecesUsada; }, set: function (obj, value) { obj.vecesUsada = value; } }, metadata: _metadata }, _vecesUsada_initializers, _vecesUsada_extraInitializers);
        __esDecorate(null, null, _temas_decorators, { kind: "field", name: "temas", static: false, private: false, access: { has: function (obj) { return "temas" in obj; }, get: function (obj) { return obj.temas; }, set: function (obj, value) { obj.temas = value; } }, metadata: _metadata }, _temas_initializers, _temas_extraInitializers);
        __esDecorate(null, null, _articulos_decorators, { kind: "field", name: "articulos", static: false, private: false, access: { has: function (obj) { return "articulos" in obj; }, get: function (obj) { return obj.articulos; }, set: function (obj, value) { obj.articulos = value; } }, metadata: _metadata }, _articulos_initializers, _articulos_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PreguntaTest = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PreguntaTest = _classThis;
}();
exports.PreguntaTest = PreguntaTest;
