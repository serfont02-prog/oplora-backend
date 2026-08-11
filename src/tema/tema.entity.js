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
exports.Tema = exports.TipoTema = void 0;
var typeorm_1 = require("typeorm");
var tema_normativa_entity_1 = require("./tema-normativa.entity");
var pregunta_banco_entity_1 = require("./pregunta-banco.entity");
var convocatoria_entity_1 = require("../convocatoria/convocatoria.entity");
var typeorm_2 = require("typeorm");
var pregunta_test_entity_1 = require("../test/pregunta-test.entity");
var TipoTema;
(function (TipoTema) {
    TipoTema["CON_NORMATIVA"] = "con_normativa";
    TipoTema["CONCEPTUAL"] = "conceptual";
    TipoTema["MIXTO"] = "mixto";
})(TipoTema || (exports.TipoTema = TipoTema = {}));
var Tema = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('temas')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _numero_decorators;
    var _numero_initializers = [];
    var _numero_extraInitializers = [];
    var _titulo_decorators;
    var _titulo_initializers = [];
    var _titulo_extraInitializers = [];
    var _tipo_decorators;
    var _tipo_initializers = [];
    var _tipo_extraInitializers = [];
    var _contexto_decorators;
    var _contexto_initializers = [];
    var _contexto_extraInitializers = [];
    var _activo_decorators;
    var _activo_initializers = [];
    var _activo_extraInitializers = [];
    var _creadoEn_decorators;
    var _creadoEn_initializers = [];
    var _creadoEn_extraInitializers = [];
    var _normativas_decorators;
    var _normativas_initializers = [];
    var _normativas_extraInitializers = [];
    var _preguntas_decorators;
    var _preguntas_initializers = [];
    var _preguntas_extraInitializers = [];
    var _convocatoria_decorators;
    var _convocatoria_initializers = [];
    var _convocatoria_extraInitializers = [];
    var _preguntasTest_decorators;
    var _preguntasTest_initializers = [];
    var _preguntasTest_extraInitializers = [];
    var Tema = _classThis = /** @class */ (function () {
        function Tema_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.numero = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _numero_initializers, void 0));
            this.titulo = (__runInitializers(this, _numero_extraInitializers), __runInitializers(this, _titulo_initializers, void 0));
            this.tipo = (__runInitializers(this, _titulo_extraInitializers), __runInitializers(this, _tipo_initializers, void 0));
            this.contexto = (__runInitializers(this, _tipo_extraInitializers), __runInitializers(this, _contexto_initializers, void 0));
            this.activo = (__runInitializers(this, _contexto_extraInitializers), __runInitializers(this, _activo_initializers, void 0));
            this.creadoEn = (__runInitializers(this, _activo_extraInitializers), __runInitializers(this, _creadoEn_initializers, void 0));
            this.normativas = (__runInitializers(this, _creadoEn_extraInitializers), __runInitializers(this, _normativas_initializers, void 0));
            this.preguntas = (__runInitializers(this, _normativas_extraInitializers), __runInitializers(this, _preguntas_initializers, void 0));
            this.convocatoria = (__runInitializers(this, _preguntas_extraInitializers), __runInitializers(this, _convocatoria_initializers, void 0));
            this.preguntasTest = (__runInitializers(this, _convocatoria_extraInitializers), __runInitializers(this, _preguntasTest_initializers, void 0));
            __runInitializers(this, _preguntasTest_extraInitializers);
        }
        return Tema_1;
    }());
    __setFunctionName(_classThis, "Tema");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _numero_decorators = [(0, typeorm_1.Column)()];
        _titulo_decorators = [(0, typeorm_1.Column)()];
        _tipo_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: TipoTema, default: TipoTema.CON_NORMATIVA })];
        _contexto_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _activo_decorators = [(0, typeorm_1.Column)({ default: true })];
        _creadoEn_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _normativas_decorators = [(0, typeorm_1.OneToMany)(function () { return tema_normativa_entity_1.TemaNormativa; }, function (tn) { return tn.tema; })];
        _preguntas_decorators = [(0, typeorm_1.OneToMany)(function () { return pregunta_banco_entity_1.PreguntaBanco; }, function (p) { return p.tema; })];
        _convocatoria_decorators = [(0, typeorm_1.ManyToOne)(function () { return convocatoria_entity_1.Convocatoria; }, { nullable: true })];
        _preguntasTest_decorators = [(0, typeorm_2.ManyToMany)(function () { return pregunta_test_entity_1.PreguntaTest; }, function (p) { return p.temas; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _numero_decorators, { kind: "field", name: "numero", static: false, private: false, access: { has: function (obj) { return "numero" in obj; }, get: function (obj) { return obj.numero; }, set: function (obj, value) { obj.numero = value; } }, metadata: _metadata }, _numero_initializers, _numero_extraInitializers);
        __esDecorate(null, null, _titulo_decorators, { kind: "field", name: "titulo", static: false, private: false, access: { has: function (obj) { return "titulo" in obj; }, get: function (obj) { return obj.titulo; }, set: function (obj, value) { obj.titulo = value; } }, metadata: _metadata }, _titulo_initializers, _titulo_extraInitializers);
        __esDecorate(null, null, _tipo_decorators, { kind: "field", name: "tipo", static: false, private: false, access: { has: function (obj) { return "tipo" in obj; }, get: function (obj) { return obj.tipo; }, set: function (obj, value) { obj.tipo = value; } }, metadata: _metadata }, _tipo_initializers, _tipo_extraInitializers);
        __esDecorate(null, null, _contexto_decorators, { kind: "field", name: "contexto", static: false, private: false, access: { has: function (obj) { return "contexto" in obj; }, get: function (obj) { return obj.contexto; }, set: function (obj, value) { obj.contexto = value; } }, metadata: _metadata }, _contexto_initializers, _contexto_extraInitializers);
        __esDecorate(null, null, _activo_decorators, { kind: "field", name: "activo", static: false, private: false, access: { has: function (obj) { return "activo" in obj; }, get: function (obj) { return obj.activo; }, set: function (obj, value) { obj.activo = value; } }, metadata: _metadata }, _activo_initializers, _activo_extraInitializers);
        __esDecorate(null, null, _creadoEn_decorators, { kind: "field", name: "creadoEn", static: false, private: false, access: { has: function (obj) { return "creadoEn" in obj; }, get: function (obj) { return obj.creadoEn; }, set: function (obj, value) { obj.creadoEn = value; } }, metadata: _metadata }, _creadoEn_initializers, _creadoEn_extraInitializers);
        __esDecorate(null, null, _normativas_decorators, { kind: "field", name: "normativas", static: false, private: false, access: { has: function (obj) { return "normativas" in obj; }, get: function (obj) { return obj.normativas; }, set: function (obj, value) { obj.normativas = value; } }, metadata: _metadata }, _normativas_initializers, _normativas_extraInitializers);
        __esDecorate(null, null, _preguntas_decorators, { kind: "field", name: "preguntas", static: false, private: false, access: { has: function (obj) { return "preguntas" in obj; }, get: function (obj) { return obj.preguntas; }, set: function (obj, value) { obj.preguntas = value; } }, metadata: _metadata }, _preguntas_initializers, _preguntas_extraInitializers);
        __esDecorate(null, null, _convocatoria_decorators, { kind: "field", name: "convocatoria", static: false, private: false, access: { has: function (obj) { return "convocatoria" in obj; }, get: function (obj) { return obj.convocatoria; }, set: function (obj, value) { obj.convocatoria = value; } }, metadata: _metadata }, _convocatoria_initializers, _convocatoria_extraInitializers);
        __esDecorate(null, null, _preguntasTest_decorators, { kind: "field", name: "preguntasTest", static: false, private: false, access: { has: function (obj) { return "preguntasTest" in obj; }, get: function (obj) { return obj.preguntasTest; }, set: function (obj, value) { obj.preguntasTest = value; } }, metadata: _metadata }, _preguntasTest_initializers, _preguntasTest_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Tema = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Tema = _classThis;
}();
exports.Tema = Tema;
